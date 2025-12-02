import { Built } from "./game/build.js";
import Keyboard from "./game/keywboard.js";
import Palyer from "./game/Player.js";

export default class App {
    constructor() {
        this.render();
        this.spawnBuilt();
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
        new Built();
        const player  = new Palyer()
        const keyboard = new Keyboard()
        setInterval(()=> {
            if(keyboard.isPressed("a")) {
                player.moveRight()
                console.log( player.x);
                
            }

            if(keyboard.isPressed("x")  ) {
                player.moveLeft()

            }
            if(keyboard.isPressed("w")  ) {
                player.moveUp()

            }
        }, 1000/40)
    }
}

new App();
