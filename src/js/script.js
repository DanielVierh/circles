let canvas = document.getElementById('canvas1');
let ctx = canvas.getContext('2d');
const lbl_points = document.getElementById('lbl_points');
const lbl_live = document.getElementById('lbl_live');
const lbl_money = document.getElementById('lbl_money');
const btn_restart = document.getElementById('btn_restart');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//* ANCHOR - Global Var
let particleArray = [];
let bulletArray = [];
let towerArray = [];
let counter = 0;
let spawnInterval = 80;
let live = 100;
let points = 0;
let is_playing = true;
let bulletCounter = 0;
let lastBullet = 0;
let reachLeft = true;
let reachRight = false;
let money = 200;
let new_Live = 0;
const tower_cost = 100;

let mouse = {
    x: undefined,
    y: undefined,
}

//* ANCHOR - Resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


//* ANCHOR - Click Event Listener
canvas.addEventListener('click', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    //* ANCHOR Squash circles
    for (let i = 0; i < particleArray.length; i++) {

        if (mouse.x < particleArray[i].x + 20 &&
            mouse.x + 30 > particleArray[i].x &&
            mouse.y < particleArray[i].y + 20 &&
            mouse.y + 30 > particleArray[i].y) {

            particleArray.splice(i, 1);
            i--;
            spawnInterval--;
            if (spawnInterval <= 0) {
                spawnInterval = 0;
            }
            points++;
            new_Live++;
            lbl_money.innerHTML = `$ ${money}`;
            if (points === 1) {
                lbl_points.innerHTML = `${points} Punkt`
            } else {
                lbl_points.innerHTML = `${points} Punkte`
            }

        }
    }

    //* ANCHOR - Build a Tower
    const allowedBuildArea = canvas.height - 30;
    if (mouse.y > allowedBuildArea && money >= tower_cost) {
        towerArray.push(new Tower(mouse.x, canvas.height - 20));
        money -= tower_cost;
        lbl_money.innerHTML = `$ ${money}`;
    }
})


const min = (window.innerWidth * 0.2);
const max = (window.innerWidth - (window.innerWidth * 0.4))

//////////////////////////////////////////
//* ANCHOR - Klasse für Ufos aka Particles
//////////////////////////////////////////
class Particle {
    constructor(color, imageSrc) {
        this.color = color;
        this.x = Math.floor(Math.random() * max) + min;;
        this.y = 0;
        this.size = Math.random() * 15 + 5;
        if(live > 100) {
            this.speedY = Math.random() * 2;
        }else {
            this.speedY = Math.random() * 1;
        }
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
        if (!is_playing) {
            return
        }
        this.y += this.speedY;
    }

    draw() {
        if (!is_playing) {
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

//////////////////////////////////////////
//* ANCHOR - Klasse für Bullet
//////////////////////////////////////////
class Bullet {
    constructor() {
        this.x = canvas.width / 2;
        this.y = canvas.height;
        this.size = 3;
        this.speedY = 8;
        this.color = 'yellow';
    }

    update() {
        if (!is_playing) {
            return
        }
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
        for (let i = 0; i < particleArray.length; i++) {

            if (this.x < particleArray[i].x + 20 &&
                this.x > particleArray[i].x &&
                this.y < particleArray[i].y + 20 &&
                this.y > particleArray[i].y) {
                particleArray.splice(i, 1);
                i--;
                spawnInterval--;
                if (spawnInterval <= 5) {
                    spawnInterval = 5;
                }
                points++;
                new_Live++;
                lbl_money.innerHTML = `$ ${money}`;
                this.y = canvas.y;
                if (points === 1) {
                    lbl_points.innerHTML = `${points} Punkt`
                } else {
                    lbl_points.innerHTML = `${points} Punkte`
                }
            }
        }
    }
}


//////////////////////////////////////////
//* ANCHOR - Klasse für Tower
//////////////////////////////////////////
class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 20;
        this.color = 'white';
        this.bulletX = this.x + (this.width / 2);
        this.bulletY = y;
        this.bulletSize = 8;
        this.bulletSpeedY = 15;
        this.bulletColor = 'red';
        this.lastBullet = 0;
    }

    //* draw Tower
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    update() {
        if (!is_playing) {
            return
        }
        this.bulletY -= this.bulletSpeedY;
        //this.bulletX += this.lastBullet;
        if (this.bulletY <= 0) {
            this.bulletY = canvas.height;
            this.bulletX = this.x + (this.width / 2) + (Math.random() * 2) - 1;
        }
    }

    bulletdraw() {
        ctx.fillStyle = this.bulletColor;
        ctx.beginPath();
        ctx.arc(this.bulletX, this.bulletY, this.bulletSize, 0, Math.PI * 2);
        ctx.fill();
    }

    collisionDetection() {
        for (let i = 0; i < particleArray.length; i++) {

            if (this.bulletX < particleArray[i].x + 20 &&
                this.bulletX + 30 > particleArray[i].x &&
                this.bulletY < particleArray[i].y + 20 &&
                this.bulletY + 30 > particleArray[i].y) {
                particleArray.splice(i, 1);
                i--;
                spawnInterval--;
                if (spawnInterval <= 5) {
                    spawnInterval = 5;
                }
                points++;
                new_Live++;
                lbl_money.innerHTML = `$ ${money}`;
                this.bulletY = canvas.height;
                if (points === 1) {
                    lbl_points.innerHTML = `${points} Punkt`
                } else {
                    lbl_points.innerHTML = `${points} Punkte`
                }
            }
        }
    }

}

//////////////////////////////////////////
//* ANCHOR - Handle Particles
//////////////////////////////////////////

function handleParticles() {
    for (let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();

        if (particleArray[i].y >= canvas.height) {
            particleArray.splice(i, 1);
            i--;
            live--;
            lbl_live.innerHTML = `♥️ ${live}`;
            if (live === 0) {
                document.getElementById('modal').classList.add('active');
                is_playing = false;
            }
        }
    }
}

//////////////////////////////////////////
//* ANCHOR - Handle Tower
//////////////////////////////////////////

function handleTowers() {
    for (let i = 0; i < towerArray.length; i++) {
        let tower_reachLeft = true;
        let tower_reachRight = false;
        towerArray[i].draw();
        towerArray[i].update();
        towerArray[i].bulletdraw();
        towerArray[i].collisionDetection();

        if (bulletCounter === 15) {
            bulletArray.push(new Bullet());
            bulletCounter = 0;
        }

        if (towerArray[i].lastBullet < -2) {
            tower_reachLeft = true;
            tower_reachRight = false;
        }

        if (towerArray[i].lastBullet > 2) {
            tower_reachLeft = false;
            tower_reachRight = true;
        }
        if (tower_reachLeft === true && tower_reachRight === false) {
            towerArray[i].lastBullet += .003;
        }
        if (tower_reachLeft === false && tower_reachRight === true) {
            towerArray[i].lastBullet -= .003;
        }
    }
}

//////////////////////////////////////////
//* ANCHOR - Handle Bullets
//////////////////////////////////////////

function handleBullets(p_reachLeft = true, p_reachRight = false) {

    if (lastBullet < -2) {
        reachLeft = true;
        reachRight = false;
    }

    if (lastBullet > 2) {
        reachLeft = false;
        reachRight = true;
    }

    reachLeft = p_reachLeft;
    reachRight = p_reachRight; 

    if (reachLeft === true && reachRight === false) {
        lastBullet += .008;
    }
    if (reachLeft === false && reachRight === true) {
        lastBullet -= .008;
    }
    for (let i = 0; i < bulletArray.length; i++) {
        bulletArray[i].update();
        bulletArray[i].draw();
        bulletArray[i].collisionDetection();

        if (bulletArray[i].y <= 0) {
            bulletArray.splice(i, 1);
            i--;
        }
    }
}


lbl_live.innerHTML = `♥️ ${live}`;
lbl_money.innerHTML = `$ ${money}`;

btn_restart.addEventListener('click', () => {
    window.location.reload();
})

//////////////////////////////////////////
//* ANCHOR - Keys
////////////////////////////////////////////////////////

    const keys = {
        w: {
            pressed: false,
        },
        a: {
            pressed: false,
        },
        s: {
            pressed: false,
        },
        d: {
            pressed: false,
        },
    };

    let lastKey = '';
    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'w':
                keys.w.pressed = true;
                lastKey = 'w';
                break;
            case 'a':
                keys.a.pressed = true;
                lastKey = 'a';
                break;
            case 's':
                keys.s.pressed = true;
                lastKey = 's';
                break;
            case 'd':
                keys.d.pressed = true;
                lastKey = 'd';
                break;

            default:
                break;
        }
    });


   //////////////////////////////////////////
   //* ANCHOR - Klasse um gedrückte Taste triggern
    class ClickAndHold {
        constructor(EventTarget, callback) {
            this.EventTarget = EventTarget;
            this.callback = callback;
            this.isHeld = false;
            this.activeHoldTimeoutId = null;

            ['mousedown', 'touchstart'].forEach((type) => {
                this.EventTarget.addEventListener(
                    type,
                    this._onHoldStart.bind(this),
                );
            });

            [
                'mouseup',
                'mouseleave',
                'mouseout',
                'touchend',
                'touchcancel',
            ].forEach((type) => {
                this.EventTarget.addEventListener(
                    type,
                    this._onHoldEnd.bind(this),
                );
            });
        }

        _onHoldStart() {
            this.isHeld = true;

            this.activeHoldTimeoutId = setTimeout(() => {
                if (this.isHeld) {
                    this.callback();
                }
            }, 200);
        }

        _onHoldEnd() {
            this.isHeld = false;
            clearTimeout(this.activeHoldTimeoutId);
            keys.w.pressed = false;
            keys.a.pressed = false;
            keys.s.pressed = false;
            keys.d.pressed = false;
        }
    }

    const leftBtn = document.getElementById('left');
    const rightBtn = document.getElementById('right');


    new ClickAndHold(leftBtn, () => {
        keys.a.pressed = true;
        lastKey = 'a';
    });

    new ClickAndHold(rightBtn, () => {
        keys.d.pressed = true;
        lastKey = 'd';
    });

    //////////////////////////////////////////
    //* ANCHOR - Animate
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    
        counter++;
        bulletCounter++;
    
        if (counter >= spawnInterval) {
            particleArray.push(new Particle('lightblue', 'src/images/mothership.png'));
            counter = 0;
        }
    
        if (new_Live > 50) {
            new_Live = 0;
            live += 5;
            money += 33;
            lbl_live.innerHTML = `♥️ ${live}`;
        }
    
        if (bulletCounter === 7) {
            bulletArray.push(new Bullet());
            bulletCounter = 0;
        }
        handleParticles();
        handleTowers();
    
        ctx.fillStyle = 'white';
        ctx.fillRect((canvas.width / 2) - 20, canvas.height - 20, 40, 20);
        ctx.fillRect((canvas.width / 2) - 15, canvas.height - 30, 30, 30);
    
        requestAnimationFrame(animate);
    
        
        if (keys.a.pressed && lastKey === 'a') {
            handleBullets(false, true)
        }

        if (keys.d.pressed && lastKey === 'd') {
            handleBullets(true, false)
        }
    
    
    }
    
    animate();