import { Built } from "./game/build.js";
import Enemy from "./game/enemy.js";
import Keyboard from "./game/keywboard.js";
import Live from "./game/live.js";
import Palyer from "./game/Player.js";


export default class App {
    constructor() {
        this.render();
        this.spawnBuilt();
        this.res = null
        this.root = document.getElementById("app");


    }

    render() {
        const div = document.getElementById("app");
        const container = document.createElement('div');
        container.id = "container";
        container.style.position = "relative";
        container.style.width = "800px";
        container.style.height = "600px";
        container.style.border = "2px solid black";
        container.style.overflow = "hidden";
        div.appendChild(container);
    }

    spawnBuilt() {
        const bullet = new Built();
        const player = new Palyer()
        const keyboard = new Keyboard()

        const enemy = new Enemy()
        const live = new Live()
        const container = document.getElementById('container');
        const GAME_WIDTH = container.clientWidth;
        const GAME_HEIGHT = container.clientHeight;
        const builte = document.getElementsByClassName('built');

        const res = setInterval(() => {
            live.el.innerHTML = `<h3>live :  ${live.POINT}</h3>`

            const prevX = player.x;
            const prevY = player.y;
            const enmX = enemy.x;
            const enmY = enemy.y;

            if (keyboard.isPressed("ArrowLeft") && player.x > 0) player.moveLeft();
            if (keyboard.isPressed("ArrowRight") && player.x < GAME_WIDTH - 50) player.moveRight();
            if (keyboard.isPressed("ArrowTop") && player.y > 0) player.moveUp();
            if (keyboard.isPressed("x") && player.y < GAME_HEIGHT - 100) player.moveDown();
            enemy.update()

            if (enemy.x <= 0 || enemy.x >= GAME_WIDTH - 50) {
                enemy.reverse();

            }

            if (this.isOverlapping(enemy.el, player.el)) {
                live.point();a
                claearInterval(res);
               // this.root.innerHTML = ""
            }

            for (const block of builte) {

                if (this.isOverlapping(player.el, block)) {
                    player.setX(prevX);
                    player.setY(prevY);
                }

                if (this.isOverlapping(enemy.el, block)) {
                    enemy.setX(enmX);
                    enemy.setY(enmY);
                    enemy.reverse();
                }
            }

        }, 1000 / 40);
    }


    isOverlapping(el1, el2) {
        if (!el1 || !el2) return false;
        const r1 = el1.getBoundingClientRect();
        const r2 = el2.getBoundingClientRect();
        return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
    }

    getOverlappingBullet(entity, builet) {
        for (const bull of builet) {
            if (this.isOverlapping(entity, bull.el)) return bull;
        }

        return null;
    }

    meaun(root) {
        setTimeout(() => {
            root.innerHTML = ""
            new App();
        }, 1000);
        const meaun = document.createElement("div");
        meaun.classList.add("meaun");
        meaun.innerHTML = "<h1>MEANU</h1>";
        console.log(root);
        root.append(meaun);
    }
}


new App();
