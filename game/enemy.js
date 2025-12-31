import Entity from "./ENTITY.js";

export default class Enemy extends Entity {
    constructor() {
        super({ tag: "div", className: "enemy" });
        this.SPEED = 4;
        this.direction = "left";
        this.spawn();
    }

    spawn() {
        const container = document.getElementById('container');
        this.setX(container.clientWidth -300);
        this.setY(container.clientHeight - 450);
    }

    update() {
        if (this.direction === "left") {
            this.moveLeft();
        } else {
            this.moveRight();
        }
    }

    moveLeft() { this.setX(this.x - this.SPEED); }
    moveRight() { this.setX(this.x + this.SPEED); }
    moveUp() { this.setY(this.y - this.SPEED); }
    moveDown() { this.setY(this.y + this.SPEED); }

    reverse() {
        this.direction = this.direction === "left" ? "right" : "left";
    }
}
