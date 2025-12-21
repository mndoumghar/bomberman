import Entity from "./ENTITY.js";

export default class live extends Entity {
    constructor() {
        super({ tag: "div", className: "live" })
        this.POINT = 4
    }
      spawn() {
        const container = document.getElementById('container');

        this.setX((container.clientWidth -200));
    }

    point() {
     
            if(this.POINT>0) {
                this.POINT --
               // alert("fff")
            } else {
                setTimeout(()=> {
                    console.log("Faild Game ...");
                    
                },2000)
            }
        
    }
}