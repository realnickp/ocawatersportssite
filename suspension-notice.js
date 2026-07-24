/* suspension-notice.js — Jet Ski Suspension Notice Popup
 * Shown on: index, jet-skis, interactive-map, the-6-mile-ride.
 * Injects its own styles + markup, shows once per browser session
 * (shared sessionStorage key across all pages; jet ski pages get their
 * own key so jet-ski-intent visitors always see it at least once there).
 *
 * Per client request the popup is a vertical scroll of the 7 notice
 * slides (images/notice-slide-1.jpg .. 7), with the call CTA pinned
 * at the bottom of the card.
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
    '.ntcpop__card { position: relative; width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto; background: #021922; color: #fff; border-radius: 18px; border-top: 4px solid #debc6b; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(222, 188, 107, 0.15); transform: translateY(14px) scale(0.98); transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); font-family: "Manrope", system-ui, sans-serif; -webkit-overflow-scrolling: touch; }' +
    '.ntcpop.is-open .ntcpop__card { transform: translateY(0) scale(1); }' +
    '.ntcpop__card::-webkit-scrollbar { width: 8px; }' +
    '.ntcpop__card::-webkit-scrollbar-track { background: transparent; }' +
    '.ntcpop__card::-webkit-scrollbar-thumb { background: rgba(222, 188, 107, 0.35); border-radius: 4px; }' +
    '.ntcpop__close { position: sticky; top: 10px; float: right; margin: 10px 10px 0 0; z-index: 5; width: 38px; height: 38px; border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.3); background: rgba(2, 25, 34, 0.85); color: #fff; font-size: 22px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease; }' +
    '.ntcpop__close:hover { background: rgba(2, 25, 34, 0.95); border-color: #debc6b; transform: scale(1.05); }' +
    '.ntcpop__close:focus-visible { outline: 2px solid #debc6b; outline-offset: 2px; }' +
    '.ntcpop__slides { display: block; }' +
    '.ntcpop__slides img { display: block; width: 100%; height: auto; }' +
    '.ntcpop__ctabar { position: sticky; bottom: 0; z-index: 4; background: rgba(2, 25, 34, 0.96); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); border-top: 1px solid rgba(222, 188, 107, 0.3); text-align: center; padding: 0.85rem 1rem 0.95rem; }' +
    '.ntcpop__cta { display: inline-block; background: #debc6b; color: #23262d; font-weight: 800; font-size: 0.95rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 13px 26px; border-radius: 10px; text-decoration: none; transition: transform 0.15s ease, box-shadow 0.15s ease; }' +
    '.ntcpop__cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(222, 188, 107, 0.35); text-decoration: none; }' +
    '.ntcpop__alt { display: block; margin-top: 0.5rem; font-size: 0.8rem; color: #c9d4e5; }' +
    '.ntcpop__alt a { color: #debc6b; text-decoration: underline; }' +
    '@media (max-width: 480px) {' +
    '  .ntcpop { padding: 0.6rem; }' +
    '  .ntcpop__cta { font-size: 0.88rem; padding: 12px 20px; }' +
    '}';

  var html = '' +
    '<div class="ntcpop__card">' +
    '  <button type="button" class="ntcpop__close" id="ntcpopClose" aria-label="Close">&times;</button>' +
    '  <div class="ntcpop__slides">' +
    '    <img src="/images/notice-slide-1.jpg" alt="We\'re sorry. An important update about our jet ski rides." />' +
    '    <img src="/images/notice-slide-2.jpg" loading="lazy" alt="Jet ski rentals are temporarily paused due to circumstances outside of our control involving the permitting process." />' +
    '    <img src="/images/notice-slide-3.jpg" loading="lazy" alt="We know this is disappointing. We are truly sorry we cannot provide the famous 6-Mile Ride experience this summer." />' +
    '    <img src="/images/notice-slide-4.jpg" loading="lazy" alt="The good news: private pontoon boat rentals remain open. Call 410-629-7433 to reserve." />' +
    '    <img src="/images/notice-slide-5.jpg" loading="lazy" alt="Thank you to everyone who has supported OCA. Voted number 1 best jet ski rentals in Ocean City 2026." />' +
    '    <img src="/images/notice-slide-6.jpg" loading="lazy" alt="We are actively exploring every option, including an immediate temporary solution for this season. Check our website and social pages for updates." />' +
    '    <img src="/images/notice-slide-7.jpg" loading="lazy" alt="This isn\'t goodbye. Call 410-629-7433 or visit OCAWatersports.com. Thank you for standing with the OCA Watersports family." />' +
    '  </div>' +
    '  <div class="ntcpop__ctabar">' +
    '    <a class="ntcpop__cta" href="tel:4106297433" id="ntcpopCta">Call 410-629-RIDE (7433)</a>' +
    '    <span class="ntcpop__alt">or <a href="/pontoon-boats">see our pontoon rentals</a></span>' +
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
    pop.setAttribute('aria-label', 'An important notice about our jet ski rides');
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
