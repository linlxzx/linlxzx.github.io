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
      /* creed:名字旁边那句彰显的话(镶金突出显示) */
      var creed = b.creed ? '<p class="profile__creed"><span>' + esc(b.creed) + '</span></p>' : '';

      return '<div class="panel reveal">' +
               '<div class="profile">' +
                 '<div>' + CREST + '</div>' +
                 '<div>' +
                   '<div class="profile__namerow">' +
                     '<h3 class="profile__name">' + esc(b.name || '') + '</h3>' +
                     creed +
                   '</div>' +
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

  /* 门上的六个图标(纯描边 SVG,想换图形就改这里) */
  var ICONS = {
    anvil:  '<path d="M2 10h12.6l6.4 2.6-6.4 2.6H9.4l-2 2.2H5.2L3.4 15.2Z"/><path d="M6.2 17.4h9.4l2.2 4.6H4Z"/>',
    sword:  '<path d="M12 2.4 14.7 8v8.6H9.3V8Z"/><path d="M5.4 16.6h13.2"/><path d="M11 16.6V22h2v-5.4"/>',
    book:   '<path d="M12 6.4C10 4.9 7 4.3 3 4.3v13.8c4 0 7 .6 9 2.1 2-1.5 5-2.1 9-2.1V4.3c-4 0-7 .6-9 2.1Z"/><path d="M12 6.4v13.8"/>',
    chest:  '<path d="M3.2 10.4h17.6v9.4H3.2Z"/><path d="M3.2 10.4V8.2a4.2 4.2 0 0 1 4.2-4.2h9.2a4.2 4.2 0 0 1 4.2 4.2v2.2"/><path d="M3.2 14.2h17.6"/><path d="M10.4 12.2h3.2v4h-3.2Z"/>',
    scroll: '<path d="M5.4 3.4h13.2v17.2H5.4Z"/><path d="M8.6 7.8h6.8M8.6 11.6h6.8M8.6 15.4h4.2"/>',
    quill:  '<path d="M19.6 3.4c-6.6.6-11 4.6-13.3 10L4.6 18.4l5-1.7c5.4-2.3 9.4-6.7 10-13.3Z"/><path d="M8.2 16.2 3.6 20.8"/>'
  };

  function iconSVG(name) {
    var p = ICONS[name] || ICONS.scroll;
    return '<svg class="chapter__ico" viewBox="0 0 24 24" width="32" height="32" aria-hidden="true" ' +
           'fill="none" stroke="currentColor" stroke-width="1.45" ' +
           'stroke-linejoin="round" stroke-linecap="round">' + p + '</svg>';
  }

  /* 把分区的 blocks 渲染出来 */
  function blocksHTML(sec) {
    return (sec.blocks || []).map(function (b) {
      var fn = BLOCKS[b.type];
      if (!fn) {
        // 未知类型:给出可见提示,方便你改 content.js
        return '<div class="panel reveal"><p style="color:var(--c-ink-faint)">未知区块类型:' + esc(b.type) + '</p></div>';
      }
      return fn(b);
    }).join('');
  }

  /* 这一篇是不是空的(空 → 显示 empty 那句话) */
  function isEmpty(sec) {
    return !(sec.blocks && sec.blocks.length);
  }

  /* 「此篇尚无内容」提示 —— 一旦 blocks 里有东西,这段就不会被渲染 */
  function emptyNoteHTML(sec) {
    return '<div class="empty-note">' +
             '<span class="empty-note__mark" aria-hidden="true">✦</span>' +
             '<p class="empty-note__line">' + esc(sec.empty || '此篇尚未落笔。') + '</p>' +
             '<p class="empty-note__sub">此篇尚未落笔,待旅人续写</p>' +
           '</div>';
  }

  /* 一扇「门」 */
  function chapterHTML(sec, idx) {
    var state = isEmpty(sec)
      ? '<span class="chapter__state is-empty">' + esc(sec.empty || '此篇尚未落笔。') + '</span>'
      : '<span class="chapter__state">' + esc(sec.blurb || '已录有若干') + '</span>';

    return '<button class="chapter reveal" type="button" data-chapter="' + esc(sec.id) + '"' +
             ' data-accent="' + esc(sec.accent || 'gold') + '" data-sound="hover" aria-haspopup="dialog">' +
             '<span class="chapter__no" aria-hidden="true">' + ('0' + (idx + 1)).slice(-2) + '</span>' +
             '<span class="chapter__icon">' + iconSVG(sec.icon) + '</span>' +
             '<span class="chapter__label">' + esc(sec.label || '') + '</span>' +
             '<span class="chapter__title">' + esc(sec.title) + '</span>' +
             state +
             '<span class="chapter__enter" aria-hidden="true">开卷 →</span>' +
             '<span class="chapter__corner chapter__corner--tl" aria-hidden="true"></span>' +
             '<span class="chapter__corner chapter__corner--br" aria-hidden="true"></span>' +
           '</button>';
  }

  /* 六大篇章 —— 主页上的 2×3 卡片墙 */
  function chaptersHTML(site, cards) {
    var ch = site.chapters || {};
    return '<section class="section section--chapters" id="chapters" data-accent="gold" aria-labelledby="t-chapters">' +
             '<header class="section__head reveal">' +
               '<span class="section__label">' + esc(ch.label || 'THE CHAPTERS') + '</span>' +
               '<h2 class="section__title" id="t-chapters">' + esc(ch.title || '篇章') + '</h2>' +
               '<div class="section__rule"></div>' +
               (ch.lead ? '<p class="section__lead">' + esc(ch.lead) + '</p>' : '') +
             '</header>' +
             '<div class="chapters">' + cards.map(chapterHTML).join('') + '</div>' +
           '</section>';
  }

  /* 直接铺在主页上的分区(骑士名册 / 信鸦) */
  function sectionHTML(sec) {
    return '<section class="section" id="' + esc(sec.id) + '"' +
             ' data-accent="' + esc(sec.accent || 'gold') + '"' +
             ' aria-labelledby="t-' + esc(sec.id) + '">' +
             '<header class="section__head reveal">' +
               '<span class="section__label">' + esc(sec.label || '') + '</span>' +
               '<h2 class="section__title" id="t-' + esc(sec.id) + '">' + esc(sec.title) + '</h2>' +
               '<div class="section__rule"></div>' +
             '</header>' +
             blocksHTML(sec) +
           '</section>';
  }

  function navHTML(scrollSections) {
    return scrollSections.map(function (s) {
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
      var cards = sections.filter(function (s) { return s.card; });

      /* 主页:按原始顺序铺;走到第一个 card 分区时,把整块卡片墙插进去(只插一次) */
      var placedGrid = false;
      var html = '';
      sections.forEach(function (s) {
        if (s.card) {
          if (!placedGrid) { html += chaptersHTML(site, cards); placedGrid = true; }
        } else {
          html += sectionHTML(s);
        }
      });

      var main = document.getElementById('main');
      main.innerHTML = html;

      /* 左侧导航:只列真正能滚到的位置(卡片墙算一个入口) */
      var scrollSections = [];
      var gridAdded = false;
      sections.forEach(function (s) {
        if (s.card) {
          if (!gridAdded) {
            var ch = site.chapters || {};
            scrollSections.push({ id: 'chapters', nav: '篇章', title: ch.title || '篇章' });
            gridAdded = true;
          }
        } else {
          scrollSections.push(s);
        }
      });

      var nav = document.getElementById('railnav');
      if (nav) nav.innerHTML = navHTML(scrollSections);

      /* 站名 / 页脚 / 标题 */
      if (site.name) {
        document.title = site.name + ' · 旅行者的空间';
        var bn = document.querySelector('.brand__name');
        if (bn) bn.textContent = site.name;
        var fl = document.querySelector('.footer__line');
        if (fl) fl.textContent = site.name + ' · 旅行者的空间';
      }
      var mt = document.querySelector('.brand__sub');
      if (mt && site.motto) mt.setAttribute('title', site.motto);

      /* 侧边导航点击 → 平滑滚动(不改变地址栏,避免 file:// 下跳动) */
      if (nav) {
        nav.addEventListener('click', function (e) {
          var a = e.target.closest ? e.target.closest('.railnav__dot') : null;
          if (!a) return;
          e.preventDefault();
          if (LZ.effects) LZ.effects.goTo(a.getAttribute('href').slice(1));
        });
      }

      /* 把卡片索引交给 app.js(开卷时要用) */
      LZ.render._cards = {};
      cards.forEach(function (s) { LZ.render._cards[s.id] = s; });

      return main;
    },

    /* 取某一篇的正文(空篇 → 返回那句提示) */
    chapterBody: function (id) {
      var sec = LZ.render._cards && LZ.render._cards[id];
      if (!sec) return '';
      return isEmpty(sec) ? emptyNoteHTML(sec) : blocksHTML(sec);
    },

    chapterMeta: function (id) {
      var sec = LZ.render._cards && LZ.render._cards[id];
      return sec ? { title: sec.title, label: sec.label, accent: sec.accent } : null;
    }
  };
})();
