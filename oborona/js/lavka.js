'use strict';
/* ob2-LAVKA: лавка за голоса, украшения по главам, праздничная лавка. Флаг lavka, поле S.o2k. На старте — товары (довыдача), подарок, обёртки; остальное — js/lavka-x.js (там описание).
   LAV_CAT=1 (13.10: vk-pay all-1310 выкачен и знает kvas 4, starter 5, speed_box 7, night_kit 10, skins_firebird 11; 0 — новых товаров в VK нет, Жар-птица 14) */
const LAV_CAT=1;
const LAV={x:null,up:-1,t:0,ios:0,dch:[0,0,2,3,4,5]};
if(OB2.reg('lavka',{s:'LAVKA',t:'Лавка, украшения по главам'})){
  OB2.field('k',{id:'lavka',def:()=>({d0:dayKey()}),fix(o){if(typeof o.d0!=='string')o.d0=dayKey();}});
  const P=PAY_ITEMS,cat=LAV_CAT||PAY.test,xb=id=>{if(typeof xbnGive==='function')xbnGive(id);},it=(id,v,ic,o)=>{P[id]=Object.assign({vk:cat?v:0,ic:ic,name:id,desc:''},o);PAY_TEST[id]=v*7;};
  if(cat)P.skins_firebird.vk=11;
  it('kvas',4,'🍺',{give(){lkBoost(1200);lkK().kv=(lkK().kv|0)+1;}});
  it('starter',5,'🎒',{perm:1,give(){lkBoost(3600);xb('voev');lkK().sf=1;}});
  it('speed_box',7,'⏩',{give(){lkBoost(10800);}});
  it('night_kit',10,'🎃',{perm:1,give(){for(const t of TW_ORDER)S.skins[t+'.night']=1;lkDeco('lantern');xb('luna');}});
  OB2.slot('map','lavka',()=>{if(S.wins>=2||lkK().gw===1)lkX().then(x=>x.map()).catch(lkE);});
  OB2.on('end',(g,win)=>{if(win)lkGift();},'lavka');
  OB2.on('menu',()=>{if(S.deco.lantern||S.deco.scare||S.bns.voev||S.bns.luna||lkFest())lkX().catch(lkE);},'lavka');
  OB2.enter('lavka',40,()=>{if(lkK().gw||!lkGift())return false;lkX().then(x=>x.gift()).catch(lkE);return true;});
  {const c0=cosmeticsHTML;cosmeticsHTML=function(){if(LAV.x)return LAV.x.cos();lkX().then(()=>{if(curTab==='Village'&&!G)renderVillage();}).catch(lkE);return c0();};}
  {const h0=payHtml;payHtml=function(ids,o){return h0(ids||['no_ads','speed_x2','skins_firebird'],o);};}
  {const a0=payAfter;payAfter=function(){a0.apply(this,arguments);if(!G&&(lkK().sf||curTab==='Map'&&lkShow()))lkX().then(x=>{x.map();if(lkK().sf)x.pick();}).catch(lkE);};}
  {const v0=PAY.give;PAY.give=function(){PAY.gv=(PAY.gv|0)+1;return v0.apply(PAY,arguments);};}
}
function lkK(){return S.o2k||(S.o2k={d0:dayKey()});}
function lkBoost(s){S.boost=(+S.boost||0)+s;}
function lkFest(){return typeof festOn==='function'&&festOn();}
function lkDeco(id){if(S.deco[id])return;S.deco[id]=1;let n=0;for(const k in S.deco)if(S.deco[k])n++;OB2.emit('deco',{id:id,n:n});}
function lkDOpen(i){return vilDone()||!!S.stars[CH_ORDER[LAV.dch[i]]+'-5'];}
function lkX(){return OB2.need('js/lavka-x.js').then(()=>LAV.x);}
/* OB-ERR 17.10: окна Лавки не загрузились (медленная сеть) — молча, без «Uncaught (in promise)»; при следующем входе грузим снова */
function lkE(e){try{console.warn('lavka-x',e&&e.message||e);}catch(x){}}
function lkGift(){const k=lkK();if(k.gw||!S.stars[CH_ORDER[0]+'-5'])return false;k.gw=1;if(S.deco.well){k.gw=2;return false;}lkDeco('well');save();return true;}
function lkShow(){return !OK&&S.wins>=2&&(PAY.on&&!LAV.ios||lkFest());}
