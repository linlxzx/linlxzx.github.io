/* ═══════════════════════════════════════════════════════════════════════════
   app.js —— 启动器
   ---------------------------------------------------------------------------
   负责:初始化各模块、大背景切换(带烛火熄灭/重燃转场)、音效开关、
        宝剑鼠标开关、欢迎弹窗、键盘快捷键、偏好记忆。
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var LZ = (window.LZ = window.LZ || {});

  var KEY_THEME  = 'linlxzx.theme';
  var KEY_SOUND  = 'linlxzx.sound';
  var KEY_CURSOR = 'linlxzx.cursor';
  var KEY_WELCOME = 'linlxzx.welcome';

  var reduced = false;
  var flash = null;
  var switcher, switcherBtn, switcherPanel, switcherGrid;
  var soundBtn, cursorBtn;
  var currentTheme = 'castle';
  var switching = false;

  /* 切换面板上的色卡(如果想换,直接改这里的渐变色) */
  var SWATCH = {
    castle:      'linear-gradient(180deg,#241a35,#5c374a 46%,#f0b46a)',
    battle:      'linear-gradient(180deg,#150809,#3d110d 46%,#c9501f)',
    oath:        'linear-gradient(180deg,#0b1224,#2f3159 46%,#6d5a8f)',
    winter:      'linear-gradient(180deg,#080f18,#32506c 46%,#7d9cbb)',
    scriptorium: 'linear-gradient(180deg,#140d05,#4d3517 46%,#8a6428)'
  };

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  /* 分享链接参数(可选):
       ?theme=battle      直接以某个大背景打开,例如 https://站点/?theme=winter
       ?nowelcome=1       跳过欢迎弹窗                                      */
  function urlParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) { return null; }
  }

  /* ═══════════════ 大背景 / 主题切换 ═══════════════ */
  function syncSwitcherUI() {
    if (!switcherGrid) return;
    var cards = switcherGrid.querySelectorAll('.tcard');
    for (var i = 0; i < cards.length; i++) {
      cards[i].setAttribute('aria-checked', cards[i].getAttribute('data-theme') === currentTheme ? 'true' : 'false');
    }
  }

  function applyTheme(id, animate) {
    if (switching) return;
    var themes = window.SITE_THEMES || [];
    var ok = themes.some(function (t) { return t.id === id; });
    if (!ok) id = themes.length ? themes[0].id : 'castle';

    currentTheme = id;
    store(KEY_THEME, id);

    var commit = function () {
      document.documentElement.setAttribute('data-theme', id);
      if (LZ.backdrops) LZ.backdrops.set(id);
      syncSwitcherUI();
    };

    if (animate && !reduced && flash) {
      switching = true;
      if (LZ.audio) LZ.audio.play('page');
      flash.classList.remove('is-in');
      flash.classList.add('is-out');
      setTimeout(function () {
        commit();
        flash.classList.remove('is-out');
        flash.classList.add('is-in');
        setTimeout(function () {
          flash.classList.remove('is-in');
          switching = false;
        }, 880);
      }, 400);
    } else {
      commit();
    }
  }

  function buildSwitcher() {
    switcherGrid = document.getElementById('switcher-grid');
    if (!switcherGrid) return;
    var themes = window.SITE_THEMES || [];

    switcherGrid.innerHTML = themes.map(function (t, i) {
      return '<button class="tcard" type="button" role="menuitemradio" data-theme="' + t.id + '"' +
             ' data-sound="hover" aria-checked="false">' +
               '<span class="tcard__swatch" style="background:' + (t.swatch || SWATCH[t.id] || '#333') + '"></span>' +
               '<span class="tcard__txt">' +
                 '<span class="tcard__name">' + t.name + '</span>' +
                 '<span class="tcard__label">' + (t.label || '') + '</span>' +
               '</span>' +
               '<span class="tcard__key">' + (i + 1) + '</span>' +
             '</button>';
    }).join('');

    switcherGrid.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.tcard') : null;
      if (!b) return;
      applyTheme(b.getAttribute('data-theme'), true);
      closeSwitcher();
    });
  }

  function openSwitcher() {
    if (!switcherPanel) return;
    switcherPanel.classList.add('is-open');
    switcherBtn.setAttribute('aria-expanded', 'true');
  }
  function closeSwitcher() {
    if (!switcherPanel) return;
    switcherPanel.classList.remove('is-open');
    switcherBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleSwitcher() {
    if (switcherPanel.classList.contains('is-open')) closeSwitcher();
    else openSwitcher();
  }

  /* ═══════════════ 音效开关 ═══════════════ */
  function setSound(on, persist) {
    var actual = LZ.audio.setEnabled(on);
    if (soundBtn) {
      soundBtn.setAttribute('aria-pressed', actual ? 'true' : 'false');
      soundBtn.setAttribute('aria-label', actual ? '关闭音效' : '开启音效');
    }
    if (persist !== false) store(KEY_SOUND, actual ? 'on' : 'off');
    return actual;
  }

  /* ═══════════════ 宝剑鼠标开关 ═══════════════ */
  function setCursor(on, persist) {
    var actual = LZ.cursor.setEnabled(on);
    if (cursorBtn) {
      cursorBtn.setAttribute('aria-pressed', actual ? 'true' : 'false');
      cursorBtn.style.opacity = actual ? '' : '0.55';
    }
    if (persist !== false) store(KEY_CURSOR, actual ? 'on' : 'off');
    return actual;
  }

  /* ═══════════════ 欢迎弹窗 ═══════════════ */
  function initWelcome() {
    var wrap = document.getElementById('welcome');
    if (!wrap) return;

    if (urlParam('nowelcome')) return;              // ?nowelcome=1 跳过
    if (load(KEY_WELCOME) === 'off') return;        // 记住过了,直接跳过

    var okBtn   = document.getElementById('welcome-ok');
    var remember = document.getElementById('welcome-remember');
    var lastFocus = document.activeElement;

    wrap.hidden = false;
    requestAnimationFrame(function () { wrap.classList.add('is-on'); });

    // 焦点移入弹窗
    setTimeout(function () { if (okBtn) okBtn.focus(); }, 520);

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key === 'Tab') {                       // 简易焦点锁定
        var f = wrap.querySelectorAll('button, input, [href]');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    function close(skipped) {
      if (remember && remember.checked) store(KEY_WELCOME, 'off');

      // 这次点击正好是浏览器要求的"用户手势" —— 用它解锁并开启音效
      if (LZ.audio) {
        LZ.audio.unlock();
        if (load(KEY_SOUND) === null) setSound(true);   // 用户没手动设过,就默认开启
        LZ.audio.play('seal');
      }

      wrap.classList.remove('is-on');
      document.removeEventListener('keydown', onKey, true);
      setTimeout(function () {
        wrap.hidden = true;
        if (lastFocus && lastFocus.focus) lastFocus.focus();
      }, 760);
    }

    okBtn.addEventListener('click', function () { close(false); });
    document.addEventListener('keydown', onKey, true);
  }

  /* ═══════════════ 键盘快捷键 ═══════════════ */
  function initKeys() {
    document.addEventListener('keydown', function (e) {
      // 输入框里不拦截
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

      var themes = window.SITE_THEMES || [];

      // 1–5 切大背景
      if (e.key >= '1' && e.key <= '9') {
        var i = parseInt(e.key, 10) - 1;
        if (themes[i]) { e.preventDefault(); applyTheme(themes[i].id, true); }
        return;
      }
      // B 键循环切换
      if (e.key === 'b' || e.key === 'B') {
        if (!themes.length) return;
        e.preventDefault();
        var idx = themes.map(function (x) { return x.id; }).indexOf(currentTheme);
        applyTheme(themes[(idx + 1) % themes.length].id, true);
        return;
      }
      // M 键开/关音效
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setSound(!LZ.audio.isEnabled());
        return;
      }
      // Escape 关掉切换面板
      if (e.key === 'Escape') closeSwitcher();
    });
  }

  /* ═══════════════ 启动 ═══════════════ */
  function boot() {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 转场遮罩
    flash = document.createElement('div');
    flash.className = 'theme-flash';
    flash.setAttribute('aria-hidden', 'true');
    document.body.appendChild(flash);

    // 1. 渲染页面内容
    if (LZ.render && window.SITE_CONTENT) LZ.render.build(window.SITE_CONTENT);

    // 2. 大背景
    if (LZ.backdrops) LZ.backdrops.init();

    // 3. 骑士
    var slot = document.getElementById('knight-slot');
    if (slot && LZ.knight) LZ.knight.mount(slot);

    // 4. 顶栏交互
    switcher     = document.getElementById('switcher');
    switcherBtn  = document.getElementById('switcher-btn');
    switcherPanel = document.getElementById('switcher-panel');
    soundBtn     = document.getElementById('sound-btn');
    cursorBtn    = document.getElementById('cursor-btn');

    buildSwitcher();

    if (switcherBtn) switcherBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (LZ.audio) LZ.audio.play('toggle');
      toggleSwitcher();
    });
    document.addEventListener('click', function (e) {
      if (switcher && !switcher.contains(e.target)) closeSwitcher();
    });

    // 5. 音效:默认关(除非之前手动开过)
    var soundPref = load(KEY_SOUND);
    setSound(soundPref === 'on', false);
    if (soundBtn) soundBtn.addEventListener('click', function () { setSound(!LZ.audio.isEnabled()); });

    // 6. 宝剑鼠标:默认开
    var cursorPref = load(KEY_CURSOR);
    if (LZ.cursor) LZ.cursor.init(cursorPref !== 'off');
    if (cursorBtn) {
      cursorBtn.setAttribute('aria-pressed', (cursorPref !== 'off') ? 'true' : 'false');
      cursorBtn.addEventListener('click', function () {
        if (LZ.audio) LZ.audio.play('toggle');
        setCursor(!LZ.cursor.isEnabled());
      });
    }

    // 7. 主题(优先用 ?theme=xxx,其次用上次记住的)
    var themePref = urlParam('theme') || load(KEY_THEME);
    var themes = window.SITE_THEMES || [];
    var valid = themes.some(function (t) { return t.id === themePref; });
    applyTheme(valid ? themePref : (themes[0] ? themes[0].id : 'castle'), false);

    // 8. 动效
    if (LZ.effects) LZ.effects.init();

    // 9. 站名点击回顶部
    var brand = document.querySelector('.brand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      });
    }

    // 10. 键盘
    initKeys();

    // 11. 欢迎弹窗(放最后,保证它压在一切之上)
    initWelcome();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
