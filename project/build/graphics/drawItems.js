/*
* This file contains all the information
* needed to draw the basics.
*/
import * as assets from "../index.js";
// ------------------------- load assets ----------------------------------- //
//import cubeObj from '../build/assets/objects/cube.obj';														// a 3d CUBE object with vertices and nodes, and faces defined
// note that the camera is "inside" the cube
let MatType = Float32Array;
// ------------------------- Some  basics ---------------------------------- //
const eps = 0.00000001;
const array4x4 = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
var skyBoxLoaded = 0;
var icon01Loaded = 0;
var icon02Loaded = 0;
// -------------------- Drawing the Canvas Pane itself --------------------- //
/*
* Step 1 : Draw the background of the GL Canvas (SkyBox)
* * Ensure, that both renderes can work with it
* Step 2 : Draw the Launch Icons
* * The requirement does not require that the launch icons need to be mobile [OPTIONAL]
* * There will be two application icons
* * There will be one Task Bar.
* * * * Set Task bar to the bottom (Not movable)
* * * * Set height = 32 px constant
* * * * Set texture Constant
* These are immobile 2D objects
*
*/
/* VARIABLES */
let canvas;
let gl;
/* Link with the HTML */
function getHTMLTargets() {
    //-------------------- get HTMl target elements -------------------//
    canvas = document.querySelector('canvas');
    gl = canvas.getContext('webgl');
    gl.canvas.height = canvas.height;
    gl.canvas.width = canvas.width;
}
/* ------------------------------------------------------- SKYBOX ----------------------------------------- */
/* SKYBOX VARIABLES */
let skyF_Shader;
let skyV_Shader;
let skyProgram;
var skyPositionLocation;
var skyboxLocation;
var viewDirectionProjectionInverseLocation;
var skyPositionBuffer;
/* SKYBOX Shaders */
const skyV_ShaderSource = `

		attribute vec4 a_position;												// Typscript will grasp here, and set the values
		varying vec4 v_position;
		void main() {
			v_position = a_position;
			gl_Position = a_position;
			gl_Position.z = 1.0;
		}
	`; // we write the shader source directly in the code for simplicity
const skyF_ShaderSource = `

		precision mediump float;												// here, we need to set the precision

		uniform samplerCube u_skybox;											// typescript will grasp here
		uniform mat4 u_viewDirectionProjectionInverse;

		varying vec4 v_position;
		void main() {
			vec4 t = u_viewDirectionProjectionInverse * v_position;
			gl_FragColor = textureCube(u_skybox, normalize(t.xyz / t.w));
		}
	`; // also the vertexshader is directly added here (BOTH in glsl)
/* SKYBOX FUNCTIONS */
function setSkyboxShaders() {
    //-------------------- skybox shaders -----------------------------//
    skyV_Shader = gl.createShader(gl.VERTEX_SHADER); // shader program placeholders created. skyV_Shader is vertex shader
    skyF_Shader = gl.createShader(gl.FRAGMENT_SHADER); // shader program placeholders created. skyF_Shader is fragment shader
    gl.shaderSource(skyV_Shader, skyV_ShaderSource);
    gl.compileShader(skyV_Shader);
    gl.shaderSource(skyF_Shader, skyF_ShaderSource); // the strings which are the source code of the shaders
    gl.compileShader(skyF_Shader); // are inserted in the placeholders; and then compiled
}
function setSkyboxProgram() {
    skyProgram = gl.createProgram(); // now, create a shader *program*,
    // which can run the compiled shaders
    gl.attachShader(skyProgram, skyV_Shader); // compilation result attached to program
    gl.attachShader(skyProgram, skyF_Shader); // ..
    gl.linkProgram(skyProgram);
}
function prepareSkyBox() {
    //--------------- skybox cube variable positions ------------------//
    skyPositionLocation = gl.getAttribLocation(skyProgram, "a_position"); // as marked above , the typescript will grab on "a_positions"
    // the vertex data will go there
    skyboxLocation = gl.getUniformLocation(skyProgram, "u_skybox"); // same here in the fragmentshader
    viewDirectionProjectionInverseLocation = gl.getUniformLocation(skyProgram, "u_viewDirectionProjectionInverse");
    // here the inverse projection matrix will go
    skyPositionBuffer = gl.createBuffer(); // create the first position buffer. It is empty now
    gl.bindBuffer(gl.ARRAY_BUFFER, skyPositionBuffer); // sent the buffer to GL
    var positions = new Float32Array([
        -1, -1,
        1, -1,
        -1, 1,
        -1, 1,
        1, -1,
        1, 1,
    ]); // These are the positions for a cube
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW); // bind the values of positions with the last buffer created
    var texture = gl.createTexture(); // Texture from 2D images
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture); // Wrap around a cube
    const faceInfos = [
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        },
        {
            target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        },
    ];
    faceInfos.forEach((faceInfo) => {
        const { target } = faceInfo; // faceinfos (plural) is an array.
        // each item will return a tuple
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 512; // height and width should be a power of 2
        const height = 512;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        // setup each face so it's immediately renderable
        gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null); // use built in GL functions
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(target, level, internalFormat, format, type, assets.loadedAssets[0]); // skybox is loadedassets 0
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    });
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // until images have loaded, use this option
}
/* skybox wrappers */
function setupSkyBox() {
    setSkyboxShaders();
    setSkyboxProgram();
    prepareSkyBox();
}
function drawFinalSkyBox() {
    gl.useProgram(skyProgram);
    gl.enableVertexAttribArray(skyPositionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, skyPositionBuffer);
    var size = 2; // 2 components per iteration
    var type = gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(skyPositionLocation, size, type, normalize, stride, offset);
    var aspect = canvas.clientWidth / canvas.clientHeight;
    var viewDirectionProjectionInverseMatrix = [
        0.33781543374061584, 0, 0.6931547522544861, 4.863637048657665e-9,
        0, 0.5773502588272095, 0, 0,
        0, 0, 1, -0.499750018119812,
        -0.8989261984825134, 0, -0.43810003995895386, 0.5002500414848328
    ];
    gl.uniformMatrix4fv(viewDirectionProjectionInverseLocation, false, viewDirectionProjectionInverseMatrix);
    gl.uniform1i(skyboxLocation, 0);
    gl.depthFunc(gl.LEQUAL);
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
}
/* ------------------------------------------------------- APP ICONS ----------------------------------------- */
/* APP ICON VARIABLES */
var icon_vShaderSrc = `
		attribute vec2 a_position;
		attribute vec2 a_texCoord;

		uniform vec2 u_resolution;

		varying vec2 v_texCoord;

		void main() {

			vec2 zeroToOne = a_position / u_resolution;
			vec2 zeroToTwo = zeroToOne * 2.0;
			vec2 clipSpace = zeroToTwo - 1.0;

			gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

			v_texCoord = a_texCoord;
		}
	`;
var icon_fShaderSrc = `
		precision mediump float;

		uniform sampler2D u_image;

		varying vec2 v_texCoord;

		void main() {
			gl_FragColor = texture2D(u_image, v_texCoord);
		}
	`;
let icon_fShader;
let icon_vShader;
let icon_program;
var positionLocationIcon;
var texcoordLocationIcon;
var txtures_icons = {};
var posBuff_icons = {};
var texCord_icons = {};
var resLoc_icons = {};
var uImage_icons = {};
var texture01;
/* APP ICON FUNCTIONS */
function setupIconShaders() {
    icon_vShader = gl.createShader(gl.VERTEX_SHADER); // shader program placeholders created. vShader is vertex shader
    icon_fShader = gl.createShader(gl.FRAGMENT_SHADER); // shader program placeholders created. fShader is fragment shader
    gl.shaderSource(icon_vShader, icon_vShaderSrc);
    gl.compileShader(icon_vShader);
    gl.shaderSource(icon_fShader, icon_fShaderSrc); // the strings which are the source code of the shaders
    gl.compileShader(icon_fShader);
}
function setupIconprogram() {
    icon_program = gl.createProgram(); // now, create a shader *program*, which can run the compiled shaders
    gl.attachShader(icon_program, icon_vShader); // compilation result attached to program
    gl.attachShader(icon_program, icon_fShader); // ..
    gl.linkProgram(icon_program);
}
function prepareIcons() {
    // are inserted in the placeholders; and then compiled
    positionLocationIcon = gl.getAttribLocation(icon_program, "a_position");
    texcoordLocationIcon = gl.getAttribLocation(icon_program, "a_texCoord");
    const icons = [
        './../build/assets/images/icons/01.jpg',
        './../build/assets/images/icons/02.jpg',
    ];
    var ii = 0;
    icons.forEach((icon, index) => {
        var positionBufferIcon = gl.createBuffer();
        ii = index;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferIcon);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            gl.drawingBufferWidth / 5 * (ii + 1), gl.drawingBufferHeight / 5,
            gl.drawingBufferWidth / 5 * (ii + 1) + 12, gl.drawingBufferHeight / 5,
            gl.drawingBufferWidth / 5 * (ii + 1), gl.drawingBufferHeight / 5 + 12,
            gl.drawingBufferWidth / 5 * (ii + 1), gl.drawingBufferHeight / 5 + 12,
            gl.drawingBufferWidth / 5 * (ii + 1) + 12, gl.drawingBufferHeight / 5,
            gl.drawingBufferWidth / 5 * (ii + 1) + 12, gl.drawingBufferHeight / 5 + 12,
        ]), gl.STATIC_DRAW); //
        posBuff_icons[index] = positionBufferIcon;
        if (ii == 0) {
            localStorage.setItem("icon01top", (gl.drawingBufferHeight / 5).toString());
            localStorage.setItem("icon01bot", (gl.drawingBufferHeight / 5 + 12).toString());
            localStorage.setItem("icon01left", (gl.drawingBufferWidth / 5 * (ii + 1)).toString());
            localStorage.setItem("icon01rght", (gl.drawingBufferWidth / 5 * (ii + 1) + 12).toString());
        }
        else if (ii == 1) {
            localStorage.setItem("icon02top", (gl.drawingBufferHeight / 5).toString());
            localStorage.setItem("icon02bot", (gl.drawingBufferHeight / 5 + 12).toString());
            localStorage.setItem("icon02left", (gl.drawingBufferWidth / 5 * (ii + 1)).toString());
            localStorage.setItem("icon02rght", (gl.drawingBufferWidth / 5 * (ii + 1) + 12).toString());
        }
        var texcoordBufferIcon = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBufferIcon);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0,
        ]), gl.STATIC_DRAW);
        texCord_icons[index] = texcoordBufferIcon;
        texture01 = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture01);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        txtures_icons[index] = texture01;
        ii = ii + 1;
    });
}
/* app icon wrappers */
function setupAppIcons() {
    setupIconShaders();
    setupIconprogram();
    prepareIcons();
}
function drawFinalIcons() {
    const icons = [
        './../build/assets/images/icons/01.png',
        './../build/assets/images/icons/02.png',
    ];
    var ii = 0;
    gl.useProgram(icon_program);
    icons.forEach((icon, index) => {
        var positionBufferIcon = gl.createBuffer();
        ii = index;
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferIcon);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            gl.drawingBufferWidth / 5 * (ii + 1), gl.drawingBufferHeight / 5,
            gl.drawingBufferWidth / 5 * (ii + 1) + 12, gl.drawingBufferHeight / 5,
            gl.drawingBufferWidth / 5 * (ii + 1), gl.drawingBufferHeight / 5 + 12,
            gl.drawingBufferWidth / 5 * (ii + 1), gl.drawingBufferHeight / 5 + 12,
            gl.drawingBufferWidth / 5 * (ii + 1) + 12, gl.drawingBufferHeight / 5,
            gl.drawingBufferWidth / 5 * (ii + 1) + 12, gl.drawingBufferHeight / 5 + 12,
        ]), gl.STATIC_DRAW);
        if (ii == 0) {
            localStorage.setItem("icon01top", (gl.drawingBufferHeight / 5).toString());
            localStorage.setItem("icon01bot", (gl.drawingBufferHeight / 5 + 12).toString());
            localStorage.setItem("icon01left", (gl.drawingBufferWidth / 5 * (ii + 1)).toString());
            localStorage.setItem("icon01rght", (gl.drawingBufferWidth / 5 * (ii + 1) + 12).toString());
        }
        else if (ii == 1) {
            localStorage.setItem("icon02top", (gl.drawingBufferHeight / 5).toString());
            localStorage.setItem("icon02bot", (gl.drawingBufferHeight / 5 + 12).toString());
            localStorage.setItem("icon02left", (gl.drawingBufferWidth / 5 * (ii + 1)).toString());
            localStorage.setItem("icon02rght", (gl.drawingBufferWidth / 5 * (ii + 1) + 12).toString());
        }
        var texcoordBufferIcon = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBufferIcon);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0,
        ]), gl.STATIC_DRAW);
        texture01 = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture01);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        var image = new Image();
        image.src = icon;
        image.addEventListener('load', function () {
            gl.bindTexture(gl.TEXTURE_2D, texture01);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            var resolutionLocation = gl.getUniformLocation(icon_program, "u_resolution");
            var u_image0Location = gl.getUniformLocation(icon_program, "u_image0");
            gl.enableVertexAttribArray(positionLocationIcon);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferIcon);
            var size = 2; // 2 components per iteration
            var type = gl.FLOAT; // the data is 32bit floats
            var normalize = false; // don't normalize the data
            var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
            var offset = 0; // start at the beginning of the buffer
            gl.vertexAttribPointer(positionLocationIcon, size, type, normalize, stride, offset);
            gl.enableVertexAttribArray(texcoordLocationIcon);
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBufferIcon);
            var size = 2; // 2 components per iteration
            var type = gl.FLOAT; // the data is 32bit floats
            var normalize = false; // don't normalize the data
            var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
            var offset = 0; // start at the beginning of the buffer
            gl.vertexAttribPointer(texcoordLocationIcon, size, type, normalize, stride, offset);
            gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform1i(u_image0Location, 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture01);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });
        ii = ii + 1;
    });
}
export function createDrawQueue() {
    setupSkyBox();
    setupAppIcons();
    //
}
function drawDesktop() {
    drawFinalSkyBox();
    drawFinalIcons();
    //requestAnimationFrame(drawDesktop);
}
getHTMLTargets();
createDrawQueue();
gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
requestAnimationFrame(drawDesktop);
//# sourceMappingURL=drawItems.js.map