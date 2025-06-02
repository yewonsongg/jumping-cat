import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";

kaplay ({
    width: 1280,
    height: 720,
    letterbox: true,
    debug: false, 
    pixelDensity: window.devicePixelRatio,
});

const floor_height = 60;
const speed = 500;

setBackground(62, 217, 237);
loadSprite("cat", "assets/cat.png", {
    sliceX: 11,
    anims: {
        "walk": {
            from: 0,
            to: 1,
            loop: true,
        },
        "jump": {
            from: 2,
            to: 10,
            speed: 100,
            loop: true,
        },
    },
});
loadSprite("water", "assets/water.webp");
loadSound("sound", "assets/oo-ee-a-ea.mp3");


// game scene
scene("game", () => {
    // define gravity
    setGravity(1500);
    

    // add a game object to screen
    const player = add([
        sprite("cat", { anim: "walk" }),
        pos(80, 40),
        area(),
        body(),
        scale(0.4),
    ]);

    // floor
    add([
        rect(width(), floor_height), // why is the width not changing
        outline(1.2),
        pos(0, height()),
        anchor("botleft"),
        area(),
        body({ isStatic: true }),
        color(8, 201, 118),
    ]);

    // so sound stops once its on the ground
    let jumpSound = null;

    function jump() {
        if (player.isGrounded()) {
            player.jump(650);
            player.play("jump");

            if (jumpSound && !jumpSound.stopped) {
                jumpSound.stop();
            };

            jumpSound = play("sound", { volume: 0.5 });
        }
    }

    // jump when user presses space or up arrow key
    onKeyPress(["space", "up"], jump);

    onUpdate(() => {
        if (player.isGrounded()) {
            if (player.curAnim() !== "walk") {
            player.play("walk");
            }

            if (jumpSound && !jumpSound.stopped) {
                jumpSound.stop();
            }
        }
    });

    function spawnObstacle() {
        // add obstacle 
        add([
            sprite("water"),
            area(),
            scale(0.175),
            pos(width(), height() - floor_height),
            anchor("botleft"),
            move(LEFT, speed),
            offscreen({ destroy: true }),
            "obstacle",
        ]);

        // wait a random amount of time to spawn next tree
        wait(rand(1, 2), spawnObstacle);
    }

    spawnObstacle();

    // game over if player collides with an obstacle
    player.onCollide("obstacle", () => {
        go("lose", score);
        if (jumpSound && !jumpSound.stopped) {
            jumpSound.stop();
        }
    });

    // keeping track of score
    let score = 0;

    const scoreLabel = add([
        text(score.toString()),
        pos(24, 24),
    ]);

    // increment score every frame
    onUpdate(() => {
        score++;
        scoreLabel.text = score.toString();
    });
});

// lose scene
scene("lose", (score) => {
    add([
        sprite("cat"),
        pos(width() / 2, height() / 2 - 64),
        scale(2),
        anchor("center"),
    ]);

    // displays score
    add([
        text(score),
        pos(width() / 2, height() / 2 + 64),
        scale(2),
        anchor("center"),
    ]);

    // go back to game with space is pressed
    onKeyPress("space", () => go("game"));
    onClick(() => go("game"));
});

go("game");