---
title: 理解pandas架构
date: 2023-11-27 14:48:02
tags:
---

## 前言

Pandas 是数据科学中常用的数据处理库；然而初学者并没有学习到Pandas的思想，仍然用数组的思维将Pandas仅仅作为数据的容器，总使用迭代的方式处理数据，这样既不优雅，又容易犯错；此外Pandas的API众多，初学者很容易迷失在茫茫的API文档中，不得要领；

## 数据模型

首先需要牢记的是，Pandas采用计算式；也就是说绝大多数的操作都是计算出一个结果，而并不修改原数据；如果你需要对原数据作出修改，通常需要手动重新赋值，或者加上inplace参数；

### 初识数据

这是一个常规数据表的结构示意图：

在Pandas中，数据由Series与DataFrame表示；其中DataFrame可以视为Series的集合；

#### 索引

#### 列名

#### 特征(列)

#### 观测(行)

### 选择

如果是选择某列，可以直接采用下面的方式选取：

```python
col = df["col_name"]
```

此时得到的是一个Series对象；

若选择多列，则采用下面的方式选取：

```python
cols = df[["col_name_1", "col_name_2", "col_name_3"]]
```

此时得到的cols是一个DataFrame对象。

若选择涉及到行，则需要使用数据框的loc/iloc接口；

#### loc

loc 暴露了数据框根据index对数据进行选择的接口：

```python
sub_df = df.loc[]
```

#### iloc

iloc 暴露了数据框根据位置对数据进行选择的接口：

```python
sub_df = df.iloc[2:8, 1:9]
```

### 筛选

筛选的过程分成两步：

1. 根据筛选条件生成掩码；

2. 根据掩码对数据进行筛选。

#### 掩码

以行方向举例，每行都是一个独立的观测

用筛选条件，对所有观测做一个映射，满足筛选条件则映射到True，否则映射到False；

由此获得一个与索引长度相同的掩码数组；

根据该掩码数组，对应为True的观测被保留；对应为False的观测被舍弃。

上述为通用的筛选逻辑，其中前文介绍的loc/iloc接口均可以使用，例如：

```python
df.loc[lambda s: s['shield'] == 8, :]
```

### 处理

数据处理常用的三大函数类：apply、map、reduce

这三大函数类都接受一个处理函数func、一个序列seq、以及其他的定制参数作为参数，但它们在数据处理的逻辑上会有一些差别。

#### apply

apply类函数会将序列整体作为一个参数传递给处理函数，该处理函数会将序列整体作为参数进行处理，并返回一个值作为结果；

从效果上来看比较类似：

```python
df['col_name'].apply(func)

func(df['col_name'])
```

但当apply的序列对象为一个DataFrame时，apply会作用在DataFrame的每个Series上，并将每个Series的计算结果合并成一个Series。此时需要额外传递一个参数axis指明apply的方向。默认0代表行方向，1代表列方向。

```python
df.apply(func, axis=1)
```

#### map

map类函数与apply类似，接受一个处理函数func，一个序列seq作为参数；不同的是，apply会将seq作为一个整体被func调用，但在map中，func会作用在seq中的每个元素上，并返回对应的计算值。最终所有计算值由map收集，并拼凑成一个与原seq形状相同的数据结构返回。

通常map只作用在Series上：

```python
df['col_name'].map(func)

[func(i) for i in df['col_name']]
```

如果需要对DataFrame整体进行map操作，api为applymap

#### reduce

reduce类函数同样接受一个处理函数func，一个序列seq作为参数；

reduce函数会取seq中前两个元素s1, s2作为参数去调用func：func(s1, s2)，并将结果继续与后续元素做func运算，直到消耗完seq中的所有元素，并将最后的规约值作为结果返回；

```python
df['col_name'].reduce(func)

func(func(func(func(s1, s2), s3), s4)...)
```

### 合并

数据合并通常有两类：具有相同特征的两个数据框按行合并成具有更多观测的数据框、具有相同观测的两个数据框按列合并成具有更多特征的数据框。

通常前者更简单，使用concat：

```python
df = pd.concat(df_1, df_2)
```

往往采用外连结的方式保证所有特征都被保留。

后者通常会复杂一些，往往使用merge：

```python
df = pd.merge(df_1, df_2, left_on="left_col", right_on="right_col", how="left")
```

这里参考数据库的左右连接与内外连接，两者逻辑上完全一致。

### 重铸

重铸这个词来自R中的数据处理。

用来修改数据的结构。

#### melt

#### stack

#### unstack

### 窗口 window

### 聚合 groupby

groupby 同样是数据处理中最重要的函数之一。

#### groupby

groupby 将数据按照某一标准分类，以便让方便后续的apply操作；

groupby通常传入列名即可，pandas会将改列值相同的观测分成一类；

```python
df.groupby('col_name')
```

groupby返回的是一个惰性对象，也就是说分类并不会立刻开始，而是会在后续运算时一并运算。

常见的会在其后加上

## Pandas API 一览

### Series 是Pandas 中的最小单位

