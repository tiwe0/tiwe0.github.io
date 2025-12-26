---
title: 【项目】Chat with GeoGebra
date: 2025-12-26 22:35:35
tags:
categories:
  - 项目
---

目前已经增加了 functioncall 和初步的 agent，效果还不错，欢迎意见反馈

做了一个将llm接入GeoGebra的绘图辅助工具，挂载在vercel上，受于限制，每次回复的截断时间为300s。

大小受到限制，需要点开。

[传送门](https://chat-with-geogebra.com/chat)

视频演示: (electron 版本)
<video controls width="800">
  <source src="/assets/post/chat-with-geogebra/example3.mov" type="video/mp4">
  您的浏览器不支持 video 标签。
</video>

效果如下

{% iframe /assets/post/chat-with-geogebra/example1.jpg 100% 800rem %}

---

{% iframe /assets/post/chat-with-geogebra/example2.jpg 100% 800rem %}

---

{% iframe https://chat-with-geogebra.com/chat 100% 800rem %}
