import kaplay from "https://unpkg.com/kaplay@3001/dist/kaplay.mjs";

kaplay ({
    width: 1280,
    height: 720,
    debug: false, 
    stretch: true,
    pixelDensity: window.devicePixelRatio,
});

const floor_height = 60;

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
    let speed = 100;
    loop(1, () => {
        speed += 20;
    });

    // add a game object to screen
    const player = add([
        sprite("cat", { anim: "walk" }),
        pos(80, 40),
        area(),
        body(),
        scale(0.5),
    ]);

    // floor
    const floor = add([
        rect(width(), floor_height), 
        outline(1.2),
        pos(0, height()),
        anchor("botleft"),
        area(),
        body({ isStatic: true }),
        color(8, 201, 118),
    ]);

    // // resizes the floor so it fits screen
    // onResize(() => {
    //     floor.width = width();
    //     floor.pos = vec2(0, height());
    //     fitToScreen();
    // });

    // so sound stops once its on the ground
    let jumpSound = null;

    function jump() {
        if (player.isGrounded()) {
            player.jump(600);
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

    // make water as an obstacle
    function makeWater() {
        return add([
            sprite("water"),
            area(),
            scale(0.14),
            pos(width(), height() - floor_height),
            anchor("botleft"),
            offscreen({ destroy: true }),
            "obstacle",
        ]);
    }

    const spawnObstacle = () => {
        const water = makeWater(vec2(1280, 595));
        water.onUpdate(() => {
        if (speed < 3000) {
            water.move(-(speed + 300), 0);
            return;
        }
        water.move(-speed, 0);
        });

        water.onExitScreen(() => {
        destroy(water);
        });

        const waitTime = rand(1, 2.5);

        wait(waitTime, spawnObstacle);
    };

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