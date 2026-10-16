/* bb2 LOVA: объявления ловкостных; «Дар в поход» — js/bb2-lov-dar.js. Журнал: bogatyr-boost2/logs/LOVA.md */
(function(){var K='js/bb2-lov-kit.js',J='js/bb2-lov-';
ZREC.add('uvern',{f:[K,J+'rist.js',J+'uvern.js'],n:['Увернись!','Dodge!'],a:['Води пальцем — уходи от нечисти. Задели — конец','Drag to run from the monsters. One touch and it’s over'],icon:'p_boots',u:['секунда','секунды','секунд'],ue:['second','seconds'],mid:15,md:[10,20,35]}); // i18n:ru
ZREC.add('dub',{f:[K,J+'dub.js'],n:['Дуб Соловья','Nightingale’s Oak'],a:['Жми слева или справа — руби. Сук над головой — перейди','Tap left or right to chop. Branch overhead — switch sides'],icon:'zb_dub',u:['полено','полена','поленьев'],ue:['log','logs'],mid:30,md:[15,40,110]}); // i18n:ru
ZREC.add('palica',{f:[K,J+'palica.js'],n:['Палица за три леса','Mace Over Three Forests'],a:['Держи — раскрути, отпусти. Второе нажатие ловит угол. Три броска','Hold to spin, release. Second tap sets the angle. Three throws'],icon:'i_mace',u:['верста','версты','вёрст'],ue:['verst','versts'],mid:170,md:[130,200,255],max:330}); // i18n:ru
ZREC.add('ivpech',{f:[K,J+'ivpech.js'],n:['Печь Ивана','Ivan’s Stove'],a:['Веди печь пальцем и поставь к терему. Гусей не дави!','Steer the stove and park it by the tower. Mind the geese!'],icon:'m_oven',u:['двор','двора','дворов'],ue:['yard','yards'],mid:6,md:[4,8,12]}); // i18n:ru
ZREC.add('plecho',{f:[K,J+'plecho.js'],n:['Раззудись, плечо','Swing Away'],a:['Проведи пальцем — разруби. Курицу и мёд не трогай','Swipe to slice. Don’t touch the hen or the honey'],icon:'i_sword',u:['удар','удара','ударов'],ue:['hit','hits'],mid:8,md:[5,12,30]}); // i18n:ru
BB2.lazy('lovdar',['js/bb2-lov-dar.js'],function(){return !!window.LOVDAR;});
BB2.hook('zab',function(e){if(e.lov)BB2.need('lovdar').then(function(){LOVDAR.zab(e);},function(){});});
BB2.hook('ready',function(){if((BB2.s('um')||{}).g)BB2.bg('lovdar');});
})();
