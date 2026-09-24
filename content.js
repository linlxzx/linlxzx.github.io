/* ═══════════════════════════════════════════════════════════════════════════
   content.js —— 【你以后只改这个文件就够了】
   ---------------------------------------------------------------------------
   这里存放网站的全部文字、分区、链接、主题。改文案 / 加分区 / 换链接,
   都只动这一个文件,不需要碰 HTML 或 CSS。

   ── 页面结构(2026-09 改版)────────────────────────────────────────
     ① 骑士名册        —— 直接铺在主页上(个人信息 + 骑士)
     ② 六大篇章        —— 主页上是 2 排 × 3 个「门」,只看到标题,
                          点进去(开卷)才能看到里面的内容
     ③ 信鸦            —— 直接铺在主页上(联系方式)

   ── 哪些分区会变成「门」?──────────────────────────────────────────
   在分区里写 card: true 即可。不写 card 的会像以前一样直接铺在主页上。

   ── 门的三个专属字段 ──────────────────────────────────────────────
     icon : 门上的图标,可选 anvil / sword / book / chest / scroll / quill
     empty: 【此篇还没有内容时】显示的一句话(门上和卷册里都会显示)。
            ★ 一旦你在 blocks 里加了内容,这句话会自动消失,不用手动删。
     (可选) blurb: 门上一句话简介,与有没有内容无关,想写就写

   ── blocks 里能放什么?(共 6 种,可自由组合、可放多个)──────────────
     { type:'profile',  ... }  个人名册(头像/简介/标签)
     { type:'text',     body } 一段富文本(支持 HTML 标签)
     { type:'stats',    items:[{name,value,note}] }        进度条,value 是 0-100
     { type:'cards',    items:[{title,kind,desc,url,tag}] } 卡片墙
     { type:'timeline', items:[{date,title,desc}] }        时间线
     { type:'links',    items:[{label,value,url}] }        链接列表

   ── 每种区块的完整写法示例 ────────────────────────────────────────
     text     : { type:'text', body:'<p>随便写点什么。</p>' }
     stats    : { type:'stats', items:[
                  { name:'力量训练', value:72, note:'每周 4 练' }
                ]}
     cards    : { type:'cards', items:[
                  { title:'项目名', kind:'Web', tag:'进行中',
                    desc:'一句话说明', url:'https://...' }
                ]}
     timeline : { type:'timeline', items:[
                  { date:'今天', title:'开始做某事', desc:'补充说明' }
                ]}
     links    : { type:'links', items:[
                  { label:'GitHub', value:'@用户名', url:'https://github.com/...' }
                ]}
   ───────────────────────────────────────────────────────────────────
   例:给「练兵场」填内容(把 blocks: [] 换成下面这样,那句"校场空阔"就自动消失)
     blocks: [
       { type:'stats', items:[
           { name:'力量训练', value:72, note:'每周 4 练' },
           { name:'跑步',     value:55, note:'累计 240 km' }
       ]}
     ]
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────  五套大背景主题  ─────────────────────────
   id 必须和 styles/tokens.css 里的 [data-theme="..."] 对应。
   配色写在 tokens.css,这里只负责切换面板上显示的名字和描述。          */
window.SITE_THEMES = [
  { id: 'castle',      name: '城堡之外', label: 'CASTLE AT DUSK',      desc: '黄昏城墙,旗帜猎猎' },
  { id: 'battle',      name: '战场',     label: 'THE FIELD OF BATTLE', desc: '两骑对冲,火星四溅' },
  { id: 'oath',        name: '效忠之誓', label: 'THE OATH',            desc: '跪地受剑,一诺千金' },
  { id: 'winter',      name: '风雪归途', label: 'WINTER JOURNEY',      desc: '雪夜松林,孤骑远去' },
  { id: 'scriptorium', name: '藏书阁',   label: 'THE SCRIPTORIUM',     desc: '烛火摇曳,浮尘浮动' }
];

/* ─────────────────────────  网站内容  ───────────────────────── */
window.SITE_CONTENT = {

  name: 'linlxzx',
  motto: '剑锋所指,心之所向',
  author: 'linlxzx',

  /* 六大篇章那一块的小标题(卡片墙自身的抬头) */
  chapters: {
    title: '六大篇章',
    label: 'THE SIX CHAPTERS',
    lead: '门在此处。推开哪一扇,看你。'
  },

  /* 骑士:站在"骑士名册"旁边。点击他会说话、会行礼。 */
  knight: {
    name: '守夜人',
    lines: [
      '欢迎,旅人。',
      '此处记录着我的修行。',
      '……你点我做什么?',
      '剑是冷的,血是热的。',
      '今日的誓言,今日便守。',
      '再点下去,我可要拔剑了。',
      '风起了。该动身了,旅人。'
    ],
    /* 连点 7 次触发彩蛋 */
    easterEgg: '很好。既然你有此心 —— 拔剑吧,旅人。'
  },

  /* 音效默认关(浏览器也禁止自动播放)。第一次点"确定"时会自动打开。 */
  audio: { enabled: false, volume: 0.55 },
  /* 宝剑鼠标默认开 */
  cursor: { sword: true },

  sections: [

    /* ══════════ ① 骑士名册 —— 铺在主页上 ══════════ */
    {
      id: 'roll',
      title: '骑士名册',
      label: 'THE ROLL',
      accent: 'gold',
      nav: '名册',
      blocks: [
        {
          type: 'profile',
          name: '旅行者',
          /* creed:名字旁边那句彰显的话,会以镶金样式突出显示 */
          creed: '我来，我见，我征服',
          title: '开发者 · 终身学徒',
          bio: [
            '你好,我是<b>旅行者</b>。',
            '这里是我的落脚地 —— 慢慢看。'
          ],
          tags: ['前端', '健身', '爱读书', '折腾工具', '夜猫子'],
          meta: [
            { k: '所在', v: '某座不起眼的城' },
            { k: '状态', v: '在路上' },
            { k: '誓言', v: '“给最强者”' }
          ]
        }
      ]
    },

    /* ══════════ ② 六大篇章 —— 主页上是 2×3 的门,点进去才看得到内容 ══════════ */

    /* 2. 铸剑录 —— 作品 / 项目 */
    {
      id: 'forge',
      card: true,
      icon: 'anvil',
      title: '铸剑录',
      label: 'THE FORGE',
      accent: 'steel',
      nav: '铸剑',
      empty: '炉火已生,铁胚未上砧。',
      blocks: []
    },

    /* 3. 练兵场 —— 健身 */
    {
      id: 'training',
      card: true,
      icon: 'sword',
      title: '练兵场',
      label: 'TRAINING GROUNDS',
      accent: 'blood',
      nav: '练兵',
      empty: '校场空阔,尘未起。',
      blocks: []
    },

    /* 4. 藏书阁 —— 学习 */
    {
      id: 'scriptorium',
      card: true,
      icon: 'book',
      title: '藏书阁',
      label: 'THE SCRIPTORIUM',
      accent: 'gold',
      nav: '藏书',
      empty: '架上卷册尚空,墨迹未干。',
      blocks: []
    },

    /* 5. 宝物库 —— 推荐 */
    {
      id: 'treasury',
      card: true,
      icon: 'chest',
      title: '宝物库',
      label: 'THE TREASURY',
      accent: 'moss',
      nav: '宝物',
      empty: '宝库门开,内里无物。',
      blocks: []
    },

    /* 6. 悬赏榜 —— 目标与计划 */
    {
      id: 'bounty',
      card: true,
      icon: 'scroll',
      title: '悬赏榜',
      label: 'BOUNTY BOARD',
      accent: 'blood',
      nav: '悬赏',
      empty: '告示板上一纸未贴。',
      blocks: []
    },

    /* 7. 旅人日志 —— 随笔 */
    {
      id: 'journal',
      card: true,
      icon: 'quill',
      title: '旅人日志',
      label: 'TRAVEL JOURNAL',
      accent: 'steel',
      nav: '日志',
      empty: '羊皮卷仍是空白。',
      blocks: []
    },

    /* ══════════ ③ 信鸦 —— 铺在主页上 ══════════ */
    {
      id: 'raven',
      title: '信鸦',
      label: 'SEND A RAVEN',
      accent: 'gold',
      nav: '信鸦',
      blocks: [
        /* links 区块:填了 url 就会变成可点击的链接 */
        { type: 'links', items: [
            { label: 'GitHub', value: '@linlxzx',
              url: 'https://github.com/linlxzx' },
            { label: '邮箱',   value: '407207915@qq.com',
              url: 'mailto:407207915@qq.com' }
        ]}
      ]
    }

  ]
};
