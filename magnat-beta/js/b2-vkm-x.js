/* b2-vkm-x.js — VKT/MERGE: миссии VK потоков, которые сами их не завели (MG, FEST, CUP, TEAM, STORY, ECO, NEDRA). Коды и тексты — VKT-tools/missions/list.md.
   Грузится по требованию вместе с b2-vkm-data.js (только VK, b2-vkm.js check). Только чтение состояния потоков; ошибка в ok() не ломает проверку (VKM ловит). */
(function(){'use strict';
if(typeof B2==='undefined'||!B2.vkm)return;
const W=()=>typeof GAME!=='undefined'&&GAME.W||null,S2=k=>B2.s(k)||{},isO=x=>x&&typeof x==='object';
/* MG: S.b2m.r{id:[рекорд,партий,неделя,Топтыгин,день]} */
const R=()=>{const r=S2('m').r;return isO(r)?r:{};},MD=id=>typeof MG!=='undefined'&&MG.medal?MG.medal(id)|0:0;
const played=()=>Object.keys(R()).filter(k=>Array.isArray(R()[k])&&R()[k][1]>0),golds=()=>played().filter(k=>MD(k)>=3);
B2.vkm('mgcore',[{id:'mg_1',ok:()=>played().length>0},{id:'mg_gold1',ok:()=>golds().length>0},
  {id:'mg_rec',ok:()=>played().some(k=>{const x=R()[k],g=typeof MG!=='undefined'&&MG.G&&MG.G[k];return x[3]>0&&(g&&g.lower?x[0]>0&&x[0]<x[3]:x[0]>x[3]);})},
  {id:'mg_all5',ok:()=>played().length>=5},{id:'mg_p100',ok:()=>played().reduce((a,k)=>a+(R()[k][1]|0),0)>=100},
  {id:'mg_p300',ok:()=>played().reduce((a,k)=>a+(R()[k][1]|0),0)>=300},{id:'mg_gold10',ok:()=>golds().length>=10},
  {id:'mg_shaur',ok:()=>MD('shaw')>=3},{id:'mg_gazel',ok:()=>MD('gaz')>=3},{id:'mg_slovo',ok:()=>MD('slovo')>=3},
  {id:'mg_krai4',ok:()=>['zimnik','plavka','ulov','paseka'].every(k=>Array.isArray(R()[k])&&R()[k][1]>0)}]);
/* FEST: S.b2v.t{<праздник><год>:{o,g}} — g > 0: задание праздника выполнено и забрано */
const FD=()=>{const t=S2('v').t;return isO(t)?Object.keys(t).filter(k=>isO(t[k])&&(t[k].g|0)>0).map(k=>k.replace(/\d+$/,'')):[];},fd=p=>()=>FD().indexOf(p)>=0;
B2.vkm('fest',[{id:'fs_bf',ok:fd('bf')},{id:'fs_mom',ok:fd('mam')},{id:'fs_tree',ok:fd('ny')},{id:'fs_corp',ok:fd('kan')},{id:'fs_stud',ok:fd('stu')},
  {id:'fs_val',ok:fd('lub')},{id:'fs_def',ok:fd('bog')},{id:'fs_mar8',ok:fd('mar')},{id:'fs_masl',ok:fd('mas')},
  {id:'fs_5',ok:()=>{const t=S2('v').t;return isO(t)&&Object.keys(t).filter(k=>isO(t[k])&&(t[k].g|0)>0).length>=5;}}]);
/* CUP: S.b2c — lgw забранная неделя, tr ступень (лига = tr/4: 4 Серебряная, 5 Золотая), up/win — отметки b2-merge в b2-cup-net.js prize() */
const C=()=>S2('c'),lgI=()=>Math.floor((C().tr|0)/4);
B2.vkm('cup',[{id:'cu_join',ok:()=>(C().lgw|0)>0},{id:'cu_up',ok:()=>(C().up|0)>0},{id:'cu_win',ok:()=>(C().win|0)>0},
  {id:'cu_silv',ok:()=>lgI()>=4||!!(C().fr&&(C().fr[4]||C().fr[5]||C().fr[6]))},{id:'cu_gold',ok:()=>lgI()>=5||!!(C().fr&&(C().fr[5]||C().fr[6]))}]);
/* TEAM: W.b2.team.d {вид:человек} — опердиректора; S.b2t.v — ветераны, перешедшие в новый край */
const TD=()=>{const w=W(),t=w&&w.b2&&w.b2.team;return t&&isO(t.d)?Object.keys(t.d).length:0;};
B2.vkm('team',[{id:'tm_dir',ok:()=>TD()>=1},{id:'tm_3',ok:()=>TD()>=3},{id:'tm_move',ok:()=>{const w=W(),v=S2('t').v;return !!(w&&w.hold>=2&&Array.isArray(v)&&v.length);}}]);
/* STORY: S.b2s.f — финал, .yr — «Итоги года» показаны */
B2.vkm('story',[{id:'st_final',ok:()=>!!S2('s').f},{id:'st_year',ok:()=>(S2('s').yr|0)>0}]);
/* ECO: S.b2o.mc — подарков городу за всё время (меценатство) */
const MC=()=>{const m=S2('o').mc;return Array.isArray(m)?m.length:(m|0);};
B2.vkm('eco',[{id:'ec_pat1',ok:()=>MC()>=1},{id:'ec_pat5',ok:()=>MC()>=5}]);
/* NEDRA: доразведка — W.b2.nedra.dz {объект:месяц}; запас добавлен (в очереди dzq этого объекта уже нет) */
B2.vkm('nedra',[{id:'nd_rex',ok:()=>{const w=W(),x=w&&w.b2&&w.b2.nedra;if(!x||!isO(x.dz))return false;const q=Array.isArray(x.dzq)?x.dzq:[];return Object.keys(x.dz).some(o=>!q.some(z=>z.o===o||String(z.o)===o));}}]);
})();
