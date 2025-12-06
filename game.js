// Multi-file platformer game.js
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// Asset paths
const images = {};
const imageFiles = {
  player: 'assets/Main Hero.png',
  tile:   'assets/tile.png',
  bg:     'assets/bg.png',
  coin:   'assets/coin.png',
  enemy:  'assets/Enemy.png'
};
for (const k in imageFiles){
  const img = new Image();
  img.src = imageFiles[k];
  img.onload = ()=>{ images[k]=img; };
  img.onerror = ()=>{ images[k]=null; };
}

function rectsIntersect(a,b){
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

const gravity = 0.7;
let win = false;
let keys = {};
let scoreEl = document.getElementById('score');
let score = 0;

const player = { x:100,y:380,w:40,h:48,vx:0,vy:0,onGround:false };
const platforms = [ {x:0,y:520,w:960,h:20}, {x:120,y:420,w:160,h:16}, {x:360,y:340,w:220,h:16}, {x:640,y:280,w:200,h:16}, {x:860,y:200,w:80,h:16} ];
let coins = [ {x:160,y:380,w:24,h:24, collected:false}, {x:420,y:300,w:24,h:24, collected:false}, {x:700,y:240,w:24,h:24, collected:false} ];
let enemies = [ {x:500,y:492,w:34,h:36,vx:1.2,left:460,right:700} ];
let camera = {x:0,y:0,w:W,h:H};

window.addEventListener('keydown', e=>{ keys[e.key] = true; if(['ArrowUp',' ','w','W'].includes(e.key)) e.preventDefault(); });
window.addEventListener('keyup', e=>{ keys[e.key]=false; });

function update(){
  if (win) return; // freeze gameplay
  const accel = 1.2;
  if (keys['ArrowLeft'] || keys['a'] || keys['A']) player.vx -= accel;
  if (keys['ArrowRight'] || keys['d'] || keys['D']) player.vx += accel;
  if ((keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' ']) && player.onGround){ player.vy = -14; player.onGround=false; }

  player.vy += gravity;
  player.x += player.vx;
  player.y += player.vy;
  player.vx *= 0.85;
  if (score >= 55) {
win = true;
}

  if (player.y > H + 200){ player.x = 100; player.y = 380; player.vx = player.vy = 0; score = Math.max(0,score-5); }

  player.onGround = false;
  for (let p of platforms){
    if (player.x + player.w > p.x && player.x < p.x + p.w){
      if (player.y + player.h > p.y && player.y < p.y + p.h){
        if (player.vy >= 0 && (player.y + player.h - player.vy) <= p.y + 4){
          player.y = p.y - player.h; player.vy = 0; player.onGround = true;
        } else if (player.vy < 0 && (player.y - player.vy) >= p.y + p.h - 4){
          player.y = p.y + p.h; player.vy = 0;
        } else {
          if (player.x < p.x) player.x = p.x - player.w; else player.x = p.x + p.w; player.vx = 0;
        }
      }
    }
    document.addEventListener('keydown', (e) => {
if (e.key.toLowerCase() === 'r') {
// reset game
score = 0;
win = false;
player.x = 50;
player.y = 50;
player.vx = 0;
player.vy = 0;
}
});
  }

  for (let c of coins){ if (!c.collected && rectsIntersect(player,{x:c.x,y:c.y,w:c.w,h:c.h})){ c.collected = true; score += 10; }}

  for (let e of enemies){ e.x += e.vx; if (e.x < e.left) e.vx = Math.abs(e.vx); if (e.x + e.w > e.right) e.vx = -Math.abs(e.vx);
    if (rectsIntersect(player,{x:e.x,y:e.y,w:e.w,h:e.h})){ if (player.vy > 0 && (player.y + player.h - player.vy) <= e.y + 6){ enemies = enemies.filter(x=>x!==e); score+=25; player.vy = -8; player.onGround=false; } else { player.x = 100; player.y = 380; player.vx=player.vy=0; score = Math.max(0,score-10); } }
  }

  camera.x += ((player.x - camera.x) - W/4) * 0.08;
  camera.y = 0;
  scoreEl.textContent = score;
}

function draw(){
  if (win) {
ctx.fillStyle = "yellow";
ctx.font = "38px Arial";
ctx.fillText("YOU WIN! Press R to Replay", 40, 200);
}
  ctx.clearRect(0,0,W,H);
  if (images.bg){ const bg = images.bg; const scale = Math.max(W/bg.width, H/bg.height); ctx.drawImage(bg, -camera.x*0.2, 0, bg.width*scale, bg.height*scale); }
  else { ctx.fillStyle = '#cdeaff'; ctx.fillRect(0,0,W,H); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(150 - (camera.x*0.2%400),80,80,36,0,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(520 - (camera.x*0.12%700),120,90,42,0,0,Math.PI*2); ctx.fill(); }

  for (let p of platforms){ const sx = p.x - camera.x; if (images.tile){ const tileW = images.tile.width; const tileH = images.tile.height; let cx = sx; while (cx < sx + p.w){ ctx.drawImage(images.tile, cx, p.y, Math.min(tileW, sx + p.w - cx), tileH); cx += tileW; } } else { ctx.fillStyle = '#6b4f2b'; ctx.fillRect(sx, p.y, p.w, p.h); ctx.strokeStyle = '#3b2a18'; ctx.strokeRect(sx, p.y, p.w, p.h); } }

  for (let c of coins){ if (c.collected) continue; const cx = c.x - camera.x; if (images.coin){ ctx.drawImage(images.coin, cx, c.y, c.w, c.h); } else { ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(cx + c.w/2, c.y + c.h/2, c.w/2, 0, Math.PI*2); ctx.fill(); ctx.strokeStyle='#a67c00'; ctx.stroke(); } }

  for (let e of enemies){ const ex = e.x - camera.x; if (images.enemy){ ctx.drawImage(images.enemy, ex, e.y, e.w, e.h); } else { ctx.fillStyle='#d33'; ctx.fillRect(ex, e.y, e.w, e.h); } }

  const px = player.x - camera.x; if (images.player){ ctx.drawImage(images.player, px, player.y, player.w, player.h); } else { ctx.fillStyle = '#2b7'; ctx.fillRect(px, player.y, player.w, player.h); ctx.fillStyle='#1d5'; ctx.fillRect(px+6, player.y+6, player.w-12, player.h-12); }
}

function loop(){ update(); draw(); requestAnimationFrame(loop); }
setTimeout(()=>{ loop(); }, 300);

canvas.addEventListener('dblclick', ()=>{ coins.forEach(c=>c.collected=false); enemies = [{x:500,y:492,w:34,h:36,vx:1.2,left:460,right:700}]; score = 0; });

// Basic touch support
let touchStartX = null;
canvas.addEventListener('touchstart', e=>{ const t = e.touches[0]; touchStartX = t.clientX; });
canvas.addEventListener('touchmove', e=>{ const t = e.touches[0]; if (!touchStartX) return; const dx = t.clientX - touchStartX; keys['ArrowLeft'] = dx < -20; keys['ArrowRight'] = dx > 20; });
canvas.addEventListener('touchend', e=>{ keys = {}; touchStartX=null; });
