(function () {
  // The one WhatsApp number every enquiry is sent to
  var WA = '917004910439';

  var b = document.querySelector('.burger'), n = document.querySelector('nav.main');
  function setMenu(o) {
    n.classList.toggle('open', o);
    b.setAttribute('aria-expanded', o);
    b.textContent = o ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', o);
  }
  if (b) {
    b.addEventListener('click', function () { setMenu(!n.classList.contains('open')); });
    n.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('click', function (e) {
      if (n.classList.contains('open') && !n.contains(e.target) && !b.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && n.classList.contains('open')) { setMenu(false); b.focus(); }
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  // Time-limited offers (crash course banner, card, dropdown option) remove themselves after their last day
  document.querySelectorAll('[data-until]').forEach(function (el) {
    if (Date.now() > Date.parse(el.dataset.until + 'T23:59:59+05:30')) el.remove();
  });

  // Accepts "9876543210", "+91 98765 43210", "098765-43210"; returns the 10 digits, or '' if invalid
  function mobile(v) {
    var d = v.replace(/[\s()-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, '');
    return /^[6-9]\d{9}$/.test(d) ? d : '';
  }

  // Enquiry form -> opens WhatsApp with the details pre-filled
  document.querySelectorAll('form.enq').forEach(function (f) {
    var ph = f.elements.phone, err = f.querySelector('.err'), thanks = f.querySelector('.thanks');
    function check(show) {
      var ok = !!mobile(ph.value);
      ph.setCustomValidity(ok ? '' : 'Please enter a valid 10-digit mobile number.');
      if (show || ok) {
        err.hidden = ok;
        ph.setAttribute('aria-invalid', !ok);
      }
      return ok;
    }
    check(false);
    ph.addEventListener('input', function () { check(!err.hidden); });
    ph.addEventListener('blur', function () { if (ph.value) check(true); });
    ph.addEventListener('invalid', function () { check(true); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!check(true)) return ph.focus();
      var d = new FormData(f);
      var msg = 'Hello Advent Academy, I would like to enquire.%0A' +
        'Student: ' + encodeURIComponent(d.get('name')) + '%0A' +
        'Class / Course: ' + encodeURIComponent(d.get('course')) + '%0A' +
        'Parent phone: ' + encodeURIComponent('+91 ' + mobile(d.get('phone'))) +
        (d.get('note') ? '%0A' + encodeURIComponent(d.get('note')) : '');
      window.open('https://wa.me/' + WA + '?text=' + msg, '_blank', 'noopener');
      thanks.hidden = false;
    });
  });

  // On desktop the floating WhatsApp pill steps aside while the enquiry form is on screen
  var act = document.querySelector('.actbar'), form = document.querySelector('form.enq');
  if (act && form && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      act.classList.toggle('away', es[0].isIntersecting);
    }).observe(form);
  }

  // Header shadow + reading progress bar
  var head = document.querySelector('header.site'), bar = document.createElement('div'), ticking = false;
  bar.className = 'progress';
  document.body.appendChild(bar);
  function onScroll() {
    var y = window.scrollY, max = document.documentElement.scrollHeight - window.innerHeight;
    if (head) head.classList.toggle('scrolled', y > 30);
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px 10% 0px' });

  // Scroll reveal: siblings stagger, two-column blocks slide in from either side
  var reveal = '.sec-head,.prog .row,.reason,.tcard,.split>div,.courseblock,.facts>div,.faq details,.contact-list li,.map,.cta-band .wrap>*,.ticks li,.fgrid>div';
  document.querySelectorAll(reveal).forEach(function (el) {
    var p = el.parentNode, i = Array.prototype.indexOf.call(p.children, el);
    if (p.matches('.split,.cta-band .wrap')) el.classList.add(i ? 'rv-r' : 'rv-l');
    else el.style.setProperty('--d', Math.min(i, 5));
    el.classList.add('rv');
    // drop the reveal classes once done so hover transforms work again
    el.addEventListener('animationend', function done(e) {
      if (e.target !== el) return;
      el.classList.remove('rv', 'rv-l', 'rv-r', 'in');
      el.removeEventListener('animationend', done);
    });
    io.observe(el);
  });

  // Smart board: type the lesson out line by line
  document.querySelectorAll('.board .ch').forEach(function (ch) {
    ch.innerHTML = ch.innerHTML.split(/<br\s*\/?>/i).map(function (l, i) {
      return '<span class="ln" style="--i:' + i + '">' + (l.trim() || '&nbsp;') + '</span>';
    }).join('');
    io.observe(ch.closest('.board'));
  });

  // Class strip becomes an endless marquee
  var strip = document.querySelector('.strip .wrap');
  if (strip) {
    var half = document.createElement('div'), track = document.createElement('div'), once = strip.innerHTML;
    half.className = 'half';
    half.innerHTML = once + (once + once).replace(/<span>/g, '<span aria-hidden="true">');
    var copy = half.cloneNode(true);
    copy.setAttribute('aria-hidden', 'true');
    track.className = 'track';
    track.append(half, copy);
    strip.replaceChildren(track);
    strip.classList.add('marq');
  }

  // Floating triangles behind the hero and page headers
  var tris = [[5, 20, 22, 9], [16, 74, 14, 12], [36, 10, 10, 8], [60, 82, 18, 11], [76, 18, 12, 10], [90, 62, 26, 13], [48, 46, 8, 7]];
  document.querySelectorAll('.hero,.phead').forEach(function (h) {
    tris.forEach(function (t, i) {
      var s = document.createElement('span');
      s.className = i % 3 ? 'tri' : 'tri w';
      s.setAttribute('aria-hidden', 'true');
      s.style.cssText = 'left:' + t[0] + '%;top:' + t[1] + '%;width:' + t[2] + 'px;animation-duration:' + t[3] + 's;animation-delay:-' + i * 1.7 + 's';
      h.appendChild(s);
    });
  });

  // Hero logo drifts against the cursor
  var hero = document.querySelector('.hero'), art = hero && hero.querySelector('.hero-art');
  if (art && window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      art.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      art.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
    hero.addEventListener('mouseleave', function () {
      art.style.setProperty('--mx', 0);
      art.style.setProperty('--my', 0);
    });
  }
})();
