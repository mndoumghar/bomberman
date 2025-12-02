import Entity from "./ENTITY.js";

export default class Palyer extends Entity {
    constructor() {
        super({ tag: "img", className: "player" });
        this.el.src = "game/bomberman.png";
        this.SPEED = 10;
        this.spawn();

    }

    spawn() {
        const container = document.getElementById('container');
        this.setX((container.clientWidth + 10) - 600);
        this.setY((container.clientHeight - 90));
    }

    moveRight() {

        this.setX(this.x + this.SPEED);
    }

    moveLeft() {
        this.setX(this.x - this.SPEED);
    }

    moveUp() {
            this.setX();
    }

     moveDown() {
            this.setX();

    }

} 