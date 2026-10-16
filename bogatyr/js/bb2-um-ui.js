/* ===== bb2-um-ui.js — УМЕНИЯ: выбор перед походом и настройки (поток UM; догружается набором 'um' после bb2-um-run.js) =====
   Строка из трёх кружков в карточке выбранной главы (крючок chInfo) → окно «Умения»: гнёзда, список с откатом и одной строкой описания,
   закрытые — силуэтом с подписью «откуда», ступени за золото. Настройки: «Сами»/«Руками», под левую руку, «Под палец» (флаг UM_PALEC). */
(function(){
  var U=BB2.um;if(!U||U.ui)return;
  var UP=[600,1500,3500,8000,16000]; /* числа — в договоре bb2-eco.js (um.*); здесь запасные: цена ступеней общих умений (золото): BB2.n('um.up',…); +15 % силы и −4 % отката за ступень — um.lvPow, um.lvCd */
  function cost(l){var a=BB2.n('um.up',UP);return a[l]==null?0:a[l];}
  function troC(l){var a=BB2.n('um.upTro',[0,0,2,4,8]),n=a[l]|0,id;if(!(n>0)||typeof TRO_SPEND!=='function'||typeof TRO_N!=='function'||typeof troTopId!=='function')return null;id=troTopId();return id?{id:id,n:n}:null;} /* MERGE: ECO v4 um.upTro + upTroOf 'top' — трофеи самой дальней пройденной земли */
  function troTx(t){var nm=t.id;try{nm=troName(t.id);}catch(e){}return t.n+' × '+nm;}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function css(){if(document.getElementById('umCss'))return;var s=document.createElement('style');s.id='umCss';
    s.textContent='.umrow{display:flex;align-items:center;gap:8px;margin-top:6px}.umrow>b{font-size:13px;flex:1;text-align:left;line-height:1.2}.umrow>b small{display:block;font-weight:600;opacity:.75;font-size:12px}'+
      '.umb{width:44px;height:44px;border-radius:50%;padding:0;border:2px solid #c9a45a;background:#2a2238;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;flex:none;font-size:16px;color:#fff}'+
      '.umb img{width:34px;height:34px;border-radius:50%;pointer-events:none}.umb.hero{border-color:#ffd84a}.umb.lock{opacity:.55;border-style:dashed}.umb.sel{box-shadow:0 0 0 3px #ffd84a}'+
      '.umb.big{width:56px;height:56px}.umb.big img{width:44px;height:44px}.umsl{display:flex;justify-content:center;gap:14px;margin:8px 0 2px}.umsl div{text-align:center;font-size:12px;font-weight:700;width:92px;line-height:1.2}.umsl .umb{margin:0 auto 4px}'+
      '.umi{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;padding:8px;border-radius:12px;margin-top:6px;border:2px solid rgba(120,90,50,.35);text-align:left}.umi.on{border-color:#c2410c}.umi img{width:44px;height:44px;flex:none}'+
      '.umi.lock img{-webkit-filter:brightness(0);filter:brightness(0);opacity:.45}.umi .t{flex:1;min-width:0}.umi .t b{display:block;font-size:14.5px}.umi .t span{display:block;font-size:12.5px;line-height:1.3;opacity:.85}'+
      '.umi .t i{font-style:normal;font-size:12px;font-weight:700;opacity:.8}.umi .bt{display:flex;gap:8px;flex:1 1 100%;justify-content:flex-end}.umi .bt:empty{display:none}.umi .bt button{min-height:40px;padding:4px 12px;font-size:13.5px;margin:0}'+
      '.umpip{letter-spacing:2px;font-size:11px}.umset button{width:100%;margin-top:8px}';
    document.head.appendChild(s);}
  function img(k,px){return typeof iconURL==='function'&&k?iconURL(k,px||96):'';}
  function nm(id){var d=U.def(id);return d?U.tx(d.name):'';}
  function heroIcon(){return 'hp_'+(typeof skinKey==='function'?skinKey(S.hero):S.hero);}
  function lockTxt(i){return i===1?L('Второе гнездо откроется после главы '+BB2.n('um.slot2',3),'The second slot opens after Chapter '+BB2.n('um.slot2',3)):L('Третье гнездо откроется после главы '+BB2.n('um.slot3',9),'The third slot opens after Chapter '+BB2.n('um.slot3',9));}
  function slotBtn(i,id,big,sel){var n=U.nSlots(),c='umb'+(big?' big':'')+(i===0?' hero':'')+(sel?' sel':'');
    if(i>0&&i+1>n)return '<button class="'+c+' lock" data-um="'+i+'" aria-label="'+esc(lockTxt(i))+'">🔒</button>';
    var k=i===0?heroIcon():(U.def(id)||{}).icon;
    return '<button class="'+c+'" data-um="'+i+'" aria-label="'+esc(i===0?heroDef(S.hero).dar.name:nm(id))+'">'+(k?'<img src="'+img(k,96)+'" alt="">':'＋')+'</button>';}

  /* ---------- строка в карточке главы ---------- */
  var UI={};
  UI.ch=function(sel,elSel,elInfo){if(!U.on()||!elSel)return;css();var s=U.slots(),old=document.getElementById('umRow'),d=document.createElement('div'),n=U.nSlots();
    if(old&&old.parentNode)old.parentNode.removeChild(old);
    d.id='umRow';d.className='umrow';
    d.innerHTML='<b>'+L('Умения','Skills')+'<small>'+(n<2?L('ещё одно — после главы '+BB2.n('um.slot2',3),'one more after Chapter '+BB2.n('um.slot2',3)):U.mode()===1?L('срабатывают сами','trigger by themselves'):L('жмёшь сам','you trigger them'))+'</small></b>'+slotBtn(0,s[0])+slotBtn(1,s[1])+slotBtn(2,s[2]);
    elSel.appendChild(d);
    d.onclick=function(e){e.stopPropagation();var b=e.target.closest&&e.target.closest('[data-um]');SND.click();UI.open(b?+b.getAttribute('data-um'):1);};
    if(!UI.seen){UI.seen=1;BB2.stat('um_row',{n:n});}};

  /* ---------- окно «Умения» ---------- */
  UI.open=function(cur){css();var n=U.nSlots();if(!(cur>=1&&cur<=2)||cur+1>n)cur=n>=2?1:0;UI.cur=cur;render();BB2.stat('um_win',{n:n});};
  function row(id,s){var d=U.def(id),op=U.isOpen(id),lv=U.lv(id),at=s.indexOf(id),cd=d.cd*BB2.n('um.cdK',1.25),c=cost(lv),h=''; /* показываем настоящий откат (с общим множителем) */
    if(!op)return '<div class="umi lock"><img src="'+img(d.icon,96)+'" alt=""><div class="t"><b>'+esc(U.tx(d.name))+'</b><span>🔒 '+esc(U.tx(d.from)||L('ещё не открыто','not unlocked yet'))+'</span></div></div>';
    if(!d.hero){cd=cd*(1-BB2.n('um.lvCd',.04)*lv);h='<i><span class="umpip">'+'●●●●●'.slice(0,lv)+'○○○○○'.slice(0,5-lv)+'</span></i>';}
    return '<div class="umi'+(at>0?' on':'')+'"><img src="'+img(d.icon,96)+'" alt=""><div class="t"><b>'+esc(U.tx(d.name))+'</b><span>'+esc(U.tx(d.desc))+'</span><i>⏳ '+L('откат ','cooldown ')+(typeof dec==='function'?dec(Math.round(cd*10)/10,Math.round(cd*10)%10?1:0):Math.round(cd*10)/10)+L(' с',' s')+'</i> '+h+'</div>'+
      '<div class="bt">'+(at>0?'<span class="tag ok" style="padding:6px 8px;text-align:center">✓ '+L('гнездо ','slot ')+(at+1)+'</span>':UI.cur?'<button class="btn" data-take="'+id+'">'+L('Взять','Equip')+'</button>':'')+
      (!d.hero&&lv<5&&c?(function(){var t=troC(lv),lack=S.gold<c||t&&TRO_N(t.id)<t.n;return '<button class="btn ghost" data-up="'+id+'"'+(lack?' style="opacity:.6"':'')+'>'+L('Усилить · ','Upgrade · ')+fmtNum(c)+' 🪙'+(t?' + '+esc(troTx(t)):'')+'</button>';})():'')+'</div></div>';}
  function setHTML(){var o=U.sv(),m=U.mode();
    return '<div class="umset"><button class="btn ghost" id="umMode">'+(m===1?L('🤲 Умения: срабатывают сами (слабее на 20 %)','🤲 Skills: trigger by themselves (20% weaker)'):L('👆 Умения: нажимаю сам (в полную силу)','👆 Skills: I trigger them (full power)'))+'</button>'+
      '<button class="btn ghost" id="umLeft">'+(o.l?L('✋ Кнопки под левую руку: вкл','✋ Left-handed buttons: on'):L('✋ Кнопки под левую руку: выкл','✋ Left-handed buttons: off'))+'</button>'+
      (BB2.on('UM_PALEC')?'<button class="btn ghost" id="umPal">'+(o.p?L('☝️ Кнопки «под палец»: вкл','☝️ Buttons under your finger: on'):L('☝️ Кнопки «под палец»: выкл','☝️ Buttons under your finger: off'))+'</button><p class="sub" style="margin:6px 2px 0;text-align:left">'+L('Отпустил палец — время замедляется, и готовые умения всплывают рядом. Тянуться в угол не надо.','Lift your finger — time slows and ready skills pop up right there. No reaching for the corner.')+'</p>':'')+'</div>';}
  function setBind(re){var o,b=document.getElementById('umMode');if(b)b.onclick=function(){SND.click();U.w('m',U.mode()===1?2:1);BB2.stat('um_mode',{m:U.sv().m});re();};
    b=document.getElementById('umLeft');if(b)b.onclick=function(){SND.click();o=U.sv();U.w('l',o.l?0:1);re();};
    b=document.getElementById('umPal');if(b)b.onclick=function(){SND.click();o=U.sv();U.w('p',o.p?0:1);BB2.stat('um_pal',{p:U.sv().p|0});re();};}
  function render(){var s=U.slots(),n=U.nSlots(),ids=U.ids.slice(),hs=U.hs[S.hero]||[],i,h,dar=heroDef(S.hero).dar,md=(U.hs[S.hero]||{}).main;
    for(i=0;i<hs.length;i++)ids.unshift(hs[i].id);
    ids.sort(function(a,b){return (U.isOpen(b)?1:0)-(U.isOpen(a)?1:0);});
    h='<h3>'+L('Умения','Skills')+'</h3><p class="sub" style="margin-bottom:0">'+L('Именное — своё у каждого богатыря. Два общих выбираешь ты.','Each hero has a signature skill. You pick the two common ones.')+'</p><div class="umsl">';
    for(i=0;i<3;i++)h+='<div>'+slotBtn(i,s[i],1,i===UI.cur&&i>0)+(i===0?esc(md?U.tx(md.name):dar.name):i+1>n?'🔒':esc(nm(s[i])||L('пусто','empty')))+'</div>';
    h+='</div>';
    if(n<2)h+='<p class="sub">'+esc(lockTxt(1))+L(' — в подарок «Конь богатырский».',' — with the Bogatyr’s Steed as a gift.')+'</p>';
    else if(n<3)h+='<p class="sub">'+esc(lockTxt(2))+'.</p>';
    for(i=0;i<ids.length;i++)h+=row(ids[i],s);
    h+=setHTML()+'<div class="btns"><button class="btn big" id="umOk">'+L('Готово','Done')+'</button></div>';
    showModal(h,'um');var m=document.getElementById('mBody');
    m.onclick=function(e){var t=e.target.closest&&e.target.closest('[data-take],[data-up],[data-um]');if(!t)return;var id;
      if((id=t.getAttribute('data-take'))){SND.click();U.set(UI.cur,id);render();return;}
      if((id=t.getAttribute('data-up'))){var o=U.sv(),lv=U.lv(id),c=cost(lv);if(lv>=5||!c)return;if(S.gold<c){toast(L('Не хватает золота: нужно ','Not enough gold: need ')+fmtNum(c));SND.click();return;}
        var tc=troC(lv);if(tc&&TRO_N(tc.id)<tc.n){toast(L('Не хватает трофеев: нужно ','Not enough trophies: need ')+troTx(tc));SND.click();return;}if(tc&&!TRO_SPEND((function(){var q={};q[tc.id]=tc.n;return q;})()))return;
        S.gold-=c;(o.lv||(o.lv={}))[id]=lv+1;try{STAT.ev('spend',{k:'um',c:c});}catch(x){}BB2.stat('um_up',{u:id,l:lv+1});save();if(typeof setGold==='function')setGold();SND.coin();render();return;}
      id=+t.getAttribute('data-um');SND.click();if(id>0&&id+1>n){toast(lockTxt(id));return;}if(id>0){UI.cur=id;render();}};
    setBind(render);
    var ok=document.getElementById('umOk');if(ok)ok.onclick=function(){SND.click();m.onclick=null;hideModal();if(typeof curTab!=='undefined'&&curTab==='Map'&&typeof renderChInfo==='function')renderChInfo();};}
  /* настройки игры: тот же блок перед кнопками */
  BB2.hook('modal',function(kind,m){if(kind==='um'||!U.on()||!m.querySelector('#calmBtn'))return;css();BB2.put(m,'btns',setHTML(),'umSet');
    setBind(function(){if(typeof openSettings==='function')openSettings();});});
  U.ui=UI;
})();
