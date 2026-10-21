(function () {
  var b = document.querySelector('.burger'), n = document.querySelector('nav.main');
  if (b) b.addEventListener('click', function () {
    var o = n.classList.toggle('open');
    b.setAttribute('aria-expanded', o);
  });

  // Enquiry form -> opens WhatsApp with the details pre-filled
  document.querySelectorAll('form.enq').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(f);
      var msg = 'Hello Advent Academy, I would like to enquire.%0A' +
        'Student: ' + encodeURIComponent(d.get('name')) + '%0A' +
        'Class / Course: ' + encodeURIComponent(d.get('course')) + '%0A' +
        'Parent phone: ' + encodeURIComponent(d.get('phone')) +
        (d.get('note') ? '%0A' + encodeURIComponent(d.get('note')) : '');
      window.open('https://wa.me/' + f.dataset.wa + '?text=' + msg, '_blank', 'noopener');
    });
  });

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
  }, { rootMargin: '0px 0px -8% 0px' });

  // Scroll reveal: siblings stagger, two-column blocks slide in from either side
  var reveal = '.sec-head,.prog .row,.reason,.tcard,.split>div,.courseblock,.facts>div,.faq details,.contact-list li,.map,.cta-band .wrap>*,.ticks li,.fgrid>div';
  document.querySelectorAll(reveal).forEach(function (el) {
    var p = el.parentNode, i = Array.prototype.indexOf.call(p.children, el);
    if (p.matches('.split,.cta-band .wrap')) el.classList.add(i ? 'rv-r' : 'rv-l');
    else el.style.setProperty('--d', Math.min(i, 7));
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
