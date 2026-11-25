// commands.js — chat va komandalar (T yoki /)
const chat=document.createElement('input'),clog=document.createElement('div');
chat.style.cssText='position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));display:none;z-index:8;padding:6px;font:14px monospace;background:rgba(0,0,0,.7);color:#fff;border:1px solid #888';
clog.style.cssText='position:fixed;left:8px;bottom:120px;color:#fff;font:13px monospace;text-shadow:1px 1px #000;white-space:pre-wrap;pointer-events:none;max-width:70vw;z-index:8';
document.body.append(clog,chat);
let lines=[],lto=0;
const say=t=>{lines=[...lines,t].slice(-7);clog.textContent=lines.join('\n');clog.style.opacity=1;clearTimeout(lto);lto=setTimeout(()=>clog.style.opacity=0,8000)};
function openChat(pre){invOpen=true;document.exitPointerLock();chat.style.display='block';chat.value=pre;chat.focus()}
function closeChat(relock){chat.style.display='none';chat.blur();invOpen=false;if(relock)cv.requestPointerLock();else ov.style.display='flex'}
addEventListener('keydown',e=>{if(!locked||e.target===chat)return;if(e.code=='KeyT'){e.preventDefault();openChat('')}else if(e.key=='/'){e.preventDefault();openChat('/')}});
chat.addEventListener('keydown',e=>{e.stopPropagation();
 if(e.code=='Enter'){const v=chat.value.trim();closeChat(true);if(v)v[0]=='/'?cmd(v.slice(1)):say('<Siz> '+v)}
 else if(e.code=='Escape')closeChat(false)});
function findId(q){const n=q.toLowerCase();if(n=='air')return 0;let id=ALL.find(i=>nameOf(i).toLowerCase()==n);if(id===undefined)id=ALL.find(i=>nameOf(i).toLowerCase().includes(n));return id}
function cmd(s){const a=s.trim().split(/\s+/),c=a[0].toLowerCase(),r=a.slice(1),num=(t,b)=>t&&t[0]=='~'?b+(+t.slice(1)||0):+t;
 switch(c){
 case'help':say('/gamemode creative|survival  /give <nom> [son]  /tp x y z  /time set day|night|<son>\n/summon <mob>  /setblock x y z <blok>  /kill  /clear  /seed  /dimension nether|overworld');break;
 case'gamemode':{const m=(r[0]||'').toLowerCase();if(/^(c|creative|1)$/.test(m))creative=true;else if(/^(s|survival|0)$/.test(m)){creative=false;fly=false}else return say('Foydalanish: /gamemode creative|survival');hud();say('Rejim: '+(creative?'Creative':'Survival'));break}
 case'give':{const n=r.length>1&&!isNaN(+r[r.length-1])?+r.pop():1,id=findId(r.join(' '));if(!id)return say('Topilmadi: '+r.join(' '));add(id,n);hud();say(n+' ta '+nameOf(id)+' berildi');break}
 case'tp':case'teleport':{if(r.length<3)return say('Foydalanish: /tp x y z');p.x=num(r[0],p.x);p.y=num(r[1],p.y);p.z=num(r[2],p.z);v.y=0;fy=p.y;say('Teleport qilindi');break}
 case'time':{const m=(r[0]=='set'?r[1]:r[0])||'';const T2={day:1000,noon:6000,night:13000,midnight:18000};
  if(m in T2)tm=T2[m]/24000;else if(!isNaN(+m)&&m!=='')tm=((+m)%24000)/24000;else return say('Foydalanish: /time set day|noon|night|midnight|<son>');say('Vaqt: '+Math.round(tm*24000));break}
 case'dimension':case'dim':{const w=(r[0]||'').toLowerCase();if(w=='nether')goDim(1);else if(/^(overworld|world)$/.test(w))goDim(0);else say('Foydalanish: /dimension nether|overworld');break}
 case'kill':die();say('Halok bo\u2018ldingiz');break;
 case'summon':{if(!MT[r[0]])return say('Moblar: '+Object.keys(MT).join(', '));spawnMob(r[0],p.x-Math.sin(yaw)*3,p.y+.5,p.z-Math.cos(yaw)*3);say(r[0]+' chaqirildi');break}
 case'setblock':{if(r.length<4)return say('Foydalanish: /setblock x y z <blok>');const id=findId(r.slice(3).join(' '));if(id===undefined||(id&&!B[id]))return say('Blok topilmadi');set(fl(num(r[0],p.x)),fl(num(r[1],p.y)),fl(num(r[2],p.z)),id);say('Blok qo\u2018yildi');break}
 case'clear':inv.fill(null);hud();say('Inventar tozalandi');break;
 case'seed':say('Seed: '+seed);break;
 default:say('Noma\u2018lum komanda. /help')}}
