window.addEventListener('load', function () {
    // canvas setup
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 500;
    canvas.height = 500;

    class InputHandler { // keyboard input
        constructor(game) {
            this.game = game;
            window.addEventListener("keydown", (e) => {
                if (
                    (e.key === "ArrowUp" || e.key === "ArrowDown") &&
                    this.game.keys.indexOf(e.key) === -1
                ) {
                    this.game.keys.push(e.key);
                } else if (e.key === " ") {
                    this.game.player.shootTop();
                }
            });

            window.addEventListener("keyup", (e) => {
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                }
            });
        }
    }
    class Projectile { // shooting lasers at enemies
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.markedForDeletion = false;
        }


        update() { //increase line speed
            this.x += this.speed;
            if (this.x > this.game.width) this.markedForDeletion = true;
            // if the projectile area is bigger than game area,then the object is deleted
        }

        draw(context) {
            context.fillStyle = "yellow";
            context.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    class Particle {

    }
    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 40;
            this.y = 100;
            this.speedY = 0;
            this.maxSpeed = 3;
            this.projectiles = [];
        }

        update() {
            if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;

            // handle projectiles
            this.projectiles.forEach(projectile => {
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(
                projectile => !projectile.markedForDeletion); // remove all elements from array when 'markedForDeletion' == true.Filter creates a new array, that`s why we set it to the property to ensure that it`s updated.
        }

        draw(context) {
            context.fillStyle = 'black';
            context.fillRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
        }
        shootTop() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.ammo--;
            }
        }
    }
    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
        }
        update() {
            this.x += this.speedX; // adjust to animation frame
            if (this.x + this.width < 0) this.markedForDeletion = true;
        }

        draw(context) {
            context.fillStyle = 'red';
            context.fillRect(this.x, this.y, this.width.this.height);
        }
    }
    class Angler1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228 * 0.2;
            this.height = 169 * 0.2;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
        }
    }

    class Layer {

    }
    class Background {

    }
    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'white';
        }
        draw(context) {
            // ammo
            context.fillStyle = this.color;
            for (let i = 0; i <= this.game.ammo; i++) {
                context.fillRect(20 + 5 * i, 50, 3, 20);
            }
        }
    }
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0; // reset to 0
            this.ammoInterval = 500; // interval of adding ammo
            this.gameOver = false;
        }
        update(deltaTime) {
            if (this.ammoTimer > this.ammoInterval) { // every 500ms add ammo, and reset timer to 0
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.player.update();
            this.enemies.forEach(enemy => {
                enemy.update();
            });
            this.enemies = this.enemies.filter(enemy => {
                !enemy.markedForDeletion
            });
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) { // add enemies when the game is not over
                this.addEnemy();
                this.enemyTimer = 0; // set timer to 0
            } else {
                this.enemyTimer += deltaTime; // otherwise add the animation frame delta to timer
            }
        }

        draw(context) {
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
        }
        addEnemy() {
            this.enemies.push(new Angler1(this));
        }
    }


    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;


    // animation loop which will update the game every 60 sec
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime; // difference between repeating loops
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate); // callback with endless loop
    }
    animate(0);
});