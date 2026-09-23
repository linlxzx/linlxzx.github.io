/* ═══════════════════════════════════════════════════════════════════════════
   render.js —— 把 content.js 的数据变成页面
   ---------------------------------------------------------------------------
   你一般不需要改这个文件。加分区请改 content.js。
   只有想新增一种"区块类型"时,才需要在这里的 BLOCKS 里加一个函数。
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var LZ = (window.LZ = window.LZ || {});

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── 个人纹章(纯 SVG) ── */
  var CREST = [
    '<svg class="profile__crest" viewBox="0 0 120 142" aria-hidden="true">',
    '  <defs><linearGradient id="crest-fill" x1="0" y1="0" x2="0" y2="1">',
    '    <stop offset="0%" stop-color="var(--c-accent)" stop-opacity="0.36"/>',
    '    <stop offset="100%" stop-color="var(--c-accent-2)" stop-opacity="0.14"/>',
    '  </linearGradient></defs>',
    '  <path d="M60 8 L110 25 V73 C110 102 87 124 60 134 C33 124 10 102 10 73 V25 Z"',
    '        fill="url(#crest-fill)" stroke="currentColor" stroke-width="2.6"/>',
    '  <path d="M60 22 L106 37 V73 C106 97 86 116 60 125 C34 116 14 97 14 73 V37 Z"',
    '        fill="none" stroke="currentColor" stroke-width="1.1" opacity="0.55"/>',
    '  <path d="M60 46 L66.8 64.6 L86.5 71.4 L66.8 78.2 L60 96.8 L53.2 78.2 L33.5 71.4 L53.2 64.6 Z"',
    '        fill="currentColor" opacity="0.9"/>',
    '  <circle cx="28" cy="40" r="2.6" fill="currentColor" opacity="0.6"/>',
    '  <circle cx="92" cy="40" r="2.6" fill="currentColor" opacity="0.6"/>',
    '</svg>'
  ].join('');

  /* ═══════════════ 区块渲染器 ═══════════════ */
  var BLOCKS = {

    /* 个人名册 */
    profile: function (b) {
      var bio  = (b.bio || []).map(function (p) { return '<p>' + p + '</p>'; }).join('');
      var tags = (b.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
      var meta = (b.meta || []).map(function (m) {
        return '<div class="meta__row"><span class="meta__k">' + esc(m.k) +
               '</span><span class="meta__v">' + esc(m.v) + '</span></div>';
      }).join('');

      return '<div class="panel reveal">' +
               '<div class="profile">' +
                 '<div>' + CREST + '</div>' +
                 '<div>' +
                   '<h3 class="profile__name">' + esc(b.name || '') + '</h3>' +
                   (b.title ? '<p class="profile__title">' + esc(b.title) + '</p>' : '') +
                   '<div class="profile__bio">' + bio + '</div>' +
                   (tags ? '<div class="tags">' + tags + '</div>' : '') +
                   (meta ? '<div class="meta">' + meta + '</div>' : '') +
                 '</div>' +
                 '<div class="profile__knight"><div class="knightwrap" id="knight-slot"></div></div>' +
               '</div>' +
             '</div>';
    },

    /* 一段富文本(允许写 HTML) */
    text: function (b) {
      return '<div class="panel prose reveal">' + (b.body || '') + '</div>';
    },

    /* 进度条 */
    stats: function (b) {
      var rows = (b.items || []).map(function (s) {
        var v = Math.max(0, Math.min(100, Number(s.value) || 0));
        return '<div class="stat">' +
                 '<div class="stat__top">' +
                   '<span class="stat__name">' + esc(s.name) + '</span>' +
                   '<span class="stat__val">' + v + '%</span>' +
                 '</div>' +
                 '<div class="stat__bar"><div class="stat__fill" data-value="' + v + '"></div></div>' +
                 (s.note ? '<div class="stat__note">' + esc(s.note) + '</div>' : '') +
               '</div>';
      }).join('');
      return '<div class="panel reveal"><div class="stats">' + rows + '</div></div>';
    },

    /* 卡片墙 */
    cards: function (b) {
      var items = (b.items || []).map(function (c) {
        var head = '<div class="card__head">' +
                     (c.kind ? '<span class="card__kind">' + esc(c.kind) + '</span>' : '') +
                     (c.tag  ? '<span class="card__tag">'  + esc(c.tag)  + '</span>' : '') +
                   '</div>';
        var inner = head +
                    '<h4 class="card__title">' + esc(c.title) + '</h4>' +
                    (c.desc ? '<p class="card__desc">' + esc(c.desc) + '</p>' : '') +
                    (c.url  ? '<span class="card__more">前往 →</span>' : '');
        if (c.url) {
          return '<a class="card reveal" href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer" data-sound="hover">' + inner + '</a>';
        }
        return '<div class="card reveal">' + inner + '</div>';
      }).join('');
      return '<div class="cards">' + items + '</div>';
    },

    /* 时间线 */
    timeline: function (b) {
      var items = (b.items || []).map(function (t) {
        return '<div class="tl">' +
                 (t.date  ? '<span class="tl__date">' + esc(t.date) + '</span>' : '') +
                 '<h4 class="tl__title">' + esc(t.title) + '</h4>' +
                 (t.desc  ? '<p class="tl__desc">' + esc(t.desc) + '</p>' : '') +
               '</div>';
      }).join('');
      return '<div class="panel reveal"><div class="timeline">' + items + '</div></div>';
    },

    /* 链接列表 */
    links: function (b) {
      var items = (b.items || []).map(function (l) {
        var inner = '<span class="link__label">' + esc(l.label) + '</span>' +
                    '<span class="link__value">' + esc(l.value || '') + '</span>' +
                    (l.url ? '<span class="link__arrow" aria-hidden="true">→</span>' : '');
        if (l.url) {
          return '<a class="link reveal" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer" data-sound="hover">' + inner + '</a>';
        }
        return '<div class="link reveal">' + inner + '</div>';
      }).join('');
      return '<div class="panel reveal"><div class="links">' + items + '</div></div>';
    }
  };

  /* ═══════════════ 组装 ═══════════════ */

  function sectionHTML(sec) {
    var blocks = (sec.blocks || []).map(function (b) {
      var fn = BLOCKS[b.type];
      if (!fn) {
        // 未知类型:给出可见提示,方便你改 content.js
        return '<div class="panel reveal"><p style="color:var(--c-ink-faint)">未知区块类型:' + esc(b.type) + '</p></div>';
      }
      return fn(b);
    }).join('');

    return '<section class="section" id="' + esc(sec.id) + '"' +
             ' data-accent="' + esc(sec.accent || 'gold') + '"' +
             ' aria-labelledby="t-' + esc(sec.id) + '">' +
             '<header class="section__head reveal">' +
               '<span class="section__label">' + esc(sec.label || '') + '</span>' +
               '<h2 class="section__title" id="t-' + esc(sec.id) + '">' + esc(sec.title) + '</h2>' +
               '<div class="section__rule"></div>' +
             '</header>' +
             blocks +
           '</section>';
  }

  function navHTML(sections) {
    return sections.map(function (s) {
      var short = s.nav || String(s.title).slice(0, 2);
      return '<a class="railnav__dot" href="#' + esc(s.id) + '" data-sound="hover"' +
             ' aria-label="' + esc(s.title) + '">' +
               '<span>' + esc(short) + '</span>' +
               '<span class="railnav__tip">' + esc(s.title) + '</span>' +
             '</a>';
    }).join('');
  }

  LZ.render = {

    build: function (site) {
      var sections = site.sections || [];

      var main = document.getElementById('main');
      main.innerHTML = sections.map(sectionHTML).join('');

      var nav = document.getElementById('railnav');
      if (nav) nav.innerHTML = navHTML(sections);

      // 站名 / 页脚 / 标题
      var title = document.title;
      if (site.name) {
        document.title = site.name + ' · 旅行者的空间';
        var bn = document.querySelector('.brand__name');
        if (bn) bn.textContent = site.name;
        var fl = document.querySelector('.footer__line');
        if (fl) fl.textContent = site.name + ' · 旅行者的空间';
      }
      var mt = document.querySelector('.brand__sub');
      if (mt && site.motto) mt.setAttribute('title', site.motto);

      // 侧边导航点击 → 平滑滚动(不改变地址栏,避免 file:// 下跳动)
      if (nav) {
        nav.addEventListener('click', function (e) {
          var a = e.target.closest ? e.target.closest('.railnav__dot') : null;
          if (!a) return;
          e.preventDefault();
          if (LZ.effects) LZ.effects.goTo(a.getAttribute('href').slice(1));
        });
      }

      return main;
    }
  };
})();
