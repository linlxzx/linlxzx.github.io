/* ═══════════════════════════════════════════════════════════════════════════
   effects.js —— 动效层
   ---------------------------------------------------------------------------
   包含:
     1. 滚动揭示(IntersectionObserver)
     2. 分区感知(切换氛围色 / 高亮侧边导航 / 进入分区响钟声)
     3. 顶部羊皮纸卷轴进度条
     4. 背景视差
     5. 卡片 3D 倾斜 + 烛光跟随
     6. 音效事件绑定(任何带 data-sound 的元素)
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var LZ = (window.LZ = window.LZ || {});

  var reduced = false, mobile = false;
  var sections = [];
  var navDots = [];
  var activeSection = null;
  var lastBell = 0;
  var scrollRaf = null;

  /* ── 1. 滚动揭示 ── */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduced) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-in');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -6% 0px' });
    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  /* 进度条填充(配合 .stat__fill 的过渡) */
  function fillStats(scope) {
    var bars = scope.querySelectorAll('.stat__fill');
    for (var i = 0; i < bars.length; i++) {
      (function (b) {
        var v = b.getAttribute('data-value') || '0';
        setTimeout(function () { b.style.width = v + '%'; }, 120 + i * 110);
      })(bars[i]);
    }
  }

  /* ── 2. 分区感知 ── */
  function setActive(sec) {
    if (!sec || sec === activeSection) return;
    activeSection = sec;

    var accent = sec.getAttribute('data-accent') || 'gold';
    document.body.setAttribute('data-accent', accent);

    var id = sec.id;
    navDots.forEach(function (d) {
      d.setAttribute('aria-current', d.getAttribute('href') === '#' + id ? 'true' : 'false');
    });

    fillStats(sec);

    var now = Date.now();
    if (now - lastBell > 1400 && LZ.audio) { LZ.audio.play('bell'); lastBell = now; }
  }

  function initSections() {
    sections = Array.prototype.slice.call(document.querySelectorAll('.section'));
    navDots  = Array.prototype.slice.call(document.querySelectorAll('.railnav__dot'));

    if (!('IntersectionObserver' in window)) { if (sections[0]) setActive(sections[0]); return; }

    var io = new IntersectionObserver(function (entries) {
      // 取当前可见度最高的那个分区
      var best = null, bestRatio = 0;
      entries.forEach(function (en) {
        if (en.isIntersecting && en.intersectionRatio > bestRatio) {
          bestRatio = en.intersectionRatio;
          best = en.target;
        }
      });
      if (best) { setActive(best); return; }
      // 都不在交叉区时,用滚动位置兜底
      pickByScroll();
    }, { threshold: [0.06, 0.25, 0.5, 0.75], rootMargin: '-28% 0px -28% 0px' });

    sections.forEach(function (s) { io.observe(s); });
    if (sections[0]) setActive(sections[0]);
  }

  function pickByScroll() {
    var mid = window.innerHeight * 0.42;
    for (var i = sections.length - 1; i >= 0; i--) {
      var r = sections[i].getBoundingClientRect();
      if (r.top <= mid) { setActive(sections[i]); return; }
    }
  }

  /* ── 3. 进度条 ── */
  function updateProgress() {
    var fill = document.getElementById('scrollbar-fill');
    if (!fill) return;
    var doc = document.documentElement;
    var max = (doc.scrollHeight - window.innerHeight);
    var p = max > 0 ? (doc.scrollTop || window.scrollY) / max : 0;
    fill.style.width = (Math.max(0, Math.min(1, p)) * 100).toFixed(2) + '%';
  }

  /* ── 4. 背景视差 ── */
  var pFar, pMid, pNear, pFx;
  function updateParallax() {
    if (reduced || mobile) return;
    var s = window.scrollY || 0;
    if (pFar)  pFar.style.transform  = 'translate3d(0,' + (-s * 0.020).toFixed(1) + 'px,0)';
    if (pMid)  pMid.style.transform  = 'translate3d(0,' + (-s * 0.046).toFixed(1) + 'px,0)';
    if (pNear) pNear.style.transform = 'translate3d(0,' + (-s * 0.085).toFixed(1) + 'px,0)';
  }

  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(function () {
      scrollRaf = null;
      updateProgress();
      updateParallax();
    });
  }

  /* ── 5. 卡片 3D 倾斜 ── */
  function initCardTilt() {
    if (reduced || mobile) return;
    var cards = document.querySelectorAll('.card');
    cards.forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        c.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        c.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        var rx = (0.5 - py) * 5.5;
        var ry = (px - 0.5) * 6.5;
        c.style.transform = 'perspective(760px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
      });
      c.addEventListener('pointerleave', function () {
        c.style.transform = '';
        c.style.removeProperty('--mx');
        c.style.removeProperty('--my');
      });
    });
  }

  /* ── 6. 音效绑定 ──
     分工:
       pointerover  → 播放元素上 data-sound 指定的"悬停音"(默认 hover)
       click        → 按元素种类播不同的"点击音":
                        侧边导航点     → nav(清脆小钟)
                        链接 / 卡片    → confirm(两音上行)
                        其余按钮       → click(木叩)
      下面 OWN_SOUND 里的元素自己会出声,这里不再重复播,避免两声叠在一起。 */
  var OWN_SOUND = '#sound-btn, #cursor-btn, #switcher-btn, #welcome-ok, .tcard';

  function clickSoundFor(el) {
    if (el.classList.contains('railnav__dot')) return 'nav';
    if (el.tagName === 'A' || el.classList.contains('card') || el.classList.contains('link')) return 'confirm';
    return 'click';
  }

  function initSound() {
    document.addEventListener('pointerover', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var n = t.closest('[data-sound]');
      if (n && LZ.audio && LZ.audio.isEnabled()) LZ.audio.play(n.getAttribute('data-sound') || 'hover');
    }, { passive: true });

    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      if (!LZ.audio || !LZ.audio.isEnabled()) return;
      if (t.closest(OWN_SOUND)) return;                    // 这些元素自带的音更合适
      var el = t.closest('a, button, .card, .link, .railnav__dot, [data-sound]');
      if (!el) return;
      LZ.audio.play(clickSoundFor(el));
    }, { passive: true });
  }

  /* ── 对外接口 ── */
  LZ.effects = {

    init: function () {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      mobile  = window.matchMedia('(max-width: 820px), (pointer: coarse)').matches;

      pFar  = document.getElementById('bd-far');
      pMid  = document.getElementById('bd-mid');
      pNear = document.getElementById('bd-near');
      pFx   = document.getElementById('bd-fx');

      initReveal();
      initSections();
      initCardTilt();
      initSound();

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', function () { updateProgress(); }, { passive: true });
      updateProgress();
    },

    /* 分区渲染完成后重新绑定(render.js 会调用) */
    refresh: function () {
      initReveal();
      initSections();
      initCardTilt();
      updateProgress();
    },

    /* 滚动到某个分区 */
    goTo: function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var top = el.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
    }
  };
})();
