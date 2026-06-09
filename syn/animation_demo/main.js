const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');
const heroContent = document.getElementById('heroContent');
const glowPath = document.getElementById('glowPath');
const uiTop = document.getElementById('uiTop');
const uiBottom = document.getElementById('uiBottom');

let width, height;
let particles = [];
let symbols = [];
let streams = [];
let frame = 0;
let state = 'CHAOS'; 
let cameraZ = 1;
let targetCameraZ = 1.1;

const CONFIG = {
    particleCount: 120,
    symbolCount: 30,
    streamCount: 15,
    colors: {
        cyan: '#00f2ff',
        purple: '#7000ff',
        white: '#ffffff',
        bg: '#0b0f1a'
    },
    symbolList: ['</>', '{}', '()', '#', 'if', 'for', '=>', '[]', 'const', 'import'],
    codeSnippets: [
        'def syntax_academy():',
        'class Innovation:',
        'models.ForeignKey(User)',
        'export default App',
        'npm install knowledge',
        'git commit -m "logic"',
        '<div>Turning Reality</div>'
    ]
};

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.color = Math.random() > 0.5 ? CONFIG.colors.cyan : CONFIG.colors.purple;
        this.targetX = this.x;
        this.targetY = this.y;
    }

    update() {
        if (state === 'CHAOS') {
            this.x += this.vx;
            this.y += this.vy;
        } else if (state === 'ORDER' || state === 'CONNECT' || state === 'PATH' || state === 'REVEAL') {
            // Flow towards a pattern (gentle spiral or grid)
            const angle = Math.atan2(this.y - height / 2, this.x - width / 2);
            const dist = Math.sqrt((this.x - width/2)**2 + (this.y - height/2)**2);
            this.vx += Math.cos(angle + Math.PI/2) * 0.01;
            this.vy += Math.sin(angle + Math.PI/2) * 0.01;
            this.x += this.vx * 0.5;
            this.y += this.vy * 0.5;
            
            // Friction
            this.vx *= 0.99;
            this.vy *= 0.99;
        }

        // Wrap around
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        
        // Add glow
        if (state !== 'CHAOS') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }
    }
}

class Symbol {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.text = CONFIG.symbolList[Math.floor(Math.random() * CONFIG.symbolList.length)];
        this.alpha = 0;
        this.targetAlpha = Math.random() * 0.4 + 0.1;
        this.speed = Math.random() * 0.5 + 0.2;
        this.fontSize = Math.floor(Math.random() * 10 + 12);
    }

    update() {
        this.y -= this.speed;
        if (this.alpha < this.targetAlpha) this.alpha += 0.005;
        if (this.y < -20) {
            this.y = height + 20;
            this.x = Math.random() * width;
        }
    }

    draw() {
        ctx.font = `${this.fontSize}px 'Source Code Pro'`;
        ctx.fillStyle = CONFIG.colors.cyan;
        ctx.globalAlpha = this.alpha;
        ctx.fillText(this.text, this.x, this.y);
    }
}

class CodeStream {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 200;
        this.text = CONFIG.codeSnippets[Math.floor(Math.random() * CONFIG.codeSnippets.length)];
        this.speed = Math.random() * 2 + 1;
        this.alpha = 0.2;
        this.z = Math.random() * 1000; // Depth for perspective
    }

    update() {
        this.y -= this.speed;
        if (this.y < -100) this.reset();
    }

    draw() {
        if (state !== 'CHAOS') {
            const scale = 1000 / (1000 + this.z);
            const screenX = (this.x - width/2) * scale + width/2;
            const screenY = this.y;
            
            ctx.font = `${14 * scale}px 'Source Code Pro'`;
            ctx.fillStyle = CONFIG.colors.white;
            ctx.globalAlpha = this.alpha * scale;
            ctx.fillText(this.text, screenX, screenY);
        }
    }
}

function init() {
    resize();
    particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
    symbols = Array.from({ length: CONFIG.symbolCount }, () => new Symbol());
    streams = Array.from({ length: CONFIG.streamCount }, () => new CodeStream());
    animate();
    
    // Story Timeline
    setTimeout(() => { state = 'ORDER'; uiTop.classList.add('visible'); }, 5000);
    setTimeout(() => { state = 'CONNECT'; }, 10000);
    setTimeout(() => { 
        state = 'PATH'; 
        glowPath.classList.add('active');
        uiBottom.classList.add('visible');
    }, 15000);
    setTimeout(() => { 
        state = 'REVEAL'; 
        heroContent.classList.add('visible');
    }, 18000);
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

function drawConnections() {
    if (state !== 'CONNECT' && state !== 'PATH' && state !== 'REVEAL') return;

    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = CONFIG.colors.cyan;
                ctx.globalAlpha = (1 - dist / 100) * 0.2;
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Smooth Camera Movement
    if (state === 'REVEAL') {
        cameraZ += (targetCameraZ - cameraZ) * 0.005;
    }
    
    ctx.save();
    ctx.translate(width/2, height/2);
    ctx.scale(cameraZ, cameraZ);
    ctx.translate(-width/2, -height/2);

    // Background Ambient Glow
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
    gradient.addColorStop(0, '#1a1f3c');
    gradient.addColorStop(0.5, '#0e1225');
    gradient.addColorStop(1, '#0b0f1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    symbols.forEach(s => { s.update(); s.draw(); });
    streams.forEach(s => { s.update(); s.draw(); });
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });

    ctx.restore();
    
    frame++;
    requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
init();
