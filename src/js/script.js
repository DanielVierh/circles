let canvas = document.getElementById('canvas1');
let ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particleArray = [];
let counter = 0;
let spawnInterval = 150;
let live = 30;
let points = 0;

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
            console.log(spawnInterval);
        }
    }
    
})


//* Klasse
class Particle {
    constructor(color) {
        this.color = color;
        this.x = Math.random() * canvas.width;
        this.y =  Math.random() * (canvas.height - 600);
        this.size = Math.random() * 15 + 5;
        this.speedY = Math.random() * 1;
        this.id = uniqueID_Generator();
        this.classList = 'Feffe'
    }

    update() {
        this.y += this.speedY;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    delete() {

    }
}

function uniqueID_Generator() {
    const rndStuff = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
        'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '$', '!', '1', '2', '3', '4', '8', '7',
        '6', '5', '9', '0', '#',
    ];
    let key = '';
    for (let i = 1; i <= 36; i++) {
        key += rndStuff[parseInt(Math.random() * rndStuff.length)];
    }
    return key;
}


function handleParticles() {
    for(let i = 0; i < particleArray.length; i++) {
        particleArray[i].update();
        particleArray[i].draw();

        if(particleArray[i].y >= canvas.height){
            particleArray.splice(i, 1);
            i--;
            console.log('oh oh');
        }
    }

}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0,0,canvas.width, canvas.height)

    counter++;
    if(counter >= spawnInterval) {
        particleArray.push(new Particle('blue'));
        counter = 0;
    }
   
    handleParticles();
    requestAnimationFrame(animate);
}

animate();