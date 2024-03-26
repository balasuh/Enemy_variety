
// The event document.addEventListener('DOMContentLoaded'... triggers as soon as the HTML is loaded and doesn't wait for css and other assets
// The event window.addEventListener('load'... triggers only after ALL necessary assets and styles have been loaded
window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 800;
    let lastTime = 1;
    console.log('Load function running');

    class Game {
        constructor(ctx, width, height) {
            this.ctx = ctx;
            this.width = width;
            this.height = height;
            this.enemies = [];
            this.enemyInterval = 500;
            this.enemyTimer = 0;
            this.enemyTypes = ['worm', 'ghost', 'spider'];
        }

        // Update and draw in this class handle all necessary game assets like menus, backgrounds, player, menus, etc.
        update(deltaTime) {
            if (this.enemyTimer > this.enemyInterval) {
                this.enemies = this.enemies.filter(object => !object.markedForDeletion);
                this.#addNewEnemy();
                this.enemyTimer = 0;
                // console.log('this.enemies: ', this.enemies);
            } else {
                this.enemyTimer += deltaTime;
            }
            this.enemies.forEach(enemy => {
                enemy.update(deltaTime);
            })
        }

        draw() {
            this.enemies.forEach(enemy => enemy.draw(this.ctx));
        }

        // Private method exclusive to Game class - can be called only from within Game class to manage internal functionality
        #addNewEnemy() {
            const randomEnemy = this.enemyTypes[Math.floor(Math.random() * (this.enemyTypes.length))];
            if (randomEnemy === 'worm') {
                this.enemies.push(new Worm(this)); // The this keyword here passes the entire (current) game object to the Enemy constructor
            } else if (randomEnemy === 'ghost') {
                this.enemies.push(new Ghost(this)); // The this keyword here passes the entire (current) game object to the Enemy constructor
            } else if (randomEnemy === 'spider') {
                this.enemies.push(new Spider(this)); // The this keyword here passes the entire (current) game object to the Enemy constructor
            }
            this.enemies.sort(function (a, b) { // This ensures that enemies closer to the top edge are behind enemies below them
                return a.y - b.y;
            })

        }
    }

    class Enemy {
        constructor(game) {
            this.game = game; // This is what was passed as "this" in #addNewEnemy inside the Game class
            this.markedForDeletion = false;
            this.frameX = 0;
            this.maxFrame = 5;
            this.frameInterval = 100;
            this.frameTimer = 0;
        }

        // Update and draw in this class handle enemies only
        update(deltaTime) {
            this.x -= this.speedX * deltaTime; // Multiply with deltaTime to compensate for speed difference between various machines
            if (this.x < (0 - this.width)) this.markedForDeletion = true;
            if (this.x < (0 - this.width)) this.markedForDeletion = true;
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX < this.maxFrame) {
                    this.frameX++
                } else {
                    this.frameX = 0;
                }
                this.frameTimer = 0;
            } else {
                if (deltaTime) { this.frameTimer += deltaTime };
            }
        }

        draw(ctx) {
            // ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.drawImage(this.image, (this.frameX * this.spriteWidth), 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }

    class Worm extends Enemy {
        constructor(game) {
            super(game); // The super keyword runs the constructor code in the parent Enemy class and makes it available here
            this.spriteWidth = 229; // Any constructor definitions that use "this" keyword will lead to a pointer error if super keyword hasn't run before it
            this.spriteHeight = 171;
            this.width = this.spriteWidth * 0.5;
            this.height = this.spriteHeight * 0.5;
            this.x = this.game.width;
            this.y = (this.game.height - this.height); // Worms only crawl along the ground
            // this.image = new Image();
            // this.image.src = './assets/enemy_worm.png';
            this.image = worm; // Little known JS fact: In JS code, you can directly access an HTML element by its id without using document.getElementById
            this.speedX = Math.random() * 0.2 + 0.2;
        }
    }

    class Ghost extends Enemy {
        constructor(game) {
            super(game); // The super keyword runs the constructor code in the parent Enemy class and makes it available here
            this.spriteWidth = 261; // Any constructor definitions that use "this" keyword will lead to a pointer error if super keyword hasn't run before it
            this.spriteHeight = 209;
            this.width = this.spriteWidth * 0.5;
            this.height = this.spriteHeight * 0.5;
            this.x = this.game.width;
            this.y = Math.random() * (this.game.height * 0.6); // Ghosts fly and take up only 60% of the top area
            // this.image = new Image();
            // this.image.src = './assets/enemy_ghost.png';
            this.image = ghost; // Little known JS fact: In JS code, you can directly access an HTML element by its id without using document.getElementById
            this.speedX = Math.random() * 0.3 + 0.1;
            this.angle = 0;
            this.curveFactor = Math.random() * 5;
        }

        update(deltaTime) {
            super.update(deltaTime);
            this.y += Math.sin(this.angle) * (Math.random() * this.curveFactor);
            this.angle += 0.05;
        }

        draw(ctx) {
            ctx.save(); // Takes a snapshot of all ctx settings
            ctx.globalAlpha = 0.5; // Modifies the ctx alpha value
            super.draw(ctx); // This runs the parent (enemy) class' draw method and makes it available here
            ctx.restore(); // Restores the ctx alpha value back to the "snapshot" state
        }
    }

    class Spider extends Enemy {
        constructor(game) {
            super(game); // The super keyword runs the constructor code in the parent Enemy class and makes it available here
            this.spriteWidth = 310; // Any constructor definitions that use "this" keyword will lead to a pointer error if super keyword hasn't run before it
            this.spriteHeight = 175;
            this.width = this.spriteWidth * 0.5;
            this.height = this.spriteHeight * 0.5;
            this.x = Math.random() * (this.game.width - this.spriteWidth);
            this.y = (0 - this.height); // Spiders start from just above the top screen edge
            // this.image = new Image();
            // this.image.src = './assets/enemy_worm.png';
            this.image = spider; // Little known JS fact: In JS code, you can directly access an HTML element by its id without using document.getElementById
            this.speedX = 0;
            this.speedY = Math.random() * 0.1 + 0.1;
            this.maxMovementRange = Math.random() * (this.game.height * 0.8);
        }

        update(deltaTime) {
            super.update(deltaTime);
            if (this.y < (0 - (this.height * 2))) { this.markedForDeletion = true };
            this.y += this.speedY * deltaTime;
            if (this.y > this.maxMovementRange) this.speedY = -1;

        }

        draw(ctx) {
            ctx.beginPath();
            ctx.moveTo((this.x + (this.width * 0.5)), 0);
            ctx.lineTo((this.x + (this.width * 0.5)), (this.y + 10));
            ctx.strokeWidth = 2;
            ctx.stroke();
            super.draw(ctx);
        }
    }

    const game = new Game(ctx, canvas.width, canvas.height);
    function animate(timeStamp) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        game.update(deltaTime);
        game.draw();
        // console.log('deltaTime: ', deltaTime);
        // Core animation logic goes here
        requestAnimationFrame(animate);
    }

    // If you don't set a default timeStamp, its value will be set to NaN for the first two loops because of the way animation-looping works
    animate(timeStamp = 0);
});