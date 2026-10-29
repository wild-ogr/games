'use strict';
(function(){
var AL=window.Z3ALB;if(!AL||AL.gift)return;
var TB=' абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789.,!?-—–:;«»"\'()…/%+abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
B64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',MAXT=240;
function enc(t){t=String(t||'').replace(/\s+/g,' ').trim().slice(0,MAXT);var b=[],i,o='a';
for(i=0;i<t.length;i++){var k=TB.indexOf(t.charAt(i));b.push(k<0?TB.indexOf('?'):k);}
for(i=0;i<b.length;i+=3){var n=(b[i]<<16)|((b[i+1]||0)<<8)|(b[i+2]||0),m=i+1<b.length?(i+2<b.length?4:3):2;
for(var j=0;j<m;j++)o+=B64.charAt((n>>(18-6*j))&63);}
return o;}
function dec(c){c=String(c||'');if(c.charAt(0)!=='a'||c.length>1+Math.ceil(MAXT*4/3))return'';c=c.slice(1);var b=[],i;
for(i=0;i<c.length;i+=4){var n=0,m=Math.min(4,c.length-i);if(m<2)return'';
for(var j=0;j<4;j++){var k=j<m?B64.indexOf(c.charAt(i+j)):0;if(k<0)return'';n|=k<<(18-6*j);}
b.push((n>>16)&255);if(m>2)b.push((n>>8)&255);if(m>3)b.push(n&255);}
var t='';for(i=0;i<b.length;i++){if(b[i]>=TB.length)return'';t+=TB.charAt(b[i]);}
t=t.replace(/\s+/g,' ').trim();return t.length>=6?t:'';}
function given(){var L=AL.lsG('z3-ajg',[]);return L instanceof Array?L:[];}
function isGiven(c){return!!c&&given().indexOf(c.i)>=0;}
function markGiven(c){var L=given();if(L.indexOf(c.i)<0){L.push(c.i);if(L.length>400)L.splice(0,L.length-400);AL.lsS('z3-ajg',L);}}
function T(k,ctx,d){var s='';try{s=AL.T(k,ctx);}catch(e){}return s||d||'';}
function link(code){var okp=typeof OK!=='undefined'&&OK,app=(/[?&]vk_app_id=(\d+)/.exec(location.search)||[])[1]||'',tag='#jk='+code;
return okp?(typeof OK_LINK!=='undefined'&&OK_LINK?OK_LINK+tag:''):'https://vk.com/app'+app+tag;}
AL.giftCan=function(c){return!!c&&!!c.t&&!isGiven(c)&&(!(typeof OK!=='undefined'&&OK)||(typeof OK_LINK!=='undefined'&&!!OK_LINK));};
AL.isGiven=isGiven;
AL.gift=function(c,btn,out){if(!AL.giftCan(c))return;var code=enc(c.t),u=link(code);if(!u)return;
var txt=T('gift-msg',{},'Баба Зина подарила мне лишнюю карточку шутки. Держи — у меня своя есть.');
AL.ev('gift',{e:'open'});if(btn)btn.disabled=true;
function fin(e){if(e==='send'||e==='dev'){markGiven(c);if(btn){btn.textContent='✓ Подарена';btn.disabled=true;}
if(out)out.textContent=e==='dev'?u:T('gift-ok',{},'Ушла! Своя карточка осталась в альбоме.');}
else{if(btn)btn.disabled=false;if(out)out.textContent=T('gift-no',{},'Не отправилось. Почта сегодня капризная.');}
AL.ev('gift',{e:e});}
if(!(typeof VK_REAL!=='undefined'&&VK_REAL)){fin('dev');return;}
SHR.post(txt,{k:'agift',link:u,cb:function(h){fin(h==='vk'||h==='copy'?'send':'no');}});};
AL.giftIn=function(){var code=AL.lsG('z3-ajin','');if(!code)return null;AL.lsS('z3-ajin','');var t=dec(code);if(!t)return null;
var id='g'+AL.h32(AL.norm(t)),L=AL.cards();for(var i=0;i<L.length;i++)if(L[i].i===id||AL.norm(L[i].t)===AL.norm(t))return{dup:1,t:t};
var c={i:id,t:t,s:'gift',k:Z3.tk()};L.push(c);if(L.length>400)L.splice(0,L.length-400);AL.lsS('z3-aj',L);AL.ev('gift',{e:'in'});return c;};
AL.giftEnc=enc;AL.giftDec=dec;
})();
