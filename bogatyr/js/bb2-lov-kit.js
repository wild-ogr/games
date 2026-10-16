/* bb2-lov-kit.js — общее для ловкостных потока LOVA (догружается перед игрой). Наружу — только LOVK.
   LOVK.cont(host,o,sc,fn) — «продолжить с того же места за рекламу»: раз за партию, только когда счёт уже стоящий (≥ бронзы и ≥ 70 % рекорда); fn(true) — продолжаем.
   LOVK.finger(g,x,y,down) — нарисованный палец (показ «игра играет сама»); LOVK.tag(g,W,y,текст) — плашка; LOVK.say(g,…) — реплика-облачко;
   LOVK.ptr(c,host,{down,move,up}) — палец/мышь в CSS-пикселях холста; LOVK.bg(c,fn) — фон один раз в готовую картинку (перерисовка при смене размера). */
var LOVK=(function(){
  var K={};
  K.snd=function(k){try{SND[k]();}catch(e){}};
  K.vib=function(ms){try{if(typeof vib==='function')vib(ms);}catch(e){}};
  K.rr=function(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();};
  K.clamp=function(v,a,b){return v<a?a:v>b?b:v;};
  K.lerp=function(a,b,t){return a+(b-a)*t;};
  K.top=function(){return (window.__safeTop||0);};
  /* ---------- продолжить за рекламу ---------- */
  K.cont=function(host,o,sc,fn){var c=ZREC.info(host.id)||{},md=c.md||[0],ok=false,cur=typeof ZAB!=='undefined'&&ZAB.cur;
    try{ok=!host._lovC&&!!BB2.n('lov.adCont',1)&&host.adOk()&&sc>=md[0]&&sc>=(o.best|0)*.7&&!(cur&&cur.opt&&cur.opt.quiet);}catch(e){}
    if(!ok){fn(false);return;}host._lovC=1;host.hold=true;host.offer();
    var v=document.createElement('div'),gone=0;v.className='zabVeil';
    v.innerHTML='<div class="panel"><h3>'+L('Ещё чуть-чуть?','A little more?')+'</h3><p class="sub" style="text-align:center;font-size:17px">'+L('Сейчас: ','Now: ')+'<b>'+o.unit(sc)+'</b>. '+L('Продолжить с того же места — один раз за партию.','Continue from the same spot — once per game.')+'</p>'+
      '<div class="btns"><button class="btn ad big" data-k="ad">'+L('▶ Продолжить за рекламу','▶ Continue for an ad')+'</button><button class="btn ghost" data-k="no">'+L('Закончить','Finish')+'</button></div></div>';
    host.root.appendChild(v);
    function end(r){if(gone)return;gone=1;v.remove();host.hold=false;BB2.stat('lov_cont',{id:host.id,a:r?'ok':'no',sc:sc});fn(r);}
    v.querySelector('[data-k=no]').onclick=function(){K.snd('click');end(false);};
    v.querySelector('[data-k=ad]').onclick=function(){K.snd('click');host.ad('cont').then(function(r){end(!!r);},function(){end(false);});};};
  /* ---------- палец / мышь ---------- */
  K.ptr=function(c,host,h){var id=-1;
    function xy(e){var r=c.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];}
    function blocked(){return host.paused||!!host.root.querySelector('.zabVeil');}
    function dn(e){if(blocked())return;id=e.pointerId;try{c.setPointerCapture(id);}catch(x){}var p=xy(e);if(h.down)h.down(p[0],p[1],e);e.preventDefault();}
    function mv(e){if(e.pointerId!==id&&id!==-1)return;if(blocked())return;var p=xy(e);if(h.move)h.move(p[0],p[1],id!==-1,e);}
    function up(e){if(e.pointerId!==id)return;id=-1;var p=xy(e);if(h.up)h.up(p[0],p[1],e);}
    c.addEventListener('pointerdown',dn);c.addEventListener('pointermove',mv);c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
    host.onQuit(function(){c.removeEventListener('pointerdown',dn);c.removeEventListener('pointermove',mv);c.removeEventListener('pointerup',up);c.removeEventListener('pointercancel',up);});
    return {held:function(){return id!==-1;},drop:function(){id=-1;}};};
  /* ---------- фон готовой картинкой ---------- */
  K.bg=function(c,fn){var b=null,w=0,h=0;return function(g){if(!b||w!==c.width||h!==c.height){w=c.width;h=c.height;b=document.createElement('canvas');b.width=w;b.height=h;var q=b.getContext('2d');q.setTransform(c.D,0,0,c.D,0,0);fn(q,c.W,c.H);}
      g.setTransform(1,0,0,1,0,0);g.drawImage(b,0,0);g.setTransform(c.D,0,0,c.D,0,0);};};
  /* ---------- рисунки ---------- */
  K.finger=function(g,x,y,down){g.save();g.translate(x,y);var s=down?.9:1;g.scale(s,s);if(down){g.globalAlpha=.35;g.fillStyle='#fff';g.beginPath();g.arc(0,0,26,0,6.283);g.fill();g.globalAlpha=1;}
    g.rotate(-.35);g.fillStyle='#ffe2c2';g.strokeStyle='#5a3418';g.lineWidth=3;K.rr(g,-11,-4,22,52,11);g.fill();g.stroke();K.rr(g,-14,30,40,34,12);g.fill();g.stroke();
    g.fillStyle='#fff3e6';K.rr(g,-6,1,12,12,5);g.fill();g.restore();};
  K.tag=function(g,W,y,t,col){var px=Math.min(22,W*.055);g.font=ZABK.font(px,900);var w=Math.min(W-24,g.measureText(t).width+28);g.fillStyle=col||'rgba(46,28,14,.82)';K.rr(g,W/2-w/2,y-px*.9,w,px*1.8,px*.6);g.fill();
    ZABK.text(g,t,W/2,y+1,px,{ol:false,mw:w-16});};
  K.say=function(g,t,x,y,W,a){if(a<=0)return;var px=Math.min(17,W*.045);g.save();g.globalAlpha=Math.min(1,a);g.font=ZABK.font(px,800);var lines=ZABK.wrap(g,t,px,Math.min(W*.6,230),800),w=0,i;
    for(i=0;i<lines.length;i++)w=Math.max(w,g.measureText(lines[i]).width);w+=20;var h=lines.length*px*1.25+14;x=K.clamp(x,w/2+6,W-w/2-6);
    g.fillStyle='#fffaf0';g.strokeStyle='#3a2410';g.lineWidth=2.5;K.rr(g,x-w/2,y-h,w,h,10);g.fill();g.stroke();g.beginPath();g.moveTo(x-7,y-1.5);g.lineTo(x,y+9);g.lineTo(x+7,y-1.5);g.fill();g.stroke();g.fillRect(x-6,y-4,12,3.5);
    g.fillStyle='#3a2410';g.textAlign='center';g.textBaseline='middle';for(i=0;i<lines.length;i++)g.fillText(lines[i],x,y-h+7+px*.62+i*px*1.25);g.restore();};
  /* полоса (время/сила): v 0..1 */
  K.bar=function(g,x,y,w,h,v,c1,c2){g.fillStyle='rgba(30,18,8,.6)';K.rr(g,x-2,y-2,w+4,h+4,h/2+2);g.fill();if(v>0){var gr=g.createLinearGradient(x,0,x+w,0);gr.addColorStop(0,c1);gr.addColorStop(1,c2||c1);g.fillStyle=gr;K.rr(g,x,y,Math.max(h,w*Math.min(1,v)),h,h/2);g.fill();}};
  K.pick=function(a,r){return a[Math.floor((r?r():Math.random())*a.length)%a.length];};
  return K;})();
