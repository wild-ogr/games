'use strict';
(function(){
if(typeof ZMG_REG!=='function')return;
const esc=t=>String(t==null?'':t).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const tierOf=s=>s<=40?3:s<=75?2:1;
const O='stroke="#3b3b3b" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"';
const IT={
venik:['веник','<path d="M18 3 l4 0 l1 17 l-6 0z" fill="#b5651d" '+O+'/><path d="M14 20 h12 l6 17 h-24z" fill="#e2c15a" '+O+'/><path d="M16 26 h8 M14 31 h12" stroke="#a8862a" stroke-width="1.5"/>'],
gazeta:['газета','<path d="M5 9 h26 v24 h-26z" fill="#f2efe6" '+O+'/><path d="M31 13 h4 v18 a2 2 0 0 1 -4 0" fill="#e2ddd0" '+O+'/><path d="M9 14 h18 M9 19 h8 M9 23 h8 M9 27 h8" stroke="#777" stroke-width="1.6"/><rect x="19" y="18" width="8" height="10" fill="#bcc6d6"/>'],
klyuch:['ключ','<circle cx="11" cy="20" r="7" fill="#e7c14a" '+O+'/><circle cx="11" cy="20" r="2.5" fill="#fff" '+O+'/><path d="M18 18 h17 v4 h-3 v4 h-3 v-4 h-11z" fill="#e7c14a" '+O+'/>'],
tapok:['тапок','<path d="M4 26 q0 -8 10 -9 l14 -1 q9 0 9 6 q0 6 -9 7 h-17 q-7 0 -7 -3z" fill="#c0504d" '+O+'/><path d="M17 17 q6 -6 12 0" fill="#e8a09c" '+O+'/><circle cx="23" cy="16" r="2.5" fill="#fff" '+O+'/>'],
pismo:['письмо','<rect x="4" y="10" width="32" height="21" rx="1.5" fill="#fbf6e9" '+O+'/><path d="M4 10 l16 12 l16 -12" fill="none" '+O+'/><rect x="27" y="13" width="6" height="7" fill="#d9534f"/>'],
klubok:['клубок','<circle cx="19" cy="21" r="12" fill="#e57399" '+O+'/><path d="M9 15 q10 4 18 -4 M8 22 q12 4 22 -6 M10 28 q12 2 20 -8" stroke="#b44a6d" stroke-width="1.5" fill="none"/><path d="M30 28 q6 2 6 8" stroke="#e57399" stroke-width="2" fill="none"/>'],
ochki:['очки','<circle cx="11" cy="22" r="7" fill="#d6ecf7" '+O+'/><circle cx="29" cy="22" r="7" fill="#d6ecf7" '+O+'/><path d="M18 21 q2 -3 4 0 M4 20 l-2 -4 M36 20 l2 -4" fill="none" '+O+'/>'],
yabloko:['яблоко','<path d="M20 12 q-12 -6 -14 8 q0 16 14 16 q14 0 14 -16 q-2 -14 -14 -8z" fill="#d9413b" '+O+'/><path d="M20 12 q0 -5 3 -8" fill="none" '+O+'/><path d="M22 8 q6 -4 9 1 q-5 3 -9 -1z" fill="#5aa64b" '+O+'/>'],
shapka:['шапка','<path d="M5 28 q0 -18 15 -18 q15 0 15 18z" fill="#3f7ec7" '+O+'/><rect x="4" y="27" width="32" height="7" rx="3" fill="#f2f2f2" '+O+'/><circle cx="20" cy="9" r="4" fill="#f2f2f2" '+O+'/>'],
ogurec:['огурец','<path d="M6 28 q-2 -6 6 -12 q10 -8 20 -10 q6 2 1 9 q-8 10 -20 15 q-6 2 -7 -2z" fill="#4c9a3f" '+O+'/><circle cx="16" cy="20" r="1" fill="#2d6326"/><circle cx="23" cy="15" r="1" fill="#2d6326"/><circle cx="13" cy="26" r="1" fill="#2d6326"/>'],
koshelek:['кошелёк','<rect x="5" y="13" width="30" height="20" rx="4" fill="#8a5a2b" '+O+'/><path d="M12 13 q0 -6 8 -6 q8 0 8 6" fill="none" stroke="#b8b8b8" stroke-width="2.5"/><circle cx="16" cy="12" r="2.2" fill="#d8d8d8" '+O+'/><circle cx="24" cy="12" r="2.2" fill="#d8d8d8" '+O+'/>'],
ryba:['рыба','<path d="M4 20 q12 -12 24 0 q-12 12 -24 0z" fill="#8fb3c9" '+O+'/><path d="M28 20 l8 -7 v14z" fill="#8fb3c9" '+O+'/><circle cx="10" cy="18" r="1.6" fill="#222"/><path d="M15 15 q3 5 0 10" fill="none" stroke="#5f8aa3" stroke-width="1.4"/>'],
morkov:['морковь','<path d="M10 12 l14 4 q-6 14 -18 20 q4 -12 4 -24z" fill="#f08a24" '+O+'/><path d="M22 15 q4 -8 12 -9 M22 14 q2 -9 -2 -12 M23 16 q8 -2 13 2" stroke="#4c9a3f" stroke-width="2.4" fill="none" stroke-linecap="round"/>'],
gradusnik:['градусник','<rect x="17" y="3" width="6" height="26" rx="3" fill="#f4f8fb" '+O+'/><circle cx="20" cy="32" r="5" fill="#d9413b" '+O+'/><rect x="19" y="14" width="2" height="16" fill="#d9413b"/><path d="M23 8 h3 M23 13 h3 M23 18 h3" stroke="#555" stroke-width="1.2"/>'],
zont:['зонт','<path d="M3 20 q17 -18 34 0 q-4 -3 -8 0 q-4 -3 -9 0 q-5 -3 -9 0 q-4 -3 -8 0z" fill="#7b4bb3" '+O+'/><path d="M20 20 v13 q0 4 -4 3" fill="none" '+O+'/>'],
kniga:['книга','<path d="M5 9 h14 q1 0 1 2 v23 q0 -2 -2 -2 h-13z" fill="#2f7d5b" '+O+'/><path d="M35 9 h-14 q-1 0 -1 2 v23 q0 -2 2 -2 h13z" fill="#3a9a70" '+O+'/><path d="M8 14 h8 M24 14 h8" stroke="#d9f0e3" stroke-width="1.5"/>'],
leyka:['лейка','<path d="M10 16 h16 v16 h-16z" fill="#4f9bd9" '+O+'/><path d="M26 22 l10 -10 l2 2 l-9 11" fill="#4f9bd9" '+O+'/><path d="M10 19 q-6 2 -6 8 q0 3 6 3" fill="none" '+O+'/>'],
shlyapa:['шляпа','<ellipse cx="20" cy="27" rx="17" ry="5" fill="#e3c27a" '+O+'/><path d="M10 26 q0 -14 10 -14 q10 0 10 14z" fill="#e3c27a" '+O+'/><path d="M10 23 q10 4 20 0" stroke="#c0392b" stroke-width="3" fill="none"/>'],
vedro:['ведро','<path d="M8 13 h24 l-3 22 h-18z" fill="#9aa7b3" '+O+'/><ellipse cx="20" cy="13" rx="12" ry="3" fill="#c5ced6" '+O+'/><path d="M8 13 q12 -14 24 0" fill="none" '+O+'/>'],
bilet:['билет','<path d="M3 13 h34 v4 a3 3 0 0 0 0 6 v4 h-34 v-4 a3 3 0 0 0 0 -6z" fill="#f6d77b" '+O+'/><path d="M27 13 v14" stroke="#b08a2a" stroke-dasharray="2 2"/><path d="M7 18 h14 M7 22 h10" stroke="#8a6a1a" stroke-width="1.6"/>'],
termos:['термос','<rect x="13" y="8" width="14" height="27" rx="3" fill="#c0392b" '+O+'/><rect x="14" y="4" width="12" height="6" rx="2" fill="#7f8c8d" '+O+'/><rect x="13" y="17" width="14" height="5" fill="#f1c40f"/>'],
korzina:['корзина','<path d="M5 18 h30 l-4 16 h-22z" fill="#c8913e" '+O+'/><path d="M10 18 q10 -16 20 0" fill="none" stroke="#8a5a2b" stroke-width="2.6"/><path d="M8 23 h24 M9 28 h22" stroke="#8a5a2b" stroke-width="1.4"/>'],
polotence:['полотенце','<rect x="9" y="5" width="22" height="30" rx="1.5" fill="#f7f7f2" '+O+'/><path d="M9 28 h22 M9 31 h22" stroke="#d9413b" stroke-width="2"/><path d="M9 9 h22" stroke="#d9413b" stroke-width="2"/>'],
mylo:['мыло','<rect x="6" y="15" width="28" height="15" rx="6" fill="#f3b6d0" '+O+'/><circle cx="31" cy="12" r="3" fill="#e6f4fb" '+O+'/><circle cx="35" cy="7" r="2" fill="#e6f4fb" '+O+'/>'],
ruchka:['ручка','<path d="M8 34 l3 -9 l19 -19 l6 6 l-19 19z" fill="#2563c9" '+O+'/><path d="M8 34 l3 -9 l6 6z" fill="#f2e3c0" '+O+'/>'],
otkrytka:['открытка','<rect x="5" y="9" width="30" height="22" rx="1.5" fill="#fff" '+O+'/><path d="M11 25 q3 -10 7 -2 q4 -10 7 2" fill="#e57399"/><circle cx="28" cy="15" r="3" fill="#f1c40f"/>'],
shar:['шарик','<ellipse cx="20" cy="16" rx="10" ry="12" fill="#e74c3c" '+O+'/><path d="M20 28 l-2 3 h4z M20 31 q-3 4 1 8" fill="#e74c3c" '+O+'/><ellipse cx="16" cy="11" rx="2.5" ry="4" fill="#fff" opacity=".6"/>'],
svecha:['свеча','<rect x="15" y="15" width="10" height="20" fill="#fdf2d0" '+O+'/><path d="M20 4 q5 6 0 10 q-5 -4 0 -10z" fill="#f39c12" '+O+'/><path d="M20 14 v2" '+O+'/>'],
kruzhka:['кружка','<rect x="8" y="10" width="20" height="24" rx="3" fill="#f2f2f2" '+O+'/><path d="M28 15 q8 0 8 7 q0 7 -8 7" fill="none" '+O+' stroke-width="3"/><circle cx="18" cy="22" r="4" fill="#d9413b"/>'],
mel:['мел','<path d="M6 26 l20 -16 l7 8 l-20 16z" fill="#fbfbfb" '+O+'/><path d="M26 10 l7 8" stroke="#ddd" stroke-width="3"/>'],
kolokolchik:['колокольчик','<path d="M10 30 q0 -18 10 -20 q10 2 10 20z" fill="#e7c14a" '+O+'/><rect x="7" y="29" width="26" height="4" rx="2" fill="#d4a92e" '+O+'/><circle cx="20" cy="35" r="2.5" fill="#8a6a1a"/><rect x="18" y="4" width="4" height="7" fill="#8a5a2b" '+O+'/>'],
karandash:['карандаш','<path d="M5 30 l4 -2 l22 -22 l4 4 l-22 22 l-2 4z" fill="#f1c40f" '+O+'/><path d="M5 30 l4 -2 l2 2 l-2 4z" fill="#f2d7b0" '+O+'/><path d="M31 6 l4 4" stroke="#e57399" stroke-width="3"/>'],
marka:['марка','<rect x="8" y="7" width="24" height="26" fill="#fff" stroke="#3b3b3b" stroke-width="1.6" stroke-dasharray="2.4 1.6"/><rect x="11" y="10" width="18" height="15" fill="#6fb3e0"/><path d="M11 25 l6 -7 l5 5 l3 -3 l4 5z" fill="#4c9a3f"/>'],
grib:['гриб','<path d="M4 20 q16 -18 32 0z" fill="#b5651d" '+O+'/><path d="M15 20 h10 l1 14 h-12z" fill="#f4ecd8" '+O+'/>'],
tort:['торт','<rect x="6" y="22" width="28" height="12" rx="2" fill="#f7d9e6" '+O+'/><rect x="10" y="13" width="20" height="10" rx="2" fill="#fdf2d0" '+O+'/><path d="M6 25 q4 3 7 0 q4 3 7 0 q4 3 7 0 q4 3 7 0" stroke="#e57399" stroke-width="2" fill="none"/><path d="M20 6 v7" stroke="#2563c9" stroke-width="2"/>'],
podarok:['подарок','<rect x="6" y="15" width="28" height="19" fill="#2f9e44" '+O+'/><rect x="4" y="11" width="32" height="6" fill="#40b356" '+O+'/><path d="M20 11 v23" stroke="#e74c3c" stroke-width="4"/><path d="M20 11 q-9 -9 -10 -1 q2 2 10 1 q9 1 10 -1 q-1 -8 -10 1" fill="#e74c3c" '+O+'/>'],
chemodan:['чемодан','<rect x="5" y="13" width="30" height="21" rx="3" fill="#a0522d" '+O+'/><path d="M15 13 v-5 h10 v5" fill="none" '+O+' stroke-width="2.4"/><path d="M12 13 v21 M28 13 v21" stroke="#6b3a1e" stroke-width="2"/>'],
telefon:['телефон','<rect x="12" y="4" width="16" height="32" rx="3" fill="#2b2f36" '+O+'/><rect x="14" y="8" width="12" height="22" fill="#7fc3f0"/><circle cx="20" cy="33" r="1.3" fill="#ccc"/>'],
mandarin:['мандарин','<circle cx="20" cy="22" r="12" fill="#f39c12" '+O+'/><path d="M20 10 q4 -6 10 -4 q-4 6 -10 4z" fill="#3e9a3b" '+O+'/><circle cx="16" cy="18" r="1" fill="#d07a00"/><circle cx="24" cy="25" r="1" fill="#d07a00"/>'],
varezhka:['варежка','<path d="M10 34 v-16 q0 -12 10 -12 q8 0 8 10 l6 -2 q4 2 0 7 l-6 4 v9z" fill="#d9413b" '+O+'/><rect x="9" y="30" width="20" height="6" rx="2" fill="#fff" '+O+'/>'],
globus:['глобус','<circle cx="20" cy="17" r="11" fill="#6fb3e0" '+O+'/><path d="M13 12 q4 2 6 -2 q4 4 0 8 q-4 1 -6 4 M24 20 q4 -2 5 2" fill="#4c9a3f"/><path d="M30 22 q-8 12 -20 4 M20 30 v5 M13 36 h14" fill="none" '+O+'/>'],
noty:['ноты','<rect x="5" y="7" width="30" height="27" fill="#fffef6" '+O+'/><path d="M8 13 h24 M8 16 h24 M8 19 h24 M8 22 h24 M8 25 h24" stroke="#999" stroke-width=".9"/><ellipse cx="15" cy="23" rx="2.6" ry="2" fill="#222"/><ellipse cx="25" cy="20" rx="2.6" ry="2" fill="#222"/><path d="M17.5 23 v-10 M27.5 20 v-10" stroke="#222" stroke-width="1.4"/>'],
platok:['платок','<path d="M4 8 h32 l-16 27z" fill="#e05f8a" '+O+'/><circle cx="14" cy="13" r="2" fill="#fff"/><circle cx="25" cy="13" r="2" fill="#fff"/><circle cx="20" cy="21" r="2" fill="#fff"/>'],
banka:['банка','<rect x="9" y="11" width="22" height="24" rx="5" fill="#cfe9d6" '+O+'/><rect x="11" y="5" width="18" height="6" rx="1.5" fill="#d4a92e" '+O+'/><path d="M14 19 q4 -3 6 3 q2 6 6 1" stroke="#4c9a3f" stroke-width="3" fill="none"/>']};
const CAT='<svg viewBox="0 0 60 50" aria-hidden="true"><path d="M8 50 v-22 l-4 -20 l14 10 q12 -4 24 0 l14 -10 l-4 20 v22z" fill="#8c8f96" stroke="#3b3b3b" stroke-width="2"/>'+
'<path d="M9 14 l3 6 M51 14 l-3 6" stroke="#e7a2a2" stroke-width="3"/><ellipse cx="22" cy="30" rx="4" ry="5" fill="#f4e04d" stroke="#333" stroke-width="1.5"/><ellipse cx="38" cy="30" rx="4" ry="5" fill="#f4e04d" stroke="#333" stroke-width="1.5"/>'+
'<ellipse cx="22" cy="31" rx="1.4" ry="3.6" fill="#222"/><ellipse cx="38" cy="31" rx="1.4" ry="3.6" fill="#222"/><path d="M28 38 h4 l-2 2z" fill="#d07a7a"/><path d="M14 38 h-10 M14 41 h-9 M46 38 h10 M46 41 h9" stroke="#555" stroke-width="1.1"/></svg>';
const svg=(id,inner)=>'<svg viewBox="0 0 40 40" aria-hidden="true">'+inner+'</svg>';
const CSS='.zr-ny{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;background:#f3ecdc}'+
'.zr-nys{display:flex;gap:8px;align-items:center;padding:6px 10px;width:100%;box-sizing:border-box;max-width:820px}.zr-nys .zr-av{flex:0 0 44px;height:44px;border-radius:50%;overflow:hidden;background:#fff}.zr-nys .zr-av svg{width:100%;height:100%}'+
'.zr-nys p{flex:1;margin:0;background:#fff;border-radius:14px;padding:6px 10px;font-size:15px;line-height:1.25;color:#27324a;box-shadow:0 1px 3px rgba(0,0,0,.12)}'+
'.zr-sc{position:relative;flex:0 0 auto;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,.2);background:#dfe7f2;touch-action:manipulation;cursor:pointer}'+
'.zr-sc>.bg{position:absolute;left:0;top:0;width:100%;height:100%}.zr-sc>.bg svg{width:100%;height:100%;display:block}'+
'.zr-hi{position:absolute;transform:translate(-50%,-50%);pointer-events:none}.zr-hi svg{width:100%;height:100%;display:block;filter:drop-shadow(0 1px 1px rgba(0,0,0,.35))}'+
'.zr-hi.cat{overflow:hidden}.zr-ring{position:absolute;transform:translate(-50%,-50%);border:4px solid #2fae4e;border-radius:50%;pointer-events:none;animation:zrring .4s ease-out;box-sizing:border-box}'+
'@keyframes zrring{from{transform:translate(-50%,-50%) scale(1.8);opacity:0}}'+
'.zr-glow{position:absolute;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;background:radial-gradient(rgba(255,240,140,.85),rgba(255,240,140,0) 70%);animation:zrglow 1.2s ease-in-out 3}'+
'@keyframes zrglow{50%{opacity:.25}}.zr-miss{position:absolute;transform:translate(-50%,-50%);font-weight:900;color:#c62f2a;font-size:15px;pointer-events:none;text-shadow:0 1px 0 #fff;animation:zrfl3 .9s ease-out forwards}'+
'@keyframes zrfl3{to{transform:translate(-50%,-150%);opacity:0}}'+
'.zr-ls{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;padding:8px 8px 10px;max-width:820px}.zr-ls span{display:inline-flex;align-items:center;gap:4px;background:#fff;border-radius:12px;padding:5px 9px;font-weight:800;font-size:15.5px;color:#27324a;box-shadow:0 1px 2px rgba(0,0,0,.15)}'+
'.zr-ls span i{display:inline-block;width:22px;height:22px}.zr-ls span i svg{width:100%;height:100%}.zr-ls span.ok{background:#d8f0dc;color:#237a3b;text-decoration:line-through}'+
'@media (prefers-reduced-motion:reduce){.zr-ring,.zr-glow,.zr-miss{animation:none}}';
const SAYOK=['Есть! Глаз — алмаз.','Нашёл! Ставлю галочку.','Молодец. Как завуч — всё видит.','Вот оно где!','Ага, попалось!'];
const SAYCAT=['Вот ты где, бродяга!','Нашёлся, путешественник!','Ять! А я уж волноваться начала.'];
function placeOf(o){let n=0;try{const c=o.ctx&&o.ctx.c!=null?o.ctx.c:ZB.chapAt(Math.min(+S.lv||0,Math.max(0,LEVELS.length-1)));n=ZB.chap(c).place||((c%25)+1);}catch(e){n=1;}
return Math.max(1,Math.min(25,n|0));}
function sceneOf(o,mem){const D=window.ZMG_NAJDI||{};let n=placeOf(o);
if(o.mode==='cab'||o.mode==='new'||o.mode==='win'){const last=Math.max(1,Math.min(25,Math.floor((+S.lv||0)/20)||1));mem.k=((mem.k|0)%last)+1;n=mem.k;}
return D[n]?{n,d:D[n]}:null;}
ZMG_REG({id:'najdi',a:'Экскурсия окончена — найди кота и вещи по списку',ns:'Мяу. Я не потерялся. Я спрятался. Найдёшь?',deps:['js/zmg-najdi-data.js'],
open:()=>true,finWho:'yat',
lines:{good:'Мяу. Я не терялся. Я осматривал экскурсию.',ok:'Мур. Нашли — и ладно. Где моя котлета?',bad:'Мяу… Долго искали, но нашли же!'},
sim(o,k){let t=0;for(let i=0;i<6;i++)t+=(2+9*(1-k))*(.5+o.rnd())+(o.rnd()<(1-k)*.5?3:0);t=Math.round(t);return{sc:Math.max(1,100-t),st:tierOf(t)};},
run(host,o){const sc=sceneOf(o,host.mem());if(!sc){host.quit();return;}
if(!document.getElementById('zrNyCss')){const s=document.createElement('style');s.id='zrNyCss';s.textContent=CSS;document.head.appendChild(s);}
const D=sc.d,list=[['cat','Ять',D.cat[0],D.cat[1],D.cat[2]]].concat(D.it.map(a=>[a[0],(IT[a[0]]||['?'])[0],a[1],a[2],a[3]]));
host.el.innerHTML='<div class="zr-ny"><div class="zr-nys"><span class="zr-av">'+host.face('zina','happy')+'</span><p>'+esc(D.say)+'</p></div>'+
'<div class="zr-sc"><div class="bg"></div></div><div class="zr-ls">'+list.map((x,i)=>'<span data-i="'+i+'"><i>'+(x[0]==='cat'?CAT:svg(x[0],(IT[x[0]]||['',''])[1]))+'</i>'+esc(x[1])+'</span>').join('')+'</div></div>';
const $=q=>host.el.querySelector(q),box=$('.zr-sc'),bg=$('.bg'),say=$('.zr-nys p'),av=$('.zr-av');
bg.style.backgroundColor=(window.ZB_ART&&ZB_ART[sc.n]&&ZB_ART[sc.n].c)||'#dfe7f2';
const art=()=>{const A=window.ZB_ART&&ZB_ART[sc.n];if(A&&A.svg)bg.innerHTML=A.svg('xMidYMid slice');};
if(window.ZB_ART&&ZB_ART[sc.n])art();else ZB.load(ZB.placeFile(sc.n)).then(art,()=>{});
const found={};let W=0,H=0,t=0,on=false,fin=false,idle=0,miss=0,hints=0,glowT=0;
const els=list.map((x,i)=>{const e=document.createElement('div');e.className='zr-hi'+(x[0]==='cat'?' cat':'');
e.innerHTML=x[0]==='cat'?CAT:svg(x[0],(IT[x[0]]||['',''])[1]);box.appendChild(e);return e;});
function fit(){const aw=Math.max(200,host.w-12),ah=Math.max(150,host.h-(($('.zr-nys').offsetHeight||56)+($('.zr-ls').offsetHeight||80)+14));
W=Math.min(aw,ah*4/3,900);H=W*.75;box.style.width=W+'px';box.style.height=H+'px';
const s=Math.max(30,W*.085);list.forEach((x,i)=>{const e=els[i],k=x[0]==='cat'?1.25:1;e.style.width=(s*k)+'px';e.style.height=(s*k*(x[0]==='cat'?0.8:1))+'px';
e.style.left=x[2]+'%';e.style.top=x[3]+'%';e.style.transform='translate(-50%,-50%) rotate('+(x[4]||0)+'deg)';});}
fit();host.onResize(fit);setTimeout(fit,60);
const R=()=>Math.max(26,W*.075);
function hitAt(px,py){let best=-1,bd=1e9;list.forEach((x,i)=>{if(found[i])return;const dx=px-x[2]/100*W,dy=py-x[3]/100*H,d=Math.sqrt(dx*dx+dy*dy);if(d<bd){bd=d;best=i;}});return bd<=R()?best:-1;}
function mark(i){found[i]=1;idle=0;const x=list[i],r=document.createElement('div');r.className='zr-ring';const d=R()*2;r.style.width=d+'px';r.style.height=d+'px';r.style.left=x[2]+'%';r.style.top=x[3]+'%';box.appendChild(r);
const sp=$('.zr-ls [data-i="'+i+'"]');if(sp)sp.classList.add('ok');try{host.snd[x[0]==='cat'?'meow':'coin']();}catch(e){}
say.textContent=x[0]==='cat'?SAYCAT[Math.floor(o.rnd()*SAYCAT.length)]:SAYOK[Math.floor(o.rnd()*SAYOK.length)];av.innerHTML=host.face(x[0]==='cat'?'yat':'zina','happy');
const n=Object.keys(found).length;host.top(n+' из '+list.length);
if(n>=list.length){fin=true;const sec=Math.round(t);setTimeout(()=>host.finish({sc:Math.max(1,100-sec),st:tierOf(sec),h:hints,label:'Всё нашлось за '+sec+' с'+(miss?' · промахов '+miss:'')}),host.calm?400:900);}}
function tapAt(px,py){if(!on||fin)return;const i=hitAt(px,py);if(i>=0){mark(i);return;}
if(list.some((x,j)=>found[j]&&Math.hypot(px-x[2]/100*W,py-x[3]/100*H)<=R()))return;
miss++;t+=3;
const m=document.createElement('div');m.className='zr-miss';m.textContent='мимо +3 с';m.style.left=px+'px';m.style.top=py+'px';box.appendChild(m);setTimeout(()=>m.remove(),950);try{host.snd.bad();}catch(e){}}
host.ptr(box,{down(x,y){tapAt(x,y);}});
host.loop(dt=>{if(!on||fin)return;t+=dt;idle+=dt;host.top(Object.keys(found).length+' из '+list.length+' · '+Math.floor(t)+' с');
if(idle>=25){idle=8;hints++;const L=list.map((x,i)=>i).filter(i=>!found[i]),i=L[Math.floor(o.rnd()*L.length)],x=list[i];
const g=document.createElement('div');g.className='zr-glow';const d=R()*3;g.style.width=d+'px';g.style.height=d+'px';g.style.left=x[2]+'%';g.style.top=x[3]+'%';box.appendChild(g);
clearTimeout(glowT);glowT=setTimeout(()=>g.remove(),3700);say.textContent='Мяу! Тут что-то есть…';av.innerHTML=host.face('yat','norm');try{host.snd.meow();}catch(e){}}});
host.onQuit(()=>clearTimeout(glowT));
host.bot=k=>{if(!on||fin)return;if(o.rnd()<(1-k)*.08){tapAt(W*o.rnd(),H*o.rnd());return;}
if(o.rnd()<.08+k*.3){const L=list.map((x,i)=>i).filter(i=>!found[i]);if(L.length){const x=list[L[0]];tapAt(x[2]/100*W+(o.rnd()-.5)*R(),x[3]/100*H+(o.rnd()-.5)*R());}}};
ZMG.najdiTest=()=>list.map((x,i)=>({i,id:x[0],x:x[2]/100*W,y:x[3]/100*H,hit:hitAt(x[2]/100*W,x[3]/100*H)}));
host.top('0 из '+list.length);
host.intro({who:'yat',text:'Мяу! '+D.n+': экскурсия окончена. Найди меня и вещи по списку — побыстрее, пока Зина не рассердилась.',hint:'Нажимай на рисунок там, где спрятан предмет. Мимо — плюс 3 секунды.',btn:'Искать!'})
.then(()=>{on=true;fit();});}});
})();
