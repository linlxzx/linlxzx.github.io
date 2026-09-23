/* ═══════════════════════════════════════════════════════════════════════════
   cursor.js —— 宝剑鼠标
   ---------------------------------------------------------------------------
   为什么不用 CSS 的 cursor:url()?因为那样无法旋转、无法做拖尾、无法溅火花。
   所以这里用"隐藏系统光标 + 一个跟着指针走的 SVG 剑"来实现。

   安全设计:
     · 只有确认 JS 跑起来之后,才给 <body> 加 .has-cursor 去隐藏系统光标
       —— 万一脚本报错,你仍然有正常光标可用。
     · 触屏设备完全不启用。
     · 可以通过右上角按钮随时关掉。
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var LZ = (window.LZ = window.LZ || {});

  var el, sword;
  var enabled = true, ready = false, isTouch = false;
  var x = 0, y = 0, tx = 0, ty = 0, tilt = 0, tiltTarget = 0, prevX = 0;
  var raf = null, down = false;

  var HOT_SEL   = 'a, button, [role="button"], .card, .link, .tcard, .tag, summary, label';
  var TEXT_SEL  = 'input, textarea, select, [contenteditable="true"]';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function frame() {
    raf = requestAnimationFrame(frame);

    // 位置做阻尼平滑,剑跟手但不僵硬
    x += (tx - x) * 0.42;
    y += (ty - y) * 0.42;

    // 根据横向速度让剑稍微倾斜(挥剑感)
    var vx = tx - prevX;
    prevX = tx;
    tiltTarget = clamp(vx * 0.55, -15, 15);
    tilt += (tiltTarget - tilt) * 0.16;

    el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(' + tilt.toFixed(2) + 'deg)';
  }

  function onMove(e) {
    if (!enabled) return;
    if (e.pointerType === 'touch') { disable(); return; }

    tx = e.clientX;
    ty = e.clientY;

    if (!ready) {
      x = tx; y = ty; prevX = tx;
      ready = true;
      el.classList.add('is-ready');
      document.body.classList.add('has-cursor');
      if (!raf) raf = requestAnimationFrame(frame);
    }

    var t = e.target;
    if (t && t.closest) {
      el.classList.toggle('is-hot', !!t.closest(HOT_SEL));
      el.classList.toggle('is-pen', !!t.closest(TEXT_SEL));
    }
  }

  function onDown(e) {
    if (!enabled || !ready) return;
    down = true;
    el.classList.add('is-down');
    if (e.button === 0 && LZ.backdrops) LZ.backdrops.spark(x, y);
    if (LZ.audio) LZ.audio.play('click');
  }

  function onUp() {
    down = false;
    if (el) el.classList.remove('is-down');
  }

  function onLeave() { if (el && ready) el.classList.remove('is-ready'); }
  function onEnter() { if (el && ready && enabled) el.classList.add('is-ready'); }

  function enable() {
    enabled = true;
    if (isTouch) return false;
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    document.addEventListener('pointerenter', onEnter);
    return true;
  }

  function disable() {
    enabled = false;
    ready = false;
    document.body.classList.remove('has-cursor');
    if (el) el.classList.remove('is-ready', 'is-hot', 'is-pen', 'is-down');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('pointerenter', onEnter);
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }

  LZ.cursor = {

    init: function (startEnabled) {
      el = document.getElementById('cursor');
      if (!el) return;
      sword = el.querySelector('.cursor__sword');

      isTouch = window.matchMedia('(pointer: coarse)').matches &&
                !window.matchMedia('(hover: hover)').matches;

      // 尊重"减少动画":仍然给剑,但不做倾斜平滑(降低突兀感)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) tilt = 0;

      if (startEnabled !== false) {
        if (!enable()) {
          el.style.display = 'none';   // 触屏:彻底不启用
        }
      } else {
        el.style.display = 'none';
      }
    },

    isEnabled: function () { return enabled; },

    setEnabled: function (on) {
      if (on) {
        if (el) el.style.display = '';
        if (!enable()) {
          if (el) el.style.display = 'none';
          return false;
        }
        return true;
      }
      disable();
      if (el) el.style.display = 'none';
      return false;
    },

    toggle: function () { return this.setEnabled(!enabled); }
  };
})();
