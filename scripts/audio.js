/* ═══════════════════════════════════════════════════════════════════════════
   audio.js —— 音效引擎(全部程序化合成,不需要任何音频文件)
   ---------------------------------------------------------------------------
   原理:用 Web Audio 的振荡器(Oscillator)和噪声(Noise Buffer)实时合成音色。
   优点:零素材、零版权、体积为 0、参数随便调。
   想改音色:改下面 SOUNDS 里每个音效的配方即可。

   浏览器规则:必须等用户先点过页面才能出声。所以 app.js 在欢迎弹窗的
   "确定"按钮上调用 LZ.audio.unlock()。
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var LZ = (window.LZ = window.LZ || {});

  var ctx = null;          // AudioContext
  var master = null;       // 总音量
  var noiseBuf = null;     // 复用的噪声缓冲
  var enabled = false;     // 音效是否开启
  var volume = 0.55;       // 总音量
  var lastHover = 0;       // 悬停音节流
  var HOVER_GAP = 85;      // 毫秒

  /* ── 惰性创建 AudioContext(必须由用户手势触发) ── */
  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { return null; }
    master = ctx.createGain();
    master.gain.value = enabled ? volume : 0.0001;
    master.connect(ctx.destination);
    return ctx;
  }

  /* ── 复用的白噪声缓冲 ── */
  function noise() {
    if (noiseBuf) return noiseBuf;
    var len = Math.floor(ctx.sampleRate * 1.4);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  /* ── 合成一个"音" ──
     o = { freq, to(滑音目标), type, dur, gain, attack, filter, filterFreq, q, detune } */
  function tone(o) {
    if (!ctx) return;
    var t = ctx.currentTime;
    var dur = o.dur || 0.2;
    var osc = ctx.createOscillator();
    var g   = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(Math.max(20, o.freq), t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + dur);
    if (o.detune) osc.detune.setValueAtTime(o.detune, t);

    var peak = o.gain == null ? 0.08 : o.gain;
    var atk  = o.attack == null ? 0.006 : o.attack;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    var node = osc;
    if (o.filter) {
      var f = ctx.createBiquadFilter();
      f.type = o.filter;
      f.frequency.setValueAtTime(o.filterFreq || 1200, t);
      if (o.filterTo) f.frequency.exponentialRampToValueAtTime(o.filterTo, t + dur);
      f.Q.value = o.q || 1;
      node.connect(f); node = f;
    }
    node.connect(g); g.connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  /* ── 合成一段"噪声" ──
     o = { dur, gain, attack, filter, filterFreq, filterTo, q, type } */
  function hiss(o) {
    if (!ctx) return;
    var t = ctx.currentTime;
    var dur = o.dur || 0.15;
    var src = ctx.createBufferSource();
    src.buffer = noise();
    src.loop = true;

    var f = ctx.createBiquadFilter();
    f.type = o.filter || 'bandpass';
    f.frequency.setValueAtTime(o.filterFreq || 2000, t);
    if (o.filterTo) f.frequency.exponentialRampToValueAtTime(o.filterTo, t + dur);
    f.Q.value = o.q || 1;

    var g = ctx.createGain();
    var peak = o.gain == null ? 0.05 : o.gain;
    var atk  = o.attack == null ? 0.004 : o.attack;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    src.connect(f); f.connect(g); g.connect(master);
    src.start(t);
    src.stop(t + dur + 0.03);
  }

  /* ═══════════════════ 音效配方(想改音色就改这里) ═══════════════════ */
  var SOUNDS = {

    /* 悬停:短促的鲁特琴轻拨 */
    hover: function () {
      var base = 900 + Math.random() * 340;
      tone({ type: 'triangle', freq: base, dur: 0.085, gain: 0.020, attack: 0.003 });
      tone({ type: 'sine',     freq: base * 2.01, dur: 0.055, gain: 0.008 });
    },

    /* 点击:木叩 */
    click: function () {
      hiss({ dur: 0.055, gain: 0.045, filter: 'bandpass', filterFreq: 1750, q: 5 });
      tone({ type: 'square', freq: 300, to: 190, dur: 0.075, gain: 0.028, filter: 'lowpass', filterFreq: 900 });
    },

    /* 火漆按下(欢迎弹窗的"确定") */
    seal: function () {
      tone({ type: 'sine', freq: 168, to: 92, dur: 0.34, gain: 0.13, attack: 0.004 });
      hiss({ dur: 0.17, gain: 0.075, filter: 'lowpass', filterFreq: 760, q: 0.8 });
      // 上行装饰音
      tone({ type: 'triangle', freq: 523.25, dur: 0.42, gain: 0.045, attack: 0.02 });
      tone({ type: 'triangle', freq: 783.99, dur: 0.52, gain: 0.040, attack: 0.05 });
      tone({ type: 'sine',     freq: 1046.5, dur: 0.60, gain: 0.030, attack: 0.09 });
    },

    /* 进入分区:低音钟 */
    bell: function () {
      tone({ type: 'sine',     freq: 196.00, dur: 1.60, gain: 0.10, attack: 0.004 });
      tone({ type: 'sine',     freq: 293.66, dur: 1.35, gain: 0.070, attack: 0.006 });
      tone({ type: 'triangle', freq: 392.00, dur: 1.05, gain: 0.045, attack: 0.01 });
      tone({ type: 'sine',     freq: 587.33, dur: 0.70, gain: 0.022, attack: 0.02 });
    },

    /* 宝剑出鞘 / 交割:金属铮鸣 */
    clash: function () {
      hiss({ dur: 0.19, gain: 0.085, filter: 'highpass', filterFreq: 2600, q: 1.2 });
      tone({ type: 'sawtooth', freq: 1380, to: 2450, dur: 0.15, gain: 0.048, filter: 'bandpass', filterFreq: 3000, q: 2 });
      tone({ type: 'sine',     freq: 2680, to: 1900, dur: 0.24, gain: 0.030, attack: 0.002 });
    },

    /* 主题切换:翻动羊皮纸 */
    page: function () {
      hiss({ dur: 0.36, gain: 0.055, attack: 0.05, filter: 'bandpass', filterFreq: 3200, filterTo: 900, q: 1.1 });
      hiss({ dur: 0.22, gain: 0.030, attack: 0.005, filter: 'highpass', filterFreq: 4200, q: 0.9 });
    },

    /* 开启音效:号角短鸣 */
    horn: function () {
      tone({ type: 'sawtooth', freq: 220, to: 330, dur: 0.55, gain: 0.062,
             filter: 'lowpass', filterFreq: 1400, filterTo: 2100, q: 3, attack: 0.03 });
      tone({ type: 'sawtooth', freq: 330, to: 494, dur: 0.55, gain: 0.040,
             filter: 'lowpass', filterFreq: 1600, filterTo: 2400, q: 3, attack: 0.03 });
      tone({ type: 'sine', freq: 660, dur: 0.40, gain: 0.020, attack: 0.06 });
    },

    /* 关闭:短促下行 */
    off: function () {
      tone({ type: 'triangle', freq: 420, to: 210, dur: 0.20, gain: 0.040 });
    },

    /* 欢迎弹窗展开:钟 + 微光 */
    unfold: function () {
      tone({ type: 'sine',     freq: 261.63, dur: 1.20, gain: 0.055, attack: 0.02 });
      tone({ type: 'sine',     freq: 392.00, dur: 1.00, gain: 0.038, attack: 0.03 });
      tone({ type: 'triangle', freq: 1046.5, dur: 0.55, gain: 0.018, attack: 0.10 });
      hiss({ dur: 0.55, gain: 0.026, attack: 0.10, filter: 'bandpass', filterFreq: 2600, filterTo: 5200, q: 0.8 });
    },

    /* 骑士说话:轻金属 */
    knight: function () {
      tone({ type: 'triangle', freq: 340, dur: 0.16, gain: 0.036 });
      hiss({ dur: 0.10, gain: 0.028, filter: 'bandpass', filterFreq: 2100, q: 3 });
    }
  };

  /* ═══════════════════ 对外接口 ═══════════════════ */
  LZ.audio = {

    /* 解锁音频上下文(必须在用户手势里调用一次) */
    unlock: function () {
      if (!ensure()) return false;
      if (ctx.state === 'suspended') ctx.resume();
      return true;
    },

    play: function (name) {
      if (!enabled || !ctx) return;
      var fn = SOUNDS[name];
      if (!fn) return;
      // 悬停音节流,避免"滴滴滴"刷屏
      if (name === 'hover') {
        var now = Date.now();
        if (now - lastHover < HOVER_GAP) return;
        lastHover = now;
      }
      try { fn(); } catch (e) { /* 静默失败,不影响页面 */ }
    },

    isEnabled: function () { return enabled; },

    setEnabled: function (on) {
      enabled = !!on;
      if (enabled) this.unlock();
      if (master && ctx) {
        var t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), t);
        master.gain.linearRampToValueAtTime(enabled ? volume : 0.0001, t + 0.18);
      }
      return enabled;
    },

    toggle: function () {
      var on = this.setEnabled(!enabled);
      this.play(on ? 'horn' : 'off');
      return on;
    },

    setVolume: function (v) {
      volume = Math.max(0, Math.min(1, v));
      if (master && ctx && enabled) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
    },

    getVolume: function () { return volume; }
  };
})();
