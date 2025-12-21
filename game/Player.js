import Entity from "./ENTITY.js";

export default class Player extends Entity {
    constructor() {
        super({ tag: "img", className: "player" });
        this.el.src = "game/bomberman.png";
        this.SPEED = 10;
        this.spawn();

    }

    spawn() {
        const container = document.getElementById('container');
        this.setX((container.clientWidth -60) - 600);
        this.setY((container.clientHeight - 200));
    }

    moveRight() {

        this.setX(this.x + this.SPEED);
    }

    moveLeft() {
        this.setX(this.x - this.SPEED);
    }

    moveUp() {
            this.setY(this.y - this.SPEED)
    }

    moveDown() {
            this.setY(this.y + this.SPEED)
    }
     
} 