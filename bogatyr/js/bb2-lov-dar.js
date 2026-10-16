/* bb2-lov-dar.js — «Дар в поход» (поток LOVA, догружается набором 'lovdar': после партии в ловкостную и при входе, если гостинец уже лежит).
   Партия на медаль (бронза+) → одноразовая кнопка-гостинец в следующем походе главы (договор UM 75c525f: BB2.um.gift — только внутри BB2.after('um',fn)). Флаг lovdar.
   Один дар на поход; в сече и «Испытании недели» и при старой силе забав (S.zabBuf) дар не действует — ждёт следующего похода главы (числа lov.darRun/darOff договора ECO).
   Своего сохранения нет: гостинец хранит UM (S.bb2.um.g); на время «чужого» похода он прячется в переменную и возвращается на end.
   Подвиги EVENT: BB2.pdv('lov') — партия в ловкостную, BB2.pdv('lov.rec') — рекорд. STAT: lov_dar {a:get|use, id, u, t}. */
var LOVDAR=(function(){
var D={uvern:'ryvok',dub:'perebros',palica:'zamah',ivpech:'shit',plecho:'zamah'},hold='',U=BB2.um,X={map:D};
function on(){return !!U&&U.on()&&BB2.on('lovdar');}
function sv(){return BB2.s('um')||{};}
X.zab=function(e){if(BB2.pdv&&!e.train){BB2.pdv('lov');if(e.rec)BB2.pdv('lov.rec');}
  var d=D[e.id];if(!d||e.train||!(e.tier>0)||!on())return;
  BB2.after('um',function(){if(!U.gift||!U.gift(d))return;BB2.stat('lov_dar',{a:'get',id:e.id,u:d});
    var p=document.querySelector('#zabHost .zrP .btns'),rw=document.querySelector('#zabHost .zrP .zabRw'),g=U.gf&&U.gf[d],old=document.getElementById('lovDar');if(old)old.remove();if(!g)return;
    var tt=L('Одноразовая кнопка в следующем походе главы','One-use button in your next chapter run'),im='<img src="'+ic(g.icon,48)+'" alt="">',nm=L('Дар «','Gift “')+U.tx(g.name)+L('»','”');
    if(rw){rw.style.flexWrap='nowrap';rw.style.gap='4px';[].forEach.call(rw.children,function(x){x.style.whiteSpace='nowrap';});}if(rw)rw.insertAdjacentHTML('beforeend','<div id="lovDar" class="buf" title="'+tt+'" style="font-size:13px;padding:3px 8px 3px 3px;gap:3px;white-space:nowrap">'+im.replace('alt','style="width:22px;height:22px" alt')+nm+'</div>');
    else if(p)p.insertAdjacentHTML('beforebegin','<p class="sub" id="lovDar" title="'+tt+'" style="text-align:center;margin:2px 0;font-size:13px;line-height:20px;white-space:nowrap">'+im.replace('alt','width="20" height="20" style="vertical-align:middle" alt')+' '+L('Дар в поход: «','Road gift: “')+U.tx(g.name)+L('»','”')+'</p>');});};
if(U){BB2.after('um',function(){if(U.giftReg)U.giftReg('perebros',{name:function(){return L('Переброс','Reroll');},icon:'p_cloth',use:function(g){g.rerolls=(g.rerolls||0)+1;banner(L('Переброс!','Reroll!'),L('+1 замена улучшений','+1 upgrade reroll'),2);SND.level();}});});
  BB2.hook('run',function(g){hold='';var o=sv(),b=0;try{b=zabBuf();}catch(e){}if(o.g&&(g.endless||g.weekly||b||!BB2.on('lovdar'))){hold=o.g;delete o.g;}},1);
  BB2.hook('end',function(){if(hold){var o=sv();if(!o.g)o.g=hold;hold='';if(typeof save==='function')save();}},1);
  BB2.hook('um',function(id,x){if(x&&x.gift)BB2.stat('lov_dar',{a:'use',u:id,t:x.t});});}
return X;})();
