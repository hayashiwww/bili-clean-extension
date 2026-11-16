/* B站右栏清理 —— popup 开关读写 chrome.storage.sync */
(function () {
  'use strict';

  var DEFAULTS = {
    hideNav: true, homeOnly: true, favClean: true, hideRcmd: true, hideAds: true,
    hideRight: true, wide: false,
    logoGlowColor: '#FB7299', cursorGlowColor: '', cursorGlowStrength: 28
  };
  var KEYS = Object.keys(DEFAULTS);
  var hint = document.getElementById('hint');

  function refreshHint() {
    if (!hint) return;
    var right = document.getElementById('hideRight');
    var isRight = !!(right && right.checked);
    hint.textContent = isRight
      ? '右栏整块已删（含选集/弹幕列表/UP主卡）。要切多P选集，关掉第 3 项即可。'
      : '选集、弹幕列表、UP主卡都还在，只删了推荐和广告。';
  }

  function autoCursorColor() {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? '#FFFFFF' : '#000000';
    } catch (e) {
      return '#FFFFFF';
    }
  }

  function setStrengthLabel(v) {
    var lab = document.getElementById('strengthLabel');
    if (lab) lab.textContent = v + '%　（0 = 关闭）';
  }

  function init() {
    chrome.storage.sync.get(DEFAULTS, function (v) {
      var o = Object.assign({}, DEFAULTS, v || {});
      /* 兼容旧版单一 glowColor */
      if (v && v.glowColor) {
        if (!v.logoGlowColor) o.logoGlowColor = v.glowColor;
        if (!v.cursorGlowColor) o.cursorGlowColor = v.glowColor;
      }

      KEYS.forEach(function (k) {
        var el = document.getElementById(k);
        if (!el) return;
        if (el.type === 'checkbox') el.checked = !!o[k];
      });

      var lg = document.getElementById('logoGlowColor');
      if (lg) lg.value = o.logoGlowColor || DEFAULTS.logoGlowColor;

      var cg = document.getElementById('cursorGlowColor');
      if (cg) {
        cg.value = o.cursorGlowColor || autoCursorColor();
        cg.dataset.auto = o.cursorGlowColor ? '' : '1';
      }

      var st = document.getElementById('cursorGlowStrength');
      if (st) {
        st.value = String(o.cursorGlowStrength);
        setStrengthLabel(o.cursorGlowStrength);
      }

      refreshHint();
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  /* 颜色 / 强度：拖动时实时保存 */
  document.addEventListener('input', function (e) {
    var t = e.target;
    if (!t) return;
    if (t.type === 'color' && (t.id === 'logoGlowColor' || t.id === 'cursorGlowColor')) {
      var p = {};
      p[t.id] = t.value;
      chrome.storage.sync.set(p);
      if (t.id === 'cursorGlowColor') t.dataset.auto = '';
    }
    if (t.id === 'cursorGlowStrength') {
      setStrengthLabel(t.value);
      var q = {};
      q.cursorGlowStrength = Number(t.value);
      chrome.storage.sync.set(q);
    }
  });

  /* 「默认」按钮：颜色恢复为跟随主题 */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.id || t.id !== 'resetCursorColor') return;
    chrome.storage.sync.set({ cursorGlowColor: '' });
    var cg = document.getElementById('cursorGlowColor');
    if (cg) {
      cg.value = autoCursorColor();
      cg.dataset.auto = '1';
    }
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || t.type !== 'checkbox' || !t.id) return;
    if (KEYS.indexOf(t.id) === -1) return;
    var patch = {};
    patch[t.id] = t.checked;
    chrome.storage.sync.set(patch);
    refreshHint();
  });
})();
