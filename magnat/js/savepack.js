/* Упаковка мира для записи (M24, 01.10): без потерь, общая — не по списку полей (новые поля точек и дел упаковываются сами).
   Массив из ≥ 3 простых объектов → {"$n":длина,"$k":{поле:столбец}} (имена полей один раз, а не в каждой строке).
   Столбец: массив значений по строкам; если у всех строк одно значение → {"$s":v}; если поле есть не у всех → {"$m":[номера без поля],"$v":[значения остальных]}
   (или {"$i":[номера с полем],"$v":[…]}, что короче); столбец из целых чисел — разностями {"$d":[первое, +Δ, …]}, если так короче. Метка упакованного мира — "$pk":1 (без неё — старый сейв, отдаём как есть).
   Всё рекурсивно (столбец из объектов сам упаковывается).    PACK.pack(W) — упакованная копия (W не трогает); PACK.unpack(x) — обратно (новый объект); PACK.packSafe(W) — с проверкой обратимости, иначе W как есть.
   Пишет shell.js (localStorage, облако Яндекса и VK, «Перенос сохранения»), читает там же — игра видит только распакованный мир. */
(function(root){
const isO=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const MIN=3;
function same(a,b){if(a===b)return true;if(typeof a!=='object'||typeof b!=='object'||a===null||b===null)return false;return JSON.stringify(a)===JSON.stringify(b);}
// значение для JSON: undefined и функции в объектах выпадают — как у JSON.stringify
const gone=v=>v===undefined||typeof v==='function'||typeof v==='symbol';
function pv(x){
  if(Array.isArray(x)){
    if(x.length>=MIN&&x.every(isO))return soa(x);
    return x.map(v=>gone(v)?null:pv(v));}
  if(isO(x)){if(typeof x.toJSON==='function')return pv(x.toJSON());const o={};for(const k in x)if(Object.prototype.hasOwnProperty.call(x,k)&&!gone(x[k]))o[k]=pv(x[k]);return o;}
  return x;}
function dl(v){if(v.length<MIN||!v.every(Number.isSafeInteger))return v;const d=[v[0]];for(let i=1;i<v.length;i++){const x=v[i]-v[i-1];if(!Number.isSafeInteger(x))return v;d.push(x);}
  const o={$d:d};return JSON.stringify(o).length<JSON.stringify(v).length?o:v;}
function soa(a){const keys=[],seen={};
  for(const r of a)for(const k in r)if(Object.prototype.hasOwnProperty.call(r,k)&&!gone(r[k])&&!seen[k]){seen[k]=1;keys.push(k);}
  const cols={};
  for(const k of keys){const miss=[],vals=[];
    for(let i=0;i<a.length;i++){const r=a[i];if(Object.prototype.hasOwnProperty.call(r,k)&&!gone(r[k]))vals.push(r[k]);else miss.push(i);}
    let c;
    if(vals.length===a.length&&vals.every(v=>same(v,vals[0])))c={$s:pv(vals[0])};
    else{let v=vals.map(pv);if(vals.length>=MIN&&vals.every(isO)){const z=soa(vals);if(JSON.stringify(z).length<JSON.stringify(v).length)v=z;}   // столбец из объектов: упаковываем, только если короче
      if(Array.isArray(v))v=dl(v);   // целые числа подряд (месяцы, дни, деньги по месяцам) — разностями, если короче
      if(!miss.length)c=v;else if(miss.length<=vals.length)c={$m:miss,$v:v};else{const has=[];for(let i=0,j=0;i<a.length;i++)if(miss[j]===i)j++;else has.push(i);c={$i:has,$v:v};}}
    cols[k]=c;}
  return {$n:a.length,$k:cols};}
const isSoa=x=>isO(x)&&typeof x.$n==='number'&&isO(x.$k);
function uv(x){
  if(Array.isArray(x))return x.map(uv);
  if(isSoa(x))return unsoa(x);
  if(isO(x)){const o={};for(const k in x)o[k]=uv(x[k]);return o;}
  return x;}
// столбец → массив длины n (null на месте отсутствующих) + множество отсутствующих
function col(c,n){
  if(isO(c)&&'$s' in c&&Object.keys(c).length===1){const out=new Array(n);const s=JSON.stringify(c.$s);for(let i=0;i<n;i++)out[i]=i?uv(JSON.parse(s)):uv(c.$s);return {v:out,m:null};}
  if(isO(c)&&Array.isArray(c.$m)&&'$v' in c){const pres=dv(c.$v),m={};for(const i of c.$m)m[i]=1;const out=new Array(n);let j=0;for(let i=0;i<n;i++)if(!m[i])out[i]=pres[j++];return {v:out,m};}
  if(isO(c)&&Array.isArray(c.$d)&&Object.keys(c).length===1){const out=[];let x=0;c.$d.forEach((d,i)=>{x=i?x+d:d;out.push(x);});return {v:out,m:null};}
  if(isO(c)&&Array.isArray(c.$i)&&'$v' in c){const pres=dv(c.$v),m={},out=new Array(n);for(let i=0;i<n;i++)m[i]=1;c.$i.forEach((i,j)=>{delete m[i];out[i]=pres[j];});return {v:out,m};}
  return {v:uv(c),m:null};}
const dv=v=>isO(v)&&Array.isArray(v.$d)&&Object.keys(v).length===1?col(v,v.$d.length).v:uv(v);
function unsoa(x){const n=x.$n,rows=[];for(let i=0;i<n;i++)rows.push({});
  for(const k in x.$k){const c=col(x.$k[k],n);for(let i=0;i<n;i++)if(!(c.m&&c.m[i]))rows[i][k]=c.v[i];}
  return rows;}
// сравнение «как после JSON»: порядок полей не важен (после распаковки он может отличаться — на смысл не влияет), undefined = нет поля, NaN/Infinity = null
function deq(a,b){if(a===b)return true;
  const na=typeof a==='number'&&!isFinite(a),nb=typeof b==='number'&&!isFinite(b);if((na||a===null)&&(nb||b===null))return true;
  if(Array.isArray(a)){if(!Array.isArray(b)||a.length!==b.length)return false;for(let i=0;i<a.length;i++){const x=gone(a[i])?null:a[i],y=gone(b[i])?null:b[i];if(!deq(x,y))return false;}return true;}
  if(isO(a)&&isO(b)){let n=0;for(const k in a){if(gone(a[k]))continue;n++;if(!(k in b)||gone(b[k])||!deq(a[k],b[k]))return false;}for(const k in b)if(!gone(b[k]))n--;return n===0;}
  return false;}
function hasMark(x){if(Array.isArray(x)){for(const v of x)if(hasMark(v))return true;return false;}
  if(isO(x)){if('$n' in x||'$k' in x||'$s' in x||'$m' in x||'$i' in x||'$d' in x||'$pk' in x)return true;for(const k in x)if(hasMark(x[k]))return true;}return false;}
function pack(W){return isO(W)?pv(W):W;}
function unpack(x){return isO(x)&&x.$pk===1?uv(x):x;}   // метка $pk:1 — упакован (старый сейв без неё не трогаем; у мира уже есть своё поле pk)
let fails=0;
function packSafe(W){if(!isO(W))return W;try{if(hasMark(W))throw 0;const p=pv(W);p.$pk=1;const u=uv(JSON.parse(JSON.stringify(p)));delete u.$pk;if(!deq(u,W))throw 0;return p;}catch(e){fails++;return W;}}   // с проверкой: распаковка строки == исходнику, иначе пишем как раньше
root.PACK={pack:W=>{const p=pack(W);if(isO(p))p.$pk=1;return p;},unpack:x=>{const o=unpack(x);if(isO(o)&&o!==x)delete o.$pk;return o;},packSafe,get fails(){return fails;}};
})(typeof window!=='undefined'?window:this);
