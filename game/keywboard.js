
export default class Keyboard {
    constructor() {
        this.keys  = {}
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        }); 

    }

    isPressed(key) {
       return  !!this.keys[key]
    } 
     release(key) {
        
        this.keys[key] = false;
    } 
    clear() {
        this.keys = {}
    }  
}