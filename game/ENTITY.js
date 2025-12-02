export default class Entity {
    constructor({ tag = "div", className = "" } = {}) {
        this.el = document.createElement(tag);

        const gameContainer = document.getElementById('container');
        gameContainer.appendChild(this.el);

        this.el.className = 'entity ' + className;

        this.x = 0;
        this.y = 0;
    }

    setX(x) {
        this.x = x;
        this.updatePosition();
    }

    setY(y) {
        this.y = y;
        this.updatePosition();
    }

    updatePosition() {
        if (this.el) {
            this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
        }
    }

    remove() {
        if (this.el) {
            this.el.remove();
            this.el = null;
        }
    }
}
