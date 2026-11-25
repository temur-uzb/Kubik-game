const CS=16,H=48,RD=4,WL=12;let DIM=0;const K=(cx,cz)=>(DIM?'n:':'')+cx+','+cz;
let seed,ed={};
try{seed=+localStorage.getItem('kd_seed');ed=JSON.parse(localStorage.getItem('kd_ed')||'{}')}catch(e){}
if(!seed){seed=Math.floor(Math.random()*9999)+1;ed={}}
// ---- textures
const T=16,NT=100,ac=document.createElement('canvas');ac.width=T*NT;ac.height=T;
const g=ac.getContext('2d');
const rn=(a,b)=>{const s=Math.sin(a*12.9898+b*78.233)*43758.5453;return s-Math.floor(s)};
function tile(i,f){for(let y=0;y<T;y++)for(let x=0;x<T;x++){const r=rn(x+i*17,y+i*3),c=f(x,y,r);g.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${c[3]===undefined?1:c[3]})`;g.clearRect(i*T+x,y,1,1);g.fillRect(i*T+x,y,1,1)}}
const sh=(c,r,v)=>c.map(k=>Math.max(0,Math.min(255,k+(r-.5)*v)));
tile(0,(x,y,r)=>sh([95,160,55],r,50));
tile(1,(x,y,r)=>y<4||(y==4&&r>.5)?sh([95,160,55],r,50):sh([134,96,67],r,40));
tile(2,(x,y,r)=>sh([134,96,67],r,40));
tile(3,(x,y,r)=>sh([125,125,125],r,45));
tile(4,(x,y,r)=>sh([219,207,163],r,25));
tile(5,(x,y,r)=>sh([x%4==0?80:100,70,40],r,25));
tile(6,(x,y,r)=>{const d=Math.max(Math.abs(x-7.5),Math.abs(y-7.5));return sh(d%4<2?[160,130,80]:[110,85,50],r,20)});
tile(7,(x,y,r)=>r<.2?[0,0,0,0]:sh([50,130,40],r,50));
tile(8,(x,y,r)=>sh(y%8==7?[110,80,45]:[170,135,85],r,25));
tile(9,(x,y,r)=>sh(rn(x>>2,y>>2)>.5?[110,110,110]:[145,145,145],r,30));
tile(10,(x,y)=>x==0||y==0||x==15||y==15?[200,230,240,.9]:(x+y)%9==0?[255,255,255,.6]:[200,230,240,.12]);
tile(11,(x,y,r)=>(y%4==3||(x+(y>>2)%2*4)%8==7)?[190,190,180]:sh([150,60,45],r,30));
const pk=c=>(x,y,r)=>y<3&&x>=3&&x<=12?sh(c,r,25):(x+y==15&&y>=2?[100,70,40]:[0,0,0,0]);
tile(12,(x,y,r)=>x%8==0||y%8==0?[80,55,30]:sh([170,135,85],r,25));
tile(13,(x,y,r)=>y<4?sh([120,85,50],r,25):sh([170,135,85],r,25));
tile(14,(x,y)=>x+y==15||x+y==14?[110,80,45]:[0,0,0,0]);
tile(15,pk([170,135,85]));tile(16,pk([125,125,125]));
tile(90,(x,y,r)=>{const w=rn((x>>1)+5,(y>>1)+9);return sh(w>.6?[255,200,60]:w>.3?[240,110,20]:[200,60,10],r,30)});
tile(91,(x,y,r)=>{const w=Math.sin(x*.7+y*.5)+Math.sin(y*.9-x*.3);return w>.6?[200,120,255,.8]:[110,40,190,.55]});
const tex=new THREE.CanvasTexture(ac);tex.magFilter=THREE.NearestFilter;tex.minFilter=THREE.NearestFilter;
const mat=new THREE.MeshBasicMaterial({map:tex,vertexColors:true,alphaTest:.4,transparent:true});
// ---- blocks [top,side,bottom,name]
const B=[0,[0,1,2,'Grass'],[2,2,2,'Dirt'],[3,3,3,'Stone'],[4,4,4,'Sand'],[6,5,6,'Log'],[7,7,7,'Leaves'],[8,8,8,'Planks'],[9,9,9,'Cobblestone'],[10,10,10,'Glass'],[11,11,11,'Brick'],[12,13,7,'Crafting Table']];
const TR=new Set([6,9,997,998]);B[997]=[90,90,90,'Lava'];B[998]=[91,91,91,'Nether Portal'];
// ---- terrain
const hs=(a,b)=>rn(a+seed*0.37,b-seed*0.91);
function vn(x,z){const ix=Math.floor(x),iz=Math.floor(z),fx=x-ix,fz=z-iz,u=fx*fx*(3-2*fx),v=fz*fz*(3-2*fz);
 return (hs(ix,iz)*(1-u)+hs(ix+1,iz)*u)*(1-v)+(hs(ix,iz+1)*(1-u)+hs(ix+1,iz+1)*u)*v}
const hgt=(x,z)=>Math.floor(13+vn(x/48,z/48)*16+vn(x/14,z/14)*6-3);
const chunks=new Map();
const fl=Math.floor,idx=(x,y,z)=>(x*H+y)*CS+z;
function v3(x,y,z){const ix=fl(x),iy=fl(y),iz=fl(z),fx=x-ix,fy=y-iy,fz=z-iz,u=fx*fx*(3-2*fx),w=fy*fy*(3-2*fy),q=fz*fz*(3-2*fz);
 const h=(a,b,c)=>rn(a+c*57.3+seed*.13,b+c*13.7-seed*.07);
 const l=(a,b)=>a+(b-a)*u,m=(j)=>l(h(ix,iy+j,iz),h(ix+1,iy+j,iz)),n=(j)=>l(h(ix,iy+j,iz+1),h(ix+1,iy+j,iz+1));
 const A=m(0)+(n(0)-m(0))*q,Bq=m(1)+(n(1)-m(1))*q;return A+(Bq-A)*w}
function biome(wx,wz){const t=vn(wx/110+300,wz/110+300),w=vn(wx/90-300,wz/90+700);return t>.62?'desert':t<.38?'snow':w>.56?'forest':'plains'}
let OB=null;const bidn=n=>+Object.keys(B).find(k=>B[k]&&B[k][3]==n);
function obs(){return OB||(OB={bed:bidn('Bedrock'),snow:bidn('Snow Block'),coal:bidn('Coal Ore'),iron:bidn('Iron Ore'),gold:bidn('Gold Ore'),dia:bidn('Diamond Ore'),eme:bidn('Emerald Ore'),red:bidn('Redstone Ore'),lap:bidn('Lapis Ore'),
 gra:bidn('Gravel'),nr:bidn('Netherrack'),gl:bidn('Glowstone'),sou:bidn('Soul Sand'),qz:bidn('Nether Quartz Ore'),ob:bidn('Obsidian'),nb:bidn('Nether Brick'),gran:bidn('Granite'),dio:bidn('Diorite'),and:bidn('Andesite')})}
function oreAt(o,wx,y,wz){const c=rn((wx>>1)*3.1+y*7,(wz>>1)*5.3+(y>>1)*11),k=rn(wx*1.7+y,wz*2.3-y*.5);
 if(c<.03&&k<.7&&y<=40)return o.coal; if(c>.05&&c<.068&&k<.65&&y<=24)return o.iron;
 if(c>.2&&c<.207&&k<.6&&y<=12)return o.gold; if(c>.3&&c<.3025&&k<.55&&y<=9)return o.dia;
 if(c>.4&&c<.409&&k<.6&&y<=10)return o.red; if(c>.5&&c<.505&&k<.6&&y<=15)return o.lap;
 if(c>.6&&c<.6015&&k<.5&&y<=20)return o.eme;
 const g=rn((wx>>2)+9*y,(wz>>2)-y*3);if(g<.03)return o.gra;if(g>.97)return g>.985?o.dio:o.gran;return 3}
function gen(cx,cz){if(DIM)return genN(cx,cz);const o=obs(),d=new Uint16Array(CS*H*CS);
 for(let x=0;x<CS;x++)for(let z=0;z<CS;z++){const wx=cx*CS+x,wz=cz*CS+z,h=Math.min(H-8,hgt(wx,wz)),bm=biome(wx,wz),sandy=h<=WL+1||bm=='desert';
  const top=sandy?4:bm=='snow'?o.snow:1;
  for(let y=0;y<=h;y++){let id;if(y==0)id=o.bed;else if(y<h-3)id=oreAt(o,wx,y,wz);else id=sandy?4:(y==h?top:2);
   if(y>=2&&y<h){const a=v3(wx/14,y/9,wz/14),b=v3(wx/14+100,y/9+50,wz/14+100);
    if((Math.abs(a-.5)<.045&&Math.abs(b-.5)<.045)||(y<h-2&&v3(wx/20,y/12,wz/20)>.8))id=y<=4?997:0}
   d[idx(x,y,z)]=id}
  if(h<=WL){for(let y=h+1;y<=WL;y++)d[idx(x,y,z)]=999}}
 for(let x=2;x<14;x++)for(let z=2;z<14;z++){const wx=cx*CS+x,wz=cz*CS+z,h=hgt(wx,wz),bm=biome(wx,wz),tp=d[idx(x,Math.min(H-8,h),z)];
  const dens=bm=='forest'?.94:bm=='desert'?2:bm=='snow'?.985:.985;
  if(h>WL+1&&(tp==1||tp==o.snow)&&hs(wx*3+1,wz*7+2)>dens){const th=4+(hs(wx,wz)>.5?1:0);
   for(let y=h+th-2;y<=h+th+1;y++){const r=y>h+th-1?1:2;for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if(!(r==2&&Math.abs(a)==2&&Math.abs(b)==2)&&!d[idx(x+a,y,z+b)])d[idx(x+a,y,z+b)]=6}
   for(let y=1;y<=th;y++)d[idx(x,h+y,z)]=5}}
 const e=ed[K(cx,cz)];if(e)for(const k in e)d[k]=e[k];
 return d}
function genN(cx,cz){const o=obs(),d=new Uint16Array(CS*H*CS);
 for(let x=0;x<CS;x++)for(let z=0;z<CS;z++)for(let y=0;y<H;y++){const wx=cx*CS+x,wz=cz*CS+z;let id=0;
  if(y==0||y==H-1||((y==1||y==H-2)&&rn(wx+y,wz)>.5))id=o.bed;
  else{const c=Math.abs(y-22)/22,dn=v3(wx/20,y/10,wz/20)+.45*c*c;
   if(dn>.62){id=o.nr;const r=rn(wx*3+y,wz*5-y);if(y>H-12&&r>.985)id=o.gl;else if(y<=11&&r>.8)id=o.sou;else if(r<.02)id=o.qz}
   else if(y<=8)id=997}
  d[idx(x,y,z)]=id}
 const e=ed[K(cx,cz)];if(e)for(const k in e)d[k]=e[k];return d}
function ch(cx,cz){const k=K(cx,cz);let c=chunks.get(k);if(!c){c={cx,cz,d:gen(cx,cz),m:null};chunks.set(k,c)}return c}
function get(x,y,z){if(y<0)return 3;if(y>=H)return 0;const c=ch(fl(x/CS),fl(z/CS));return c.d[idx(x-c.cx*CS,y,z-c.cz*CS)]}
function set(x,y,z,v){if(y<0||y>=H)return;const cx=fl(x/CS),cz=fl(z/CS),c=ch(cx,cz),lx=x-cx*CS,lz=z-cz*CS,i=idx(lx,y,lz);
 c.d[i]=v;(ed[K(cx,cz)]=ed[K(cx,cz)]||{})[i]=v;mesh(c);
 if(lx==0)mesh(ch(cx-1,cz));if(lx==15)mesh(ch(cx+1,cz));if(lz==0)mesh(ch(cx,cz-1));if(lz==15)mesh(ch(cx,cz+1))}
// ---- meshing
const F=[[[1,0,0],[[1,0,1],[1,0,0],[1,1,0],[1,1,1]],.8,1],[[-1,0,0],[[0,0,0],[0,0,1],[0,1,1],[0,1,0]],.8,1],
[[0,1,0],[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],1,0],[[0,-1,0],[[0,0,0],[1,0,0],[1,0,1],[0,0,1]],.5,2],
[[0,0,1],[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],.65,1],[[0,0,-1],[[1,0,0],[0,0,0],[0,1,0],[1,1,0]],.65,1]];
const UV=[[0,0],[1,0],[1,1],[0,1]];
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(75,1,.05,300),ren=new THREE.WebGLRenderer({antialias:false});
ren.setPixelRatio(Math.min(devicePixelRatio,2));document.body.prepend(ren.domElement);
function mesh(c){const P=[],C=[],U=[],I=[],ox=c.cx*CS,oz=c.cz*CS;let n=0;
 for(let x=0;x<CS;x++)for(let y=0;y<H;y++)for(let z=0;z<CS;z++){const id=c.d[idx(x,y,z)];if(!id)continue;
  for(const f of F){const nb=get(ox+x+f[0][0],y+f[0][1],oz+z+f[0][2]);
   if(nb&&!(TR.has(nb)&&nb!==id)&&!(TR.has(id)&&TR.has(nb)&&nb===id&&id===9))continue;
   if(nb===id&&TR.has(id))continue;
   const t=B[id][f[3]];
   for(let k=0;k<4;k++){const v=f[1][k];P.push(ox+x+v[0],y+v[1],oz+z+v[2]);C.push(f[2],f[2],f[2]);U.push((t+UV[k][0]*.999+.0005)/NT,UV[k][1]*.998+.001)}
   I.push(n,n+1,n+2,n,n+2,n+3);n+=4}}
 if(c.m){scene.remove(c.m);c.m.geometry.dispose()}
 const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
 ge.setAttribute('color',new THREE.Float32BufferAttribute(C,3));ge.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));ge.setIndex(I);
 c.m=new THREE.Mesh(ge,mat);scene.add(c.m)}
// ---- player
const p={x:8.5,y:0,z:8.5},v={x:0,y:0,z:0};let yaw=0,pitch=0,gnd=false,fly=false,creative=true,sel=0,locked=false;
// ---- registry: items + extra blocks
const I={},cap=s=>s[0].toUpperCase()+s.slice(1),hc=n=>{let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))%360;return h};
let nid=12;
function def(n,t,o={}){let id=Object.keys(I).find(k=>I[k].n==n);if(!id)id=nid++;I[id]=Object.assign({},o,{n,t,c:o.c?`rgb(${o.c})`:`hsl(${hc(n)},55%,52%)`});return +id}
const idOf=n=>+Object.keys(I).find(k=>I[k].n==n);
const mats={wooden:[[170,135,85],0,2,4],stone:[[125,125,125],1,4,5],iron:[[216,216,216],2,6,6],golden:[[250,220,60],0,12,4],diamond:[[80,230,220],3,8,7],netherite:[[75,65,80],3,9,8]};
function tool(m,k){const[c,tier,sp,d]=mats[m];def(cap(m)+' '+cap(k),'tool',{k,c,tier,sp,st:1,dmg:k=='sword'?d:0})}
def('Stick','mat',{c:[120,85,50]});tool('wooden','pickaxe');tool('stone','pickaxe');
for(const m in mats)for(const k of ['sword','pickaxe','axe','shovel','hoe'])tool(m,k);
const AR={leather:[[160,100,60],[1,3,2,1]],chainmail:[[150,150,160],[2,5,4,1]],iron:[[216,216,216],[2,6,5,2]],golden:[[250,220,60],[2,5,3,1]],diamond:[[80,230,220],[3,8,6,3]],netherite:[[75,65,80],[3,8,6,3]]};
for(const m in AR)['Helmet','Chestplate','Leggings','Boots'].forEach((p,i)=>def(cap(m)+' '+p,'armor',{c:AR[m][0],s:i,ar:AR[m][1][i],st:1}));
def('Turtle Shell','armor',{c:[60,160,60],s:0,ar:2,st:1});def('Wolf Armor','misc',{c:[200,200,200],st:1});
def('Trident','misc',{c:[60,170,160],dmg:9,st:1});def('Mace','misc',{c:[110,110,120],dmg:6,st:1});
'Apple:4,Golden Apple:4,Enchanted Golden Apple:4,Bread:5,Cookie:2,Pumpkin Pie:8,Carrot:3,Golden Carrot:6,Potato:1,Baked Potato:5,Poisonous Potato:2,Beetroot:1,Beetroot Soup:6,Mushroom Stew:6,Rabbit Stew:10,Suspicious Stew:6,Melon Slice:2,Sweet Berries:2,Glow Berries:2,Chorus Fruit:4,Dried Kelp:1,Raw Beef:3,Steak:8,Raw Porkchop:3,Cooked Porkchop:8,Raw Chicken:2,Cooked Chicken:6,Raw Mutton:2,Cooked Mutton:6,Raw Rabbit:3,Cooked Rabbit:5,Raw Cod:2,Cooked Cod:5,Raw Salmon:2,Cooked Salmon:6,Tropical Fish:1,Pufferfish:1,Rotten Flesh:4,Spider Eye:2'.split(',').forEach(s=>{const[n,h]=s.split(':');def(n,'food',{h:+h})});
'Coal:40:40:40,Raw Iron:200:150:120,Iron Ingot:220:220:220,Raw Copper:200:120:80,Copper Ingot:210:110:70,Raw Gold:230:190:60,Gold Ingot:250:220:60,Diamond:80:230:220,Emerald:40:200:90,Lapis Lazuli:40:70:190,Redstone Dust:200:20:20,Nether Quartz:235:230:220,Netherite Scrap:120:80:70,Netherite Ingot:75:65:80,Ancient Debris:110:75:65,Amethyst Shard:160:110:210,Flint:70:70:75,Clay Ball:160:165:180,Prismarine Shard:90:170:160,Prismarine Crystals:160:230:220,Charcoal:50:40:35,Bone:230:230:220,String:235:235:235,Feather:245:245:245'.split(',').forEach(s=>{const[n,r,g,b]=s.split(':');def(n,'mat',{c:[+r,+g,+b]})});
'Bow,Crossbow,Arrow,Spectral Arrow,Tipped Arrow,Fishing Rod,Shears,Flint and Steel,Compass,Recovery Compass,Clock,Spyglass,Brush,Lead,Name Tag,Bucket,Water Bucket,Lava Bucket,Milk Bucket,Powder Snow Bucket,Shield,Elytra,Carrot on a Stick,Warped Fungus on a Stick,Fire Charge'.split(',').forEach(n=>def(n,'misc',{st:1}));
'Water Bottle,Awkward Potion,Mundane Potion,Thick Potion,Potion of Night Vision,Potion of Invisibility,Potion of Leaping,Potion of Fire Resistance,Potion of Swiftness,Potion of Slowness,Potion of Water Breathing,Potion of Healing,Potion of Harming,Potion of Poison,Potion of Regeneration,Potion of Strength,Potion of Weakness,Potion of Slow Falling,Potion of Turtle Master,Potion of Infestation,Potion of Oozing,Potion of Weaving,Potion of Wind Charging,Splash Potion,Lingering Potion'.split(',').forEach(n=>def(n,'potion'));
const HD={1:[.6,'s'],2:[.5,'s'],3:[1.5,'p'],4:[.5,'s'],5:[2,'a'],6:[.2,''],7:[2,'a'],8:[2,'p'],9:[.3,''],10:[2,'p'],11:[2.5,'a']},ALL=[1,2,3,4,5,6,7,8,9,10,11];
function xt(n,col){const k=n.length*7,ore=/Ore/.test(n),pl=/Planks/.test(n),wl=/Wool/.test(n),br=/Brick/.test(n);
 return(x,y,r)=>{
  if(ore){const c=rn((x>>2)+k,(y>>2)+k)>.72&&r>.35;return c||rn(x*3+k,y*5)>.9?sh(col.map(v=>Math.min(255,v+40)),r,30):sh([125,125,125],r,45)}
  if(pl){const l=y%4==3,sm=(x+((y>>2)%2)*8)%16==0;return sh(col.map(v=>v*(l||sm?.7:1)),rn(x>>3,y>>2)*.6+r*.4,28)}
  if(wl)return sh(col,(x+y)%2?r:1-r,22);
  if(br)return (y%4==3||(x+((y>>2)%2)*4)%8==7)?sh(col.map(v=>v*.75),r,10):sh(col,r,30);
  return sh(col,(rn(x>>1,(y>>1)+k)+r)/2,44)}}
const mxs=id=>I[id]&&I[id].st?1:64;
tile(79,(x,y,r)=>[40+r*20|0,90+r*20|0,200,.65]);B[999]=[79,79,79,'Water'];TR.add(999);
let bi=1000,ti=17;
'Granite:150:100:85,Diorite:190:190:190,Andesite:135:135:135,Deepslate:70:70:78,Bedrock:60:60:60,Gravel:140:135:135,Red Sand:190:100:40,Clay:160:165:180,Calcite:225:225:220,Tuff:110:110:100,Dripstone Block:130:100:85,Obsidian:20:15:35,Crying Obsidian:60:20:110,Moss Block:80:120:40,Snow Block:245:250:250,Spruce Planks:110:80:45,Birch Planks:200:180:120,Jungle Planks:160:110:75,Acacia Planks:170:90:50,Dark Oak Planks:65:45:25,Mangrove Planks:120:50:50,Cherry Planks:230:170:175,Bamboo Planks:210:190:90,Crimson Planks:120:40:70,Warped Planks:40:110:110,White Wool:240:240:240,Black Wool:25:25:30,Concrete:150:150:155,Terracotta:150:90:70,Stone Bricks:120:120:120,Quartz Block:235:230:222,Glowstone:250:200:100,Sea Lantern:190:230:220,Prismarine:90:160:150,Bookshelf:140:100:60,TNT:200:40:30,Hay Bale:210:170:40,Redstone Block:170:20:10,Netherrack:110:50:50,End Stone:220:220:160,Coal Ore:100:100:100,Iron Ore:160:130:110,Gold Ore:190:170:80,Diamond Ore:100:170:170,Emerald Ore:100:160:110,Redstone Ore:150:80:80,Lapis Ore:70:90:150,Furnace:110:110:110,Chest:150:100:40,Barrel:120:80:40,Nether Quartz Ore:230:225:215,Soul Sand:90:70:55,Nether Brick:60:25:30'.split(',').forEach(s=>{const[n,r,g,b]=s.split(':'),col=[+r,+g,+b],t=ti++;tile(t,xt(n,col));B[bi]=[t,t,t,n];if(n=='Bedrock')HD[bi]=[1e9,'p'];ALL.push(bi++)});
Object.keys(I).forEach(k=>ALL.push(+k));tex.needsUpdate=true;
{const hd=(n,h,t,tier)=>{HD[bidn(n)]=[h,t,tier||0]};
 hd('Coal Ore',3,'p',0);hd('Iron Ore',3,'p',1);hd('Lapis Ore',3,'p',1);hd('Gold Ore',3,'p',2);hd('Diamond Ore',3.5,'p',2);hd('Redstone Ore',3,'p',2);hd('Emerald Ore',3.5,'p',2);
 hd('Obsidian',25,'p',3);hd('Netherrack',.6,'p');hd('Nether Quartz Ore',2,'p');hd('Soul Sand',.5,'s');hd('Glowstone',.5,'');hd('Gravel',.6,'s');hd('Furnace',3.5,'p');hd('Chest',2.5,'a');hd('Barrel',2.5,'a');hd('Nether Brick',2,'p');
 HD[8]=[2,'p'];HD[3]=[1.5,'p']}
const nameOf=id=>B[id]?B[id][3]:I[id].n;
const tip=id=>{const o=I[id];return !o?nameOf(id):o.n+(o.dmg?` · zarba ${o.dmg}`:'')+(o.t=='armor'?` · bron ${o.ar}`:'')+(o.t=='food'?` · ochlik +${o.h}`:'')+(o.k?` · daraja ${o.tier}`:'')};
let hp=20,food=20,sat=5,tf=0,th=0,fy=0,pq='',mdown=false,prog=0,mk='';const arm=new Array(4).fill(null);
try{const a=JSON.parse(localStorage.getItem('kd_arm'));if(a)arm.splice(0,4,...a)}catch(e){}
addEventListener('mouseup',e=>{if(e.button==0)mdown=false});
const armorPts=()=>arm.reduce((a,s)=>a+(s&&I[s.id]?I[s.id].ar||0:0),0);
const stEl=document.getElementById('st');
function stats(){stEl.textContent=creative?'':`${'❤️'.repeat(Math.ceil(hp/2))} ${'🍗'.repeat(Math.ceil(food/2))}${armorPts()?' 🛡'+armorPts():''}`}
function die(){if(DIM)setDim(0);hp=20;food=20;sat=5;p.x=8.5;p.z=8.5;let y=H-1;while(y>0&&!get(8,y,8))y--;p.y=y+2;v.y=0;fy=p.y}
function hurt(d){hp-=Math.ceil(d*(1-Math.min(20,armorPts())/25));if(hp<=0)die()}
function mineTime(id){const h=HD[id]||[1.5,'p'],s=inv[sel],t=s&&I[s.id],ok=t&&t.k=={s:'shovel',a:'axe',p:'pickaxe'}[h[1]];return h[0]*((h[1]=='p'&&!ok)?5:1.5)/(ok?t.sp:1)}
function canDrop(id){const h=HD[id]||[1.5,'p'];if(h[1]!='p')return true;const s=inv[sel],t=s&&I[s.id];return !!(t&&t.k=='pickaxe'&&t.tier>=(h[2]||0))}
const anyId=n=>{const a=Object.keys(I).find(k=>I[k].n==n);return a?+a:bidn(n)};
const DRP={'Stone':['Cobblestone',1],'Grass':['Dirt',1],'Coal Ore':['Coal',1],'Iron Ore':['Raw Iron',1],'Gold Ore':['Raw Gold',1],'Diamond Ore':['Diamond',1],'Emerald Ore':['Emerald',1],'Lapis Ore':['Lapis Lazuli',4],'Redstone Ore':['Redstone Dust',4],'Nether Quartz Ore':['Nether Quartz',1],'Glass':null,'Leaves':null,'Nether Portal':null};
function dropOf(id){const n=nameOf(id);if(n=='Leaves'){const r=Math.random();return r<.06?[anyId('Apple'),1]:r<.16?[anyId('Stick'),1]:null}
 if(n=='Gravel'&&Math.random()<.12)return[anyId('Flint'),1];if(n=='Glowstone')return[id,1];
 if(n in DRP){const d=DRP[n];return d?[anyId(d[0]),d[1]]:null}return[id,1]}
function useItem(r){const s=inv[sel],o=s&&I[s.id];if(!o)return false;if(r&&get(r.x,r.y,r.z)==11&&!keys.ShiftLeft)return false;
 if(o.t=='armor'){const t=arm[o.s];arm[o.s]={id:s.id,n:1};if(t)add(t.id,1);if(--s.n<=0)inv[sel]=null;hud();return true}
 if(o.t=='food'&&(food<20||/Golden Apple/.test(o.n))){food=Math.min(20,food+o.h);sat=Math.min(food,sat+o.h*.6);if(/Golden Apple/.test(o.n))hp=Math.min(20,hp+4);if(!creative&&--s.n<=0)inv[sel]=null;hud();return true}
 return false}
let inv=new Array(36).fill(null),invOpen=false,invMode=2,cur=null;const cgrid=new Array(9).fill(null);
try{const s=JSON.parse(localStorage.getItem('kd_inv'));if(s)inv=s}catch(e){}
if(!inv.some(Boolean))for(let i=0;i<9;i++)inv[i]={id:i+1,n:64};
// recipes: shaped, cropped to bounding box
const RC=[],R=(rows,m,out,n)=>RC.push({p:rows.map(r=>[...r].map(c=>m[c]||0)),out,n});
R(['L'],{L:5},7,4);R(['P','P'],{P:7},12,4);R(['PP','PP'],{P:7},11,1);
R(['PPP',' S ',' S '],{P:7,S:12},13,1);R(['CCC',' S ',' S '],{C:8,S:12},14,1);
R(['PP','PP'],{P:9},10,1);
function match(g,n){let r0=n,r1=-1,c0=n,c1=-1;for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(g[r*n+c]){r0=Math.min(r0,r);r1=Math.max(r1,r);c0=Math.min(c0,c);c1=Math.max(c1,c)}
 if(r1<0)return null;for(const q of RC){if(q.p.length!=r1-r0+1||q.p[0].length!=c1-c0+1)continue;
  if(q.p.every((row,r)=>row.every((id,c)=>(g[(r+r0)*n+c+c0]||0)==id)))return q}return null}
function mvTo(s,lo,hi){let n=s.n;for(let k=0;k<2;k++)for(let i=lo;i<hi&&n>0;i++){const t=inv[i];if(k==0&&t&&t.id==s.id&&t.n<mxs(t.id)){const m=Math.min(mxs(t.id)-t.n,n);t.n+=m;n-=m}else if(k==1&&!t){inv[i]={id:s.id,n:Math.min(mxs(s.id),n)};n-=inv[i].n}}return n}
const mm={wooden:7,stone:8,iron:idOf('Iron Ingot'),golden:idOf('Gold Ingot'),diamond:idOf('Diamond')};
const TP={sword:['M','M','S'],pickaxe:['MMM',' S ',' S '],axe:['MM','MS',' S'],shovel:['M','S','S'],hoe:['MM',' S',' S']};
const AP={Helmet:['MMM','M M'],Chestplate:['M M','MMM','MMM'],Leggings:['MMM','M M','M M'],Boots:['M M','M M']};
for(const m in mm){for(const k in TP)R(TP[k],{M:mm[m],S:12},idOf(cap(m)+' '+cap(k)),1);if(m!='wooden'&&m!='stone')for(const k in AP)R(AP[k],{M:mm[m]},idOf(cap(m)+' '+k),1)}
const FUR={};try{Object.assign(FUR,JSON.parse(localStorage.getItem('kd_fur')||'{}'))}catch(e){}let curFur=null;
const furOf=k=>FUR[k]||(FUR[k]={s:[null,null,null],t:0,b:0,bm:1});
const SM={},FU={};{const sm=(a,b,n)=>{const x=anyId(a),y=anyId(b);if(x&&y)SM[x]=[y,n||1]};
 sm('Raw Iron','Iron Ingot');sm('Raw Gold','Gold Ingot');sm('Raw Copper','Copper Ingot');sm('Sand','Glass');sm('Cobblestone','Stone');sm('Log','Charcoal');sm('Ancient Debris','Netherite Scrap');sm('Clay Ball','Brick');
 sm('Raw Beef','Steak');sm('Raw Porkchop','Cooked Porkchop');sm('Raw Chicken','Cooked Chicken');sm('Raw Mutton','Cooked Mutton');sm('Raw Rabbit','Cooked Rabbit');sm('Raw Cod','Cooked Cod');sm('Raw Salmon','Cooked Salmon');sm('Potato','Baked Potato');
 const fu=(n,t)=>{const i=anyId(n);if(i)FU[i]=t};fu('Coal',80);fu('Charcoal',80);fu('Log',15);fu('Planks',15);fu('Stick',5);fu('Crafting Table',15)}
const add=(id,n)=>mvTo({id,n},0,36),room=(id,n)=>inv.reduce((a,t)=>a+(!t?64:t.id==id?64-t.n:0),0)>=n;
{const IR=anyId('Iron Ingot'),FL=anyId('Flint'),STR=anyId('String'),FE=anyId('Feather'),CO=anyId('Cobblestone');
 R(['CCC','C C','CCC'],{C:CO},anyId('Furnace'),1);R(['PPP','P P','PPP'],{P:7},anyId('Chest'),1);R(['SS','SS'],{S:3},anyId('Stone Bricks'),4);
 R(['I I',' I '],{I:IR},anyId('Bucket'),1);R([' I','I '],{I:IR},anyId('Shears'),1);R(['I','F'],{I:IR,F:FL},anyId('Flint and Steel'),1);
 R(['PIP','PPP',' P '],{P:7,I:IR},anyId('Shield'),1);R([' SX','S X',' SX'],{S:12,X:STR},anyId('Bow'),1);R(['F','S','E'],{F:FL,S:12,E:FE},anyId('Arrow'),4);
 R(['XX','XX'],{X:STR},anyId('White Wool'),1);R(['PP','PP'],{P:anyId('Clay Ball')},bidn('Nether Brick')?10:10,1)}
const ui=document.getElementById('inv'),cu=document.getElementById('cur');
function fx(x){const d=x.getImageData(0,0,16,16).data,A=(a,b)=>a>=0&&b>=0&&a<16&&b<16&&d[(b*16+a)*4+3]>100,o=new Uint8ClampedArray(d.length);
 for(let b=0;b<16;b++)for(let a=0;a<16;a++){const i=(b*16+a)*4;
  if(A(a,b)){let k=(rn(a,b)-.5)*16;if(!A(a,b-1)||!A(a-1,b))k+=38;if(!A(a,b+1)||!A(a+1,b))k-=38;
   o[i]=d[i]+k;o[i+1]=d[i+1]+k;o[i+2]=d[i+2]+k;o[i+3]=255}
  else if(A(a-1,b)||A(a+1,b)||A(a,b-1)||A(a,b+1)){o[i]=22;o[i+1]=22;o[i+2]=30;o[i+3]=255}}
 x.putImageData(new ImageData(o,16,16),0,0)}
function ic(id){const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');
 if(B[id]){x.drawImage(ac,B[id][0]*T,0,T,T,0,0,T,T);return c}
 const o=I[id],f=(col,a,b,w,h)=>{x.fillStyle=col;x.fillRect(a,b,w,h)},hd='#7a5230',nm=o.n,gd='#c9a227';
 const dg=(col,x0,y0,n,sx,sy,w)=>{for(let i=0;i<n;i++)f(col,x0+i*sx,y0+i*sy,w||1,1)};
 const poly=(col,pts)=>{x.fillStyle=col;x.beginPath();pts.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.fill()};
 const dot=(col,cx,cy,r)=>{x.fillStyle=col;x.beginPath();x.arc(cx,cy,r,0,7);x.fill()};
 if(o.t=='tool'){const k=o.k;
  if(k=='sword'){dg(o.c,13,1,10,-1,1,2);dg(gd,2,9,5,1,1);dg(hd,3,12,2,-1,1);f(gd,1,14,1,1)}
  else{dg(hd,2,13,10,1,-1,2);
   if(k=='pickaxe')for(let t=0;t<10;t++)f(o.c,6+t,2+Math.round(Math.pow((t-4.5)/4.5,2)*3),1,2);
   else if(k=='axe'){f(o.c,9,2,5,4);f(o.c,8,4,2,4)}
   else if(k=='shovel'){f(o.c,11,1,3,5);f(o.c,12,0,1,1)}
   else{f(o.c,7,2,7,2);f(o.c,7,2,2,4)}}}
 else if(o.t=='armor'){f(o.c,0,0,0,0);
  if(o.s==0){f(o.c,3,4,10,7);f(o.c,4,3,8,1);x.clearRect(5,9,6,3)}
  else if(o.s==1){f(o.c,2,2,12,12);x.clearRect(5,2,6,2)}
  else if(o.s==2){f(o.c,3,2,10,4);f(o.c,3,6,4,8);f(o.c,9,6,4,8)}
  else{f(o.c,2,8,5,5);f(o.c,9,8,5,5);f(o.c,3,5,3,3);f(o.c,10,5,3,3)}}
 else if(o.t=='food'){
  if(/Raw|Cooked|Steak|Porkchop|Mutton|Chicken|Rabbit|Cod|Salmon|Fish/.test(nm)){x.fillStyle=o.c;x.beginPath();x.ellipse(7,9,6,4.5,-.5,0,7);x.fill();f('#eee',12,11,2,2)}
  else{dot(o.c,8,9,5.2);f('#5a3a1a',8,2,1,3);f('#4caf50',9,2,3,2)}}
 else if(o.t=='potion'){f('#b8c4cc',6,1,4,3);f('#8a5a2b',6,0,4,1);dot(o.c,8,10,5)}
 else if(o.t=='mat'){
  if(nm=='Stick')dg(hd,3,13,10,1,-1,2);
  else if(/Ingot/.test(nm))poly(o.c,[[1,12],[4,6],[15,6],[12,12]]);
  else if(/Raw|Debris|Scrap|Coal|Flint|Clay|Dust/.test(nm))dot(o.c,8,9,5);
  else poly(o.c,[[8,1],[13,7],[8,14],[3,7]])}
 else if(nm=='Arrow'||/Arrow/.test(nm)){dg('#8a6a3a',2,13,10,1,-1);f('#ccc',11,2,3,3);f('#eee',1,12,3,3)}
 else if(/Bucket/.test(nm)){poly('#b8bcc4',[[3,4],[13,4],[11,14],[5,14]]);if(/Water|Lava|Milk|Powder/.test(nm))f(/Lava/.test(nm)?'#e8661a':/Milk|Powder/.test(nm)?'#f4f4f4':'#3a6fe0',4,5,8,2)}
 else{poly(o.c,[[2,2],[14,2],[14,10],[8,15],[2,10]])}
 fx(x);return c}
function cell(it,fn){const d=document.createElement('div');d.className='sl';if(it){d.appendChild(ic(it.id));d.title=tip(it.id);if(it.n>1){const b=document.createElement('b');b.textContent=it.n;d.appendChild(b)}}d.onmousedown=fn;return d}
function click(a,i,e){e.preventDefault();const s=a[i];
 if(curFur&&a===curFur.s&&i==2&&cur)return;
 if(a===arm){if(e.button==2)e={button:0,preventDefault(){}};if(cur&&!(I[cur.id]&&I[cur.id].t=='armor'&&I[cur.id].s==i))return}
 if(a===inv&&e.shiftKey&&s&&I[s.id]&&I[s.id].t=='armor'){const k=I[s.id].s,t=arm[k];arm[k]={id:s.id,n:1};inv[i]=null;if(t)add(t.id,1);draw();hud();return}
 if(e.shiftKey&&s){s.n=a===inv?mvTo(s,i<9?9:0,i<9?36:9):add(s.id,s.n);if(s.n<=0)a[i]=null}
 else if(e.button==2){if(!cur&&s){const h=Math.ceil(s.n/2);cur={id:s.id,n:h};s.n-=h;if(s.n<=0)a[i]=null}
  else if(cur&&(!s||s.id==cur.id&&s.n<64)){if(!s)a[i]={id:cur.id,n:0};a[i].n++;if(--cur.n<=0)cur=null}}
 else if(!cur){cur=s;a[i]=null}else if(!s){a[i]=cur;cur=null}
 else if(s.id==cur.id){const m=Math.min(mxs(s.id)-s.n,cur.n);s.n+=m;cur.n-=m;if(cur.n<=0)cur=null}
 else{a[i]=cur;cur=s}
 draw();hud()}
const eat=()=>{for(let i=0;i<9;i++){const s=cgrid[i];if(s&&--s.n<=0)cgrid[i]=null}},cids=()=>cgrid.map(s=>s?s.id:0);
function take(q,e){e.preventDefault();if(!q)return;
 if(e.shiftKey){let k=0;while(q&&k++<64&&room(q.out,q.n)){add(q.out,q.n);eat();q=match(cids(),invMode)}}
 else if(!cur||(cur.id==q.out&&cur.n+q.n<=64)){if(cur)cur.n+=q.n;else cur={id:q.out,n:q.n};eat()}
 draw();hud()}
function draw(){const n=invMode==4?2:invMode,box=document.createElement('div');box.className='bx';
 const t=document.createElement('div');t.className='t';t.textContent=invMode==4?'Pech':n==3?'Crafting Table (3×3)':'Inventar (2×2)';
 const cr=document.createElement('div'),gd=document.createElement('div');cr.className='cr';gd.className='gd';gd.style.gridTemplateColumns=`repeat(${n},auto)`;
 for(let r=0;r<n;r++)for(let c=0;c<n;c++){const i=r*n+c;gd.appendChild(cell(cgrid[i],e=>click(cgrid,i,e)))}
 const q=match(cids(),n),ar=document.createElement('span');ar.textContent='➜';
 cr.append(gd,ar,cell(q?{id:q.out,n:q.n}:null,e=>take(q,e)));
 const ar2=document.createElement('div');ar2.className='ar';const al=document.createElement('div');al.className='t';al.textContent='Bron kiyish joyi'+(armorPts()?' · 🛡 '+armorPts():'');ar2.appendChild(al);
 const arow=document.createElement('div');arow.className='gd';arow.style.gridTemplateColumns='repeat(4,auto)';
 const AN=['Dubulg‘a','Ko‘krak sovuti','Shim','Etik'],AI=['⛑','👕','👖','👢'];
 arm.forEach((s,i)=>{const c=cell(s,e=>click(arm,i,e));if(!s){c.classList.add('ph');c.dataset.ph=AI[i];c.title=AN[i]}arow.appendChild(c)});ar2.appendChild(arow);
 const mg=document.createElement('div');mg.className='gd';mg.style.gridTemplateColumns='repeat(9,auto)';
 for(let i=9;i<36;i++)mg.appendChild(cell(inv[i],e=>click(inv,i,e)));
 const hg=mg.cloneNode(false);hg.style.marginTop='8px';for(let i=0;i<9;i++)hg.appendChild(cell(inv[i],e=>click(inv,i,e)));
 box.append(t,ar2,invMode==4?furnacePanel():cr,mg,hg);
 if(creative){const p=document.createElement('div');p.className='gd';p.style.cssText='grid-template-columns:repeat(7,auto);margin-top:8px';
  const inp=document.createElement('input');inp.placeholder='Qidirish...';inp.value=pq;inp.style.cssText='display:block;margin:8px 0 4px;width:100%;box-sizing:border-box';p.style.cssText='grid-template-columns:repeat(9,auto);max-height:150px;overflow:auto;margin-top:0';
  const fill=()=>{p.innerHTML='';for(const id of ALL){if(pq&&!nameOf(id).toLowerCase().includes(pq))continue;p.appendChild(cell({id,n:1},e=>{e.preventDefault();cur={id,n:I[id]&&I[id].st?1:64};draw()}))}};inp.oninput=()=>{pq=inp.value.toLowerCase();fill()};fill();box.append(inp,p)}
 ui.innerHTML='';ui.appendChild(box);cu.innerHTML='';
 if(cur){cu.appendChild(ic(cur.id));if(cur.n>1){const b=document.createElement('b');b.textContent=cur.n;cu.appendChild(b)}}}
function furnacePanel(){const f=curFur,w=document.createElement('div');w.className='cr';w.style.fontSize='22px';
 const col=document.createElement('div');col.style.cssText='display:flex;flex-direction:column;gap:6px';
 const c0=cell(f.s[0],e=>click(f.s,0,e)),c1=cell(f.s[1],e=>click(f.s,1,e));if(!f.s[0])c0.title='Eritiladigan narsa';if(!f.s[1])c1.title='Yoqilg‘i (ko‘mir, taxta...)';col.append(c0,c1);
 const pr=document.createElement('span');pr.id='fpr';pr.textContent='0% ➜';w.append(col,pr,cell(f.s[2],e=>click(f.s,2,e)));return w}
function openInv(m){invMode=m;invOpen=true;ui.style.display='flex';document.exitPointerLock();draw()}
function closeInv(re){curFur=null;for(const a of [cgrid]){a.forEach((s,i)=>{if(s){add(s.id,s.n);a[i]=null}})}
 if(cur){add(cur.id,cur.n);cur=null}invOpen=false;ui.style.display='none';cu.innerHTML='';hud();
 if(re)cv.requestPointerLock();else ov.style.display='flex'}
addEventListener('mousemove',e=>{cu.style.left=e.clientX-20+'px';cu.style.top=e.clientY-20+'px'});
const bar=document.getElementById('hb');
function hud(){bar.innerHTML='';for(let i=0;i<9;i++){const d=cell(inv[i],null);d.classList.toggle('on',i==sel);bar.appendChild(d)}}
function spawn(){for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)mesh(ch(a,b));let y=H-1;while(y>0&&!get(8,y,8))y--;p.x=8.5;p.z=8.5;p.y=y+2}
const solid=(x,y,z)=>{const b=get(x,y,z);return b>0&&b!=999&&b!=997&&b!=998};const liq=b=>b==999||b==997;
function hit(){const e=.001;for(let x=fl(p.x-.3);x<=fl(p.x+.3-e);x++)for(let y=fl(p.y);y<=fl(p.y+1.8-e);y++)for(let z=fl(p.z-.3);z<=fl(p.z+.3-e);z++)if(solid(x,y,z))return true;return false}
function mv(a,d){if(!d)return;p[a]+=d;if(hit()){p[a]-=d;if(a=='y'&&d<0)gnd=true;v[a]=0}}
// ---- input
const keys={};const ov=document.getElementById('ov'),cv=ren.domElement;
ov.onclick=()=>cv.requestPointerLock();
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===cv;ov.style.display=(locked||invOpen)?'none':'flex'});
addEventListener('mousemove',e=>{if(!locked)return;yaw-=e.movementX*.0022;pitch=Math.max(-1.55,Math.min(1.55,pitch-e.movementY*.0022))});
addEventListener('keydown',e=>{keys[e.code]=true;
 if(/^Digit[1-9]$/.test(e.code)){sel=+e.code[5]-1;hud()}
 if(e.code=='KeyE'&&(locked||invOpen)){invOpen?closeInv(1):openInv(2);return}
 if(e.code=='Escape'&&invOpen)closeInv(0);
 if(e.code=='KeyG'){creative=!creative;if(!creative)fly=false;hud()}
 if(e.code=='KeyF'&&creative)fly=!fly;
 if(e.code=='KeyR'){localStorage.removeItem('kd_seed');localStorage.removeItem('kd_ed');localStorage.removeItem('kd_inv');localStorage.removeItem('kd_fur');location.reload()}
 if(e.code=='Space'||e.code=='ControlLeft')e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=false);
addEventListener('wheel',e=>{sel=(sel+(e.deltaY>0?1:8))%9;hud()});
addEventListener('contextmenu',e=>e.preventDefault());
function ray(){const dx=-Math.sin(yaw)*Math.cos(pitch),dy=Math.sin(pitch),dz=-Math.cos(yaw)*Math.cos(pitch);
 let px=p.x,py=p.y+1.62,pz=p.z,last=null;
 for(let t=0;t<6;t+=.04){const x=fl(px+dx*t),y=fl(py+dy*t),z=fl(pz+dz*t);
  {const g=get(x,y,z);if(g&&!liq(g)&&g!=998)return{x,y,z,prev:last}}last=[x,y,z]}return null}
addEventListener('mousedown',e=>{if(!locked)return;const r=ray();if(e.button==2&&useItem(r))return;if(e.button==0&&typeof attack=='function'&&attack())return;if(!r)return;
 if(e.button==0){mdown=true;prog=0}
 else if(e.button==2){if(get(r.x,r.y,r.z)==11&&!keys.ShiftLeft){openInv(3);return}
  if(get(r.x,r.y,r.z)==bidn('Furnace')&&!keys.ShiftLeft){curFur=furOf(DIM+':'+r.x+','+r.y+','+r.z);openInv(4);return}
  {const q=inv[sel];if(q&&I[q.id]&&I[q.id].n=='Flint and Steel'&&lightPortal(r))return}
  const s=inv[sel];if(!r.prev||!s||!B[s.id])return;const [x,y,z]=r.prev;set(x,y,z,s.id);
  if(hit()){set(x,y,z,0)}else if(!creative){if(--s.n<=0)inv[sel]=null;hud()}}});
// selection box
const sb=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004,1.004,1.004)),new THREE.LineBasicMaterial({color:0}));scene.add(sb);
// ---- loop
function load(){const pc=fl(p.x/CS),pz=fl(p.z/CS);let best=null,bd=1e9;
 for(let a=-RD;a<=RD;a++)for(let b=-RD;b<=RD;b++){const d=a*a+b*b;if(d>RD*RD+1)continue;const c=chunks.get(K(pc+a,pz+b));if(!c||!c.m){if(d<bd){bd=d;best=[pc+a,pz+b]}}}
 if(best)mesh(ch(best[0],best[1]));
 for(const[k,c]of chunks)if(Math.abs(c.cx-pc)>RD+1||Math.abs(c.cz-pz)>RD+1){if(c.m){scene.remove(c.m);c.m.geometry.dispose()}chunks.delete(k)}}
let tm=0.25,last=performance.now(),fr=0,sv=0,lvT=0,ptT=0,pcl=false;
function clockInfo(){const h=(tm*24+6)%24,hh=Math.floor(h),mm=Math.floor((h-hh)*60),pad=n=>String(n).padStart(2,'0'),DAY=600;
 const night=tm>=.5&&tm<1,left=Math.round((night?1-tm:(.5-tm))*DAY),ph=night?'🌙 Tun':(tm>.4?'🌇 Kech':'☀️ Kun');
 return `${pad(hh)}:${pad(mm)} ${ph} · ${night?'tong otishiga':'tun tushishiga'} ${Math.floor(left/60)}:${pad(left%60)}`}
function size(){ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',size);size();
const sky=new THREE.Color(),day=new THREE.Color(0x87ceeb),night=new THREE.Color(0x06081a),dusk=new THREE.Color(0xff7a3c);
function loop(){requestAnimationFrame(loop);const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;
 if(locked){tm=(tm+dt/600)%1;
  const f=(keys.KeyW?1:0)-(keys.KeyS?1:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0);
  const sp=fly?11:(keys.ControlLeft?5.6:keys.ShiftLeft?1.8:4.3);
  let mx=(-Math.sin(yaw)*f+Math.cos(yaw)*s),mz=(-Math.cos(yaw)*f-Math.sin(yaw)*s);const l=Math.hypot(mx,mz)||1;
  v.x=mx/l*sp*(f||s?1:0);v.z=mz/l*sp*(f||s?1:0);
  if(fly){v.y=(keys.Space?8:0)-(keys.ShiftLeft?8:0)}
  else{if(liq(get(fl(p.x),fl(p.y+.4),fl(p.z)))){v.y=Math.max(v.y-6*dt,-2.5);if(keys.Space)v.y=3;v.x*=.6;v.z*=.6}else{v.y-=28*dt;if(keys.Space&&gnd)v.y=8.6}}
  gnd=false;mv('x',v.x*dt);mv('z',v.z*dt);mv('y',v.y*dt);
  if(fly&&gnd)fly=false;
  if(p.y<-20){p.y=H;v.y=0}}
 if(locked&&!creative){tf+=dt*(keys.ControlLeft&&keys.KeyW?2:1);if(tf>30){tf=0;if(sat>0)sat--;else if(food>0)food--}
  th+=dt;if(th>=4){th=0;if(food>=18&&hp<20)hp++;else if(food<=0&&hp>1)hp--}}
 if(gnd){const dm=Math.floor(fy-p.y-3);if(dm>0&&!creative&&!fly&&locked)hurt(dm);fy=p.y}else fy=liq(get(fl(p.x),fl(p.y+.4),fl(p.z)))?p.y:Math.max(fy,p.y);
 if(locked&&mdown){const r=ray();if(!r){prog=0;mk=''}else{const k=r.x+','+r.y+','+r.z;if(k!=mk){mk=k;prog=0}
  const id=get(r.x,r.y,r.z),need=creative?.2:mineTime(id);prog+=dt;
  if(prog>=need){prog=0;set(r.x,r.y,r.z,0);if(id==bidn('Furnace')){const fk=DIM+':'+r.x+','+r.y+','+r.z,f=FUR[fk];if(f){f.s.forEach(q=>q&&add(q.id,q.n));delete FUR[fk]}}
  if(!creative&&canDrop(id)){const dp=dropOf(id);if(dp&&dp[0]){add(dp[0],dp[1]);hud()}}}}}else prog=0;
 {const fb=get(fl(p.x),fl(p.y+.4),fl(p.z));
  if(fb==997&&!creative&&locked){lvT+=dt;if(lvT>.5){lvT=0;hurt(4)}}
  if(locked&&(fb==998||get(fl(p.x),fl(p.y+1.4),fl(p.z))==998)){ptT+=dt;if(ptT>(creative?.4:2.5)&&!pcl){pcl=true;ptT=0;goDim(DIM?0:1)}}else{ptT=0;pcl=false}}
 for(const k in FUR){const f=FUR[k],s0=f.s[0],sm=s0&&SM[s0.id],o2=f.s[2];if(f.b>0)f.b-=dt;
  const can=sm&&(!o2||(o2.id==sm[0]&&o2.n+sm[1]<=64));
  if(can&&f.b<=0&&f.s[1]&&FU[f.s[1].id]){f.bm=f.b=FU[f.s[1].id];if(--f.s[1].n<=0)f.s[1]=null}
  if(can&&f.b>0){f.t+=dt;if(f.t>=10){f.t=0;if(--s0.n<=0)f.s[0]=null;if(o2)o2.n+=sm[1];else f.s[2]={id:sm[0],n:sm[1]}}}else f.t=Math.max(0,f.t-dt)}
 {const pe=document.getElementById('fpr');if(pe&&curFur&&invOpen&&invMode==4)pe.textContent=(curFur.b>0?'🔥 ':'')+Math.round(curFur.t/10*100)+'% ➜'}
 load();
 let dl=Math.max(.08,Math.min(1,Math.sin(tm*Math.PI*2)*1.6+.5));if(DIM)dl=.5;
 sky.copy(night).lerp(day,dl);if(DIM)sky.setHex(0x2a0808);if(!DIM){const ds=Math.min(Math.abs(tm-.5),Math.min(tm,1-tm)),ss=Math.max(0,1-ds/.07);if(ss>0)sky.lerp(dusk,ss*.55)}scene.background=sky;scene.fog=new THREE.Fog(sky,RD*CS*.55,RD*CS*.95);
 mat.color.setScalar(.3+.7*dl);
 cam.position.set(p.x,p.y+1.62,p.z);cam.rotation.set(pitch,yaw,0,'YXZ');
 const r=locked?ray():null;sb.visible=!!r;if(r)sb.position.set(r.x+.5,r.y+.5,r.z+.5);
 if(typeof tick=='function')tick(dt);
 ren.render(scene,cam);
 if(fr%10==0)stats();if(++fr%10==0)document.getElementById('info').textContent=`${creative?'Creative':'Survival'}${fly?' (uchish)':''}  ${Math.round(1/dt)} FPS\nXYZ ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.z.toFixed(1)}\nBlok: ${inv[sel]?nameOf(inv[sel].id):'-'}  Seed: ${seed}  ${DIM?'Nether':'Biom: '+biome(fl(p.x),fl(p.z))}  Vaqt: ${clockInfo()}`;
 if(now-sv>5000){sv=now;try{localStorage.setItem('kd_seed',seed);localStorage.setItem('kd_ed',JSON.stringify(ed));localStorage.setItem('kd_inv',JSON.stringify(inv));localStorage.setItem('kd_arm',JSON.stringify(arm));localStorage.setItem('kd_fur',JSON.stringify(FUR))}catch(e){}}}
// ---- dimensiyalar va portal
function sq(x,y,z,v,hs){if(y<0||y>=H)return;const cx=fl(x/CS),cz=fl(z/CS),c=ch(cx,cz),i=idx(x-cx*CS,y,z-cz*CS);c.d[i]=v;(ed[K(cx,cz)]=ed[K(cx,cz)]||{})[i]=v;hs.add(c)}
function flush(hs){const all=new Set(hs);hs.forEach(c=>{for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=chunks.get(K(c.cx+dx,c.cz+dz));if(n)all.add(n)}});all.forEach(c=>mesh(c))}
function setDim(d){DIM=d;chunks.forEach(c=>{if(c.m){scene.remove(c.m);c.m.geometry.dispose()}});chunks.clear();while(mobs.length)rm(0);if(typeof arrows!='undefined')while(arrows.length){scene.remove(arrows[0].g);arrows.shift()}}
function buildPortal(x,y,z){const o=obs(),hs=new Set(),nether=!!DIM;
 for(let a=-1;a<=4;a++)for(let c=-1;c<=4;c++){const cur=get(x+a,y-1,z+c);if(nether||!cur||cur==999||cur==997||liq(cur))sq(x+a,y-1,z+c,nether?o.nr:2,hs);
  for(let h=0;h<=4;h++)sq(x+a,y+h,z+c,0,hs)}
 for(let a=0;a<=3;a++)for(let h=-1;h<=3;h++){const edge=a==0||a==3||h==-1||h==3;sq(x+a,y+h,z,edge?o.ob:998,hs)}
 flush(hs)}
function goDim(d){const f=d?1/8:8,tx=fl(p.x*f),tz=fl(p.z*f);setDim(d);
 for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)ch(fl(tx/CS)+a,fl(tz/CS)+b);
 let y;if(d){y=-1;for(let yy=10;yy<=H-6;yy++){if(solid(tx,yy-1,tz)&&!solid(tx,yy,tz)&&!solid(tx,yy+1,tz)&&!solid(tx,yy+2,tz)){y=yy;break}}if(y<0)y=24}
 else{y=H-1;while(y>0&&(!get(tx,y,tz)||liq(get(tx,y,tz))))y--;y+=1}
 buildPortal(tx,y,tz);p.x=tx+1.5;p.z=tz+3.2;p.y=y;v.x=v.y=v.z=0;fy=p.y;yaw=0;pitch=0;pcl=true;
 if(typeof say=='function')say(d?'Nether’ga kirdingiz':'Oddiy dunyoga qaytdingiz')}
function lightPortal(r){if(!r.prev)return false;const o=obs();if(get(r.x,r.y,r.z)!=o.ob)return false;
 for(const ax of['x','z']){const start=r.prev,seen=new Map(),q=[start],key=c=>c.join(',');seen.set(key(start),start);let ok=true;
  while(q.length&&ok){const c=q.pop();for(const[dh,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=[c[0]+(ax=='x'?dh:0),c[1]+dy,c[2]+(ax=='z'?dh:0)];if(seen.has(key(n)))continue;
    const b=get(n[0],n[1],n[2]);if(b==0){if(seen.size>=40){ok=false;break}seen.set(key(n),n);q.push(n)}else if(b!=o.ob){ok=false;break}}}
  if(!ok||seen.size<6)continue;const cells=[...seen.values()],xs=cells.map(c=>c[ax=='x'?0:2]),ys=cells.map(c=>c[1]);
  const w=Math.max(...xs)-Math.min(...xs)+1,h=Math.max(...ys)-Math.min(...ys)+1;if(w*h!=cells.length||w<2||h<3)continue;
  const hs=new Set();cells.forEach(c=>sq(c[0],c[1],c[2],998,hs));flush(hs);return true}
 return false}
spawn();hud();loop();