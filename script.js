/**
 * Wedding Invitation — script.js
 * Rajesh & Vishnupriya · 04 May 2026
 *
 * Modules:
 *  1. Scroll Progress Bar
 *  2. Intersection Observer Animations
 *  3. Countdown Timer
 *  4. Music — autoplay on load, mute/unmute toggle
 */

(function () {
  'use strict';

  /* ============================================================
     1. SCROLL PROGRESS BAR
  ============================================================ */
  var progressBar = document.getElementById('progressBar');

  function updateProgressBar() {
    var scrollTop   = window.scrollY || document.documentElement.scrollTop;
    var docHeight   = document.documentElement.scrollHeight - window.innerHeight;
    var pct         = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct.toFixed(2) + '%';
  }
  window.addEventListener('scroll', updateProgressBar, { passive: true });
  updateProgressBar();


  /* ============================================================
     2. SCROLL ANIMATIONS — INTERSECTION OBSERVER
  ============================================================ */
  var animatedEls = document.querySelectorAll('.animate-on-scroll');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -50px 0px', threshold: 0.08 });

    animatedEls.forEach(function (el) { observer.observe(el); });
  } else {
    animatedEls.forEach(function (el) { el.classList.add('is-visible'); });
  }


  /* ============================================================
     3. COUNTDOWN TIMER  — 04 May 2026, 09:30 AM IST
  ============================================================ */
  var WEDDING_DATE = new Date('2026-05-04T09:30:00+05:30');
  var countDays    = document.getElementById('countDays');
  var countHours   = document.getElementById('countHours');
  var countMinutes = document.getElementById('countMinutes');
  var countSeconds = document.getElementById('countSeconds');

  function pad(n) { return String(Math.max(0, n)).padStart(2, '0'); }

  function tickAnimate(el) {
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
    setTimeout(function () { el.classList.remove('tick'); }, 150);
  }

  var prevD = null, prevH = null, prevM = null, prevS = null;

  function updateCountdown() {
    var diff = WEDDING_DATE - new Date();
    if (diff <= 0) {
      [countDays, countHours, countMinutes, countSeconds]
        .forEach(function (el) { el.textContent = '00'; });
      return;
    }
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000)  / 60000);
    var s = Math.floor((diff % 60000)    / 1000);

    if (d !== prevD) { countDays.textContent    = pad(d); tickAnimate(countDays);    prevD = d; }
    if (h !== prevH) { countHours.textContent   = pad(h); tickAnimate(countHours);   prevH = h; }
    if (m !== prevM) { countMinutes.textContent = pad(m); tickAnimate(countMinutes); prevM = m; }
    if (s !== prevS) { countSeconds.textContent = pad(s); tickAnimate(countSeconds); prevS = s; }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);


  /* ============================================================
     4. MUSIC
     ─────────────────────────────────────────────────────────────
     GOAL: Music plays automatically when the page opens.
           Button = Mute / Unmute only (music never stops).

     HOW AUTOPLAY WORKS ACROSS BROWSERS:
     ┌─────────────────────────────────────────────────────────┐
     │ All modern browsers block UNMUTED autoplay by default.  │
     │ MUTED autoplay is always allowed.                       │
     │ After ANY user gesture, unmuted audio is allowed.       │
     └─────────────────────────────────────────────────────────┘

     STRATEGY:
     1. Preload audio, set volume, start MUTED (always works).
     2. Attach a passive scroll listener — the instant the user
        scrolls even 1px (which happens naturally on any phone),
        unmute + play. This feels instant and automatic.
     3. ALSO attach click/touchstart listeners as backup.
     4. If the user taps the Music button before scrolling:
        - button click handler calls play() + unmutes directly.
     5. Once audio is playing unmuted, remove all unlock listeners.

     WHY SCROLL WORKS BETTER THAN CLICK:
     - Scrolling is the very first thing users do on a wedding
       invite — they scroll to see the content.
     - Scroll counts as a "user gesture" in all browsers.
     - This means music starts playing within 1-2 seconds of
       opening the page, automatically, without any button press.
  ============================================================ */

  var musicToggle = document.getElementById('musicToggle');
  var bgMusic     = document.getElementById('bgMusic');
  var musicLabel  = document.getElementById('musicLabel');
  var unlocked    = false;   /* true once audio is playing unmuted */

  /* Set button visual state */
  function setBtn(playing) {
    if (playing) {
      musicToggle.classList.add('is-playing');
      musicLabel.textContent = 'Mute';
      musicToggle.setAttribute('aria-label', 'Mute music');
    } else {
      musicToggle.classList.remove('is-playing');
      musicLabel.textContent = 'Music';
      musicToggle.setAttribute('aria-label', 'Play music');
    }
  }

  /* Remove all unlock gesture listeners once audio is running */
  function removeUnlockListeners() {
    document.removeEventListener('scroll',     onUserGesture, true);
    document.removeEventListener('touchstart', onUserGesture, true);
    document.removeEventListener('touchend',   onUserGesture, true);
    document.removeEventListener('click',      onUserGesture, true);
  }

  /* Called on the first user gesture — play unmuted */
  function onUserGesture() {
    if (unlocked) return;
    unlocked = true;
    removeUnlockListeners();

    bgMusic.muted = false;

    /* If somehow paused (total block earlier), restart */
    if (bgMusic.paused) {
      bgMusic.play()
        .then(function () { setBtn(true); })
        .catch(function () { setBtn(false); });
    } else {
      /* Was already playing muted — now unmuted */
      setBtn(true);
    }
  }

  /* Initialise audio on DOMContentLoaded */
  function initMusic() {
    bgMusic.volume = 0.7;
    bgMusic.muted  = true;    /* start muted — always allowed */

    /* Attempt muted autoplay */
    var p = bgMusic.play();

    if (p !== undefined) {
      p.then(function () {
        /* Muted play succeeded — now register gesture listeners to unmute */
        setBtn(false);   /* show "Music" (muted state) */

        /* Register unlock on scroll, touch, click */
        document.addEventListener('scroll',     onUserGesture, { once: true, capture: true, passive: true });
        document.addEventListener('touchstart', onUserGesture, { once: true, capture: true, passive: true });
        document.addEventListener('touchend',   onUserGesture, { once: true, capture: true, passive: true });
        document.addEventListener('click',      onUserGesture, { once: true, capture: true, passive: true });

      }).catch(function () {
        /* Even muted autoplay blocked — wait for button tap */
        setBtn(false);
        document.addEventListener('touchstart', onUserGesture, { once: true, capture: true, passive: true });
        document.addEventListener('click',      onUserGesture, { once: true, capture: true, passive: true });
      });
    } else {
      /* Old browser — try unmuted directly */
      bgMusic.muted = false;
      setBtn(true);
      unlocked = true;
    }
  }

  /* Run init */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMusic);
  } else {
    initMusic();
  }

  /* ── Music button: Mute / Unmute toggle ── */
  musicToggle.addEventListener('click', function () {

    if (!unlocked) {
      /*
       * User tapped the button before scrolling.
       * This IS a user gesture — play unmuted now.
       */
      unlocked = true;
      removeUnlockListeners();
      bgMusic.muted = false;

      if (bgMusic.paused) {
        bgMusic.play()
          .then(function () { setBtn(true); })
          .catch(function () { setBtn(false); });
      } else {
        setBtn(true);
      }
      return;
    }

    /* Normal toggle: already playing */
    if (bgMusic.paused) {
      bgMusic.muted = false;
      bgMusic.play()
        .then(function () { setBtn(true); })
        .catch(function () { setBtn(false); });
    } else {
      bgMusic.muted = !bgMusic.muted;
      setBtn(!bgMusic.muted);
    }
  });

  /* Keyboard accessibility */
  musicToggle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      musicToggle.click();
    }
  });

})();
