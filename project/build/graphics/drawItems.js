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
}
/* skybox wrappers */
function setupSkyBox() {
    setSkyboxShaders();
    setSkyboxProgram();
    prepareSkyBox();
}
function drawFinalSkyBox() {
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);
}
/* APP ICONS */
function setupAppIcons() {
}
export function createDrawQueue() {
    setupSkyBox();
    setupAppIcons();
    //
}
function drawDesktop() {
    drawFinalSkyBox();
    requestAnimationFrame(drawDesktop);
}
getHTMLTargets();
createDrawQueue();
requestAnimationFrame(drawDesktop);
//# sourceMappingURL=drawItems.js.map