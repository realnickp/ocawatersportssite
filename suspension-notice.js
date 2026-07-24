/* suspension-notice.js — Jet Ski Suspension Notice Popup
 * Shown on: index, jet-skis, interactive-map, the-6-mile-ride.
 * Injects its own styles + markup, shows once per browser session
 * (shared sessionStorage key across all pages).
 *
 * TO TURN THE NOTICE OFF SITEWIDE: set NOTICE_ACTIVE to false below,
 * or remove the <script src="suspension-notice.js"> tag from each page.
 */
(function () {
  'use strict';

  var NOTICE_ACTIVE = true;
  if (!NOTICE_ACTIVE) { return; }

  var SEEN_KEY = 'ocaSuspensionNoticeSeen';

  /* Jet-ski-intent pages get their own seen-flag: visitors who already saw
   * the notice on the homepage still see it once more on a jet ski page,
   * since that is where the suspension matters most. */
  var JETSKI_SEEN_KEY = 'ocaSuspensionNoticeSeenJetski';
  var isJetskiPage = /\/(jet-skis|the-6-mile-ride)(\.html)?\/?$/.test(window.location.pathname);

  var css = '' +
    '.ntcpop { position: fixed; inset: 0; z-index: 99999; display: none; align-items: center; justify-content: center; padding: 1rem; background: rgba(2, 25, 34, 0.82); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); opacity: 0; transition: opacity 0.25s ease; }' +
    '.ntcpop.is-open { display: flex; opacity: 1; }' +
    '.ntcpop__card { position: relative; width: 100%; max-width: 560px; max-height: 92vh; overflow-y: auto; background: #021922; color: #fff; border-radius: 18px; border-top: 4px solid #debc6b; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(222, 188, 107, 0.15); transform: translateY(14px) scale(0.98); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); font-family: "Manrope", system-ui, sans-serif; -webkit-overflow-scrolling: touch; }' +
    '.ntcpop.is-open .ntcpop__card { transform: translateY(0) scale(1); }' +
    '.ntcpop__card::-webkit-scrollbar { width: 8px; }' +
    '.ntcpop__card::-webkit-scrollbar-track { background: transparent; }' +
    '.ntcpop__card::-webkit-scrollbar-thumb { background: rgba(222, 188, 107, 0.35); border-radius: 4px; }' +
    '.ntcpop__close { position: sticky; top: 12px; margin-left: auto; margin-right: 12px; z-index: 5; width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.25); background: rgba(2, 25, 34, 0.85); color: #fff; font-size: 22px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease; }' +
    '.ntcpop__close:hover { background: rgba(2, 25, 34, 0.95); border-color: #debc6b; transform: scale(1.05); }' +
    '.ntcpop__close:focus-visible { outline: 2px solid #debc6b; outline-offset: 2px; }' +
    '.ntcpop__body { padding: 0 1.75rem 1.9rem; text-align: center; margin-top: -26px; }' +
    '.ntcpop__logo { width: 120px; height: auto; margin: 0 auto 0.9rem; display: block; filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.5)); }' +
    '.ntcpop__eyebrow { display: inline-block; color: #debc6b; border: 1px solid rgba(222, 188, 107, 0.45); font-size: 10px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; margin-bottom: 1rem; }' +
    '.ntcpop__title { font-family: "Audiowide", cursive; font-size: 1.6rem; line-height: 1.15; color: #fff; margin: 0 0 0.45rem; letter-spacing: 0.01em; }' +
    '.ntcpop__sub { font-size: 0.85rem; color: #debc6b; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 1.1rem; }' +
    '.ntcpop__copy { font-size: 0.94rem; line-height: 1.6; color: #c9d4e5; margin: 0 0 1.2rem; text-align: left; }' +
    '.ntcpop__good { background: rgba(222, 188, 107, 0.08); border: 1px solid rgba(222, 188, 107, 0.28); border-radius: 12px; padding: 1.1rem 1.1rem 1.25rem; margin: 0 0 1.2rem; }' +
    '.ntcpop__good-title { font-family: "Audiowide", cursive; font-size: 1.05rem; color: #debc6b; line-height: 1.3; margin: 0 0 0.5rem; }' +
    '.ntcpop__good-copy { font-size: 0.92rem; line-height: 1.55; color: #c9d4e5; margin: 0 0 1rem; }' +
    '.ntcpop__cta { display: inline-block; background: #debc6b; color: #23262d; font-weight: 800; font-size: 0.95rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 14px 28px; border-radius: 10px; text-decoration: none; transition: transform 0.15s ease, box-shadow 0.15s ease; }' +
    '.ntcpop__cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(222, 188, 107, 0.35); text-decoration: none; }' +
    '.ntcpop__alt { display: block; margin-top: 0.7rem; font-size: 0.82rem; color: #c9d4e5; }' +
    '.ntcpop__alt a { color: #debc6b; text-decoration: underline; }' +
    '.ntcpop__letter { text-align: left; margin: 0 0 1.1rem; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; }' +
    '.ntcpop__letter summary { cursor: pointer; list-style: none; padding: 0.8rem 1rem; font-size: 0.8rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #debc6b; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }' +
    '.ntcpop__letter summary::-webkit-details-marker { display: none; }' +
    '.ntcpop__letter summary::after { content: "+"; font-size: 1.1rem; line-height: 1; }' +
    '.ntcpop__letter[open] summary::after { content: "\\2212"; }' +
    '.ntcpop__letter-inner { padding: 0 1rem 1rem; font-size: 0.88rem; line-height: 1.6; color: #c9d4e5; }' +
    '.ntcpop__letter-inner p { margin: 0 0 0.85rem; }' +
    '.ntcpop__letter-inner a { color: #debc6b; }' +
    '.ntcpop__sig { font-size: 0.9rem; color: #fff; font-weight: 700; margin: 0 0 0.2rem; }' +
    '.ntcpop__foot { display: block; font-size: 0.72rem; color: #8899b5; margin-top: 0.8rem; letter-spacing: 0.02em; }' +
    '@media (max-width: 480px) {' +
    '  .ntcpop__body { padding: 0 1.15rem 1.5rem; }' +
    '  .ntcpop__title { font-size: 1.3rem; }' +
    '  .ntcpop__logo { width: 92px; margin-bottom: 0.6rem; }' +
    '  .ntcpop__copy { font-size: 0.88rem; line-height: 1.5; margin-bottom: 1rem; }' +
    '  .ntcpop__eyebrow { margin-bottom: 0.7rem; }' +
    '  .ntcpop__good { padding: 0.9rem 0.9rem 1.05rem; }' +
    '}';

  var html = '' +
    '<div class="ntcpop__card">' +
    '  <button type="button" class="ntcpop__close" id="ntcpopClose" aria-label="Close">&times;</button>' +
    '  <div class="ntcpop__body">' +
    '    <img class="ntcpop__logo" src="/images/OCA_LogoWhite-final.png" alt="OCA Watersports" />' +
    '    <span class="ntcpop__eyebrow">An Important Notice</span>' +
    '    <h2 class="ntcpop__title" id="ntcpopTitle">Jet Ski Rides Are Temporarily Suspended</h2>' +
    '    <p class="ntcpop__sub">Effective immediately &middot; until further notice</p>' +
    '    <p class="ntcpop__copy">Due to circumstances beyond our control involving the permitting process, we have had to pause our jet ski operations while the matter is resolved through the proper legal channels. We know many of you planned your vacation around our famous 6-Mile Ride, and we are truly sorry. We are working on a solution every single day.</p>' +
    '    <div class="ntcpop__good">' +
    '      <p class="ntcpop__good-title">The Good News: Our Pontoons Are Still Cruising</p>' +
    '      <p class="ntcpop__good-copy">Private pontoon boat rentals are still on the water every day. Up to 12 guests, free reign of the bay from Ocean City to Assateague Island. Call us and we will help make your vacation special.</p>' +
    '      <a class="ntcpop__cta" href="tel:4106297433" id="ntcpopCta">Call 410-629-RIDE (7433)</a>' +
    '      <span class="ntcpop__alt">or <a href="/pontoon-boats">see our pontoon rentals</a></span>' +
    '    </div>' +
    '    <details class="ntcpop__letter">' +
    '      <summary>Read the full letter from our family</summary>' +
    '      <div class="ntcpop__letter-inner">' +
    '        <p><strong style="color:#fff;">Important Notice to Our Valued Customers</strong></p>' +
    '        <p>It is with great disappointment that we must announce the temporary suspension of our jet ski operations, effective immediately, until further notice.</p>' +
    '        <p>Due to circumstances beyond our control involving the permitting process, we are currently unable to continue offering our jet ski rides. We entered this season with the understanding that the permitting process would move forward with the assistance of our landlord as previously discussed. Unfortunately, that has not occurred, leaving us with no choice but to temporarily pause our jet ski operations while these matters are resolved through the appropriate legal channels.</p>' +
    '        <p>This is an incredibly difficult moment for our family and our team. We know many of you had vacations planned, reservations booked, or were looking forward to experiencing our famous 6-Mile Jet Ski Ride. We are truly sorry that we cannot provide the experience you were expecting this summer.</p>' +
    '        <p>The good news is that OCA Watersports is still open for our private pontoon boat rentals! You and your family can still get out on the water and enjoy beautiful Ocean City and our unforgettable Assateague Island boating experience. We would love the opportunity to help make your vacation special, so give us a call at <a href="tel:4106297433">410-629-RIDE (7433)</a> to reserve your boat today.</p>' +
    '        <p>This was our very first season as OCA Watersports, and it was shaping up to be an unforgettable year. The excitement surrounding our new brand, new location, and expanded experiences exceeded anything we could have imagined. To top it off, we were honored to be voted Best Jet Ski Rental Company in Ocean City, Maryland in our very first year. That recognition meant the world to us and would not have been possible without your incredible support.</p>' +
    '        <p>To everyone who has supported OCA Watersports, and before that, Under The Bridge Watersports, whether you have ridden with us once or made us part of your family\'s Ocean City tradition, please know how grateful we are. Your loyalty, encouragement, and support over the years mean more than words can express, and they are what motivate us to keep working tirelessly toward a solution.</p>' +
    '        <p>We are actively exploring every available option, including an immediate temporary solution for the remainder of this season. We remain hopeful that we will be back on the water as soon as possible and are doing everything we can to make that happen.</p>' +
    '        <p>Please continue to check our website and follow our social media pages for updates. The moment we have good news to share, you will be the first to know.</p>' +
    '        <p>This is not the ending of our story. It is simply an unexpected setback. OCA Watersports was built on hard work, determination, and the incredible support of our customers. We are committed to doing everything we can to get our jet skis back on the water, and we look forward to welcoming you and your family back for the unforgettable 6 Mile Ride experience and memories you have come to expect from us.</p>' +
    '        <p>Thank you for your patience, your understanding, and your continued support during this challenging time.</p>' +
    '        <p style="color:#fff;font-weight:700;">&mdash; The OCA Watersports Family</p>' +
    '      </div>' +
    '    </details>' +
    '    <p class="ntcpop__sig">With gratitude, The OCA Watersports Family</p>' +
    '    <span class="ntcpop__foot">Follow our social pages for updates &middot; Press ESC to close</span>' +
    '  </div>' +
    '</div>';

  function init() {
    if (isJetskiPage) {
      if (sessionStorage.getItem(JETSKI_SEEN_KEY) === '1') { return; }
    } else {
      if (sessionStorage.getItem(SEEN_KEY) === '1') { return; }
    }

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    var pop = document.createElement('div');
    pop.className = 'ntcpop';
    pop.id = 'ocaNoticePopup';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-modal', 'true');
    pop.setAttribute('aria-labelledby', 'ntcpopTitle');
    pop.setAttribute('aria-hidden', 'true');
    pop.innerHTML = html;
    document.body.appendChild(pop);

    var closeBtn = document.getElementById('ntcpopClose');
    var cta = document.getElementById('ntcpopCta');
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      pop.classList.add('is-open');
      pop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      setTimeout(function () { closeBtn.focus(); }, 50);
      sessionStorage.setItem(SEEN_KEY, '1');
      if (isJetskiPage) { sessionStorage.setItem(JETSKI_SEEN_KEY, '1'); }
    }

    function close() {
      pop.classList.remove('is-open');
      pop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus && typeof lastFocus.focus === 'function') { lastFocus.focus(); }
    }

    closeBtn.addEventListener('click', close);
    pop.addEventListener('click', function (e) { if (e.target === pop) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && pop.classList.contains('is-open')) close();
    });
    if (cta) { cta.addEventListener('click', close); }

    setTimeout(open, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
