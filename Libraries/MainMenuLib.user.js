// ==UserScript==
// @name         Wolfermus Main Menu Library
// @namespace    https://greasyfork.org/en/users/900467-feb199
// @version      1.1.0
// @description  This script is a main menu library that provides easy means to add menu items and manipulate main menu
// @author       Feb199/Dannysmoka
// @homepageURL  https://github.com/Wolfermus/Wolfermus-UserScripts
// @supportURL   https://github.com/Wolfermus/Wolfermus-UserScripts/issues
// @license      GPLv3
// @match        *
// @match        *://*/*
// @match        http://*/*
// @match        https://*/*
// @require      https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/main/Libraries/StorageManagerLib.user.js
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM_setValue
// @grant        GM.setValue
// @grant        GM_addValueChangeListener
// @grant        GM.addValueChangeListener
// @grant        GM_notification
// @grant        GM.notification
// @icon         https://i.imgur.com/XFeWfV0.png
// ==/UserScript== 

const bypassScriptPolicy = trustedTypes.createPolicy("bypassScript", {
    createHTML: (string) => string,
    createScript: (string) => string,
    createScriptURL: (string) => string
});

/**
 * @param {number | undefined} ms
 */
function Sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    });
}

class WolfermusMenuItem {
    /**
     * @param {string} name 
     * @param {string} title 
     * @param {string | undefined} tooltip 
     */
    constructor(name, title, tooltip = undefined) {
        this.name = name;
        this.title = title;
        this.tooltip = tooltip;
    }
    /**
     * @type {string}
     */
    name;
    /**
     * @type {string}
     */
    title;
    /**
     * @type {string}
     */
    tooltip = undefined;
    /**
     * @type {number}
     */
    tooltipTimeOut = 400;

    #tooltipTimeoutID = undefined;

    /**
     * @type {(PointerEvent) => void}
     */
    clickCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    doubleClickCallback = undefined;
    /**
     * 
     * @param {PointerEvent} event 
     * @type {(PointerEvent) => void}
     */
    pointerEnterCallback = (event) => {
        const toolTips = document.getElementById("WolfermusMenuItemToolTip");
        if (toolTips === undefined || toolTips === null) return;

        toolTips.innerText = this.tooltip;

        toolTips.classList.add("wlfToolTipSetActive");

        const x = event.clientX;
        const y = event.clientY;
        toolTips.style.top = (y) + 'px';
        toolTips.style.left = (x) + 'px';

        this.#tooltipTimeoutID = setTimeout(() => {
            const toolTips = document.getElementById("WolfermusMenuItemToolTip");
            if (toolTips === undefined || toolTips === null) return;

            toolTips.classList.add("wlfToolTipActive");
            toolTips.classList.remove("wlfToolTipSetActive");

        }, this.tooltipTimeOut);
    };
    /**
     * 
     * @param {PointerEvent} event 
     * @type {(PointerEvent) => void}
     */
    pointerLeaveCallback = (event) => {
        if (this.#tooltipTimeoutID !== undefined) {
            clearTimeout(this.#tooltipTimeoutID);
            this.#tooltipTimeoutID = undefined;
        }
        const toolTips = document.getElementById("WolfermusMenuItemToolTip");
        if (toolTips === undefined || toolTips === null) return;

        toolTips.innerText = "";

        toolTips.classList.remove("wlfToolTipSetActive");
        toolTips.classList.remove("wlfToolTipActive");
    };
    /**
     * @type {(PointerEvent) => void}
     */
    pointerDownCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    pointerUpCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    pointerMoveCallback = undefined;
    /**
     * 
     * @param {PointerEvent} event 
     * @type {(PointerEvent) => void}
     */
    pointerCancelCallback = (event) => {
        if (this.#tooltipTimeoutID !== undefined) {
            clearTimeout(this.#tooltipTimeoutID);
            this.#tooltipTimeoutID = undefined;
        }
        const toolTips = document.getElementById("WolfermusMenuItemToolTip");
        if (toolTips === undefined || toolTips === null) return;

        toolTips.innerText = "";

        toolTips.classList.remove("wlfToolTipSetActive");
        toolTips.classList.remove("wlfToolTipActive");
    };

    /**
     * @type {(PointerEvent) => void}
     */
    #currentClickCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    #currentDoubleClickCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    #currentPointerEnterCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    #currentPointerLeaveCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    #currentPointerDownCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    #currentPointerUpCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    #currentPointerMoveCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    #currentPointerCancelCallback = undefined;

    /**
     * @returns {string}
     */
    Generate() {
        return `
        <li id="WolfermusMenuItem${this.name}" class="wlfDefaultFloatingButtonCSS">
            <a>${this.title}</a>
        </li>`
    }
    /**
     * @returns {Boolean}
     */
    SetupScripts() {
        let gottenElement = document.getElementById(`WolfermusMenuItem${this.name}`);
        if (gottenElement === undefined || gottenElement === null) return false;

        this.RemoveScripts();

        this.#currentClickCallback = this.clickCallback;
        this.#currentDoubleClickCallback = this.doubleClickCallback;
        this.#currentPointerEnterCallback = this.pointerEnterCallback;
        this.#currentPointerLeaveCallback = this.pointerLeaveCallback;
        this.#currentPointerDownCallback = this.pointerDownCallback;
        this.#currentPointerUpCallback = this.pointerUpCallback;
        this.#currentPointerMoveCallback = this.pointerMoveCallback;
        this.#currentPointerCancelCallback = this.pointerCancelCallback;

        if (this.#currentClickCallback !== undefined) gottenElement.addEventListener("click", this.#currentClickCallback);
        if (this.#currentDoubleClickCallback !== undefined) gottenElement.addEventListener("dblclick", this.#currentDoubleClickCallback);
        if (this.#currentPointerEnterCallback !== undefined) gottenElement.addEventListener("pointerenter", this.#currentPointerEnterCallback);
        if (this.#currentPointerLeaveCallback !== undefined) gottenElement.addEventListener("pointerleave", this.#currentPointerLeaveCallback);
        if (this.#currentPointerDownCallback !== undefined) gottenElement.addEventListener("pointerdown", this.#currentPointerDownCallback);
        if (this.#currentPointerUpCallback !== undefined) gottenElement.addEventListener("pointerup", this.#currentPointerUpCallback);
        if (this.#currentPointerMoveCallback !== undefined) gottenElement.addEventListener("pointermove", this.#currentPointerMoveCallback);
        if (this.#currentPointerCancelCallback !== undefined) gottenElement.addEventListener("pointercancel", this.#currentPointerCancelCallback);

        return true;
    }
    RemoveScripts() {
        let gottenElement = document.getElementById(`WolfermusMenuItem${this.name}`);

        if (gottenElement !== undefined && gottenElement !== null) {
            if (this.#currentClickCallback !== undefined) gottenElement.removeEventListener("click", this.#currentClickCallback);
            if (this.#currentDoubleClickCallback !== undefined) gottenElement.removeEventListener("dblclick", this.#currentDoubleClickCallback);
            if (this.#currentPointerEnterCallback !== undefined) gottenElement.removeEventListener("pointerenter", this.#currentPointerEnterCallback);
            if (this.#currentPointerLeaveCallback !== undefined) gottenElement.removeEventListener("pointerleave", this.#currentPointerLeaveCallback);
            if (this.#currentPointerDownCallback !== undefined) gottenElement.removeEventListener("pointerdown", this.#currentPointerDownCallback);
            if (this.#currentPointerUpCallback !== undefined) gottenElement.removeEventListener("pointerup", this.#currentPointerUpCallback);
            if (this.#currentPointerMoveCallback !== undefined) gottenElement.removeEventListener("pointermove", this.#currentPointerMoveCallback);
            if (this.#currentPointerCancelCallback !== undefined) gottenElement.removeEventListener("pointercancel", this.#currentPointerCancelCallback);
        }

        this.#currentClickCallback = undefined;
        this.#currentDoubleClickCallback = undefined;
        this.#currentPointerEnterCallback = undefined;
        this.#currentPointerLeaveCallback = undefined;
        this.#currentPointerDownCallback = undefined;
        this.#currentPointerUpCallback = undefined;
        this.#currentPointerMoveCallback = undefined;
        this.#currentPointerCancelCallback = undefined;
    }
}

/**
 * @type {Array<WolfermusMenuItem>}
 */
let wolfermusMenuItems = [];
/**
 * @type {Array<WolfermusMenuItem>}
 */
let currentWolfermusMenuItems = [];


/**
 * Add/Set a Menu Item to Main Menu
 * @param {WolfermusMenuItem} item
 */
function SetMenuItem(item) {
    if (wolfermusMenuItems.find((menuItem) => menuItem.name === item.name) !== undefined) return;
    wolfermusMenuItems.push(item);
}

/**
 * Remove a Menu Item from Main Menu
 * 
 * @param {string} itemName
 */
function RemoveMenuItem(itemName) {
    let foundIndex = wolfermusMenuItems.findIndex((menuItem) => menuItem.name === itemName);
    if (foundIndex === -1) return;

    wolfermusMenuItems.splice(foundIndex, 1);
}

/**
 * Clear all Menu Items from Main Menu
 */
function ClearMenuItems() {
    wolfermusMenuItems = [];
}

/**
 * @returns {string}
 */
function GenerateMenuItems() {
    let wolfermusMenuItemsConverted = "";
    for (const menuItem of wolfermusMenuItems) {
        wolfermusMenuItemsConverted += menuItem.Generate();
    }
    return wolfermusMenuItemsConverted;
}

/**
 * Only run after appending new Menu Items to document.
 */
function AttachScriptsForItems() {
    for (const menuItem of wolfermusMenuItems) {
        if (menuItem.SetupScripts()) currentWolfermusMenuItems.push(menuItem);
    }
}

/**
 * Removes all Event Listeners currently rendered from menu items
 */
function RemoveAttachedScriptsForCurrentItems() {
    for (const menuItem of currentWolfermusMenuItems) {
        menuItem.RemoveScripts();
    }
    currentWolfermusMenuItems = [];
}

/**
 * Updates the Main Menu Style
 */
function UpdateWolfermusMainMenuStyle() {
    let mainMenuStyle = document.getElementById("WolfermusMainMenuStyle");

    if (mainMenuStyle === undefined || mainMenuStyle === null) {
        mainMenuStyle = document.createElement("style");
        mainMenuStyle.id = "WolfermusMainMenuStyle";
        document.head.append(mainMenuStyle);
    }

    const editedInnerHTML = bypassScriptPolicy.createHTML(`
.wlfDefaultFloatingButtonCSS {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

/* Tooltip text */
.wlfToolTipText {
  visibility: hidden;
  width: 120px;
  background-color: #0f0f0f;
  border-radius: 20px;
  border-color: #272727;
  border-width: 4px;
  border-style: solid;
  box-shadow: 0px 2px 17px -1px rgba(0, 0, 0, 0.3);
  color: #fff;
  text-align: center;
  padding: 5px 0;
 
  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 9500;

  width: 120px;
  top: 100%;
  left: 50%;
  margin-left: -55px;
  margin-top: 30px;
}

/* Show the tooltip text when you mouse over the tooltip container */
.wlfToolTipText.wlfToolTipActive {
  visibility: visible;
}

#wlfMainMenuWrapper {
  -khtml-user-select: none;
  -o-user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  user-select: none;
  pointer-events: none;
  position: fixed;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  z-index: 8000;
  #wlfFloatingSnapBtnWrapper {
    z-index: 0;
    -khtml-user-select: none;
    -o-user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    user-select: none;
    pointer-events: none;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 30px;
    left: 86%;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    .wlfFabBtn {
      img {
        -khtml-user-select: none;
        -o-user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        user-select: none;
        pointer-events: none;
        width: 100%;
        height: 100%;
        z-index: 0;
      }
      pointer-events: all;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border-style: solid;
      border-color: #272727;
      border-width: 4px;
      color: white;
      box-shadow: 0px 2px 17px -1px rgba(0, 0, 0, 0.3);
      z-index: 9000;
    }
    .wlfActivatedMainMenuWindow {
      pointer-events: all;
      display: none;
      position: relative;
      width: 300px;
      height: 400px;
      top: 0;
      left: 0;
      background-color: #0f0f0f;
      border-radius: 20px;
      border-color: #272727;
      border-width: 4px;
      border-style: solid;
      transition: 0.5s;
      z-index: 8500;
      box-shadow: 0px 2px 17px -1px rgba(0, 0, 0, 0.3);
    }
    &.wlfLeftPosition {
      .wlfActivatedMainMenuWindow {
        left: 110%;
        transition-delay: 0s;
      }
    }
    &.wlfRightPosition {
      .wlfActivatedMainMenuWindow {
        left: -610%;
        transition-delay: 0s;
      }
    }
    &.wlfUpPosition {
      .wlfActivatedMainMenuWindow {
        top: -700%;
        transition-delay: 0s;
      }
    }
    &.wlfDownPosition {
      .wlfActivatedMainMenuWindow {
        top: 0%;
        transition-delay: 0s;
      }
    }
    ul {
      position: relative;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      padding-top: 2%;
      padding-bottom: 2%;
      overflow: auto;
      border-radius: 15px;
      li {
        cursor: pointer;
        position: relative;
        top: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #272727;
        color: #ececec;
        list-style-type: none;
        transform: scale(0.95);
        transition: 0.5s;
        margin: 1%;
        border-radius: 20px;
        a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 12px;
            height: 32px;
            min-width: 12px;
            white-space: nowrap;
            font-family: "Roboto", "Arial", sans-serif;
            font-size: 1.4rem;
            line-height: 2rem;
            font-weight: 500;
        }
      }
    }
    &.wlfFabActive {
      li:hover {
        background-color: #3d3d3d;
      }
      li:active {
        background-color: #505050;
      }
      .wlfActivatedMainMenuWindow {
        display: block;
      }
    }
    }
    }
    `);

    mainMenuStyle.innerHTML = editedInnerHTML;
}

const contrainedPadding = 5;
let oldPositionX, oldPositionY;

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    x;
    y;
}

/**
 * 
 * @param {Position} position 
 */
async function ContrainMainMenuViaPosition(position) {
    if (currentWolfermusMenuItems.length <= 0) return;

    const mainMenuRoot = document.getElementById("wlfMainMenuWrapper");
    const fabElement = document.getElementById("wlfFloatingSnapBtnWrapper");

    if (mainMenuRoot === undefined || mainMenuRoot === null) return;
    if (fabElement === undefined || fabElement === null) return;

    while (mainMenuRoot.getBoundingClientRect().width === 0 && mainMenuRoot.getBoundingClientRect().height === 0) {
        await Sleep(100);
    }

    const windowWidth = mainMenuRoot.getBoundingClientRect().width;
    const windowHeight = mainMenuRoot.getBoundingClientRect().height;

    const buttonWidth = fabElement.getBoundingClientRect().width;
    const buttonHeight = fabElement.getBoundingClientRect().height;

    const buttonWidthDivided2 = buttonWidth / 2;
    const buttonHeightDivided2 = buttonHeight / 2;

    if ((position.x - contrainedPadding) < buttonWidthDivided2) {
        fabElement.style.left = (buttonWidthDivided2 + contrainedPadding) + "px";
    } else if ((position.x + contrainedPadding) > windowWidth - (buttonWidthDivided2)) {
        fabElement.style.left = (windowWidth - buttonWidthDivided2 - contrainedPadding) + "px";
    } else {
        fabElement.style.left = position.x + "px";
    }

    if ((position.y - contrainedPadding) < buttonHeightDivided2) {
        fabElement.style.top = (buttonHeightDivided2 + contrainedPadding) + "px";
    } else if ((position.y + contrainedPadding) > windowHeight - buttonHeightDivided2) {
        fabElement.style.top = (windowHeight - buttonHeightDivided2 - contrainedPadding) + "px";
    } else {
        fabElement.style.top = position.y + "px";
    }
}

let oldFabElementLeft, oldFabElementTop;
let oldWindowWidth, oldWindowHeight;
function ContrainMainMenu() {
    if (currentWolfermusMenuItems.length <= 0) return;

    const mainMenuRoot = document.getElementById("wlfMainMenuWrapper");
    const fabElement = document.getElementById("wlfFloatingSnapBtnWrapper");
    if (mainMenuRoot === undefined || mainMenuRoot === null) return;
    if (fabElement === undefined || fabElement === null) return;

    if (fabElement.style.left === undefined || fabElement.style.left === null) return;
    if (fabElement.style.top === undefined || fabElement.style.top === null) return;

    const windowWidth = mainMenuRoot.getBoundingClientRect().width;
    const windowHeight = mainMenuRoot.getBoundingClientRect().height;

    if (windowWidth === oldWindowWidth && windowHeight === oldWindowHeight
        && fabElement.style.left === oldFabElementLeft && fabElement.style.top === oldFabElementTop
    ) return;

    oldWindowWidth = windowWidth;
    oldWindowHeight = windowHeight;

    oldFabElementLeft = fabElement.style.left;
    oldFabElementTop = fabElement.style.top;

    const x = parseInt(fabElement.style.left.match(/\d/g).join(""));
    const y = parseInt(fabElement.style.top.match(/\d/g).join(""));

    ContrainMainMenuViaPosition(new Position(x, y));
}

/**
 * @param {PointerEvent} event 
 */
function MainMenuMove(event) {
    const mainMenuRoot = document.getElementById("wlfMainMenuWrapper");
    const fabElement = document.getElementById("wlfFloatingSnapBtnWrapper");
    if (mainMenuRoot === undefined || mainMenuRoot === null) return;
    if (fabElement === undefined || fabElement === null) return;

    const windowWidth = mainMenuRoot.getBoundingClientRect().width;
    const windowHeight = mainMenuRoot.getBoundingClientRect().height;

    const currentPosition = new Position(event.clientX, event.clientY);

    // let currentPosition = new Position();
    // if (e.type === "touchmove") {
    //     currentPosition.x = e.changedTouches[0].clientX;
    //     currentPosition.y = e.changedTouches[0].clientY;
    // } else {
    //     currentPosition.x = e.clientX;
    //     currentPosition.y = e.clientY;
    // }
    ContrainMainMenuViaPosition(currentPosition);

    if (currentPosition.x < windowWidth / 2) {
        fabElement.classList.remove("wlfRightPosition");
        fabElement.classList.add("wlfLeftPosition");
    } else {
        fabElement.classList.remove("wlfLeftPosition");
        fabElement.classList.add("wlfRightPosition");
    }

    if (currentPosition.y < windowHeight / 2) {
        fabElement.classList.remove("wlfUpPosition");
        fabElement.classList.add("wlfDownPosition");
    } else {
        fabElement.classList.remove("wlfDownPosition");
        fabElement.classList.add("wlfUpPosition");
    }
}

/**
 * @param {PointerEvent} event 
 */
function MainMenuMouseDown(event) {
    const fabElement = document.getElementById("wlfFloatingSnapBtnWrapper");
    const fabElementBtn = document.getElementById("wlfFloatingSnapBtn");
    if (fabElement === undefined || fabElement === null) return;
    if (fabElementBtn === undefined || fabElementBtn === null) return;

    fabElementBtn.setPointerCapture(event.pointerId);

    oldPositionY = fabElement.style.top;
    oldPositionX = fabElement.style.left;

    fabElementBtn.addEventListener("pointermove", MainMenuMove);

    // if (event.type === "mousedown") {
    //     window.addEventListener("mousemove", MainMenuMove);
    // } else {
    //     window.addEventListener("touchmove", MainMenuMove);
    // }

    fabElement.style.transition = "none";
}

(async () => {
    let wolfermusAntiStuckLoop1 = 100;
    while (window === undefined || window === null) {
        await Sleep(500);

        if (wolfermusAntiStuckLoop1 < 0) {
            alert("ERROR: antiStuckLoop engaged");
            return;
        }
        wolfermusAntiStuckLoop1--;

    }

    let mainWindow = window;

    try {
        if (unsafeWindow !== undefined) mainWindow = unsafeWindow;
    } catch (e) {

    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    function WolfermusCheckModuleLoaded(key) {
        if (!mainWindow["Wolfermus"]) {
            mainWindow["Wolfermus"] = {}
            return false;
        }

        if (!mainWindow["Wolfermus"][key]) return false;

        if (!mainWindow["Wolfermus"][key]["Loaded"]) return false;

        return true;
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    function WolfermusCheckLibraryLoaded(key) {
        if (!mainWindow["Wolfermus"]) {
            mainWindow["Wolfermus"] = {}
            return false;
        }

        if (!mainWindow["Wolfermus"]["Libraries"]) {
            mainWindow["Wolfermus"]["Libraries"] = {}
            return false;
        }

        if (!mainWindow["Wolfermus"]["Libraries"][key]) return false;

        if (!mainWindow["Wolfermus"]["Libraries"][key]["Loaded"]) return false;

        return true;
    }

    console.log("Wolfermus Main Menu Library Loading...");

    let wolfermusLoadLoopCounter = 0;
    while (!WolfermusCheckLibraryLoaded("StorageManager")) {
        await Sleep(500);

        if (wolfermusLoadLoopCounter >= 100) {
            alert("ERROR: antiStuckLoop engaged");
            return;
        }
        wolfermusLoadLoopCounter++;
    }

    if (WolfermusCheckLibraryLoaded("MainMenu")) return;

    if (!mainWindow["Wolfermus"]) mainWindow["Wolfermus"] = {};
    if (!mainWindow["Wolfermus"]["Libraries"]) mainWindow["Wolfermus"]["Libraries"] = {};

    mainWindow["Wolfermus"]["Libraries"]["MainMenu"] = {};
    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["Loaded"] = false;

    let wlfLogoRounded = mainWindow["Wolfermus"]["Logo"]["Rounded"];

    let Notify = mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["Notify"];
    let SetValue = mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["SetValue"];
    let GetValue = mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["GetValue"];

    /**
     * Allows a userscript to add a listener for changes to the value of a specific key in the userscript's storage.
     * 
     * The function takes two parameters:
     *  
     * - A string specifying the key for which changes should be monitored.
     * - A callback function that will be called when the value of the key changes. The callback function should have the following signature:
     * ```js
     *  function(key, oldValue, newValue, remote) {
     *      // key is the key whose value has changed
     *      // oldValue is the previous value of the key
     *      // newValue is the new value of the key
     *      // remote is a boolean indicating whether the change originated from a different userscript instance
     *  }
     * ```
     * @type {(key: string, callback: (key: string, oldValue: any, newValue: any, remote: boolean) => void) => Promise<number>}
    */
    let AddValueChangeListener = mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["AddValueChangeListener"];

    /**
     * Removes a listener for changes to the value of a specific key in the userscript's storage.
     * 
      * @type {(listenerId: number) => void}
      */
    let RemoveValueChangeListener = mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["RemoveValueChangeListener"];

    let wolfermusLoadLoopCounterDisplayString = `Wolfermus Took ${wolfermusLoadLoopCounter} loops to load`;
    if (wolfermusLoadLoopCounter === 0) wolfermusLoadLoopCounterDisplayString = "Wolfermus Loaded First Time";

    if (wolfermusLoadLoopCounter > 50) {
        await Notify({
            title: "Wolfermus LoadCounter",
            text: wolfermusLoadLoopCounterDisplayString,
            image: wlfLogoRounded
        });
    } else {
        console.log(wolfermusLoadLoopCounterDisplayString);
    }

    /**
     * @param {PointerEvent} event 
     */
    async function MainMenuMouseUp(event) {
        const fabElement = document.getElementById("wlfFloatingSnapBtnWrapper");
        const fabElementBtn = document.getElementById("wlfFloatingSnapBtn");
        if (fabElement === undefined || fabElement === null) return;
        if (fabElementBtn === undefined || fabElementBtn === null) return;

        //const GUIGotten = await GetValue("MainMenu", "{}");

        // TODO: Update StorageManagerLib to handly localStorage only options.
        if (!localStorage["WolfermusMainMenu"]) localStorage["WolfermusMainMenu"] = "{}";
        let WolfermusMainMenuSettings = JSON.parse(localStorage["WolfermusMainMenu"]);

        fabElementBtn.removeEventListener("pointermove", MainMenuMove);

        fabElementBtn.releasePointerCapture(event.pointerId);

        // if (e.type === "mouseup") {
        //     window.removeEventListener("mousemove", MainMenuMove);
        // } else {
        //     window.removeEventListener("touchmove", MainMenuMove);
        // }
        //snapToSide(e);
        fabElement.style.transition = "0.3s ease-in-out left";

        WolfermusMainMenuSettings.Top = parseInt(fabElement.style.top.match(/\d/g).join(""));
        WolfermusMainMenuSettings.Left = parseInt(fabElement.style.left.match(/\d/g).join(""));

        // if (e.type === "mouseup") {
        //     WolfermusMainMenuSettings.Top = e.clientY;
        //     WolfermusMainMenuSettings.Left = e.clientX;
        // } else {
        //     WolfermusMainMenuSettings.Top = e.touches[0].clientY;
        //     WolfermusMainMenuSettings.Left = e.touches[0].clientX;
        // }

        if (!WolfermusMainMenuSettings.Direction) WolfermusMainMenuSettings.Direction = {};

        WolfermusMainMenuSettings.Direction.Vertical = "wlfDownPosition";
        WolfermusMainMenuSettings.Direction.Horizontal = "wlfLeftPosition";
        if (fabElement.classList.contains("wlfUpPosition")) {
            WolfermusMainMenuSettings.Direction.Vertical = "wlfUpPosition";
        }
        if (fabElement.classList.contains("wlfRightPosition")) {
            WolfermusMainMenuSettings.Direction.Horizontal = "wlfRightPosition";
        }

        // TODO: Update StorageManagerLib to handly localStorage only options.
        localStorage["WolfermusMainMenu"] = JSON.stringify(WolfermusMainMenuSettings);

        // SetValue("MainMenu", JSON.stringify(WolfermusMainMenuSettings));
    }

    function MainMenuClick(event) {
        const fabElement = document.getElementById("wlfFloatingSnapBtnWrapper");
        if (fabElement === undefined || fabElement === null) return;

        if (
            oldPositionY === fabElement.style.top &&
            oldPositionX === fabElement.style.left
        ) {
            fabElement.classList.toggle("wlfFabActive");
        }
    }

    let wlfToolTipsElement = undefined;
    /**
     * @param {PointerEvent} event 
     */
    function ToolTipPointerMove(event) {
        if (currentWolfermusMenuItems.length <= 0) return;

        if (wlfToolTipsElement === undefined || wlfToolTipsElement === null) {
            wlfToolTipsElement = document.getElementById("WolfermusMenuItemToolTip");
            if (wlfToolTipsElement === undefined || wlfToolTipsElement === null) return;
        }
        if (!wlfToolTipsElement.classList.contains("wlfToolTipActive") && !wlfToolTipsElement.classList.contains("wlfToolTipSetActive")) return;

        const x = event.clientX;
        const y = event.clientY;
        wlfToolTipsElement.style.top = (y) + 'px';
        wlfToolTipsElement.style.left = (x) + 'px';
    }

    function AttachInteractionEventsToMainMenu() {
        const fabElementBtn = document.getElementById("wlfFloatingSnapBtn");
        if (fabElementBtn === undefined || fabElementBtn === null) return;

        fabElementBtn.addEventListener("pointerdown", MainMenuMouseDown);
        fabElementBtn.addEventListener("pointerup", MainMenuMouseUp);

        //fabElementBtn.addEventListener("mousedown", MainMenuMouseDown);
        //fabElementBtn.addEventListener("mouseup", MainMenuMouseUp);

        //fabElementBtn.addEventListener("touchstart", MainMenuMouseDown);
        //fabElementBtn.addEventListener("touchend", MainMenuMouseUp);

        fabElementBtn.addEventListener("click", MainMenuClick);

        window.addEventListener('pointermove', ToolTipPointerMove);
    }

    function RemoveInteractionEventsToMainMenu() {
        const fabElementBtn = document.getElementById("wlfFloatingSnapBtn");
        if (fabElementBtn === undefined || fabElementBtn === null) return;

        fabElementBtn.removeEventListener("pointerdown", MainMenuMouseDown);
        fabElementBtn.removeEventListener("pointerup", MainMenuMouseUp);

        //fabElementBtn.removeEventListener("mousedown", MainMenuMouseDown);
        //fabElementBtn.removeEventListener("mouseup", MainMenuMouseUp);

        //fabElementBtn.removeEventListener("touchstart", MainMenuMouseDown);
        //fabElementBtn.removeEventListener("touchend", MainMenuMouseUp);

        fabElementBtn.removeEventListener("click", MainMenuClick);

        window.removeEventListener('pointermove', ToolTipPointerMove);
        wlfToolTipsElement = undefined;
    }

    function FullscreenChangeMainMenu() {
        if (currentWolfermusMenuItems.length <= 0) return;

        let mainMenuRoot = document.getElementById("wlfMainMenuWrapper");
        if (mainMenuRoot === undefined || mainMenuRoot === null) return;

        if (document.fullscreenElement !== null) {
            mainMenuRoot.style.display = "none";
        } else {
            mainMenuRoot.style.display = "block";
        }
    }

    /**
     * Update Main Menu Items
     */
    async function UpdateMenuItems() {
        let mainMenuRoot = document.getElementById("wlfMainMenuWrapper");
        let creatingMainMenuRoot = false;
        if (mainMenuRoot === undefined || mainMenuRoot === null) {
            if (wolfermusMenuItems.length <= 0) return;

            mainMenuRoot = document.createElement("div");
            mainMenuRoot.id = "wlfMainMenuWrapper";
            mainMenuRoot.classList = "wlfDefaultFloatingButtonCSS";
            mainMenuRoot.style.display = "none";

            creatingMainMenuRoot = true;
        }

        //const GUIGotten = await GetValue("MainMenu", "{}");

        // TODO: Update StorageManagerLib to handly localStorage only options.
        if (!localStorage["WolfermusMainMenu"]) localStorage["WolfermusMainMenu"] = "{}";
        let WolfermusMainMenuSettings = JSON.parse(localStorage["WolfermusMainMenu"]);

        RemoveInteractionEventsToMainMenu();
        RemoveAttachedScriptsForCurrentItems();

        if (wolfermusMenuItems.length <= 0) {
            mainMenuRoot.style.display = "none";
            return;
        }

        let imgSrc = "";
        if (!mainWindow["Wolfermus"]["Logo"] || !mainWindow["Wolfermus"]["Logo"]["Rounded"]) {
            console.log("Unable to locate logo");
        } else imgSrc = mainWindow["Wolfermus"]["Logo"]["Rounded"];

        const editedInnerHTML = bypassScriptPolicy.createHTML(`
  <span id="WolfermusMenuItemToolTip" class="wlfToolTipText"></span>
  <div id="wlfFloatingSnapBtnWrapper" class="wlfDefaultFloatingButtonCSS ${WolfermusMainMenuSettings.Direction?.Horizontal ? WolfermusMainMenuSettings.Direction?.Horizontal : ""} ${WolfermusMainMenuSettings.Direction?.Vertical ? WolfermusMainMenuSettings.Direction?.Vertical : ""}"
    style="${WolfermusMainMenuSettings.Top ? "top: " + WolfermusMainMenuSettings.Top + "px;" : ""} ${WolfermusMainMenuSettings.Left ? "left: " + WolfermusMainMenuSettings.Left + "px;" : ""}">
    <!-- BEGIN :: Floating Button -->
    <div id="wlfFloatingSnapBtn" class="wlfFabBtn wlfDefaultFloatingButtonCSS">
      <img src="${imgSrc}" class="wlfDefaultFloatingButtonCSS"></img>
    </div>
    <!-- END :: Floating Button -->
    <!-- BEGIN :: Expand Section -->
    <div class="wlfActivatedMainMenuWindow wlfDefaultFloatingButtonCSS">
      <ul class="wlfDefaultFloatingButtonCSS">
        ${GenerateMenuItems()}
      </ul>
    </div>
    <!-- END :: Expand Section -->
  </div>
    `);

        mainMenuRoot.innerHTML = editedInnerHTML;

        if (creatingMainMenuRoot) {
            document.body.append(mainMenuRoot);
        }
        mainMenuRoot.style.display = "none";

        AttachScriptsForItems();

        AttachInteractionEventsToMainMenu();
        if (creatingMainMenuRoot) {
            // Event listener for fullscreen changes
            document.addEventListener('fullscreenchange', FullscreenChangeMainMenu);
            window.addEventListener('resize', ContrainMainMenu);
        }

        ContrainMainMenuViaPosition(new Position(WolfermusMainMenuSettings.Left, WolfermusMainMenuSettings.Top));
        if (document.fullscreenElement !== null) {
            mainMenuRoot.style.display = "none";
        } else {
            mainMenuRoot.style.display = "block";
        }
    }

    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["Loaded"] = false;

    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["WolfermusMenuItem"] = WolfermusMenuItem;

    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["SetMenuItem"] = SetMenuItem;
    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["RemoveMenuItem"] = RemoveMenuItem;
    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["ClearMenuItems"] = ClearMenuItems;

    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["UpdateMenuItems"] = UpdateMenuItems;
    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["UpdateWolfermusMainMenuStyle"] = UpdateWolfermusMainMenuStyle;

    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["Loaded"] = true;
})();
