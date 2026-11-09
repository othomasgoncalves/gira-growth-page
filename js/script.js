(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isStatic = /static/.test(location.hash);
  var root = document.documentElement;
  var loader = document.getElementById('loader');
  var header = document.querySelector('.site-header');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setupReveal() {
    if (reduce || isStatic || !('IntersectionObserver' in window)) {
      return;
    }

    var els = [].slice.call(document.querySelectorAll('.rv'));

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var i = [].indexOf.call(en.target.parentNode.children, en.target);
          en.target.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
          en.target.classList.remove('pre');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (el) {
      if (el.getBoundingClientRect().top > innerHeight) {
        el.classList.add('pre');
        io.observe(el);
      }
    });
  }

  function runLoader(done) {
    var stroke = document.getElementById('ldStroke');
    var outline = document.getElementById('ldOutline');
    var dot = document.getElementById('ldDot');
    var full = document.getElementById('ldFull');
    var num = document.getElementById('ldNum');

    var SL = stroke.getTotalLength();
    var OL = outline.getTotalLength();

    stroke.style.strokeDasharray = SL;
    stroke.style.strokeDashoffset = SL;
    outline.style.strokeDasharray = OL;
    outline.style.strokeDashoffset = OL;

    var D = 3000;
    var t0 = null;

    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function frame(ts) {
      if (t0 === null) {
        t0 = ts;
      }

      var t = Math.min(1, (ts - t0) / D);
      var p = ease(t);

      num.textContent = Math.round(p * 100);
      outline.style.strokeDashoffset = OL * (1 - Math.min(1, p * 1.25));
      stroke.style.strokeDashoffset = SL * (1 - Math.max(0, (p - 0.08) / 0.92));

      if (p > 0.82) {
        dot.classList.add('on');
      }

      full.style.opacity = Math.max(0, (p - 0.88) / 0.12);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(done, 280);
      }
    }

    requestAnimationFrame(frame);
  }

  if (reduce || isStatic) {
    loader.remove();
    setupReveal();
  } else {
    root.classList.add('boot');
    document.body.style.overflow = 'hidden';

    runLoader(function () {
      loader.classList.add('out');
      document.body.style.overflow = '';

      setTimeout(function () {
        root.classList.remove('boot');
      }, 180);

      setTimeout(function () {
        loader.remove();
      }, 1100);

      setupReveal();
    });
  }
})();
