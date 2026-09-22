/* Snap Box — באנר הודעת עוגיות. הכללה: <script src="cookie-consent.js"></script> לפני </body>. */
(function(){
    var KEY = 'snapbox_cookie_ack_v1';

    function acked(){
        try { return localStorage.getItem(KEY) === '1'; } catch(e){ return false; }
    }
    function ack(){
        try { localStorage.setItem(KEY, '1'); } catch(e){}
        var bar = document.getElementById('cookie-bar');
        if (bar) bar.remove();
        document.documentElement.classList.remove('has-cookie-bar');
    }

    function injectStyles(){
        var css =
            '#cookie-bar{ position:fixed; left:0; right:0; bottom:0; z-index:980;' +
                'background:rgba(5,6,7,.97); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);' +
                'border-top:1px solid rgba(45,212,191,.25);' +
                'display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:center;' +
                'padding:14px 18px; padding-bottom:calc(14px + env(safe-area-inset-bottom));' +
                'font-family:Assistant,system-ui,sans-serif; color:#F1F3F5; font-size:13px; text-align:center; }' +
            '#cookie-bar p{ margin:0; max-width:560px; line-height:1.6; }' +
            '#cookie-bar a{ color:#5EEAD4; text-decoration:underline; }' +
            '#cookie-bar button{ flex:none; border:0; border-radius:999px; padding:9px 20px; font-weight:800;' +
                'font-family:inherit; font-size:13px; cursor:pointer; color:#04211D;' +
                'background:linear-gradient(135deg,#5EEAD4,#2DD4BF); }';
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function show(){
        var bar = document.createElement('div');
        bar.id = 'cookie-bar';
        bar.setAttribute('role', 'region');
        bar.setAttribute('aria-label', 'הודעת עוגיות');
        bar.innerHTML =
            '<p>האתר משתמש בעוגיות/אחסון טכני הכרחי בלבד לתפעולו התקין — ללא מעקב שיווקי או פרסומי. ' +
            'פרטים מלאים ב<a href="privacy.html">מדיניות הפרטיות</a>.</p>' +
            '<button type="button" id="cookie-ok">הבנתי, תודה</button>';
        document.body.appendChild(bar);
        document.documentElement.classList.add('has-cookie-bar');
        document.getElementById('cookie-ok').addEventListener('click', ack);
    }

    function init(){
        injectStyles();
        if (!acked()) show();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
