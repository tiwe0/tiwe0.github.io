---
title: 理解Flask架构
date: 2023-11-27 14:42:25
tags:
categories:
- 笔记
---

## WSGI 协议

WSGI 是一种网络接口协议；在Web与Python之间构造了一层转换器；
当用户请求发到服务器后，服务器按照WSGI协议将请求转换为Python中的env变量与response函数；
通常开发人员从env中提取出必要的信息，作出反应后按照WSGI协议调用response函数，实现
WSGI协议的服务器会将返回值转换为Web响应。

## Flask 架构

[Flask 架构](/assets/post/python-flask/Flask.png)

### Flask 上下文

Flask 的架构与Flask 上下文的设计密切相关。

在Flask 应用开发代码中，有两个特点：

>>> 1. 开发人员不需要处理过多的线程问题，全局变量request即可自动处理好。

>>> 2. 开发人员不需要将请求作为参数或返回值在不同的函数间传来传去；

#### ContextVar + LocalProxy 解决方案

##### ContextVar 源码分析

```python
from contextvars import ContextVar
```

ContextVar 是属于标准库的数据结构；旨在提供一个统一的变量入口；该变量在开发代码中唯一，在运行时会自动根据线程分离。

该标准在3.7加入python标准库，原作者也写了一个3.6的兼容版本：<https://github.com/MagicStack/contextvars/blob/master/contextvars/__init__.py>。

该版本的contextvar库是构建在thread.local上的。

在代码的最底部定义了一个全局变量_state用于管理所有的Context与ContextVar，而且该变量是一个thread.local创建的对象，这保证了不同线程间变量是分隔的；

比如Flask中的request上下文变量在Flask收到多个请求时，实际的数据是这样的：

![上下文变量在多线程中的实际表现](/assets/post/python-flask/上下文变量.png)

上图左边Flask处理多请求；右边为对应线程中request在整个进程中的实际存储形式；

下面我们来看contextvars的源码:

首先最重要的是该模块中的全局变量`_state`:

```python
_state = threading.local()
```

该变量为一个local变量，会自己隔离不同线程中的变量；此外该变量没有声明在`__all__`中，是一个模块级的全局变量，不用担心全局的命名冲突。

以及该变量对应的两个辅助函数：

```python
def _get_context():
    ctx = getattr(_state, 'context', None)
    if ctx is None:
        ctx = Context()
        _state.context = ctx
    return ctx


def _set_context(ctx):
    _state.context = ctx
```

`_get_context` 函数用于从获取`_state` 变量的 ‘context’ 属性，该'context'实际上是线程分离的(因为`_state` 是local变量，而'context'是`_state` 的属性)；
若当前线程的'context'为None，则将其初始化为一个上下文对象Context，并返回；

`_set_context` 函数就很好理解了，传入一个上下文对象，将该上下文对象设置为当前线程的'context'。

然后我们来看上下文对象和上下文变量对象。其关系是，上下文对象为上下文变量对象的容器。我们先看上下文对象：

```python
class ContextMeta(type(collections.abc.Mapping)):

    # contextvars.Context is not subclassable.

    def __new__(mcls, names, bases, dct):
        cls = super().__new__(mcls, names, bases, dct)
        if cls.__module__ != 'contextvars' or cls.__name__ != 'Context':
            raise TypeError("type 'Context' is not an acceptable base type")
        return cls


class Context(collections.abc.Mapping, metaclass=ContextMeta):

    def __init__(self):
        self._data = immutables.Map()
        self._prev_context = None

    def run(self, callable, *args, **kwargs):
        if self._prev_context is not None:
            raise RuntimeError(
                'cannot enter context: {} is already entered'.format(self))

        self._prev_context = _get_context()
        try:
            _set_context(self)
            return callable(*args, **kwargs)
        finally:
            _set_context(self._prev_context)
            self._prev_context = None

    def copy(self):
        new = Context()
        new._data = self._data
        return new

    def __getitem__(self, var):
        if not isinstance(var, ContextVar):
            raise TypeError(
                "a ContextVar key was expected, got {!r}".format(var))
        return self._data[var]

    def __contains__(self, var):
        if not isinstance(var, ContextVar):
            raise TypeError(
                "a ContextVar key was expected, got {!r}".format(var))
        return var in self._data

    def __len__(self):
        return len(self._data)

    def __iter__(self):
        return iter(self._data)
```

Context 对象的结构如下：

![Context 对象的结构](path "opt title")

`_data` 属性是一个映射字典，用于保存当前上下文中的上下文变量。

`_prev_context` 属性用于临时保存之前的上下文对象，用于临时上下文切换。

比较重要的是这个方法：`__getitem__`

`__getitem__` 方法实现了映射协议，该方法先检查传入的key是否为上下文变量ContextVar实例，如果不是则抛出异常，如果是则在`_data`属性中以该实例为key，获取实际的保存的值；

接下来是ContextVar的代码：

```python
class ContextVarMeta(type):

    # contextvars.ContextVar is not subclassable.

    def __new__(mcls, names, bases, dct):
        cls = super().__new__(mcls, names, bases, dct)
        if cls.__module__ != 'contextvars' or cls.__name__ != 'ContextVar':
            raise TypeError("type 'ContextVar' is not an acceptable base type")
        return cls

    def __getitem__(cls, name):
        return


class ContextVar(metaclass=ContextVarMeta):

    def __init__(self, name, *, default=_NO_DEFAULT):
        if not isinstance(name, str):
            raise TypeError("context variable name must be a str")
        self._name = name
        self._default = default

    @property
    def name(self):
        return self._name

    def get(self, default=_NO_DEFAULT):
        ctx = _get_context()
        try:
            return ctx[self]
        except KeyError:
            pass

        if default is not _NO_DEFAULT:
            return default

        if self._default is not _NO_DEFAULT:
            return self._default

        raise LookupError

    def set(self, value):
        ctx = _get_context()
        data = ctx._data
        try:
            old_value = data[self]
        except KeyError:
            old_value = Token.MISSING

        updated_data = data.set(self, value)
        ctx._data = updated_data
        return Token(ctx, self, old_value)

    def reset(self, token):
        if token._used:
            raise RuntimeError("Token has already been used once")

        if token._var is not self:
            raise ValueError(
                "Token was created by a different ContextVar")

        if token._context is not _get_context():
            raise ValueError(
                "Token was created in a different Context")

        ctx = token._context
        if token._old_value is Token.MISSING:
            ctx._data = ctx._data.delete(token._var)
        else:
            ctx._data = ctx._data.set(token._var, token._old_value)

        token._used = True

    def __repr__(self):
        r = '<ContextVar name={!r}'.format(self.name)
        if self._default is not _NO_DEFAULT:
            r += ' default={!r}'.format(self._default)
        return r + ' at {:0x}>'.format(id(self))
```

ContextVar 有两个属性：`_name` 与 `_default` 以及一个动态属性：`name`

`_name` 属性用于标记该ContextVar的名称，`_default`用与指明该ContextVar的默认值；

`name` 返回当前保存的`_name`值。

ContextVar 有三个重要的方法：`get`, `set`, `reset`

我们先聊`get` 方法

`get` 方法会先调用`_get_context`加载当前线程的上下文，然后尝试在该上下文中查找当前ContextVar对应的值，并返回；如果该上下文没有当前ContextVar，则尝试返回默认值；

`set` 方法同样先调用`_get_context`加载当前线程的上下文，然后获取该上下文的`_data`，尝试先获取其ContextVar的旧值，再更新为新值，最终返回一个Token，该Token中保存了上下文对象，当前上下文变量对象以及旧值；

`reset` 方法传入一个Token，使用Token中的信息将当前ContextVar恢复到上一次的值；

总结一下：

1. `_state` 这个local 变量负责分离、管理线程变量；该对象是模块自身生成管理的；

![local 逻辑模拟图](path "opt title")

2. `Context` 是一个上下文对象，用于管理上下文变量对象；该对象实现了映射协议，key值为ContextVar，val为对应的实际的值；

![Context 结构](path "opt title")

3. `ContextVar` 是一个上下文变量对象，与实际的值之间有一个对应关系；此外，该对象还实现了临时恢复的功能；

![ContextVar 结构](path "opt title")

##### LocalProxy

Context 与 ContextVar帮助我们实现了变量的线程分离；但每次使用变量，总是需要调用some_var.get() 方法与some_var.set() 方法，非常的不优雅，而且容易产生语义上的误解；

werkzeug 针对ContextVar，设计了LocalProxy类，该类将ContextVar的某个属性封装起来，并将赋值，读值等方法内部转发委托给其封装的ContextVar或其某个属性；某种角度上，LocalProxy类是ContextVar的一种语法糖类；

#### AppContext + RequestContext

AppContext 与 RequestContext 实例在Flask中是全局变量，在所有线程中均可见，但是被local分离，互不影响；

我们检查global.py，可以看到这几个关键的全局变量声明：

```python
_cv_app: ContextVar["AppContext"] = ContextVar("flask.app_ctx")
app_ctx: "AppContext" = LocalProxy(
    _cv_app, unbound_message=_no_app_msg
)
current_app: "Flask" = LocalProxy(
    _cv_app, "app", unbound_message=_no_app_msg
)
g: "_AppCtxGlobals" = LocalProxy(
    _cv_app, "g", unbound_message=_no_app_msg
)

_cv_request: ContextVar["RequestContext"] = ContextVar("flask.request_ctx")
request_ctx: "RequestContext" = LocalProxy(
    _cv_request, unbound_message=_no_req_msg
)
request: "Request" = LocalProxy(
    _cv_request, "request", unbound_message=_no_req_msg
)
session: "SessionMixin" = LocalProxy(
    _cv_request, "session", unbound_message=_no_req_msg
)
```

可以看到这里声明了两个上下文变量，分别是应用上下文变量`_cv_app`与请求上下文变量`_cv_request`；

而我们常用的 `current_app`, `g`, `request`, `session` 都是它们的某个属性代理；

总结一下，全局环境中存在两个ContextVar变量，`_cv_app`与`_cv_request`，这两个变量负责管理`current_app`，`g`，`request`，`session`这些LocalProxy变量；

当我们使用`_cv_app`这些ContextVar变量的时候，我们实际上使用的是当前线程对应的'context'字典中以`_cv_app`作为key找到的值；

当我们使用`g`这些LocalProxy变量的时候，我们实际上使用的是该LocalProxy对应的ContextVar变量本身或其某个属性；

如下图所示：

![Flask 上下文结构](/assets/post/python-flask/Flask上下文结构.png)

需要注意，以上的变量均是全局变量。若干的context是指不同线程中的context变量。

#### 上下文推送

在Flask里，当我们需要使用这些LocalProxy变量时，我们需要将对应的上下文变量推送到当前上下文栈中。

在未进行上下文推送前，`_cv_app` 与 `_cv_request` 实际上是空对象，此时使用这些变量下的LocalProxy变量，往往会触发所谓的上下文错误。

在上下文推送后，这两个ContextVar会被更新，此时其对应的LocalProxy变量也才变得可用。

通常上下文推送是由Flask自动推送的，如果在开发期间需要使用，需要手动推送上下文变量。通常这个发生在初始化过程中，比如数据库初始化等等。

##### 应用上下文

```python
class AppContext:
    """The app context contains application-specific information. An app
    context is created and pushed at the beginning of each request if
    one is not already active. An app context is also pushed when
    running CLI commands.
    """

    def __init__(self, app: "Flask") -> None:
        self.app = app
        self.url_adapter = app.create_url_adapter(None)
        self.g: _AppCtxGlobals = app.app_ctx_globals_class()
        self._cv_tokens: t.List[contextvars.Token] = []

    def push(self) -> None:
        """Binds the app context to the current context."""
        self._cv_tokens.append(_cv_app.set(self))
        appcontext_pushed.send(self.app)

    def pop(self, exc: t.Optional[BaseException] = _sentinel) -> None:  # type: ignore
        """Pops the app context."""
        try:
            if len(self._cv_tokens) == 1:
                if exc is _sentinel:
                    exc = sys.exc_info()[1]
                self.app.do_teardown_appcontext(exc)
        finally:
            ctx = _cv_app.get()
            _cv_app.reset(self._cv_tokens.pop())

        if ctx is not self:
            raise AssertionError(
                f"Popped wrong app context. ({ctx!r} instead of {self!r})"
            )

        appcontext_popped.send(self.app)

    def __enter__(self) -> "AppContext":
        self.push()
        return self

    def __exit__(
        self,
        exc_type: t.Optional[type],
        exc_value: t.Optional[BaseException],
        tb: t.Optional[TracebackType],
    ) -> None:
        self.pop(exc_value)
```

这里的关键在于`AppContext`维护了一个`_cv_tokens`栈，用于保存之前的上下文；`push`方法将全局`_cv_app`设置为当前的`AppContext`的实例；并将之前的`_cv_app`的值以`token`的形式存在栈里，方便后序恢复；

此外，该类实现了with协议，可以使用with语句激活上下文；

### Flask 与 蓝图系统

蓝图实际上和FlaskApp本质上很像，两者实际上都是继承自Scaffold；

在实际开发中，几乎可以把蓝图和FlaskApp同等对待，甚至蓝图本身还可以注册蓝图；

这里我们着重讲一下蓝图的注册；

使用app.register_blueprint(blueprint)将blueprint注册到app.

`register_blueprint` 会调用blueprint的register方法做以下这些事情：

1. 从blueprint构建蓝图的name

2. 根据name判断是否已经有同名蓝图注册；如果有，则抛出异常(注意这里只是判断同名，不是判断是否已经注册过)

3. 判断blueprint是否有自己的静态文件夹，如果有，就添加到路由规则集中；

4. 判断blueprint是否之前被注册过了，如果注册已经注册过了，就将当前的蓝图以覆盖的形式更新注册；

5. 将自身的命令接口注册到主app上；

6. 更新blueprint的子blueprint的路由信息，并调用这些子blueprint的register方法，将这些子blueprint注册到主app上；

因此最终只会有一个路由规则集，那就是主app的路由规则集，其余所有蓝图及其子孙蓝图的路由规则集都会在合理变换后加到主app的路由规则集里；


### 路由系统


在FlaskAPP 开发过程中，每个App和蓝图都定义自己的路由系统，不过这只是开发阶段；在运行时，实际上只存在一套路由系统，那就是主App的路由系统，其余所有的子路由系统都在运行时做了合适的变换，并补充到了主App的路由系统中；

Flask 路由系统并不复杂，但在深入之前，我们先了解一些werkzeug中的路由组件；

#### Map 与 Rule

Map和Rule是werkzeug中负责管理路由的组件；Rule负责定义具体的路由规则，而Map则是Rule的容器，同时也负责根据路径对其保存的Rule进行查询，并给出路由终点；

一个来自官方文档的例子：

```python
url_map = Map([
    Rule('/', endpoint='new_url'),
    Rule('/<short_id>', endpoint='follow_short_link'),
    Rule('/<short_id>+', endpoint='short_link_details')
])
```

传入请求的environ，调用Map的bind_to_environ方法，生成一个URLAdapter；

```python
adapter = url_map.bind_to_environ(request.environ)
```

该adapter中保存着路由的终点以及传入的参数值；

```python
for endpoint, values in adapter.match():
    do_something()
```

这里我们需要注意的是，werkzeug中的路由系统仅仅完成了url到endpoint这一步，并没有进一步找到对应的视图函数；在Flask中，存在一个由endpoint到视图函数的字典，这个字典完成了拼图上的最后一块；

#### Flask 路由

推送上下文后，Flask会尝试做一次full_dispatch_request()；

在full_dispatch_request中，Flask会做一些初始判断与对request的预处理，若一切顺利，Flask会再做一次dispatch_request()；

在dispatch_request中，我们会发现Flask已经获取到负责路由请求的Rule，并根据其endpoint在Flask的view_functions中查询视图函数；后面便是对视图函数的调用了；

实际上Flask在请求传递进来，构造请求上下文时，就已经完成了路由，并将这些路由信息（如路由规则，路由终点，路由参数等）记录在了请求对象request中；

检查Flask的请求上下文的__init__函数，我们可以看到请求上下文的构造过程：

1. 将上下文本身的app指向FlaskApp

2. 根据FlaskApp提供的请求类与传入的environ构造请求对象，并赋值给request

3. 使用app.create_url_adapter处理请求；在这个过程中，调用了werkzeug中的函数获取路由终点，并将结果保存在上下文的url_adapter变量中；

在请求上下文推送后，上下文会调用自己的match_request方法，尝试从自身url_adapter变量中获取路由终点，路由参数，并将这些信息绑定到request上，至此，路由信息才被写入请求中；

后面的逻辑就很平坦了，Flask从请求中获取路由终点与路由参数；以路由终点作为key，从view_functions中查询视图函数，并将路由参数作为参数调用视图函数，获取响应；

完成响应的构造与后序处理后，委托werkzeug返回给用户端；

### 视图函数与可拔插视图类

视图函数就是我们在web开发模型的MVC中常说的View，名副其实的视图函数；

通常视图函数就是我们的业务代码，按照正常的业务逻辑编写即可；其中有两点值得称道：

1. 函数只用从请求链接中接受参数，并不需要传入响应本身；直接导入全局的request使用即可；

2. 函数写完后只需要加一个装饰器即可自动注册到目标app或蓝图中，同时可以直接定义从链接中接受那些参数，非常直观方便；

Flask中优秀的上下文设计使得视图函数与请求解藕，使得开发逻辑更加清晰；

建议将后台的一些工具辅助函数单独写在一个模块中，而将业务逻辑相似的代码单独放在一起，方便开发管理；

这里我们重点讲一下可拔插视图类，这个工具让视图函数的抽象层级提高了一层，合理的利用可拔插视图类，我们可以利用继承，将相似的路由逻辑和业务逻辑抽离出来，提高我们的效率；你完全可以在工作的过程中不断自己总结，编写自己的可拔插视图类，这些代码将会在未来解放你的大量生产力；

我们来看一个简单的例子，这个例子来自Flask的官方文档:

我们需要将某个链接路由到对用户列表的查询，我们完全可以使用视图函数实现：

```python
@app.route('/query/users/')
def show_users():
    users = User.query.all()
    return render_template('users.html', users=users)
```

假设此时又出现一个需求，要求我们将某个链接路由到对商品列表的查询，此时你不得不在写一个逻辑类似的视图函数:

```python
@app.route('/query/goods/')
def show_goods():
    users = Goods.query.all()
    return render_template('goods.html', goods=goods)
```

假设此时又出现一个需求...

这么编写非常冗余，而且有个致命的问题，万一某一天，你的老板决定要给这些查询加上一个额外的参数，用于单独查询某页的数据结果；这个时候你不得不重新修改所有的视图函数，而这些视图函数还可能分布在不同的地方，此外这种乏味单调的修改极容易出现错误；

此时有若干解决方法：

lisp程序员可能会使用宏，在程序运行时用宏自动生成对应的视图函数；也有可能想到使用函数式编程，先写一个工厂函数，在运行时用工厂函数即时计算对应的视图函数；等等

这里Flask提供一种类似函数式编程思想的工具：可拔插视图类；

首先我们将相似的逻辑抽象出来：

```python
from flask.views import View

class ListView(View):

    def get_template_name(self):
        raise NotImplementedError()

    def render_template(self, context):
        return render_template(self.get_template_name(), **context)

    def dispatch_request(self):
        context = {'objects': self.get_objects()}
        return self.render_template(context)
```

然后，我们继承该类，完善处理具体逻辑的子类：

```python
class UserView(ListView):

    def get_template_name(self):
        return 'user.html'

    def get_objects(self):
        return User.query.all()
```

此时如果需要临时加上额外参数，那么仅修改基类即可完成所有类的逻辑更新；

某种角度上来说，可拔插视图类的思想有些类似函数式编程中的高阶函数；不同的是在面向对象中，新的类通过继承的方式产生，通过新类的重写实现子类的定制，将相似逻辑写在基类中的方式将相似的逻辑抽离出来；而在函数式编程中，新的函数通过某个函数的计算生成，通过传参的方式定制新函数的行为，将相似逻辑写在工厂函数中的方式将相似的逻辑抽离出来；

### 模板系统

模板系统在视图函数返回与响应生成这两个时间点之间发挥作用；

视图函数返回的并不是最终的响应，而是最终响应的一些必要信息，保存在变量rv中，需要以此为参数，调用FlaskApp的finalize_request()才能得到最终的响应对象；

通常生成rv过程中会涉及到模板的渲染；

Flask默认使用jinja2作为渲染引擎；

开发过程中，最常用的渲染函数有render_template以及stream_template；前者用于渲染常规响应，后者用于渲染流式响应；

模板系统通常做两件事情：

1. 根据提供的模板名称寻找到模板本身

2. 在提供的上下文的帮助下，填充并渲染模板，并将结果返回

#### 模板路由

#### 模板渲染

找到渲染模板后，实际的渲染过程发生在`_render`与`_stream`中，两者接受相同的参数：app、template、context；但逻辑有些许差别，下面我们分开讨论：

```python
def _render(app: "Flask", template: Template, context: t.Dict[str, t.Any]) -> str:
    app.update_template_context(context)
    before_render_template.send(app, template=template, context=context)
    rv = template.render(context)
    template_rendered.send(app, template=template, context=context)
    return rv
```

`_render`中，首先用app的一些信息更新了context中的信息；注意这里的上下文是指用于模板渲染的上下文，而不是我们前面讨论的应用上下文等；这里更新的原因很简单，模板渲染很可能也需要一些来自app的信息；

中间插入了一个信号发送，这里暂时不展开；

紧接着用context作为上下文对模板进行渲染，获取到rv，这里的rv是字符串；

又一个信号发送；

返回渲染后的字符串rv作为渲染结果

`_stream`函数与`_render`类似：

```python

def _stream(
    app: "Flask", template: Template, context: t.Dict[str, t.Any]
) -> t.Iterator[str]:
    app.update_template_context(context)
    before_render_template.send(app, template=template, context=context)

    def generate() -> t.Iterator[str]:
        yield from template.generate(context)
        template_rendered.send(app, template=template, context=context)

    rv = generate()

    # If a request context is active, keep it while generating.
    if request:
        rv = stream_with_context(rv)

    return rv
```

不同的地方是这里使用template.generate替代了template_render，并且返回的是一个字符串迭代器作为rv，而非字符串；

### 响应

在full_dispatch_request方法的最后，获取了rv并调用finalize_request方法，完成响应的构建；

关键的响应生成逻辑写在了make_response中，这个方法非常长，但逻辑并不复杂，这里就不放出来，仅做一些逻辑说明：

make_response接受rv作为参数，并返回一个响应对象；

前面的很多叙述省略了很多异常处理的情况，真实情况，rv可能的类型很多：str、bytes、dict、list、generator、iterator、tuple；这里对其类型做了判断，并分开处理；

+ tuple
    rv必须是长度为2或3的tuple。长度为2时应当为(rv, headers)或(rv, status)的形式将其解包；

+ None
    抛出异常

+ 不是响应类

  + str、bytes、bytearray
      使用rv作为参数构造响应对象，并赋值回给rv

  + dict、list
      使用rv作为参数构造json响应，并赋值回给rv

  + BaseResposne、callable
      使用response_class.force_type将rv强制转换为响应对象，并返回给rv

最终rv必定为响应类型，更新rv的headers及status后，作为最终响应返回；

这里需要注意的只有一点，就是rv作为callable对象返回的情况，此时rv应当接受两个参数：environ与start_response；

