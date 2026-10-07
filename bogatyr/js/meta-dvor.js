'use strict';
/* ================= МЕТА: «Меню двора» — сборка всей меты (meta-all, 07.10) =================
   Журнал — ~/Projects/hobby-analytics/release-h/bogatyr-chapters/logs/MERGE-meta-all.md.
   Модули меты (Подворье, Торжок, Слава, Питомцы, Оружие, Терем) кладут в деревню каждый свою карточку — шесть карточек подряд
   на телефоне уводят «Казну» и «Постройки» за второй экран. Здесь: если карточек меты 3 и больше — одна карточка «Двор»
   с плитками (значок, короткое имя, точка «есть дело»); нажатие плитки = кнопка «Открыть» исходной карточки (она прячется, не удаляется).
   «Дела на сегодня»: строк меты 3 и больше — одна строка «Двор» (кто ждёт), по нажатию — деревня, меню двора (ks — ключи свёрнутых строк).
   Значки меты на «Делах на сегодня»: больше 2 — один значок «🏡 двор: N».
   Своих ключей сейва нет. Новичку (S.runs<3) модули ничего не показывают — тогда и здесь пусто. */
const DVOR_CARDS=[['yardCard','Подворье','Homestead'],['troCard','Торжок','Market'],['slCard','Слава','Fame'],['petCard','Питомцы','Pets'],['wpnCard','Оружие','Weapons'],['tmCard','Терем','Terem']];
let dvorC0=-1;
const DVOR_TD={yard:['Подворье','Homestead'],tro:['Торжок','Market'],slava:['Слава','Fame'],pet:['Питомцы','Pets'],wpn:['Оружие','Weapons'],terem:['Терем','Terem']};
function dvorToday(TL){const m=TL.filter(x=>x&&DVOR_TD[x.k]);if(m.length<3)return;const rd=m.filter(x=>x.ready),i=TL.indexOf(m[0]);
  for(const x of m)TL.splice(TL.indexOf(x),1);
  TL.splice(i,0,{k:'dvor',ks:m.map(x=>x.k),ic:typeof ART!=='undefined'&&ART.tm_terem?'tm_terem':m[0].ic,t:L('Двор','Yard'),
    s:rd.length?L('ждут: ','waiting: ')+rd.map(x=>L(DVOR_TD[x.k][0],DVOR_TD[x.k][1])).join(', '):L('всё спокойно','all quiet'),ready:rd.length>0,always:1,b:L('Открыть','Open'),
    fn:()=>{hideModal();openTab('Village');setTimeout(()=>{const c=document.getElementById('dvorCard');if(c)c.scrollIntoView({block:'center',behavior:'smooth'});},50);}});}
function dvorVil(el){if(!el)return;const a=[];for(const [id,ru,en] of DVOR_CARDS){const c=el.querySelector('#'+id);if(c&&c.parentNode===el)a.push([c,ru,en]);}
  if(a.length<3)return;
  const d=document.createElement('div');d.className='card dvor';d.id='dvorCard';
  d.innerHTML='<b class="dvH">'+L('🏡 Двор','🏡 Yard')+'</b><div class="dvGrid">'+a.map(([c,ru,en],i)=>{const im=c.querySelector('img.ic');
    return '<button class="dvT'+(c.classList.contains('next')?' next':'')+'" data-dv="'+i+'">'+(im?'<img src="'+im.src+'" alt="">':'')+'<span>'+L(ru,en)+'</span></button>';}).join('')+'</div>';
  el.insertBefore(d,a[0][0]);for(const [c] of a)c.style.display='none';
  d.querySelectorAll('[data-dv]').forEach(b=>b.onclick=()=>{const c=a[+b.dataset.dv][0],btn=c.querySelector('button');if(btn)btn.click();});}
if(typeof META_MODS!=='undefined'){
  META_MODS.unshift({id:'dvor0',CHIPS(a){dvorC0=a.length;}});
  META_MODS.push({id:'dvor',VIL:dvorVil,TODAY:dvorToday,
    CHIPS(a){if(dvorC0<0||a.length-dvorC0<=2){dvorC0=-1;return;}const n=a.length-dvorC0;a.splice(dvorC0,n,'<i class="hot">🏡 '+L('двор: ','yard: ')+n+'</i>');dvorC0=-1;}});}
