/* Сгенерировано tools/missions_gb.py — не править руками (gb-TECH). Миссии VK «Гастронома №1»: условия данными [код, счётчик, порог];
   номера из кабинета VK — tools/vk-missions-ids.json (0 — не отправляется). Модуль SOC (index.html, evUrl/evId) шлёт сам, молча.
   Только ВКонтакте (не ОК, не Яндекс). Проверка — после победы (GB.levelHook), при показе главного и на старте. */
(function(){'use strict';
var VKM=[["lv1","lv",1],["lv10","lv",10],["lv50","lv",50],["lv750","lv",750],["rp1","rp",1],["rp3","rp",3],["rp5","rp",5],["rp10","rp",10],["rp15","rp",15],["rk1","rk",1],["rk4","rk",4],["rk6","rk",6],["rk9","rk",9],["sl1","sl",1],["sl10","sl",10],["sl30","sl",30],["sl100","sl",100],["dp1","dp",1],["dp10","dp",10],["dp30","dp",30],["mg1","mg",1],["mg50","mg",50],["al30","al",30],["al60","al",60],["dl1","dl",1],["dl30","dl",30],["dl100","dl",100],["sr7","sr",7]];
var VKM_ID={};
var CNT={lv:function(){return +S.levelsDone||0;},rp:function(){return Math.min(15,Math.floor((+S.levelsDone||0)/100));},rk:function(){return window.GBM&&GBM.on!==false&&GBM.rank?+GBM.rank()||0:0;},sl:function(){return window.GBM&&GBM.seals?+GBM.seals()||0:0;},dp:function(){var s=0,l=window.GBM&&GBM.depList?GBM.depList():[];for(var i=0;i<l.length;i++)s+=+l[i].lv||0;return s;},mg:function(){var n=S.gmg&&S.gmg.n,s=0,k;for(k in n||{})s+=+n[k]||0;return s;},al:function(){return Array.isArray(S.album)?S.album.length:0;},dl:function(){return Object.keys(S.daily||{}).length;},sr:function(){return S.streak&&+S.streak.day||0;}};
function on(){try{return typeof PLAT!=='undefined'&&PLAT==='vk'&&!(typeof OK!=='undefined'&&OK)&&typeof SOC!=='undefined'&&!!SOC.mission&&typeof S!=='undefined';}catch(e){return false;}}
function check(){if(!on())return;try{SOC.level(Math.min(1500,CNT.lv()));var memo={},i,m,f;
  for(i=0;i<VKM.length;i++){m=VKM[i];if(SOC.missionKnown(m[0]))continue;f=CNT[m[1]];if(!f)continue;if(!(m[1] in memo)){try{memo[m[1]]=+f()||0;}catch(e){memo[m[1]]=0;}}
    if(memo[m[1]]>=m[2])SOC.mission(m[0]);}}catch(e){}}
window.VKM_GB={list:VKM,id:function(c){return VKM_ID[c]||0;},cnt:CNT,check:check};
if(window.GB){GB.levelHook.push(function(i){if(i&&i.r==='win')setTimeout(check,400);});GB.on('home',function(){setTimeout(check,800);});GB.on('ready',function(){setTimeout(check,3000);});}
})();
