---
title: 基于python的算法实现
date: 2023-11-27 14:14:59
tags:
---

# 定式

## 用数学去分析和思考问题

1. 搜索类

> 1. 将问题看成一个代数空间
> 2. 算法的每个部分的作用，通常前面会先处理特殊情况，然后对输入做一些规范化，转换为一般问题
> 3. 循环要满足循环不变的性质，这在算法证明中很重要
> 4. 从信息的角度看问题，我有哪些信息，使用那种数据结构可以充分高效地存储这些信息，以及基于这种数据结构，使用哪些算法可以充分的用到所有信息。
> 5. 除了信息本身，被研究问题的一些数学性质可以很好的压缩解的代数空间，从而优化算法。

## 条件 condition


### (增量式) 创建某种语境

```python
# context 1 or context 2
if context_1:
    do_some_thing()
# target context
```

### (分支式) 创建某种语境

```python
# context 1 of context 2 or ...
if context_1:
    do_some_thing_1()
elif context_2:
    do_some_thing_2()
elif context_3:
    do_some_thing_3()
# target context
```

### (分支式) 分类处理

```python
# context 1 of context 2 or ...
if context_1:
    do_some_thing_1()
elif context_2:
    do_some_thing_2()
elif context_3:
    do_some_thing_3()
# end
```

## 序列 sequence

一些有关序列的小技巧, 帮助你快速自信的写出正确的代码

python 以 0 作为序列首位索引

使用左闭右开区间，length 必定数组越界，length-1 为最后索引

好处是处理 start, length，end 的关系时无需+-1

### 1. 索引遍历数组

```python
for _ in range(len(array)):    # [0, length) -> [0, length-1]
    do_some_thing()
```

### 2. start + length 切片

[start: start+length]

### 3. end + length 切片

[(end-1)-length, (end-1)]

### 4. start + end 计算 length

length = end - start

## 循环 loop

```python
while not target_context:
    do_some_thing()
# target context
```

## 递归 recurse

编码风格

1. 终止条件写在最前面

### 操作式递归

1. 如何理解操作式递归代码

阅读递归代码时要将递归链/树视为一个整体，而递归函数就是逐步零碎的调整整个链/树，直到触发终止条件；

实际上终止条件在大多数的递归中都不会触发，而是一种兜底，面向链/树整体的全局终止条件；

在递归点前后的代码分别称为前序代码和后序代码；前序代码对整体的调整由浅入深；直到遇到递归点，此时深度再进一层；

在触发终止条件后，后序代码开始对整体由深返浅地调整，最终结束。

### 计算式递归

1. 如何理解计算式递归代码

同样的，首先定义终止条件，并需要注意到，终止条件中返回的值将是整个递归树的基础值；所有结果都将由基础值组合得到；

通常计算式递归并没有什么前序代码，如果有，那大部分是为了计算返回值而设计的；

计算式递归需要有一个锚点接受后续递归的计算结果；通常这个锚点是多个；用于组合成当前的计算值并返回；

因此计算式递归中有两种值：从终止条件计算的基础值；由基础值组合而成的组合值；

通常终止条件会与前序代码混在一起，用于计算基础值；后序代码通常用于计算组合值；

#### 例题1. 计算斐波那契数列

```python
def feb_rec(n):
    # 基础值
    if n in [0, 1]:
        return n

    # 递归锚点
    result_rec_2 = feb_rec(n-2)
    result_rec_1 = feb_rec(n-1)

    # 计算组合值
    result_rec = result_rec_1 + result_rec_2

    # 返回组合值
    return result_rec
```

#### 例题2. 计算LCA

```python
def LCA(node, p, q):
    result = None
    def LCA_rec(node):
        # 定义基础值 [None, p, q]
        if not node or node is p or node is q:
            return node

        # 递归锚点
        left = LCA_rec(node.left)
        right = LCA_rec(node.right)

        # 计算组合值
        # [None & None] => None
        # [None & [p | q]] => [p | q]
        # [p & q] => LCA
        if left is None and right is None:
            return None
        elif (left is p and right is q) or (left is q and right is p):
            result = node
            return node
        elif left is None:
            return right
        else:
            return left

    LCA_rec(root, p, q)
    return result
```

#### 例题3. 判断镜像树

```python
def mirror(root):
    def mirror_rec(left, right):
        # 基础值
        if not left and not right:
            return True
        elif not left or not right:
            return False
        if left.val != right.val:
            return False

        # 递归锚点
        mirror_out = mirror_rec(left.left, right.right)
        mirror_in = mirror_rec(left.right, right.left)

        # 计算组合值
        mirror = mirror_out and mirror_in

        return mirror

```

### 1. 链表倒转

链表 `[1, 3, 5, 9, 10]` 递归倒转为 `[10, 9, 5, 3, 1]`

```python
def rec(node: ListNode):
    # 终止条件写在前面
    next_node = node.next
    if not next_node:
        return

    # 递归点
    rec(next_node)

    # 后序
    next_node.next = node

    # 调整
    if node is header:
        next_node = None
```

### 2. 镜像树判断

## 二分 binary

二分是建立在以排序序列上的搜索算法

采用左必右开的习惯

需要注意的点：

1. 何时停止

2. 非严格排序时控制搜索位置

```python
def left_binsearch(nums, left, right, value):
    """非降序列第一个不小于value的位置."""
    while left < right:
        mid = left + (right-left)//2
        if nums[mid] < value:
            left = mid + 1
        else:
            right = mid
    return left
```

```python
def right_binsearch(nums, left, right, value):
    """非降序列第一个大于value的位置."""
    while left < right:
        mid = left + (right-left)//2
        if nums[mid] <= value:
            left = mid + 1
        else:
            right = mid
    return left
```

## 杂项 misc

### 二维数组

二维数组使用r，c坐标系

#### 1. 二维数组的快速初始化

```python
grid = [[0] * width for _ in range(height)]
```

此时

height = len(grid) 与 row 相关

width = len(grid[0]) 与 col 相关

#### 2. 二维数组遍历

1. 正常遍历（行优先，从左向右，自上而下）

```python
for r in range(len(grid)):
    for c in range(len(grid[0])):
        grid[r][c] = 0
```

2. 遍历对角(r==c)

```python
for r in range(len(grid)):
    c = r
    grid[r][c] = 0
```

3. 遍历反对角(r+c==len-1)

```python
for r in range(len(grid)):
    c = len(grid)-1-r
    grid[r][c] = 0
```

3. 遍历对角方向(加上偏移)


#### 3. 二维数组游走

```python
d = {(+1, +1), (+1, -1), (-1, +1), (-1, -1)}
pos = (0, 0)
```

## pyhthon specific

### 高效倍增与折半

```python
i <= 1
i >= 1  # 向下去整
```

### 判断奇偶

```python
n & 1 == True # 奇数 否则为偶数
```

### 倍增

```python
n <<= 1
```

### 减半并向下取整

通常用于完全树与堆的数组实现中

```python
n >>= 1
```

# 数据结构

## 栈

栈是简化的树

栈通常与递归联系起来

## 单调栈

单调栈是栈的加强，在栈的基础上要求栈内部的元素有序。

单调栈的用途并不广泛，而是集中处理一系列问题。

预先定义好顺序信息后，单调只需要两个元素即可破坏。因此当某元素需要入栈时，需要检测当前元素与栈顶元素，判断是否破坏了栈内部的单调性质，如果破坏了，那么说明栈顶元素需要抛出。重复检查，直到不破坏栈内部的单调性，再将元素入栈。

和栈不同，单调栈通常并不和递归联系起来。

### 单调栈实践

```python
stack = []
for i in range(n):
    while (len(stack) != 0 and stakc[-1] > nums[i]):
        stack.pop()
    stack.append(nums[i])
```

## 并查集

并查集通常用于处理等价类

### 1. 并查集的字典实现

字典结构 + 函数式

前提：这些类（数学意义上的类）要可以hash，否则实现上做不了字典的key

```python
# 初始化
uf = {item: -1 for item in [1, 2, 3, 4, 5, 6, 7]} 负数表示此为根，且绝对值表示此类的大小

# 查 根
def find(uf: dict, one: int) -> int:
    while uf[one] > 0:
        one = uf[one]
    return one

# 并 切记需要并根元素
def union(uf: dict, one, other) -> None:
    # 查根
    root_one = find(uf, one)
    root_other = find(uf, other)

    # 判断/ 也是一种逻辑切分
    if root_one == root_other:
        return

    # 将小树并到大树上，尽量保持平衡
    if uf[root_one] < uf[root_other]:
        root_one, root_other = root_other, root_one

    uf[root_other] += uf[root_one]
    uf[root_one] = root_other
```

### 2. 并查集的类实现

类 + 对象式

TODO

```python

```

## 堆

### 堆的数组实现

基于堆是完全树的拓扑结构；

数组从1开始索引；索引0位存储堆的当前存数量；

数组索引为n的节点，其父节点索引为n//2，左节点为2*n，右节点为2*n+1；

最后一个节点的索引heap[-1]

这里是最小堆的实现, 因此要将大的数下沉

```python
# 初始化
heap = [0] * 50

# 获取节点数量
def get_num(heap):
    return heap[0]

# 下沉 pos 位置的元素
def sink(heap, pos):
    # 获取当前节点值, 左右节点值
    current, left, right = heap[pos], heap[2*pos], heap[2*pos+1]

    # 当前值最小, 停止下沉
    if current <= left and current <= right:
        return

    # 当前值最大, 挑选左右较小节点
    if current > left and current > right:
        small_pos = 2*pos if heap[2*pos] < heap[2*pos+1] else 2*pos+1
    # 否则若左节点较小
    elif current > left:
        small_pos = 2*pos
    # 否则必定右节点较小
    else:
        small_pos = 2*pos+1

    heap[pos], heap[small_pos] = heap[small_pos], heap[pos]

    # 递归点
    sink(heap, small_pos)

# 上浮操作
def up(heap, pos):
    # 获取父节点
    parent_pos = pos // 2

    # 若父节点是元节点, 或父节点比当前节点小
    if parent_pos == 0 or heap[parent_pos] <= heap[pos]:
        return

    # 交换父子节点
    heap[parent_pos], heap[pos] = heap[pos], heap[parent_pos]

    # 递归点
    up(heap, parent_pos)

# 取元素
def pop(heap):
    # 先判断是否有元素
    if heap[0] <= 0:
        return None

    # 取出堆顶元素
    value = heap[1]

    # 将最后元素置于堆顶
    heap[1], heap[heap[0]] = heap[heap[0]], 0
    # 元素计数 -1
    heap[0] -= 1
    # 堆顶元素下沉
    sink(heap, 1)
    return value

# 放入元素
def push(heap, value):
    # 元素计数 +1
    heap[0] += 1
    # 将元素放在最后
    heap[heap[0]] = value
    # 最后元素上浮
    up(heap, heap[0])
```

### 堆的树实现

略, 使用双向树, 即节点不仅需要知道子节点, 还需要知道父节点

## 图

### 表示图的数据结构

#### 邻接矩阵

邻接矩阵在处理一些代数相关的问题时，比较常用

#### 邻接表

```python
from collections import defaultdict
adj_table = defaultdict(list)

# 添加 a -> b, 权重为 w 的边
adj_table[a].append((b, w))
```

⚠️: 对于无向图, 切记初始化的时候不要忘记记录另一个方向的边

# 算法

## 排序

### 冒泡排序

最简单的一种排序方式之一

```python
def sort(nums):
    length = len(nums)

    # 外循环控制冒泡次数
    for out in range(length-1):

    # 内循环控制冒泡操作
        for inner in range(length-1-out):
            if nums[inner] > nums[inner+1]:
                nums[inner], nums[inner+1] = nums[inner+1], nums[inner]
    return nums
```

### 选择排序

一种与插入排序对偶的排序方式

```python
def sort(nums):
    length = len(nums)

    # 外循环控制未排序的范围
    for left in range(length):

        small_pos = left
        # 内循环负责寻找最小值
        for lst in range(left, length):
            if nums[lst] < nums[small_pos]:
                small_pos = lst

        # 循环结束后将选择的最小索引与外循环控制的排序部分交换
        nums[left], nums[small_pos] = nums[small_pos], nums[left]
    return nums
```

### 插入排序

另一种最简单的排序方式之一

```python
def sort(nums):
    length = len(nums)

    # 外循环逐个检查未排序元素
    for current_index in range(length):
        # 内循环负责将当前元素放到合适的位置
        for sorted_index in range(current_index, 0, -1):
            if nums[sorted_index-1] > nums[sorted_index]:
                nums[sorted_index], nums[sorted_index-1] = nums[sorted_index-1], nums[sorted_index]
            else:
                break

    return nums
```

### 希尔排序

基于插入排序的改良

```python
def sort(nums):
    length = len(nums)
    h = 1

    while h < length/3: h = 3*h + 1

    while h >= 1:
        for i in range(h, length):
            for j in range(i, h-1, -h):
                if nums[j] < nums[j-h]:
                    nums[j], nums[j-h] = nums[j-h], nums[j]
                else:
                    break
        h = h // 3

    return nums
```

### 归并排序

一种后递归排序

1. V 形数据排序

2. 锯齿数据排序

```python
aux = [0] * len(nums)

def merge(nums, lo, mid, hi):
    left, right = lo, mid+1

    for k in range(lo, hi+1):
        aux[k] = nums[k]

    for k in range(lo, hi+1):
        if left > mid:
            nums[k] = aux[right]
            right += 1
        elif right > hi:
            nums[k] = aux[left]
            left += 1
        elif aux[left] > aux[right]:
            nums[k] = aux[right]
            right += 1
        else:
            nums[k] = aux[left]
            left += 1

def sort_u2d(nums):
    def sort_rec(nums, lo, hi):
        if lo >= hi:
            return
        mid = lo + (hi-lo)//2
        sort_rec(nums, lo, mid)
        sort_rec(nums, mid+1, hi)
        merge(nums, lo, mid, hi)

    length = len(nums)
    sort_rec(nums, 0, length-1)
    return nums

def sort_d2u(nums):
    length = len(nums)
    size = 1

    while size < length:
        for lo in range(0, length-size, 2*size):
            merge(nums, lo, lo+size-1, min(lo+size-1, length-1))
        size *= 2

    return nums
```

### 快速排序

归并排序的一种改良

```python
def partition(nums, lo, hi):
    left, right = lo, hi
    v = nums[lo]

    while left != right:
        while nums[right] >= v and left < right:
            right -= 1

        while nums[left] <= v and left < right:
            left += 1

        if left < right:
            nums[left], nums[right] = nums[right], nums[left]

    nums[lo], nums[left] = nums[left], nums[lo]
    return left

def _sort(nums, lo, hi):
    if lo >= hi:
        return
    k = partition(nums, lo, hi)
    _sort(nums, lo, k-1)
    _sort(nums, k+1, hi)

def sort(nums):
    random.shuffle(nums)
    _sort(nums, 0, len(nums)-1)
    return nums
```

另一种写法

```python
def quick_sort(nums, l , r):
    if l >= r: return
    i, j = l, r
    while i < j:
        while nums[j] >= nums[l] and i < j: j -= 1
        while nums[i] <= nums[l] and i < j: i += 1
        nums[i], nums[j] = nums[j], nums[i]
    nums[i], nums[l] = nums[l], nums[i]
    quick_sort(nums, l, i - 1)
    quick_sort(nums, i + 1, r)
```
作者：jyd
链接：https://leetcode.cn/problems/ba-shu-zu-pai-cheng-zui-xiao-de-shu-lcof/solution/mian-shi-ti-45-ba-shu-zu-pai-cheng-zui-xiao-de-s-4/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。


### 堆排序

一种动态的惰性排序

## 搜索

大多数常见的搜索算法依赖树(图)状数据结构

### 二分搜索

二分搜索利用了数据的顺序性质，这跳过了许多潜在的错误目标，以此提高效率。

#### 左二分搜索

```python
def bisect_left(sequence, target, left, right):
    while left < right:
        mid = (left + right) // 2
        if sequenct[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left
```

#### 右二分搜索

```python
def bisect_right(sequence, target, left, right):
    while left < right:
        mid = (left + right) // 2
        if sequenct[mid] <= target:
            left = mid + 1
        else:
            right = mid
    return left
```

### DFS 搜索

### BFS 搜索

`BFS` 本质上为一种暴力搜索，但是搜索的模式顺序是固定的。

如果利用数据的某些数学性质进行剪枝，则可以大幅度优化`BFS`。

```python
from collections import deque
def bfs(init_state):
    queue = deque([init_state])
    step = 0
    visited = set()

    def get_next_state(current_state):
        """"""
        pass

    while queue:
        for _ in range(len(queue)):
            current_state = queue.popleft()
            if current_state is ok:
                return step
            for next_state in get_next_state(current_state):
                if next_state not in visited:
                    visited.add(next_state)
                    queue.append(next_state)
    return -1
```

### 双向BFS

BFS 的变体，可以减少搜索空间，同时压缩时间

```python
from collections import deque
def double_bfs(init_state, target_state):
    queue_init = deque([init_state])
    queue_target = deque([target_state])
    step = 0
    visited_forward = set()
    visited_backward = set()

    def get_next_state(current_state, direction):
        pass

    while not queue_init and not queue_target:
        queue, direction = queue_init, "f" if len(queue_init) < len(queue_target) else queue_target, "b"
        for _ in range(len(queue)):
            current_state = queue.popleft()
            if (direction == "f" and current_state in visited_backward) or (direction == "b" and current_state in visited_forward):
                return step

            for next_state in get_next_state(current_state, direction):
                if direction == "f" and next_state not in visited_forward:
                    visited_forward.add(next_state)
                elif direction == "b" and next_state not in visited_backward:
                    visited_backward.add(next_state)
                queue.append(next_state)
    return -1
```

## 动态规划

### 最长子序列

### 最长子串

### 最长递增子序列

### 子串最大和

### 0/1 背包问题

0/1 是指挑选物品，拿或者不拿，而拿做多只能拿一个

限制：背包限制，每个物品有体积，而背包容积有限

优化目标：每个物品具有某种效益，最大化总效益

SOLVE:

定义 dp[i][j] 为从前i个物品中选出总重量不超过j时总价值的最大值

已知 dp[i-1][j]，现在物品范围从前i-1个扩大到前i个，

dp表中，每行为i，每列为j

内循环中，j，也就是背包容量逐渐增大

外循环中，i，也就是可选的物品范围逐渐增大

当下面临的问题是，当前新增的物品能不能装下，若能装下，是拿还是不拿

```python
for i in range(1, n+1):
    for j in range(1, W+1):
        if w[i] > j:
            dp[i+1][j] = dp[i][j]
        else:
            dp[i+1][j] = max(dp[i][j], v[i]+dp[i][j-w[i]])

return dp[n][W]
```

###

3. LIS 问题

## 串算法

1. 字符

假定一集合，该集合内元素个数有限且良序，则该集合可以称为一个字符集;
该集合内的所有元素称为字符。

2. 字符串

给定一指定字符集，由该字符集内字符组成的有序排列，称为字符串。

### 字符串定式

1. 索引

```python
# 字符串首
s[0]

# 越界
s[len(s)]

# 字符串尾
s[len(s)-1]

s[-1]
```

### 字符串基础算法

#### 双指针

1. 同向快慢指针

2. 对向指针

#### AC 树

#### dp

经典例题: 计算两字符串的编辑距离

#### 前缀函数

##### 前置定义

对于一个长度为n的字符串s，以及一个小于n的整数i，
记其前缀s[0:i]与后缀s[n-i:n]为一个前后缀组合

##### 前缀函数定义

对于长度为n的字符串，记其前缀函数为$\pi(i)$
其定义域为[1, n] 之间的整数；

其定义为前缀s[0:i]的所有前后缀组合中，前后缀相等且长度最长的组合的长度。

##### 朴素前缀函数计算

```python
def prefix_function(s):
    n = len(s)
    pi = [0] * n
    for i in range(1, n):
        for j in range(i, -1, -1):
            if s[0:j] == s[(i+1)-j:(i+1)]:
                p[i] = j
                break
    return pi
```

##### 前缀函数优化（一）

注意到 pi[i+1] 最多比 p[i]
大1，这时，当且仅当新增加的字符s[i+1]与s[p[i]-1+1]相同

因此，j从i位置逐渐扫描到0的过程中，超出p[i]部分的扫描是多余的。

```python
def prefix_function(s):
    n = len(s)
    pi = [0] * n
    for i in range(1, n):
        for j in range(p[i-1]+1, -1, -1):
            if s[0:j] == s[(i+1)-j:(i+1)]:
                p[i] = j
                break
    return pi
```

##### 前缀函数优化（二）

当新增字符s[i+1]与s[p[i]]不同时,我们的思路为找到s[0:i]中第二长的前后缀组合,再检测

```python
def prefix_function(s):
    n = len(s)
    pi = [0] * n

    for i in range(1, n):
        j = pi[i-1]

        while not (j <= 0 or s[i] == s[j]):
            j = pi[j-1]

        if s[i] == s[j]:
            j += 1

        pi[i] = j

    return pi
```

#### KMP

### 后缀数组

#### 倍增法计算后缀数组

```python
from itertools import zip_longest, islice

def to_int_keys(l):
    """
    l: iterable of keys
    returns: a list with integer keys
    """
    index = {v: i for i, v in enumerate(sorted(set(l)))}
    return [index[v] for v in l]

def suffix(to_int_keys, s):
    n = len(s)
    k = 1
    ans = to_int_keys(s)
    while k < n:
        ans = to_int_keys(
            list(zip_longest(ans, islice(ans, k, None),
                             fillvalue=-1)))
        k <<= 1
    return ans

suffix(to_int_keys, 'banana')
```

### 判断字符是否由重复字符组成

```python
def repeated(s):
    return s in (s+s)[1:-1]
```

### 判断字符串是否回文

```python
def check(s):
    return s[:] == s[::-1]
```

### LCP 最长公共前缀

   若干字符中查找最长的公共前缀，如果不存在，则返回''

1. 使用遍历

可以注意到

  LCP(s1, s2, ..., sn) = LCP(s1, LCP(s2, LCP(s3, LCP(...LCP(sn-1, sn)))))

  这本质上是个 reduce 的关系,先写一个寻找两个字符串最大公共前缀的函数lcp
  再将lcp用reduce函数作用[s1, s2, ..., sn]的迭代列表上即可

### 某个字符串查询任意两后缀的最长公共子串

1. LCP例子

2. 使用倍增预先计算QMR数组，再用QMR数组推导结果

### LIS 最长递增子序列

使用前缀数组，注意到前面的前缀LIS可以推导其后紧接着的前缀LIS
这是一个广义reduce问题

记前缀为q1, q2, ..., qk,则有关系：

$$LIS(q_n) = max({LIS(q_i) | i < n & q_i[-1] < q_n[-1]}) + 1$$

之所以是广义reduce,
  是指每一个后续指是有前面所有数值reduce出来的，而非狭义的相邻两个

### 最长递增子串

同上，为广义reduce问题

$$LIS(q_n) = q_n[1] > q_{n-1} ? LIS(q_{n-1}+1) : 1 $$

### LCS 最长公共子序列

前缀数组+DP 问题

```python
if i == 0 or j == 0:
    LCS[i][j] = 0
elif x[i] == y[j]:
    LCS[i][j] = LCS[i-1][j-1] + 1
else: # x[i] != y[j]
    LCS[i][j] = max(LCS[i-1][j], LCS[i][j-1])
```

### 最长公共子串

前缀数组+DP 问题

```python
if i == 0 or j == 0:
    LCS[i][j] = 0
elif x[i] == y[j]:
    LCS[i][j] = LCS[i-1][j-1] + 1
else: # x[i] != y[j]
    LCS[i][j] = 0

```

### 子串性质

长串包含子串，记N(S, s) 为S中s的个数，若ls包含ss，则有N(S, ls) <= N(S, ss)

可以这样计算N(S, s):

```python
def N(S, s):
    return len(S.split(s))-1
```

## 一些技巧

对于数组 a = range(10)

### 1. 差分

差分数组为 diff[i] = a[i] - a[i-1], i 从 0 到 9，其中d[0] = 0

且有如下性质：

1. 差分数组与原数组的关系

    d[i+1] 指 a[i] 变换到 a[i+1] 的增量；

    因此有：

    a[i] + d[i+1] + d[i+2] + ... + d[j] = a[j]

    因此有：

    a[j] - a[i] = sum([d[i+1],..., d[j]])

    也就是说：

    a[i] 到 a[j] 的增量为 sum(d): (i, j]  左开右闭原则，中间的差分项为j-i个

2. 差分数组增减与原数组对应的变换

    d[i] += n

    表示a[i] 及之后的数组全部断层平移n个单位；

    d[i] += n; d[j] -= n; j >= i;

    表示a[i] 到a[j]内的数组全部断层平移n个单位；包含a[i]但不包含a[j]；左闭右开；

### 2. 前缀和

前缀和s[i] = sum(a): [0, i]

### 3. 倍增

倍增是一种思想，不是明确的算法。其核心的想法基于下面这个事实：

**对于任意大于0的整数n，总是存在一个整数i，$2^{i-1}<n<2^i$
使得[1, n]之间的任何整数均可由${2^k: k\inZ&k\[1,
  i]}$中的若干元素加和而的，且每个元素至多取一次**

实际上任何数字均可以这样对应，这也是二进制的原理。

其优点往往在于可以利用以往的结果来推演后续结果，而减少了重复计算；

比如后面的倍增法计算后缀数组

LCA 问题

```python
def LCA(node, left, right):
    def LCA_rec(node):
        if not node or node == left or node == right:
            return node

        node_left = LCA(left, left, right)
        node_right = LCA(right, left, right)

        if node_left is None:
            return node_right
        if node_right is None:
            return node_left

    return node
```

## 简单图算法

### 邻接表

#### 数组实现

```python
# 点数 与 边数
num_vtex = 5
num_edge = 8

# 需要+1, 这是0索引导致的
# start, end, weight, 中保存了所有边的信息
start = [-1] * num_edge  # 起点
end = [-1] * num_edge  # 终点
weight = [-1] * num_edge  # 权重

# first 中存储每个顶点的第一条边
first = [-1] * num_vtex

# next 中存储某边的下一个边
next = [-1] * num_edge

# 读入边
for edge in range(num_edge):
    # 边i的下一个边为上一个对应的起始边
    next[edge] = first[start[edge]]
    # 更新起始边
    first[start[edge]] = edge

# 遍历顶点i的所有边
# 1. 找到顶点i的第一条边
k = first[i]
# 2. 遍历
while k != -1:
    print(start[k], end[k], weight[k])
    k = next[k]

# 遍历所有边
for i in range(num_vtex):
    k = first[i]
    while k != -1"
        print(start[k], end[k], weight[k])
        k = next[k]
```

#### 字典实现

```python
adj_table = {}
```

1. 读入边

```
for start, end, weight in edges:
    if start not in adj_table:
        adj_table[start] = []
    adj_table.append(end, weight)
```

2. 遍历某个点的所有边

```python
for end, weight in adj_table[start]:
    do_some_thing(end, weight)
```

#### defaultdict实现

```python
from collections import defaultdict
adj_table = defaultdict(list)
```

1. 读入边

```python
for start, end, weight in edges:
    adj_table[start].append((end, weight))
```

2. 遍历某个节点的邻接点

遍历节点s

```python
for end, weight in adj_table[s]:
    do_some_thing()
```

### 邻接矩阵

```python
num_vtex = 20

adj_mat = [[INF] * num_vtex for _ in ragne(num_vtex)]

# 读入边
for start, end, weight in edges:
    adj_mat[start][end] = weight
```

#### n次邻接矩阵

##### 到达矩阵

邻接矩阵中元素仅有0、1；0表示无法一步到达，1表示可以一步到达。

前提：简单图
记方阵A_{n*n}为这样的单步邻接矩阵，记A^k_{n*n}为A_{n*n}的k次矩阵幂，那么A^k_{n*n}[i][j]则为k步从点i到点j的路径数目。

参考离散数学。

##### 概率转移矩阵

参考随机过程。

#### 快幂算法

快幂算法有点类似倍增法，数学基础都是二进制。

假设我们需要进行n次幂乘

> 1. 找到一个k，使得2^k<=n<2^{k+1}
> 2. 计算X^{(i)}=A^{2^i}，其中i\in[0, k]，需要注意的是，这里不断倍增即可，即X^{(i)}=X^{(i-1}*X^{(i-1)}
> 3. 找到n的二进制表示，根据二进制表示用X^{(i)}组合出乘积的形式

### 最短路径

#### Floyd-Warshall 算法

求任意两点间的最短距离

使用邻接矩阵

```python
for k in range(num_vtex):
    for start in range(num_vtex):
        for end in range(num_vtex):
            if adj_mat[start][end] > adj_mat[start][k]+adj_mat[k][end]:
                adj_mat = adj_mat[start][k] + adj_mat[k][end]
```

#### Dijkstra 算法

求某点到其余点的最短距离

将点分为两组，P表示已找到最短距离的点的集合，Q表示未找到最短距离的点的集合

> 1. 初始化。将原点加入P中，并标记原点的最短距离为0；
> 2. 迭代。在Q中找到距离原点最近的点，将其加入P中。对其所有出边进行松弛操作；
> 3. 直到Q为空集，迭代结束

维护一张表，该表记录某个点是否为P集合点，以及前点。

```python
from math import inf

# 1. 初始化。假设源点为0

distance = [inf] * num_vtex
prefix = [None] * num_vtex
finished = set()
unfinish = set(vtex)

distance[0] = 0
finished.add(0)
unfinish.remove(0)

# 2. 迭代。

while unfinish:

    # unfinish 中查找最小distance的点
    min = inf
    for vtex in unfinish:
        if distance[vtex] < min:
            min = distance[vtex]
            start = vtex

    finished.add(start)
    unfinish.remove(start)

    # 松弛该点的所有出边
    for end, weight in adj_table[start]:
        if distance[start] + weight < distance[end]:
            distance[end] = dis[start] + weight
            prefix[end] = start
```

#### Bellman-Ford 算法

求任意两点间的最小距离，可处理负权重边

用邻接表

```python
for _ in range(num_vtex-1):
    for edge in range(num_edge):
        if dis[end[edge]] > dis[end[edge]] + weight[edge]:
            dis[end[edge]] = dis[end[edge]] + weight[edge]
```

### 搜索

#### 深度优先

判断两点是否连通,计算当前连通分量内的点数

```python
visited = [False] //
total = 0

def dfs(graph, node):
    if visited(node):
        return

    visited[node] = True
    total += 1

    for adj_node in graph.adj(node):
        dfs(graph, adj_node)
```

##### 计算连通分量

#### 广度优先

需要使用一个队列

```python
total = 0
visited = [False] //

def bfs(graph, node):
    queue = [node]

    while queue:
        for _ in range(len(queue)):
            current_node = queue.popleft()

            visited[current_node] = True

            do_some_thing()

            for adj_node in graph.adj(node):
                if not visited[adj_node]:
                    queue.append(adj_node)
```

### 判断成环

#### dfs 判断

适用于有环图与无环图

不断深度遍历，若出现某节点遍历到已遍历节点，则说明有环，否则无环；可以利用n个点的信息提前结束遍历

#### Union-Find 判断 (更适合动态情况)

适用于无环图

遍历所有边，判断边两点的根结点

若不一致，则无环，将两点并起来

若根结点一致，则有环，结束遍历

#### 拓扑排序 判断

适用于有环图

不断删除入度为0的节点，若最终全部删除完，则无环，否则有环

### 最小生成树

两种最小生成树的原理都是切分定理，Krustra处理边，Prime处理点

注意：n个点的最小生成树由n-1条边组成，可以用此提前结束循环

#### Krustra

取一个空集，不断从边中取出最小边，试图加入该集合

若使集合成环，则舍弃；否则加入集合

最终大小为n-1的边集合必定组成最小生成树

算法的关键在于判断成环

#### Prime

取一个空集，随机取一个点加入空集，作为初始数据

遍历该集合所有外连边，取最小边，加入该集合

最终大小为n的点集合的边必定组成最小生成树

算法的关键在于维护、遍历外连边

## 

# 高级算法

## AC 自动机

多叉树 + trie

### 概念

推荐b站的视频

### python 实现

1. 定义树节点

```python
class Node:
    def __init__(self, value: str, parent=None):
        self.children = {}
        self.value = value
        self.faild = None
        self.words = []
        if not parent:
            self.parent = self
```

2. 扫描 pattern
```python
def scan(patterns):
    root = Node('')
    for pattern in patterns:
        p = root
        for char in pattern:
            if char not in p.children:
                p.children[char] = Node(char, parent=p)
            p = p.children[char]
        p.words = len(pattern)
    return root
```

3. 构建 failed 指针

```python
def build(root):
    queue = [root]
    while queue:
        for _ in range(len(queue)):
            current_node = queue.pop(0)
            prob_node = current_node.parent.failed
            while prob_node.value != '':
                if current_node.value in prob_node.children:
                    current_node.failed = prob_node.children[current_node.value]
                    break
                prob_node = prob_node.failed
            for child_key in sorted(current_node.children.keys()):
                queue.append(current_node.children[child_key])
```

4. 查询

## AD 自动微分

```python
import math
import copy

class Expression:
    _symbols = {}

    @staticmethod
    def updateSymbols(**kwargs):
        while kwargs:
            symbol_str, symbol_val = kwargs.popitem()
            symbol_obj = Expression._symbols[symbol_str]
            symbol_obj.value = symbol_val

    def evalAndDeriveAt(self, variable, **kwargs):
        self.updateSymbols(**kwargs)

    def __add__(self, other):
        if isinstance(other, (int, float)):
            other = Constant(other)
        return AddExpression(self, other)

    def __sub__(self, other):
        if isinstance(other, (int, float)):
            other = Constant(other)
        return SubExpression(self, other)

    def __mul__(self, other):
        if isinstance(other, (int, float)):
            other = Constant(other)
        return MultiExpression(self, other)

    def __truediv__(self, other):
        if isinstance(other, (int, float)):
            other = Constant(other)
        return DivExpression(self, other)

    def __pow__(self, other):
        if isinstance(other, (int, float)):
            other = Constant(other)
        return PowExpression(self, other)

    def __radd__(self, other):
        if isinstance(other, (int, float)):
            other = Constant(other)
        return AddExpression(other, self)

    def __rsub__(self, other):
        if isinstance(other, (int, float)):
            other = Constant(other)
        return SubExpression(other, self)

    def __rmul__(self, other):
        if isinstance(other, (int, float)):
            other = Constant(other)
        return MultiExpression(other, self)

    def __rtruediv__(self, other):
        if isinstance(other, (int, float)):
            other = Constant(other)
        return DivExpression(other, self)

    def __rpow__(self, other):
        if isinstance(other, (int, float)):
            other = Constant(other)
        return PowExpression(other, self)

    @staticmethod
    def sin(expression):
        return SinExpression(expression)

    @staticmethod
    def cos(expression):
        return CosExpression(expression)

    @staticmethod
    def log(expression):
        return LogExpression(expression)

    @staticmethod
    def abs(expression):
        return AbsExpression(expression)

    @staticmethod
    def exp(expression):
        return ExpExpression(expression)

class SingleExpression(Expression):
    def __init__(self, expression) -> None:
        super().__init__()
        self.expression = expression

    def evalAndDeriveAt(self, variable, **kwargs):
        super().evalAndDeriveAt(variable, **kwargs)
        return self.expression.evalAndDeriveAt(variable, **kwargs)

class SinExpression(SingleExpression):
    def evalAndDeriveAt(self, variable, **kwargs):
        value, partial = super().evalAndDeriveAt(variable, **kwargs)
        return Dual(math.sin(value), partial*math.cos(value))

    def __repr__(self) -> str:
        return f"sin({self.expression})"

class CosExpression(SingleExpression):
    def evalAndDeriveAt(self, variable, **kwargs):
        value, partial = super().evalAndDeriveAt(variable, **kwargs)
        return Dual(math.cos(value), -partial*math.sin(value))

    def __repr__(self) -> str:
        return f"cos({self.expression})"

class LogExpression(SingleExpression):
    def evalAndDeriveAt(self, variable, **kwargs):
        value, partial = super().evalAndDeriveAt(variable, **kwargs)
        assert value > 0
        return Dual(math.log(value), partial/value)

    def __repr__(self) -> str:
        return f"log({self.expression})"

class AbsExpression(SingleExpression):
    def evalAndDeriveAt(self, variable, **kwargs):
        value, partial = super().evalAndDeriveAt(variable, **kwargs)
        return Dual(math.abs(value), partial*math.sign(value))

    def __repr__(self) -> str:
        return f"|{self.expression}|"

class ExpExpression(SingleExpression):
    def evalAndDeriveAt(self, variable, **kwargs):
        value, partial = super().evalAndDeriveAt(variable, **kwargs)
        return Dual(math.exp(value), partial*math.exp(value))

    def __repr__(self) -> str:
        return f"e ^ ({self.expression})"

class BinaryExpression(Expression):
    def __init__(self, left, right) -> None:
        self.left = left
        self.right = right

    def evalAndDeriveAt(self, variable, **kwargs):
        super().evalAndDeriveAt(variable, **kwargs)
        return self.left.evalAndDeriveAt(variable, **kwargs), self.right.evalAndDeriveAt(variable, **kwargs)

class AddExpression(BinaryExpression):
    def evalAndDeriveAt(self, variable, **kwargs):
        [vleft, dleft], [vright, dright] = super().evalAndDeriveAt(variable, **kwargs)
        return Dual(vleft+vright, dleft+dright)

    def __repr__(self) -> str:
        return f"({self.left} + {self.right})"

class SubExpression(BinaryExpression):
    def evalAndDeriveAt(self, variable, **kwargs):
        [vleft, dleft], [vright, dright] = super().evalAndDeriveAt(variable, **kwargs)
        return Dual(vleft-vright, dleft-dright)

    def __repr__(self) -> str:
        if self.left == 0:
            return f"- {self.right}"
        return f"({self.left} - {self.right})"

class MultiExpression(BinaryExpression):
    def evalAndDeriveAt(self, variable, **kwargs):
        [vleft, dleft], [vright, dright] = super().evalAndDeriveAt(variable, **kwargs)
        return Dual(vleft*vright, vleft*dright+dleft*vright)

    def __repr__(self) -> str:
        return f"({self.left} * {self.right})"

class DivExpression(BinaryExpression):
    def evalAndDeriveAt(self, variable, **kwargs):
        [vleft, dleft], [vright, dright] = super().evalAndDeriveAt(variable, **kwargs)
        assert vright != 0, ZeroDivisionError
        return Dual(vleft/vright, (dleft*vright-vleft*dright)/(vright*vright))

    def __repr__(self) -> str:
        return f"({self.left} / {self.right})"

class PowExpression(BinaryExpression):
    def evalAndDeriveAt(self, variable, **kwargs):
        [vleft, dleft], [vright, dright] = super().evalAndDeriveAt(variable, **kwargs)
        assert vright != 0, ZeroDivisionError
        return Dual(math.pow(vleft, vright), (vright*math.pow(vleft, vright-1)*dleft))

    def __repr__(self) -> str:
        return f"({self.left} ^ ({self.right}))"

class Dual(Expression):
    def __init__(self, value=0, partial=0) -> None:
        self.value = value
        self.partial = partial

    def eval(self):
        return self.value

    def __iter__(self):
        yield self.value
        yield self.partial

    def __repr__(self) -> str:
        return str(self.value)

class Variable(Dual):
    def __init__(self, symbol, value=0, partial=0) -> None:
        super().__init__(value, partial)
        self.symbol = symbol
        Expression._symbols[symbol] = self

    def evalAndDeriveAt(self, variable, **kwargs):
        partial = 1 if variable is self else 0
        value = self.value
        return value, partial

    def __repr__(self):
        return self.symbol

class Constant(Dual):
    def evalAndDeriveAt(self, variable, **kwargs):
        return self.value, 0

    def __repr__(self) -> str:
        return str(self.value)

class Matrix(Expression):
    def __init__(self, matdata) -> None:
        self.data = []
        first_row = len(matdata[0])
        for row in matdata:
            assert(len(row) == first_row)
            current_row = [ele for ele in row]
            self.data.append(current_row)
        self.size = len(self.data), len(self.data[0]) # row, col

    @property
    def T(self):
        col, row = self.size
        data = [[0] * col for _ in range(row)]
        for r in range(row):
            for c in range(col):
                data[r][c] = self.data[c][r]
        return Matrix(data)

    def __getitem__(self, index):
        return self.data[index]

    def __iter__(self):
        return iter(self.data)

    def __add__(self, other):
        assert self.size == other.size
        data = copy.deepcopy(self.data)
        row, col = self.size
        for r in range(row):
            for c in range(col):
                data[r][c] += self[r][c]
        return Matrix(data)

    def __sub__(self, other):
        assert self.size == other.size
        data = copy.deepcopy(self.data)
        row, col = self.size
        for r in range(row):
            for c in range(col):
                data[r][c] -= self[r][c]
        return Matrix(data)

    def __mul__(self, other):
        assert isinstance(other, (int, float, Expression, Matrix))
        if isinstance(other, Matrix):
            left_row, left_col = self.size
            right_row, right_col = other.size
            assert left_col == right_row
            data = [[0]*right_col for _ in range(left_row)]
            for row in range(left_row):
                for col in range(right_col):
                    data[row][col] = self[row][0] * other[0][col]
                    for index in range(1, left_col):
                        data[row][col] += self[row][index] * other[index][col]
            return Matrix(data)

        if isinstance(other, (int, float, Expression)):
            data = copy.deepcopy(self.data)
            row, col = self.size
            for r in range(row):
                for c in range(col):
                    data[r][c] *= other
            return Matrix(data)

    def __truediv__(self, other):
        assert isinstance(other, (int, float, Expression))
        if isinstance(other, (int, float)):
            assert other != 0
        return self * (1/other)

    def __rmul__(self, other):
        assert isinstance(other, (int, float, Expression))
        return self * other

    def __repr__(self):
        msg = ""
        for row in self:
            msg += "|"
            msg += ", ".join([repr(r) for r in row])
            msg += "|\n"
        return msg

    def evalAndDeriveAt(self, variable, **kwargs):
        row, col = self.size
        data = [[0] * col for _ in range(row)]
        value = [[0] * col for _ in range(row)]
        partial = [[0] * col for _ in range(row)]
        for r in range(row):
            for c in range(col):
                data[r][c] = self.data[r][c].evalAndDeriveAt(variable, **kwargs)
                value[r][c] = data[r][c].value
                partial[r][c] = data[r][c].partial
        return Dual(Matrix(value), Matrix(partial))

class Vector(Matrix):
    def __init__(self, matdata) -> None:
        data = []
        for ele in matdata:
            data.append([ele])
        super().__init__(data)

    def __repr__(self):
        return f"<Vector: {[d[0] for d in self.data]}>"

sin = Expression.sin
cos = Expression.cos
log = Expression.log
abs = Expression.abs
exp = Expression.exp

if __name__ == "__main__":

    x = Variable('x')
    y = Variable('y')
    const_2 = Constant(2)

    f = sin(const_2*x*y+x)
    g = sin(2*x*y+x)

    print(f)
    print(g)

    print(f.evalAndDeriveAt(x, x=5, y=10).partial)
    print(g.evalAndDeriveAt(x, x=5, y=10).partial)

    print()

    TestVector = Vector([
        x + y,
        x * y
    ])
    print()
    print(TestVector)
    print()
    print(TestVector*TestVector.T)
    print()
    print(TestVector.T*TestVector)
    print()
    print((TestVector*TestVector.T).evalAndDeriveAt(x, x=4, y=2).value)
    print((TestVector*TestVector.T).evalAndDeriveAt(x, x=4, y=2).partial)
    print()
    print((TestVector.T*TestVector).evalAndDeriveAt(y, x=4, y=2).value)
    print((TestVector.T*TestVector).evalAndDeriveAt(y, x=4, y=2).partial)
    print()

    x1 = Variable('x1')
    x2 = Variable('x2')
    x3 = Variable('x3')

    G = Vector([
        3 * x1 + cos(x2*x3) - 3/2,
        4 * x1 ** 2 - 625 * x2 ** 2 + 2 * x2 - 1,
        exp(0-x1*x2) + 20 * x3 + (10*math.pi-3)/3
    ])

    print()
    print(G)
    print()

    F = (1/2 * G.T * G)[0][0]

    print()
    print(F)
    print()

    print(F.evalAndDeriveAt(x1, x1=5, x2=8, x3=10).value)
    print(F.evalAndDeriveAt(x1, x1=5, x2=8, x3=10).partial)
```

## LRU 缓存

LRU 缓存的另一种说法：保留插入顺序的字典

为了保证查找，插入的O(1)复杂度，我们使用字典作为缓存，此外使用双向链表来记录key的访问

```python
class DLinkedNode:
    def __init__(self, key=0, value=0):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity: 'int'):
        self.cache = {}
        self.head = DLinkedNode()
        self.tail = DLinkedNode()
        self.head.next = self.tail
        self.tail.next = self.head
        self.capacity = capacity
        self.size = 0

    def get(self, key: 'int'):
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self.move_to_head(node)
        return node.value

    def put(self, key: 'int', value: 'int'):
        if key not in self.cache:
            node = DLinkedNode(key, value)
            self.cache[key] = node
            self.add_to_head(node)
            self.size += 1
            if self.size > self.capacity:
                removed = self.remove_tail()
                self.cache.pop(removed.key)
                self.size -= 1
        else:
            node = self.cache[key]
            node.value = value
            self.move_to_head(node)

    def add_to_head(self, node):
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def remove_node(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def move_to_head(self, node):
        self.remove_node(node)
        self.add_to_head(node)

    def remove_tail(self):
        node = self.tail.prev
        self.remove_node(node)
        return node
```

### MISC 一些重要的python细节

列表和字典key的查询方式并不相同，时间复杂度也不是一个量级

```python
# 先构建列表，字典，集合
lst = [_ for _ in range(10000)]
dct = {_: None for _ in range(10000)}
st = set(lst)

%timeit 9999 in lst
99.1 µs ± 111 ns per loop (mean ± std. dev. of 7 runs, 10,000 loops each)
%timeit 9999 in dct
42.3 ns ± 0.346 ns per loop (mean ± std. dev. of 7 runs, 10,000,000 loops each)
%timeit 9999 in st
41.1 ns ± 0.0835 ns per loop (mean ± std. dev. of 7 runs, 10,000,000 loops each)
```

列表使用线性查找O(n)，而字典使用hash查找O(1)

## RMQ 问题

### ST 算法

参考: [RMQ问题](https://www.desgard.com/algo/docs/part2/ch03/1-range-max-query/)

ST 算法先对数据进行预处理，为一种离线算法，适合数据不变情况，
动态情况考虑使用线段树

假设原始数据:

nums = [3, 4, 2, 2, 2, 4, 2, 0, 0, 0, 0, 1]

1. 先计算预处理数组

    ```python
    length = int(math.log2(len(array))) + 1
    rmq = [[0]* length for _ in range(len(nums))]

    def rmq_init():
        for l, num in enumerate(nums):
            rmq[l][0] = num

        for r in range(1, length):
            for l in range(len(nums)):
                if l + (1 << (r-1)) >= len(nums):
                    break
                rmq[l][r] = max(rmq[l, r-1],rmq[l + (1 << (r-1))][r-1] )
    ```

2. 查询

    ```python
    def rmq_query(l, r):
        k = int(math.log2(r-l+1))
        return max(rmq[l][k], rmq[r-(1<<k)+1][k])
    ```

