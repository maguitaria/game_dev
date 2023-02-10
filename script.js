window.addEventListener('load', function () {
    // canvas setup
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
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
                } else if (e.key === 'd') {
                    this.game.debug = !this.game.debug;
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
            this.image = document.getElementById('projectile');
        }


        update() { //increase line speed
            this.x += this.speed;
            if (this.x > this.game.width) this.markedForDeletion = true;
            // if the projectile area is bigger than game area,then the object is deleted
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y);
        }
    }
    class Particle {
        constructor(game, x, y) {
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50; // size of each gear in png
            this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1); // rando,ixer of size of gear
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() // * 6 +3; // motion of gear in x coordinates
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.markedForDeletion = false;
            this.angle = 0;
            this.va = Math.random() * 0. - 0.1; // velocity of angle rotation
        }
        update() {
            this.angle += this.va;
            this.speedY += this.gravity;
            this.x = this.speedX;
            this.y += this.speedY;
            if (this.y > this.game.height + this.size || this.x < 0 - this.size)
                this.markedForDeletion = true;
        }
        draw(content) {
            content.drawImage(this.image, this.frameX * this.spriteSize,
                this.frameY * this.spriteSize, this.spriteSize, this.spriteSize,
                this.x, this.y, this.size, this.size);
        }
    }

    class Player {
        constructor(game) {
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.speedY = 0;
            this.maxFrame = 37;
            this.maxSpeed = 3;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }

        update(deltaTime) {
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
            // sprite animation
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else {
                this.frameX = 0;
            }
            // power up
            if (this.powerUp) {
                if (this.powerUpTimer > this.powerUpLimit) {
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0; // set default animation when power up is ended
                } else {
                    this.powerUpTimer += deltaTime; // power up continues according to animation loop
                    this.frameY = 1; // change of player animation on picture
                    this.game.ammo += 0.1; // recharge ammo fast
                }
            }
        }


        draw(context) {
            if (this.game.debug)
                context.strokeRect(this.x, this.y, this.width, this.height);
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        shootTop() {
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
                this.game.ammo--;
            }
            if (this.powerUp) this.shootBottom();
        }
        shootBottom() { // allows player to shoot additional projectiles from tail and mouth
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175));
            }
        }
        enterPowerUp() {
            this.powerUpTimer = 0;
            this.powerUp = true;
            this.game.ammo = this.game.maxAmmo;
        }
    }
    class Enemy {
        constructor(game) {
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.markedForDeletion = false;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }
        update() {
            this.x += this.speedX - this.game.speed; // adjust to animation frame
            if (this.x + this.width < 0) this.markedForDeletion = true;
            // sprite animation
            if (this.frameX < this.maxFrame) {
                this.frameX++;
            } else this.frameX = 0;

        }

        draw(context) {
            if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height); // first 4 arguments - from where to crop a pic; next 4 arg - where to place a pic;
            context.font = '20px Helvetica';
            context.fillText(this.lives, this.x, this.y);
        }
    }
    class Angler1 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3); // generate an angler randomly
            this.lives = 2;
            this.score = this.lives;
        }
    }

    class Angler2 extends Enemy {
        constructor(game) {
            super(game);
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('angler2');
            this.frameY = Math.floor(Math.random() * 2); // generate an angler randomly
            this.lives = 3;
            this.score = this.lives;
        }
    }

    class LuckyFish extends Enemy { // Lucky fish gives additional power when it`s collided with the player. Otherwise,when it`s shoot -- it gives a lot of score.
        constructor(game) {
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.9 - this.height);
            this.image = document.getElementById('lucky');
            this.frameY = Math.floor(Math.random() * 2); // generate an angler randomly
            this.lives = 3;
            this.score = 15; // biggest score among all enemies!
            this.type = 'lucky'; // used to check with which enemy player has collided
        }
    }

    class Layer { // handle logic for each individual background layer
        constructor(game, image, speedModifier) {
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }
        // move background layers when the game is going to the left
        update() {
            if (this.x <= -this.width) this.x = 0; // turn on scrolling
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }


    class Background { // combine all 4 layers  to create the game world
        constructor(game) {
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 0.2); // third argument  is a speed modifier
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 1);
            this.layer4 = new Layer(this.game, this.image4, 1.5);
            this.layers = [this.layer1, this.layer2, this.layer3]; // hold all layers in an array
        }
        update() {
            this.layers.forEach(layer => layer.update());
        }
        draw(context) {
            this.layers.forEach(layer => layer.draw(context));
        }
    }



    class UI {
        constructor(game) {
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Helvetica';
            this.color = 'white';
        }
        draw(context) {
            context.save(); // takes all instructions down below as an initial pattern
            context.fillStyle = this.color;
            context.shadowOffsetX = 2; // distance of x shadow, positive or negative value depends on from which side you want to shadow the object
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            context.font = this.fontSize + 'px' + this.fontFamily;
            // score
            context.fillText('Score: ' + this.game.score, 20, 40);
            // timer
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer:  ' + formattedTime, 20, 100);
            // game over messages
            if (this.game.gameOver) {
                context.textAlign = 'center';
                let message1; // messages which will inform about score when the game is over
                let message2;
                if (this.game.score > this.game.winningScore) {
                    message1 = 'YOU WIN';
                    message2 = 'WELL DONE!'
                } else {
                    message1 = 'YOU LOSE';
                    message2 = 'TRY AGAIN NEXT TIME :)';
                }
                context.font = '50px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
                // ammo
                if (this.game.player.powerUp) context.fillStyle = '#4bb3a3';
                for (let i = 0; i < this.game.ammo; i++) {
                    context.fillRect(20 + 5 * i, 50, 3, 20);
                }
            }
            context.restore(); // restores the canvas settings to declared one above
        }
    }
    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.enemies = [];
            this.particles = [];
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.ammo = 20;
            this.maxAmmo = 50;
            this.ammoTimer = 0; // reset to 0
            this.ammoInterval = 500; // interval of adding ammo
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 10;
            this.gameTime = 0; // 2 variables to end the game and print message whether you win or lose
            this.timeLimit = 15000;
            this.speed = 1;
            this.debug = true;
        }
        update(deltaTime) {
            if (!this.gameOver) this.gameTime += deltaTime; // game time consists of time of playing.Delta time -- time between animation frame
            if (this.gameTime > this.timeLimit) this.gameOver = true;
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if (this.ammoTimer > this.ammoInterval) { // every 500ms add ammo, and reset timer to 0
                if (this.ammo < this.maxAmmo) this.ammo++;
                this.ammoTimer = 0;
            } else {
                this.ammoTimer += deltaTime;
            }
            this.particles.forEach(particle => {
                particle.update();
            })
            this.particles = this.particles.filter(particle =>
                !particle.markedForDeletion)
            this.enemies.forEach(enemy => {
                enemy.update(); //// this
                if (this.checkCollision(this.player, enemy)) {
                    enemy.markedForDeletion = true;
                    // adding gears
                    for (let i = 0; i < 10; i++) {
                        this.particles.push(new Particle(this,
                            enemy.x + enemy.width * 0.5,
                            enemy.y + enemy.height * 0.5))
                    }
                    if (enemy.type === 'lucky') { this.player.enterPowerUp() }
                    else { if (!this.gameOver) this.score--; } // if player is not collided with lucky fish,then we decrease its score.It will encourage the player to collide with lucky fish
                }
                this.player.projectiles.forEach(projectile => {
                    if (this.checkCollision(projectile, enemy)) {
                        enemy.lives--;
                        projectile.markedForDeletion = true;

                        if (enemy.lives <= 0) {
                            for (let i = 0; i < enemy.score; i++) {
                                this.particles.push(new Particle(this,
                                    enemy.x + enemy.width * 0.5,
                                    enemy.y + enemy.height * 0.5));
                            }
                            enemy.markedForDeletion = true;
                            // // adding gears
                            // this.particles.push(new Projectile(this,
                            //     enemy.x + enemy.width * 0.5,
                            //     enemy.y + enemy.height * 0.5))
                            // stop counting score when the game is ended
                            if (!this.gameOver) this.score += enemy.score;
                            if (this.score > this.winningScore) {
                                this.gameOver = true;
                            }
                        }
                    }
                })
            });
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            if (this.enemyTimer > this.enemyInterval && !this.gameOver) { // add enemies when the game is not over
                this.addEnemy(deltaTime); // here i made a change,don`t know if it`s correct
                this.enemyTimer = 0; // set timer to 0
            } else {
                this.enemyTimer += deltaTime; // otherwise add the animation frame delta to timer
            }
        }

        draw(context) {
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.particles.forEach(particle => {
                particle.draw(context);
            })
            this.background.layer4.draw(context);
        }
        addEnemy() {
            const randomize = Math.random();
            if (randomize < 0.3) this.enemies.push(new Angler1(this));
            else if (randomize < 0.6) this.enemies.push(new Angler2(this));
            else this.enemies.push(new LuckyFish(this));
        }
        checkCollision(rect1, rect2) {
            return (rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.height + rect1.y > rect2.y
            )
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