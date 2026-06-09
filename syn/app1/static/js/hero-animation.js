(function() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
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
    let targetCameraZ = 1.05;
    let mouse = { x: -1000, y: -1000 };

    const CONFIG = {
        particleCount: 150,
        symbolCount: 40,
        streamCount: 20,
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
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.4 + 0.1;
            this.color = Math.random() > 0.5 ? CONFIG.colors.cyan : CONFIG.colors.purple;
        }
        update() {
            // Mouse Interaction
            const dxMouse = this.x - mouse.x;
            const dyMouse = this.y - mouse.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            if (distMouse < 150) {
                const force = (150 - distMouse) / 150;
                this.vx += dxMouse / distMouse * force * 0.5;
                this.vy += dyMouse / distMouse * force * 0.5;
            }

            if (state === 'CHAOS') {
                this.x += this.vx;
                this.y += this.vy;
            } else {
                const angle = Math.atan2(this.y - height / 2, this.x - width / 2);
                this.vx += Math.cos(angle + Math.PI/2) * 0.008;
                this.vy += Math.sin(angle + Math.PI/2) * 0.008;
                this.x += this.vx * 0.6;
                this.y += this.vy * 0.6;
                this.vx *= 0.98;
                this.vy *= 0.98;
            }
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
            
            if (state !== 'CHAOS') {
                ctx.shadowBlur = 15 * this.alpha;
                ctx.shadowColor = this.color;
            }
        }
    }

    class Symbol {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.text = CONFIG.symbolList[Math.floor(Math.random() * CONFIG.symbolList.length)];
            this.alpha = 0;
            this.targetAlpha = Math.random() * 0.3 + 0.05;
            this.speed = Math.random() * 0.3 + 0.1;
            this.fontSize = Math.floor(Math.random() * 8 + 10);
        }
        update() {
            this.y -= this.speed;
            if (this.alpha < this.targetAlpha) this.alpha += 0.002;
            if (this.y < -20) {
                this.y = height + 20;
                this.x = Math.random() * width;
            }
        }
        draw() {
            ctx.font = `${this.fontSize}px monospace`;
            ctx.fillStyle = CONFIG.colors.cyan;
            ctx.globalAlpha = this.alpha;
            ctx.fillText(this.text, this.x, this.y);
        }
    }

    class CodeStream {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 200;
            this.text = CONFIG.codeSnippets[Math.floor(Math.random() * CONFIG.codeSnippets.length)];
            this.speed = Math.random() * 1.5 + 0.5;
            this.alpha = 0.15;
            this.z = Math.random() * 1000;
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
                ctx.font = `${12 * scale}px monospace`;
                ctx.fillStyle = CONFIG.colors.white;
                ctx.globalAlpha = this.alpha * scale;
                ctx.fillText(this.text, screenX, screenY);
            }
        }
    }

    function typeWriter(element, text, speed = 50) {
        let i = 0;
        element.innerHTML = '';
        element.style.opacity = '0.5';
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    function updateUIDynamic() {
        if (!uiBottom) return;
        const uptime = (frame / 60).toFixed(1);
        uiBottom.innerHTML = `<data_flow> synchronized | uptime: ${uptime}s`;
        setTimeout(updateUIDynamic, 1000);
    }

    function init() {
        resize();
        particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
        symbols = Array.from({ length: CONFIG.symbolCount }, () => new Symbol());
        streams = Array.from({ length: CONFIG.streamCount }, () => new CodeStream());
        
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            
            // UI Parallax
            if (uiTop) {
                const moveX = (mouse.x - width / 2) * 0.01;
                const moveY = (mouse.y - height / 2) * 0.01;
                uiTop.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
            if (uiBottom) {
                const moveX = (mouse.x - width / 2) * -0.01;
                const moveY = (mouse.y - height / 2) * -0.01;
                uiBottom.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });

        animate();
        
        setTimeout(() => { 
            state = 'ORDER'; 
            if(uiTop) {
                uiTop.classList.add('visible');
                typeWriter(uiTop, '<system_init> [SUCCESS]');
            }
        }, 3000);
        setTimeout(() => { state = 'CONNECT'; }, 6000);
        setTimeout(() => { 
            state = 'PATH'; 
            if(glowPath) glowPath.classList.add('active');
            if(uiBottom) {
                uiBottom.classList.add('visible');
                typeWriter(uiBottom, '<data_flow> synchronized');
                setTimeout(updateUIDynamic, 1000);
            }
        }, 10000);
        setTimeout(() => { state = 'REVEAL'; }, 13000);
    }

    function resize() {
        const parent = canvas.parentElement;
        width = canvas.width = parent.clientWidth;
        height = canvas.height = parent.clientHeight;
    }

    function drawConnections() {
        if (state !== 'CONNECT' && state !== 'PATH' && state !== 'REVEAL') return;
        ctx.lineWidth = 0.6;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = CONFIG.colors.cyan;
                    ctx.globalAlpha = (1 - dist / 120) * 0.25;
                    ctx.stroke();
                    
                    // Small pulse on connection
                    if (frame % 60 === 0 && Math.random() > 0.95) {
                        ctx.beginPath();
                        ctx.arc(particles[i].x, particles[i].y, 3, 0, Math.PI * 2);
                        ctx.fillStyle = CONFIG.colors.white;
                        ctx.globalAlpha = 0.5;
                        ctx.fill();
                    }
                }
            }
        }
    }

    function drawAmbientWaves() {
        ctx.save();
        ctx.strokeStyle = CONFIG.colors.cyan;
        ctx.globalAlpha = 0.03;
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const offset = frame * 0.01 + i;
            for (let x = 0; x < width; x += 20) {
                const y = Math.sin(x * 0.002 + offset) * 50 + height / 2 + (i - 1) * 100;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        ctx.shadowBlur = 0; // Reset for performance
        
        if (state === 'REVEAL') cameraZ += (targetCameraZ - cameraZ) * 0.002;
        
        ctx.save();
        ctx.translate(width/2, height/2);
        ctx.scale(cameraZ, cameraZ);
        ctx.translate(-width/2, -height/2);

        // Background
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
        gradient.addColorStop(0, '#1a2244');
        gradient.addColorStop(0.6, '#0e1225');
        gradient.addColorStop(1, '#0b0f1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        drawAmbientWaves();
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
})();
