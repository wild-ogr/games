/* b2-juice.js — JUICE «Магнат 2.0»: праздник главы (фото крупно, печать ИП/ООО, подарки плашками), IPO (бегущая строка, колокол, фото),
   «Сеть» плитками, печать/колокол через POL.snd (касса — POLISH в SND.close). Стартовый файл — только крючки и звуки (≤ 8 КБ);
   сцены — js/b2-juice-fx.js, плитки «Сети» — js/b2-juice-net.js, «Итоги» финансов — js/b2-juice-fin.js (B2.need, по требованию).
   Крючки в чужих файлах (по 1 строке, метка b2-juice): biz-ui openChapter → B2.emit('chap',st); biz-ui rNet → B2.emit('net',el,W,ctx);
   story-ui openIpoScene → B2.emit('ipoScene',a,qid); ui.js openIpo → B2.emit('ipoPre'); cab-ui show → B2.emit('rw',o); fin.js renderFin → B2.emit('finSum',el,w).
   Движение — только transform/opacity, под body.lk-anim:not(.calm), выкл. при html.b2-still / POL.still() (стиль-гид), prefers-reduced-motion и html.b2j-lite.
   «Вдавливание» кнопок — POLISH (стиль-гид §7), здесь не дублируется.
   Сохранение: ничего не пишет (W.b2.juice / S.b2j не заводит). Флаг: B2.off.juice (?off=juice). */
(function(){'use strict';
B2.off.juice=0;          // 1 — выключено по умолчанию
if(B2.off('juice'))return;
if(typeof document==='undefined')return;   // jsc-симуляторы: только флаг
const J=window.B2J={};
const later=(ms,f)=>setTimeout(f,ms);
const T=(r,e)=>{try{return L(r,e);}catch(x){return r;}};
/* звуки — только POLISH (POL.snd: stamp, bell, cash; стиль-гид §5). Без POL (ветки ещё не сведены / выключен) — печать = SND.gavel, колокол — молчит (окно IPO уже звучит фанфарой). */
J.play=k=>{try{if(window.POL&&POL.snd&&!B2.off('polish')){POL.snd(k);return;}if(k==='stamp'&&typeof SND!=='undefined')SND.gavel();}catch(e){}};
J.lite=false;
/* слабый телефон: ≤ 2 ядер или ≤ 1 ГБ памяти — без движения (только смена картинки) */
try{const n=navigator.hardwareConcurrency||8,m=navigator.deviceMemory||8;if(n<=2||m<=1){J.lite=true;document.documentElement.classList.add('b2j-lite');}}catch(e){}
J.anim=()=>{try{if(window.POL&&POL.still)return !POL.still();const b=document.body;return !J.lite&&!document.documentElement.classList.contains('b2-still')&&b.classList.contains('lk-anim')&&!b.classList.contains('calm')&&!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);}catch(e){return false;}};
/* по требованию: сцены и плитки; что пришло до загрузки — выполнить после */
const fx=()=>B2.need('b2-juice-fx.js'),nt=()=>B2.need('b2-juice-net.js'),fn=()=>B2.need('b2-juice-fin.js');
const run=(ld,k,a)=>{if(J[k])return J[k].apply(null,a);ld().then(()=>{if(J[k])J[k].apply(null,a);}).catch(()=>{});};
B2.on('chap',st=>run(fx,'chap',[st]));
B2.on('ipoScene',(a,qid)=>run(fx,'ipoScene',[a,qid]));
B2.on('ipoPre',()=>run(fx,'ipoPre',[]));
B2.on('rw',o=>{if(o&&o.soc==='rank')run(fx,'rank',[o]);});
B2.on('finSum',(el,w)=>run(fn,'fin',[el,w]));
B2.on('net',(el,W,c)=>{if(!W||!W.ooo||W.ned)return;run(nt,'net',[el,W,c]);});
/* «Сеть» есть (ООО) — подгрузить плитки заранее, чтобы первый показ был уже плитками */
B2.on('enter',()=>{try{const W=GAME.W;if(W&&W.ooo&&!W.ned)later(1500,()=>nt().catch(()=>{}));}catch(e){}});
B2.click('juice',(act,arg,el,ev)=>{if(J.click)J.click(act,arg,el,ev);});
J.T=T;
})();
