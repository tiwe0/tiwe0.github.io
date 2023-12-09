---
title: 一个通过猜测api绕过支付的案例
date: 2023-12-09 10:26:01
tags:
  - 爬虫
  - 逆向
---

## 背景
案例已去除所有敏感信息.

前段时间考研时接到的一个需求, 客户是抓取自己的网站, 可能是用来做测试？

该网站是售卖现在比较火的龙傲天短剧, 通常是那种每集2分钟, 动辄100+集的龙傲天短剧。通常采用前xx集免费，等消费者看上头了，后面剧集便需要通过支付购买方可解锁观看，由此实现变现。

支付这个功能实际上是对安全的要求十分高的，通常使用大厂的接口会靠谱的多。然而，支付接口也只是支付这一大块功能中的一个组成部分。即便使用了靠谱的支付接口，其他方面的逻辑漏洞也又可能导致

本次的案例就是支付接口之外的漏洞。该网站在消费者支付后，会在后端验证该消费者的消费信息后，给该主机后台发送所购买的视频的链接。在前端并不能看到这个链接，也看不出什么异常。

## 分析

在多次的抓包分析后，发现了这样的问题：对付费视频的api做请求时，请求中并没有任何用于检验身份的token。这就意味着，未付费的消费者如果碰巧猜测到了付费视频的api，那么便可以不用付费即可获得视频数据。

本次案例中的视频api有这样的结构：xxxx.com/video_id/num_id/base.m3u8. 其中当集数增加1后，base以36进制也增加1。由此，我们可以通过前一段免费的视频来猜测后面收费视频的api。

问题的关键在base+1的实现。该base是一个字符串，每个位上的字符取值集合为[0-9a-z]，按照顺序在数值上主次+1，也就是4+1=5，d+1=e，当z+1后会变回0，并向高位进位。数学上与36进制数字同构。

## 实现

关键实现一个36进制数字的类:

```python
class ABNum:
    def __init__(self, value: str | int, pad=-1) -> None:
        self.pad = pad
        if isinstance(value, int):
            self.value = value
            return
        value_list = [self.map_to_int(v) for v in reversed(value)]
        self.pad = len(value_list)
        self.value = 0
        for index, v in enumerate(value_list):
            self.value += v * 36 ** index

    def plusOne(self):
        self.value += 1

    def __add__(self, other):
        if isinstance(other, int):
            value = self.value + other
            return ABNum(value, self.pad)

    def __str__(self):
        value = self.value
        value_list = []
        while True:
            value, div = divmod(value, 36)
            value_list.append(div)
            if value < 36:
                value_list.append(value)
                break
        pad_num = self.pad - len(value_list)
        value_list.reverse()
        if pad_num > 0:
            value_list = [0] * pad_num + value_list
        return ''.join([self.map_to_str(v) for v in value_list])

    @staticmethod
    def map_to_int(v: str) -> int:
        assert len(v) == 1
        if v.isdecimal():
            return int(v)
        return ord(v) - 87

    @staticmethod
    def map_to_str(v: int) -> str:
        if v >= 0 and v <= 9:
            return str(v)
        return chr(87+v)
```

该类并没有完全实现作为一个数字该实现的所有方法，这里仅满足使用即可。算法使用常规的短除法，按照数字定义，从10进制与36进制之间转换。类的内部使用10进制保存数值以及处理算术运算，在需要时再转换为36进制即可。

需要注意的点有:

    1. 注意原始36进制数据的位数，最终求出来的36进制数要记得填充0.

    2. 注意10进制与36进制转换时，需要做reverse.

## 总结

作为渗透测试人员、爬虫工程人员，要多留意数据之间的潜在关系。看出关系后，要能联系到可以实现的数学表达。遇到该类网站，未了解全貌后不要擅自爬取。本质上这个已经有些超过合法爬虫的范围，已经触犯法律了。可以提醒站长漏洞。

作为网站运营，这种出售链接的方式，应当使用完全随机的链接，以防止攻击者猜测出规律，绕过支付。更稳妥的方式还是验证浏览者身份信息，以及即时生成随机的视频链接。
