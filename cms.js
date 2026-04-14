/* cms.js — Public Page Content Loader for OCA Watersports
 * Loads dynamic content from Supabase on every page.
 * No SDK required — uses plain fetch() against PostgREST / RPC endpoints.
 * ES5-compatible syntax to match the rest of the site.
 */
(function () {
  'use strict';

  /* ─── Supabase connection ─────────────────────────────────────────────── */
  var SUPABASE_URL = 'https://kokusecmajupumitprue.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtva3VzZWNtYWp1cHVtaXRwcnVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMTgxODYsImV4cCI6MjA5MTY5NDE4Nn0.bXBDmhm1nzmjxwCD4HTIh0FE_S64ej3p05uAATauhZk';

  var FH_URL = 'https://fareharbor.com/embeds/book/underthebridgewatersports/?full-items=yes';
  var PHONE_HREF = 'tel:4106297433';
  var PHONE_LABEL = '410-629-RIDE';

  /* ─── Shared headers ──────────────────────────────────────────────────── */
  function baseHeaders() {
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
  }

  /* ─── supabaseGet(table, query) ───────────────────────────────────────── */
  // query: optional URL search string, e.g. "select=*&order=created_at.asc"
  function supabaseGet(table, query) {
    var url = SUPABASE_URL + '/rest/v1/' + table;
    if (query) { url += '?' + query; }
    return fetch(url, {
      method: 'GET',
      headers: baseHeaders()
    }).then(function (res) {
      if (!res.ok) { throw new Error('supabaseGet failed: ' + res.status); }
      return res.json();
    });
  }

  /* ─── supabaseRpc(fnName, params) ────────────────────────────────────── */
  function supabaseRpc(fnName, params) {
    var url = SUPABASE_URL + '/rest/v1/rpc/' + fnName;
    return fetch(url, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify(params || {})
    }).then(function (res) {
      if (!res.ok) { throw new Error('supabaseRpc failed: ' + res.status); }
      return res.json();
    });
  }

  /* ─── escHtml(str) ───────────────────────────────────────────────────── */
  function escHtml(str) {
    var div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  /* ─── loadContent() ──────────────────────────────────────────────────── */
  // Finds all [data-cms] elements, fetches site_content rows, swaps textContent.
  // Fails silently — hardcoded HTML is the fallback.
  function loadContent() {
    var els = document.querySelectorAll('[data-cms]');
    if (!els.length) { return; }

    supabaseGet('site_content', 'select=id,content').then(function (rows) {
      var map = {};
      for (var i = 0; i < rows.length; i++) {
        map[rows[i].id] = rows[i].content;
      }
      for (var j = 0; j < els.length; j++) {
        var key = els[j].getAttribute('data-cms');
        if (map[key] !== undefined && map[key] !== '') {
          els[j].innerHTML = map[key];
        }
      }
    }).catch(function () {
      // Fail silently — hardcoded HTML remains.
    });
  }

  /* ─── Copy-button binder ─────────────────────────────────────────────── */
  function bindCopyButtons(scope) {
    var btns = (scope || document).querySelectorAll('.coupon-copy-btn');
    for (var i = 0; i < btns.length; i++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          var code = btn.getAttribute('data-code');
          var label = btn.querySelector('.coupon-copy-btn__label');
          if (!navigator.clipboard) { return; }
          navigator.clipboard.writeText(code).then(function () {
            btn.classList.add('copied');
            if (label) { label.textContent = 'COPIED!'; }
            setTimeout(function () {
              btn.classList.remove('copied');
              if (label) { label.textContent = 'COPY'; }
            }, 2000);
          }).catch(function () {});
        });
      }(btns[i]));
    }
  }

  /* ─── Reveal observer re-init ────────────────────────────────────────── */
  function initReveal(scope) {
    var revealEls = (scope || document).querySelectorAll('.reveal:not(.visible)');
    if (!revealEls.length) { return; }
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add('visible');
            obs.unobserve(entries[i].target);
          }
        }
      }, { threshold: 0.08 });
      for (var j = 0; j < revealEls.length; j++) {
        obs.observe(revealEls[j]);
      }
    } else {
      for (var k = 0; k < revealEls.length; k++) {
        revealEls[k].classList.add('visible');
      }
    }
  }

  /* ─── Copy SVG icon markup ───────────────────────────────────────────── */
  var COPY_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';

  /* ─── renderCouponCards(container, coupons) ──────────────────────────── */
  function renderCouponCards(container, coupons) {
    if (!container || !coupons || !coupons.length) { return; }

    var delays = ['d1', 'd2', 'd3'];
    var html = '';

    for (var i = 0; i < coupons.length; i++) {
      var c = coupons[i];
      var delay = delays[i % 3];
      var cat = (c.category || '').toLowerCase();
      var isSpecial = cat === 'special';
      var isBoat = cat === 'boat';
      var hasCode = !!(c.code);

      // Base card classes
      var cardClasses = 'coupon-card reveal ' + delay;
      if (isSpecial) { cardClasses += ' coupon-card--local'; }

      // max-width style for boat and special cards
      var styleAttr = (isBoat || isSpecial) ? ' style="max-width:600px;"' : '';

      html += '<div class="' + escHtml(cardClasses) + '"' + styleAttr + '>';
      html += '<div class="coupon-card__body">';

      // Type label
      html += '<p class="coupon-card__type">' + escHtml(c.type_label || '') + '</p>';

      if (isSpecial && !hasCode) {
        // Special/local: type_label used as the code display, no copy button
        html += '<p class="coupon-card__code" style="font-size:1.2rem;">' + escHtml(c.type_label || '') + '</p>';
      } else {
        // Code row with copy button
        html += '<p class="coupon-card__code-row">';
        html += '<span class="coupon-card__code">' + escHtml(c.code) + '</span>';
        html += '<button class="coupon-copy-btn" data-code="' + escHtml(c.code) + '" aria-label="Copy code ' + escHtml(c.code) + '">';
        html += COPY_SVG;
        html += '<span class="coupon-copy-btn__label">COPY</span>';
        html += '</button>';
        html += '</p>';
      }

      // Offer
      if (c.offer) {
        html += '<p class="coupon-card__offer">' + escHtml(c.offer) + '</p>';
      }

      // Detail
      if (c.detail) {
        html += '<p class="coupon-card__detail">' + escHtml(c.detail) + '</p>';
      }

      html += '</div>'; // .coupon-card__body

      // Footer buttons
      html += '<div class="coupon-card__foot">';

      if (isSpecial && !hasCode) {
        // Single "CALL FOR LOCAL RATE" button
        html += '<a class="btn btn--gold coupon-card__book-btn" href="' + PHONE_HREF + '">CALL FOR LOCAL RATE</a>';
      } else if (isBoat) {
        // Single "CALL TO BOOK" button
        html += '<a class="btn btn--gold coupon-card__book-btn" href="' + PHONE_HREF + '">CALL TO BOOK</a>';
      } else {
        // Two buttons: BOOK & APPLY CODE + CALL
        html += '<a class="btn btn--gold coupon-card__book-btn" href="' + escHtml(FH_URL) + '">BOOK &amp; APPLY CODE</a>';
        html += '<a class="btn btn--outline btn--on-dark coupon-card__call-btn" href="' + PHONE_HREF + '">CALL ' + escHtml(PHONE_LABEL) + '</a>';
      }

      html += '</div>'; // .coupon-card__foot
      html += '</div>'; // .coupon-card
    }

    container.innerHTML = html;
    bindCopyButtons(container);
    initReveal(container);
  }

  /* ─── loadCoupons() ──────────────────────────────────────────────────── */
  function loadCoupons() {
    var gridJetski  = document.getElementById('coupon-grid-jetski');
    var gridBoat    = document.getElementById('coupon-grid-boat');
    var gridSpecial = document.getElementById('coupon-grid-special');

    // Only run on pages that have at least one coupon grid container.
    if (!gridJetski && !gridBoat && !gridSpecial) { return; }

    supabaseGet(
      'coupons',
      'select=*&active=eq.true&order=created_at.asc'
    ).then(function (rows) {
      // Group by category
      var groups = { 'jet-ski': [], 'boat': [], 'special': [] };
      for (var i = 0; i < rows.length; i++) {
        var cat = rows[i].category || '';
        if (groups[cat] !== undefined) {
          groups[cat].push(rows[i]);
        }
      }

      if (gridJetski)  { renderCouponCards(gridJetski,  groups['jet-ski']);  }
      if (gridBoat)    { renderCouponCards(gridBoat,    groups['boat']);    }
      if (gridSpecial) { renderCouponCards(gridSpecial, groups['special']); }
    }).catch(function () {
      // Fail silently — hardcoded HTML remains in the page.
    });
  }

  /* ─── Expose window.CMS for admin page use ───────────────────────────── */
  window.CMS = {
    supabaseGet: supabaseGet,
    supabaseRpc: supabaseRpc
  };

  /* ─── Live preview listener ───────────────────────────────────────────── */
  // Admin page sends postMessage with {cmsKey, cmsValue} as the user types.
  // We update the matching element instantly — no save/refresh needed.
  window.addEventListener('message', function (e) {
    if (!e.data || !e.data.cmsKey) { return; }
    var el = document.querySelector('[data-cms="' + e.data.cmsKey + '"]');
    if (el) {
      el.innerHTML = e.data.cmsValue;
    }
  });

  /* ─── Bootstrap ──────────────────────────────────────────────────────── */
  function init() {
    loadContent();
    loadCoupons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
