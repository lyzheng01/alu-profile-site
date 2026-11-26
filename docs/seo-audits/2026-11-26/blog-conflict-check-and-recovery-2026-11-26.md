# 博客主题冲突检查与 404 内容补齐（2026-11-26）

## 冲突检查

检查了线上文章 API 的 22 篇英文博客及对应语言目录，并抽查了正文主题：没有发现“铝型材供应商质量控制清单”或“梅花形/多瓣铝管选型”同主题文章。

存在相邻主题，新增稿件按以下范围区分：

| 新主题 | 相邻现有文章 | 新稿限定范围 |
|---|---|---|
| 供应商质量控制 | RFQ 清单、供应商合作流程、挤压工艺、图纸公差、CNC 尺寸与检验 | 聚焦供应商质量证据、检验计划、样品/首件批准、批次追溯和不合格处理；不重写公差技术指南或通用询价步骤 |
| 梅花形铝管 | 截面/模具可行性、表面处理选择、RFQ 清单 | 聚焦“梅花形”描述的歧义、截面图定义、装配配合和该形状的询价资料；不编造标准尺寸、库存、性能或 LingYe 产品能力 |

技术表述以买方核对项为主。挤压工艺与模具、合金及工艺参数有关，尺寸公差需回到适用规范和双方批准的图纸；阳极氧化外观会受合金、表面准备等影响。参考 [The Aluminum Association 挤压工艺说明](https://www.aluminum.org/processing-101)、[铝挤压公差说明](https://www.aluminum.org/understanding-aluminum-extrusion-tolerances-video-series) 和 [QUALANOD 建筑应用说明](https://www.qualanod.net/architectural-applications.html)。

## 新增文章

两篇英文母稿已发布，并建立中文、葡萄牙语、西班牙语译文：

- `/news/industrial-aluminum-extrusions-supplier-guide-for-quality-control`
- `/news/plum-blossom-aluminum-tube-design-features-applications-and-surface-treatment-options`

共 8 个语言页面。线上文章数从 22 篇增至 24 篇。旧 GSC URL 的语言版本均有对应页面；额外葡语通用指南与详细指南意图重叠，因此设置为指向详细葡语译稿的单跳 301。

## 线上验证

- 上述 8 个语言页面均返回 HTTP 200。
- 8 页均有 H1、页面标题、自身 canonical，robots 为 `index,follow`。
- sitemap 由原 315 个 URL 增至 323 个 URL；两篇文章各收录 en/zh/es/pt 四个 URL。
- GSC 列出的 4 个英文/葡语正文 URL 返回 200；葡语通用旧 URL 返回 301，目标页返回 200。
- Nginx 配置通过 `nginx -t` 并已重载；原配置备份于 `/etc/nginx/conf.d/aluminum-site.conf.bak_20261126_blog_redirect`。
- 数据库与葡语、中文、西语翻译文件发布前均有备份，目录：`/www/wwwroot/Aluminum/backups/20261126_gsc_blog_recovery/`。
- 构建时本机 Chrome 不可用，因此 prerender 未运行浏览器截图步骤；但 prerender 已写入 96 个文章静态页面，新增页面均已实际 HTTP 抽查确认。

## 后续观察

当前验证的是线上可访问性、页面索引指令和 sitemap 收录，不代表 Google 已重新抓取或已编入索引。待 GSC 后续更新 URL 检查状态后，再确认抓取时间和收录结果。
