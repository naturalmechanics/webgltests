console.log("typescript start");
//------------------------ Load all the assets ----------------//
var defaultAssetPaths = [
    './../build/assets/images/skybox/front.JPG',
    './../build/assets/images/icons/01.png',
    './../build/assets/images/icons/02.png',
    './../build/assets/images/icons/03.jpg',
    './../build/assets/images/icons/00.jpg', // Loading the taskbar texture
];
export var loadedAssets = {};
function loadAssets(i) {
    // when it feels like. (Asynchronously).
    // It will simply move on to the next instruction even before the asset is loaded
    // i.e. it does not wait for an instruction to complete
    // async await is an option but becomes very convoluted.
    // as a workaround this function loads one asset, and once the asset is loaded
    // it fires the loaded EventListener - which then goes to load the next asset
    // once all assets loaded, it activates the show assets, and moved on to the next item
    if (i >= defaultAssetPaths.length) {
        showAssets();
        return;
    }
    var s = defaultAssetPaths[i];
    var image = new Image();
    image.src = s;
    image.addEventListener('load', function () {
        loadedAssets[i] = image;
        loadAssets(i + 1);
    });
}
loadAssets(0);
//------------------------ show all the assets ----------------//
function showAssets() {
    var d; // Now that we are in typescript, we need to do this, because without a type the
    // compiler will complain
    // --------- icon 01 ---------//
    d = document.getElementById("icon01Tex");
    d.style.backgroundImage = "url(" + loadedAssets[1].src + ")";
    d.style.backgroundSize = "contain";
    d.style.backgroundRepeat = "no-repeat";
    // --------- icon 02 ---------//
    d = document.getElementById("icon02Tex");
    d.style.backgroundImage = "url(" + loadedAssets[2].src + ")";
    d.style.backgroundSize = "contain";
    d.style.backgroundRepeat = "no-repeat";
    // --------- skybox ----------//
    d = document.getElementById("skyboxTex");
    d.style.backgroundImage = "url(" + loadedAssets[0].src + ")";
    d.style.backgroundSize = "contain";
    d.style.backgroundRepeat = "no-repeat";
    // --------- app pane --------//
    d = document.getElementById("appTex");
    d.style.backgroundImage = "url(" + loadedAssets[3].src + ")";
    d.style.backgroundSize = "contain";
    d.style.backgroundRepeat = "no-repeat";
    // --------- taskbar ---------//
    d = document.getElementById("taskbarTex");
    d.style.backgroundImage = "url(" + loadedAssets[4].src + ")"; // INFUTURE you can add more items
    d.style.backgroundSize = "contain";
    d.style.backgroundRepeat = "no-repeat";
    console.log(loadedAssets);
}
//------------------------ transfer the assets ----------------//
export function getLoadedAssets() {
    return loadedAssets; // this just transfers the loaded assets array to the window
}
//# sourceMappingURL=index.js.map