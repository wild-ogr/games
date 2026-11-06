/* rv-q.js — «Вопрос ДВОР» (революция «Весь двор отвечает», поток П1; флаг rv.q).
   После ответа в облачке Михалыча — домик из 10 окошек «знают N из 10» (KNOW.of из js/know-id.js П0; без него — «тема × сложность»
   из js/price.js и слово «обычно»). Верно при N≤3 (настоящие данные) — «Редкий ответ!» (Михалыч wow, золотая вспышка, ≤2 за лестницу).
   Реплики — банк js/rv-say.js (RVSAY.pick). ≈1 вопрос из 10 лестницы — «Вопрос от тёти Вали» (плашка qSlots 'rv-from', реплика соседа).
   Плашка цены 100–500 над вопросом гаснет (остаётся только в Табло) — условие в js/ui-fx.js. Строка в окне второй попытки — RVQ.second().
   Зовётся из index.html (renderQ/reveal/endQ/secondOffer): RVQ.ask / RVQ.right / RVQ.wrong. Выключено (?off=rv или ?off=rv.q) — всё как v5.9.

   ДОГОВОР для других потоков:
     RVQ.on()                → включено ли rv.q
     RVQ.know(q)             → {n10:0…10, real:bool}
     RVQ.house(n10, real, rare?) → html домика (окошки + «знают N из 10»), для итога/листка
     RVQ.askHooks.push((q,G)=>say|null) — своя реплика на показ вопроса раньше банка (П2: «вчерашняя ошибка», кульминация 10-го)
     G.rvK[i] = {n, real, ok}  — по ступеням текущей игры; G.rvRare = [{id, n, i}] — редкие верные
     RVQ.sum(G)              → {avg:N из 10 в среднем по отвеченным, real:bool, you:верных, of:отвечено, rare:{id,n,w}|null} — для итога (П3) */
(function(){'use strict';
  var W=window;
  function offList(){var o=[];try{var m=/[?&]off=([^&#]*)/.exec(location.search);if(m)o=o.concat(decodeURIComponent(m[1]).split(','));}catch(e){}
    try{var l=localStorage.getItem('rv-off');if(l)o=o.concat(l.split(','));}catch(e){}return o;}
  function on(){if(W.RV&&typeof RV.on==='function'){try{return !!RV.on('q');}catch(e){}}
    var o=offList();return o.indexOf('rv')<0&&o.indexOf('rv.q')<0;}
  function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function know(q){var r=null;try{if(W.KNOW&&typeof KNOW.of==='function')r=KNOW.of(q);}catch(x){}
    if(!r||!(r.n10>=0)){var p=.8;try{if(W.PRICE&&PRICE.pOf)p=PRICE.pOf(q);}catch(x){}r={n10:Math.max(2,Math.min(9,Math.round(p*10))),real:false};} // без данных — «обычно», без крайностей 0–1 и 10
    var n=Math.max(0,Math.min(10,Math.round(+r.n10)));if(!r.real)n=Math.max(2,Math.min(9,n)); // «обычно» — без крайностей
    return {n10:n,real:!!r.real};}
  function kw(real){return real?'знают':'обычно знают';}
  function house(n,real,rare){var h='';for(var i=0;i<10;i++)h+='<i'+(i<n?' class="on"':'')+'></i>';
    return '<span class="rvDv" aria-label="'+kw(real)+' '+n+' из 10"><span class="rvH">'+h+'</span><span class="rvN">'+(rare?'<b class="rvR">Редкий ответ!</b> ':'')+kw(real)+' <b>'+n+' из 10</b></span></span>';}
  // соседи «вопроса от соседа»: имя в родительном падеже; темы — как в окне «Кого спросить?» (HELP), у бабы Зины — ZINA
  var FROM={mityai:'деда Митяя',valya:'тёти Вали',kolya:'дяди Коли',valerka:'Валерки',zina:'бабы Зины'};
  function topsOf(id){try{if(id==='zina')return ZINA.top;return HELP[id].top;}catch(x){return [];}}
  function nameOf(id){try{return id==='zina'?ZINA.n:HELP[id].n;}catch(x){return '';}}
  function fromFor(q){var a=[];for(var id in FROM)if(topsOf(id).indexOf(q.t)>=0)a.push(id);return a.length?a[Math.floor(Math.random()*a.length)]:null;}
  // решение «вопрос от соседа» — один раз на вопрос; не в первой лестнице, не на 1-й и 10-й ступени, одна на лестницу (≈1 из 10)
  function fromPlan(q,G){if(!G||G.mode!=='lad')return null;if(G.rvFromI!=null)return G.rvFromI===G.i?G.rvFrom:null;
    if(G.rvFromAt==null)G.rvFromAt=1+Math.floor(Math.random()*8);
    if(G.i<G.rvFromAt||G.i>8||(S.games||0)<2||G.first)return null;
    var id=fromFor(q);if(!id)return null;G.rvFromI=G.i;G.rvFrom=id;return id;}
  var askHooks=[];
  function ask(q,G){if(!on()||!q||!G)return null;
    for(var i=0;i<askHooks.length;i++){try{var r=askHooks[i](q,G);if(r)return r;}catch(x){try{console.warn('rv ask',x);}catch(_){}}}
    var nb=fromPlan(q,G);
    if(nb)return {who:nb,m:'norm',h:'<b>'+e(nameOf(nb))+':</b> '+e(RVSAY.pick('from.'+nb))};
    if(G.mode==='lad'&&G.i===9)return {who:'mihalych',t:RVSAY.pick('last')};
    return null;}
  function note(q,G,k,ok){try{if(W.RV&&RV.mark)RV.mark('q');}catch(x){}if(!Array.isArray(G.rvK))G.rvK=[];G.rvK[G.i]={n:k.n10,real:k.real,ok:ok?1:0};}
  function quiet(){try{return calm();}catch(x){return false;}}
  function flash(){if(quiet())return;var s=document.getElementById('say');if(s){s.classList.remove('rvGold');void s.offsetWidth;s.classList.add('rvGold');setTimeout(function(){s.classList.remove('rvGold');},1100);}
    /* значок поверх экрана не ставим — закрыл бы реплику (как огонёк ×5, VK-UX №6); «Редкий ответ!» — в самой реплике */}
  // первое знакомство: Михалыч объявляет «весь двор» (один раз за всё время; поле S.rvQ — только при первом показе)
  function hello(){if(S.rvQ)return '';S.rvQ=1;return RVSAY.pick('hello');}
  function right(q,G,o){if(!on()||!q||!G)return null;o=o||{};var k=know(q);note(q,G,k,1);
    var nb=G.rvFromI===G.i?G.rvFrom:null,hi=hello(),t,m='happy',who='mihalych';
    var rare=k.real&&k.n10<=3&&(G.rvRare||[]).length<2;
    if(rare){(G.rvRare=G.rvRare||[]).push({id:q.i,n:k.n10,i:G.i});}
    if(nb){who=nb;t='<b>'+e(nameOf(nb))+':</b> '+e(RVSAY.pick('ok.'+nb));}
    else if(hi)t=e(hi);
    else if(rare){m='wow';t=e(RVSAY.pick('rare',{n:k.n10}));}
    else if(G.mode==='lad'&&G.i===9)t=e(RVSAY.pick('win'));
    else if(o.safe)t=e(RVSAY.pick('safe'))+(o.tail?' '+e(o.tail):'');
    else t=e(RVSAY.pick('right'));
    if(rare)setTimeout(flash,30);
    return {who:who,m:rare&&!nb?'wow':m,h:t+house(k.n10,k.real,rare),rv:1};}
  // неверно: final — ответ окончательный (показываем верный), иначе — перед второй попыткой
  function wrong(q,G,final,ans){if(!on()||!q||!G)return null;var k=know(q),nb=G.rvFromI===G.i?G.rvFrom:null,t;
    if(final)note(q,G,k,0);
    var hi=final?hello():'';
    if(nb)t='<b>'+e(nameOf(nb))+':</b> '+e(RVSAY.pick('no.'+nb));
    else if(hi)t=e(hi);
    else t=e(RVSAY.pick(k.n10<=4?'wrongHard':k.n10>=8?'wrongEasy':'wrongMid'));
    if(final&&ans)t+=' Верный ответ — '+e(ans)+'.';
    return {who:nb||'mihalych',m:'sad',h:t+house(k.n10,k.real),rv:1};}
  function second(q){if(!on()||!q)return '';var k=know(q),c=k.n10<=4?'second':k.n10>=8?'secondEasy':'secondMid',w=kw(k.real);
    var s=RVSAY.pick(c,{n:k.n10,k:w.charAt(0).toUpperCase()+w.slice(1),k2:w});return s?'<p class="rvSec">'+e(s)+'</p>':'';}
  function sum(G){var a=(G&&G.rvK)||[],n=0,s=0,ok=0,real=true;for(var i=0;i<a.length;i++){var x=a[i];if(!x)continue;n++;s+=x.n;ok+=x.ok;if(!x.real)real=false;}
    var r=null,rr=(G&&G.rvRare)||[];if(rr.length){var b=rr[0];for(var j=1;j<rr.length;j++)if(rr[j].n<b.n)b=rr[j];
      var w='';try{var q=(typeof QI!=='undefined'&&QI[b.id])||null;if(q)w=q.a[0];}catch(x){}r={id:b.id,n:b.n,w:w};}
    return {avg:n?Math.round(s/n):null,real:n?real:false,you:ok,of:n,rare:r};}
  // плашка «Вопрос от тёти Вали» (сверху карточки вопроса)
  qSlots.push({id:'rv-from',order:5,render:function(c){var G=c&&c.G;if(!on()||!G||G.mode!=='lad'||G.rvFromI==null||G.rvFromI!==c.step-1)return null;
    var id=G.rvFrom;var pv='';try{pv=portrait(id,'norm');}catch(x){}
    return '<span class="rvFrom"><span class="rvFa">'+pv+'</span>Вопрос от '+e(FROM[id]||'')+'</span>';}});
  W.RVQ={on:on,know:know,house:house,ask:ask,right:right,wrong:wrong,second:second,sum:sum,askHooks:askHooks,FROM:FROM};
})();
