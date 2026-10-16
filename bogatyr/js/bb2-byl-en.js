/* ===== bb2-byl-en.js — "The Ballad of the Run" (BYL stream): ENGLISH VERSES. Loaded on demand (set 'bylT') when the game language is English. =====
   Same format as bb2-byl-ru.js: rhymed couplets, slots in the middle of lines, two-character ids that live in saves (never change or reuse).
   English has no cases: {H}/{B}/{P} are plain names; {Pw} = {P}. */
var BB2BYL_T=(function(){
  var T={lang:'en',N:[],Z:[],D:[],R:[],M:[]};
  function n(i,w,c,a){T.N.push({i:i,w:w,c:c,t:[a]});}
  function z(i,w,c,a,b){T.Z.push({i:i,w:w,c:c,t:[a,b]});}
  function d(i,k,w,c,a,b){T.D.push({i:i,k:k,w:w,c:c,t:[a,b]});}
  function r(i,w,c,a,b){T.R.push({i:i,w:w,c:c,t:[a,b]});}
  function m(i,w,c,a){T.M.push({i:i,w:w,c:c,t:[a]});}
  function win(f){return f.win&&!!f.b&&(f.m===''||f.m==='d');}
  function lose(f){return !f.win&&!f.q&&(f.m===''||f.m==='d');}
  function camp(f){return f.m===''||f.m==='d';}
  var H={dob:'Dobrynya',ale:'Alyosha',ily:'Ilya',vas:'Vasilisa',sad:'Sadko',mik:'Mikula',vol:'Volga',mar:'Marya',iva:'Ivan'};
  T.hero=function(id,nm){var h=H[id]||String(nm||'The hero').split(' ')[0];return [h,h,h,h,h,0];};
  T.boss=function(id,nm,g){nm=nm||'the villain';return [nm,nm,nm,nm,nm,g||'m'];};
  T.place=function(f,chId,chName){var p=f.m==='e'?'the Endless Battle':f.m==='w'?'the Trial of the Week':chName;return [p,p];};
  T.prep=function(f,v){var mn=Math.max(1,Math.round(f.t/60));
    v.F=f.f>0?(f.f===1?'once':f.f===2?'twice':f.f+' times'):'';v.UN=f.un>0?(f.un===1?'once':f.un===2?'twice':f.un+' times'):'';v.TM=mn+(mn===1?' minute':' minutes');
    v.XN=f.xn>1?String(f.xn):'';v.PD=f.pd>0?String(f.pd):'';v.EV=f.ev>1?String(f.ev):'';v.NW=f.nw>1?String(f.nw):'';v.DIF=f.dif==='h'?'Hell':f.dif==='s'?'Hard':'';
    v.sign='As told by the hero, written down by Boyan';v.signN='Written down by Boyan. Run led by ';v.vs='vs';v.game='Bogatyr vs the Unclean';v.st=['time','defeated','level'];};

  n('n1',2,null,'How {H} went to {P}');
  n('n2',2,function(f){return win(f)||f.m==='rv';},'{H} vs {B}');
  n('n3',1,null,'The Tale of {H} and the Monsters');
  n('n4',3,function(f){return lose(f)||f.q;},'The run {H} asked us not to mention');
  n('n5',4,function(f){return f.m==='nk';},'{H}: one minute of glory');
  n('n6',3,function(f){return win(f)&&f.t<=240;},'{H} came, saw and tidied up');

  z('z1',2,null,'Gather round, good folk, and lend an ear:','{H} went to {P} — and brought no fear.');
  z('z2',2,camp,'The monsters of {P} were having a lovely day —','then {H} showed up, and it went away.');
  z('z3',2,camp,'They told {H}: “{P}? Don’t you dare!”','{H} nodded politely — and went straight there.');
  z('z4',2,camp,'No time to nap, no time to dine:','{P} has monsters, and {H} is next in line.');
  z('z5',2,camp,'The horse is saddled, the blade is keen:','{H} rides to {P} to sweep it clean.');
  z('z6',2,null,'This is no tale of turnip or bun —','it’s {H} in {P}, and monsters on the run.');
  z('z7',9,function(f){return f.m==='e'||f.m==='w';},'The battle has no end, or so they say —','{H} came to count the monsters anyway.');
  z('z8',9,function(f){return f.m==='nk';},'Sixty seconds, not one more:','{H} rushed in to settle the score.');
  z('z9',9,function(f){return f.m==='rv';},'A debt is a debt, and a rematch is due:','{H} came back for {B} — with something new.');
  z('za',5,function(f){return f.h==='iva';},'Ivan the Fool was headed the other way —','and ended up in {P}. Bad news for the prey.');
  z('zb',5,function(f){return f.h==='ily';},'Thirty years Ilya lay on the stove, at rest —','then sprinted to {P} like the very best.');

  d('d1','w',2,null,'{W} did the talking, loud and clear:','the monsters listened — mostly out of fear.');
  d('d2','w',5,function(f,v){return !!v.E;},'Then came {E} — oh, what a sight!','The monsters looked, and lost their appetite.');
  d('d3','w',5,function(f){return f.nw===1&&f.win&&f.t>=120;},'One weapon only, the whole way through:','no need to scare them off with two.');
  d('d4','s',5,function(f,v){return !!v.X;},'A wonder turned up on the way — {X}, no less:','the monsters filed a complaint. It was a mess.');
  d('d5','s',4,function(f,v){return !!v.U&&f.un>=2;},'“{U}!” cried {H} — and the ground went shake:','the monsters heard it {UN}. They’re still awake.');
  d('d6','s',6,function(f){return f.pd>=1;},'Deeds in one run: {PD} — Boyan couldn’t keep pace:','he broke two quills and wrote with a red face.');
  d('d7','s',6,function(f){return !!f.st;},'At the Crossroads Stone {H} picked a road —','the stone just sighed: “Well, you’ve been told.”');
  d('d8','s',7,function(f){return f.vow;},'A vow was made, a vow was kept, though it was tight:','a hero’s word is armour, not a kite.');
  d('d9','n',4,function(f){return f.k>=100;},'{K} monsters fell — a decent crowd:','{H} lost count twice, and said so out loud.');
  d('da','n',3,function(f){return f.k>0&&f.k<60&&f.t>=30;},'Just {K} defeated. Not a lot —','but each one got a personal shot.');
  d('db','n',3,function(f){return f.lv>=8;},'Level {L} by the end of the fight:','monsters can’t learn that much overnight.');
  d('dc','n',4,function(f){return f.c>=2;},'Chests opened: {C}, every one a treat:','monsters saved for ages — lost it in a beat.');
  d('dd','n',3,function(f){return f.g>=300;},'{G} gold for the treasury — the sacks are tight:','the village elder counted it all night.');
  d('de','n',6,function(f){return win(f)&&!f.f;},'Not a scratch, not a bruise, not a bump on the head:','monsters only know such things from books they’ve read.');
  d('df','n',5,function(f){return f.f>=2;},'Down {F}, and up again once more:','the monsters lost track of the score.');
  d('dg','n',6,function(f){return win(f)&&f.t<=240;},'Done in {T} — the soup’s still hot:','the monsters never knew what they got.');
  d('dh','n',5,function(f){return f.t>=480;},'{TM} of fighting, and still on two feet:','the monsters tired first and begged for a seat.');

  r('r1',3,win,'{B} had promised to eat the hero whole —','and is now on leave. Not by choice, poor soul.');
  r('r2',3,win,'The talk with {B} was short and sweet:','one “hello”, one “goodbye”, and a swift retreat.');
  r('r3',3,win,'{B} was the terror of the land, they said —','now it’s a bedtime story: “Sleep tight, don’t dread.”');
  r('r4',3,win,'They searched for {B} for three days flat:','found in the burdock, whispering: “I’m out. That’s that.”');
  r('r5',3,win,'And {B}? Oh, {B} is lying down to rest —','and scaring no one. Which is for the best.');
  r('r6',12,function(f){return f.win&&f.sud==='mercy'&&!!f.b;},'The court was quick: let {B} go free!','Now sweeping the yard and fetching the tea.');
  r('r7',12,function(f){return f.win&&f.sud==='exile'&&!!f.b;},'The court decreed: {B} — be gone!','No return tickets. The carousel is done.');
  r('r8',3,lose,'The monsters won by numbers, not by skill:','{H} withdrew — with dignity, and speed downhill.');
  r('r9',3,lose,'And {H} ran faster than a horse can run:','“It’s not retreat — it’s a run-up! I’m not done!”');
  r('ra',5,function(f,v){return lose(f)&&!!v.Kn;},'It was {Kn} who brought the hero down.','The chronicler refused to write it. Then wrote it with a frown.');
  r('rb',5,function(f){return lose(f)&&f.bl>0&&!!f.b;},'{B} holds the field today, no doubt —','but {H} is sharpening a sword and plotting it out.');
  r('rc',6,function(f){return lose(f)&&f.t<60;},'The run was short as a summer night:','walked in, looked round — and took flight.');
  r('rd',6,function(f){return f.q&&f.m!=='nk';},'{H} left halfway: things to do!','The monsters waited at the gate till two.');
  r('re',6,function(f){return (f.m==='e'||f.m==='w')&&!f.q;},'The battle is over; the monsters are not:','{H} went for lunch — they’re holding the spot.');
  r('rf',9,function(f){return f.m==='nk';},'One minute flat — now that’s a raid!','{K} monsters learned how it’s played.');
  r('rg',9,function(f){return f.m==='rv'&&f.win;},'The rematch is won! {B} trained all night.','It didn’t help. Not even slight.');
  r('rh',9,function(f){return f.m==='rv'&&!f.win;},'{B} stayed standing in the rematch today —','but the look in those eyes was fear, not play.');

  m('m1',1,win,'Moral: good beats evil. On points — but it does.');
  m('m2',2,win,'Recorded faithfully. The monsters read the report and refused to sign.');
  m('m3',1,win,'Moral: let sleeping heroes lie. This one was awake.');
  m('m4',2,win,'The monsters asked us to pass on: “This is not what we agreed.”');
  m('m5',1,null,'And Boyan was there, and drank kvass, and wrote it all down.');
  m('m6',2,lose,'Moral: a retreat is still a journey — just the other way.');
  m('m7',3,function(f){return lose(f)||f.q;},'The horse saw everything, but promised to keep quiet.');
  m('m8',2,lose,'Moral: the Forge is open, and the monsters aren’t going anywhere.');
  m('m9',2,function(f){return lose(f)||f.q;},'Boyan wrote: “tactical withdrawal”. And winked.');
  m('ma',2,lose,'The monsters are celebrating. Let them: they clean up tomorrow.');
  m('mb',3,function(f){return f.m==='e'||f.m==='w'||f.m==='nk';},'Moral: many monsters, one hero. Pity the monsters.');
  m('mc',3,function(f){return f.win&&f.h==='iva';},'Moral: fools have all the luck. Tested by Ivan.');
  return T;})();
