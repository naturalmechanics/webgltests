import * as assets from "../index.js";
import * as drawing from "../graphics/drawItems.js";
const xSlider = document.getElementById('xPosition');
console.log("picked up x value slider");
console.log(xSlider);
xSlider.addEventListener('input', () => {
    localStorage.setItem("camera_xPosition_webGL_coords", parseFloat(xSlider.value).toString());
    console.log("camera x position is: " + localStorage.getItem("camera_xPosition_webGL_coords"));
});
console.log("input controls X on input event attached");
const ySlider = document.getElementById('yPosition');
console.log("picked up y value slider");
console.log(ySlider);
ySlider.addEventListener('input', () => {
    localStorage.setItem("camera_yPosition_webGL_coords", parseFloat(ySlider.value).toString());
    console.log("camera y position is: " + localStorage.getItem("camera_yPosition_webGL_coords"));
});
console.log("input controls Y on input event attached");
const zSlider = document.getElementById('zPosition');
console.log("picked up z value slider");
console.log(zSlider);
zSlider.addEventListener('input', () => {
    localStorage.setItem("camera_zPosition_webGL_coords", parseFloat(zSlider.value).toString());
    console.log("camera z position is: " + localStorage.getItem("camera_zPosition_webGL_coords"));
});
console.log("input controls Z on input event attached");
const deskTop = document.getElementById("canvas");
deskTop.addEventListener('click', (e) => {
    const rect = deskTop.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;
    if ((x / 1320 * 600 > parseFloat(localStorage.getItem("icon01left"))) &&
        (x / 1320 * 600 < parseFloat(localStorage.getItem("icon01rght"))) &&
        (y / 840 * 300 > parseFloat(localStorage.getItem("icon01top"))) &&
        (y / 840 * 300 < parseFloat(localStorage.getItem("icon01bot")))) {
        alert("app 1");
        localStorage.setItem("app1Started", (true).toString());
    }
    if ((x / 1320 * 600 > parseFloat(localStorage.getItem("icon02left"))) &&
        (x / 1320 * 600 < parseFloat(localStorage.getItem("icon02rght"))) &&
        (y / 840 * 300 > parseFloat(localStorage.getItem("icon02top"))) &&
        (y / 840 * 300 < parseFloat(localStorage.getItem("icon02bot")))) {
        alert("app 2");
        localStorage.setItem("app2Started", (true).toString());
    }
});
const skyBoxLoader = document.getElementById("skybox");
skyBoxLoader.addEventListener('change', (e) => {
    // if (skyBoxLoader.files.length > 0){
    // 	assets.loadedAssets[0] = URL.createObjectURL(skyBoxLoader.files[0]);
    // 	drawing.createDrawQueue();
    // }
    // //alert(URL.createObjectURL(skyBoxLoader.files[0]));
    var filePath = skyBoxLoader.value;
    console.log(filePath);
    var reader = new FileReader();
    reader.onload = function (e) {
        assets.loadedAssets[0] = e.target.result;
        console.log(assets.loadedAssets[0]);
        drawing.createDrawQueue();
    };
    reader.readAsDataURL(skyBoxLoader.files[0]);
});
//# sourceMappingURL=input_controls.js.map