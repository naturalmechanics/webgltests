import * as assets from "./index.js";
/*
 * This is the file where ALL global variables are defined
 * exporting this allows all other files
 * to individually set a variable, or
 * get it.
 */
//----------------------------------------------------------------//
//---------- Variables for Camera operation ----------------------//
var camera_xPosition_webGL_coords = 0;
var camera_yPosition_webGL_coords = 0;
var camera_zPosition_webGL_coords = 0;
// we push them in localStorage in order to ensure that any file can utilize them
localStorage.setItem("camera_xPosition_webGL_coords", camera_xPosition_webGL_coords.toString());
localStorage.setItem("camera_yPosition_webGL_coords", camera_yPosition_webGL_coords.toString());
localStorage.setItem("camera_zPosition_webGL_coords", camera_zPosition_webGL_coords.toString());
//------------ Variables for Icon Locations ----------------------//
var icon01top = 0;
var icon01left = 0;
var icon01bot = 0;
var icon01rght = 0;
localStorage.setItem("icon01top", icon01top.toString());
localStorage.setItem("icon01bot", icon01bot.toString());
localStorage.setItem("icon01left", icon01left.toString());
localStorage.setItem("icon01rght", icon01rght.toString());
var icon02top = 0;
var icon02left = 0;
var icon02bot = 0;
var icon02rght = 0;
localStorage.setItem("icon02top", icon02top.toString());
localStorage.setItem("icon02bot", icon02bot.toString());
localStorage.setItem("icon02left", icon02left.toString());
localStorage.setItem("icon02rght", icon02rght.toString());
//------------ Variables for launching programs ------------------//
var app1Started = false;
var app2Started = true;
localStorage.setItem("app1Started", (app1Started).toString());
localStorage.setItem("app2Started", (app2Started).toString());
console.log(assets.loadedAssets);
//------------ Variables for updating textures ------------------//
localStorage.setItem('skyBoxTexture', '');
//# sourceMappingURL=globals.js.map