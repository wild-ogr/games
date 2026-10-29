(function(){var W=window;if(!W.R3||typeof R3.reg!=='function')return;if(!R3.reg('guess',{s:'R3-GUESS',t:'«Кто тянет?» — карточки с рисунком рыбы, ясный итог'}))return;function $i(id){return document.getElementById(id);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function fn(id){try{var f=FISH[id]||LEG[id];return f?String(nm(f)):'';}catch(e){return'';}}
function err(e){try{R3.ev('err',{a:'guess',m:String(e&&e.message||e).slice(0,120)});}catch(x){}}
function dress(el){var b=el.querySelectorAll('[data-zw]');if(!b.length||b[0].classList.contains('r3gB'))return;el.classList.add('r3g');el.classList.remove('r3gOut');el._r3g=(el._r3g||0)+1;var sm=el.querySelector('small'),tip=sm?sm.textContent:'';if(sm&&!/^почерк:/.test(tip))sm.parentNode.removeChild(sm);else if(sm)sm.textContent=tip.replace(/^почерк:\s*/,'');var row=b[0].parentNode;row.className='r3gO';var wd=W.innerWidth>=720?104:72;for(var i=0;i<b.length;i++){var id=b[i].getAttribute('data-zw'),t=fn(id)||b[i].textContent;b[i].classList.add('r3gB');b[i].textContent='';var pic=document.createElement('span');pic.className='r3gP';try{var c=fishImg(id,wd,false);c.style.width=wd+'px';c.style.height=Math.round(wd*.52)+'px';pic.appendChild(c);}catch(e){}
var n=document.createElement('span');n.className='r3gN';n.textContent=t;b[i].appendChild(pic);b[i].appendChild(n);}}
function bye(el){var gen=el._r3gBye=el._r3g;setTimeout(function(){if(el._r3g!==gen||!el.classList.contains('on'))return;el.classList.add('r3gOut');setTimeout(function(){if(el._r3g!==gen)return;el.classList.remove('on','done','r3gOut');},380);},500);}
if(typeof render==='function'){var rd=render;render=function(){var r=rd.apply(this,arguments);try{var el=$i('r3zWho');if(el&&el.classList.contains('on')){dress(el);if(el.classList.contains('done')&&el._r3g&&el._r3gBye!==el._r3g)bye(el);}}catch(e){err(e);}return r;};}
if(typeof showCatch==='function'){var sc=showCatch;showCatch=function(){var a=G&&G.zwho&&G.zwho.a,f=G&&G.pk&&G.pk.f;var r=sc.apply(this,arguments);try{if(a&&f){var tg=document.querySelectorAll('#catch .r3zT');for(var i=0;i<tg.length;i++){var s=tg[i],t=s.textContent;if(/Угадал!|Guessed it!/.test(t)){s.className+=' g r3gOk';s.textContent=t.replace(/^\S+\s/,'✓ ');}
else if(/Не угадал|Wrong guess/.test(t)){s.className+=' r3gNo';s.textContent=(typeof LANG!=='undefined'&&LANG==='en')?'✗ Wrong: it\'s '+fn(f.id).toLowerCase()+', not '+fn(a).toLowerCase():'✗ Не угадал: '+fn(f.id).toLowerCase()+', а не '+fn(a).toLowerCase();}}}}catch(e){err(e);}
return r;};}
try{var css=document.createElement('style');css.textContent='#r3zWho.r3g{top:110px;width:min(94%,440px);max-width:none;box-sizing:border-box;padding:7px 8px 8px;border-radius:18px;color:#fff;font-size:15px;'
+'background:var(--pnS,rgba(20,32,44,.86));-webkit-backdrop-filter:saturate(160%) blur(18px);backdrop-filter:saturate(160%) blur(18px);'
+'border:1px solid var(--pnB,rgba(255,255,255,.2));box-shadow:0 8px 28px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.1)}'
+'#r3zWho.r3g>b{display:block;font-size:17px;font-weight:600;letter-spacing:.01em;text-shadow:0 1px 3px rgba(0,0,0,.5)}'
+'#r3zWho.r3g small{display:block;margin-top:2px;font-size:17px;opacity:1;color:var(--tx2,rgba(255,255,255,.84))}'
+'#r3zWho.r3g .r3gO{display:flex;justify-content:center;gap:8px;margin-top:6px}'
+'#r3zWho.r3g button.r3gB{flex:1 1 0;min-width:0;max-width:140px;min-height:70px;margin:0;padding:4px 4px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;'
+'border-radius:16px;border:1px solid var(--secB,rgba(255,255,255,.28));background:rgba(255,255,255,.1);color:#fff;font-weight:600;font-size:17px;line-height:1.15;'
+'cursor:pointer;-webkit-tap-highlight-color:transparent;transition:opacity .2s,transform .12s}'
+'#r3zWho.r3g button.r3gB:active{transform:scale(.96)}'
+'#r3zWho.r3g .r3gP{display:block;line-height:0;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}#r3zWho.r3g .r3gP canvas{display:block;max-width:100%;height:auto!important}'
+'#r3zWho.r3g .r3gN{display:block;margin-top:2px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,.5)}'
+'#r3zWho.r3g.done button.r3gB{opacity:.35}'
+'#r3zWho.r3g{transition:opacity .35s,transform .35s}#r3zWho.r3g.r3gOut{opacity:0;transform:translateX(-50%) translateY(-10px);pointer-events:none}'
+'#r3zWho.r3g button.r3gB.sel{opacity:1;background:rgba(255,207,122,.2);border:2px solid var(--gold,#ffd27a);box-shadow:0 0 0 3px rgba(255,207,122,.18);color:var(--gold,#ffd27a)}'
+'@media (min-width:720px){#r3zWho.r3g{top:130px}#r3zWho.r3g button.r3gB{min-height:104px;font-size:17px}}'
+'#catch .tags span.r3zT.r3gOk{background:rgba(107,227,176,.18)!important;color:#7ff0bf;border:1px solid rgba(107,227,176,.55)}'
+'#catch .tags span.r3zT.r3gNo{background:rgba(255,255,255,.1)!important;color:#ffd0c8;border:1px solid rgba(255,154,139,.5)}';document.head.appendChild(css);}catch(e){}})();