const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const h = window.innerHeight;
    const w = window.innerWidth;

    canvas.width = w;
    canvas.height = h;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);


// -----------------------------
// بارگذاری فریم‌های دویدن
// -----------------------------
const playerFrames = [];
for (let i = 0; i < 5; i++) {
    const img = new Image();
    img.src = i === 0 ? 'player.png' : `player${i}.png`; 
    playerFrames.push(img);
}
// -----------------------------
// صدای گرفتن سکه
// -----------------------------
const coinSound = new Audio("coin.mp3");
coinSound.volume = 1;

// -----------------------------
// موزیک پس‌زمینه
// -----------------------------
const bgMusic = new Audio("music.mp3");
bgMusic.loop = true;      // پخش مداوم
bgMusic.volume = 0.5;     // میزان صدا

// -----------------------------
// فریم پرش
// -----------------------------
const jumpFrame = new Image();
jumpFrame.src = "playerjump.png";

let currentFrame = 0;
let frameCounter = 0;

// -----------------------------
// مشخصات بازیکن
// -----------------------------
let player = {
    x: 100,
    y: canvas.height - 120,
    width: 100,
    height: 150,
    dy: 0,
    gravity: 0.8,
    jumpForce: -18,
    grounded: true
};

// -----------------------------
// رسم بازیکن
// -----------------------------
function drawPlayer() {
    if(!player.grounded){
        ctx.drawImage(jumpFrame, player.x, player.y, player.width, player.height);
        return;
    }

    frameCounter++;
    if(frameCounter % 5 === 0){
        currentFrame = (currentFrame + 1) % playerFrames.length;
    }
    ctx.drawImage(playerFrames[currentFrame], player.x, player.y, player.width, player.height);
}
// -----------------------------
// لوگوی کنترل صدا
// -----------------------------
const soundBtn = document.createElement('img');
soundBtn.src = "sound_on.png";
Object.assign(soundBtn.style, {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: '50px',
    height: '50px',
    cursor: 'pointer',
    zIndex: 1000
});
document.body.appendChild(soundBtn);

let soundMuted = false;

soundBtn.addEventListener('click', () => {
    soundMuted = !soundMuted;

    if (soundMuted) {
        bgMusic.pause();
        soundBtn.src = "sound_off.png";   // لوگوی خط خورده
    } else {
        bgMusic.play();
        soundBtn.src = "sound_on.png";    // لوگوی عادی
    }
});

// -----------------------------
// پس‌زمینه پارالاکس
// -----------------------------
// -----------------------------
// بک‌گراندهای Wave
// -----------------------------
const backgrounds = [];

for (let i = 1; i <= 8; i++) {
    const img = new Image();
    img.src = `back${i}.jpg`;
    backgrounds.push(img);
}

let bgX = 0;
function drawBackground() {

    // هر 25 امتیاز یک Wave
    const wave = Math.floor(score / 30);

    // انتخاب تصویر بین 8 بک‌گراند
    const bgImg = backgrounds[wave % backgrounds.length];

    // حرکت پارالاکس
    bgX -= 2;
    if (bgX <= -canvas.width) bgX = 0;

    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);
}


// -----------------------------
// موانع
// -----------------------------
const obstacleImg = new Image();
obstacleImg.src = 'obstacle.png';
let obstacles = [];

// -----------------------------
// سکه‌ها
// -----------------------------
const coinImg = new Image();
coinImg.src = 'coin.png';
let coins = [];

function spawnCoin() {
    let y = canvas.height - 60 - Math.random() * 200;
    let speed = 8 + Math.floor(score/10);
    coins.push({
        x: canvas.width,
        y: y,
        width: 40,
        height: 40,
        speed: speed
    });
}

// -----------------------------
// ذرات
// -----------------------------
let particles = [];
function spawnParticles(x, y){
    for(let i=0;i<10;i++){
        particles.push({
            x, y,
            dx: (Math.random()-0.5)*4,
            dy: Math.random()*-4,
            alpha: 1
        });
    }
}
function updateParticles(){
    particles.forEach((p,i)=>{
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.2;
        p.alpha -= 0.03;
        ctx.fillStyle = `rgba(255,255,0,${p.alpha})`;
        ctx.fillRect(p.x,p.y,4,4);
        if(p.alpha <=0) particles.splice(i,1);
    });
}

// -----------------------------
// امتیاز و وضعیت بازی
// -----------------------------
let frame = 0;
let score = 0;
let gameOver = false;
let nextSpawn = 0;
let currentWave = 0;
let waveTextTimer = 2;


// -----------------------------
// دکمه شروع مجدد
// -----------------------------
let restartBtn = document.createElement('button');
restartBtn.textContent = 'شروع مجدد';
Object.assign(restartBtn.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, 60px)',
    padding: '12px 24px',
    fontSize: '18px',
    background: '#a14bd6',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'none'
    
});
document.body.appendChild(restartBtn);

restartBtn.addEventListener('click', ()=>{
    resetGame();
    restartBtn.style.display = 'none';
    menuBtn.style.display = 'none';
});
// -----------------------------
// دکمه بازگشت به منو
// -----------------------------
let menuBtn = document.createElement('button');
menuBtn.textContent = 'بازگشت به منو';

Object.assign(menuBtn.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
transform: 'translate(-50%, 120px)',
 // کنار دکمه شروع مجدد
    padding: '12px 24px',
    fontSize: '18px',
    background: '#444',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'none'
});

document.body.appendChild(menuBtn);

// رفتن به منو
menuBtn.addEventListener('click', () => {
    window.location.href = "index.html";
});

// -----------------------------
// پرش
// -----------------------------
function jumpAction(){
    if(player.grounded){
        player.dy = player.jumpForce;
        player.grounded = false;
        spawnParticles(
            player.x + player.width/2,
            player.y + player.height
        );
    }
}

document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        jumpAction();
    }
});

// -----------------------------
// دکمه لمسی پرش
// -----------------------------
const jumpBtn = document.createElement('button');
jumpBtn.textContent = "JUMP";

Object.assign(jumpBtn.style, {
    position: 'absolute',
    bottom: '30px',
    right: '30px',
    width: '100px',
    height: '100px',
    fontSize: '20px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.3)',
    color: '#fff',
    backdropFilter: 'blur(5px)',
    zIndex: 1000
});

document.body.appendChild(jumpBtn);
jumpBtn.addEventListener("touchstart", jumpAction);
jumpBtn.addEventListener("mousedown", jumpAction);

// -----------------------------
// ساخت مانع
// -----------------------------
function spawnObstacle() {
    let baseHeight = 40 + Math.min(Math.floor(score/20)*8, 60);
    let extraHeight = baseHeight;

    let height = baseHeight + Math.random() * extraHeight;
    let speed = 8 + Math.floor(score/10); 
    let spawnRate = Math.max(80, 100 - score);

    obstacles.push({
        x: canvas.width,
        y: canvas.height - 20 - height,
        width: 60,
        height: height,
        speed: speed
    });

    return spawnRate;
}

// -----------------------------
// ریست کامل بازی
// -----------------------------
function resetGame() {
    player.y = canvas.height - 120;
    player.dy = 0;
    player.grounded = true;
    obstacles = [];
    coins = [];
    frame = 0;
    score = 0;
    gameOver = false;
    nextSpawn = 0;
    update();
}

// -----------------------------
// حلقه بازی
// -----------------------------
function update() {
    if(gameOver){
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0,0,canvas.width,canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 20);
        ctx.font = '32px Arial';
        ctx.fillText(`رکورد: ${score}`, canvas.width/2, canvas.height/2 + 20);

        restartBtn.style.display = 'block';
        menuBtn.style.display = 'block';

        return;
    }

    ctx.clearRect(0,0,canvas.width,canvas.height);
    const newWave = Math.floor(score / 30);

if (newWave !== currentWave) {
    currentWave = newWave;
    waveTextTimer = 120; // حدود 2 ثانیه
}

    drawBackground();

    // زمین
    ctx.fillStyle = '#111';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    // فیزیک حرکت بازیکن
    player.dy += player.gravity;
    player.y += player.dy;

    // برخورد با زمین
    if(player.y + player.height >= canvas.height - 20){
        player.y = canvas.height - 20 - player.height;
        player.dy = 0;
        player.grounded = true;
    }

    drawPlayer();

    // ایجاد مانع
    if(frame >= nextSpawn){
        nextSpawn = frame + spawnObstacle();
    }

    // تولید سکه هر 200 فریم
    if(frame % 200 === 0){
        spawnCoin();
    }

    // حرکت موانع + برخورد
    obstacles.forEach((obs,i)=>{
        obs.x -= obs.speed;
        ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);

        // برخورد
        if(player.x < obs.x + obs.width &&
           player.x + player.width > obs.x &&
           player.y < obs.y + obs.height &&
           player.y + player.height > obs.y){

            spawnParticles(player.x + player.width/2, player.y + player.height/2);
            gameOver = true;
        }

        if(obs.x + obs.width < 0){
            obstacles.splice(i,1);
            score += 1;
        }
    });

    // حرکت و جمع کردن سکه‌ها
   // حرکت و جمع کردن سکه‌ها
coins.forEach((coin, i) => {
    coin.x -= coin.speed;
    ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);

    if (
        player.x < coin.x + coin.width &&
        player.x + player.width > coin.x &&
        player.y < coin.y + coin.height &&
        player.y + player.height > coin.y
    ) {
        coinSound.currentTime = 0; // ریست برای پخش سریع پشت‌سرهم
        coinSound.play();

        spawnParticles(coin.x + coin.width/2, coin.y + coin.height/2);
        score += 5; 
        coins.splice(i, 1);
    }

    if (coin.x + coin.width < 0) {
        coins.splice(i, 1);
    }
});


    updateParticles();

    // نمایش امتیاز
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`امتیاز: ${score}`, 10, 30);
    if (waveTextTimer > 0) {
    ctx.fillStyle = "#fff";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        `Wave ${currentWave + 1}`,
        canvas.width / 2,
        80
    );
    waveTextTimer--;
}


    frame++;
    requestAnimationFrame(update);
}
document.addEventListener('click', ()=>{
    bgMusic.play();
}, { once: true });

bgMusic.play().catch(()=>{});

update();
