/* ============================================================================
   SCRIPT.JS — all the interactive behaviour of the site.

   There are five small, independent jobs:
     1. initHeader()      — give the top bar a background once you scroll
     2. initMobileMenu()  — open and close the hamburger menu on phones
     3. initActiveNav()   — put the little dot under the current page's link
     4. initReveal()      — fade sections in as they scroll into view
     5. initCarousel()    — the arrow and dots on "Tech in 100 Words"

   Each one is written so that if the elements it needs are missing (for
   example, the carousel only exists on the homepage) it quietly does nothing
   instead of throwing an error. That is what the early `if (!thing) return;`
   lines are for.
   ========================================================================= */

/* "use strict" turns on a stricter version of JavaScript that reports common
   mistakes (like using a variable you forgot to declare) instead of silently
   doing something surprising. */
'use strict';


/* ----------------------------------------------------------------------------
   1. HEADER — add a background once the page is scrolled
-------------------------------------------------------------------------- */
function initHeader() {
  // document.getElementById finds the one element with id="site-header".
  const header = document.getElementById('site-header');
  if (!header) return;  // no header on this page? nothing to do.

  // This function decides whether the header should have its solid background.
  function update() {
    // window.scrollY is how many pixels the page has been scrolled down.
    // classList.toggle(name, condition) adds the class when the condition is
    // true and removes it when false — so this one line handles both cases.
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  // Run it once now, in case the page loads already scrolled down
  // (which happens if you reload halfway down, or arrive at a #link).
  update();

  // Then run it every time the user scrolls.
  // { passive: true } promises the browser we won't block the scroll, which
  // lets it keep scrolling smoothly instead of waiting for our code.
  window.addEventListener('scroll', update, { passive: true });
}


/* ----------------------------------------------------------------------------
   2. MOBILE MENU — the hamburger button
-------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    // The CSS classes do the actual showing and hiding.
    nav.classList.toggle('is-open', open);
    toggle.classList.toggle('is-open', open);

    // These two attributes are for screen readers and are not optional:
    // aria-expanded announces whether the menu is currently open, and the
    // label changes so the button describes what it will do next.
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  // Clicking the hamburger flips the menu between open and closed.
  toggle.addEventListener('click', function () {
    const isOpen = nav.classList.contains('is-open');
    setOpen(!isOpen);  // "!" means "not", so this inverts the current state
  });

  // Tapping any link inside the menu should close it, otherwise the panel
  // stays open on top of the page you just navigated to.
  nav.addEventListener('click', function (event) {
    // event.target is the exact element that was clicked. .closest('a') walks
    // up the tree looking for the nearest link — so this is true whether the
    // user hit the text or some element inside the link.
    if (event.target.closest('a')) setOpen(false);
  });

  // Pressing Escape closes the menu — standard behaviour users expect.
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setOpen(false);
  });
}


/* ----------------------------------------------------------------------------
   3. ACTIVE NAV LINK — the small blue dot under the current page
-------------------------------------------------------------------------- */
function initActiveNav() {
  // window.location.pathname is the path part of the address bar, for example
  // "/Documents/personalWebsiteClaude/work.html".
  // .split('/') cuts it into pieces at each slash, and .pop() takes the last
  // one — the filename. If the address ends in a slash the filename is empty,
  // so we fall back to "index.html".
  const page = window.location.pathname.split('/').pop() || 'index.html';

  // querySelectorAll finds EVERY matching element and returns a list.
  document.querySelectorAll('.nav__link').forEach(function (link) {
    // getAttribute gives us the raw href as typed in the HTML ("work.html"),
    // rather than the full expanded URL that link.href would return.
    const target = link.getAttribute('href');
    if (target === page) link.classList.add('is-active');
  });
}


/* ----------------------------------------------------------------------------
   4. SCROLL REVEAL — fade elements in as they enter the screen
-------------------------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  // IntersectionObserver is a browser feature that watches elements and tells
  // us when they cross into or out of view. It is far more efficient than
  // checking positions on every scroll event, because the browser does the
  // work internally.
  //
  // Older browsers don't have it. If it's missing we just show everything
  // immediately — the content is what matters, the animation is a bonus.
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    // "entries" is the list of watched elements whose visibility just changed.
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;   // not on screen yet — skip it

      entry.target.classList.add('is-visible');

      // Stop watching this element. The animation should only ever play once,
      // and un-watching it frees up the browser's attention.
      observer.unobserve(entry.target);
    });
  }, {
    // Start the animation when the element's top edge is 12% up from the
    // bottom of the window, so it animates *as* it arrives rather than after.
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.05   // fire once 5% of the element is showing
  });

  items.forEach(function (el) { observer.observe(el); });
}


/* ----------------------------------------------------------------------------
   5. CAROUSEL — "Tech in 100 Words or Less"
-------------------------------------------------------------------------- */
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const nextBtn = document.getElementById('carousel-next');
  const dotsBox = document.getElementById('carousel-dots');

  // This section only exists on the homepage.
  if (!track || !nextBtn || !dotsBox) return;

  // Array.from turns the list of cards into a real array so we can use .map().
  const cards = Array.from(track.querySelectorAll('.carousel__card'));
  if (!cards.length) return;

  /* --- Build the dots, one per card ------------------------------------- */
  const dots = cards.map(function (card, index) {
    const dot = document.createElement('button');
    dot.className = 'carousel__dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Go to article ' + (index + 1));

    // Clicking a dot scrolls its card to the left edge of the track.
    dot.addEventListener('click', function () {
      track.scrollTo({ left: card.offsetLeft - cards[0].offsetLeft, behavior: 'smooth' });
    });

    dotsBox.appendChild(dot);   // put it on the page
    return dot;
  });

  /* --- How far is one card? --------------------------------------------- */
  // The distance to scroll for "one card" is the card's width plus the gap
  // between cards. We read the gap from the CSS instead of hard-coding 18px,
  // so changing the CSS automatically changes the scrolling too.
  function stepSize() {
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return cards[0].offsetWidth + gap;
  }

  /* --- Keep the dots and the button in sync with the scroll position ----- */
  function sync() {
    // scrollLeft      = how far we've scrolled
    // clientWidth     = the visible width of the track
    // scrollWidth     = the total width of all the content inside it
    // So when the first two add up to the third, we're at the end.
    // The "- 2" is a small tolerance, because browsers round these to
    // fractional pixels and an exact comparison would sometimes never match.
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;

    // Math.round turns "we are 1.4 cards along" into "card 1".
    // At the very end we force the last dot instead, because several cards
    // are visible at once: scrolled fully right, the last article IS showing,
    // even though the arithmetic above would still say card 1.
    const index = atEnd ? dots.length - 1 : Math.round(track.scrollLeft / stepSize());

    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
      // aria-current tells a screen reader which item is the selected one.
      if (i === index) {
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.removeAttribute('aria-current');
      }
    });

    // Once there is nothing further to scroll to, switch the arrow off.
    nextBtn.disabled = atEnd;
  }

  /* --- The next button --------------------------------------------------- */
  nextBtn.addEventListener('click', function () {
    track.scrollBy({ left: stepSize(), behavior: 'smooth' });
  });

  // Update the dots whenever the strip is scrolled — by the button, by a
  // swipe, or by a trackpad.
  track.addEventListener('scroll', sync, { passive: true });

  // Card widths use clamp() and change with the window size, so recalculate
  // after a resize too.
  window.addEventListener('resize', sync);

  sync();  // set the correct starting state
}


/* ----------------------------------------------------------------------------
   START EVERYTHING
   ----------------------------------------------------------------------------
   This file is loaded at the bottom of the <body>, so the HTML above it has
   already been parsed and every element exists. We can just call the
   functions directly — no need to wait for a "DOMContentLoaded" event.
-------------------------------------------------------------------------- */
initHeader();
initMobileMenu();
initActiveNav();
initReveal();
initCarousel();
