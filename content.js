/* ═══════════════════════════════════════════════════════════════════════════
   content.js —— 【你以后只改这个文件就够了】
   ---------------------------------------------------------------------------
   这里存放网站的全部文字、分区、链接、主题。改文案 / 加分区 / 换链接,
   都只动这一个文件,不需要碰 HTML 或 CSS。

   ── 怎么加一个新分区?─────────────────────────────────────────────
   在 SITE_CONTENT.sections 数组里复制一个 { ... } 块,改掉 id / title / blocks
   即可。id 必须唯一。页面会自动多出这个分区 + 左侧导航点。

   ── blocks 里能放什么?(共 6 种,可自由组合、可放多个)──────────────
     { type:'profile',  ... }  个人名册(头像/简介/标签)
     { type:'text',     body } 一段富文本(支持 HTML 标签)
     { type:'stats',    items:[{name,value,note}] }        进度条,value 是 0-100
     { type:'cards',    items:[{title,kind,desc,url,tag}] } 卡片墙
     { type:'timeline', items:[{date,title,desc}] }        时间线
     { type:'links',    items:[{label,value,url}] }        链接列表
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

  /* 骑士:站在"骑士名册"分区旁边。点击他会说话、会行礼。 */
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

    /* ══════════ 1. 骑士名册 —— 个人信息 ══════════ */
    {
      id: 'roll',
      title: '骑士名册',
      label: 'THE ROLL',
      accent: 'gold',
      nav: '名册',
      blocks: [
        {
          type: 'profile',
          name: 'linlxzx',
          title: '旅人 · 开发者 · 终身学徒',
          bio: [
            '你好,我是 <b>linlxzx</b>。白天写代码,傍晚练铁,深夜读书。',
            '相信一件事:所有值得的东西,都得一锤一锤敲出来。'
          ],
          tags: ['前端', '健身', '爱读书', '折腾工具', '夜猫子'],
          meta: [
            { k: '所在', v: '某座不起眼的城' },
            { k: '状态', v: '在路上' },
            { k: '誓言', v: '每天都在变强一点点' }
          ]
        }
      ]
    },

    /* ══════════ 2. 铸剑录 —— 作品 / 项目 ══════════ */
    {
      id: 'forge',
      title: '铸剑录',
      label: 'THE FORGE',
      accent: 'steel',
      nav: '铸剑',
      blocks: [
        {
          type: 'text',
          body: '每一行代码都是一次淬火。这里陈列着我锻造过的东西 —— 有的是利器,有的只是练习用的铁片。'
        },
        {
          type: 'cards',
          items: [
            { title: '本站 · 旅行者的空间', kind: 'Web', tag: '进行中', desc: '纯手写 HTML/CSS/JS,零框架零依赖,含程序化生成的五套大背景与 Web Audio 合成音效。', url: '' },
            { title: '项目二', kind: 'App',  tag: '已完成', desc: '替换成你的项目描述。点这里可以把 url 填上,卡片就会变成可点击的链接。', url: '' },
            { title: '项目三', kind: '工具', tag: '已完成', desc: '写清楚它解决什么问题、你用了什么技术。', url: '' },
            { title: '项目四', kind: '实验', tag: '搁置',   desc: '半途而废的想法也值得记录 —— 它们证明你曾经想过。', url: '' }
          ]
        }
      ]
    },

    /* ══════════ 3. 练兵场 —— 健身 ══════════ */
    {
      id: 'training',
      title: '练兵场',
      label: 'TRAINING GROUNDS',
      accent: 'blood',
      nav: '练兵',
      blocks: [
        { type: 'text', body: '身体是唯一的坐骑。它倒了,你哪儿也去不了。' },
        {
          type: 'stats',
          items: [
            { name: '力量训练', value: 72, note: '每周 4 练 · 深蹲/卧推/硬拉' },
            { name: '跑步',     value: 55, note: '累计 240 km · 目标 500 km' },
            { name: '睡眠',     value: 68, note: '平均 7 小时 10 分' },
            { name: '饮食自律', value: 80, note: '日均蛋白 140 g' }
          ]
        },
        {
          type: 'timeline',
          items: [
            { date: '最近', title: '硬拉突破 1.5 倍体重', desc: '比数字更重要的是:腰没有疼。' },
            { date: '上个月', title: '开始每周固定跑两次', desc: '从"跑不动"到"能跑 5 公里不停"。' }
          ]
        }
      ]
    },

    /* ══════════ 4. 藏书阁 —— 学习 ══════════ */
    {
      id: 'scriptorium',
      title: '藏书阁',
      label: 'THE SCRIPTORIUM',
      accent: 'gold',
      nav: '藏书',
      blocks: [
        { type: 'text', body: '抄书的人最懂书。这里是我正在抄写的卷册 —— 学在手上的,才算真学过。' },
        {
          type: 'stats',
          items: [
            { name: 'JavaScript / TypeScript', value: 78, note: '正在深挖性能与工程化' },
            { name: 'CSS 与动效',               value: 70, note: '布局、动画、可访问性' },
            { name: '数据结构与算法',           value: 45, note: '最薄弱的一环,在补' },
            { name: '英语阅读',                 value: 62, note: '读文档不再靠翻译' }
          ]
        },
        {
          type: 'timeline',
          items: [
            { date: '在读', title: '《你当像鸟飞往你的山》', desc: '关于教育与自我救赎。' },
            { date: '在读', title: '《代码整洁之道》',       desc: '第二次读,这次做笔记。' },
            { date: '已读完', title: '《人类简史》',         desc: '读完最大的感受:故事比事实更有力量。' }
          ]
        }
      ]
    },

    /* ══════════ 5. 宝物库 —— 推荐 ══════════ */
    {
      id: 'treasury',
      title: '宝物库',
      label: 'THE TREASURY',
      accent: 'moss',
      nav: '宝物',
      blocks: [
        { type: 'text', body: '这些东西我亲自用过、读过、听过,觉得值得放在这里。不是广告。' },
        {
          type: 'cards',
          items: [
            { title: '一本书',   kind: '阅读', tag: '力荐', desc: '替换成你真正想推荐的书,并写一句为什么。', url: '' },
            { title: '一部电影', kind: '影像', tag: '力荐', desc: '写清楚它哪一点打动你。', url: '' },
            { title: '一首歌',   kind: '音乐', tag: '单曲循环', desc: '音乐推荐最好附上链接。', url: '' },
            { title: '一个工具', kind: '工具', tag: '效率', desc: '写清楚它替你省下了什么。', url: '' },
            { title: '一门课',   kind: '课程', tag: '值得', desc: '适合什么阶段的人看。', url: '' },
            { title: '一个网站', kind: '网站', tag: '常逛', desc: '你为什么反复回到这里。', url: '' }
          ]
        }
      ]
    },

    /* ══════════ 6. 悬赏榜 —— 目标与计划 ══════════ */
    {
      id: 'bounty',
      title: '悬赏榜',
      label: 'BOUNTY BOARD',
      accent: 'blood',
      nav: '悬赏',
      blocks: [
        { type: 'text', body: '贴在酒馆墙上的告示 —— 接了就得做完。' },
        {
          type: 'cards',
          items: [
            { title: '把这个网站长期维护下去', kind: '长期', tag: '进行中', desc: '至少每月更新一次内容。', url: '' },
            { title: '把算法这块补上',         kind: '学习', tag: '进行中', desc: '刷完 200 道题,并写下复盘。', url: '' },
            { title: '跑一次半程马拉松',       kind: '身体', tag: '计划中', desc: '先能连续跑 10 公里再说。', url: '' },
            { title: '读 24 本书',             kind: '阅读', tag: '计划中', desc: '一个月两本,不算贪心。', url: '' }
          ]
        }
      ]
    },

    /* ══════════ 7. 旅人日志 —— 随笔 ══════════ */
    {
      id: 'journal',
      title: '旅人日志',
      label: 'TRAVEL JOURNAL',
      accent: 'steel',
      nav: '日志',
      blocks: [
        {
          type: 'timeline',
          items: [
            { date: '今天',   title: '开张', desc: '给自己的空间搭了第一块石头。没有框架,没有依赖,只有 HTML、CSS 和 JavaScript。' },
            { date: '前几天', title: '关于"够用就好"', desc: '花时间打磨细节,和花时间堆功能,是两种人生。我选前者。' },
            { date: '上个月', title: '重新开始跑步', desc: '第一次跑完 3 公里没有停。原来身体比想象中听话。' }
          ]
        }
      ]
    },

    /* ══════════ 8. 信鸦 —— 联系方式 ══════════ */
    {
      id: 'raven',
      title: '信鸦',
      label: 'SEND A RAVEN',
      accent: 'gold',
      nav: '信鸦',
      blocks: [
        { type: 'text', body: '放一只信鸦过来,我多半会回。' },
        {
          type: 'links',
          items: [
            { label: 'GitHub', value: '@x1234567890236', url: 'https://github.com/x1234567890236' },
            { label: '邮箱',   value: '407207915@qq.com', url: 'mailto:407207915@qq.com' },
            { label: '微信',   value: '替换成你的微信号', url: '' }
          ]
        }
      ]
    }

  ]
};
