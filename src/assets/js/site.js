// DeepRest: menu button, and Calendly booking loaded only after the visitor chooses it.
(function () {
  'use strict';

  var CONSENT_KEY = 'deeprest-calendly-consent';
  var CALENDLY_JS = 'https://assets.calendly.com/assets/external/widget.js';
  var CALENDLY_CSS = 'https://assets.calendly.com/assets/external/widget.css';
  var root = document.documentElement;
  var calendlyUrl = root.getAttribute('data-calendly-url');

  function hasConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY) === 'granted';
    } catch (e) {
      return false;
    }
  }

  function setConsent(granted) {
    try {
      if (granted) localStorage.setItem(CONSENT_KEY, 'granted');
      else localStorage.removeItem(CONSENT_KEY);
    } catch (e) {
      /* storage blocked: the choice simply isn't remembered */
    }
    root.classList.toggle('calendly-consented', granted);
    showConsentStatus();
  }

  // Menu button on small screens.
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Calendly's script and styles, fetched once and only when needed.
  var calendlyReady = null;
  function loadCalendly() {
    if (calendlyReady) return calendlyReady;
    calendlyReady = new Promise(function (resolve, reject) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = CALENDLY_CSS;
      document.head.appendChild(css);
      var script = document.createElement('script');
      script.src = CALENDLY_JS;
      script.async = true;
      script.onload = function () {
        if (window.Calendly) resolve(window.Calendly);
        else reject(new Error('Calendly did not start'));
      };
      script.onerror = function () {
        reject(new Error('Calendly could not be loaded'));
      };
      document.head.appendChild(script);
    });
    calendlyReady.catch(function () {
      calendlyReady = null;
    });
    return calendlyReady;
  }

  // The booking button in the header opens Calendly's popup.
  var dialog = document.getElementById('calendly-consent');
  var pendingPopup = null;

  function openPopup(fallbackHref) {
    loadCalendly().then(
      function (Calendly) {
        Calendly.initPopupWidget({ url: calendlyUrl });
      },
      function () {
        window.location.href = fallbackHref;
      }
    );
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-calendly-popup]'), function (link) {
    link.addEventListener('click', function (e) {
      if (!calendlyUrl) return;
      if (hasConsent()) {
        e.preventDefault();
        openPopup(link.href);
      } else if (dialog && typeof dialog.showModal === 'function') {
        e.preventDefault();
        pendingPopup = link.href;
        dialog.returnValue = '';
        dialog.showModal();
      }
      // Otherwise the link simply goes to the booking page.
    });
  });

  if (dialog) {
    dialog.addEventListener('close', function () {
      if (dialog.returnValue === 'continue' && pendingPopup) {
        setConsent(true);
        openPopup(pendingPopup);
        startInline();
      }
      pendingPopup = null;
    });
  }

  // The calendar on the booking page.
  var frame = document.querySelector('[data-calendly-inline]');
  var inlineStarted = false;

  function startInline() {
    if (!frame || inlineStarted || !calendlyUrl) return;
    inlineStarted = true;
    frame.classList.add('is-loading');
    loadCalendly().then(
      function (Calendly) {
        frame.textContent = '';
        frame.classList.remove('is-loading');
        Calendly.initInlineWidget({ url: calendlyUrl, parentElement: frame });
      },
      function () {
        inlineStarted = false;
        frame.classList.remove('is-loading');
        root.classList.remove('calendly-consented');
        var gate = frame.querySelector('.booking-gate-inner');
        var text = frame.querySelector('.booking-gate-text');
        if (gate && text) {
          text.textContent =
            'The booking calendar could not be loaded. Please check your connection and try again, or book on Calendly’s website.';
        }
      }
    );
  }

  if (frame) {
    var showButton = frame.querySelector('[data-calendly-consent]');
    if (showButton) {
      showButton.addEventListener('click', function () {
        setConsent(true);
        startInline();
      });
    }
    if (hasConsent()) startInline();
  }

  // The choice shown, and cleared, on the cookie notice.
  var status = document.querySelector('[data-consent-status]');
  var forget = document.querySelector('[data-consent-forget]');

  function showConsentStatus() {
    if (!status) return;
    var granted = hasConsent();
    status.textContent = granted
      ? 'On this device, you have chosen to load the Calendly booking calendar.'
      : 'On this device, you have not chosen to load the Calendly booking calendar, so it will not load until you ask for it.';
    if (forget) forget.disabled = !granted;
  }

  if (forget) {
    forget.addEventListener('click', function () {
      setConsent(false);
    });
  }
  showConsentStatus();
})();
