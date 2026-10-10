'use strict';
/* zb-MGA мини-игра №2 «Сплетня Гали с третьего». Галя торопится и путает буквы: «Говорят, Петровна купила новый ?????…» — собери слово кругом букв.
   3 сплетни за заход, Зина отвечает шуткой. Подсказка — открыть букву (без наказания, только звёзды), «Скажи сама» — Галя договаривает.
   Очки: без подсказок 2, с подсказкой 1, Галя сказала сама 0 → 6/4/2 = 3/2/1★.
   Данные — js/zmg-splet-data.js (ZMG_SPLET, из content/texts/gossip.json — черновик до вычитки владельца; ответы — курированные существительные).
   Договор — шапка js/zmg-core.js. Имена/классы — zma-. */
(function(){
if(typeof ZMG_REG!=='function')return;
const N=3;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const nrm=w=>String(w).toLowerCase().replace(/ё/g,'е');
const tierOf=p=>p>=6?3:p>=4?2:p>=2?1:0;
// длина ответа по прогрессу: новичку — короче
const maxLen=l=>l<40?7:l<120?8:99;
function pick(rnd,lvl,mem){const D=window.ZMG_SPLET,all=D.items.filter(x=>x[3].length<=maxLen(lvl||0));
  const seen=String(mem&&mem.r||'').split(',');let L=all.filter(x=>seen.indexOf(x[0])<0);if(L.length<N)L=all.slice();
  L=L.slice();for(let i=L.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));const t=L[i];L[i]=L[j];L[j]=t;}return L.slice(0,N);}
ZMG_REG({id:'splet',finWho:'zina',deps:['krug','js/zmg-splet-data.js'],
  open:()=>!!(window.ZMG_SPLET||1),
  lines:{good:'Все сплетни разобрала! Галя, ты мне завтра ещё принеси.',ok:'Почти всё поняли. Галя, говори помедленнее!',bad:'Галя опять всё перепутала — завтра разберёмся.'},
  sim(o,k){let p=0;for(let i=0;i<N;i++){const r=o.rnd();p+=r<.35+.6*k?2:r<.9?1:0;}return {sc:p,st:tierOf(p)};},
  run(host,o){const D=window.ZMG_SPLET;if(!D||!D.items||!D.items.length){host.quit();return;}
    const mem=host.mem(),L=pick(o.rnd,o.lvl,mem),res=[];let i=0,cur=null,open=0,busy=false,timer=0,K=null,pts=0,hints=0;
    const fest=host.fest&&host.fest.id;
    host.el.innerHTML='<div class="zma-wrap'+(fest?' zma-'+esc(fest):'')+'"><div class="zma-sp-card"><div class="zma-sp-say"></div><div class="zma-sp-gap"></div></div>'+
      '<div class="zmg-dots">'+L.map(()=>'<i></i>').join('')+'</div><div class="zma-kr"></div><div class="zma-sp-ans"></div>'+
      '<div class="zma-row"><button class="btn zma-hint">💡 Буква'+(host.pc?' '+host.kc('?'):'')+'</button><button class="btn sec zma-give">Скажи, Галя'+(host.pc?' '+host.kc('Tab'):'')+'</button></div></div>';
    const $=s=>host.el.querySelector(s),say=$('.zma-sp-say'),gap=$('.zma-sp-gap'),kr=$('.zma-kr'),ans=$('.zma-sp-ans'),row=$('.zma-row'),
      dots=[].slice.call(host.el.querySelectorAll('.zmg-dots i')),bH=$('.zma-hint'),bG=$('.zma-give');
    function boxes(full,kind){const a=cur[3];let h='';for(let j=0;j<a.length;j++)h+='<b class="'+(full?kind:j<open?'h':'')+'">'+(full||j<open?esc(a[j]):'')+'</b>';gap.innerHTML=h;}
    function gtxt(){return esc(cur[2]).replace('___','<span class="zma-sp-q">'+'?'.repeat(Math.min(5,cur[3].length))+'…</span>');}
    function show(){cur=L[i];open=0;busy=false;say.innerHTML=host.say('galya',gtxt(),'wow');boxes();ans.innerHTML='';row.style.visibility='';
      kr.style.display='';if(!K)K=host.krug(kr,{letters:cur[3],onWord:word,min:2});else{K.lock(false);K.set(cur[3]);}
      dots.forEach((d,k)=>d.className=k<i?(res[k]===2?'ok':res[k]===1?'ok':'no'):k===i?'cur':'');host.top((i+1)+' из '+L.length);}
    function word(w){if(busy)return 'bad';if(nrm(w)===nrm(cur[3])){done(open?1:2);return 'ok';}
      if(w.length>=cur[3].length-1){const t=['Не-не, не то! Ещё разок.','Да нет же, ты что! Я же говорю…','Ой, не то, не то.'];say.innerHTML=host.say('galya',gtxt()+'<br><i class="zma-sm">'+t[(o.rnd()*3)|0]+'</i>','norm');}
      return 'bad';}
    function done(p){busy=true;res[i]=p;pts+=p;try{p?host.snd.word&&host.snd.word(cur[3].length,0):host.snd.old&&host.snd.old();}catch(e){}
      boxes(true,p?'ok':'no');if(K)K.lock(true);kr.style.display='none';row.style.visibility='hidden';
      say.innerHTML=host.say('galya',esc(cur[2]).replace('___','<b class="zma-sp-w">'+esc(cur[3].toLowerCase())+'</b>'),p?'happy':'norm');
      ans.innerHTML=host.say('zina',esc(cur[4]),'happy')+'<button class="btn green zma-next">Дальше'+(host.pc?' '+host.kc('Enter'):'')+'</button>';
      ans.querySelector('.zma-next').onclick=next;dots[i].className=p?'ok':'no';
      try{const m=host.mem(),r=String(m.r||'').split(',').filter(Boolean);r.push(cur[0]);m.r=r.slice(-30).join(',');}catch(e){}
      timer=setTimeout(next,host.calm?7000:5200);}
    function next(){clearTimeout(timer);timer=0;if(!busy)return;try{host.snd.tap();}catch(e){}i++;if(i>=L.length){end();return;}show();}
    function hint(){if(busy||!cur)return;if(open>=cur[3].length-1){give();return;}open++;hints++;boxes();try{host.snd.letter&&host.snd.letter(open);}catch(e){}
      if(open>=cur[3].length-1)bH.textContent='Скажи, Галя';}
    function give(){if(busy||!cur)return;done(0);}
    function end(){const ok=res.filter(x=>x>0).length;host.finish({sc:pts,st:tierOf(pts),h:hints+res.filter(x=>!x).length,label:ok+' из '+L.length+' сплетен'});}
    bH.onclick=()=>{try{host.snd.tap();}catch(e){}hint();};bG.onclick=()=>{try{host.snd.tap();}catch(e){}give();};
    host.el.querySelector('.zma-sp-card').onclick=()=>{if(busy&&timer)next();};
    host.keys(k=>{if((k==='Enter'||k===' ')&&busy){next();return true;}if(k==='?'||k===','||k==='/'){hint();return true;}
      if(k==='Tab'){give();return true;}return false;});
    host.onQuit(()=>{clearTimeout(timer);timer=0;});
    host.bot=k=>{if(!cur)return;if(busy){next();return;}const r=Math.random();
      if(r<k){K.type(cur[3].toLowerCase());}else if(r<k+.15){hint();}else if(r<.95){K.type(cur[3].toLowerCase().split('').reverse().join(''));}else give();};
    host.intro({who:'galya',text:'Зина, ты не поверишь, что в подъезде творится! Только я тороплюсь и буквы путаю… <b>Собери слово из моих букв</b> — сама поймёшь!',
      btn:'Слушаю, Галя',hint:'3 сплетни · ~45 секунд · подсказки без штрафа'}).then(show);}});
(function(){if(document.getElementById('zma-sp-css'))return;const st=document.createElement('style');st.id='zma-sp-css';st.textContent=
'.zma-sp-card{margin:0 auto;width:calc(100% - 24px);max-width:480px}.zma-sp-card .zmg-sb{font-size:18px}'+
'.zma-sp-q{display:inline-block;padding:0 6px;border-radius:6px;background:var(--blue3,#dbe7fb);color:var(--blue,#1d4fa3);font-weight:900;letter-spacing:2px}'+
'.zma-sp-w{color:var(--green2,#237a3b);text-transform:uppercase}.zma-sm{color:var(--ink2,#5d6781);font-size:16px}'+
'.zma-sp-gap{display:flex;justify-content:center;gap:4px;flex-wrap:wrap;margin:2px 0 0}'+
'.zma-sp-gap b{width:32px;height:38px;border-radius:8px;background:#fff;box-shadow:inset 0 -3px 0 var(--edge,#d5d9e3);display:flex;align-items:center;justify-content:center;font:900 22px/1 var(--font,Arial);color:var(--blue,#1d4fa3)}'+
'.zma-sp-gap b.h{background:var(--gold3,#fff2cc)}.zma-sp-gap b.ok{background:#dff3e3;color:var(--green2,#237a3b)}.zma-sp-gap b.no{background:#fde3e1;color:var(--red2,#d0342c)}'+
'.zma-sp-ans{margin:0 auto;width:calc(100% - 24px);max-width:480px;text-align:center}.zma-sp-ans .btn{min-height:52px;font-size:19px;margin-top:4px}'+
'.zma-halloween .zma-sp-card .zmg-sb{background:#fff4e6}.zma-ny .zma-sp-card .zmg-sb{background:#f0f8ff}'+
'@media (max-height:620px){.zma-sp-gap b{width:28px;height:32px;font-size:19px}.zma-sp-card .zmg-sb{font-size:17px}}';
document.head.appendChild(st);})();
// общие стили игр MGA (одинаковые в каждом файле — грузится любая первой)
(function(){if(document.getElementById('zma-css'))return;const st=document.createElement('style');st.id='zma-css';st.textContent=
'.zma-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:stretch;padding:8px 0 10px;min-height:0;overflow-y:auto}'+
'.zma-kr{flex:1 1 auto;min-height:250px;display:flex;align-items:center;justify-content:center}'+
'.zma-row{display:flex;gap:10px;justify-content:center;margin:4px auto 0;width:calc(100% - 24px);max-width:480px}.zma-row .btn{flex:1 1 0;min-height:50px;font-size:17px;margin:0}'+
'@media (max-height:620px){.zma-kr{min-height:210px}}';document.head.appendChild(st);})();
})();
