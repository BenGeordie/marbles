class Marble {
    constructor(x, y, color = '#4169E1', id = null) {
        this.id = id || Date.now() + Math.random();
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 10;
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

class OwnerJar {
    constructor(owner, count) {
        this.owner = owner;
        this.marbles = [];
        this.canvas = null;
        this.ctx = null;
        this.jarBounds = null;
        this.animationId = null;

        this.createJarElement();
        this.initCanvas();
        this.createMarbles(count);
        this.startAnimation();
    }

    createJarElement() {
        const jarWrapper = document.createElement('div');
        jarWrapper.className = 'jar-wrapper';

        const label = document.createElement('div');
        label.className = 'jar-label';
        label.textContent = this.owner;

        const jar = document.createElement('div');
        jar.className = 'jar';

        const canvas = document.createElement('canvas');
        jar.appendChild(canvas);

        const count = document.createElement('div');
        count.className = 'jar-count';
        count.textContent = `${this.marbles.length} marbles`;

        jarWrapper.appendChild(label);
        jarWrapper.appendChild(jar);
        jarWrapper.appendChild(count);

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.countElement = count;
        this.jarWrapper = jarWrapper;

        document.getElementById('jarsContainer').appendChild(jarWrapper);
    }

    initCanvas() {
        const jar = this.jarWrapper.querySelector('.jar');
        const rect = jar.getBoundingClientRect();

        this.canvas.width = rect.width || 250;
        this.canvas.height = rect.height || 300;

        this.jarBounds = {
            left: 10,
            right: this.canvas.width - 10,
            bottom: this.canvas.height - 10,
            curveStart: this.canvas.height * 0.3
        };
    }

    createMarbles(count) {
        const colors = ['#4169E1', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

        for (let i = 0; i < count; i++) {
            const color = colors[i % colors.length];
            const x = this.jarBounds.left + 15 + Math.random() * (this.jarBounds.right - this.jarBounds.left - 30);
            const y = this.jarBounds.bottom - 15 - (i * 12);

            const marble = new Marble(x, y, color);
            marble.settled = true;
            this.marbles.push(marble);
        }

        this.updateCount();
    }

    addMarble() {
        const colors = ['#4169E1', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        const color = colors[this.marbles.length % colors.length];

        const dropX = this.jarBounds.left + 20 + Math.random() * (this.jarBounds.right - this.jarBounds.left - 40);
        const marble = new Marble(dropX, -20, color);

        marble.vx = (Math.random() - 0.5) * 2;
        marble.vy = Math.random() * 2;

        this.marbles.push(marble);
        this.updateCount();
    }

    updateCount() {
        this.countElement.textContent = `${this.marbles.length} marbles`;
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
}

class MarbleAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
    }

    async refresh() {
        try {
            const response = await fetch(`${this.baseURL}/refresh`);
            return await response.json();
        } catch (error) {
            console.error('Refresh error:', error);
            return { success: false, error: error.message };
        }
    }

    async requestMarble() {
        try {
            const response = await fetch(`${this.baseURL}/request-marble`, {
                method: 'POST'
            });
            return await response.json();
        } catch (error) {
            console.error('Request marble error:', error);
            return { success: false, error: error.message };
        }
    }
}

class MarbleSystem {
    constructor() {
        this.api = new MarbleAPI();
        this.jars = new Map();
        this.currentUser = null;
        this.notification = document.getElementById('notification');

        this.bindEvents();
        this.refresh();
        this.startPeriodicRefresh();
    }

    bindEvents() {
        document.getElementById('addMarbleBtn').addEventListener('click', () => {
            this.requestMarble();
        });

        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undoLastMarble();
        });

        window.addEventListener('beforeunload', () => {
            this.refresh();
        });
    }

    async refresh() {
        const previousData = this.loadFromStorage();

        const result = await this.api.refresh();
        if (result.success) {
            this.currentUser = result.username;
            await this.updateJars(result.marbles, previousData);
            this.saveToStorage(result.marbles);
        } else {
            console.error('Refresh failed:', result.error);
        }
    }

    async updateJars(newData, previousData) {
        const changes = this.detectChanges(previousData, newData);

        if (changes.userGotMarble && changes.user === this.currentUser) {
            this.showNotification('You got a new marble!');
        }

        document.getElementById('jarsContainer').innerHTML = '';
        this.jars.clear();

        for (const [owner, count] of Object.entries(newData)) {
            const jar = new OwnerJar(owner, count);
            this.jars.set(owner, jar);

            if (changes.marblesAdded[owner] > 0) {
                await this.animateNewMarbles(jar, changes.marblesAdded[owner]);
            }
        }
    }

    detectChanges(previous, current) {
        const changes = {
            userGotMarble: false,
            user: null,
            marblesAdded: {}
        };

        for (const [owner, count] of Object.entries(current)) {
            const previousCount = previous[owner] || 0;
            const added = count - previousCount;

            changes.marblesAdded[owner] = Math.max(0, added);

            if (added > 0 && owner === this.currentUser) {
                changes.userGotMarble = true;
                changes.user = owner;
            }
        }

        return changes;
    }

    async animateNewMarbles(jar, count) {
        for (let i = 0; i < count; i++) {
            await new Promise(resolve => setTimeout(resolve, 200 * i));
            jar.addMarble();
        }
    }

    async requestMarble() {
        const addBtn = document.getElementById('addMarbleBtn');
        addBtn.disabled = true;
        addBtn.textContent = 'Requesting...';

        const result = await this.api.requestMarble();

        if (result.success) {
            this.showNotification('We begged your friends to give you a marble. Be patient now.');
        } else {
            this.showNotification(`Failed to request marble: ${result.error}`);
        }

        addBtn.disabled = false;
        addBtn.textContent = 'Add Marble';
    }

    undoLastMarble() {
        if (this.currentUser && this.jars.has(this.currentUser)) {
            const userJar = this.jars.get(this.currentUser);
            if (userJar.marbles.length > 0) {
                userJar.marbles.pop();
                userJar.updateCount();
            }
        }
    }

    showNotification(message) {
        this.notification.textContent = message;
        this.notification.classList.remove('hidden');

        setTimeout(() => {
            this.notification.classList.add('hidden');
        }, 3000);
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('marbleOwnership');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            return {};
        }
    }

    saveToStorage(data) {
        try {
            localStorage.setItem('marbleOwnership', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    startPeriodicRefresh() {
        setInterval(() => {
            this.refresh();
        }, 5 * 60 * 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.marbleSystem = new MarbleSystem();
});