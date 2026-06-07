/* ===========================================================
   Mídia Kit — Giu Miranda · interações
   Site scrollável. Apenas duas interações:
     1) números animando ao entrar na tela (contadores + barras)
     2) botão PT/EN
   =========================================================== */
(function(){
  'use strict';

  /* ---------------- i18n (PT/EN) ---------------- */
  var lang = 'pt';
  function applyLang(l){
    lang = l;
    document.querySelectorAll('[data-en]').forEach(function(el){
      if(!el.dataset.pt) el.dataset.pt = el.innerHTML;
      el.innerHTML = (l === 'en') ? el.dataset.en : el.dataset.pt;
    });
    document.querySelectorAll('.lang-toggle button').forEach(function(b){
      b.classList.toggle('on', b.dataset.lang === l);
    });
    document.documentElement.lang = (l === 'en') ? 'en' : 'pt-BR';
    // re-renderiza os números já no formato do idioma escolhido
    renderStats(document, true);
  }
  document.querySelectorAll('.lang-toggle button').forEach(function(b){
    b.addEventListener('click', function(){ applyLang(b.dataset.lang); });
  });

  /* ---------------- contadores + barras ---------------- */
  function fmt(n, dec){
    var loc = (lang === 'en') ? 'en-US' : 'pt-BR';
    return n.toLocaleString(loc, {minimumFractionDigits:dec, maximumFractionDigits:dec});
  }
  function animateCount(el){
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || '0', 10);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var dur = 1100, start = null;
    function step(ts){
      if(start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * e, dec) + suffix;
      if(p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + fmt(target, dec) + suffix;
    }
    requestAnimationFrame(step);
  }
  function renderStats(slide, finalOnly){
    slide.querySelectorAll('[data-count]').forEach(function(el){
      if(finalOnly){
        var dec = parseInt(el.dataset.decimals || '0', 10);
        el.textContent = (el.dataset.prefix||'') + fmt(parseFloat(el.dataset.count), dec) + (el.dataset.suffix||'');
      } else {
        animateCount(el);
      }
    });
    slide.querySelectorAll('[data-bar]').forEach(function(el){
      if(finalOnly){ el.style.width = el.dataset.bar + '%'; }
      else { el.style.width = '0'; void el.offsetWidth; el.style.width = el.dataset.bar + '%'; }
    });
  }

  /* revela cada seção ao rolar para dentro da tela e anima os números uma vez */
  var sections = document.querySelectorAll('.site > section');
  var seen = (typeof WeakSet !== 'undefined') ? new WeakSet() : null;
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        var s = en.target;
        s.classList.add('in-view');
        if(!seen || !seen.has(s)){
          if(seen) seen.add(s);
          setTimeout(function(){ renderStats(s, false); }, 160);
        }
      });
    }, { threshold:0.18 });
    sections.forEach(function(s){ io.observe(s); });
  } else {
    sections.forEach(function(s){ s.classList.add('in-view'); renderStats(s, false); });
  }

  /* idioma inicial */
  applyLang('pt');
})();
