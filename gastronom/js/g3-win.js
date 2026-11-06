'use strict';
/* ================= g3-win — окно победы «Касса» из 4 блоков (Гастроном 3.0, волна 1, поток П4; план 3 опора 5, 4.1, 4.5) =================
   Флаг G3.on('win') (?off=g3.win — «Касса» как в v14.9). Нужен новый вид (GB.kassaHtml из js/gb-win.js).
   Как: прежняя GB.kassaHtml(p) строит окно целиком (чек, гнёзда winSlots всех потоков, кнопки) — мы разбираем его и собираем заново:
     1. ЛИЦО: тётя Валя с репликой (.vsay — та же, что была внизу) — сверху, под заголовком.
     2. ЧЕК НА ПАМЯТЬ: чек (2 строки товара + одна смешная строка + ИТОГО + печать), «Довольных N из M», ★, +монеты (#mWon);
        «📺 ×2» (#mX2) — маленькой кнопкой внутри чека, не отдельным блоком.
     3. НОВОСТЬ — ровно одна, по важности: карточка «Дефицит» → строки потоков g3…/nb… (П2/П3: Анна Петровна, gate, фикус…) →
        новый разряд/знамя (seal) → грамота → серия дней (+«Вернуть серию» #mRes) → «открылось задание дня» (+#mDaily) →
        альбом/отдел/Книга → Перерыв (mg) → «Завтра…» (tmr) → прочее extra → строка города «до Ревизии N». Остальное в этот раз не показываем
        (каждый уровень повторяющиеся «+15 к квартальному», «+4 к соцсоревнованию», «Авоська ждёт» — уходят в самый низ очереди).
     4. «Дальше: уровень N» (#mNext) крупно; «В магазин» (#mMap) — ссылкой. «Обставить зал» (#mShop) в окне больше нет (есть Магазин).
   id кнопок прежние (mNext mX2 mRes mLb mDaily mMap mWon mStreak ncv vsCv) — обработчики в win() те же; STAT и стенды рекламы живы.
   STAT: mod g3.win {a:'on'} раз за сеанс; {a:'news', k:<что показали>} — каждый раз. */
/* G3-П4 (по просьбе П3): «задание дня» → «Витрина дня» (значок 🥫) в текстах окон — G3.vt(s); только при G3.on('vitr'). QUEST «Задания дня» (с большой, мн. ч.) не трогаем. */
if(window.G3&&!G3.vt)G3.vt=function(s){s=String(s==null?'':s);if(!G3.on('vitr'))return s;
  return s.replace(/новое задание дня/g,'новая Витрина дня').replace(/Новое задание дня/g,'Новая Витрина дня').replace(/Открылось задание дня/g,'Открылась Витрина дня')
    .replace(/Задание дня выполнено/g,'Витрина дня собрана').replace(/заданию дня/g,'Витрине дня').replace(/задания дня/g,'Витрины дня').replace(/задании дня/g,'Витрине дня')
    .replace(/задание дня/g,'Витрина дня').replace(/Задание дня/g,'Витрина дня').replace(/📅(\s*)(Витрин|К Витрин|Открылась Витрин)/g,'🥫$1$2');};
(function(){
  if(!window.G3||!window.GB||!GB.viewOn||!G3.on('win')||typeof GB.kassaHtml!=='function')return;
  var K0=GB.kassaHtml;
  function Lx(ru,en){return typeof L==='function'?L(ru,en):ru;}
  var FUN=[['Сдачи не надо — проверено','No change needed — checked'],['Кассир: тётя Валя. Улыбка — бесплатно','Cashier: Aunt Valya. Smiles are free'],
    ['Обвеса нет. Весы честные','No short weight. Honest scales'],['Чек сохраняйте до выхода из магазина','Keep the receipt until you leave the store'],
    ['Спасибо за покупку! Приходите ещё','Thank you! Come again'],['Очередь довольна — план идёт','The queue is happy — the plan is on track'],
    ['Гречка — по талонам, хорошее настроение — без','Buckwheat on coupons, good mood without'],['Без сдачи — без обиды','No change — no hard feelings']];
  function fun(){var x=FUN[Math.floor(Math.random()*FUN.length)];return Lx(x[0],x[1]);}
  function q(r,s){return r.querySelector(s);}
  function take(r,s){var e=q(r,s);if(e&&e.parentNode)e.parentNode.removeChild(e);return e;}
  function oh(e){return e?e.outerHTML:'';}
  /* новость: [ключ, селектор] по важности */
  var NEWS=[['g3','.gbs[data-gb^="g3"],.gbs[data-gb="nbgift"],.gbs[data-gb="nbcity"],.gbs[data-gb="nbrev"]'],['card','.newcard'],['seal','.gbw-seal>.gbs'],['chest','.chest:not(.g3-dopen)'],['streak','#mStreak'],
    ['dopen','.chest.g3-dopen'],['news','.gbs[data-gb="mt-album"],.gbs[data-gb="mt-depnews"],.gbs[data-gb="mt-book"]'],['goal','.gbw-goal>.gbs'],['mg','.gbw-mg>.gbs'],
    ['tmr','.gbw-tmr>.gbs,.vw-tmr'],['extra','.gbw-extra>.gbs:not([data-gb="league"]):not([data-gb="season"])'],['city','.vw-city-g'],['extra2','.gbw-extra>.gbs']];
  GB.kassaHtml=function(p){var h0=K0.apply(this,arguments),out=null;
    GB.safe('g3:win',function(){var r=document.createElement('div');r.innerHTML=h0;var k=q(r,'#gbWin');if(!k)return;
      // «открылось задание дня» — тоже .chest; помечаем, чтобы отличать от грамоты
      if(p.dOpen){var cs=r.querySelectorAll('.chest');if(cs.length)cs[cs.length-1].classList.add('g3-dopen');}
      var head=take(k,'.vw-khead'),face=take(k,'.vsay'),rc=take(k,'.vw-rcpt'),kl=take(k,'.vw-kline'),chk=take(k,'.gbw-check');
      var bt={};['mNext','mX2','mRes','mLb','mDaily','mShop','mMap'].forEach(function(id){bt[id]=take(k,'#'+id);});
      // чек: 2 строки товара (остальное — «…ещё»), смешная строка перед ИТОГО
      if(rc){var ln=rc.querySelectorAll('.vw-ln:not(.vw-tot)');for(var i=2;i<ln.length;i++)ln[i].parentNode.removeChild(ln[i]);
        var tot=q(rc,'.vw-tot');if(tot){var f=document.createElement('div');f.className='vw-ln g3w-fun';f.setAttribute('data-fit','1');f.textContent='* '+fun()+' *';tot.parentNode.insertBefore(f,tot);}}
      var news='',nk='';for(var j=0;j<NEWS.length&&!news;j++){var e=q(k,NEWS[j][1]);
        if(e&&e.textContent.replace(/\s+/g,'')!==''||e&&e.querySelector('canvas,button')){news=oh(e);nk=NEWS[j][0];}}
      if(nk==='streak'&&bt.mRes)news+=oh(bt.mRes);
      if(nk==='dopen'&&bt.mDaily)news+=oh(bt.mDaily);
      if(nk==='card'||nk==='seal'||nk==='g3')G3.mark('win','news',{k:nk});
      var cls=k.className.replace(/\bvw-kassa\b/,'').trim();
      var x='<div class="vw-kassa g3-win '+cls+'" id="gbWin">'+oh(head)+
        (face?'<div class="g3w-face">'+oh(face).replace('data-fit="1"','data-fit="4"')+'</div>':'')+
        '<div class="g3w-chek">'+oh(rc)+oh(chk)+oh(kl)+(bt.mX2?'<div class="g3w-x2">'+oh(bt.mX2)+'</div>':'')+'</div>'+
        (news?'<div class="g3w-news" data-k="'+nk+'">'+news+'</div>':'')+
        '<div class="row vw-krow g3w-go">'+oh(bt.mNext)+oh(bt.mLb)+(p.daily?oh(bt.mMap):'')+'</div>'+(p.daily?'':oh(bt.mMap))+'</div>';
      // «Дальше: уровень N»
      out=x.replace(/(id="mNext">)[^<]*/,function(a,b){var f2=GB.lvInfo(p.i);return b+(p.cityDone?Lx('Дальше: ','Next: ')+f2.next:Lx('Дальше: уровень ','Next: level ')+(p.i+2));});
      G3.mark('win');});
    return G3.vt(out||h0);};
})();
