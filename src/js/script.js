let canvas = document.getElementById('canvas1');
let ctx = canvas.getContext('2d');
const lbl_points = document.getElementById('lbl_points');
const lbl_live = document.getElementById('lbl_live');
const btn_restart = document.getElementById('btn_restart');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particleArray = [];
let bulletArray = [];
let counter = 0;
let spawnInterval = 80;
let live = 30;
let points = 0;
let is_playing = true;
let bulletCounter = 0;


window.addEventListener('resize', ()=> {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let mouse = {
    x: undefined,
    y: undefined,
}

canvas.addEventListener('click', (e)=> {
    mouse.x = e.x;
    mouse.y = e.y;
    // Squash circles
    for(let i = 0; i < particleArray.length; i++) {

        if( mouse.x < particleArray[i].x + 20 &&
            mouse.x + 30 > particleArray[i].x &&
            mouse.y < particleArray[i].y + 20 &&
            mouse.y + 30 > particleArray[i].y) {
            particleArray.splice(i, 1);
            i--;
            spawnInterval--;
            if(spawnInterval <= 5) {
                spawnInterval = 5;  
            }
            points++;
            if(points === 1) {
                lbl_points.innerHTML = `${points} Punkt`
            }else {
                lbl_points.innerHTML = `${points} Punkte`
            }
        }
    }
})

const min = (window.innerWidth * 0.2);
const max = (window.innerWidth - (window.innerWidth * 0.2))

//* Klasse
class Particle {
    constructor(color, imageSrc) {
        this.color = color;
        this.x = Math.floor(Math.random() * max) + min;;
        this.y =  0;
        this.size = Math.random() * 15 + 5;
        this.speedY = Math.random() * 1;
        this.imageSrc = imageSrc;
        this.image = new Image();
        this.image.onload = () => {
            // Das Bild ist geladen, nachdem die onload-Funktion aufgerufen wurde
            this.isImageLoaded = true;
        };
        this.image.onerror = (error) => {
            // Es ist ein Fehler beim Laden des Bildes aufgetreten
            console.error('Fehler beim Laden des Bildes:', error);
        };
        this.image.src = this.imageSrc;
        this.isImageLoaded = false;
    }

    update() {
        if(!is_playing) {
            return
        }
        this.y += this.speedY;
    }

    draw() {
        if(!is_playing) {
            return
        }
        // Überprüfen, ob das Bild geladen ist, bevor es gezeichnet wird
        if (this.image.complete) {
            ctx.drawImage(this.image, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        } else {
            // Wenn das Bild noch nicht geladen ist, fallback auf die Kreiszeichnung
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
let lastBullet = 0;
class Bullet {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height;
        this.size = 5;
        this.speedY = 2;
        this.color = 'yellow';
    }

    update() {
        this.y -= this.speedY;
        this.x += lastBullet;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    collisionDetection() {
        for(let i = 0; i < particleArray.length; i++) {

            if( this.x < particleArray[i].x + 20 &&
                this.x + 30 > particleArray[i].x &&
                this.y < particleArray[i].y + 20 &&
                this.y + 30 > particleArray[i].y) {
                particleArray.splice(i, 1);
                i--;
                spawnInterval--;
                if(spawnInterval <= 5) {
                    spawnInterval = 5;  
                }
                points++;
                if(points === 1) {
                    lbl_points.innerHTML = `${points} Punkt`
                }else {
                    lbl_points.innerHTML = `${points} Punkte`
                }
            }
        }
    }
}



function handleParticles() {
    for(let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();

        if(particleArray[i].y >= canvas.height){
            particleArray.splice(i, 1);
            i--;
            live--;
            lbl_live.innerHTML = `♥️ ${live}`;
            if(live === 0) {
                document.getElementById('modal').classList.add('active');
                is_playing = false;
            }
        }
    }
}

let reachLeft = true;
let reachRight = false;

function handleBullets() {
  
if(lastBullet < -2) {
    reachLeft = true;
    reachRight = false;
}

if(lastBullet > 2) {
    reachLeft = false;
    reachRight = true;
}

if(reachLeft === true && reachRight === false) {
    lastBullet += .002;
}

if(reachLeft === false && reachRight === true) {
    lastBullet -= .002;
}


    for(let i = 0; i < bulletArray.length; i++) {
        bulletArray[i].update();
        bulletArray[i].draw();

        if(bulletArray[i].y <= 0){
            bulletArray.splice(i, 1);
            i--;
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0,0,canvas.width, canvas.height)

    counter++;
    bulletCounter++;

    if(counter >= spawnInterval) {
        particleArray.push(new Particle('grey', 'src/images/mothership.png'));
        counter = 0;
    }
    
    if(bulletCounter === 15) {
        bulletArray.push(new Bullet());
        bulletCounter = 0;
    }
    handleParticles();
    handleBullets();
    requestAnimationFrame(animate);
}

animate();
lbl_live.innerHTML = `♥️ ${live}`;

btn_restart.addEventListener('click', ()=> {
    window.location.reload();
})