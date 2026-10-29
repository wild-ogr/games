'use strict';
(function(){
var Z=window.Z4;if(!Z||!Z.on||!Z.SCHET||Z.SCHET.s)return;var SCH=Z.SCHET;SCH.s=1;var O=SCH.on,ZB=window.ZB;
var FK=['bank','chalk','last','ladder','chain','twin'],RARE='жшщцчфхюэйъьё',COIN=3,CAP=9;
var force=(/[?&]z4sf=([a-z]+)/.exec(location.search)||[])[1]||'';
try{if(window.ZBECO&&ZBECO.cap&&ZBECO.cap.z4s==null)ZBECO.cap.z4s=CAP;}catch(e){}
try{if(!window.Z4T||!Z4T['z4s.rec'])ZB.load('js/zb4-schet-data.js').catch(function(){});}catch(e){}
function isOK(){return typeof OK!=='undefined'&&!!OK;}
function calm(){try{return typeof CALM==='function'&&!!CALM();}catch(e){return false;}}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function up(s){return String(s).toUpperCase();}
function zS(){return typeof S!=='undefined'&&S&&S.z4s||{};}
function nrm(c){return c==='ё'?'е':c;}
function lastL(w){for(var i=w.length-1;i>=0;i--){var c=w.charAt(i);if('ьъый'.indexOf(c)<0)return nrm(c);}return'';}
function srt(w){return w.split('').sort().join('');}
function rnd(seed){var x=(seed|0)||1;return function(){x^=x<<13;x^=x>>>17;x^=x<<5;return((x>>>0)%100000)/100000;};}
var SC=Z.score;
SC.add=function(n){n=+n||0;if(!n)return;SC.p+=n;draw();};
SC.mult=function(k){k=+k;if(k>0){SC.k*=k;draw();}};
SC.get=function(){return Math.round(SC.p*SC.k);};
var st={g:null,on:0};SCH.st=function(){return st;};
function fit(g,mix){return!!g&&Z.open('z4s')&&!g.daily&&!g.mode&&!g.tut&&!g.fest&&!mix;}
function medals(g,lv){var M={};if(!O.medal)return M;var U=[],seen={},W=g.words.map(function(x){return x.w;});
g.letters.forEach(function(c){if(!seen[c]){seen[c]=1;var n=W.filter(function(w){return w.indexOf(c)>=0;}).length;if(n>0&&n<W.length)U.push(c);}});
if(!U.length)return M;var r=rnd(lv*7919+13),k=lv>=100&&U.length>=5?2:1;
for(var i=0;i<k&&U.length;i++){var c=U.splice(Math.floor(r()*U.length),1)[0];M[c]=RARE.indexOf(c)>=0?3:2;}return M;}
function pairs(g){var T={},by={};g.words.forEach(function(x){var s=srt(x.w);(by[s]=by[s]||[]).push(x.w);});
for(var s in by)if(by[s].length>1)by[s].forEach(function(w){T[w]=by[s].filter(function(v){return v!==w;});});return T;}
function chainOk(g){var W=g.words.map(function(x){return x.w;});
for(var i=0;i<W.length;i++)for(var j=0;j<W.length;j++)if(i!==j&&lastL(W[i])===nrm(W[j].charAt(0)))return true;return false;}
function fits(id,g,lv){if(!O[id])return false;if(id==='ladder')return lv>=30;if(id==='chain')return chainOk(g);
if(id==='twin'){for(var k in pairs(g))return true;return false;}if(id==='last')return g.words.length>=3;return true;}
function pick(g,lv){if(force)return fits(force,g,lv)?force:'';if(isOK()&&lv%2)return'';
for(var k=0;k<FK.length;k++){var id=FK[(lv+k)%FK.length];if(fits(id,g,lv))return id;}return'';}
function init(g,mix){if(!g)return st;if(st.g===g)return st;var lv=g.idx+1;
st={g:g,lv:lv,on:fit(g,mix)?1:0,fi:'',m:{},kon:0,bk:0,ck:1,c5:0,pl:0,lm:1,nc:0,gold:0,ch:0,c4:0,ll:'',tw:'',tws:0,T:{},res:null,hint:''};
if(st.on){st.m=medals(g,lv);st.fi=pick(g,lv);if(st.fi==='twin')st.T=pairs(g);}return st;}
var FN={bank:'Банк',chalk:'Мел',last:'Дороже',ladder:'Лесенка',chain:'Цепочка',twin:'Близнецы'};
var LAD='<svg class="z4sl" viewBox="0 0 22 16" aria-hidden="true"><rect x="1" y="10" width="5" height="5" rx="1"/><rect x="8.5" y="6" width="5" height="9" rx="1"/><rect x="16" y="1" width="5" height="14" rx="1"/></svg>';
function fiTxt(){var s=st,f=s.fi,n;
if(f==='bank')return s.kon?'Кон <b>'+s.kon+'</b> — жми «Банк!», промах сожжёт':'Банк: слова подряд удваивают кон';
if(f==='chalk')return'Мел <b>×'+s.ck+'</b>'+(s.ck<5?' · без промаха — выше':' · ОТЛИЧНО');
if(f==='last'){n=s.g.words.filter(function(x){return!x.found;}).length;return n<=1?'Последнее слово — <b>золотое</b>!':'Следующее слово <b>+'+(s.nc+3)+'</b>, последнее — золотое';}
if(f==='ladder')return LAD+(s.pl?'<b>×'+s.lm+'</b> · дальше слово длиннее '+s.pl:'Каждое слово длиннее прошлого — ×2');
if(f==='chain')return s.ll?(s.ch>1?'Цепь <b>'+s.ch+'</b>':'Цепочка')+(s.hint?' · дальше на «'+up(s.hint)+'»':' · здесь цепь оборвётся'):'Цепочка: слово на последнюю букву прошлого';
if(f==='twin')return s.tw?'У «'+up(s.tws)+'» есть близнец — найди его следующим ×2':'Близнецы: КОТ—ТОК, второй следом ×2';
return'';}
function medTxt(){var a=[];for(var c in st.m)a.push('<i class="z4smd">'+up(c)+'×'+st.m[c]+'</i>');return a.join('');}
function draw(){var e=document.getElementById('z4sBar');if(!e)return;var g=typeof G!=='undefined'?G:null;
if(!st.on||!g||st.g!==g){e.style.display='none';e.innerHTML='';return;}e.style.display='';css();
var h='<b class="z4sp">✦ '+SC.get()+'</b>'+medTxt()+(st.fi?'<span class="z4sf">'+fiTxt()+'</span>':'<span class="z4sf"></span>');
if(st.fi==='bank'&&st.kon)h+='<button type="button" class="z4sbk" id="z4sBank">Банк! +'+st.kon+'</button>';
e.innerHTML=h;var b=document.getElementById('z4sBank');if(b)b.onclick=bank;marks();}
function marks(){var wh=document.getElementById('wheel');if(!wh)return;var on=st.on&&typeof G!=='undefined'&&st.g===G;
var L=wh.querySelectorAll('.let');for(var i=0;i<L.length;i++){var c=(L[i].textContent||'').toLowerCase(),m=on&&st.m[c];
if(m){if(L[i].getAttribute('data-z4m')!==String(m))L[i].setAttribute('data-z4m',String(m));}else if(L[i].hasAttribute('data-z4m'))L[i].removeAttribute('data-z4m');}}
var mo=null;function watch(){var wh=document.getElementById('wheel');if(!wh||mo||typeof MutationObserver==='undefined')return;
mo=new MutationObserver(function(){ZB.safe('z4s-mark',marks);});mo.observe(wh,{childList:true,subtree:true,characterData:true});}
function chip(t,cls){var b=document.getElementById('board');if(!b)return;css();var e=document.createElement('div');
e.className='z4sch '+(cls||'')+(calm()?' still':'');e.innerHTML=t;b.appendChild(e);setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},1700);}
function say(k,ctx){try{if(S.z3k&&S.z3k.z)return;var t=Z.txt(k,ctx);if(t&&typeof zina==='function')zina(t,'wow',4.5);}catch(e){}}
var cssOk=0;function css(){if(cssOk)return;cssOk=1;var s=document.createElement('style');s.id='z4s-css';s.textContent=
'.z4sb{display:flex;align-items:center;gap:6px;margin:2px 12px 0;padding:4px 8px;min-height:32px;border-radius:12px;background:var(--z3-card);'+
'box-shadow:0 1px 0 var(--z3-line);font:14px/1.25 var(--z3-font);color:var(--z3-ink);box-sizing:border-box;min-width:0}'+
'.z4sb .z4sp{flex:0 0 auto;font-weight:800;color:var(--z3-acc);font-variant-numeric:tabular-nums}'+
'.z4sb .z4smd{flex:0 0 auto;font-style:normal;font-weight:800;font-size:13.5px;padding:1px 6px;border-radius:8px;background:#fff3d0;color:#7a4a12;box-shadow:inset 0 0 0 2px var(--z3-gold)}'+
'.z4sb .z4sf{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13.5px;color:var(--z3-ink2)}'+
'.z4sb .z4sf b{color:var(--z3-ink)}.z4sb .z4sl{width:20px;height:15px;vertical-align:-2px;margin-right:4px;fill:var(--z3-blue)}'+
'.z4sb .z4sbk{flex:0 0 auto;min-height:44px;min-width:44px;margin:-6px -4px -6px 0;padding:0 12px;border:0;border-radius:12px;font:800 15px var(--z3-font);'+
'color:var(--z3-acc-ink);background:var(--z3-acc-grad);box-shadow:0 2px 0 var(--z3-acc-edge);cursor:pointer}'+
'#wheel .let[data-z4m]{box-shadow:0 0 0 3px var(--z3-gold)}'+
'#wheel .let[data-z4m]::after{content:"\\00d7" attr(data-z4m);position:absolute;right:-8px;top:-8px;min-width:22px;padding:1px 3px;border-radius:9px;'+
'font:800 13.5px/1.2 var(--z3-font);color:#7a4a12;background:#fff3d0;box-shadow:0 0 0 2px var(--z3-gold);text-transform:none;text-align:center}'+
'#board .z4sch{position:absolute;left:50%;top:30%;transform:translate(-50%,-50%);z-index:6;pointer-events:none;padding:6px 14px;border-radius:999px;'+
'font:700 16px var(--z3-font);white-space:nowrap;background:#fff6d6;color:#7a4a12;box-shadow:var(--z3-shadow,0 2px 6px rgba(0,0,0,.2));animation:z4sch 1.6s ease-out forwards}'+
'#board .z4sch.big{font:900 22px var(--z3-font-hand);background:#2f4f3a;color:#fff;letter-spacing:1px}#board .z4sch.still{animation:none}'+
'#board .z4sch svg{width:34px;height:28px;vertical-align:middle;margin-right:6px}'+
'@keyframes z4sch{0%{opacity:0;transform:translate(-50%,-30%) scale(.8)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-80%)}}';
document.head.appendChild(s);}
function bank(){var s=st;if(!s.on||!s.kon||typeof G==='undefined'||s.g!==G||G.won)return;try{SND.tap();}catch(e){}
var n=s.kon;s.kon=0;s.bk+=n;chip('Банк! +'+n+' ✦');SC.add(n,'bank');}
function onWord(o){var s=init(o.G);if(!s.on||o.G!==s.g)return;var w=o.w,len=w.length;
if(o.byHint){if(!o.bonus)s.nc++;draw();return;}
var p=o.bonus?Math.ceil(len/2):len;for(var c in s.m)if(w.indexOf(c)>=0)p*=s.m[c];
var f=s.fi;
if(f==='chalk'){p*=s.ck;if(s.ck<5){s.ck++;if(s.ck===5&&!s.c5){s.c5=1;chip('ОТЛИЧНО!','big');say('z4s.chalk5');}}}
else if(f==='ladder'){if(s.pl){s.lm=len>s.pl?Math.min(8,s.lm*2):1;}p*=s.lm;if(s.lm>=2)chip(LAD.replace('class="z4sl"','')+'Лесенка ×'+s.lm);s.pl=len;}
else if(f==='last'){if(!o.bonus){s.nc++;p+=2+s.nc;if(o.left===0&&!s.gold){s.gold=1;p*=2;var k=0;try{k=window.ZBECO?ZBECO.give('z4s',COIN,'z4s'):0;}catch(e){}
var z=zS(),d=0;try{d=+todayKey();}catch(e){}if(z.cd!==d){z.cd=d;z.cn=0;}z.cn++;
chip('Золотое слово! +'+p+' ✦'+(k?' +'+k+' монет':''));say('z4s.gold');}}}
else if(f==='bank'){s.kon=s.kon?Math.min(64,s.kon*2):1;}
else if(f==='chain'){if(s.ll&&nrm(w.charAt(0))===s.ll)s.ch++;else s.ch=1;if(s.ch>=2)p+=s.ch*2;
if(s.ch>=4&&!s.c4){s.c4=1;p+=10;var cat='';try{cat=typeof catSVG==='function'?catSVG():'';}catch(e){}chip(cat+'Ять несёт тапочки! +10');say('z4s.chain4');}
s.ll=lastL(w);s.hint=s.g.words.some(function(x){return!x.found&&nrm(x.w.charAt(0))===s.ll;})?s.ll:'';}
else if(f==='twin'){if(s.tw&&s.tw.indexOf(w)>=0){p*=2;chip('Близнецы! '+up(s.tws)+' — '+up(w)+' ×2');s.tw='';s.tws='';s.twn=(s.twn||0)+1;}
else{var T=!o.bonus&&s.T[w],un=T?T.filter(function(v){return s.g.words.some(function(x){return x.w===v&&!x.found;});}):[];s.tw=un.length?un:'';s.tws=un.length?w:'';}}
SC.add(p,'word');}
function onMiss(o){var s=st;if(!s.on||o.G!==s.g)return;
if(s.fi==='chalk'&&s.ck>1){s.ck--;draw();}
else if(s.fi==='bank'&&s.kon){var n=s.kon;s.kon=0;chip('Кон сгорел: −'+n+' ✦');draw();}}
function onWin(i){var s=st;if(!s.on||i.G!==s.g||s.res)return;if(s.kon){s.bk+=s.kon;SC.add(s.kon,'bank');s.kon=0;}
var p=SC.get(),z=zS(),rec=z.b>0&&p>z.b;z.b=Math.max(+z.b||0,p);z.n=(+z.n||0)+1;s.res={p:p,rec:rec};
Z.ev('z4s',{a:'win',lv:s.lv,p:p,f:s.fi||'-',b:rec?1:0,g:s.gold,c5:s.c5,c4:s.c4,tw:s.twn||0,bk:s.bk});}
Z.onStart(function(i){init(i.G,i.mix);if(st.on)watch();draw();});
Z.onWord(onWord);Z.onMiss(onMiss);Z.onWin(onWin);
ZB.add(ZB.levelSlots,{id:'z4s',order:3,zone:'top',render:function(){return Z.on?'<div id="z4sBar" class="z4sb" style="display:none"></div>':'';},
mount:function(){ZB.safe('z4s-draw',draw);}});
Z.winLine.add({id:'z4s',order:10,txt:function(i){var r=st.res;if(!r||i.G!==st.g)return'';
if(r.rec)return Z.txt('z4s.rec',{n:r.p})||('Рекорд счёта: '+r.p+' ✦!');return'Счёт уровня: '+r.p+' ✦'+(st.fi?' · фишка «'+FN[st.fi]+'»':'');}});
Z3.whenReady(function(){var g=typeof G!=='undefined'?G:null,gm=document.getElementById('game');
if(!g||g.won||!gm||!gm.classList.contains('on')||st.g===g)return;var K=window.Z3K,z=S.z3k;
init(g,!!(K&&K.mix&&!g.daily&&z&&+z.m===g.idx+1&&g.idx===+S.lv));
if(!document.getElementById('z4sBar')){var e=document.getElementById('zbLevel');if(e){var d=document.createElement('div');d.id='z4sBar';d.className='z4sb';e.appendChild(d);}}
if(st.on)watch();draw();});
})();
