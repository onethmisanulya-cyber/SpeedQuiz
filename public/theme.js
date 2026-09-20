/* Speed Quiz — light/dark theme. Persisted in localStorage, follows OS by default. */
(function () {
  'use strict';
  var KEY = 'sq_theme';
  var root = document.documentElement;

  function systemTheme() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    } catch (e) { /* ignore */ }
    return 'dark';
  }

  function storedTheme() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'light' || v === 'dark') return v;
    } catch (e) { /* private mode etc. */ }
    return null;
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].textContent = theme === 'light' ? '🌙 Dark' : '☀️ Light';
      btns[i].setAttribute('aria-pressed', theme === 'light' ? 'false' : 'true');
    }
  }

  function current() {
    return root.getAttribute('data-theme') || storedTheme() || systemTheme();
  }

  function toggle() {
    var next = current() === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
    apply(next);
    return next;
  }

  apply(storedTheme() || systemTheme());

  // Follow OS changes until the user picks explicitly.
  try {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var onChange = function () { if (!storedTheme()) apply(systemTheme()); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  } catch (e) { /* ignore */ }

  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest('[data-theme-toggle]') : null;
    if (t) { ev.preventDefault(); toggle(); }
  });

  window.SQTheme = { current: current, toggle: toggle, apply: apply };
})();
