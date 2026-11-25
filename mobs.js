// mobs.js — moblar, AI, jang, creeper portlashi
const MT={
 zombie:{hp:20,w:.6,h:1.8,sp:2.4,host:1,bw:.5,bh:.75,bl:.25,lh:.75,hs:.5,legs:2,c:[0x3a5aa0,0x5a9a4a,0x2c2c7a]},
 creeper:{hp:20,w:.6,h:1.7,sp:2.5,host:1,bw:.45,bh:.7,bl:.3,lh:.45,hs:.5,legs:4,c:[0x4caf50,0x57c05a,0x3a8a40]},
 pig:{hp:10,w:.8,h:.9,sp:1.2,bw:.5,bh:.5,bl:.9,lh:.35,hs:.4,legs:4,c:[0xf0a0a8,0xf4b0b4,0xe08890]},
 cow:{hp:10,w:.8,h:1.4,sp:1.1,bw:.6,bh:.6,bl:1,lh:.6,hs:.45,legs:4,c:[0x4a3a2a,0x5a4a3a,0x3a2a1a]},
 skeleton:{hp:20,w:.6,h:1.8,sp:2.2,host:1,bw:.4,bh:.75,bl:.2,lh:.75,hs:.45,legs:2,c:[0xd8d8d0,0xe6e6de,0xc0c0b8]},
 spider:{hp:16,w:.9,h:.7,sp:3.4,host:1,bw:.55,bh:.4,bl:.8,lh:.3,hs:.35,legs:4,c:[0x2d2626,0x403030,0x1a1414]},
 chicken:{hp:4,w:.4,h:.7,sp:1.3,bw:.3,bh:.3,bl:.4,lh:.25,hs:.2,legs:4,c:[0xf4f4f4,0xffffff,0xe0a030]},
 sheep:{hp:8,w:.8,h:1.3,sp:1.1,bw:.65,bh:.65,bl:.95,lh:.55,hs:.4,legs:4,c:[0xeeeeee,0xd8c8b0,0xc8b8a0]}};
const DR={zombie:[['Rotten Flesh',0,2]],creeper:[['Gunpowder',0,2]],pig:[['Raw Porkchop',1,3]],cow:[['Raw Beef',1,3],['Leather',0,2]],sheep:[['Raw Mutton',1,2],['White Wool',1,1]],skeleton:[['Arrow',0,2],['Bone',0,2]],spider:[['String',0,2],['Spider Eye',0,1]],chicken:[['Raw Chicken',1,1],['Feather',0,2]]};
ALL.push(def('Gunpowder','mat',{c:[70,70,70]}),def('Leather','mat',{c:[160,100,60]}));
const fid=n=>+(Object.keys(I).find(k=>I[k].n==n)||Object.keys(B).find(k=>B[k]&&B[k][3]==n));
const mobs=[];let spT=0,atkT=0;
function mkMob(t){const s=MT[t],g=new THREE.Group(),mt=[],legs=[];
 const bx=(w,h,l,col,x,y,z,pv)=>{const ge=new THREE.BoxGeometry(w,h,l);if(pv)ge.translate(0,-h/2,0);const m=new THREE.Mesh(ge,new THREE.MeshBasicMaterial({color:col}));m.position.set(x,y,z);m.userData.o=col;g.add(m);mt.push(m);return m};
 bx(s.bw,s.bh,s.bl,s.c[0],0,s.lh+s.bh/2,0);
 if(s.legs==2){bx(s.hs,s.hs,s.hs,s.c[1],0,s.lh+s.bh+s.hs/2,0);for(const a of[-1,1])bx(.18,.18,.6,s.c[1],a*(s.bw/2+.1),s.lh+s.bh*.85,-.3);
  for(const a of[-1,1])legs.push(bx(.22,s.lh,.22,s.c[2],a*s.bw/4,s.lh,0,1))}
 else{bx(s.hs,s.hs,s.hs,s.c[1],0,s.lh+s.bh*.8,-(s.bl/2+s.hs/2-.05));
  for(const a of[-1,1])for(const b of[-1,1])legs.push(bx(.2,s.lh,.2,s.c[2],a*s.bw/2.4,s.lh,b*s.bl/2.4,1))}
 g.userData={legs,mt};return g}
function spawnMob(t,x,y,z){const g=mkMob(t);scene.add(g);const m={t,s:MT[t],g,x,y,z,vx:0,vy:0,vz:0,hp:MT[t].hp,yaw:Math.random()*6.28,wt:0,tx:0,tz:0,cd:0,fuse:-1,flash:0,fl:false,gnd:false,ph:0};mobs.push(m);return m}
const rm=i=>{scene.remove(mobs[i].g);mobs.splice(i,1)};
function mhit(m){const r=m.s.w/2,e=.001;for(let x=fl(m.x-r);x<=fl(m.x+r-e);x++)for(let y=fl(m.y);y<=fl(m.y+m.s.h-e);y++)for(let z=fl(m.z-r);z<=fl(m.z+r-e);z++)if(solid(x,y,z))return true;return false}
function mmv(m,a,d){if(!d)return false;m[a]+=d;if(mhit(m)){m[a]-=d;if(a=='y'){if(d<0)m.gnd=true;m.vy=0}return true}return false}
function explode(cx,cy,cz,r){const hit=new Set();
 for(let x=-r;x<=r;x++)for(let y=-r;y<=r;y++)for(let z=-r;z<=r;z++){if(x*x+y*y+z*z>r*r+1)continue;const X=cx+x,Y=cy+y,Z=cz+z;if(Y<0||Y>=H)continue;
  const b=get(X,Y,Z);if(!b||(B[b]&&B[b][3]=='Bedrock'))continue;
  const a=fl(X/CS),c2=fl(Z/CS),c=ch(a,c2),i=idx(X-a*CS,Y,Z-c2*CS);c.d[i]=0;(ed[K(a,c2)]=ed[K(a,c2)]||{})[i]=0;hit.add(c)}
 for(const c of [...hit])for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=chunks.get(K(c.cx+dx,c.cz+dz));if(n)hit.add(n)}
 hit.forEach(c=>mesh(c))}
function boom(m){explode(fl(m.x),fl(m.y+1),fl(m.z),3);const d=Math.hypot(p.x-m.x,p.y-m.y,p.z-m.z);if(d<7&&!creative)hurt(Math.ceil(14*(1-d/7)))}
function hitMob(m,d){m.hp-=d;m.flash=.3;const dd=Math.hypot(p.x-m.x,p.z-m.z)||1;m.vx=-(p.x-m.x)/dd*6;m.vz=-(p.z-m.z)/dd*6;m.vy=4.5;
 if(m.hp<=0){for(const[n,a,b]of DR[m.t]||[]){const k=a+Math.floor(Math.random()*(b-a+1));if(k>0)add(fid(n),k)}hud();rm(mobs.indexOf(m))}}
function attack(){if(atkT>0||!locked)return false;
 const dx=-Math.sin(yaw)*Math.cos(pitch),dy=Math.sin(pitch),dz=-Math.cos(yaw)*Math.cos(pitch);let best=null,bt=3.6;
 for(const m of mobs){const vx=m.x-p.x,vy=m.y+m.s.h/2-(p.y+1.62),vz=m.z-p.z,t=vx*dx+vy*dy+vz*dz;if(t<0||t>bt)continue;
  if(Math.hypot(vx-dx*t,vy-dy*t,vz-dz*t)<Math.max(m.s.w,m.s.h/2)*.7+.1){bt=t;best=m}}
 if(!best)return false;const s=inv[sel],o=s&&I[s.id];hitMob(best,(o&&o.dmg)||1);atkT=.4;return true}
function trySpawn(types){const a=Math.random()*6.28,r=14+Math.random()*14,x=fl(p.x+Math.cos(a)*r),z=fl(p.z+Math.sin(a)*r);
 if(!chunks.has(K(fl(x/CS),fl(z/CS))))return;let y=H-1;while(y>0&&!solid(x,y,z))y--;
 const t=types[Math.floor(Math.random()*types.length)];
 if(get(x,y+1,z)||get(x,y+2,z)||(!MT[t].host&&get(x,y,z)!=1))return;spawnMob(t,x+.5,y+1,z+.5)}
function trySpawnCave(types){const a=Math.random()*6.28,r=10+Math.random()*12,x=fl(p.x+Math.cos(a)*r),z=fl(p.z+Math.sin(a)*r);if(!chunks.has(K(fl(x/CS),fl(z/CS))))return;
 for(let y=Math.min(H-3,fl(p.y)+6);y>Math.max(2,fl(p.y)-8);y--){if(solid(x,y-1,z)&&!get(x,y,z)&&!get(x,y+1,z)&&get(x,y-1,z)!=997){spawnMob(types[Math.floor(Math.random()*types.length)],x+.5,y,z+.5);return}}}
const arrows=[];
function shoot(m){const dx=p.x-m.x,dy=p.y+1.2-(m.y+1.4),dz=p.z-m.z,d=Math.hypot(dx,dy,dz)||1,sp=16;
 const g=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.5),new THREE.MeshBasicMaterial({color:0xdddddd}));g.position.set(m.x,m.y+1.4,m.z);scene.add(g);
 arrows.push({g,vx:dx/d*sp,vy:dy/d*sp+d*.15,vz:dz/d*sp,t:0})}
function arrowsTick(dt){for(let i=arrows.length-1;i>=0;i--){const a=arrows[i],q=a.g.position;a.vy-=9*dt;q.x+=a.vx*dt;q.y+=a.vy*dt;q.z+=a.vz*dt;a.t+=dt;a.g.lookAt(q.x+a.vx,q.y+a.vy,q.z+a.vz);
 let dead=a.t>5||solid(fl(q.x),fl(q.y),fl(q.z));
 if(!dead&&!creative&&Math.abs(q.x-p.x)<.5&&Math.abs(q.z-p.z)<.5&&q.y>p.y&&q.y<p.y+1.8){hurt(3);dead=true}
 if(dead){scene.remove(a.g);arrows.splice(i,1)}}}
function tick(dt){if(!locked)return;arrowsTick(dt);
 spT+=dt;atkT-=dt;
 if(spT>1){spT=0;const np=mobs.filter(m=>!m.s.host).length,hn=mobs.length-np,night=Math.sin(tm*6.2832)<-.2,under=!DIM&&p.y<hgt(fl(p.x),fl(p.z))-6;
  if(!DIM&&np<10)trySpawn(['pig','cow','sheep','chicken']);
  if(!creative&&hn<(DIM||under?8:6)){if(DIM||under)trySpawnCave(DIM?['zombie','skeleton','skeleton']:['zombie','skeleton','spider','creeper']);else if(night)trySpawn(['zombie','zombie','creeper','skeleton','spider'])}}
 for(let i=mobs.length-1;i>=0;i--){const m=mobs[i],dx=p.x-m.x,dz=p.z-m.z,d=Math.hypot(dx,dz);
  if(d>72||m.y<-10){rm(i);continue}
  let mx=0,mz=0,k=m.s.sp;
  if(m.s.host&&!creative&&d<18){mx=dx/(d||1);mz=dz/(d||1);
   if(m.t=='zombie'||m.t=='spider'){m.cd-=dt;if(d<1.5&&Math.abs(p.y-m.y)<1.8&&m.cd<=0){m.cd=1;hurt(m.t=='spider'?2:3)}}
   else if(m.t=='skeleton'){const q=d>10?1:d<5?-1:0;mx*=q;mz*=q;m.cd-=dt;if(m.cd<=0&&d<16){m.cd=2;shoot(m)}}
   else if(d<3.2){if(m.fuse<0)m.fuse=1.5;m.fuse-=dt;mx=mz=0;m.g.scale.setScalar(1+(1.5-m.fuse)*.1);if(m.fuse<=0){boom(m);rm(i);continue}}
   else if(m.fuse>=0&&d>5){m.fuse=-1;m.g.scale.setScalar(1)}}
  else{m.wt-=dt;if(m.wt<=0){m.wt=2+Math.random()*4;const a=Math.random()*6.28,go=Math.random()<.6;m.tx=go?Math.cos(a):0;m.tz=go?Math.sin(a):0}mx=m.tx;mz=m.tz;k*=.6}
  const bl=Math.min(1,8*dt);m.vx+=(mx*k-m.vx)*bl;m.vz+=(mz*k-m.vz)*bl;m.vy-=26*dt;m.gnd=false;
  const b1=mmv(m,'x',m.vx*dt),b2=mmv(m,'z',m.vz*dt);mmv(m,'y',m.vy*dt);if((b1||b2)&&m.gnd&&(mx||mz))m.vy=7.5;
  const mv=Math.hypot(m.vx,m.vz);if(mx||mz)m.yaw=Math.atan2(-mx,-mz);m.ph+=mv*dt*3;
  m.g.userData.legs.forEach((l,j)=>l.rotation.x=Math.sin(m.ph+(j%2?0:Math.PI))*.7*Math.min(1,mv));
  m.flash-=dt;const f=m.flash>0;if(f!=m.fl){m.fl=f;m.g.userData.mt.forEach(x=>x.material.color.setHex(f?0xff5555:x.userData.o))}
  m.g.position.set(m.x,m.y,m.z);m.g.rotation.y=m.yaw}}
