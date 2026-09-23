/* ═══════════════════════════════════════════════════════════════════════════
   backdrops.js —— 五套"大背景"场景(全部程序化生成,零图片依赖)
   ---------------------------------------------------------------------------
   每套场景由四层组成:
     sky   天空渐变的底(颜色由 tokens.css 的 --bd-sky-* 决定)
     far   远景剪影(山、城堡、森林)
     mid   中景剪影(骑士、书架、拱窗)
     near  近景剪影(地面、岩石、桌面)
     fx    Canvas 动画层(浮尘 / 火星 / 飘雪 / 火花)
   想改场景:改下面 SCENES 里对应那一个的 svg 字符串即可。
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var LZ = (window.LZ = window.LZ || {});

  var elSky, elFar, elMid, elNear, elGrade;
  var cv, cx;
  var W = 0, H = 0, dpr = 1;
  var parts = [];
  var current = 'castle';
  var raf = null, last = 0, tAcc = 0;
  var reduced = false, mobile = false;

  /* ═══════════════ 场景定义 ═══════════════ */

  /* —— 通用:把 svg 包成满屏自适应的一层 —— */
  function layer(inner, cls) {
    return '<svg class="scene ' + (cls || '') + '" viewBox="0 0 1600 900" ' +
           'preserveAspectRatio="xMidYMax slice" aria-hidden="true">' + inner + '</svg>';
  }

  /* ── 主题 1:城堡之外 · 黄昏 ───────────────────────────── */
  var CASTLE = {
    far: layer(
      // 远山
      '<path d="M0 620 L150 452 L268 556 L420 396 L556 528 L706 430 L846 556 L1010 404 L1174 540 L1330 452 L1460 548 L1600 470 L1600 900 L0 900Z" fill="var(--bd-far)"/>' +
      // 山坡
      '<path d="M0 700 C 240 646, 430 682, 640 660 C 880 636, 1120 686, 1600 648 L1600 900 L0 900Z" fill="var(--bd-mid)" opacity="0.85"/>' +
      // 城堡:尖顶塔楼 + 城墙垛口 —— 一眼能认出是城堡
      '<g fill="var(--bd-near)">' +
        // 左右塔楼 + 圆锥顶
        '<rect x="656" y="506" width="48" height="152"/>' +
        '<path d="M650 508 L680 438 L710 508 Z"/>' +
        '<rect x="896" y="506" width="48" height="152"/>' +
        '<path d="M890 508 L920 438 L950 508 Z"/>' +
        // 中央主楼 + 圆锥顶
        '<rect x="762" y="474" width="76" height="184"/>' +
        '<path d="M750 476 L800 384 L850 476 Z"/>' +
        // 城墙
        '<rect x="684" y="566" width="232" height="92"/>' +
        // 城墙垛口
        '<rect x="684" y="552" width="13" height="16"/><rect x="710" y="552" width="13" height="16"/>' +
        '<rect x="736" y="552" width="13" height="16"/><rect x="762" y="552" width="13" height="16"/>' +
        '<rect x="788" y="552" width="13" height="16"/><rect x="814" y="552" width="13" height="16"/>' +
        '<rect x="840" y="552" width="13" height="16"/><rect x="866" y="552" width="13" height="16"/>' +
        '<rect x="892" y="552" width="13" height="16"/>' +
      '</g>' +
      // 城门洞
      '<path d="M782 658 L782 614 C 782 600, 796 590, 809 590 C 822 590, 836 600, 836 614 L836 658 Z" fill="#07050b"/>' +
      // 窗里的灯火
      '<g fill="var(--bd-ember)" opacity="0.95">' +
        '<rect class="lit lit--a" x="772" y="502" width="8" height="13" rx="3"/>' +
        '<rect class="lit lit--b" x="820" y="502" width="8" height="13" rx="3"/>' +
        '<rect class="lit lit--c" x="670" y="542" width="7" height="12" rx="3"/>' +
        '<rect class="lit lit--d" x="912" y="542" width="7" height="12" rx="3"/>' +
        '<rect class="lit lit--e" x="704" y="602" width="7" height="12" rx="3"/>' +
        '<rect class="lit lit--f" x="878" y="602" width="7" height="12" rx="3"/>' +
        '<rect class="lit lit--g" x="796" y="536" width="7" height="12" rx="3"/>' +
      '</g>' +
      // 旗帜
      '<g class="banners">' +
        '<g class="banner banner--a"><rect x="798" y="330" width="2.4" height="52" fill="#241a12"/><path d="M800 334 L832 345 L800 356 Z" fill="var(--c-accent)"/></g>' +
        '<g class="banner banner--b"><rect x="678" y="388" width="2.2" height="48" fill="#241a12"/><path d="M680 392 L708 401 L680 410 Z" fill="var(--c-accent-2)"/></g>' +
        '<g class="banner banner--c"><rect x="918" y="388" width="2.2" height="48" fill="#241a12"/><path d="M920 392 L948 401 L920 410 Z" fill="var(--c-accent-2)"/></g>' +
      '</g>',
      'scene--far'
    ),
    mid: layer(
      '<path d="M0 792 C 300 742, 540 796, 830 762 C 1120 728, 1340 786, 1600 750 L1600 900 L0 900Z" fill="var(--bd-near)" opacity="0.94"/>',
      'scene--mid'
    ),
    near: layer(
      '<path d="M0 900 L0 840 C 190 812, 320 850, 470 836 L520 900 Z" fill="#0a0710"/>' +
      '<path d="M1600 900 L1600 828 C 1420 806, 1290 846, 1150 834 L1090 900 Z" fill="#0a0710"/>',
      'scene--near'
    ),
    particles: 'ember',
    emberRate: 0.55
  };

  /* ── 主题 2:战场 · 两骑对冲 ───────────────────────────── */
  /* 一匹朝右的战马 + 骑手(本地坐标 x ≈ 8..322,地面 y = 150)
     用"组件拼装"而不是一条手绘大路径 —— 形状更可控、更像马。 */
  function mount(color, cloth, ember) {
    return '' +
      /* 马尾 */
      '<path d="M46 58 C 22 60, 8 80, 12 108 C 18 86, 30 70, 48 66 Z" fill="' + color + '"/>' +
      /* 远侧两腿(稍暗) */
      '<rect x="62" y="86" width="11" height="58" rx="5.5" fill="' + color + '" opacity="0.66"/>' +
      '<rect x="150" y="86" width="11" height="58" rx="5.5" fill="' + color + '" opacity="0.66"/>' +
      /* 臀 / 身 / 胸 */
      '<ellipse cx="64" cy="76" rx="27" ry="26" fill="' + color + '"/>' +
      '<ellipse cx="108" cy="74" rx="54" ry="26" fill="' + color + '"/>' +
      '<ellipse cx="154" cy="74" rx="22" ry="25" fill="' + color + '"/>' +
      /* 近侧两腿 + 四只蹄 */
      '<rect x="76" y="88" width="13" height="58" rx="6.5" fill="' + color + '"/>' +
      '<rect x="164" y="88" width="13" height="58" rx="6.5" fill="' + color + '"/>' +
      '<rect x="75" y="140" width="15" height="10" rx="4" fill="' + color + '"/>' +
      '<rect x="163" y="140" width="15" height="10" rx="4" fill="' + color + '"/>' +
      '<rect x="61" y="138" width="13" height="10" rx="4" fill="' + color + '" opacity="0.66"/>' +
      '<rect x="149" y="138" width="13" height="10" rx="4" fill="' + color + '" opacity="0.66"/>' +
      /* 脖子 */
      '<path d="M148 62 C 154 40, 166 24, 182 15 L 202 31 C 188 41, 176 55, 170 76 Z" fill="' + color + '"/>' +
      /* 鬃毛 */
      '<path d="M150 58 C 156 35, 168 19, 186 11 L 192 22 C 176 30, 166 44, 162 64 Z" fill="' + color + '"/>' +
      /* 头 + 吻部 */
      '<path d="M180 12 C 189 5, 199 7, 203 15 L 214 35 C 216 41, 212 46, 206 44 L 185 35 Z" fill="' + color + '"/>' +
      /* 双耳 */
      '<path d="M186 13 L181 -3 L192 9 Z" fill="' + color + '"/>' +
      '<path d="M196 11 L195 -5 L204 9 Z" fill="' + color + '"/>' +
      '<circle cx="196" cy="19" r="2.3" fill="' + ember + '" opacity="0.9"/>' +
      /* 马衣 */
      '<path d="M84 52 L146 52 L152 82 L78 82 Z" fill="' + cloth + '" opacity="0.78"/>' +
      /* 骑手腿 */
      '<path d="M116 44 C 131 48, 141 62, 141 82 L 127 82 C 127 67, 123 54, 113 50 Z" fill="' + color + '"/>' +
      /* 躯干 */
      '<path d="M88 50 C 88 30, 99 16, 113 16 C 127 16, 138 30, 138 50 L 136 62 L 90 62 Z" fill="' + color + '"/>' +
      /* 头盔 + 面甲缝 */
      '<path d="M95 17 C 95 1, 104 -8, 113 -8 C 122 -8, 132 1, 132 17 Z" fill="' + color + '"/>' +
      '<rect x="104" y="3" width="21" height="5" rx="2.5" fill="' + ember + '"/>' +
      /* 盔缨 */
      '<path d="M108 -10 C 98 -22, 103 -34, 122 -38 C 113 -23, 120 -13, 132 -8 Z" fill="' + cloth + '"/>' +
      /* 盾 */
      '<path d="M136 30 C 136 21, 147 16, 157 18 L 157 62 C 147 65, 136 50, 136 30 Z" fill="' + cloth + '"/>' +
      '<path d="M147 28 L150 39 L161 42 L150 45 L147 56 L144 45 L133 42 L144 39 Z" fill="rgba(245,233,205,.86)"/>' +
      /* 长枪 + 枪旗 */
      '<rect x="146" y="30" width="152" height="6" rx="3" fill="' + color + '"/>' +
      '<path d="M298 24 L322 33 L298 42 Z" fill="' + cloth + '"/>' +
      '<path d="M188 26 L232 16 L226 30 L190 36 Z" fill="' + cloth + '" opacity="0.85"/>';
  }

  /* 效忠之誓:两个按人形比例重画的小人(比之前小得多) */
  function oathLord(color, cloth) {
    return '' +
      /* 长袍 */
      '<path d="M14 132 L14 46 C 14 30, 24 20, 38 20 C 52 20, 62 30, 62 46 L 62 132 Z" fill="' + color + '"/>' +
      /* 披风 */
      '<path d="M10 46 C 10 32, 21 22, 38 22 C 55 22, 66 32, 66 46 L 62 58 L 14 58 Z" fill="' + cloth + '" opacity="0.9"/>' +
      /* 头 + 王冠 */
      '<circle cx="38" cy="10" r="11" fill="' + color + '"/>' +
      '<path d="M27 -2 L31 6 L38 -3 L45 6 L49 -2 L49 3 L27 3 Z" fill="' + cloth + '"/>' +
      /* 前伸持剑的手臂 */
      '<path d="M60 44 L104 34 L104 47 L60 57 Z" fill="' + color + '"/>';
  }

  function oathKnight(color, cloth) {
    return '' +
      /* 跪姿身躯 */
      '<path d="M26 26 C 26 18, 33 13, 42 13 L 58 13 C 68 13, 75 21, 75 31 L 80 82 L 6 82 C 6 60, 13 40, 26 26 Z" fill="' + color + '"/>' +
      /* 俯首的头 */
      '<circle cx="52" cy="5" r="11" fill="' + color + '"/>' +
      /* 垂下的披肩 */
      '<path d="M22 34 L48 30 L50 42 L24 46 Z" fill="' + cloth + '" opacity="0.85"/>';
  }

  var BATTLE = {
    far: layer(
      '<path d="M0 640 L180 500 L330 590 L500 452 L660 574 L820 470 L980 588 L1160 462 L1330 580 L1480 500 L1600 596 L1600 900 L0 900Z" fill="var(--bd-far)"/>' +
      // 远处的烽火列柱
      '<g opacity="0.55">' +
        '<path d="M250 470 C 246 420, 240 360, 246 300" stroke="var(--bd-far)" stroke-width="26" fill="none" opacity="0.5"/>' +
        '<path d="M1240 452 C 1236 402, 1230 342, 1236 282" stroke="var(--bd-far)" stroke-width="30" fill="none" opacity="0.45"/>' +
        '<path d="M1420 500 C 1416 450, 1410 390, 1416 330" stroke="var(--bd-far)" stroke-width="24" fill="none" opacity="0.4"/>' +
      '</g>' +
      // 地平线火光
      '<ellipse cx="820" cy="700" rx="900" ry="180" fill="var(--bd-ember)" opacity="0.14"/>',
      'scene--far'
    ),
    mid: layer(
      // 两骑对冲 + 兵器交击的火花
      '<g class="duel">' +
        '<g class="duel__l"><g transform="translate(419,695) scale(0.78)">' +
          mount('var(--bd-near)', 'var(--c-accent-2)', 'var(--bd-ember)') +
        '</g></g>' +
        '<g class="duel__r"><g transform="translate(1181,695) scale(-0.78,0.78)">' +
          mount('var(--bd-near)', 'var(--c-accent-2)', 'var(--bd-ember)') +
        '</g></g>' +
        '<g class="duel__spark" transform="translate(800,718)">' +
          '<circle r="46" fill="var(--bd-ember)" opacity="0.45"/>' +
          '<circle r="20" fill="#fff3d6" opacity="0.85"/>' +
          '<path d="M0 -58 L4 -10 L58 0 L4 10 L0 58 L-4 10 L-58 0 L-4 -10 Z" fill="#fff6df" opacity="0.75"/>' +
        '</g>' +
      '</g>',
      'scene--mid'
    ),
    near: layer(
      // 地面与插在地上的枪林
      '<path d="M0 900 L0 848 C 320 816, 640 852, 960 830 C 1240 810, 1420 846, 1600 828 L1600 900 Z" fill="#0a0404"/>' +
      '<g stroke="#160808" stroke-width="7" stroke-linecap="round" opacity="0.95">' +
        '<path d="M120 900 L146 742"/><path d="M232 900 L214 762"/><path d="M1420 900 L1400 752"/><path d="M1520 900 L1548 766"/>' +
      '</g>' +
      '<g fill="#231010" opacity="0.9">' +
        '<path d="M146 742 L156 712 L138 730 Z"/><path d="M214 762 L226 734 L206 750 Z"/>' +
        '<path d="M1400 752 L1390 722 L1410 740 Z"/><path d="M1548 766 L1560 738 L1540 754 Z"/>' +
      '</g>',
      'scene--near'
    ),
    particles: 'spark',
    emberRate: 1.35
  };

  /* ── 主题 3:效忠之誓 · 教堂(优先用公有领域画作) ─────────── */
  var OATH_FALLBACK = {
    far: layer(
      // 拱窗透光
      '<g opacity="0.9">' +
        '<path d="M520 900 L520 430 C 520 340, 590 292, 660 292 C 730 292, 800 340, 800 430 L800 900 Z" fill="var(--bd-far)" opacity="0.55"/>' +
        '<path d="M880 900 L880 470 C 880 392, 938 352, 998 352 C 1058 352, 1116 392, 1116 470 L1116 900 Z" fill="var(--bd-far)" opacity="0.42"/>' +
        '<path d="M600 900 L600 452 C 600 380, 648 344, 700 344 C 752 344, 800 380, 800 452 L800 900 Z" fill="var(--bd-ember)" opacity="0.10"/>' +
        '<path d="M928 900 L928 486 C 928 424, 966 396, 1008 396 C 1050 396, 1088 424, 1088 486 L1088 900 Z" fill="var(--bd-ember)" opacity="0.08"/>' +
      '</g>' +
      // 立柱
      '<g fill="var(--bd-mid)">' +
        '<rect x="440" y="360" width="52" height="540"/>' +
        '<rect x="424" y="330" width="84" height="34"/>' +
        '<rect x="1120" y="360" width="52" height="540"/>' +
        '<rect x="1104" y="330" width="84" height="34"/>' +
      '</g>',
      'scene--far'
    ),
    mid: layer(
      // 授勋场景:左为持剑的领主,右为跪地受剑的骑士(缩到正常人身比例)
      '<g class="oath-figures">' +
        '<g transform="translate(596,720)">' + oathLord('var(--bd-near)', 'var(--c-accent)') + '</g>' +
        '<g transform="translate(792,770)">' + oathKnight('var(--bd-near)', 'var(--c-accent-2)') + '</g>' +
      '</g>' +
      // 剑:剑身搭在跪者肩上
      '<g class="oath-sword">' +
        '<path d="M700 756 L824 784" stroke="#e9e3d0" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M704 742 L714 770" stroke="var(--c-accent)" stroke-width="8" stroke-linecap="round"/>' +
        '<circle cx="702" cy="738" r="6" fill="var(--c-accent)"/>' +
      '</g>',
      'scene--mid'
    ),
    near: layer(
      '<path d="M0 900 L0 852 C 400 826, 900 858, 1600 838 L1600 900 Z" fill="#05070d"/>' +
      // 地面烛台(提亮,免得烛火看着是悬空的)
      '<g fill="#2a3350">' +
        '<rect x="296" y="812" width="10" height="66"/><rect x="272" y="866" width="58" height="12" rx="4"/>' +
        '<rect x="1306" y="804" width="10" height="72"/><rect x="1282" y="864" width="58" height="12" rx="4"/>' +
      '</g>' +
      '<g fill="#42507a" opacity="0.8">' +
        '<rect x="288" y="806" width="26" height="10" rx="5"/><rect x="1298" y="798" width="26" height="10" rx="5"/>' +
      '</g>' +
      '<g fill="var(--bd-ember)"><ellipse cx="301" cy="792" rx="8" ry="17"/><ellipse cx="1311" cy="784" rx="8" ry="18"/></g>' +
      '<g fill="#fff6d8" opacity="0.85"><ellipse cx="301" cy="796" rx="4" ry="10"/><ellipse cx="1311" cy="788" rx="4" ry="11"/></g>',
      'scene--near'
    ),
    particles: 'feather',
    emberRate: 0.35
  };

  /* ── 主题 4:风雪归途 ─────────────────────────────────── */
  var WINTER = {
    far: layer(
      '<path d="M0 600 L210 380 L360 512 L560 322 L740 504 L940 356 L1140 520 L1330 400 L1480 520 L1600 430 L1600 900 L0 900Z" fill="var(--bd-far)"/>' +
      '<path d="M0 660 L240 560 L420 640 L640 540 L880 646 L1100 556 L1320 650 L1600 566 L1600 900 L0 900Z" fill="var(--bd-mid)" opacity="0.8"/>',
      'scene--far'
    ),
    mid: layer(
      // 松林
      (function () {
        var s = '';
        for (var i = 0; i < 26; i++) {
          var x = 30 + i * 62 + (i % 3) * 14;
          var h = 150 + (i % 5) * 34;
          var base = 900 - (i % 4) * 16;
          s += '<path d="M' + x + ' ' + (base - h) + ' L' + (x + 30) + ' ' + (base - h * 0.34) +
               ' L' + (x + 12) + ' ' + (base - h * 0.34) + ' L' + (x + 40) + ' ' + (base - h * 0.06) +
               ' L' + (x + 16) + ' ' + (base - h * 0.06) + ' L' + (x + 52) + ' ' + base +
               ' L' + (x - 52) + ' ' + base + ' L' + (x - 16) + ' ' + (base - h * 0.06) +
               ' L' + (x - 40) + ' ' + (base - h * 0.06) + ' L' + (x - 12) + ' ' + (base - h * 0.34) +
               ' L' + (x - 30) + ' ' + (base - h * 0.34) + ' Z" fill="var(--bd-mid)"/>';
        }
        return '<g opacity="0.92">' + s + '</g>';
      })(),
      'scene--mid'
    ),
    near: layer(
      '<path d="M0 900 L0 826 C 420 800, 900 840, 1600 810 L1600 900 Z" fill="#0a121c"/>' +
      // 雪地起伏
      '<path d="M0 900 L0 866 C 300 850, 700 878, 1100 862 C 1300 854, 1460 868, 1600 860 L1600 900 Z" fill="#101d2b" opacity="0.9"/>' +
      // 孤骑(用与战场同一匹马的组件,缩小)
      '<g class="lone">' +
        '<g transform="translate(980,750) scale(0.6)">' +
          mount('#060c14', 'var(--c-accent-3)', 'var(--c-accent)') +
        '</g>' +
      '</g>',
      'scene--near'
    ),
    particles: 'snow',
    emberRate: 0
  };

  /* ── 主题 5:藏书阁 · 烛火 ─────────────────────────────── */
  var SCRIPTORIUM = {
    far: layer(
      // 拱窗
      '<g opacity="0.85">' +
        '<path d="M180 900 L180 400 C 180 314, 244 268, 310 268 C 376 268, 440 314, 440 400 L440 900 Z" fill="var(--bd-far)"/>' +
        '<path d="M200 900 L200 408 C 200 332, 252 292, 310 292 C 368 292, 420 332, 420 408 L420 900 Z" fill="var(--bd-ember)" opacity="0.12"/>' +
        '<path d="M1160 900 L1160 400 C 1160 314, 1224 268, 1290 268 C 1356 268, 1420 314, 1420 400 L1420 900 Z" fill="var(--bd-far)"/>' +
        '<path d="M1180 900 L1180 408 C 1180 332, 1232 292, 1290 292 C 1348 292, 1400 332, 1400 408 L1400 900 Z" fill="var(--bd-ember)" opacity="0.12"/>' +
      '</g>',
      'scene--far'
    ),
    mid: layer(
      // 书架
      '<g fill="var(--bd-mid)">' +
        '<rect x="470" y="330" width="240" height="570"/>' +
        '<rect x="890" y="330" width="240" height="570"/>' +
      '</g>' +
      // 书架上的书脊
      (function () {
        var s = '';
        for (var i = 0; i < 26; i++) {
          var bx = 484 + (i % 9) * 25;
          var by = 350 + Math.floor(i / 9) * 92;
          var bh = 62 - (i % 3) * 8;
          s += '<rect x="' + bx + '" y="' + by + '" width="' + (16 + (i % 3) * 3) + '" height="' + bh +
               '" fill="' + (i % 4 === 0 ? 'var(--c-accent-2)' : 'var(--bd-near)') + '" opacity="' + (0.5 + (i % 3) * 0.16) + '"/>';
        }
        for (var j = 0; j < 26; j++) {
          var cx2 = 904 + (j % 9) * 25;
          var cy2 = 350 + Math.floor(j / 9) * 92;
          var ch2 = 62 - (j % 4) * 7;
          s += '<rect x="' + cx2 + '" y="' + cy2 + '" width="' + (16 + (j % 3) * 3) + '" height="' + ch2 +
               '" fill="' + (j % 5 === 0 ? 'var(--c-accent)' : 'var(--bd-near)') + '" opacity="' + (0.45 + (j % 3) * 0.16) + '"/>';
        }
        return '<g>' + s + '</g>';
      })(),
      'scene--mid'
    ),
    near: layer(
      // 桌面 + 烛台 + 摊开的书
      '<path d="M0 900 L0 812 C 500 786, 1100 818, 1600 792 L1600 900 Z" fill="#100a04"/>' +
      '<g fill="#241708">' +
        '<rect x="700" y="700" width="200" height="16" rx="3"/>' +
        '<path d="M700 716 L760 716 L742 812 L682 812 Z"/>' +
        '<path d="M900 716 L840 716 L858 812 L918 812 Z"/>' +
      '</g>' +
      // 摊开的书页
      '<path d="M712 706 L790 700 L800 760 L718 768 Z" fill="#d9c9a4" opacity="0.8"/>' +
      '<path d="M888 706 L810 700 L800 760 L882 768 Z" fill="#cbb992" opacity="0.75"/>' +
      // 烛台(提亮,免得烛火看着是悬空的)
      '<g fill="#5a3f1c">' +
        '<rect x="1126" y="646" width="13" height="82" rx="3"/>' +
        '<rect x="1094" y="722" width="78" height="14" rx="5"/>' +
        '<rect x="1118" y="726" width="30" height="8" rx="4"/>' +
        '<rect x="1120" y="604" width="25" height="44" rx="6"/>' +
      '</g>' +
      '<g fill="#8a6428" opacity="0.7"><rect x="1121" y="604" width="8" height="44" rx="4"/></g>' +
      // 烛火 + 光晕
      '<g class="flame">' +
        '<ellipse cx="1132" cy="586" rx="44" ry="48" fill="var(--bd-ember)" opacity="0.13"/>' +
        '<ellipse cx="1132" cy="584" rx="12" ry="26" fill="var(--bd-ember)"/>' +
        '<ellipse cx="1132" cy="592" rx="5.5" ry="14" fill="#fff6d8"/>' +
      '</g>',
      'scene--near'
    ),
    particles: 'dust',
    emberRate: 0.3
  };

  var SCENES = {
    castle:      CASTLE,
    battle:      BATTLE,
    oath:        OATH_FALLBACK,
    winter:      WINTER,
    scriptorium: SCRIPTORIUM
  };

  /* ═══════════════ 粒子系统 ═══════════════ */
  var P = {
    dust:    { n: 46, vx:  6, vy: -9,  size: [0.7, 1.9], life: [8, 18], sway: 14, alpha: [0.12, 0.42], glow: false },
    ember:   { n: 40, vx:  9, vy: -26, size: [0.9, 2.4], life: [3,  8],  sway: 22, alpha: [0.25, 0.85], glow: true  },
    snow:    { n: 90, vx:  6, vy:  40, size: [1.0, 3.2], life: [7, 16], sway: 30, alpha: [0.35, 0.90], glow: false },
    feather: { n: 22, vx:  7, vy:  17, size: [1.8, 4.0], life: [9, 20], sway: 42, alpha: [0.20, 0.55], glow: false },
    spark:   { n: 30, vx: 18, vy: -34, size: [0.8, 2.2], life: [2,  5],  sway: 10, alpha: [0.30, 1.00], glow: true, burst: true }
  };

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function makeParticle(kind, burstAt) {
    var cfg = P[kind] || P.dust;
    var p = {
      kind: kind, cfg: cfg,
      x: burstAt ? burstAt.x : Math.random() * W,
      y: burstAt ? burstAt.y : Math.random() * H,
      vx: rnd(-cfg.vx, cfg.vx),
      vy: burstAt ? rnd(-90, -20) : rnd(-Math.abs(cfg.vy) * 0.4, cfg.vy),
      size: rnd(cfg.size[0], cfg.size[1]),
      life: rnd(cfg.life[0], cfg.life[1]),
      age: 0,
      alpha: rnd(cfg.alpha[0], cfg.alpha[1]),
      phase: Math.random() * Math.PI * 2,
      spin: rnd(-1.6, 1.6)
    };
    if (burstAt) {
      // 爆发式:向四周飞散
      var a = Math.random() * Math.PI * 2, sp = rnd(60, 260);
      p.vx = Math.cos(a) * sp;
      p.vy = Math.sin(a) * sp - 60;
      p.size = rnd(0.7, 2.0);
      p.life = rnd(0.5, 1.25);
    }
    return p;
  }

  function targetCount() {
    var cfg = P[curKind()] || P.dust;
    var n = cfg.n;
    if (mobile) n = Math.round(n * 0.34);
    if (reduced) n = Math.round(n * 0.3);
    return n;
  }
  var _kind = 'ember';
  function curKind() { return _kind; }

  function respawn(p) {
    p.x = Math.random() * W;
    p.y = p.cfg.vy < 0 ? H + 12 : -12;
    p.vx = rnd(-p.cfg.vx, p.cfg.vx);
    p.vy = rnd(-Math.abs(p.cfg.vy) * 0.4, p.cfg.vy);
    p.age = 0;
    p.life = rnd(p.cfg.life[0], p.cfg.life[1]);
    p.alpha = rnd(p.cfg.alpha[0], p.cfg.alpha[1]);
  }

  /* 一次性爆发(宝剑点击时用) */
  var bursts = [];
  function burst(x, y, n) {
    if (reduced) return;
    n = n || 16;
    for (var i = 0; i < n; i++) bursts.push(makeParticle('spark', { x: x, y: y }));
  }

  /* 战场主题:交击时自动溅火花 */
  function autoClashSpark() {
    burst(W * 0.5, H * 0.42, mobile ? 8 : 18);
  }

  /* ═══════════════ Canvas 渲染 ═══════════════ */
  function resize() {
    if (!cv) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width  = Math.floor(W * dpr);
    cv.height = Math.floor(H * dpr);
    cv.style.width  = W + 'px';
    cv.style.height = H + 'px';
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function step(ts) {
    raf = requestAnimationFrame(step);
    if (!last) last = ts;
    var dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    tAcc += dt;

    var kind = curKind();
    var cfg = P[kind] || P.dust;
    var want = targetCount();

    // 补充常驻粒子
    if (parts.length < want) {
      if (!cfg.burst) parts.push(makeParticle(kind));
    } else if (parts.length > want) {
      parts.length = want;
    }

    cx.clearRect(0, 0, W, H);
    var col = getComputedStyle(document.documentElement).getPropertyValue('--p-color').trim() || 'rgba(255,255,255,.5)';

    // 常驻粒子
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.age += dt;
      if (p.age > p.life || p.y < -30 || p.y > H + 30) { respawn(p); continue; }
      p.x += (p.vx + Math.sin(tAcc * 0.8 + p.phase) * p.cfg.sway) * dt;
      p.y += p.vy * dt;

      var fade = 1;
      var t = p.age / p.life;
      if (t < 0.12) fade = t / 0.12;
      else if (t > 0.75) fade = (1 - t) / 0.25;

      cx.globalAlpha = Math.max(0, p.alpha * fade);
      if (p.cfg.glow) {
        cx.shadowBlur = 9;
        cx.shadowColor = col;
      } else {
        cx.shadowBlur = 0;
      }
      cx.fillStyle = col;
      cx.beginPath();
      cx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      cx.fill();
    }

    // 爆发粒子
    for (var j = bursts.length - 1; j >= 0; j--) {
      var b = bursts[j];
      b.age += dt;
      b.life -= dt;
      if (b.life <= 0) { bursts.splice(j, 1); continue; }
      b.vy += 320 * dt;          // 重力
      b.vx *= 0.965;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      cx.globalAlpha = Math.max(0, Math.min(1, b.life * 1.5));
      cx.shadowBlur = 12;
      cx.shadowColor = '#ffb457';
      cx.fillStyle = '#ffd89a';
      cx.beginPath();
      cx.arc(b.x, b.y, b.size * 1.25, 0, Math.PI * 2);
      cx.fill();
    }

    cx.globalAlpha = 1;
    cx.shadowBlur = 0;

    // 战场主题:定期交击火花
    if (kind === 'spark' && !reduced) {
      if (tAcc % 9 < dt) autoClashSpark();
    }
  }

  /* ═══════════════ 场景装配 ═══════════════ */
  function build(id) {
    var sc = SCENES[id] || SCENES.castle;
    _kind = sc.particles || 'dust';
    elFar.innerHTML  = sc.far  || '';
    elMid.innerHTML  = sc.mid  || '';
    elNear.innerHTML = sc.near || '';
    parts.length = 0;
    bursts.length = 0;

    if (id === 'oath') tryPainting();
    else clearPainting();
  }

  /* 效忠主题:尝试加载公有领域画作作为底层;失败则用程序化场景 */
  var paintingEl = null, paintingOK = null;
  function clearPainting() {
    if (paintingEl) { paintingEl.style.display = 'none'; }
  }
  function tryPainting() {
    if (paintingOK === false) return;
    if (!paintingEl) {
      paintingEl = document.createElement('div');
      paintingEl.className = 'backdrop__painting';
      paintingEl.setAttribute('aria-hidden', 'true');
      elSky.parentNode.insertBefore(paintingEl, elFar);
    }
    if (paintingOK === true) { paintingEl.style.display = ''; return; }
    var im = new Image();
    im.onload = function () {
      paintingOK = true;
      paintingEl.style.backgroundImage = 'url("./assets/oath-painting.jpg")';
      paintingEl.style.display = '';
      // 画作压暗,让前景 UI 可读
      paintingEl.style.opacity = '0.55';
    };
    im.onerror = function () {
      paintingOK = false;
      if (paintingEl) paintingEl.style.display = 'none';
    };
    im.src = './assets/oath-painting.jpg';
  }

  /* ═══════════════ 对外接口 ═══════════════ */
  LZ.backdrops = {

    init: function () {
      elSky   = document.getElementById('bd-sky');
      elFar   = document.getElementById('bd-far');
      elMid   = document.getElementById('bd-mid');
      elNear  = document.getElementById('bd-near');
      elGrade = document.getElementById('bd-grade');
      cv = document.getElementById('bd-fx');
      cx = cv.getContext('2d');

      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      mobile = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;

      resize();
      window.addEventListener('resize', resize);
      build(current);
      if (!raf) raf = requestAnimationFrame(step);
    },

    set: function (id) {
      if (!SCENES[id]) id = 'castle';
      current = id;
      build(id);
    },

    current: function () { return current; },

    /* 宝剑点击时的火花 */
    spark: function (x, y) { burst(x, y, mobile ? 10 : 20); },

    reduced: function () { return reduced; }
  };
})();
