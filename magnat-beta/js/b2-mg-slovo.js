/* b2-mg-slovo.js — MG2: «📚 Словечко Людмилы» — викторина по словарику js/gloss.js (решение владельца 05.10: жаргон не убирать, а обучать).
   Договор — шапка js/b2-mg-core.js; опись — js/b2-mg2.js, id 'slovo'. 60 с: Людмила читает объяснение, вы выбираете слово из трёх.
   Верно — +1 слово, термин считается изученным (GLOSS.learn, как нажатие в словарике). Неверно — Людмила показывает правильное (пауза 2 с — вот и штраф).
   Сначала — ещё не изученные термины. Рекорд — слов за 60 с. */
(function(root){'use strict';
if(!root.MG)return;
const SKIP={en:1,mile:1,rank:1,plan:1,mult:1,hand:1};
const PR=[['«Верно! Бухгалтер из вас выйдет»','“Correct! You’d make an accountant”'],['«Так. И это знаете»','“Right. You know this one too”'],['«Вот! А Борис путает»','“There! Boris mixes them up”'],['«Записываю в отличники»','“Writing you down as top of the class”']];
const NO=[['«Почти. Запомним вместе»','“Almost. Let’s remember it together”'],['«Не страшно — я тоже не сразу»','“No worries — took me a while too”']];
function pool(){const G=root.GLOSS&&GLOSS.T||{},en=typeof LANG!=='undefined'&&LANG==='en',o=[];
  for(const k in G){const e=G[k];if(SKIP[k]||!Array.isArray(e))continue;const nm=en?e[1]:e[0];if(!nm||nm.length>26)continue;
    let d=String(en?e[3]:e[2]).replace(/<[^>]*>/g,'').replace(/[✀-➿\ud83c-􏰀-\udfff]+/g,'').trim();
    const m=d.match(/^.*?[.!?](?=\s+[A-ZА-ЯЁ«])/);if(m&&m[0].length>40)d=m[0];
    const re=en?e[5]:e[4];if(re&&re.source)try{d=d.replace(new RegExp(re.source,'gi'),'…');}catch(x){}
    nm.split(/[,(]/).forEach(w=>{w=w.trim();if(w.length>2)d=d.split(w).join('…');});
    if(d.length>175){d=d.slice(0,170);d=d.slice(0,d.lastIndexOf(' '))+'…';}
    o.push({k,nm,d});}
  return o;}
const glK=()=>{try{return (typeof S!=='undefined'&&S&&S.glK)||{};}catch(e){return {};}};
function wrap(c,t,w){const o=[];let ln='';for(const x of t.split(' ')){const tt=ln?ln+' '+x:x;if(c.measureText(tt).width>w&&ln){o.push(ln);ln=x;}else ln=tt;}if(ln)o.push(ln);return o;}
function make(sh){const S=sh.S,L=sh.L,T=a=>L(a[0],a[1]);let s=null,P=null;
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  function next(){if(!P.length)return;const known=glK();
    let c=P.filter(q=>!s.used[q.k]);if(c.length<3){s.used={};c=P.slice();}
    const fresh=c.filter(q=>!known[q.k]);const q=pick(fresh.length&&Math.random()<.75?fresh:c);s.used[q.k]=1;
    const o=[q];while(o.length<3&&o.length<P.length){const z=pick(P);if(o.indexOf(z)<0&&z.nm!==q.nm)o.push(z);}
    for(let i=o.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[o[i],o[j]]=[o[j],o[i]];}
    s.q={q,o,ans:-1,t:0};s.fg={i:o.indexOf(q),cd:1.6,down:0};}
  function ans(i){const Q=s.q;if(!Q||Q.ans>=0||i<0||i>=Q.o.length)return;Q.ans=i;const ok=Q.o[i]===Q.q;
    if(ok){sh.add(1);sh.snd('coin');s.wait=.7;if(!S.demo){try{GLOSS.learn&&GLOSS.learn(Q.q.k);}catch(x){}if(Math.random()<.5)sh.say(T(pick(PR)));}}
    else{sh.snd('no');s.wait=2;if(!S.demo)sh.say(T(pick(NO)));}}
  const BY=[262,346,430];
  return {
    reset(demo){P=pool();s={used:{},wait:0,q:null};next();},
    step(dt){if(!s.q)return;s.q.t+=dt;if(s.wait>0){s.wait-=dt;if(s.wait<=0)next();return;}
      if(S.demo){const f=s.fg;f.cd-=dt;if(f.down)f.down=Math.max(0,f.down-dt);if(f.cd<=0&&s.q.ans<0){f.down=.3;ans(f.i);}}},
    draw(c){c.fillStyle='#f4efe6';c.fillRect(0,0,360,520);if(!s.q){c.fillStyle='#1d2733';c.font='18px sans-serif';c.textAlign='center';c.fillText(L('Словарик не загрузился','The glossary did not load'),180,260);return;}
      const Q=s.q;c.fillStyle='#fff';sh.rr(c,12,12,336,224,16);c.fill();c.strokeStyle='#d5dbe2';c.lineWidth=2;c.stroke();
      c.fillStyle='#8b5a2b';c.font='bold 15px sans-serif';c.textAlign='left';c.textBaseline='middle';c.fillText(L('Людмила Санна: что это за слово?','Lyudmila: what’s the word?'),26,34);
      c.fillStyle='#1d2733';c.font='18px sans-serif';const ls=wrap(c,'«'+Q.q.d+'»',306);const lh=ls.length>7?20:24;ls.slice(0,8).forEach((l,i)=>c.fillText(l,26,64+i*lh));
      for(let i=0;i<Q.o.length;i++){const y=BY[i],sel=Q.ans===i,good=Q.o[i]===Q.q,show=Q.ans>=0;
        c.fillStyle=show&&good?'#0a7a3a':sel?'#c62828':'#fff';sh.rr(c,22,y,316,66,14);c.fill();c.strokeStyle=show&&(good||sel)?'transparent':'#b9c2cc';c.lineWidth=2;c.stroke();
        c.fillStyle=show&&(good||sel)?'#fff':'#1d2733';c.font='bold 20px sans-serif';c.textAlign='left';c.fillText((i+1)+'.',38,y+33);c.textAlign='center';c.fillText(Q.o[i].nm,190,y+33);}
      if(Q.ans>=0&&Q.o[Q.ans]!==Q.q){c.fillStyle='#0a7a3a';c.font='bold 16px sans-serif';c.textAlign='center';c.fillText(L('Правильно: ','Right answer: ')+Q.q.nm,180,248);}},
    down(x,y){for(let i=0;i<3;i++)if(y>=BY[i]&&y<=BY[i]+66)ans(i);},
    key(k,up){if(up)return;const i={'1':0,'2':1,'3':2,ArrowUp:0,ArrowLeft:0,ArrowDown:2,ArrowRight:1}[k];if(i!=null)ans(i);},
    peek(){return s;},ai(){if(s.q&&s.q.ans<0&&s.wait<=0&&s.q.t>1.4)ans(s.q.o.indexOf(s.q.q));},
    finger(){if(!s||!s.q||!s.fg)return null;return {x:250,y:BY[s.fg.i]+40,down:s.fg.down>0};}};}
MG.game('slovo',{hero:{n:['Людмила Санна','Lyudmila Sanna'],a:'📚',c:'#8b5a2b',l:['','']},
  how:['Людмила читает объяснение — <b>выберите слово</b> из трёх. Верно — слово изучено. 60 секунд.','Lyudmila reads an explanation — <b>pick the word</b> out of three. Right — the word is learned. 60 seconds.'],
  go:['«Проверим словарик. Жаргон не страшен, если его понимать»','“Let’s check the glossary. Jargon isn’t scary once you get it”'],
  hand:'tap',dur:60,demoT:6,make});
})(typeof window!=='undefined'?window:globalThis);
