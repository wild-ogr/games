/* RB:MGD — мини-игра №13 «Домино во дворе» (00-plan §5, 09-minigames №13).
   Двор, стол под яблоней, партия 1 на 1 с Петровичем: набор «дубль-шесть», по 7 костей, остальное — «базар».
   Ход: тап по подходящей кости (подсвечены); подходит к обоим концам — тап по нужному концу. Нечем ходить — «На базар»
   (базар пуст — «Пропускаю»). Конец: кто первым выложил все кости, или «Рыба!» (ходов нет ни у кого) — меньше очков в руке.
   Без азарта и ставок: играем «на интерес», награда — ступень оболочки (MG_RW.domino) и очки Книги двора.
   Ступени: проиграл — 0 (≤10 очков в руке — 1), выиграл — 2, выиграл и у Петровича ≥18 очков — 3. Счёт — очки Петровича + 10 за победу.
   Сила Петровича: спокойный режим — ходит наугад чаще; с дальними местами (o.lvl) — расчётливее.
   Сохранение: S.mg.domino = {n: партий, w: побед}. */
(function(){
'use strict';
var A=window.MGDA,Lx=A.L;
function st(){try{if(!S.mg||typeof S.mg!=='object')S.mg={};var m=S.mg.domino;if(!m||typeof m!=='object')m=S.mg.domino={};if(typeof m.n!=='number')m.n=0;if(typeof m.w!=='number')m.w=0;return m;}catch(e){return {n:0,w:0};}}
/* ---------- правила (без рисования; ими же играет авто-игрок) ---------- */
function deal(seed){var R=A.rng(seed*29+3),T=[];for(var a=0;a<=6;a++)for(var b=a;b<=6;b++)T.push([a,b]);
  for(var i=T.length-1;i>0;i--){var j=Math.floor(R()*(i+1)),x=T[i];T[i]=T[j];T[j]=x;}
  return {me:T.slice(0,7),pe:T.slice(7,14),bz:T.slice(14),chain:[],L:-1,R:-1,turn:'me',R0:R,over:null};}
function pips(h){var s=0;for(var i=0;i<h.length;i++)s+=h[i][0]+h[i][1];return s;}
function fitsL(g,t){return g.chain.length===0||t[0]===g.L||t[1]===g.L;}
function fitsR(g,t){return g.chain.length===0||t[0]===g.R||t[1]===g.R;}
function moves(g,h){var out=[];for(var i=0;i<h.length;i++){var t=h[i];if(g.chain.length===0){out.push({i:i,side:'R'});continue;}
  var l=fitsL(g,t),r=fitsR(g,t);if(l)out.push({i:i,side:'L'});if(r&&!(l&&g.L===g.R))out.push({i:i,side:'R'});}return out;}
function place(g,t,side,who){var c;if(g.chain.length===0){c={a:t[0],b:t[1],who:who};g.chain.push(c);g.L=t[0];g.R=t[1];return c;}
  if(side==='R'){c=t[0]===g.R?{a:t[0],b:t[1]}:{a:t[1],b:t[0]};c.who=who;g.R=c.b;g.chain.push(c);}
  else{c=t[1]===g.L?{a:t[0],b:t[1]}:{a:t[1],b:t[0]};c.who=who;g.L=c.a;g.chain.unshift(c);}return c;}
/* кто начинает: у кого старший дубль; нет дублей — игрок */
function opener(g){var best=-1,who='me',idx=-1;[['me',g.me],['pe',g.pe]].forEach(function(p){p[1].forEach(function(t,i){if(t[0]===t[1]&&t[0]>best){best=t[0];who=p[0];idx=i;}});});return {who:who,i:idx};}
/* выбор хода ИИ: k — расчётливость 0..1 */
function aiPick(g,h,k,R){var mv=moves(g,h);if(!mv.length)return null;if(R()>k)return mv[Math.floor(R()*mv.length)];
  var best=null,bv=-1e9;mv.forEach(function(m){var t=h[m.i],v=t[0]+t[1]+(t[0]===t[1]?4:0);
    // не оставлять себя без хода: сколько костей ещё подойдёт к новому концу
    var ne=t[0]===(m.side==='L'?g.L:g.R)?t[1]:t[0];if(g.chain.length===0)ne=t[1];var keep=0;h.forEach(function(x,j){if(j!==m.i&&(x[0]===ne||x[1]===ne))keep++;});v+=keep*2*k;
    if(v>bv){bv=v;best=m;}});return best;}
function blocked(g){return !g.bz.length&&!moves(g,g.me).length&&!moves(g,g.pe).length;}
function result(g){var mp=pips(g.me),pp=pips(g.pe),win=g.over==='me'||g.over==='fish'&&mp<pp,draw=g.over==='fish'&&mp===pp;
  var tier=win?(pp>=18?3:2):draw?1:(mp<=10?1:0),score=win?pp+10:draw?5:0;return {win:win,draw:draw,tier:tier,score:score,mp:mp,pp:pp};}
/* партия целиком (авто-игрок): me — расчётливость игрока, k — Петровича */
function simulate(seed,me,k){var g=deal(seed),R=A.rng(seed*7+1),op=opener(g),turn=op.who;
  if(op.i>=0){var h0=turn==='me'?g.me:g.pe,t0=h0.splice(op.i,1)[0];place(g,t0,'R',turn);turn=turn==='me'?'pe':'me';}
  for(var n=0;n<200&&!g.over;n++){var h=turn==='me'?g.me:g.pe;var mv=aiPick(g,h,turn==='me'?me:k,R);
    while(!mv&&g.bz.length){h.push(g.bz.pop());mv=aiPick(g,h,turn==='me'?me:k,R);}
    if(mv){var t=h.splice(mv.i,1)[0];place(g,t,mv.side,turn);if(!h.length){g.over=turn;break;}}
    if(blocked(g)){g.over='fish';break;}turn=turn==='me'?'pe':'me';}
  if(!g.over)g.over='fish';return result(g);}
function aiK(o){return o.calm?.35:A.clamp(.55+.06*(o.lvl||0),.55,.9);}

/* ---------- рисунок кости ---------- */
var PIP={0:[],1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]};
/* кость с центром (x,y), короткая сторона w, длинная 2w; rot — поворот (0 — вертикально: a сверху, b снизу) */
function tile(g,x,y,w,a,b,rot,o){o=o||{};g.save();g.translate(x,y);g.rotate(rot||0);var h=w*2,r=w*.16;
  if(!o.flat){g.fillStyle='rgba(0,0,0,.28)';A.rr(g,-w/2+w*.06,-h/2+w*.12,w,h,r);g.fill();}
  if(o.glow){g.fillStyle='rgba(255,210,122,.55)';A.rr(g,-w/2-4,-h/2-4,w+8,h+8,r+4);g.fill();}
  if(o.back){var bg=g.createLinearGradient(-w/2,-h/2,w/2,h/2);bg.addColorStop(0,'#3e5f4e');bg.addColorStop(1,'#2a4536');g.fillStyle=bg;A.rr(g,-w/2,-h/2,w,h,r);g.fill();
    g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=1;A.rr(g,-w/2+w*.12,-h/2+w*.12,w*.76,h-w*.24,r*.6);g.stroke();g.fillStyle='rgba(255,230,170,.5)';A.ell(g,0,0,w*.12,w*.12);g.fill();g.restore();return;}
  var tg=g.createLinearGradient(-w/2,-h/2,w/2,h/2);tg.addColorStop(0,'#fffdf6');tg.addColorStop(1,'#e9e1cf');g.fillStyle=tg;A.rr(g,-w/2,-h/2,w,h,r);g.fill();
  g.strokeStyle='rgba(120,100,70,.35)';g.lineWidth=1;A.rr(g,-w/2+.5,-h/2+.5,w-1,h-1,r);g.stroke();
  g.fillStyle='rgba(255,255,255,.7)';A.rr(g,-w/2+w*.1,-h/2+w*.06,w*.8,w*.08,w*.04);g.fill();
  g.strokeStyle='rgba(70,55,35,.55)';g.lineWidth=Math.max(1,w*.05);g.beginPath();g.moveTo(-w*.36,0);g.lineTo(w*.36,0);g.stroke();
  g.fillStyle='#b88a3a';A.ell(g,0,0,w*.07,w*.07);g.fill();
  var pr=w*.085,sp=w*.25;[[a,-w/2],[b,w/2]].forEach(function(p){var n=p[0],cy=p[1];var col=n===0?null:'#1e1a16';(PIP[n]||[]).forEach(function(q){var px=q[0]*sp,py=cy+q[1]*sp;g.fillStyle=n===6||n===3?'#1e1a16':n===5?'#a8281a':n===4?'#1e1a16':n===1?'#a8281a':'#1e1a16';
    g.save();g.translate(px,py);g.rotate(-(rot||0));g.restore();A.ell(g,px,py,pr,pr);g.fill();g.fillStyle='rgba(255,255,255,.35)';A.ell(g,px-pr*.3,py-pr*.3,pr*.3,pr*.3);g.fill();});});
  if(o.dim){g.fillStyle='rgba(40,30,20,.28)';A.rr(g,-w/2,-h/2,w,h,r);g.fill();}
  g.restore();}

var SAY={hi:[Lx('Садись, сыграем в домино! На интерес — кто проиграл, тот чайник ставит.','Sit down, let’s play dominoes! Just for fun.'),Lx('Эх, давно я никого не «рыбил»! Раздаю.','Haven’t played in ages! Dealing.')],
  peFirst:[Lx('У меня дубль — я хожу!','I’ve got a double — my move!')],meFirst:[Lx('Твой ход, начинай!','Your move!')],
  dbl:[Lx('Дубль! Ишь ты!','A double! Look at you!'),Lx('О, дублем бьёшь!','Doubles, eh!')],
  bz:[Lx('Эх, на базар схожу…','Off to the boneyard…'),Lx('Нечем крыть — беру.','Nothing to play — drawing.')],
  peGo:[Lx('А мы вот так!','How about this!'),Lx('Получай!','Take that!'),Lx('Хм… сюда.','Hmm… here.'),Lx('Ну-ка, ну-ка…','Let’s see…')],
  low:[Lx('Ой, у меня мало костей осталось!','Only a few tiles left!')],
  fish:[Lx('Рыба! Считаем очки.','Fish! Counting pips.')],
  win:[Lx('Ну ты мастер! Ставлю чайник, уговор есть уговор.','You’re a master! I’ll put the kettle on.'),Lx('Обыграл старика! Молодец.','Beat the old man! Well done.')],
  lose:[Lx('Моя взяла! Не горюй — завтра реванш.','My win! Rematch tomorrow.'),Lx('Ха! Учись, пока я жив!','Ha! Learn while I’m around!')],
  draw:[Lx('Ничья! Бывает же.','A draw! Who’d have thought.')]};
function pick(a){return a[Math.floor(Math.random()*a.length)];}

function run(host,o){var k=aiK(o);
  if(o.bot){var rs=[];for(var j=0;j<9;j++)rs.push(simulate((o.seed||1)+j*101,{bad:0,mid:.6,good:1}[o.bot]||.5,k));rs.sort(function(a,b){return a.tier-b.tier||a.score-b.score;});
    var r=rs[o.bot==='bad'?1:o.bot==='good'?7:4];host.done({score:r.score,tier:r.tier});return;}
  var Sx=A.stage(host,o),g=Sx.g,m=st(),G=deal(o.seed||1),R=A.rng((o.seed||1)*5+9);
  var lay={},bg=null,petr={mood:'smile',pose:'rest',talk:0,lx:0},busy=true,pick2=null,ended=false,hover=-1;
  var vis={}; // анимация костей: ключ «a-b» → {x,y,r,w}
  function key(t){return Math.min(t[0],t[1])+'-'+Math.max(t[0],t[1]);}
  function layout(){var W=Sx.W,H=Sx.H,wide=W>H*1.1;lay.wide=wide;
    if(wide){lay.ps=Math.min(H*.21,W*.14);lay.px=W*.5;lay.ty=H*.42;lay.tx=W*.08;lay.tw=W*.84;}
    else{lay.ps=Math.min(H*.17,W*.38);lay.px=W*.5;lay.ty=H*.33;lay.tx=-W*.04;lay.tw=W*1.08;}
    var n=Math.max(7,G.me.length),per=wide?Math.min(n,14):Math.min(n,7),rows=Math.ceil(n/per);
    lay.hw=A.clamp(Math.min((W-28)/per-8,wide?64:58),30,64);if(!wide&&rows>1)lay.hw=A.clamp(Math.min((W-28)/per-8,52),30,52);
    lay.per=per;lay.rows=rows;lay.handY=H-90-(rows-1)*(lay.hw*2+10)-lay.hw;
    lay.ca={x:wide?W*.12:14,y:lay.ty+lay.ps*.42,w:wide?W*.76:W-28,h:0};lay.ca.h=lay.handY-lay.hw-24-lay.ca.y;}
  Sx.resize=function(){bg=null;layout();};layout();
  function bake(){var c=document.createElement('canvas'),d=Sx.d;c.width=Math.round(Sx.W*d);c.height=Math.round(Sx.H*d);var q=c.getContext('2d');q.scale(d,d);A.yard(q,Sx.W,Sx.H);bg=c;}
  var top=Sx.el('div','mgd-top mgd-wideonly');Sx.el('div','mgd-ttl',Lx('Домино во дворе','Yard dominoes'),top);
  var bar=Sx.el('div','mgd-bar'),row=Sx.el('div','mgd-row',null,bar);var bAct=Sx.btn('pri','',function(){action();},row,'Enter');bAct.style.display='none';
  function speak(t){petr.talk=MGDA.talkT(t);if(lay.wide)Sx.speak(Lx('Петрович','Petrovich'),t,lay.px+lay.ps*.05,lay.ty-lay.ps*1.0,{hide:3200});else Sx.speak(Lx('Петрович','Petrovich'),t,lay.px,lay.ty+lay.ps*.32,{hide:3000,up:true});}
  /* ---- раскладка цепочки «змейкой» ---- */
  function chainPos(){var n=G.chain.length,ca=lay.ca,out=[];if(!n)return out;var hc=Math.min(lay.wide?40:32,ca.w/8);
    for(;hc>10;hc-=1){var per=Math.floor((ca.w-hc)/(hc*2)),rowsMax=Math.max(1,Math.floor((ca.h)/(hc*2)));if(per*rowsMax-rowsMax>=n+1)break;}
    var per2=Math.max(2,Math.floor((ca.w-hc)/(hc*2))),rowsN=1,cnt=0,lens=[];
    // строки: в каждой per2 костей, между строками — угловая вертикальная кость (входит в счёт следующей строки)
    var x0=ca.x+(ca.w-per2*hc*2)/2,i=0,r=0,totalRows=Math.ceil(n/per2),ytop=ca.y+Math.max(0,(ca.h-totalRows*hc*2)/2)+hc;
    while(i<n){var dir=r%2===0?1:-1,y=ytop+r*hc*2;for(var j=0;j<per2&&i<n;j++,i++){var c=G.chain[i],last=j===per2-1&&i<n-1;
        if(last){var cx=dir>0?x0+(per2-1)*hc*2+hc*1.5:x0+hc*.5;out.push({x:cx,y:y+hc*.5,w:hc,rot:0,c:c});}
        else{var cx2=dir>0?x0+j*hc*2+hc:x0+(per2-1-j)*hc*2+hc;out.push({x:cx2,y:y,w:hc,rot:dir>0?-Math.PI/2:Math.PI/2,c:c});}}r++;}
    return out;}
  function handPos(){var out=[],h=G.me,n=h.length,w=lay.hw,per=lay.per;for(var i=0;i<n;i++){var r=Math.floor(i/per),inRow=Math.min(per,n-r*per),j=i-r*per,tot=inRow*(w+8)-8;
    out.push({x:Sx.W/2-tot/2+j*(w+8)+w/2,y:lay.handY+r*(w*2+10),w:w});}return out;}
  function peHandPos(){var out=[],n=G.pe.length,w=Math.min(lay.wide?26:20,(lay.tw*.7)/Math.max(7,n)-4);for(var i=0;i<n;i++){out.push({x:lay.px-(n*(w+4)-4)/2+i*(w+4)+w/2,y:lay.ty+w*1.1,w:w});}return out;}
  /* ---- ходы ---- */
  var legal=[];function updLegal(){legal=busy||G.turn!=='me'?[]:moves(G,G.me);var can=legal.length>0;
    if(G.turn==='me'&&!busy&&!can&&!G.over){bAct.style.display='';bAct.innerHTML=(G.bz.length?Lx('На базар','Draw a tile')+' <small>('+G.bz.length+')</small>':Lx('Пропускаю ход','Pass'))+Sx.kc(Lx('Пробел','Space'));}else bAct.style.display='none';}
  function action(){if(busy||G.turn!=='me')return;if(G.bz.length){var t=G.bz.pop();vis[key(t)]={x:Sx.W-40,y:lay.ca.y+lay.ca.h/2,w:lay.hw*.6,rot:0};G.me.push(t);A.clack(.7);layout();updLegal();if(!moves(G,G.me).length&&G.bz.length===0)updLegal();}
    else{busy=true;updLegal();nextTurn();}}
  function sideOK(t){var l=fitsL(G,t),r=fitsR(G,t);if(G.chain.length===0)return ['R'];if(l&&r&&G.L!==G.R)return ['L','R'];return [l?'L':'R'];}
  function tapHand(i){if(busy||G.turn!=='me')return;var t=G.me[i],sides=moves(G,G.me).filter(function(mv){return mv.i===i;});if(!sides.length){A.snd('no');return;}
    var so=sideOK(t);if(so.length>1){pick2={i:i};A.snd('tap');return;}play('me',i,so[0]);}
  function play(who,i,side){var h=who==='me'?G.me:G.pe,t=h.splice(i,1)[0];pick2=null;var c=place(G,t,side,who);A.clack(1);
    if(t[0]===t[1]&&who==='me'&&Math.random()<.6)speak(pick(SAY.dbl));
    var cp=chainPos(),idx=G.chain.indexOf(c);if(cp[idx])A.burst(Sx,cp[idx].x,cp[idx].y,8,['#fff6dc','#ffd27a']);
    layout();if(!h.length){G.over=who;return finishGame();}
    if(blocked(G)){G.over='fish';speak(pick(SAY.fish));return Sx.later(finishGame,900);}
    if(who==='pe'&&h.length===2)speak(pick(SAY.low));
    busy=true;updLegal();Sx.later(nextTurn,who==='me'?(Sx.calm?900:650):300);}
  function nextTurn(){if(G.over)return;G.turn=G.turn==='me'?'pe':'me';
    if(G.turn==='pe'){petr.mood='think';petr.pose='think';busy=true;updLegal();Sx.later(peMove,Sx.calm?1300:1000);}
    else{busy=false;petr.mood='smile';petr.pose='rest';updLegal();}}
  function peMove(){if(G.over)return;var mv=aiPick(G,G.pe,k,R),drew=0;
    function step(){if(mv){petr.mood='sly';petr.pose='point';if(Math.random()<.35)speak(pick(SAY.peGo));var src=peHandPos()[mv.i];var t=G.pe[mv.i];if(src)vis[key(t)]={x:src.x,y:src.y,w:src.w,rot:0};play('pe',mv.i,mv.side);return;}
      if(G.bz.length){if(!drew)speak(pick(SAY.bz));drew++;G.pe.push(G.bz.pop());A.clack(.6);mv=aiPick(G,G.pe,k,R);Sx.later(step,Sx.calm?500:380);return;}
      // пропуск
      speak(Lx('Пропускаю…','I pass…'));if(blocked(G)){G.over='fish';speak(pick(SAY.fish));Sx.later(finishGame,900);return;}Sx.later(nextTurn,800);}
    step();}
  function finishGame(){if(ended)return;ended=true;busy=true;updLegal();var r=result(G);reveal=true;
    if(!o.train){m.n++;if(r.win)m.w++;}
    petr.mood=r.win?'sad':r.draw?'wow':'laugh';petr.pose=r.win?'scratch':'cross';Sx.later(function(){speak(pick(r.win?SAY.win:r.draw?SAY.draw:SAY.lose));if(r.win){A.snd('catch');A.burst(Sx,Sx.W/2,lay.ca.y+lay.ca.h/2,30,['#ffd27a','#fff','#6be3b0']);}else A.snd('lose');},500);
    Sx.later(function(){Sx.hush();host.done({score:r.score,tier:r.tier,title:r.win?(G.over==='fish'?Lx('Рыба — твоя!','Fish — you win!'):Lx('Победа!','You win!')):r.draw?Lx('Ничья','Draw'):Lx('Петрович выиграл','Petrovich won'),
      scoreTxt:Lx('Очки в руке','Pips in hand')+': '+Lx('ты','you')+' <b>'+r.mp+'</b> · '+Lx('Петрович','Petrovich')+' <b>'+r.pp+'</b>',
      extra:{line:Lx('Партий: ','Games: ')+(m.n||1)+' · '+Lx('побед: ','wins: ')+(m.w||0)}});},Sx.calm?1600:3200);}
  var reveal=false;
  /* ---- касания ---- */
  function hitHand(p){var hp=handPos();for(var i=hp.length-1;i>=0;i--){var q=hp[i];if(Math.abs(p.x-q.x)<q.w/2+4&&Math.abs(p.y-q.y)<q.w+8)return i;}return -1;}
  function endPts(){var cp=chainPos();if(!cp.length)return null;var a=cp[0],b=cp[cp.length-1];
    function out(t,dirSign){var ang=t.rot+Math.PI/2*dirSign;var dx=Math.sin(-t.rot),dy=Math.cos(t.rot);return t;}
    return {L:{x:a.x,y:a.y,w:a.w},R:{x:b.x,y:b.y,w:b.w}};}
  /* RB:MGPC наведение мышью: кость под курсором приподнята, «рука» над подходящей костью и концами цепочки */
  function nearEnd(p){if(!pick2)return false;var e=endPts();if(!e)return false;var lim=Math.max(44,e.L.w*1.6);return Math.min(Math.hypot(p.x-e.L.x,p.y-e.L.y),Math.hypot(p.x-e.R.x,p.y-e.R.y))<lim;}
  Sx.hover=function(p){hover=-1;var my=G.turn==='me'&&!busy&&!G.over;if(!p||!my){Sx.cursor('');return;}hover=hitHand(p);var ok=hover>=0&&legal.some(function(mv){return mv.i===hover;});Sx.cursor(ok||nearEnd(p)?'pointer':'');};
  /* RB:MGPC клавиши: 1..9 или ←/→ — выбрать кость, Enter — положить, при выборе конца ←/→ — к какому концу; пробел — «на базар»/пропуск */
  var kc=-1,kOn=false;
  function firstLegal(){return legal.length?legal[0].i:0;}
  Sx.keys(function(k,e){if(ended)return false;var my=G.turn==='me'&&!busy&&!G.over;
    if(pick2&&my&&(k==='ArrowLeft'||k==='ArrowRight')){play('me',pick2.i,k==='ArrowLeft'?'L':'R');return true;}
    if(/^[1-9]$/.test(k)){var i=+k-1;if(i<G.me.length){kc=i;kOn=true;pick2=null;A.snd('tap');}return true;}
    if(k==='ArrowLeft'||k==='ArrowRight'){var n=G.me.length;if(!n)return true;if(!kOn||kc<0||kc>=n)kc=firstLegal();else kc=(kc+(k==='ArrowLeft'?-1:1)+n)%n;kOn=true;pick2=null;return true;}
    if(k==='ArrowUp'||k==='ArrowDown')return true;
    if(k==='Enter'||k===' '){if(!my)return true;if(!legal.length){if(k===' '){action();return true;}return false;}
      if(!kOn||kc<0||kc>=G.me.length){kc=firstLegal();kOn=true;if(pick2)return true;}if(pick2&&pick2.i===kc)return true;tapHand(kc);return true;}
    return false;});
  Sx.down=function(p){if(busy||G.turn!=='me')return;if(pick2){var e=endPts();if(e){var dl=Math.hypot(p.x-e.L.x,p.y-e.L.y),dr=Math.hypot(p.x-e.R.x,p.y-e.R.y),lim=Math.max(44,e.L.w*1.6);
        if(Math.min(dl,dr)<lim){play('me',pick2.i,dl<dr?'L':'R');return;}}}
    var i=hitHand(p);if(i>=0)tapHand(i);else pick2=null;};
  /* ---- кадр ---- */
  function lerp(v,tg,dt){if(!v)return {x:tg.x,y:tg.y,w:tg.w,rot:tg.rot||0};var k=Math.min(1,dt*(Sx.calm?14:9));v.x+=(tg.x-v.x)*k;v.y+=(tg.y-v.y)*k;v.w+=(tg.w-v.w)*k;var dr=(tg.rot||0)-v.rot;v.rot+=dr*k;return v;}
  Sx.frame=function(dt,t){var W=Sx.W,H=Sx.H;if(!bg)bake();g.drawImage(bg,0,0,W,H);A.leafTick(Sx);if(petr.talk>0)petr.talk-=dt;
    var po={mood:petr.mood,talk:petr.talk>0,pose:petr.pose,lx:pick2?0:Math.sin(t*.4)*.5,noArms:true};A.petr(g,lay.px,lay.ty,lay.ps,t,po);
    A.table(g,lay.tx,lay.ty,lay.tw,H-lay.ty+40,{seed:8});po.noArms=false;po.armsOnly=true;A.petr(g,lay.px,lay.ty,lay.ps,t,po);
    // кружка и базар
    var bzx=lay.wide?lay.tx+lay.tw*.9:W-50,bzy=lay.ty+(lay.wide?40:30);for(var b=0;b<Math.min(G.bz.length,7);b++)tile(g,bzx-(b%2)*6,bzy+b*3,lay.wide?18:14,0,0,Math.PI/2+.1*(b%3-1),{back:true});
    if(G.bz.length){var bzt=Lx('базар ','boneyard ')+G.bz.length;A.txt(g,bzt,Math.min(bzx,W-8-bzt.length*4.4),bzy+(lay.wide?44:36),15,'#fff6dc','center','rgba(40,20,0,.6)');} // RB:MGPC не обрезать «boneyard» у края
    // кости Петровича
    var pp=peHandPos();for(var i=0;i<G.pe.length;i++){var q=pp[i];if(reveal)tile(g,q.x,q.y+q.w*.6,q.w,G.pe[i][0],G.pe[i][1],0,{});else tile(g,q.x,q.y,q.w,0,0,0,{back:true});}
    // цепочка
    var cp=chainPos();for(i=0;i<cp.length;i++){var c=cp[i],kk=c.c.a+'_'+c.c.b,kv=key([c.c.a,c.c.b]);vis[kv]=lerp(vis[kv],c,dt);var v=vis[kv];tile(g,v.x,v.y,v.w,c.c.a,c.c.b,v.rot,{});}
    // концы для выбора
    if(pick2&&cp.length){var e=endPts();[e.L,e.R].forEach(function(q2,j){var pul=1+.08*Math.sin(t*6);g.strokeStyle='rgba(255,210,122,.95)';g.lineWidth=4;A.ell(g,q2.x,q2.y,q2.w*1.25*pul,q2.w*1.25*pul);g.stroke();g.fillStyle='rgba(255,210,122,.25)';g.fill();});
      if(host.pc){MG.keycap(g,e.L.x,e.L.y-e.L.w*1.25-16,'←',24);MG.keycap(g,e.R.x,e.R.y-e.R.w*1.25-16,'→',24);}
      A.txt(g,Lx('К какому концу?','Which end?'),W/2,lay.ca.y-6,18,'#fff','center','rgba(0,0,0,.55)');}
    // рука игрока
    var hp=handPos(),lg={};legal.forEach(function(mv){lg[mv.i]=1;});
    for(i=0;i<G.me.length;i++){var tg=hp[i],kv2=key(G.me[i]);var on=!!lg[i],sel=pick2&&pick2.i===i;var target={x:tg.x,y:tg.y-(on?8:0)-(sel?10:0),w:tg.w,rot:0};vis[kv2]=lerp(vis[kv2],target,dt);var v2=vis[kv2];
      if(i===hover&&on&&!busy&&!sel)v2.y-=5;
      tile(g,v2.x,v2.y,v2.w,G.me[i][0],G.me[i][1],0,{glow:on&&!busy,dim:!on&&G.turn==='me'&&!busy&&legal.length>0});
      // RB:MGPC курсор клавиатуры и номера костей (только ПК, в свой ход)
      if(G.turn==='me'&&!busy&&!G.over){if(kOn&&i===kc){g.save();g.setLineDash([7,5]);g.lineDashOffset=-t*20;g.strokeStyle='#fff';g.lineWidth=3;A.rr(g,v2.x-v2.w/2-7,v2.y-v2.w-7,v2.w+14,v2.w*2+14,v2.w*.25);g.stroke();g.restore();}
        if(host.pc&&legal.length&&i<9)MG.keycap(g,v2.x,v2.y+v2.w+4,String(i+1),20);}}
    if(G.turn==='me'&&!busy&&!G.over&&legal.length&&!pick2)A.txt(g,Lx('Твой ход','Your move'),W/2,lay.handY-lay.hw-22,18,'#fff','center','rgba(0,0,0,.55)');};
  // начало
  A.leaves(Sx,4);host.amb('yard','day');
  Sx.kbd(Lx('Щёлкай мышкой по кости. Клавиши: '+Sx.kc('1')+'…'+Sx.kc('7')+' или '+Sx.kc('←')+Sx.kc('→')+' — выбрать, '+Sx.kc('Enter')+' — положить, '+Sx.kc('Пробел')+' — на базар',
    'Click a tile. Keys: '+Sx.kc('1')+'…'+Sx.kc('7')+' or '+Sx.kc('←')+Sx.kc('→')+' — select, '+Sx.kc('Enter')+' — play, '+Sx.kc('Space')+' — draw'),7);
  Sx.later(function(){speak(pick(SAY.hi));var op=opener(G);
    Sx.later(function(){if(op.who==='pe'&&op.i>=0){speak(pick(SAY.peFirst));var src=peHandPos()[op.i];vis[key(G.pe[op.i])]={x:src.x,y:src.y,w:src.w,rot:0};G.turn='pe';play('pe',op.i,'R');}
      else{G.turn='me';busy=false;speak(pick(SAY.meFirst));updLegal();}},Sx.calm?600:1800);},Sx.calm?50:400);
  run.stopFn=function(){Sx.stop();};
  run.dbg={G:G,tap:function(i){tapHand(i);},end:function(s){if(pick2)play('me',pick2.i,s);},act:action,legal:function(){return legal;},busy:function(){return busy;},hp:function(){return handPos();},ends:function(){return endPts();},pick2:function(){return pick2;}};}
MG_REG({id:'domino',n:{ru:'Домино во дворе',en:'Yard dominoes'},icon:'list',kind:'daily',run:run,stop:function(){if(run.stopFn)run.stopFn();},_t:{simulate:simulate,deal:deal,moves:moves,run:run}});
})();
