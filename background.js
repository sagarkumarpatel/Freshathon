document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('dotCanvas');
    const ctx = canvas.getContext('2d');
    const glow = document.querySelector('.tech-glow');
    
    // Set canvas size
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);
        
        initDots();
    }
    
    // Configuration
    const config = {
        dotColor: 'rgba(100, 255, 218, 0.8)',
        lineColor: 'rgba(100, 255, 218, 0.3)',
        dotRadius: 3,
        dotCount: 200,
        maxDistance: 180,
        hoverRadius: 150,
        lineWidth: 1.5
    };
    
    // Mouse position
    const mouse = {
        x: null,
        y: null,
        radius: config.hoverRadius
    };
    
    // Track mouse movement
    document.addEventListener('mousemove', function(e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        // Update glow position
        if (glow) {
            glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            
            // Pulse effect on quick movement
            if (Math.abs(e.movementX) > 5 || Math.abs(e.movementY) > 5) {
                glow.style.animation = 'none';
                void glow.offsetWidth; // Trigger reflow
                glow.style.animation = 'pulse-glow 0.5s ease-out';
            }
        }
    });
    
    // Dot array
    let dots = [];
    
    // Dot class
    class Dot {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.baseX = x;
            this.baseY = y;
            this.vx = Math.random() * 2 - 1;
            this.vy = Math.random() * 2 - 1;
            this.size = config.dotRadius;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = config.dotColor;
            ctx.fill();
        }
        
        update() {
            // Organic movement
            if (Math.random() > 0.97) {
                this.vx = Math.random() * 2 - 1;
                this.vy = Math.random() * 2 - 1;
            }
            
            // Return to base position
            const dx = this.baseX - this.x;
            const dy = this.baseY - this.y;
            this.x += dx * 0.02 + this.vx * 0.3;
            this.y += dy * 0.02 + this.vy * 0.3;
            
            // Mouse interaction
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (mouse.radius - distance) / mouse.radius * 2;
                    this.x += Math.cos(angle) * force * 8;
                    this.y += Math.sin(angle) * force * 8;
                }
            }
            
            // Boundary check
            this.x = Math.max(this.size, Math.min(this.x, canvas.width / (window.devicePixelRatio || 1) - this.size));
            this.y = Math.max(this.size, Math.min(this.y, canvas.height / (window.devicePixelRatio || 1) - this.size));
        }
    }
    
    // Initialize dots with full coverage
    function initDots() {
        dots = [];
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        
        // Calculate grid for perfect coverage
        const cols = Math.ceil(Math.sqrt(config.dotCount * (width / height)));
        const rows = Math.ceil(config.dotCount / cols);
        const colSpacing = width / cols;
        const rowSpacing = height / rows;
        
        for (let i = 0; i < config.dotCount; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            // Position with slight randomness
            const x = col * colSpacing + colSpacing * 0.5 + (Math.random() * colSpacing * 0.4 - colSpacing * 0.2);
            const y = row * rowSpacing + rowSpacing * 0.5 + (Math.random() * rowSpacing * 0.4 - rowSpacing * 0.2);
            
            dots.push(new Dot(x, y));
        }
    }
    
    // Connect dots with lines
    function connectDots() {
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.maxDistance) {
                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.strokeStyle = `rgba(100, 255, 218, ${1 - distance/config.maxDistance})`;
                    ctx.lineWidth = config.lineWidth;
                    ctx.stroke();
                }
            }
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw dots
        dots.forEach(dot => {
            dot.update();
            dot.draw();
        });
        
        // Connect dots
        connectDots();
        
        requestAnimationFrame(animate);
    }
    
    // Initialize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
    
    // Add pulse-glow animation to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-glow {
            0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.2); }
        }
    `;
    document.head.appendChild(style);
});