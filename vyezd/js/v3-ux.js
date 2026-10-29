(function(root){'use strict';
var NEED={arch:1,bench:1,night:1,board:1,kiosk:1,street:1,
calendar:2,moskvich:2,mail:2,
garages:3,
chalk:4,
flowers:5,
camera:6,intercom:6,
attic:7};
function needDay(at){return NEED[at]||1;}
function gateOpen(at,day,vet){if(vet)return true;return(day|0)>=needDay(at);}
var STAGE_D=[1,3,7,14,30];
function stageK(days){var k=0;for(var i=0;i<STAGE_D.length;i++)if((days|0)>=STAGE_D[i])k=i;return k;}
function stageNext(days){var k=stageK(days);return k>=4?0:STAGE_D[k+1]-(days|0);}
var SCENE_EVERY=5;
function sceneDue(sc){return(sc|0)>=SCENE_EVERY;}
function benchMood(h){h=h|0;if(h>=22||h<6)return'night';if(h===14)return'quiet';if(h>=12&&h<14)return'tea';if(h>=17)return'paper';if(h<10)return'morning';return'day';}
function quietHour(h){return(h|0)===14;}
var GUEST_EVERY=8;
function guestDue(gn,r){return(gn|0)>=GUEST_EVERY&&r<0.5;}
function mailReady(sd,dk,h){if(!sd)return false;if(dk>sd+1)return true;if(dk===sd+1)return(h|0)>=6;return false;}
var TOPIC_W=[['bug',/ошибк|баг|глюч|завис|не работа|сломал|вылет|bug|crash|freez/i],['ad',/реклам|ролик|\bad\b|ads/i],
['money',/монет|деньг|купить|голос|дорого|coin|money|pay/i],['hard',/сложн|не могу пройти|не пройти|трудн|застрял|hard|stuck/i],
['idea',/иде|предлага|добавьте|хорошо бы|сделайте|idea|please add/i],['thanks',/спасибо|нравит|класс|супер|отличн|люблю|thank|love it|great/i],
['car',/машин|волг|жигул|москвич|запор|копейк|\bcar/i],['grandkids',/внук|внучк|grandkid|grandson|granddaughter/i],
['health',/давлен|здоров|болею|болит|врач|health|doctor/i],['age',/лет мне|мне \d\d|пенси|возраст|years old|retired/i],
['lonely',/одинок|скучно|не с кем|lonely|alone/i],['night',/ночь|ночн|бессонн|night/i],['music',/музык|песн|music|song/i],
['sound',/звук|громк|тихо|sound|volume/i],['slow',/тормоз|медленн|долго груз|slow|lag/i],['barsik',/барсик|кот|кошк|cat/i],
['galya',/гал[яию]/i],['ded',/дед|муж|ваш мой|husband/i],['recipe',/рецепт|пирог|варень|recipe|pie/i],
['complaint',/жалоб|плохо|ужас|бесит|верните|complain|terrible/i],['question_how',/как пройти|как проехать|подскаж|how do|how to/i]];
function topicOf(txt,chip){var t=String(txt||'');for(var i=0;i<TOPIC_W.length;i++)if(TOPIC_W[i][1].test(t))return TOPIC_W[i][0];
return chip==='bug'?'bug':chip==='idea'?'idea':chip==='like'?'thanks':chip==='yard'?'hard':'other';}
var FR_DAY=2,FR_NEED=12;
function frankAdd(st,dk){st=st||{};var r={fr:st.fr|0,fd:st.fd|0,fq:st.fq|0,fk:st.fk|0,got:0,built:0};
if(r.fd!==dk){r.fd=dk;r.fq=0;}
if(r.fq>=FR_DAY)return r;r.fq++;r.fr++;r.got=1;
if(r.fr>=FR_NEED){r.fr-=FR_NEED;r.fk++;r.built=1;}return r;}
var ZONES=[[0,'bench'],[30,'flowers'],[90,'swing'],[180,'park'],[300,'pigeon'],[450,'garage'],[650,'fountain'],[900,'stage']];
function zonesFor(stars){var n=0;for(var i=0;i<ZONES.length;i++)if((stars|0)>=ZONES[i][0])n=i+1;
var nx=ZONES[n]||null;return{n:n,next:nx?nx[1]:'',need:nx?nx[0]-(stars|0):0,at:nx?nx[0]:0};}
function builds(n){var r=[];for(var i=0;i<n&&i<ZONES.length;i++){var z=ZONES[i][1];if(z==='park'||z==='pigeon'||z==='garage')r.push(z);}return r;}
function skyAt(tod0,frac){if(tod0==='night'||tod0==='evening'||!tod0)return tod0;
if(tod0==='morning')return frac>=.75?'evening':frac>=.4?'day':'morning';
return frac>=.7?'evening':tod0;}
function barsikOk(idx,bd,dk,r){return(idx|0)>=14&&bd!==dk&&r<0.25;}
function holdOk(hd,dk){return hd!==dk;}
var NB_MAX=24;
function nbAdd(nb,dk,code,arg){nb=Array.isArray(nb)?nb.slice():[];arg=arg==null?'':String(arg).slice(0,16);
for(var i=0;i<nb.length;i++)if(nb[i]&&nb[i][0]===dk&&nb[i][1]===code&&nb[i][2]===arg)return nb;
nb.push([dk,String(code).slice(0,6),arg]);while(nb.length>NB_MAX)nb.shift();return nb;}
function nbMerge(a,b){var m={},r=[],all=(Array.isArray(a)?a:[]).concat(Array.isArray(b)?b:[]);
for(var i=0;i<all.length;i++){var x=all[i];if(!Array.isArray(x)||x.length<2)continue;var k=x[0]+'|'+x[1]+'|'+(x[2]||'');if(m[k])continue;m[k]=1;r.push([+x[0]||0,String(x[1]).slice(0,6),String(x[2]||'').slice(0,16)]);}
r.sort(function(p,q){return p[0]-q[0];});while(r.length>NB_MAX)r.shift();return r;}
var NUM=['sc','rm','nt','hd','fr','fd','fq','fk','z','pie','qd','qn','gd','gn','bd','bn','vo','st','cr','md','mr','mk','psn','wk','wd','g7','pd','fc'];
var OPT=['tw','pg'];
var MAXK=['rm','nt','fk','qn','bn','st','psn','z','g7','hd'];
function fix(o){if(!o||typeof o!=='object'||Array.isArray(o))o={};o.v=1;
for(var i=0;i<NUM.length;i++){var k=NUM[i];if(typeof o[k]!=='number'||!isFinite(o[k])||o[k]<0)o[k]=0;o[k]=Math.floor(o[k]);}
delete o.mt;
for(var j=0;j<OPT.length;j++){var q=OPT[j];if(q in o){var x=Math.floor(+o[q]);if(isFinite(x)&&x>0)o[q]=x;else delete o[q];}}
o.nb=nbMerge(o.nb,[]);return o;}
function merge(a,b,newer){a=fix(a);b=fix(b);var r=fix(JSON.parse(JSON.stringify(newer?b:a)));
for(var i=0;i<MAXK.length;i++){var k=MAXK[i];r[k]=Math.max(a[k],b[k]);}
for(var j=0;j<OPT.length;j++){var q=OPT[j],v=Math.max(a[q]|0,b[q]|0);if(v)r[q]=v;else delete r[q];}
if(a.fk!==b.fk){var w=a.fk>b.fk?a:b;r.fr=w.fr;}else r.fr=Math.max(a.fr,b.fr);
if(a.md!==b.md){var m=a.md>b.md?a:b;r.md=m.md;r.mr=m.mr;}else{r.mr=Math.max(a.mr,b.mr);}
r.nb=nbMerge(a.nb,b.nb);return r;}
var api={NEED:NEED,needDay:needDay,gateOpen:gateOpen,STAGE_D:STAGE_D,stageK:stageK,stageNext:stageNext,SCENE_EVERY:SCENE_EVERY,sceneDue:sceneDue,
benchMood:benchMood,quietHour:quietHour,GUEST_EVERY:GUEST_EVERY,guestDue:guestDue,mailReady:mailReady,topicOf:topicOf,
FR_DAY:FR_DAY,FR_NEED:FR_NEED,frankAdd:frankAdd,ZONES:ZONES,zonesFor:zonesFor,builds:builds,skyAt:skyAt,barsikOk:barsikOk,holdOk:holdOk,
NB_MAX:NB_MAX,nbAdd:nbAdd,nbMerge:nbMerge,fix:fix,merge:merge};
root.V3UXL=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:this);
(function(){'use strict';
if(typeof window==='undefined')return;
var W=window,X=W.V3UXL;
if(!W.V3||!V3.reg||!V3.reg('ux',{s:'UX',t:'вещи двора и путь игрока'}))return;
var PARTS={week:'неделя новичка — вещи по дням',stage:'Шура помнит: ступени, тетрадка, держит место',bench:'лавочка: сценки, роман, записки, тихий час, гости',
mail:'почтовый ящик: ответ к утру, письмо недели',my:'Мой двор растёт',gar:'гаражи: Франкенштейн, хвосты мини-игр',map:'Гараж № 7 на карте',
sky:'день проходит по двору',last:'последняя машина — фраза',dust:'выезд в улицу с пылью',ah:'окна ахают по ходу двора',parts:'крупный двор по подъездам',
col:'счёт колонны одной строкой',barsik:'Где Барсик?',glass:'Шура забыла очки — стрелки крупнее',amb:'Скорая к Шуре — первые секунды (A/B)',voice:'Шура говорит голосом',say:'реплики и шутки висят дольше'};
for(var p in PARTS)try{V3.reg('ux.'+p,{s:'UX',t:PARTS[p]});}catch(e){}
V3.field('v3u',{s:'UX',def:{v:1},fix:function(o){return X.fix(o);},merge:function(a,b,newer){return X.merge(a,b,newer);}});
function S0(){try{return typeof S!=='undefined'&&S&&typeof S==='object'?S:null;}catch(e){return null;}}
function U(){var s=S0();if(!s)return X.fix({});if(!s.v3u||typeof s.v3u!=='object')s.v3u=X.fix({});return s.v3u;}
function sv(){try{if(typeof save==='function')save();}catch(e){}}
function dk(){return V3.dk();}
function on(p){return V3.is('ux.'+p);}
W.V3UX={
on:on,u:U,sv:sv,dk:dk,
needDay:X.needDay,
gate:function(at){if(!on('week'))return true;return X.gateOpen(at,V3.day(),V3.vet());},
stage:function(){var d=V3.day(),k=X.stageK(d),n=null;try{if(W.V3T&&V3T.stageOf)n=V3T.stageOf(k);}catch(e){}
var nm=n?n.name:['Новенький','Жилец','Свой','Актив двора','Правая рука'][k];return{k:k,name:nm,days:d,next:X.stageNext(d),thing:n?n.thing:null};},
note:function(code,arg){var u=U();u.nb=X.nbAdd(u.nb,dk(),code,arg);sv();V3.emit('ux:note',code,arg);},
hold:function(){return on('stage')&&X.holdOk(U().hd,dk());},
holdUse:function(){var u=U();if(!X.holdOk(u.hd,dk()))return false;u.hd=dk();sv();V3.ev('ux',{k:'hold'});return true;}
};
})();