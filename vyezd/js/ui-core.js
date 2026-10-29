(function(){'use strict';
var W=window;
['homeSlots','navSlots','winSlots','loseSlots','mapSlots','yardHook','saveHook'].forEach(function(n){if(!Array.isArray(W[n]))W[n]=[];});
var scr={},ls={},late={on:false,keys:{},log:[]};
function warn(s,e){try{console.warn('UI slot '+s,e);}catch(_){}}
function list(a,zone,def){var m={},o=[];for(var i=0;i<a.length;i++){var x=a[i];if(!x)continue;if(typeof x==='function')x={render:x,fn:x};var k=x.id||('#'+i);if(m[k]!=null)o[m[k]]=x;else{m[k]=o.length;o.push(x);}}
o=o.filter(function(x){return!zone||(x.zone||def||'')===zone;});
return o.sort(function(a,b){return(a.order!=null?a.order:50)-(b.order!=null?b.order:50);});}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function call(x,f,a,b){try{return f.call(x,a,b);}catch(e){warn(x.id,e);return null;}}
var UI={
list:list,esc:esc,
fill:function(el,arr,ctx,cls,zone,def){if(!el)return 0;var h=[],it=list(arr,zone,def),ok=[];
for(var i=0;i<it.length;i++){var x=it[i],r=x.render?call(x,x.render,ctx):null;
if(r!=null&&r!==''&&r!==false&&typeof r==='string'){ok.push(x);h.push('<div class="'+(cls||'slot')+'" data-slot="'+esc(x.id||'')+'"'+(x.fit?' data-fit="'+(+x.fit)+'"':'')+'>'+r+'</div>');}}
el.innerHTML=h.join('');UI.bind(el);
var kids=el.children;for(var j=0;j<ok.length;j++){var y=ok[j];if(y.mount&&kids[j])call(y,y.mount,kids[j],ctx);}
return ok.length;},
html:function(arr,ctx,zone,def){var h='',it=list(arr,zone,def);for(var i=0;i<it.length;i++){var x=it[i],r=x.render?call(x,x.render,ctx):null;
if(r&&typeof r==='string')h+='<div class="uslot" data-slot="'+esc(x.id||'')+'"'+(x.fit?' data-fit="'+(+x.fit)+'"':'')+'>'+r+'</div>';}return h;},
mountIn:function(root,arr,ctx){if(!root)return;UI.bind(root);var it=list(arr);for(var i=0;i<it.length;i++){var x=it[i];if(!x.mount)continue;
var el=root.querySelector('[data-slot="'+esc(x.id||'')+'"]');if(el)call(x,x.mount,el,ctx);}},
objs:function(arr,ctx,zone,def){var o=[],it=list(arr,zone,def);for(var i=0;i<it.length;i++){var x=it[i],r=x.render?call(x,x.render,ctx):null;if(r&&typeof r==='object'){r.id=r.id||x.id;r.mount=x.mount;o.push(r);}}return o;},
bind:function(el){if(!el)return;var q=el.querySelectorAll('[data-go]');for(var i=0;i<q.length;i++)(function(g){if(!g.onclick)g.onclick=function(){UI.go(g.getAttribute('data-go'));};})(q[i]);},
tile:function(o){o=o||{};var pr=o.prog?'<i class="hsP"><b style="width:'+Math.round(100*Math.min(1,(o.prog[0]||0)/(o.prog[1]||1)))+'%"></b></i>':'';
return'<button class="hsT '+esc(o.cls||'')+'"'+(o.go&&typeof o.go==='string'?' data-go="'+esc(o.go)+'"':'')+'>'+(o.ic?'<span class="hsI">'+o.ic+'</span>':'')+'<span class="hsB"><b>'+esc(o.t||'')+'</b>'+(o.s?'<small>'+esc(o.s)+'</small>':'')+pr+'</span>'+(o.tag?'<em class="hsTag">'+esc(o.tag)+'</em>':'')+'</button>';},
yard:function(info){var a=list(W.yardHook);for(var i=0;i<a.length;i++){var f=a[i].fn||a[i].render||a[i];if(typeof f==='function')call(a[i],f,info);}UI.emit('yard',info);},
onSave:function(o){if(!o)return;W.saveHook.push(o);if(o.fix&&W.VY&&VY.S)call(o,o.fix,VY.S);
if(o.merge&&late.on&&late.log.length&&W.VY&&VY.S)for(var i=0;i<late.log.length;i++)call(o,o.merge,VY.S,JSON.parse(late.log[i][0]),late.log[i][1]);},
saveFix:function(S){var a=list(W.saveHook);for(var i=0;i<a.length;i++)if(a[i].fix)call(a[i],a[i].fix,S);},
owns:function(k){if(late.on&&late.keys[k])return true;var a=list(W.saveHook);for(var i=0;i<a.length;i++){var o=a[i];if(!o||!o.merge)continue;
if(o.keys&&o.keys.indexOf(k)>=0)return true;if(o.prefix){var ps=[].concat(o.prefix);for(var j=0;j<ps.length;j++)if(k.indexOf(ps[j])===0)return true;}
if(typeof o.test==='function'){try{if(o.test(k))return true;}catch(e){}}}return false;},
saveMerge:function(S,d,newer){if(late.on)try{late.log.push([JSON.stringify(d),newer]);if(late.log.length>6)late.log.shift();}catch(e){}var a=list(W.saveHook);for(var i=0;i<a.length;i++)if(a[i].merge)call(a[i],a[i].merge,S,d,newer);},
late:function(keys){late.on=true;for(var i=0;i<(keys||[]).length;i++)late.keys[keys[i]]=1;},
lateEnd:function(ok){if(!late.on)return;var S=W.VY&&VY.S;
if(!ok&&S)for(var i=0;i<late.log.length;i++){var d=JSON.parse(late.log[i][0]),nw=late.log[i][1];for(var k in late.keys)if(d&&d[k]!==undefined&&(!(k in S)||nw))S[k]=d[k];}
late.on=false;late.keys={};late.log=[];},
screen:function(name,fn){scr[name]=fn;},
has:function(name){return!!scr[name];},
cur:'',opts:null,
go:function(name,opts){var f=scr[name];if(!f){warn('go',name);return false;}UI.opts=opts||null;
try{if(f(opts)===false)return false;}catch(e){warn('go '+name,e);return false;}return true;},
refresh:function(){clearTimeout(UI._rt);UI._rt=setTimeout(function(){if(UI.cur==='home'&&UI.homeRender)try{UI.homeRender();}catch(e){warn('refresh',e);}
else if(UI.cur==='map'&&UI.mapRender)try{UI.mapRender();}catch(e){warn('refresh',e);}},30);},
show:function(id){if(W.__show)W.__show(id);},
shown:function(id){var n=String(id||'').replace(/^scr-/,'');if(n&&n!==UI.cur){UI.cur=n;UI.emit('screen',n);}},
on:function(ev,fn){(ls[ev]=ls[ev]||[]).push(fn);},
emit:function(ev,a){var l=ls[ev]||[];for(var i=0;i<l.length;i++)try{l[i](a);}catch(e){warn(ev,e);}}
};
UI.pc=function(){try{return!!(W.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches)&&!('ontouchstart'in W);}catch(e){return false;}};
function pcCls(){document.documentElement.classList.toggle('pc',UI.pc());}pcCls();
try{matchMedia('(pointer:fine)').addEventListener('change',pcCls);}catch(e){}
document.addEventListener('DOMContentLoaded',function(){UI.refresh();});
W.addEventListener('load',function(){UI.refresh();});
W.UI=UI;
})();