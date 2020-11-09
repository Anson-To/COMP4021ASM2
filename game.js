// The point and size class used in this program
function Point(x, y) {
    this.x = x ? parseFloat(x) : 0.0;
    this.y = y ? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = w ? parseFloat(w) : 0.0;
    this.h = h ? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (
        pos1.x < pos2.x + size2.w &&
        pos1.x + size1.w > pos2.x &&
        pos1.y < pos2.y + size2.h &&
        pos1.y + size1.h > pos2.y
    );
}

// The player class used in this program
function Player() {
    this.node = document.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
    this.alive = true; //life set as player
    var name = prompt("please enter your name") || "Anonymous"; //Name attribute
    document.getElementById("name").innerHTML = name;
    this.flip = true; //flip the player
    this.direction; //for bullet
}

Player.prototype.isOnPlatform = function () {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (
            ((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
                (this.position.x + PLAYER_SIZE.w == x &&
                    this.motion == motionType.RIGHT) ||
                (this.position.x == x + w && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y
        )
            return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
};

//DisappearPlatform
Player.prototype.isOnDisappearPlatform = function () {
    var disappearplatforms = document.getElementsByClassName("disappear");
    for (var i = 0; i < disappearplatforms.length; i++) {
        var node = disappearplatforms[i];
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (
            ((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
                (this.position.x + PLAYER_SIZE.w == x &&
                    this.motion == motionType.RIGHT) ||
                (this.position.x == x + w && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y
        )
            return i + 1;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
};

//verticalPlatform
Player.prototype.isOnVerticalPlatform = function () {
    var node = document.getElementById("moving_platform");
    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    var h = parseFloat(node.getAttribute("height"));
    // console.log(`Player x:${this.position.x} y:${this.position.y}`);
    // console.log(`Platform x:${x} y:${y - PLAYER_SIZE.h}`);
    if (
        this.position.x + PLAYER_SIZE.w > x &&
        this.position.x < x + w &&
        this.position.y + PLAYER_SIZE.h < y + 1
    ) {
        if (this.position.y < y - PLAYER_SIZE.h - 10) {
            return false;
        }
        this.position.y = y - PLAYER_SIZE.h - 1;
        return true;
    } else {
        return false;
    }
};

Player.prototype.collidePlatform = function (position) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h) position.y = y + h;
                else position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
};

Player.prototype.collideScreen = function (position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w)
        position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
};

//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40); // The size of the player
var SCREEN_SIZE = new Size(600, 560); // The size of the game screen
var PLAYER_INIT_POS = new Point(0, 0); // The initial position of the player

var MOVE_DISPLACEMENT = 5; // The speed of the player in motion
var JUMP_SPEED = 15; // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1; // The displacement of vertical speed

var GAME_INTERVAL = 25; // The time interval of running the game
var MONSTER_SIZE = new Size(40, 40); // The size of a monster
var COIN_SIZE = new Size(40, 40);
var EXIT_SIZE = new Size(40, 40);
var num_goods = 8;
var timeLeft = 100; //game time is 100s

//
// Variables in the game
//
var motionType = { NONE: 0, LEFT: 1, RIGHT: 2 }; // Motion enum

var player = null; // The player object
var gameInterval = null; // The interval
var zoom = 1.0; // The zoom level of the screen

var level = 1; //level of this game
var score = 0; //number of rings collected * 10
var isCheat = false; // cheat mode on or not
var bullets = 8; //Bullets of user
var BULLET_SIZE = new Size(10, 10); // The size of a bullet
var BULLET_SPEED = 10.0; // The speed of a bullet //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0; // The period when shooting is disabled
var direction;
var canShoot = true; // A flag indicating whether the player can shoot a bullet
var num_collected = 0;
var timer;

function coin_collidePlatform(position) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, COIN_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h) position.y = y + h;
                else position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

// Should be executed after the page is loaded
function load() {
    // Attach keyboard events
    document.addEventListener("keydown", keydown, false);
    document.addEventListener("keyup", keyup, false);

    // Create the player
    player = new Player();

    // Create the monsters as well
    // createMonsters(); // var monster = new createMonster(200, 15);
    // createRings();
    createExit();

    timer = setInterval("timerCal()", 1000);

    // Start the game interval
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
}

// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = evt.keyCode ? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.flip = false;
            player.direction = "lhs";
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.flip = true;
            player.direction = "rhs";
            break;

        // Add your code here
        case "W".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;
        case "H".charCodeAt(0):
            if (canShoot) {
                shoot();
            }
            break;
        case "C".charCodeAt(0):
            isCheat = true;
            cheat();
            break;
        case "V".charCodeAt(0):
            isCheat = false;
            break;
    }
}

//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = evt.keyCode ? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT)
                player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT)
                player.motion = motionType.NONE;
            break;
    }
}

//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    //The collisionDetection() function is called at the start of the gamePlay() function
    // collisionDetection();
    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();

    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT) displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT) displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0) player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    //New bullet position
    moveBullets(); //weird ?!
    updateScreen();
    //Disappear platform
}
function createMonster(x, y) {
    var monster = document.createElementNS("http://www.w3.org/2000/svg", "use");
    document.getElementById("monsters").appendChild(monster);
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        "#monster"
    );
}

//create mulitple monsters
function createMonsters() {
    var num_monsters = (level - 1) * 4 + 6; //so lv2 will have 10 monsters
    for (var i = 0; i < num_monsters; i++) {
        var x = Math.max(Math.floor(Math.random() * SCREEN_SIZE.w), 200);
        var y = Math.floor(Math.random() * SCREEN_SIZE.h);
        createMonster(x, y);
    }
}

function createRing(x, y) {
    var ring = document.createElementNS("http://www.w3.org/2000/svg", "use");
    document.getElementById("rings").appendChild(ring);
    ring.setAttribute("x", x);
    ring.setAttribute("y", y);
    ring.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        "#monster"
    );
}
function createRings() {
    for (var i = 0; i < num_goods; i++) {
        var x = Math.max(Math.floor(Math.random() * SCREEN_SIZE.w), 200);
        var y = Math.floor(Math.random() * SCREEN_SIZE.h);
        createRing(x, y);
    }
}

//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player
    // Calculate the scaling and translation factors
    var name = document.getElementById("name");
    if (!player.flip) {
        player.node.setAttribute(
            "transform",
            "translate(" + player.position.x + "," + player.position.y + ")"
        );
    } else {
        player.node.setAttribute(
            "transform",
            "translate(" +
                (player.position.x + PLAYER_SIZE.w) +
                "," +
                player.position.y +
                ") scale(-1, 1)"
        );
    }
    //deal with name
    name.setAttribute("x", player.position.x + 25);
    name.setAttribute("y", player.position.y - 3);
    // Add your code here
    // time();
    document.getElementById("level").innerHTML = level;
    document.getElementById("scorer").innerHTML = score;
    document.getElementById("bullet").innerHTML = bullets;
}

// Add your code here
//set up timer and count down
function timerCal() {
    timeLeft--;
    //update Timer on screen
    document.getElementById("timer").innerHTML = timeLeft;

    if (timeLeft == 0) {
        alert("end");
        gameOver();
        //endGame = true ;
    }

    // var gameTime = 100000; //100,000ns
    // var timer = setTimeout(function () {
    //     alert("You have 100s to reach to the exit");
    // }, gameTime);

    // var timeleft = setInterval(function () {
    //     // code goes here
    //     gameTime -= 1000;
    //     document.getElementById("timer").innerHTML = gameTime;
    // }, 1000);
}
//lab 3
function playsnd(id) {
    if (isASV) {
        var snd = document.getElementById(id + "_asv");
        snd.endElement();
        snd.beginElement();
    }
    if (isFF) {
        var snd = document.getElementById(id);
        snd.currentTime = 0;
        snd.play();
    }
}

function gameOver() {
    //play gameover audio
    // playsnd("gameOver");
    clearInterval(timer);
    player.alive = false;
}
//lab 5
function collisionDetection() {
    // Check if the player has found all 8 rings
    var rings = document.getElementsById("ring");
    var player = document.getElementById("player");
    for (vari = 0; i < num_goods; i++) {
        var ring = rings.childNodes.item(i);
        var x = parseInt(ring.getAttribute("x"));
        var y = parseInt(ring.getAttribute("y"));
        // For each monster check if it overlaps with the player
        if (
            intersect(new Point(x, y), ring_size, player.position, PLAYER_SIZE)
        ) {
            // if yes, increase number of rings and score
            num_collected++;
            score = num_collected * 10;
        }
    }

    // Check whether the player collides with a monster
    var monsters = document.getElementById("monsters");
    // var player = document.getElementById("player");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));
        // For each monster check if it overlaps with the player
        if (
            intersect(
                new Point(x, y),
                MONSTER_SIZE,
                player.position,
                PLAYER_SIZE
            )
        ) {
            // if yes, stop the game
            alert("Game over!");
            clearInterval(gameInterval);
            gameOver();
        }
    }

    // Check whether a bullet hits a monster
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));
        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var x2 = parseInt(monster.getAttribute("x"));
            var y2 = parseInt(monster.getAttribute("y"));

            if (
                intersect(
                    new Point(x2, y2),
                    MONSTER_SIZE,
                    new Point(x, y),
                    BULLET_SIZE
                )
            ) {
                // if yes, remove both the monster and the bullet
                playsnd("mosterdead");
                bullets.removeChild(bullet);
                i--;
                monsters.removeChild(monster);
                j--;
            }
        }
    }
}

function shoot() {
    if (bullets > 0) {
        //Decrease number of bullets
        bullets -= 1;
        direction = player.direction;
        // Disable shooting for a short period of time
        canShoot = false;
        setTimeout("canShoot = true", SHOOT_INTERVAL);
        // Calculate and set the position of the bullet
        // The initial position of the bullet is the center of the player
        // Create the bullet by createing a use node
        // Set the href of the use node to the bullet defined in the defs node
        var bullet = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "use"
        );
        document.getElementById("bullets").appendChild(bullet);
        bullet.setAttribute(
            "x",
            player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2
        );
        bullet.setAttribute(
            "y",
            player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2
        );
        bullet.setAttributeNS(
            "http://www.w3.org/1999/xlink",
            "xlink:href",
            "#bullett"
        );
        // Append the bullet to the bullet groupa
        document.getElementById("bullets").appendChild(bullet);
    }
}
function moveBullets() {
    // Go through all bullets
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);

        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        if (direction == "rhs") {
            x += BULLET_SPEED;
        } else {
            x -= BULLET_SPEED;
        }
        node.setAttribute("x", x);
        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0) {
            bullets.removeChild(node);
            i--;
        }
    }
}

function distance(x3, y3) {
    var x = 10;
    var y = 20;
    var x1 = 0;
    var y1 = 0;
    return x1 - x + y1 - y;
}
function disappearPlatform() {
    var platforms = document.getElementById("platforms");

    for (var i = 0; i < platforms.childNodes.length; i++) {
        var platform = platforms.childNodes.item(i);
        if (platform.getAttribute("type") == "disappearing") {
            //
            var platformOpacity = parseFloat(
                platform.style.getPropertyValue("opacity")
            );
            if (distance(player, platform) == 0) {
                platformOpacity -= 0.1;
                platform.style.setProperty("opacity", platformOpacity, null);
            }

            if (platformOpacity == 0) platforms.removeChild(platform);
        }
    }
}

function createExit() {
    var exit = document.createElementNS("http://www.w3.org/2000/svg", "use");
    document.getElementById("exits").appendChild(exit);
    exit.setAttribute("x", 560);
    exit.setAttribute("y", 504);
    exit.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exitt");
}

function reachExit() {
    //check if player reaches exit like collision detection
}

function levelUp() {
    if (num_collected == 8 && reachExit()) {
        level++;
        bullets = 8;
        //Make more monsters=
    }
}
function cheat() {
    if (isCheat) {
        //cheat mode is on
    }
}
