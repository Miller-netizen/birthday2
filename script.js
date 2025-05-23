// script.js
window.onload = function() {
    const canvas = document.getElementById('fireworks-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let fireworks = [];
    let particles = [];

    // 随机颜色
    function getRandomColor() {
        const colors = ['#FF1461', '#18FF92', '#5A87FF', '#FBF38C', '#FF8A18', '#A239CA'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // 烟花类
    function Firework(sx, sy, tx, ty) {
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.tx = tx;
        this.ty = ty;
        this.distanceToTarget = Math.sqrt(Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2));
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = Math.random() * 50 + 50;
        this.targetRadius = 1;
    }

    Firework.prototype.update = function(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        if (this.targetRadius < 8) {
             this.targetRadius += 0.3;
        } else {
             this.targetRadius = 1;
        }

        this.speed *= this.acceleration;

        let vx = Math.cos(this.angle) * this.speed;
        let vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = Math.sqrt(Math.pow(this.x + vx - this.sx, 2) + Math.pow(this.y + vy - this.sy, 2));

        if (this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.tx, this.ty);
            fireworks.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    };

    Firework.prototype.draw = function() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, ${this.brightness}%)`;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
        ctx.stroke();
    };

    // 粒子类 (烟花爆炸后的效果)
    function Particle(x, y) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 10 + 1;
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = Math.random() * 360;
        this.brightness = Math.random() * 50 + 50;
        this.alpha = 1;
        this.decay = Math.random() * 0.03 + 0.015;
    }

    Particle.prototype.update = function(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    };

    Particle.prototype.draw = function() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.stroke();
    };

    // 创建粒子
    function createParticles(x, y) {
        let particleCount = 30; // 爆炸产生的粒子数量
        while (particleCount--) {
            particles.push(new Particle(x, y));
        }
    }

    // 动画循环
    function loop() {
        requestAnimationFrame(loop);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // 拖尾效果
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter'; // 让颜色混合更亮

        let i = fireworks.length;
        while (i--) {
            fireworks[i].draw();
            fireworks[i].update(i);
        }

        let j = particles.length;
        while (j--) {
            particles[j].draw();
            particles[j].update(j);
        }

        // 随机发射烟花
        if (Math.random() < 0.05) { // 控制烟花发射频率
             fireworks.push(new Firework(canvas.width / 2, canvas.height, Math.random() * canvas.width, Math.random() * canvas.height / 2));
        }
    }

    // 窗口大小改变时调整画布
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    // 启动动画
    loop();

    // 添加鼠标点击发射烟花 (可选)
    canvas.addEventListener('click', function(e) {
        fireworks.push(new Firework(canvas.width / 2, canvas.height, e.clientX, e.clientY));
    });
};