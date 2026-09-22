/* Snap Box — תפריט נגישות צף: לחיצה מסובבת את הכפתור וחושפת קשת של 3 כפתורים בצד השני שלו —
   ניגודיות גבוהה, הגדלת טקסט, הדגשת מקטעים. הכללה: <script src="a11y.js"></script> לפני </body>. */
(function(){
    var STORE_KEY = 'snapbox_a11y_v2';
    var FONT_STEPS = [1, 1.15, 1.3, 1.45];
    var prefs = { contrast:false, font:0, highlight:false };
    try {
        var saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
        prefs = Object.assign(prefs, saved);
    } catch(e){}

    function save(){ try { localStorage.setItem(STORE_KEY, JSON.stringify(prefs)); } catch(e){} }

    function injectStyles(){
        var css =
            '#a11y-wrap{ position:fixed; z-index:950; right:16px; bottom:calc(env(safe-area-inset-bottom) + 18px); width:54px; height:54px; }' +
            'html.has-cookie-bar #a11y-wrap{ bottom:calc(env(safe-area-inset-bottom) + 88px); }' +

            '#a11y-fab{ position:relative; z-index:2; width:54px; height:54px; border-radius:50%; border:0; cursor:pointer;' +
                'display:grid; place-items:center; color:#04211D; font-family:inherit; padding:0;' +
                'background:linear-gradient(135deg,#5EEAD4 0%,#2DD4BF 45%,#0D9488 100%);' +
                'box-shadow:0 14px 32px -10px rgba(45,212,191,.45), inset 0 1px 0 rgba(255,255,255,.5);' +
                'transition:transform .4s cubic-bezier(.2,.9,.3,1.3); }' +
            '#a11y-fab svg{ width:26px; height:26px; }' +
            '#a11y-wrap.open #a11y-fab{ transform:rotate(135deg); }' +

            '.a11y-opts{ position:absolute; right:4px; bottom:4px; width:46px; height:46px; z-index:1; }' +
            '.a11y-opt{ position:absolute; inset:0; margin:auto; border-radius:50%; cursor:pointer;' +
                'border:1px solid rgba(255,255,255,.15); background:rgba(10,12,13,.92);' +
                '-webkit-backdrop-filter:blur(12px); backdrop-filter:blur(12px);' +
                'box-shadow:0 10px 24px -10px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.1);' +
                'display:grid; place-items:center; color:#F1F3F5; font-family:inherit; font-size:12px; font-weight:800; padding:0;' +
                'opacity:0; pointer-events:none; transform:translate(0,0) rotate(140deg) scale(.2);' +
                'transition:transform .42s cubic-bezier(.2,.9,.3,1.45), opacity .25s ease, border-color .2s, color .2s, background .2s; }' +
            '.a11y-opt svg{ width:21px; height:21px; }' +
            '#a11y-wrap.open .a11y-opt{ opacity:1; pointer-events:auto; }' +
            /* קשת מהצד השני של הכפתור (כפתור בימין → הקשת נפתחת שמאלה, לתוך הדף) */
            '#a11y-wrap.open .a11y-opt[data-i="0"]{ transform:translate(-2px,-93px) rotate(0) scale(1); transition-delay:.02s; }' +
            '#a11y-wrap.open .a11y-opt[data-i="1"]{ transform:translate(-64px,-67px) rotate(0) scale(1); transition-delay:.07s; }' +
            '#a11y-wrap.open .a11y-opt[data-i="2"]{ transform:translate(-92px,-5px) rotate(0) scale(1); transition-delay:.12s; }' +
            '.a11y-opt[aria-pressed="true"]{ border-color:#5EEAD4; color:#5EEAD4; background:rgba(45,212,191,.18); }' +
            '#a11y-fab:focus-visible, .a11y-opt:focus-visible{ outline:2px solid #5EEAD4; outline-offset:3px; }' +

            /* מצב ניגודיות גבוהה — דורס את משתני הצבע של האתר (לא רק פילטר) */
            'html.a11y-contrast{ --bg:#000; --txt:#fff; --txt-dim:#fff; --txt-faint:#e5e5e5;' +
                '--turq:#63f7e4; --turq-br:#63f7e4; --turq-dp:#2dd4bf; --glow:rgba(99,247,228,.55); }' +
            'html.a11y-contrast body{ background:#000 !important; }' +
            'html.a11y-contrast .bg, html.a11y-contrast .orb, html.a11y-contrast .grain{ display:none !important; }' +
            'html.a11y-contrast .glass, html.a11y-contrast .glass-accent, html.a11y-contrast .card{' +
                'background:#000 !important; border-color:#fff !important; box-shadow:none !important; }' +
            'html.a11y-contrast .field{ background:#000 !important; border-color:#fff !important; }' +
            'html.a11y-contrast a{ text-decoration:underline; }' +

            /* מצב הדגשת מקטעים — מסגרת בולטת סביב כל אזור תוכן */
            'html.a11y-highlight section, html.a11y-highlight .glass, html.a11y-highlight .card,' +
                'html.a11y-highlight header, html.a11y-highlight footer{' +
                'outline:2px solid #5EEAD4 !important; outline-offset:3px; background-color:rgba(45,212,191,.06) !important; }' +
            'html.a11y-highlight a{ text-decoration:underline !important; }' +

            '@media (prefers-reduced-motion:reduce){ #a11y-fab, .a11y-opt{ transition:none; } }';
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function injectWidget(){
        var wrap = document.createElement('div');
        wrap.id = 'a11y-wrap';
        wrap.innerHTML =
            '<div class="a11y-opts">' +
                '<button type="button" class="a11y-opt" data-i="0" data-act="contrast" aria-pressed="false" aria-label="הפעלת ניגודיות גבוהה" title="ניגודיות גבוהה">' +
                    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg>' +
                '</button>' +
                '<button type="button" class="a11y-opt" data-i="1" data-act="font" aria-pressed="false" aria-label="הגדלת גודל הטקסט" title="הגדלת טקסט">א+</button>' +
                '<button type="button" class="a11y-opt" data-i="2" data-act="highlight" aria-pressed="false" aria-label="הדגשת מקטעים" title="הדגשת מקטעים">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="6" rx="1.5"/><rect x="3.5" y="13.5" width="17" height="6" rx="1.5"/></svg>' +
                '</button>' +
            '</div>' +
            '<button type="button" id="a11y-fab" aria-expanded="false" aria-label="פתיחת תפריט נגישות">' +
                '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="3.6" r="2.1" fill="currentColor"/><path d="M4.5 8s4 1 7.5 1 7.5-1 7.5-1M12 9.2V14M8.5 20.5 12 13l3.5 7.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</button>';
        document.body.appendChild(wrap);

        var fab = wrap.querySelector('#a11y-fab');

        function setOpen(v){
            wrap.classList.toggle('open', v);
            fab.setAttribute('aria-expanded', String(v));
        }
        function pressed(act, on){
            var b = wrap.querySelector('[data-act="' + act + '"]');
            if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
        }
        function applyFont(){
            document.documentElement.style.fontSize = prefs.font > 0 ? (FONT_STEPS[prefs.font] * 100) + '%' : '';
            pressed('font', prefs.font > 0);
        }
        function applyAll(){
            document.documentElement.classList.toggle('a11y-contrast', !!prefs.contrast);
            document.documentElement.classList.toggle('a11y-highlight', !!prefs.highlight);
            pressed('contrast', !!prefs.contrast);
            pressed('highlight', !!prefs.highlight);
            applyFont();
        }

        fab.addEventListener('click', function(e){ e.stopPropagation(); setOpen(!wrap.classList.contains('open')); });
        document.addEventListener('click', function(e){ if (!wrap.contains(e.target)) setOpen(false); });
        document.addEventListener('keydown', function(e){ if (e.key === 'Escape') setOpen(false); });

        Array.prototype.forEach.call(wrap.querySelectorAll('.a11y-opt'), function(btn){
            btn.addEventListener('click', function(){
                var a = btn.dataset.act;
                if (a === 'contrast') prefs.contrast = !prefs.contrast;
                else if (a === 'highlight') prefs.highlight = !prefs.highlight;
                else if (a === 'font') prefs.font = (prefs.font + 1) % FONT_STEPS.length;
                save();
                applyAll();
            });
        });

        applyAll();
    }

    function init(){ injectStyles(); injectWidget(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
