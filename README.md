# linlxzx · 旅行者的空间

**线上地址:https://linlxzx.github.io/**
仓库:https://github.com/linlxzx/linlxzx.github.io

一个**纯ai写**的个人网站:HTML + CSS + JavaScript,**零框架、零构建、零外部依赖**。
所有的背景、纹理、骑士、音效都是**程序化生成**的 —— 没有一张图片素材、没有一个音频文件。

---

## 一、怎么在本地打开

**最简单**:直接双击 `index.html`。

**推荐**(行为更接近线上):

```powershell
cd D:\网站
python -m http.server 8931
# 然后浏览器打开 http://127.0.0.1:8931/
```

> 需要 Python(本机已装)。用 Node 也可以:`npx serve .`

---

## 二、你以后最常改的文件:`content.js`

**改文字、加分区、换链接,只需要动这一个文件。**

### 加一个新分区

在 `content.js` 的 `SITE_CONTENT.sections` 数组里,复制一段改一改:

```js
{
  id: 'fitness2',            // 唯一 id,不能重复
  title: '新分区名',          // 显示的中文标题
  label: 'NEW SECTION',      // 上方那行英文小标
  accent: 'gold',            // 氛围色:gold / blood / steel / moss / sky
  nav: '新区',               // 左侧导航圆点里的 1-2 个字
  blocks: [
    { type: 'text', body: '随便写点什么。' }
  ]
}
```

保存刷新,页面上就会自动多出这个分区和对应的导航点。**不用碰 HTML 或 CSS。**

### 六种区块(可以自由组合、可以放多个)

| type | 用途 | 写法 |
|---|---|---|
| `profile` | 个人名册(骑士站这里) | `{ type:'profile', name, title, bio:[], tags:[], meta:[{k,v}] }` |
| `text` | 一段富文本(可写 HTML) | `{ type:'text', body:'<p>...</p>' }` |
| `stats` | 进度条 | `{ type:'stats', items:[{name, value:0-100, note}] }` |
| `cards` | 卡片墙 | `{ type:'cards', items:[{title, kind, desc, url, tag}] }` |
| `timeline` | 时间线 | `{ type:'timeline', items:[{date, title, desc}] }` |
| `links` | 链接列表 | `{ type:'links', items:[{label, value, url}] }` |

> `cards` 和 `links` 的 `url` 填了就会变成可点击的链接;留空就是纯展示。

---

## 三、改配色 / 加大背景主题

### 改现有主题的颜色

打开 `styles/tokens.css`,找到 `[data-theme='castle']` 这样的段落,里面的变量就是那套主题的全部颜色:

- `--bd-*` 是大背景用的(天空、远近景剪影、雾、粒子颜色)
- `--c-*` 是界面用的(底色、面板、文字、主色)

改完保存即可。

### 加一套新主题

1. 在 `tokens.css` 里复制一整段 `[data-theme='xxx'] { ... }`,改掉颜色
2. 在 `content.js` 的 `SITE_THEMES` 里加一项:
   ```js
   { id:'xxx', name:'中文名', label:'ENGLISH NAME', desc:'一句话描述' }
   ```
3. 如果这套主题要配自己的大背景场景,去 `scripts/backdrops.js` 的 `SCENES` 里加一个场景
   (参考现有的 `CASTLE` / `BATTLE` 写法,每个场景就是 far / mid / near 三层 SVG 字符串)

---

## 四、其它常见修改

| 想改什么 | 去哪里改 |
|---|---|
| 音效开关默认值 | `content.js` → `audio.enabled` |
| 宝剑鼠标默认值 | `content.js` → `cursor.sword` |
| 骑士的台词 / 彩蛋 | `content.js` → `knight.lines` / `knight.easterEgg` |
| 骑士的造型 | `scripts/knight.js` 顶部的 `KNIGHT_SVG`(也可以整体换成 `<img>`) |
| 音效音色 | `scripts/audio.js` 里的 `SOUNDS` 配方 |
| 背景里的城堡 / 战马 / 森林 | `scripts/backdrops.js` 里对应的场景 SVG |
| 名字、座右铭 | `content.js` → `name` / `motto` |

### 换掉骑士立绘

`scripts/knight.js` 里的 `KNIGHT_SVG` 是一段内联 SVG。如果你以后弄到了精美的骑士立绘:

```js
// 把 KNIGHT_SVG 整个换成(注意要保留 class="knight"):
var KNIGHT_SVG = '<img class="knight" src="./assets/knight.png" alt="骑士" width="200">';
```

---

## 五、键盘快捷键

| 按键 | 作用 |
|---|---|
| `1` – `5` | 直接切换大背景 |
| `B` | 循环切换大背景 |
| `M` | 开 / 关音效 |
| `Esc` | 关闭主题面板 / 欢迎弹窗 |

### 分享链接参数

- `?theme=battle` —— 直接以某个大背景打开(theme 取值:`castle` `battle` `oath` `winter` `scriptorium`)
- `?nowelcome=1` —— 跳过欢迎弹窗

例如:`https://你的域名/?theme=winter` 会以"风雪归途"直接打开。

---

## 六、部署(GitHub Pages)

本站是**纯静态、无构建**的,所以不需要 GitHub Actions。

1. 把文件推到 GitHub 仓库
2. 仓库 → **Settings → Pages**
3. **Source** 选 `Deploy from a branch`,分支选 `main`,目录选 `/ (root)`
4. 等 1 分钟左右,访问 `https://<用户名>.github.io/<仓库名>/`

### 更新网站

```powershell
cd D:\网站
git add -A
git commit -m "更新内容"
git push
```

推送后 1 分钟左右线上就会更新。

> ⚠️ 注意:本站所有路径都写成**相对路径**(`./styles/...`),
> 所以无论放在 `xxx.github.io/` 还是 `xxx.github.io/仓库名/` 都不会挂,不用改任何东西。

---

## 七、浏览器支持与注意事项

- 目标浏览器:Chrome / Edge 111+(用到了 `@property`、`backdrop-filter`、SVG 滤镜)
- **音效默认关闭** —— 这是浏览器规则(禁止自动播放),必须在用户点过页面之后才能出声。
  欢迎弹窗的"确定"按钮正好充当这个手势。
- 页面上有**音效开关**和**宝剑鼠标开关**(右上角),选择会记在浏览器里。
- 尊重系统的"减少动画"设置(`prefers-reduced-motion`),开启后会自动关掉视差、粒子和背景动画。
- 手机上会自动降级:粒子减少、关视差、不启用宝剑鼠标。
- 无 JavaScript 时页面会显示提示(内容由 JS 渲染)。

---

## 八、第三方资源与授权

| 资源 | 用途 | 授权 |
|---|---|---|
| **Cinzel / Cinzel Decorative** | 英文衬线标题字体 | SIL Open Font License 1.1(可免费商用) |
| 中文正文 | 使用系统字体(宋体 / 思源宋体等),未内嵌 | — |

除此之外**没有任何第三方依赖**:没有 npm 包、没有 CDN、没有外部图片或音频。
背景纹理是 SVG 滤镜生成的,骑士和场景是手写 SVG,音效是 Web Audio 实时合成的。

---

## 九、文件结构

```
网站/
├── index.html            页面骨架(基本不用动)
├── content.js        ★   所有文案 / 分区 / 链接 / 主题列表
├── styles/
│   ├── tokens.css    ★   五套主题的配色变量
│   └── main.css          布局与组件样式
├── scripts/
│   ├── audio.js          Web Audio 音效合成
│   ├── backdrops.js      五套大背景场景
│   ├── knight.js         骑士 SVG 与交互
│   ├── cursor.js         宝剑鼠标
│   ├── effects.js        滚动揭示 / 视差 / 粒子 / 卡片倾斜
│   ├── render.js         把 content.js 渲染成页面
│   └── app.js            启动器(主题切换 / 弹窗 / 快捷键)
├── assets/
│   ├── favicon.svg       站点图标
│   └── fonts/            自托管的 Cinzel 字体
└── README.md             就是本文件
```
