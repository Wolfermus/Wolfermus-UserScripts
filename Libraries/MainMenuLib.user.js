// ==UserScript==
// @name         Wolfermus Main Menu Library
// @namespace    https://greasyfork.org/en/users/900467-feb199
// @version      1.2.2
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
// @connect      raw.githubusercontent.com
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM_setValue
// @grant        GM.setValue
// @grant        GM_addValueChangeListener
// @grant        GM.addValueChangeListener
// @grant        GM_notification
// @grant        GM.notification
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlHttpRequest
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

    HideToolTip() {
        if (this.#tooltipTimeoutID !== undefined) {
            clearTimeout(this.#tooltipTimeoutID);
            this.#tooltipTimeoutID = undefined;
        }

        const toolTips = document.getElementById("WolfermusMenuItemToolTip");
        const toolTipsText = document.getElementById("WolfermusToolTipText");
        if (toolTips === undefined || toolTips === null) return;
        if (toolTipsText === undefined || toolTipsText === null) return;

        toolTipsText.innerText = "";

        toolTips.classList.remove("WolfermusToolTipSetActive");
        toolTips.classList.remove("WolfermusActive");
    }

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
        const toolTipsText = document.getElementById("WolfermusToolTipText");
        if (toolTips === undefined || toolTips === null) return;
        if (toolTipsText === undefined || toolTipsText === null) return;

        toolTipsText.innerText = this.tooltip;

        toolTips.classList.add("WolfermusToolTipSetActive");

        const x = event.clientX;
        const y = (event.clientY) + 30;

        ContrainElementViaPosition(toolTips, new Position(x, y), true, false);

        this.#tooltipTimeoutID = setTimeout(() => {
            const toolTips = document.getElementById("WolfermusMenuItemToolTip");
            const toolTipsText = document.getElementById("WolfermusToolTipText");
            if (toolTips === undefined || toolTips === null) return;
            if (toolTipsText === undefined || toolTipsText === null) return;

            toolTipsText.innerText = this.tooltip;

            toolTips.classList.add("WolfermusActive");
            toolTips.classList.remove("WolfermusToolTipSetActive");

        }, this.tooltipTimeOut);
    };

    /**
     * 
     * @param {PointerEvent} event 
     * @type {(PointerEvent) => void}
     */
    pointerLeaveCallback = (event) => { this.HideToolTip(); };
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
    pointerCancelCallback = (event) => { this.HideToolTip(); };

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
     * @returns {HTMLElement | null}
     */
    GetElement() {
        let gottenElement = document.getElementById(`WolfermusMenuItem${this.name}`);
        if (gottenElement === undefined || gottenElement === null) return null;
        return gottenElement;
    }

    /**
     * @returns {string}
     */
    Generate() {
        return `
        <li id="WolfermusMenuItem${this.name}" class="WolfermusDefaultCSS">
            <a>${this.title}</a>
        </li>`
    }
    /**
     * @returns {Boolean}
     */
    SetupScripts() {
        let gottenElement = this.GetElement();
        if (gottenElement === null) return false;

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
        let gottenElement = this.GetElement();

        if (this.#tooltipTimeoutID !== undefined) {
            clearTimeout(this.#tooltipTimeoutID);
            this.#tooltipTimeoutID = undefined;
        }

        if (gottenElement !== null) {
            if (this.#currentClickCallback !== undefined) gottenElement.removeEventListener("click", this.#currentClickCallback);
            if (this.#currentDoubleClickCallback !== undefined) gottenElement.removeEventListener("dblclick", this.#currentDoubleClickCallback);
            if (this.#currentPointerEnterCallback !== undefined) gottenElement.removeEventListener("pointerenter", this.#currentPointerEnterCallback);
            if (this.#currentPointerLeaveCallback !== undefined) gottenElement.removeEventListener("pointerleave", this.#currentPointerLeaveCallback);
            if (this.#currentPointerDownCallback !== undefined) gottenElement.removeEventListener("pointerdown", this.#currentPointerDownCallback);
            if (this.#currentPointerUpCallback !== undefined) gottenElement.removeEventListener("pointerup", this.#currentPointerUpCallback);
            if (this.#currentPointerMoveCallback !== undefined) gottenElement.removeEventListener("pointermove", this.#currentPointerMoveCallback);
            if (this.#currentPointerCancelCallback !== undefined) gottenElement.removeEventListener("pointercancel", this.#currentPointerCancelCallback);
        }

        if (this.#tooltipTimeoutID !== undefined) {
            clearTimeout(this.#tooltipTimeoutID);
            this.#tooltipTimeoutID = undefined;
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
 * @type {Array<WolfermusMenuItem>}
 */
let wolfermusContextMenuItems = [];
/**
 * @type {Array<WolfermusMenuItem>}
 */
let currentWolfermusContextMenuItems = [];

/**
 * Add/Set a Menu Item to Main Menu
 * @param {WolfermusMenuItem} item
 */
function SetMainMenuItem(item) {
    if (wolfermusMenuItems.find((menuItem) => menuItem.name === item.name) !== undefined) return;
    wolfermusMenuItems.push(item);
}

/**
 * Remove a Menu Item from Main Menu
 * 
 * @param {string} itemName
 */
function RemoveMainMenuItem(itemName) {
    let foundIndex = wolfermusMenuItems.findIndex((menuItem) => menuItem.name === itemName);
    if (foundIndex === -1) return;

    wolfermusMenuItems.splice(foundIndex, 1);
}

/**
 * Clear all Menu Items from Main Menu
 */
function ClearMainMenuItems() {
    wolfermusMenuItems = [];
}

/**
 * Add/Set a Menu Item to Context Menu
 * @param {WolfermusMenuItem} item
 */
function SetContextMenuItem(item) {
    if (wolfermusContextMenuItems.find((menuItem) => menuItem.name === item.name) !== undefined) return;
    wolfermusContextMenuItems.push(item);
}

/**
 * Remove a Menu Item from Context Menu
 * 
 * @param {string} itemName
 */
function RemoveContextMenuItem(itemName) {
    let foundIndex = wolfermusContextMenuItems.findIndex((menuItem) => menuItem.name === itemName);
    if (foundIndex === -1) return;

    wolfermusContextMenuItems.splice(foundIndex, 1);
}

/**
 * Clear all Menu Items from Context Menu
 */
function ClearContextMenuItems() {
    wolfermusContextMenuItems = [];
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
function SetupScriptsForItems() {
    for (const menuItem of wolfermusMenuItems) {
        if (menuItem.SetupScripts()) currentWolfermusMenuItems.push(menuItem);
    }

    for (const menuItem of wolfermusContextMenuItems) {
        if (menuItem.SetupScripts()) currentWolfermusContextMenuItems.push(menuItem);
    }
}

/**
 * Removes all Event Listeners currently rendered from menu items
 */
function RemoveScriptsForCurrentItems() {
    for (const menuItem of currentWolfermusMenuItems) {
        menuItem.RemoveScripts();
    }
    currentWolfermusMenuItems = [];

    for (const menuItem of currentWolfermusContextMenuItems) {
        menuItem.RemoveScripts();
    }
    currentWolfermusContextMenuItems = [];
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
 * @param {HTMLElement} elementToContrain 
 * @param {Position} position 
 * @param {Boolean} shouldDivideElementToContrainDimentionByTwo 
 */
async function ContrainElementViaPosition(elementToContrain, position, shouldDivideElementWidthToContrainDimentionByTwo = true, shouldDivideElementHeightToContrainDimentionByTwo = true) {
    if (currentWolfermusMenuItems.length <= 0) return;

    const mainMenuRoot = document.getElementById("WolfermusMainMenuWrapper");

    if (mainMenuRoot === undefined || mainMenuRoot === null) return;
    if (elementToContrain === undefined || elementToContrain === null) return;

    while (mainMenuRoot.getBoundingClientRect().width === 0 && mainMenuRoot.getBoundingClientRect().height === 0) {
        await Sleep(100);
    }

    const windowWidth = mainMenuRoot.getBoundingClientRect().width;
    const windowHeight = mainMenuRoot.getBoundingClientRect().height;

    const elementToContrainWidth = elementToContrain.getBoundingClientRect().width;
    const elementToContrainHeight = elementToContrain.getBoundingClientRect().height;

    let elementToContrainWidthDivided2 = elementToContrainWidth;
    let elementToContrainHeightDivided2 = elementToContrainHeight;
    if (shouldDivideElementWidthToContrainDimentionByTwo) {
        elementToContrainWidthDivided2 = elementToContrainWidth / 2;
    }
    if (shouldDivideElementHeightToContrainDimentionByTwo) {
        elementToContrainHeightDivided2 = elementToContrainHeight / 2;
    }

    if ((position.x - contrainedPadding) < (shouldDivideElementWidthToContrainDimentionByTwo ? elementToContrainWidthDivided2 : 0)) {
        elementToContrain.style.left = ((shouldDivideElementWidthToContrainDimentionByTwo ? elementToContrainWidthDivided2 : 0) + contrainedPadding) + "px";
    } else if ((position.x + contrainedPadding) > windowWidth - (elementToContrainWidthDivided2)) {
        elementToContrain.style.left = (windowWidth - elementToContrainWidthDivided2 - contrainedPadding) + "px";
    } else {
        elementToContrain.style.left = position.x + "px";
    }

    if ((position.y - contrainedPadding) < (shouldDivideElementHeightToContrainDimentionByTwo ? elementToContrainHeightDivided2 : 0)) {
        elementToContrain.style.top = ((shouldDivideElementHeightToContrainDimentionByTwo ? elementToContrainHeightDivided2 : 0) + contrainedPadding) + "px";
    } else if ((position.y + contrainedPadding) > windowHeight - elementToContrainHeightDivided2) {
        elementToContrain.style.top = (windowHeight - elementToContrainHeightDivided2 - contrainedPadding) + "px";
    } else {
        elementToContrain.style.top = position.y + "px";
    }
}

let oldFabElementLeft, oldFabElementTop;
let oldWindowWidth, oldWindowHeight;
function ContrainMainMenu() {
    if (currentWolfermusMenuItems.length <= 0) return;

    const mainMenuRoot = document.getElementById("WolfermusMainMenuWrapper");
    const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
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

    ContrainElementViaPosition(fabElement, new Position(x, y));
}

/**
 * @param {PointerEvent} event 
 */
function MainMenuMove(event) {
    const mainMenuRoot = document.getElementById("WolfermusMainMenuWrapper");
    const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
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
    ContrainElementViaPosition(fabElement, currentPosition);

    if (currentPosition.x < windowWidth / 2) {
        fabElement.classList.remove("WolfermusRightPosition");
        fabElement.classList.add("WolfermusLeftPosition");
    } else {
        fabElement.classList.remove("WolfermusLeftPosition");
        fabElement.classList.add("WolfermusRightPosition");
    }

    if (currentPosition.y < windowHeight / 2) {
        fabElement.classList.remove("WolfermusUpPosition");
        fabElement.classList.add("WolfermusDownPosition");
    } else {
        fabElement.classList.remove("WolfermusDownPosition");
        fabElement.classList.add("WolfermusUpPosition");
    }
}

/**
 * @param {PointerEvent} event 
 */
function MainMenuMouseDown(event) {
    const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
    const fabElementBtn = document.getElementById("WolfermusFloatingSnapBtn");
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

/**
 * @returns {string}
 */
function GenerateContextItems() {
    let wolfermusContextItemsConverted = "";
    for (const menuItem of wolfermusContextMenuItems) {
        wolfermusContextItemsConverted += menuItem.Generate();
    }
    return wolfermusContextItemsConverted;
}

let withinContextMenu = false;

/**
 * @param {PointerEvent} event 
 */
function ContextMenuPointerEnter(event) {
    withinContextMenu = true;
}

/**
 * @param {PointerEvent} event 
 */
function ContextMenuPointerLeave(event) {
    withinContextMenu = false;
}

/**
 * @param {PointerEvent} event 
 */
function ContextMenuRemoveActiveIfNotWithin(event) {
    if (!withinContextMenu) {
        RemoveTempContextMenuListeners();

        const contextMenu = document.getElementById("WolfermusMainMenuContextMenu");
        if (contextMenu === undefined || contextMenu === null) return;

        contextMenu.classList.remove("WolfermusActive");
    }
}

function AddTempContextMenuListeners() {
    const contextMenu = document.getElementById("WolfermusMainMenuContextMenu");
    if (contextMenu === undefined || contextMenu === null) return;

    contextMenu.addEventListener("pointerenter", ContextMenuPointerEnter);
    contextMenu.addEventListener("pointerleave", ContextMenuPointerLeave);
    window.addEventListener("pointerdown", ContextMenuRemoveActiveIfNotWithin);
    window.addEventListener("pointerup", ContextMenuRemoveActiveIfNotWithin);
    window.addEventListener("pointercancel", ContextMenuRemoveActiveIfNotWithin);
}

function RemoveTempContextMenuListeners() {
    window.removeEventListener("pointerdown", ContextMenuRemoveActiveIfNotWithin);
    window.removeEventListener("pointerup", ContextMenuRemoveActiveIfNotWithin);
    window.removeEventListener("pointercancel", ContextMenuRemoveActiveIfNotWithin);

    const contextMenu = document.getElementById("WolfermusMainMenuContextMenu");
    if (contextMenu === undefined || contextMenu === null) return;

    contextMenu.removeEventListener("pointerenter", ContextMenuPointerEnter);
    contextMenu.removeEventListener("pointerleave", ContextMenuPointerLeave);
}

/**
 * @param {PointerEvent} event 
 */
function ContextMenuCallback(event) {
    event.preventDefault();
    const contextMenu = document.getElementById("WolfermusMainMenuContextMenu");
    if (contextMenu === undefined || contextMenu === null) return;

    const x = event.clientX;
    const y = event.clientY;

    AddTempContextMenuListeners();

    contextMenu.classList.add("WolfermusActive");

    ContrainElementViaPosition(contextMenu, new Position(x, y), false, false);
}

(async () => {
    let IsGMXmlHttpRequest1 = false;
    // @ts-ignore
    if (typeof GM_xmlHttpRequest !== "undefined" && typeof GM_xmlHttpRequest !== "null" && GM_xmlHttpRequest) IsGMXmlHttpRequest1 = true;

    let IsGMXmlHttpRequest2 = false;
    // @ts-ignore
    if (typeof GM !== "undefined" && typeof GM.xmlHttpRequest !== "undefined") IsGMXmlHttpRequest2 = true;

    let IsGMXmlHttpRequest = false;
    if (IsGMXmlHttpRequest1 || IsGMXmlHttpRequest2) IsGMXmlHttpRequest = true;

    if (!IsGMXmlHttpRequest) {
        const message = "Wolfermus ERROR: Main - Please run in a userscript manager";
        alert(message);
        console.log(message);
        return;
    }

    let ChosenXmlHttpRequest;
    if (IsGMXmlHttpRequest2) {
        ChosenXmlHttpRequest = GM.xmlHttpRequest;
    } else if (IsGMXmlHttpRequest1) {
        ChosenXmlHttpRequest = GM_xmlHttpRequest;
    } else {
        const message = "Wolfermus ERROR: Main - Unexpected Error";
        alert(message);
        console.log(message);
        return;
    }
    if (ChosenXmlHttpRequest === undefined || ChosenXmlHttpRequest === null) {
        const message = "Wolfermus ERROR: Main - Unexpected Error";
        alert(message);
        console.log(message);
        return;
    }

    function MakeGetRequest(url) {
        return new Promise((resolve, reject) => {
            ChosenXmlHttpRequest({
                method: "GET",
                url: url,
                onload: (response) => {
                    if (response.status !== 200) {
                        reject(statusText);
                        return;
                    }
                    resolve(response.responseText);
                },
                onerror: error => reject(error)
            });
        });
    }

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

    //#region Loading and getting functions

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

    //#endregion -Loading and getting functions

    /**
 * Updates the Main Menu Style
 * @async
 */
    async function UpdateWolfermusMainMenuStyle() {
        let mainMenuStyle = document.getElementById("WolfermusMainMenuStyle");

        if (mainMenuStyle === undefined || mainMenuStyle === null) {
            mainMenuStyle = document.createElement("style");
            mainMenuStyle.id = "WolfermusMainMenuStyle";
            document.head.append(mainMenuStyle);
        }

        async function GetCSS() {
            const css = bypassScriptPolicy.createScript(await MakeGetRequest(`https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/main/Resources/MainMenuLib.css`));
            return css;
        }

        let wolfermusPreventLoopLock1 = 10;
        async function AttemptLoadCSS() {
            return await GetCSS().then(async (response) => {
                return response;
            }).catch(async (error) => {
                if (wolfermusPreventLoopLock1 <= 0) return;
                wolfermusPreventLoopLock1--;
                await Sleep(500);
                return await AttemptLoadCSS();
            });
        }

        const editedInnerHTML = bypassScriptPolicy.createHTML(await AttemptLoadCSS());

        mainMenuStyle.innerHTML = editedInnerHTML;
    }

    /**
     * @param {PointerEvent} event 
     */
    async function MainMenuMouseUp(event) {
        const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
        const fabElementBtn = document.getElementById("WolfermusFloatingSnapBtn");
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

        WolfermusMainMenuSettings.Direction.Vertical = "WolfermusDownPosition";
        WolfermusMainMenuSettings.Direction.Horizontal = "WolfermusLeftPosition";
        if (fabElement.classList.contains("WolfermusUpPosition")) {
            WolfermusMainMenuSettings.Direction.Vertical = "WolfermusUpPosition";
        }
        if (fabElement.classList.contains("WolfermusRightPosition")) {
            WolfermusMainMenuSettings.Direction.Horizontal = "WolfermusRightPosition";
        }

        // TODO: Update StorageManagerLib to handly localStorage only options.
        localStorage["WolfermusMainMenu"] = JSON.stringify(WolfermusMainMenuSettings);

        // SetValue("MainMenu", JSON.stringify(WolfermusMainMenuSettings));
    }

    function MainMenuClick(event) {
        const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
        if (fabElement === undefined || fabElement === null) return;

        if (
            oldPositionY === fabElement.style.top &&
            oldPositionX === fabElement.style.left
        ) {
            fabElement.classList.toggle("WolfermusActive");
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
        if (!wlfToolTipsElement.classList.contains("WolfermusActive") && !wlfToolTipsElement.classList.contains("WolfermusToolTipSetActive")) return;

        const x = event.clientX;
        const y = (event.clientY) + 30;

        ContrainElementViaPosition(wlfToolTipsElement, new Position(x, y), true, false);
    }

    function AttachInteractionEventsToMainMenu() {
        const fabElementBtn = document.getElementById("WolfermusFloatingSnapBtn");
        if (fabElementBtn === undefined || fabElementBtn === null) return;

        fabElementBtn.addEventListener("pointerdown", MainMenuMouseDown);
        fabElementBtn.addEventListener("pointerup", MainMenuMouseUp);

        //fabElementBtn.addEventListener("mousedown", MainMenuMouseDown);
        //fabElementBtn.addEventListener("mouseup", MainMenuMouseUp);

        //fabElementBtn.addEventListener("touchstart", MainMenuMouseDown);
        //fabElementBtn.addEventListener("touchend", MainMenuMouseUp);

        fabElementBtn.addEventListener("click", MainMenuClick);

        fabElementBtn.addEventListener("contextmenu", ContextMenuCallback);

        window.addEventListener('pointermove', ToolTipPointerMove);
    }

    function RemoveInteractionEventsToMainMenu() {
        const fabElementBtn = document.getElementById("WolfermusFloatingSnapBtn");
        if (fabElementBtn === undefined || fabElementBtn === null) return;

        fabElementBtn.removeEventListener("pointerdown", MainMenuMouseDown);
        fabElementBtn.removeEventListener("pointerup", MainMenuMouseUp);

        //fabElementBtn.removeEventListener("mousedown", MainMenuMouseDown);
        //fabElementBtn.removeEventListener("mouseup", MainMenuMouseUp);

        //fabElementBtn.removeEventListener("touchstart", MainMenuMouseDown);
        //fabElementBtn.removeEventListener("touchend", MainMenuMouseUp);

        fabElementBtn.removeEventListener("click", MainMenuClick);

        fabElementBtn.removeEventListener("contextmenu", ContextMenuCallback);

        window.removeEventListener('pointermove', ToolTipPointerMove);
        wlfToolTipsElement = undefined;
    }

    function FullscreenChangeMainMenu() {
        if (currentWolfermusMenuItems.length <= 0) return;

        let mainMenuRoot = document.getElementById("WolfermusMainMenuWrapper");
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
        let mainMenuRoot = document.getElementById("WolfermusMainMenuWrapper");
        let creatingMainMenuRoot = false;
        if (mainMenuRoot === undefined || mainMenuRoot === null) {
            if (wolfermusMenuItems.length <= 0) return;

            mainMenuRoot = document.createElement("div");
            mainMenuRoot.id = "WolfermusMainMenuWrapper";
            mainMenuRoot.classList = "WolfermusDefaultCSS";
            mainMenuRoot.style.display = "none";

            creatingMainMenuRoot = true;
        }

        //const GUIGotten = await GetValue("MainMenu", "{}");

        // TODO: Update StorageManagerLib to handly localStorage only options.
        if (!localStorage["WolfermusMainMenu"]) localStorage["WolfermusMainMenu"] = "{}";
        let WolfermusMainMenuSettings = JSON.parse(localStorage["WolfermusMainMenu"]);

        RemoveInteractionEventsToMainMenu();
        RemoveScriptsForCurrentItems();
        RemoveTempContextMenuListeners();

        if (wolfermusMenuItems.length <= 0) {
            mainMenuRoot.style.display = "none";
            return;
        }

        let imgSrc = "";
        if (!mainWindow["Wolfermus"]["Logo"] || !mainWindow["Wolfermus"]["Logo"]["Rounded"]) {
            console.log("Unable to locate logo");
        } else imgSrc = mainWindow["Wolfermus"]["Logo"]["Rounded"];

        async function GetHTML() {
            const script = bypassScriptPolicy.createScript(await MakeGetRequest(`https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/main/Resources/MainMenuLibHTML.js`));
            return script;
        }

        let wolfermusPreventLoopLock1 = 10;
        async function AttemptLoadHTML() {
            return await GetHTML().then(async (response) => {
                return response;
            }).catch(async (error) => {
                if (wolfermusPreventLoopLock1 <= 0) return;
                wolfermusPreventLoopLock1--;
                await Sleep(500);
                return await AttemptLoadHTML();
            });
        }

        const editedInnerHTML = bypassScriptPolicy.createHTML(eval(await AttemptLoadHTML()));

        mainMenuRoot.innerHTML = editedInnerHTML;
        if (mainMenuRoot.innerHTML === "") {
            mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["Loaded"] = false;
            return;
        }

        if (creatingMainMenuRoot) {
            document.documentElement.appendChild(mainMenuRoot);
        }
        mainMenuRoot.style.display = "none";

        SetupScriptsForItems();

        AttachInteractionEventsToMainMenu();
        if (creatingMainMenuRoot) {
            // Event listener for fullscreen changes
            document.addEventListener('fullscreenchange', FullscreenChangeMainMenu);
            window.addEventListener('resize', ContrainMainMenu);
        }

        const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
        if (document.fullscreenElement !== null) {
            mainMenuRoot.style.display = "none";
        } else {
            mainMenuRoot.style.display = "block";
        }
        ContrainElementViaPosition(fabElement, new Position(WolfermusMainMenuSettings.Left, WolfermusMainMenuSettings.Top));
    }

    const updateMenuItemsContextMenuItem = new WolfermusMenuItem(
        "WolfermusUpdateMenuItemsContextMenuItem",
        "Update Menu Items",
        `This Refreshes/Updates this whole menu
        (left click and right click)
        and the floating button itself`
    );
    updateMenuItemsContextMenuItem.clickCallback = UpdateMenuItems;

    const updateWolfermusMainMenuStyleContextMenuItem = new WolfermusMenuItem(
        "WolfermusUpdateWolfermusMainMenuStyleContextMenuItem",
        "Update Wolfermus Main Menu Style CSS",
        `This Refreshes/Updates the Wolfermus Main Menu Style CSS`
    );
    updateWolfermusMainMenuStyleContextMenuItem.clickCallback = async (event) => {
        await UpdateWolfermusMainMenuStyle();

        const contextMenu = document.getElementById("WolfermusMainMenuContextMenu");
        if (contextMenu === undefined || contextMenu === null) return;

        contextMenu.classList.remove("WolfermusActive");

        updateWolfermusMainMenuStyleContextMenuItem.HideToolTip();
    };

    SetContextMenuItem(updateMenuItemsContextMenuItem);
    SetContextMenuItem(updateWolfermusMainMenuStyleContextMenuItem);

    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["Loaded"] = false;

    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["WolfermusMenuItem"] = WolfermusMenuItem;

    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["SetMainMenuItem"] = SetMainMenuItem;
    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["RemoveMainMenuItem"] = RemoveMainMenuItem;
    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["ClearMainMenuItems"] = ClearMainMenuItems;

    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["UpdateMenuItems"] = UpdateMenuItems;
    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["UpdateWolfermusMainMenuStyle"] = UpdateWolfermusMainMenuStyle;

    mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["Loaded"] = true;
})();
