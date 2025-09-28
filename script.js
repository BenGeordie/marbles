class Marble {
    constructor(x, y, color = '#4169E1', id = null) {
        this.id = id || Date.now() + Math.random();
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 12;
        this.color = color;
        this.bounce = 0.6;
        this.friction = 0.98;
        this.gravity = 0.5;
        this.settled = false;
        this.settleTime = 0;
    }

    update(marbles, jarBounds) {
        if (this.settled) return;

        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;

        this.vx *= this.friction;
        this.vy *= this.friction;

        this.checkJarCollision(jarBounds);
        this.checkMarbleCollisions(marbles);
        this.checkIfSettled();
    }

    checkJarCollision(jarBounds) {
        const { left, right, bottom, curveStart } = jarBounds;
        
        if (this.y + this.radius >= bottom) {
            const centerX = (left + right) / 2;
            const distFromCenter = Math.abs(this.x - centerX);
            const maxDistAtBottom = (right - left) / 2 - this.radius;
            
            if (distFromCenter <= maxDistAtBottom) {
                this.y = bottom - this.radius;
                this.vy *= -this.bounce;
                if (Math.abs(this.vy) < 0.5) this.vy = 0;
            }
        }

        if (this.y >= curveStart) {
            const centerX = (left + right) / 2;
            const distFromCenter = Math.abs(this.x - centerX);
            const curveHeight = bottom - curveStart;
            const curveRadius = (right - left) / 2;
            
            const normalizedY = (this.y - curveStart) / curveHeight;
            const maxDistAtY = curveRadius * Math.sqrt(1 - Math.pow(normalizedY, 2));
            
            if (distFromCenter + this.radius > maxDistAtY) {
                const angle = Math.atan2(this.y - (curveStart + curveHeight/2), this.x - centerX);
                const edgeX = centerX + Math.cos(angle) * (maxDistAtY - this.radius);
                const edgeY = curveStart + curveHeight/2 + Math.sin(angle) * (curveRadius - this.radius);
                
                this.x = edgeX;
                this.y = Math.min(this.y, edgeY);
                
                const normalX = Math.cos(angle);
                const normalY = Math.sin(angle);
                const dotProduct = this.vx * normalX + this.vy * normalY;
                this.vx -= 2 * dotProduct * normalX * this.bounce;
                this.vy -= 2 * dotProduct * normalY * this.bounce;
            }
        } else {
            if (this.x - this.radius <= left) {
                this.x = left + this.radius;
                this.vx *= -this.bounce;
            }
            if (this.x + this.radius >= right) {
                this.x = right - this.radius;
                this.vx *= -this.bounce;
            }
        }
    }

    checkMarbleCollisions(marbles) {
        for (let other of marbles) {
            if (other === this) continue;
            
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = this.radius + other.radius;
            
            if (distance < minDistance && distance > 0) {
                const overlap = minDistance - distance;
                const moveX = (dx / distance) * (overlap / 2);
                const moveY = (dy / distance) * (overlap / 2);
                
                this.x -= moveX;
                this.y -= moveY;
                other.x += moveX;
                other.y += moveY;
                
                const normalX = dx / distance;
                const normalY = dy / distance;
                
                const relativeVelocityX = other.vx - this.vx;
                const relativeVelocityY = other.vy - this.vy;
                const speed = relativeVelocityX * normalX + relativeVelocityY * normalY;
                
                if (speed < 0) return;
                
                const impulse = 2 * speed / 2;
                this.vx += impulse * normalX * this.bounce;
                this.vy += impulse * normalY * this.bounce;
                other.vx -= impulse * normalX * this.bounce;
                other.vy -= impulse * normalY * this.bounce;
            }
        }
    }

    checkIfSettled() {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed < 0.1) {
            this.settleTime++;
            if (this.settleTime > 30) {
                this.settled = true;
                this.vx = 0;
                this.vy = 0;
            }
        } else {
            this.settleTime = 0;
        }
    }

    draw(ctx) {
        const gradient = ctx.createRadialGradient(
            this.x - this.radius/3, this.y - this.radius/3, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, this.lightenColor(this.color, 0.4));
        gradient.addColorStop(1, this.color);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = this.darkenColor(this.color, 0.2);
        ctx.lineWidth = 1;
        ctx.stroke();
        
        const highlightGradient = ctx.createRadialGradient(
            this.x - this.radius/2, this.y - this.radius/2, 0,
            this.x - this.radius/4, this.y - this.radius/4, this.radius/3
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = highlightGradient;
        ctx.beginPath();
        ctx.arc(this.x - this.radius/4, this.y - this.radius/4, this.radius/3, 0, Math.PI * 2);
        ctx.fill();
    }

    lightenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    darkenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * amount * 100);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
            (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
            (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
    }
}

class MarbleGame {
    constructor() {
        this.canvas = document.getElementById('physicsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.marbles = [];
        this.marbleHistory = [];
        this.animationId = null;
        
        this.initCanvas();
        this.bindEvents();
        this.startAnimation();
    }

    initCanvas() {
        const jar = document.querySelector('.jar');
        const rect = jar.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        this.jarBounds = {
            left: 10,
            right: this.canvas.width - 10,
            bottom: this.canvas.height - 10,
            curveStart: this.canvas.height * 0.3
        };
    }

    bindEvents() {
        document.getElementById('addMarbleBtn').addEventListener('click', () => {
            this.addMarble();
        });
        
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undoLastMarble();
        });
        
        window.addEventListener('resize', () => {
            this.initCanvas();
        });
    }

    addMarble() {
        const colors = ['#4169E1', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        const color = colors[this.marbles.length % colors.length];
        
        const dropX = this.jarBounds.left + 20 + Math.random() * (this.jarBounds.right - this.jarBounds.left - 40);
        const marble = new Marble(dropX, -20, color);
        
        marble.vx = (Math.random() - 0.5) * 2;
        marble.vy = Math.random() * 2;
        
        this.marbles.push(marble);
        this.marbleHistory.push(marble.id);
        this.updateMarbleCount();
    }

    undoLastMarble() {
        if (this.marbles.length === 0) return;
        
        const lastMarbleId = this.marbleHistory.pop();
        const marbleIndex = this.marbles.findIndex(m => m.id === lastMarbleId);
        
        if (marbleIndex !== -1) {
            this.marbles.splice(marbleIndex, 1);
            this.updateMarbleCount();
        }
    }

    updateMarbleCount() {
        document.getElementById('marbleCounter').textContent = this.marbles.length;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let marble of this.marbles) {
            marble.update(this.marbles, this.jarBounds);
            marble.draw(this.ctx);
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        this.animate();
    }

    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    getMarbleData() {
        return this.marbles.map(marble => ({
            id: marble.id,
            color: marble.color,
            x: marble.x,
            y: marble.y
        }));
    }

    loadMarbleData(marbleData) {
        this.marbles = [];
        this.marbleHistory = [];
        
        marbleData.forEach(data => {
            const marble = new Marble(data.x, data.y, data.color, data.id);
            marble.settled = true;
            this.marbles.push(marble);
            this.marbleHistory.push(marble.id);
        });
        
        this.updateMarbleCount();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.marbleGame = new MarbleGame();
});