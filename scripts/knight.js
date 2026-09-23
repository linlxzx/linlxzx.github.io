/* ═══════════════════════════════════════════════════════════════════════════
   knight.js —— 骑士(内联 SVG + 交互)
   ---------------------------------------------------------------------------
   他会:待机呼吸、披风飘动、视线跟着你的鼠标转、随机眨眼、
        被点击时行礼 + 金属音效 + 冒出一句台词。
   想换成自己的立绘:把下面 KNIGHT_SVG 换掉,或给 .knightwrap 塞一张 <img>。
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var LZ = (window.LZ = window.LZ || {});

  /* ── 骑士本体(几何/扁平风,配色跟随主题变量) ── */
  var KNIGHT_SVG = [
    '<svg class="knight" viewBox="0 0 120 186" width="120" height="186" role="button" tabindex="0"',
    '     aria-label="骑士 —— 点我说话">',
    '  <defs>',
    '    <linearGradient id="k-steel" x1="0" y1="0" x2="1" y2="1">',
    '      <stop offset="0%" stop-color="#dde5f0"/><stop offset="45%" stop-color="#a8b3c4"/><stop offset="100%" stop-color="#69738a"/>',
    '    </linearGradient>',
    '    <linearGradient id="k-steel2" x1="0" y1="0" x2="1" y2="1">',
    '      <stop offset="0%" stop-color="#9aa5b8"/><stop offset="100%" stop-color="#5b6478"/>',
    '    </linearGradient>',
    '    <linearGradient id="k-cloth" x1="0" y1="0" x2="0" y2="1">',
    '      <stop offset="0%" stop-color="var(--c-accent)"/><stop offset="100%" stop-color="var(--c-accent-2)"/>',
    '    </linearGradient>',
    '    <radialGradient id="k-spark">',
    '      <stop offset="0%" stop-color="#fff6d8"/><stop offset="100%" stop-color="rgba(255,200,110,0)"/>',
    '    </radialGradient>',
    '  </defs>',

    '  <ellipse cx="60" cy="179" rx="33" ry="5" fill="rgba(0,0,0,.45)"/>',

    '  <g class="knight__body">',
    /* 披风(在身体后面) */
    '    <path class="knight__cape" d="M40 56 C 22 78, 12 114, 17 160 L 35 165 C 28 124, 35 88, 52 64 Z"',
    '          fill="var(--c-accent-2)" opacity="0.82"/>',
    /* 腿 */
    '    <path d="M46 112 L62 112 L60 166 L50 166 Z" fill="url(#k-steel)"/>',
    '    <path d="M62 112 L78 112 L74 166 L64 166 Z" fill="url(#k-steel2)"/>',
    '    <ellipse cx="53" cy="170" rx="10" ry="5" fill="#5b6478"/>',
    '    <ellipse cx="71" cy="170" rx="10" ry="5" fill="#5b6478"/>',
    /* 躯干:胸甲 */
    '    <path d="M40 58 C 40 51, 45 47, 53 46 L 73 46 C 81 47, 86 51, 86 58 L 84 106 C 84 113, 80 117, 73 118 L 53 118 C 46 117, 42 113, 42 106 Z"',
    '          fill="url(#k-steel)"/>',
    /* 罩袍 + 纹章 */
    '    <path d="M53 59 L73 59 L71 115 L55 115 Z" fill="url(#k-cloth)" opacity="0.92"/>',
    '    <path d="M63 72 L66.4 83 L78 86.4 L66.4 89.8 L63 101 L59.6 89.8 L48 86.4 L59.6 83 Z"',
    '          fill="#f5e9cd" opacity="0.9"/>',
    /* 腰带 */
    '    <rect x="42" y="105" width="44" height="9" rx="3" fill="#463222"/>',
    '    <rect x="58" y="104" width="12" height="11" rx="2.5" fill="var(--c-accent)"/>',
    /* 肩甲 */
    '    <path d="M41 60 C 34 57, 29 62, 29 69 C 29 76, 36 80, 43 77 Z" fill="url(#k-steel)"/>',
    '    <path d="M85 60 C 92 57, 97 62, 97 69 C 97 76, 90 80, 83 77 Z" fill="url(#k-steel)"/>',
    /* 右臂 + 手(扶剑) */
    '    <path d="M85 68 L91 68 L93 96 L87 96 Z" fill="url(#k-steel2)"/>',
    '    <circle cx="90" cy="98" r="6.2" fill="#8f99ab"/>',
    /* 左臂(持盾) */
    '    <path d="M34 68 L40 68 L40 92 L34 92 Z" fill="url(#k-steel2)"/>',
    /* 剑(拄地) */
    '    <rect x="87.6" y="106" width="5" height="48" fill="#dde5f0"/>',
    '    <path d="M87.6 152 L92.6 152 L90.1 163 Z" fill="#eef2f8"/>',
    '    <rect x="79" y="102" width="22" height="4.6" rx="2.2" fill="var(--c-accent)"/>',
    '    <rect x="87.5" y="88" width="5" height="15" rx="2" fill="#463222"/>',
    '    <circle cx="90" cy="86" r="4.4" fill="var(--c-accent)"/>',
    /* 盾 */
    '    <path d="M13 68 L47 68 L47 108 C 47 125, 34 138, 30 143 C 26 138, 13 125, 13 108 Z"',
    '          fill="var(--c-accent-2)"/>',
    '    <path d="M13 68 L47 68 L47 108 C 47 125, 34 138, 30 143 C 26 138, 13 125, 13 108 Z"',
    '          fill="none" stroke="var(--c-accent)" stroke-width="2.6"/>',
    '    <path d="M30 82 L33.6 93.6 L45 97.2 L33.6 100.8 L30 112.4 L26.4 100.8 L15 97.2 L26.4 93.6 Z"',
    '          fill="#f5e9cd" opacity="0.88"/>',
    /* 头(可转头) */
    '    <g class="knight__head">',
    '      <path d="M46 57 C 44 34, 50 21, 60 21 C 70 21, 76 34, 74 57 Z" fill="url(#k-steel)"/>',
    '      <path d="M60 23 L60 55" stroke="#69738a" stroke-width="1.6" opacity="0.65"/>',
    '      <rect x="48.5" y="37" width="23" height="6" rx="3" fill="#161b26"/>',
    '      <g class="knight__eyes">',
    '        <rect x="52" y="38.4" width="5.6" height="3.2" rx="1.6" fill="#ffd27a"/>',
    '        <rect x="62.4" y="38.4" width="5.6" height="3.2" rx="1.6" fill="#ffd27a"/>',
    '      </g>',
    '      <path d="M57 24 C 48 13, 53 3, 66 1 C 61 11, 65 18, 71 24 Z" fill="var(--c-accent-2)"/>',
    '    </g>',
    /* 行礼火花 */
    '    <g class="knight__spark"><circle cx="90" cy="80" r="20" fill="url(#k-spark)"/></g>',
    '  </g>',
    '</svg>'
  ].join('\n');

  var host = null, svgEl = null, bubble = null, eyesEl = null, headEl = null;
  var blinkTimer = null, hideTimer = null, clickCount = 0;
  var reduced = false, mobile = false;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* 说一句话(气泡 + 音效) */
  function say(text) {
    if (!bubble) return;
    bubble.innerHTML = esc(text);
    bubble.classList.add('is-on');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () { bubble.classList.remove('is-on'); }, 3600);
  }

  /* 随机眨眼 */
  function scheduleBlink() {
    clearTimeout(blinkTimer);
    blinkTimer = setTimeout(function () {
      if (eyesEl && !reduced) {
        eyesEl.classList.add('is-blink');
        setTimeout(function () { eyesEl.classList.remove('is-blink'); }, 220);
      }
      scheduleBlink();
    }, 2200 + Math.random() * 4200);
  }

  /* 视线跟随鼠标 */
  function track(ev) {
    if (!svgEl || !headEl || reduced) return;
    var r = svgEl.getBoundingClientRect();
    if (!r.width) return;
    var cx = r.left + r.width * 0.5;
    var cy = r.top + r.height * 0.32;
    var dx = ev.clientX - cx;
    var dy = ev.clientY - cy;
    var ang = Math.atan2(dy, Math.abs(dx)) * 180 / Math.PI;
    var rot = Math.max(-11, Math.min(11, (dx > 0 ? ang : ang) * 0.28));
    headEl.style.transform = 'rotate(' + rot.toFixed(2) + 'deg)';
  }

  /* 点击:行礼 + 台词 */
  function poke() {
    if (!svgEl) return;
    clickCount++;

    var lines = (window.SITE_CONTENT && window.SITE_CONTENT.knight && window.SITE_CONTENT.knight.lines) || ['……'];
    var egg   = (window.SITE_CONTENT && window.SITE_CONTENT.knight && window.SITE_CONTENT.knight.easterEgg) || '';

    if (LZ.audio) LZ.audio.play('clash');

    var text;
    if (egg && clickCount >= 7 && clickCount % 7 === 0) {
      text = egg;
    } else {
      text = lines[(clickCount - 1) % lines.length];
    }
    say(text);

    if (!reduced) {
      svgEl.classList.remove('is-salute');
      void svgEl.offsetWidth;              // 强制重排,让动画能重播
      svgEl.classList.add('is-salute');
      setTimeout(function () { svgEl.classList.remove('is-salute'); }, 1000);
    }

    // 在骑士脚下溅一点火花
    if (LZ.backdrops) {
      var r = svgEl.getBoundingClientRect();
      LZ.backdrops.spark(r.left + r.width * 0.5, r.top + r.height * 0.6);
    }
  }

  LZ.knight = {
    mount: function (container) {
      if (!container) return null;
      host = container;
      container.innerHTML = KNIGHT_SVG + '<div class="kbubble" role="status" aria-live="polite"></div>';

      svgEl  = container.querySelector('.knight');
      bubble = container.querySelector('.kbubble');
      eyesEl = container.querySelector('.knight__eyes');
      headEl = container.querySelector('.knight__head');

      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      mobile  = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;

      svgEl.addEventListener('click', poke);
      svgEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); }
      });

      if (!mobile) window.addEventListener('pointermove', track, { passive: true });
      scheduleBlink();

      return svgEl;
    },

    say: say,
    poke: poke
  };
})();
