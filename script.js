window.addEventListener("load", function(){//esperamos a que la ventana termine de cargar para despues proceder con la ejecucion de las funciones y constructores

    const canvas = document.getElementById("canvas-1"); //ubicamos el canvas en nuestro archivo html
    const ctx =  canvas.getContext("2d"); //creamos el contexto en el que dibujaremos en el canvas

    canvas.width = 800;//se le aumentó el width para que tuviera una mejor vista el juego
    canvas.height = 500;

    class InputHandler{ //clase que se encarga de capturar los clicks en el teclado para mover arriba o abajo
        constructor(game){
            this.game = game;
            window.addEventListener("keydown", e => { //event listener para capturar cuando se presiona una tecla
                if((    (e.key === "ArrowUp") || (e.key === "ArrowDown") //capturamos solo si se presiona la flecha hacía arriba o abajo ya que esto determinará el movimiento
                    ) && (this.game.keys.indexOf(e.key)  === -1)){
                    this.game.keys.push(e.key);
                } else if(e.key === ' '){ //detectamos si se presionó la barra espaciadora
                    this.game.player.shootTop(); //en caso de que se haya presionado se disparará un projectile
                }else if(e.key === 'd'){
                    this.game.debug = !this.game.debug;
                }
            });

            window.addEventListener("keyup", e => { //event listener para eliminar del array el movimiento que se recibió, ya sea arriba o abajo
                //ya que si no le elimina se tendrá un problema pues el personaje que dispará siempre se moverá aunque no se presionen teclas de arriba o abajo
                if (this.game.keys.indexOf(e.key) > -1) {
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                } 
            });

        }
    }

    class Projectile{
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10; 
            this.height = 3;
            this.speed = 5;//se le aumentó la velocidad a los projectiles
            this.markedForDeletion = false;
        }

        update(){
            this.x += this.speed;
            if (this.x > this.game.width * 0.8) { //vemos si el movimiento del projectile ya se salió del canvas, en caso de haberlo hecho se elimina del juego
                this.markedForDeletion = true;
            }
        }

        draw(context){ //función con la que creamos y coloreamos nuestro proyectil
            context.fillStyle = "#FF37D8";//se le cambió el color a las balas por un color rosa
            context.fillRect(this.x, this.y, this.width, this.height);
        }

        
    }

    class Player{
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.speedY = 0.5;
            this.maxSpeed = 1;
            this.projectiles = [];
            this.image = document.getElementById('player');
            this.maxFrame= 37;
        }

        update(){ //función que determina el movimiento del jugador ya sea arriba o abajo
            this.y += this.speedY;
            if (this.game.keys.includes("ArrowUp")) {
                this.speedY = -1;
            } else if(this.game.keys.includes("ArrowDown")) {
                this.speedY = 1;
            } else {
                this.speedY = 0;
            }

            this.y += this.speedY;
            this.projectiles.forEach(projectile => {
                projectile.update();
            });

            this.projectiles = this.projectiles.filter(projectile =>!projectile.markedForDeletion);
            if(this.frameX< this.maxFrame){
                this.frameX++;
            }else{
                this.frameX = 0;
            }

        }

        draw(context){ //funcion con la que iremos dibujando la cantidad de proyectiles con la que contamos
            if(this.game.debug)context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image,
                                this.frameX*this.width,
                                this.frameY*this.height,
                                this.width, this.height,
                                this.x, this.y, 
                                this.width, this.height
                                );
            this.projectiles.forEach(projectile => {
                projectile.draw(context);
            });
            
        }

        shootTop(){ //función con la que iremos disparando nustros proyectiles, dicha función revisa que primero haya balas, una vez que válida que hay balas
            //va dibujando las balas en el canvas y las va restando de la cantidad de balas disponibles
            if (this.game.ammo > 0) {
                this.projectiles.push(new Projectile(this.game, this.x+80, this.y+30));
                this.game.ammo--;
            }

        }

    }

    class Enemy{
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.speedX = Math.random()*-1.5-0.5;
            this.markedForDeletion = false;
            //this.lives = 5;
            this.lives =  Math.floor(Math.random()*(5-1+1)+1); /*se agrego este generador random de números enteros para que el puntaje de los peces no siempre sea 5 */
            this.score = this.lives;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
        }

        update(){
            this.x += this.speedX;
            if(this.x + this.width < 0){
                this.markedForDeletion = true;
            }
            if(this.frameX < this.maxFrame){
                this.frameX++;
            }else{
                this.frameX = 0;
            }
        }

        draw(context){ //función para dibujar a nuestro enemigo y pintarle las vidas
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, 
                                this.frameX*this.width,
                                this.frameY*this.height,
                                this.width, this.height,
                                this.x, this.y,
                                this.width, this.height
                                );
            context.font = "20px Helvetica";
            context.fillText(this.lives, this.x, this.y);
        }
    }

    class Angler1 extends Enemy { //clase con la que crearemos nustros enemigos
        constructor(game){
            super(game);
            this.width = 228; //ancho del enemigo
            this.height = 169; //alto del enemigo
            this.y = Math.random()*(this.game.height*0.9-this.height);//le asignamos una posicion vertical tomando en cuenta que no se debe de pasar del canvas
            this.image = document.getElementById('angler1'); //imagen del enemigo que dibujaremos en el canvas
            this.frameY = Math.floor(Math.random()*3); //posicionamos el enemigo de manera vertical dentro del canvas

        }
    }

    class Layer{//clase con la que determinaremos las imagenes de fondo
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }

        update(){ //funcion con la que se simulará el movimiento de las imagenes de fondo
            if(this.x <= -this.width)this.x = 0;
            else this.x -= this.game.speed*this.speedModifier;
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }

    class BackGround{ //clase para dibujar las cuatro imagenes de fondo en el canvas y con base en ellos ir dibujando para que se muevan dichas imagenes de fondo y se vea una especie de animación
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById("layer1");
            this.image2 = document.getElementById("layer2");
            this.image3 = document.getElementById("layer3");
            this.image4 = document.getElementById("layer4");
            
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 1.2);
            this.layer4 = new Layer(this.game, this.image4, 1.7);

            this.layers = [this.layer1, this.layer2, this.layer3];
        }

        update(){
            this.layers.forEach(layer=>layer.update());
        }

        draw(context){
            this.layers.forEach(layer=>layer.draw(context));
        }

    }

    class UI{
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = "Helvetica";
            this.color = "white";
        }

        draw(context){
            context.save();
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = "black";
            context.font = this.fontSize + "px " + this.fontFamily;
            context.fillText("Score " + this.game.score, 20, 40);
            context.fillText("Max time 18 seconds", 250, 40);/*Se agregó un letrero que indique al usuario cuanto tiempo máximo tiene para ganar */
            for (let i = 0; i < this.game.ammo; i++) {
                context.fillRect(20 + 5*i,50,3,20);
            }
            const formattedTime = (this.game.gameTime*0.001).toFixed(1); //creamos nuestra variable que se encarga de medir el tiempo
            context.fillText("Timer: " + formattedTime, 20, 100);//dibujamos el contador del tiempo en el canvas
            if (this.game.gameOver) { // se valida que no se haya terminado el juego
                context.textAlign = "center";
                let message1;
                let message2;
                if (this.game.score > this.game.winningScore) { //verificamos que se haya superado el score establecido por el juego para ganar en caso de que se gane se dibuja un mensaje en el canvas
                    message1 = "You won";
                    message2 = "Well done";
                } else { //en caso de se termine el tiempo y no se supere el puntaje minimo se manda un mensaje para indicar que ha perdido
                    message1 = "You lost";
                    message2 = "Try again! :(";
                }
                //posicionamos y dibujamos el mensaje en el canvas según si perdió o ganó
                context.font = "50px " + this.fontFamily;
                context.fillText(   message1, 
                                    this.game.width*0.5, 
                                    this.game.height*0.5-20);
                context.font = "25px " + this.fontFamily;
                context.fillText(   message2,
                                    this.game.width*0.5,
                                    this.game.height*0.5+20);
            }
            
            context.restore();
        }
    }

    class Game{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.backGround = new BackGround(this);
            this.keys = [];
            this.ammo = 20;
            this.ammoTimer = 0;
            this.ammoInterval = 500;
            this.maxAmmo = 35; /*se restaron 15 balas a la capacidad máxima, considerando que 50 eran demasiadas y se ganaba muy rápido*/
            this.enemies = [];
            this.enemiesTimer = 0;
            this.enemiesInterval = 1500; /*se retrasó en .5 segundos el tiempo en el que cada enemigo aparece */
            this.gameOver = false;
            this.score = 0;
            this.winningScore = 18;/*Se aumentaron 8 unidades en el score para equilibrar el juego */
            this.gameTime = 0;
            this.timeLimit = 18000; /*se agregaron 3 segundos, anteriormente estaba en 15 pero en ocasiones perdía muy fácil */
            this.speed = 1;
            this.debug = false;
        }

        update(deltaTime){
            if (!this.gameOver) this.gameTime += deltaTime;// si el juego no ha terminado seguimos incrementando el tiempo
            if (this.gameTime > this.timeLimit) this.gameOver = true; //si el tiempo transcurrido en el juego supera al tiempo máximo establecido entonces se da por terminado el juego
            this.backGround.update();
            this.backGround.layer4.update();
            this.player.update();
            if (this.ammoTimer > this.ammoInterval) { 
                if (this.ammo < this.maxAmmo) { // si las balas que hay de momento son menores a la capacidad máxima de blas
                    this.ammo++; //se aumentan las balas hasta llegar a la máxima capacidad
                    this.ammoTimer = 0;
                }
            } else {
                this.ammoTimer += deltaTime;
            }

            this.enemies.forEach(enemy =>{
                enemy.update();
                if (this.checkCollition(this.player, enemy)) { //llamamos a la función que se encarga de borrar al enemigo en caso de ser tocado por el personaje de juego (avatar)
                    enemy.markedForDeletion = true; //en caso de que sea tocado se quita del canvas
                }
                this.player.projectiles.forEach(projectile =>{
                    if (this.checkCollition(projectile, enemy)) {//funcion con la que sumamos puntos al score en caso de que las balas/proyectiles toquen al enemigo
                        enemy.lives--; //se le van restando las vidas al enemigo segun sea tocado por las balas
                        projectile.markedForDeletion = true;
                        if (enemy.lives <= 0) { //cuando las vidas llegan a 0 entonces se quitan del canvas
                            enemy.markedForDeletion = true; 
                            if(!this.gameOver)this.score += enemy.score; //si el juego no ha terminado entonces se le suman las vidas del enemigo al score del jugador
                            if (this.score > this.winningScore)  { //si el score del jugador rebasa al máximo establecido entonces el juego se da por terminado
                                this.gameOver = true;
                            }
                        }
                    }
                });
            });

            this.enemies = this.enemies.filter(enemy=>!enemy.markedForDeletion); //mostramos solo los enemigos que no han chocado o sido eliminados por balas del jugador

            if (this.enemiesTimer > this.enemiesInterval && !this.gameOver) { //función con la que iremos dibujando enemigos en el canvas siempre y cuando el juego no esté terminado
                this.addEnemy();
                this.enemiesTimer = 0;
            } else {
                this.enemiesTimer += deltaTime;
            }

        }

        draw(context){ //función con la que dibujamos los elementos participantes en el juego
            this.backGround.draw(context);//dibujamos nuestros fondos
            this.player.draw(context); //nuestro jugador
            this.ui.draw(context); //la interfaz de jeugo

            this.enemies.forEach(enemy =>{ //los enemigos que se iran mostrando
                enemy.draw(context);
            });
            this.backGround.layer4.draw(context);
        }

        addEnemy(){
            this.enemies.push(new Angler1(this)); //agregamos nuestros enemigos a un arreglo que despues será recorrido con un foreach y los ira mostrando en el canvas
        }

        checkCollition(rect1, rect2){ //funcion para eliminar enemigo en caso de que el avatar choque con ellos
            return(     rect1.x < rect2.x + rect2.width
                        && rect1.x + rect1.width > rect2.x
                        && rect1.y < rect2.y + rect2.height
                        && rect1.height + rect1.y > rect2.y
                );
        }

    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }

    animate(0);
});