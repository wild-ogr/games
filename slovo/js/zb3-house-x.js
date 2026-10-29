'use strict';
(function(){
var Z=window.Z3;if(!Z||!Z.srv||!Z.srv._h)return;var H=Z.srv._h;
var now=H.now,lsG=H.lsG,rng=H.rng,hsh=H.hsh,msk=H.msk,dkey=H.dkey,wkey=H.wkey,wstart=H.wstart,wfrac=H.wfrac,wkidx=H.wkidx,mine=H.mine,net=H.net;
var WK0=202644,EB=60,ENS=45;
var BOTS=["Зоя Макаровна","Павел Игнатьевич","Ирина","Артём","Фаина Степановна","Гоша","Вера Андреевна","Руслан","Лиля","Борис Львович","Нюра","Макс","Эмма Ильинична","Денис","Роза Фёдоровна","Антон Сергеевич","Полина","Савелий Палыч","Мила","Костя","Агата Викторовна","Рома","Дарья Петровна","Фёдор Ильич"];
var BRID=[["чайник",["s02","a04","e05"],"Зина"],["самовар",["s01","a05","m02"],"Семён"],["часы",["s09","a17","a14"],"Валентина Петровна"],["веник",["s04","a15","p18"],"Люся"],["елка",["s18","c03","a16"],"Тамара"],["лейка",["s17","a09","p03"],"Тамара"],["шапка",["s06","a01","p02"],"Зина"],["замок",["s09","a23","m02"],"Толик"],["ключ",["s07","a22","z11"],"Галя"],["снег",["s01","c04","a25"],"Семён"],["дождь",["s01","m08","a25"],"Тамара"],["хлеб",["s04","z03","a13"],"тётя Валя"],["пирог",["s02","m05","t04"],"Зина"],["ложка",["s11","a13","m02"],"тётя Валя"],["подсолнух",["s01","c01","p03"],"Тамара"],["тыква",["s17","c09","z10"],"Тамара"],["огурец",["s01","c03","t05"],"Зина"],["борщ",["s02","c02","a13"],"Зина"],["телефон",["s08","z11","t11"],"Валерка"],["письмо",["s15","m06","z04"],"Люся"],["книга",["s16","m06","a20"],"Валентина Петровна"],["тетрадь",["s16","m06","p17"],"Зина"],["звонок",["s16","t11","a24"],"Валентина Петровна"],["доска",["s16","c03","p05"],"Зина"],["лавочка",["s10","p23","a08"],"Галя"],["фонарь",["s09","a10","p23"],"Толик"],["качели",["s09","a19","p23"],"Валерка"],["лампа",["s02","a10","m04"],"Зина"],["окно",["s01","m04","a23"],"Галя"],["зеркало",["s01","a06","m04"],"Зина"],["утюг",["s04","a01","m02"],"Зина"],["подушка",["s19","m03","t06"],"Галя"],["клубок",["s19","m07","z01"],"Зина"],["гриб",["s01","p12","z04"],"Семён"],["яблоко",["s01","c02","p03"],"Тамара"],["картошка",["s01","p10","c08"],"тётя Валя"],["лодка",["s01","a27","m01"],"Семён"],["удочка",["s06","a11","m01"],"Семён"],["принтер",["s07","a03","m12"],"дядя Коля"],["зонт",["s09","m03","c05"],"Люся"]];
var LT_CAN=["{nm}, спасибо за письмо! Читала при чае и улыбалась — чай остыл. Это лучший комплимент от меня. Заходи, слова ждут. Твоя Зина.","Милый {nm}, письмо получила. Хорошо рассказал — Валерке бы так писать сочинения. Хотя бы без «сабаки». Пиши ещё. Твоя Зина.","{nm}, голубчик, как приятно, когда пишут! Галя, конечно, знала заранее. А я нет — и обрадовалась в первый раз. Твоя Зина.","{nm}, твоё письмо — как пирожок: тёплое и вовремя. Спасибо. Мой тоже просил кусочек, но я прочитала вслух. Твоя Зина.","Внучек {nm}, письмо положила на комод — читаю по вечерам. Раньше так читала только сочинения. Твоё — без единой красной пометки. Твоя Зина.","{nm}, милая, спасибо за тепло. Хотела прочитать одна — пришлось вслух, всему двору. Галя, правда, уже знала, чем кончится. Твоя Зина.","{nm}, получила письмо — и день сразу лучше. Ять сказал «мяу». Перевожу: «хватит читать, корми меня». Твоя Зина.","{nm}, дорогой, какое славное письмо! Валентина Петровна читала через плечо. Потребовала «убрать лишнюю запятую». Нашла у себя. Твоя Зина."];
var FESTS=[['ny2027',20261215,20270108,300000,0.5]];
function bots(wk,h,e,free,t){var r=rng((wk*131+h*17+e)>>>0),n=BOTS.slice(),i,j,x,f=wfrac(t),day=Math.floor(((t||now())+3*3600e3)/864e5),out=[];
for(i=n.length-1;i>0;i--){j=Math.floor(r()*(i+1));x=n[i];n[i]=n[j];n[j]=x;}
for(i=0;i<free;i++){var rate=40+Math.floor(r()*90),act=rng((day*7919+wk*31+h*7+e*3+i)>>>0)()<0.7;
out.push({n:n[i%n.length]+(i<n.length?'':' ('+(Math.floor(i/n.length)+1)+')'),b:1,t:'b'+i,pt:Math.floor(rate*f),a:act?1:0,ask:0});}
return out;}
function wk0(){return+lsG('z3-wk0',0)||WK0;}
function fest(){var d=dkey();for(var i=0;i<FESTS.length;i++){var F=FESTS[i];if(d>=F[1]&&d<=F[2]){
var t0=Date.UTC(Math.floor(F[1]/1e4),Math.floor(F[1]/100)%100-1,F[1]%100)-3*3600e3,t1=Date.UTC(Math.floor(F[2]/1e4),Math.floor(F[2]/100)%100-1,F[2]%100)-3*3600e3+864e5,
f=Math.max(0,Math.min(1,(now()-t0)/(t1-t0)));return{id:F[0],st:Math.floor(F[3]*F[4]*f)+mine().wd,goal:F[3],left:Math.round((t1-now())/1000)};}}return null;}
var SIM=Z.srv._sim;var A={
house:function(){var wk=wkey(),m=mine(),me=lsG('z3-me',null)||{h:0,e:1+hsh(lsG('z3-devu','')||'z')%4,code:''},
en=[{n:'',t:'',pt:m.st,a:1,ask:0,me:1}].concat(bots(wk,me.h,me.e,ENS-1)),act=0;en.forEach(function(x){act+=x.a;});
var o={d:dkey(),wk:wk,h:me.h,e:me.e,en:en,pct:Math.round(100*act/en.length),gift:{fr:0,frn:[],gv:0},code:me.code||''};
if(msk().getUTCDay()%6===0){o.ep=[1,2,3,4].map(function(e){var s=0;(e===me.e?en:bots(wk,me.h,e,ENS)).forEach(function(x){s+=x.pt;});return s;});}
return o;},
build:function(){var wk=wkey(),f=wfrac(),goal=Math.max(1000,Math.round(EB*180/100)*100),st=Math.floor(EB*180*f)+mine().st,f6=1-6/168,i=wkidx(wk0(),wk),dn=[];
if(f>f6&&st<goal)st+=Math.floor((goal-st)*(f-f6)/(1-f6));for(var k=0;k<Math.max(0,Math.min(i,26));k++)dn.push(k);
return{wk:wk,wk0:wk0(),i:i,st:st,hum:mine().st,goal:goal,my:mine().st,left:Math.round((wstart()+7*864e5-now())/1000),done:dn,fest:fest()};},
rid:function(){var d=dkey(),r=rng(d>>>0),p=BRID.slice(),i,j,x,out=[];for(i=p.length-1;i>0;i--){j=Math.floor(r()*(i+1));x=p[i];p[i]=p[j];p[j]=x;}
for(i=0;i<10;i++)out.push({id:'b-'+d+'-'+i,w:p[i][0],p:p[i][1],by:p[i][2],b:1,n:20+Math.floor(r()*180)});
var mn=lsG('z3-rid',[]).filter(function(e){return e.d>=dkey(now()-3*864e5);});return{d:d,list:out,mine:mn};},
vote:function(q){var f=String(q.f||''),r=rng(hsh(f)),a=[20+r()*40,20+r()*40,10+r()*30],k=Math.round(30+60*wfrac()),s=a[0]+a[1]+a[2],
n=a.map(function(x){return Math.round(x/s*k);}),my=lsG('z3-vt',{})[f];if(my!=null&&my>=0&&my<4)n[my]=(n[my]||0)+1;
return{f:f,n:n,my:my==null?-1:my,all:n.reduce(function(x,y){return x+y;},0)};},
mail:function(){var L=lsG('z3-lt',[]),t=now(),nm,out=[];
L.forEach(function(x){var ok=!Z.srv.mailNet()&&x.at<=t;nm=x.nm||'внучек';out.push({id:x.id,at:x.at,t:x.t,r:ok?(function(c){return(!x.nm&&c.indexOf('{nm}')===0?'Внучек'+c.slice(4):c).replace(/\{nm\}/g,nm);})(LT_CAN[hsh(x.id)%LT_CAN.length]):'',ai:0,wait:ok?0:1});});
return{list:out.reverse(),left:L.filter(function(x){return x.d===dkey();}).length?0:1};},
fr:function(){return{in:[]};},
pero:function(q){return{m:+q.m||Math.floor(dkey()/100),top:[],win:null};},
jk:function(){return{gold:[],n:0};},
wd:function(){return{d:dkey(),all:0,win:0,n:[0,0,0,0,0,0,0],my:-1};},
code:function(){return{code:''};},
forget:function(){try{['z3-q','z3-tok','z3-me','z3-lt','z3-rid','z3-vt','z3-my'].forEach(function(k){localStorage.removeItem(k);});}catch(e){}H.clr();return{ok:net()?0:1};}
};
for(var k in A)SIM[k]=A[k];
Z.srv._okFriends=function(){
if(!(typeof OK!=='undefined'&&OK)||typeof vkSend!=='function')return Promise.resolve({ids:[],in:[]});
var app=+((/[?&]vk_app_id=(\d+)/.exec(location.search)||[])[1]||0);
return vkSend('VKWebAppGetAuthToken',{app_id:app,scope:'',append_local:true},20000).then(function(t){var tk=t&&(t.local_access_token||t.access_token);if(!tk)return null;
return vkSend('VKWebAppCallAPIMethod',{method:'friends.getAppUsers',use_local:true,params:{access_token:tk}},15000);}).then(function(r){
var x=r&&(r.response||r),ids=(x&&(x.uids||x.ids||x))||[];if(!(ids instanceof Array))ids=[];ids=ids.map(String).filter(function(i){return/^\d{1,24}$/.test(i);}).slice(0,50);
if(!ids.length)return{ids:[],in:[]};
return Z.srv.get('fr',{ids:ids}).then(function(d){return{ids:ids,in:d&&d.in||[]};});},function(){return{ids:[],in:[]};});};
Z.srv._z3chk=function(u){try{fetch(u,{method:'POST',body:'{"z3":1}'}).then(function(r){return r.json();}).then(function(j){if(j&&j.ok===1&&(j.z3off===0||j.z3off===1))H.lsS('z3-off',j.z3off);},function(){});}catch(e){}};
})();
