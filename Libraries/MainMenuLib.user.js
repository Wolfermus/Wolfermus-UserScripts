// ==UserScript==
// @name         Wolfermus Main Menu Library
// @namespace    https://greasyfork.org/en/users/900467-feb199
// @version      2.0.2
// @description  This script is a main menu library that provides easy means to add menu items and manipulate main menu
// @author       Feb199/Dannysmoka
// @homepageURL  https://github.com/Wolfermus/Wolfermus-UserScripts
// @supportURL   https://github.com/Wolfermus/Wolfermus-UserScripts/issues
// @license      GPLv3
// @noframes
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

if (typeof wolfermusBypassScriptPolicy === "undefined" || typeof wolfermusBypassScriptPolicy === "null") {
    var wolfermusBypassScriptPolicy = trustedTypes.createPolicy("wolfermusBypassScript", {
        createHTML: (string) => string,
        createScript: (string) => string,
        createScriptURL: (string) => string
    });
}

//#region Setting Up ChosenXmlHttpRequest
if (typeof MakeGetRequest === "undefined" || typeof MakeGetRequest === "null") {
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
        console.error(message);
        throw new Error(message);
    }

    var ChosenXmlHttpRequest;
    if (IsGMXmlHttpRequest2) {
        ChosenXmlHttpRequest = GM.xmlHttpRequest;
    } else if (IsGMXmlHttpRequest1) {
        ChosenXmlHttpRequest = GM_xmlHttpRequest;
    } else {
        const message = "Wolfermus ERROR: Main - Unexpected Error";
        console.error(message);
        throw new Error(message);
    }
    if (ChosenXmlHttpRequest === undefined || ChosenXmlHttpRequest === null) {
        const message = "Wolfermus ERROR: Main - Unexpected Error";
        console.error(message);
        throw new Error(message);
    }
    //#endregion -Setting Up ChosenXmlHttpRequest
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

/**
 * @param {number | undefined} ms
 */
function Sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    });
}

/**
 * @returns {Window}
 */
function GetWindow() {
    let gottenWindow = window;

    try {
        if (unsafeWindow !== undefined) gottenWindow = unsafeWindow;
    } catch (e) {

    }

    return gottenWindow;
}

/**
 * @description Returns object of said module, if createIfNotFound is true then this function does not return undefined.
 * 
 * @param {string} key
 * @param {boolean} [createIfNotFound=false]
 * @throws If key is reserved
 * @returns {any | undefined}
 */
function WolfermusGetModule(key, createIfNotFound = false) {
    let mainWindow = GetWindow();

    if (key === "Libraries") {
        throw new Error(`Wolfermus ERROR: MainMenuLib - ${key} is reserved`);
        return undefined;
    }

    if (!mainWindow["Wolfermus"]) {
        if (createIfNotFound) mainWindow["Wolfermus"] = {};
        else return undefined;
    }

    if (createIfNotFound && !mainWindow["Wolfermus"][key]) {
        return mainWindow["Wolfermus"][key] = {};
    }

    return mainWindow["Wolfermus"][key];
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function WolfermusCheckModuleLoaded(key) {
    const gottenModule = WolfermusGetModule(key);

    if (!gottenModule) return false;
    if (!gottenModule["Loaded"]) return false;

    return true;
}

/**
 * @description Returns object of said library, if createIfNotFound is true then this function does not return undefined.
 * 
 * @param {string} key
 * @param {boolean} [createIfNotFound=false]
 * @returns {any | undefined}
 */
function WolfermusGetLibrary(key, createIfNotFound = false) {
    let mainWindow = GetWindow();

    if (!mainWindow["Wolfermus"]) {
        if (createIfNotFound) mainWindow["Wolfermus"] = {};
        else return undefined;
    } else if (!mainWindow["Wolfermus"]["Libraries"]) {
        if (createIfNotFound) mainWindow["Wolfermus"]["Libraries"] = {};
        else return undefined;
    }

    if (createIfNotFound && !mainWindow["Wolfermus"]["Libraries"][key]) {
        return mainWindow["Wolfermus"]["Libraries"][key] = {};
    }

    return mainWindow["Wolfermus"]["Libraries"][key];
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function WolfermusCheckLibraryLoaded(key) {
    const gottenLibrary = WolfermusGetLibrary(key);

    if (!gottenLibrary) return false;
    if (!gottenLibrary["Loaded"]) return false;

    return true;
}

/**
 * @type {Array<() => void>}
 */
let wolfermusRootRefreshesEvent = [];

/**
 * @param {boolean} [forceRequest=false] Forces function to request the html
 * @async
 * @throws If failed to load HTML or create element
 * @returns {HTMLElement}
 */
async function GetWolfermusRoot(forceRequest = false) {
    const wolfermusRootID = "WolfermusRoot";

    let gottenElement = document.getElementById(wolfermusRootID);
    const shouldCreateElement = gottenElement === undefined || gottenElement === null;

    if (!shouldCreateElement && !forceRequest) return gottenElement;

    if (shouldCreateElement) {
        gottenElement = document.createElement("div");
        gottenElement.id = wolfermusRootID;
        gottenElement.classList = "WolfermusDefaultCSS";
        document.documentElement.appendChild(gottenElement);

        {
            let checkingIfCreated = document.getElementById(wolfermusRootID);
            if (checkingIfCreated === undefined || checkingIfCreated === null) {
                debugger;
                throw new Error("Wolfermus ERROR - MainMenuLib: Unable to create WolfermusRoot element");
                return;
            }
        }
    }

    // TODO: Update StorageManagerLib to handly localStorage only options.
    if (!localStorage["WolfermusMainMenu"]) localStorage["WolfermusMainMenu"] = "{}";
    let WolfermusMainMenuSettings = JSON.parse(localStorage["WolfermusMainMenu"]);

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

    gottenElement.innerHTML = editedInnerHTML;
    if (gottenElement.innerHTML === "") {
        throw new Error("Wolfermus ERROR: MainMenuLib - innerHTML is empty - HTML failed to load");
        return undefined;
    }

    const mainMenu = GetMainMenu();
    const floatingButtonMenu = GetFloatingButtonMenu();

    RemoveInteractionEventsToMainMenu();

    mainMenu.UnloadItems();
    floatingButtonMenu.UnloadItems();

    for (let callback of wolfermusRootRefreshesEvent) {
        callback?.();
    }

    return gottenElement;
}

/**
 * @type {WolfermusMenu | undefined}
 */
let MainMenu = undefined;
/**
 * @returns {WolfermusMenu}
 */
function GetMainMenu() {
    if (MainMenu === undefined) {
        MainMenu = new WolfermusMenu();
        MainMenu.AddClass("WolfermusActivatedMainMenuWindow");
    }
    return MainMenu;
}

/**
 * @type {WolfermusMenu | undefined}
 */
let ContextMenu = undefined;
/**
 * If you want to have a context menu on a WolfermusMenuItem use .contextItems under that WolfermusMenuItem for automatic proper use.
 * 
 * The items within this context menu is changed every time a WolfermusMenuItem with any .contextItems is right clicked.
 * @returns {WolfermusMenu}
 */
function GetContextMenu() {
    if (ContextMenu === undefined) {
        ContextMenu = new WolfermusMenu();
        ContextMenu.AddClass("WolfermusMainMenuContextMenu");
    }
    return ContextMenu;
}

/**
 * @type {WolfermusMenuItem | undefined}
 */
let WolermusFabImageMenuItem = undefined;

/**
 * @returns {WolfermusMenuItem}
 */
function GetWolermusFabImageMenuItem() {
    if (WolermusFabImageMenuItem === undefined) {
        let mainWindow = window;

        try {
            if (unsafeWindow !== undefined) mainWindow = unsafeWindow;
        } catch (e) {

        }

        let imgSrc = "";
        if (!mainWindow["Wolfermus"]["Logo"] || !mainWindow["Wolfermus"]["Logo"]["Rounded"]) {
            console.log("Unable to locate logo");
        } else imgSrc = mainWindow["Wolfermus"]["Logo"]["Rounded"];

        WolermusFabImageMenuItem = new WolfermusImageMenuItem("WolermusFabImage", imgSrc);

        WolermusFabImageMenuItem.pointerDownCallback = (event) => {
            const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
            if (fabElement === undefined || fabElement === null) return;

            if (WolermusFabImageMenuItem.element === undefined || WolermusFabImageMenuItem.element === null) return;

            WolermusFabImageMenuItem.element.setPointerCapture(event.pointerId);

            WolermusFabImageMenuItem.oldPositionX = fabElement.style.left;
            WolermusFabImageMenuItem.oldPositionY = fabElement.style.top;

            WolermusFabImageMenuItem.ShouldMove = true;

            fabElement.style.transition = "none";
        };

        WolermusFabImageMenuItem.pointerUpCallback = async (event) => {
            const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
            if (fabElement === undefined || fabElement === null) return;

            if (WolermusFabImageMenuItem.element === undefined || WolermusFabImageMenuItem.element === null) return;

            //const GUIGotten = await GetValue("MainMenu", "{}");

            // TODO: Update StorageManagerLib to handly localStorage only options.
            if (!localStorage["WolfermusMainMenu"]) localStorage["WolfermusMainMenu"] = "{}";
            let WolfermusMainMenuSettings = JSON.parse(localStorage["WolfermusMainMenu"]);

            WolermusFabImageMenuItem.ShouldMove = false;

            WolermusFabImageMenuItem.element.releasePointerCapture(event.pointerId);

            fabElement.style.transition = "0.3s ease-in-out left";

            WolfermusMainMenuSettings.Top = parseInt(fabElement.style.top.match(/\d/g).join(""));
            WolfermusMainMenuSettings.Left = parseInt(fabElement.style.left.match(/\d/g).join(""));

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
        };

        WolermusFabImageMenuItem.pointerMoveCallback = async (event) => {
            if (WolermusFabImageMenuItem.element === undefined || WolermusFabImageMenuItem.element === null) return;

            if (WolermusFabImageMenuItem.ShouldMove !== true) return;

            const mainMenuRoot = await GetWolfermusRoot();
            const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
            if (mainMenuRoot === undefined || mainMenuRoot === null) return;
            if (fabElement === undefined || fabElement === null) return;

            const windowWidth = mainMenuRoot.getBoundingClientRect().width;
            const windowHeight = mainMenuRoot.getBoundingClientRect().height;

            let position = new Position(event.clientX, event.clientY);

            const mainMenu = GetMainMenu();

            if (position.x < windowWidth / 2) {
                fabElement.classList.remove("WolfermusRightPosition");
                fabElement.classList.add("WolfermusLeftPosition");

                mainMenu.RemoveClass("WolfermusRightPosition");
                mainMenu.RemoveClass("WolfermusGroupRightPosition");
                mainMenu.AddClass("WolfermusLeftPosition");
                mainMenu.AddClass("WolfermusGroupLeftPosition");
            } else {
                fabElement.classList.remove("WolfermusLeftPosition");
                fabElement.classList.add("WolfermusRightPosition");

                mainMenu.RemoveClass("WolfermusLeftPosition");
                mainMenu.RemoveClass("WolfermusGroupLeftPosition");
                mainMenu.AddClass("WolfermusRightPosition");
                mainMenu.AddClass("WolfermusGroupRightPosition");
            }

            if (position.y < windowHeight / 2) {
                fabElement.classList.remove("WolfermusUpPosition");
                fabElement.classList.add("WolfermusDownPosition");

                mainMenu.RemoveClass("WolfermusUpPosition");
                mainMenu.RemoveClass("WolfermusGroupUpPosition");
                mainMenu.AddClass("WolfermusDownPosition");
                mainMenu.AddClass("WolfermusGroupDownPosition");
            } else {
                fabElement.classList.remove("WolfermusDownPosition");
                fabElement.classList.add("WolfermusUpPosition");

                mainMenu.RemoveClass("WolfermusDownPosition");
                mainMenu.RemoveClass("WolfermusGroupDownPosition");
                mainMenu.AddClass("WolfermusUpPosition");
                mainMenu.AddClass("WolfermusGroupUpPosition");
            }

            mainMenu.UpdateClasses();

            ContrainElementViaPosition(fabElement, position);
        };
        WolermusFabImageMenuItem.clickCallback = (event) => {
            const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
            if (fabElement === undefined || fabElement === null) return;

            if (WolermusFabImageMenuItem.oldPositionY === fabElement.style.top && WolermusFabImageMenuItem.oldPositionX === fabElement.style.left) {
                GetMainMenu().ToggleVisibility();
            }
        };

        const updateMenuItemsContextMenuItem = new WolfermusMenuItem(
            "WolfermusUpdateMenuItemsContextMenuItem",
            "Update Menu Items",
            "This Updates this whole menu and the floating button itself"
        );
        updateMenuItemsContextMenuItem.clickCallback = async (event) => {
            await UpdateMenuItems();

            const contextMenu = GetContextMenu();

            contextMenu.Hide();
        };

        const forceRefreshWolfermusRootItem = new WolfermusMenuItem(
            "WolfermusForceRefreshWolfermusRootItem",
            "Force Refresh WolfermusRoot HTMLElement",
            `This forces HTTP request latest WolfermusRoot HTML
            and refreshes the WolfermusRoot HTML`
        );
        forceRefreshWolfermusRootItem.clickCallback = async (event) => {
            await GetWolfermusRoot(true);

            await UpdateMenuItems();

            const contextMenu = GetContextMenu();

            contextMenu.Hide();

            await WolfermusMenuItem.HideToolTip();
        };

        const updateWolfermusMainMenuStyleContextMenuItem = new WolfermusMenuItem(
            "WolfermusUpdateWolfermusMainMenuStyleContextMenuItem",
            "Update Wolfermus Main Menu Style CSS",
            `This Refreshes/Updates the Wolfermus Main Menu Style CSS`
        );
        updateWolfermusMainMenuStyleContextMenuItem.clickCallback = async (event) => {
            await UpdateWolfermusMainMenuStyle();

            const contextMenu = GetContextMenu();

            contextMenu.Hide();

            await WolfermusMenuItem.HideToolTip();
        };

        WolermusFabImageMenuItem.contextItems.push(updateMenuItemsContextMenuItem);
        WolermusFabImageMenuItem.contextItems.push(forceRefreshWolfermusRootItem);
        WolermusFabImageMenuItem.contextItems.push(updateWolfermusMainMenuStyleContextMenuItem);
    }
    return WolermusFabImageMenuItem;
}

/**
 * @type {WolfermusMenu | undefined}
 */
let FloatingButtonMenu = undefined;

/**
 * @returns {WolfermusMenu}
 */
function GetFloatingButtonMenu() {
    if (FloatingButtonMenu === undefined) {
        FloatingButtonMenu = new WolfermusMenu();
        FloatingButtonMenu.AddClass("WolfermusFabBtn");

        FloatingButtonMenu.items.push(GetWolermusFabImageMenuItem());
    }
    return FloatingButtonMenu;
}

/**
 * Call this first.
 * 
 * This function executes a http request strongly advise against calling this often.
 * 
 * @description Updates the Main Menu Style
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

const contrainedPadding = 5;

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
 * @param {Boolean} [shouldDivideElementWidthToContrainDimentionByTwo=true]
 * @param {Boolean} [shouldDivideElementHeightToContrainDimentionByTwo=true]
 * 
 * @returns {{x: boolean, y: boolean}}
 */
async function ContrainElementViaPosition(elementToContrain, position, shouldDivideElementWidthToContrainDimentionByTwo = true, shouldDivideElementHeightToContrainDimentionByTwo = true) {
    const mainMenuRoot = await GetWolfermusRoot();

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

    let gotConstrained = {
        x: true,
        y: true
    }

    if ((position.x - contrainedPadding) < (shouldDivideElementWidthToContrainDimentionByTwo ? elementToContrainWidthDivided2 : 0)) {
        position.x = ((shouldDivideElementWidthToContrainDimentionByTwo ? elementToContrainWidthDivided2 : 0) + contrainedPadding)
    } else if ((position.x + contrainedPadding) > windowWidth - (elementToContrainWidthDivided2)) {
        position.x = (windowWidth - elementToContrainWidthDivided2 - contrainedPadding);
    } else {
        gotConstrained.x = false;
    }
    elementToContrain.style.left = position.x + "px";

    if ((position.y - contrainedPadding) < (shouldDivideElementHeightToContrainDimentionByTwo ? elementToContrainHeightDivided2 : 0)) {
        position.y = ((shouldDivideElementHeightToContrainDimentionByTwo ? elementToContrainHeightDivided2 : 0) + contrainedPadding);
    } else if ((position.y + contrainedPadding) > windowHeight - elementToContrainHeightDivided2) {
        position.y = (windowHeight - elementToContrainHeightDivided2 - contrainedPadding);
    } else {
        gotConstrained.y = false;
    }
    elementToContrain.style.top = position.y + "px";

    return gotConstrained;
}

let oldFabElementLeft, oldFabElementTop;
let oldWindowWidth, oldWindowHeight;
async function ContrainMainMenu() {
    if (GetMainMenu().items.length <= 0) return;

    const mainMenuRoot = await GetWolfermusRoot();
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

class WolfermusMenuItem {
    /**
     * @param {any} id
     * @param {string} title
     * @param {string} tooltip
     */
    constructor(id, title, tooltip = "") {
        this.id = id;
        this.title = title;
        this.tooltip = tooltip;

        wolfermusRootRefreshesEvent.push(() => {
            this.element = null;
            if (WolfermusMenuItem.#tooltipTimeoutID !== undefined) {
                clearTimeout(WolfermusMenuItem.#tooltipTimeoutID);
                WolfermusMenuItem.#tooltipTimeoutID = undefined;
            }
        });
    }
    /**
     * @type {any}
     */
    id;
    /**
     * @type {string}
     */
    title;
    /**
     * @type {HTMLElement | null}
     */
    element = null;
    /**
     * @type {Array<WolfermusMenuItem>}
     */
    items = [];
    /**
     * @type {Array<WolfermusMenuItem>}
     */
    contextItems = [];
    /**
     * @type {string}
     */
    tooltip = "";
    /**
     * @type {number}
     */
    tooltipTimeOut = 400;

    /**
     * @type {Number}
     */
    static #tooltipTimeoutID = undefined;

    /**
     * @type {WolfermusMenu}
     */
    static #ToolTipMenu = undefined;
    /**
     * @type {WolfermusMenuItem}
     */
    static #ToolTipMenuItem = undefined;

    /**
     * @returns {WolfermusMenuItem}
     */
    static GetToolTipMenuItem() {
        if (this.#ToolTipMenuItem === undefined) {
            this.#ToolTipMenuItem = new WolfermusMenuItem("ToolTipText", "");
        }
        return this.#ToolTipMenuItem;
    }

    /**
     * @returns {WolfermusMenu}
     */
    static GetToolTipMenu() {
        if (this.#ToolTipMenu === undefined) {
            this.#ToolTipMenu = new WolfermusMenu();
            this.#ToolTipMenu.AddClass("WolfermusMenuItemToolTip")
            this.#ToolTipMenu.items.push(WolfermusMenuItem.GetToolTipMenuItem());
        }
        return this.#ToolTipMenu;
    }

    static async HideToolTip() {
        if (this.#tooltipTimeoutID !== undefined) {
            clearTimeout(this.#tooltipTimeoutID);
            this.#tooltipTimeoutID = undefined;
        }

        const toolTips = this.GetToolTipMenu();
        const toolTipsText = this.GetToolTipMenuItem();

        toolTipsText.title = "";

        toolTips.RemoveClass("WolfermusToolTipSetActive");
        toolTips.RemoveClass("WolfermusActive");
        toolTips.UpdateClasses();

        await toolTips.Generate(await GetWolfermusRoot());
    }

    //#region callbacks
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
    pointerEnterCallback = undefined;
    /**
     * 
     * @param {PointerEvent} event 
     * @type {(PointerEvent) => void}
     */
    pointerLeaveCallback = undefined;
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
    pointerCancelCallback = undefined;
    //#endregion -callbacks

    //#region currentCallbacks
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
    //#endregion -currentCallbacks

    /**
     * @type {(PointerEvent) => void}
     */
    #toolTipPointerEnterCallback = async (event) => {
        await WolfermusMenuItem.HideToolTip();

        if (this.tooltip === undefined || this.tooltip === "") return;

        /**
        * @type {WolfermusMenu}
        */
        const toolTips = WolfermusMenuItem.GetToolTipMenu();
        /**
        * @type {WolfermusMenuItem}
        */
        const toolTipsText = WolfermusMenuItem.GetToolTipMenuItem();

        toolTipsText.title = this.tooltip;

        toolTips.AddClass("WolfermusToolTipSetActive");
        toolTips.UpdateClasses();
        await toolTips.Generate(await GetWolfermusRoot());

        const x = event.clientX;
        const y = (event.clientY) + 30;

        ContrainElementViaPosition(toolTips.element, new Position(x, y), true, false);

        //@ts-ignore
        WolfermusMenuItem.#tooltipTimeoutID = setTimeout(async () => {
            /**
            * @type {WolfermusMenu}
            */
            const toolTips = WolfermusMenuItem.GetToolTipMenu();
            /**
            * @type {WolfermusMenuItem}
            */
            const toolTipsText = WolfermusMenuItem.GetToolTipMenuItem();

            toolTipsText.title = this.tooltip;

            toolTips.AddClass("WolfermusActive");
            toolTips.RemoveClass("WolfermusToolTipSetActive");
            toolTips.UpdateClasses();

            await toolTips.Generate(await GetWolfermusRoot());
        }, this.tooltipTimeOut);
    };
    /**
     * @type {(PointerEvent) => void}
     */
    #toolTipPointerLeaveCallback = async (event) => { await WolfermusMenuItem.HideToolTip(); };

    /**
     * 
     * @param {PointerEvent} event 
     * @type {(PointerEvent) => void}
     */
    #contextMenuCallback = async (event) => {
        const contextMenu = GetContextMenu();
        contextMenu.Hide();

        if (this.contextItems.length <= 0) return;

        event.preventDefault();

        const x = event.clientX;
        const y = event.clientY;


        contextMenu.items = this.contextItems;

        contextMenu.UpdateClasses();
        await contextMenu.Generate(await GetWolfermusRoot());

        contextMenu.Show();

        ContrainElementViaPosition(contextMenu.element, new Position(x, y), false, false);
    };

    /**
     * @type {(PointerEvent) => void}
     */
    #menuPointerEnterCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    #menuPointerLeaveCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    #groupPointerEnterCallback = undefined;
    /**
     * @type {(PointerEvent) => void}
     */
    #groupPointerLeaveCallback = undefined;

    /**
     * @param {WolfermusMenu} menu
     * @returns {string}
     */
    Generate(menu) {
        if (this.id === undefined) return "";

        let activable = "";
        if (this.clickCallback !== undefined || this.doubleClickCallback !== undefined) activable = "WolfermusActivable";

        if (this.items.length <= 0) {
            if (activable !== "") {
                return `
                    <li id="WolfermusMenu${menu.id}${this.id}" class="WolfermusDefaultCSS ${activable}">
                        <a>${this.title}</a>
                    </li>
                `;
            } else {
                return `
                    <li id="WolfermusMenu${menu.id}${this.id}" class="WolfermusDefaultCSS WolfermusTextItem">
                        <a>${this.title}</a>
                    </li>
                `;
            }
        }
        return `
            <li id="WolfermusMenu${menu.id}${this.id}" class="WolfermusDefaultCSS ${activable}">
                <a class="WolfermusGroup WolfermusGroupRightPosition"><</a>    
                <a>${this.title}</a>
                <a class="WolfermusGroup WolfermusGroupLeftPosition">></a>
            </li>
        `;
    }
    /**
     * @param {WolfermusMenu} menu
     * @returns {Boolean}
     */
    async SetupEvents(menu) {
        if (this.id === undefined) return false;
        if (menu === undefined || menu === null) return false;
        if (menu.id === undefined || menu.id === null) return false;

        {
            const gottenElement = document.getElementById(`WolfermusMenu${menu.id}${this.id}`);
            if (gottenElement === undefined || gottenElement === null) return false;
            this.element = gottenElement;
        }

        this.RemoveEvents(menu);

        //#region callbacks
        this.#currentClickCallback = this.clickCallback;
        this.#currentDoubleClickCallback = this.doubleClickCallback;
        this.#currentPointerEnterCallback = this.pointerEnterCallback;
        this.#currentPointerLeaveCallback = this.pointerLeaveCallback;
        this.#currentPointerDownCallback = this.pointerDownCallback;
        this.#currentPointerUpCallback = this.pointerUpCallback;
        this.#currentPointerMoveCallback = this.pointerMoveCallback;
        this.#currentPointerCancelCallback = this.pointerCancelCallback;

        if (this.#currentClickCallback !== undefined) this.element.addEventListener("click", this.#currentClickCallback);
        if (this.#currentDoubleClickCallback !== undefined) this.element.addEventListener("dblclick", this.#currentDoubleClickCallback);
        if (this.#currentPointerEnterCallback !== undefined) this.element.addEventListener("pointerenter", this.#currentPointerEnterCallback);
        if (this.#currentPointerLeaveCallback !== undefined) this.element.addEventListener("pointerleave", this.#currentPointerLeaveCallback);
        if (this.#currentPointerDownCallback !== undefined) this.element.addEventListener("pointerdown", this.#currentPointerDownCallback);
        if (this.#currentPointerUpCallback !== undefined) this.element.addEventListener("pointerup", this.#currentPointerUpCallback);
        if (this.#currentPointerMoveCallback !== undefined) this.element.addEventListener("pointermove", this.#currentPointerMoveCallback);
        if (this.#currentPointerCancelCallback !== undefined) this.element.addEventListener("pointercancel", this.#currentPointerCancelCallback);
        //#endregion -callbacks

        this.element.addEventListener("pointerenter", this.#toolTipPointerEnterCallback);
        this.element.addEventListener("pointerleave", this.#toolTipPointerLeaveCallback);
        this.element.addEventListener("pointercancel", this.#toolTipPointerLeaveCallback);
        this.element.addEventListener("contextmenu", this.#contextMenuCallback);

        if (this.items.length <= 0) return true;

        const wolfermusRoot = await GetWolfermusRoot();
        if (wolfermusRoot === undefined || wolfermusRoot === null) return false;

        /**
         * @param {PointerEvent} event 
         */
        this.#menuPointerEnterCallback = (event) => {
            if (this.id === undefined) return;

            if (menu.attached?.id !== this.id) {
                if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                return;
            }
            if (menu.attached?.menu === undefined) return;
            if (menu.attached?.menu.element === undefined) return;
            if (menu.attached.menu.IsHoveringAnyMenu()) return;

            if (menu.attached?.cooldownTimeoutID !== undefined) {
                clearTimeout(menu.attached.cooldownTimeoutID);
                menu.attached.cooldownTimeoutID = undefined;
            }

            menu.attached.cooldownTimeoutID = setTimeout(() => {
                if (menu.attached?.id !== this.id) {
                    if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                    return;
                }
                if (menu.attached?.menu === undefined) return;
                if (menu.attached?.menu.element === undefined) return;
                if (menu.attached.menu.IsHoveringAnyMenu()) return;

                if (this.element !== undefined && this.element !== null) {
                    if (this.element.matches(":hover") && menu.element.style["visibility"] !== "hidden") return;
                }
                if (menu.element !== undefined && menu.element !== null) {
                    if (!menu.element.matches(":hover") && menu.element.style["visibility"] !== "hidden") return;
                }

                //console.log(`${menu.attached.menu.id} Closing Via menuPointerEnterCallback`);

                menu.attached.menu.Hide();
                menu.attached.id = undefined;
                if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
            }, 500);
        }

        /**
         * @param {PointerEvent} event 
         */
        this.#menuPointerLeaveCallback = (event) => {
            if (this.id === undefined) return;

            if (menu.attached?.id !== this.id) {
                if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                return;
            }
            if (menu.attached?.menu === undefined) return;

            if (menu.attached?.cooldownTimeoutID !== undefined) {
                clearTimeout(menu.attached.cooldownTimeoutID);
                menu.attached.cooldownTimeoutID = undefined;
            }
        }

        /**
         * @param {PointerEvent} event 
         */
        this.#groupPointerEnterCallback = async (event) => {
            if (menu.attached?.timeoutID !== undefined) {
                clearTimeout(menu.attached.timeoutID);
                menu.attached.timeoutID = undefined;
            }

            if (this.id === undefined) {
                if (menu.attached?.cooldownTimeoutID !== undefined) {
                    clearTimeout(menu.attached.cooldownTimeoutID);
                    menu.attached.cooldownTimeoutID = undefined;
                }
                return;
            }

            if (menu.attached === undefined) menu.attached = {};
            if (menu.attached.menu === undefined) {
                menu.attached.menu = new WolfermusMenu();
                menu.attached.menu.AddClass("WolfermusGroupMenuWindow");
            }

            if (menu.attached.id === this.id) return;

            if (menu.attached.id !== undefined) {
                this.element.style["background-color"] = "";
            }

            if (menu.attached?.cooldownTimeoutID !== undefined) {
                clearTimeout(menu.attached.cooldownTimeoutID);
                menu.attached.cooldownTimeoutID = undefined;
                let gottenItem = menu.items.find((item) => item.id === menu.attached.id);
                if (gottenItem !== undefined && gottenItem.element !== undefined && gottenItem.element !== null) gottenItem.element.style["background-color"] = "";
            }

            menu.attached.menu.Hide();

            if (this.element === undefined || this.element === null) return;

            if (menu.element === undefined || menu.element.style["visibility"] === "hidden") return;

            const menuItemGroupCollection = this.element.getElementsByClassName("WolfermusGroup");
            if (menuItemGroupCollection === undefined || menuItemGroupCollection === null || menuItemGroupCollection.length <= 0) return;

            let menuItemGroup = undefined;
            for (let foundElement of menuItemGroupCollection) {
                const computedStyle = window.getComputedStyle(foundElement);
                if (computedStyle["visibility"] !== "hidden") {
                    menuItemGroup = foundElement;
                    break;
                }
            }
            if (menuItemGroup === undefined || menuItemGroup === null) return;

            menu.attached.menu.ValidateElement(wolfermusRoot);

            menu.attached.id = this.id;

            const clientRect = menuItemGroup.getBoundingClientRect();
            let position = new Position(clientRect.left + clientRect.width / 2, clientRect.top + clientRect.height / 2);

            if (menu.ContainsClass("WolfermusGroupRightPosition")) {
                position.x -= 4;
                menu.attached.menu.AddClass("WolfermusRightPosition");
                menu.attached.menu.AddClass("WolfermusGroupRightPosition");
                menu.attached.menu.RemoveClass("WolfermusLeftPosition");
                menu.attached.menu.RemoveClass("WolfermusGroupLeftPosition");
            } else {
                position.x += 4;
                menu.attached.menu.AddClass("WolfermusLeftPosition");
                menu.attached.menu.AddClass("WolfermusGroupLeftPosition");
                menu.attached.menu.RemoveClass("WolfermusRightPosition");
                menu.attached.menu.RemoveClass("WolfermusGroupRightPosition");
            }
            if (menu.ContainsClass("WolfermusGroupUpPosition")) {
                position.y += clientRect.height / 2;
                menu.attached.menu.AddClass("WolfermusUpPosition");
                menu.attached.menu.AddClass("WolfermusGroupUpPosition");
                menu.attached.menu.RemoveClass("WolfermusDownPosition");
                menu.attached.menu.RemoveClass("WolfermusGroupDownPosition");
            } else {
                position.y -= clientRect.height / 2;
                menu.attached.menu.AddClass("WolfermusDownPosition");
                menu.attached.menu.AddClass("WolfermusGroupDownPosition");
                menu.attached.menu.RemoveClass("WolfermusUpPosition");
                menu.attached.menu.RemoveClass("WolfermusGroupUpPosition");
            }
            menu.attached.menu.UpdateClasses();

            menu.attached.menu.items = this.items;
            await menu.attached.menu.Generate(wolfermusRoot);

            menu.attached.menu.Hide();

            menu.attached.menu.element.style["left"] = position.x + "px";
            menu.attached.menu.element.style["top"] = position.y + "px";

            const attachedMenuClientRect = menu.attached.menu.element.getBoundingClientRect();
            let checkPosition = new Position(clientRect.left + clientRect.width / 2, clientRect.top + clientRect.height / 2);

            if (menu.attached.menu.ContainsClass("WolfermusRightPosition")) {
                checkPosition.x -= attachedMenuClientRect.width;
                checkPosition.x += clientRect.height / 2;
                checkPosition.x -= attachedMenuClientRect.width;
            } else {
                checkPosition.x += attachedMenuClientRect.width;
                checkPosition.x -= clientRect.height / 2;
                checkPosition.x += attachedMenuClientRect.width;
            }
            if (menu.attached.menu.ContainsClass("WolfermusUpPosition")) {
                checkPosition.y += clientRect.height / 2;
                checkPosition.y -= attachedMenuClientRect.height;
                checkPosition.y += clientRect.height;
                checkPosition.y -= attachedMenuClientRect.height;
            } else {
                checkPosition.y += attachedMenuClientRect.height;
            }

            const mainMenuRoot = await GetWolfermusRoot();

            const windowClientRect = mainMenuRoot.getBoundingClientRect();

            if (checkPosition.x < 0) {
                menu.attached.menu.AddClass("WolfermusGroupLeftPosition");
                menu.attached.menu.RemoveClass("WolfermusGroupRightPosition");
            } else if (checkPosition.x > windowClientRect.width) {
                menu.attached.menu.AddClass("WolfermusGroupRightPosition");
                menu.attached.menu.RemoveClass("WolfermusGroupLeftPosition");
            }

            if (checkPosition.y < 0) {
                menu.attached.menu.AddClass("WolfermusGroupDownPosition");
                menu.attached.menu.RemoveClass("WolfermusGroupUpPosition");
            } else if (checkPosition.y > windowClientRect.height) {
                menu.attached.menu.AddClass("WolfermusGroupUpPosition");
                menu.attached.menu.RemoveClass("WolfermusGroupDownPosition");
            }

            menu.attached.menu.UpdateClasses();

            if (menu.attached?.cooldownTimeoutID !== undefined) {
                clearTimeout(menu.attached.cooldownTimeoutID);
                menu.attached.cooldownTimeoutID = undefined;
                let gottenItem = menu.items.find((item) => item.id === menu.attached.id);
                if (gottenItem !== undefined && gottenItem.element !== undefined && gottenItem.element !== null) gottenItem.element.style["background-color"] = "";
            }

            menu.attached.menu.Show();
            this.element.style["background-color"] = "#3d3d3d";

            //console.log(`${menu.attached.menu.id} Opening elementPointerEnterCallback`);
        };

        /**
         * @param {PointerEvent} event 
         */
        this.#groupPointerLeaveCallback = (event) => {
            if (this.id === undefined) return;

            if (menu.attached?.id !== this.id) {
                if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                return;
            }
            if (menu.attached?.menu === undefined) return;
            if (menu.attached.menu.element === undefined) return;

            if (menu.attached?.cooldownTimeoutID !== undefined) {
                clearTimeout(menu.attached.cooldownTimeoutID);
                menu.attached.cooldownTimeoutID = undefined;
            }

            if (menu.attached.menu.attached?.id !== undefined) return;

            menu.attached.cooldownTimeoutID = setTimeout(() => {
                if (menu.attached?.id !== this.id) {
                    if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                    return;
                }
                if (menu.attached?.menu === undefined) return;
                if (menu.attached.menu.element === undefined) return;

                if (menu.attached.menu.attached.id !== undefined) return;

                if (this.element !== undefined && this.element !== null) {
                    if (this.element.matches(":hover") && menu.element.style["visibility"] !== "hidden") return;
                }
                if (!menu.element.matches(":hover") && menu.element.style["visibility"] !== "hidden") return;

                //console.log(`${menu.attached.menu.id} Closing Via elementPointerLeaveCallback setTimeout 0`);

                menu.attached.menu.Hide();
                menu.attached.id = undefined;
                if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
            }, 500);

            menu.attached.menu.element.style["transition"] = "";

            menu.attached.timeoutID = setTimeout(() => {
                if (menu.attached?.menu?.element === undefined) return;
                menu.attached.menu.element.style["transition"] = "0s";
            }, 200);
        };

        menu.element.addEventListener("pointerenter", this.#menuPointerEnterCallback);
        menu.element.addEventListener("pointerleave", this.#menuPointerLeaveCallback);

        this.element.addEventListener("pointerenter", this.#groupPointerEnterCallback);
        this.element.addEventListener("pointerleave", this.#groupPointerLeaveCallback);

        return true;
    }

    /**
     * @param {WolfermusMenu} menu
     */
    RemoveEvents(menu) {
        if (menu.id === undefined || menu.id === null) return false;

        if (this.element !== undefined && this.element !== null) {
            if (this.#currentClickCallback !== undefined) this.element.removeEventListener("click", this.#currentClickCallback);
            if (this.#currentDoubleClickCallback !== undefined) this.element.removeEventListener("dblclick", this.#currentDoubleClickCallback);
            if (this.#currentPointerEnterCallback !== undefined) this.element.removeEventListener("pointerenter", this.#currentPointerEnterCallback);
            if (this.#currentPointerLeaveCallback !== undefined) this.element.removeEventListener("pointerleave", this.#currentPointerLeaveCallback);
            if (this.#currentPointerDownCallback !== undefined) this.element.removeEventListener("pointerdown", this.#currentPointerDownCallback);
            if (this.#currentPointerUpCallback !== undefined) this.element.removeEventListener("pointerup", this.#currentPointerUpCallback);
            if (this.#currentPointerMoveCallback !== undefined) this.element.removeEventListener("pointermove", this.#currentPointerMoveCallback);
            if (this.#currentPointerCancelCallback !== undefined) this.element.removeEventListener("pointercancel", this.#currentPointerCancelCallback);

            if (this.#groupPointerEnterCallback !== undefined) this.element.removeEventListener("pointerenter", this.#groupPointerEnterCallback);
            if (this.#groupPointerLeaveCallback !== undefined) this.element.removeEventListener("pointerleave", this.#groupPointerLeaveCallback);

            this.element.removeEventListener("pointerenter", this.#toolTipPointerEnterCallback);
            this.element.removeEventListener("pointerleave", this.#toolTipPointerLeaveCallback);
            this.element.removeEventListener("pointercancel", this.#toolTipPointerLeaveCallback);
            this.element.removeEventListener("contextmenu", this.#contextMenuCallback);
        }

        if (menu !== undefined && menu !== null && menu.element !== undefined) {
            if (this.#menuPointerEnterCallback !== undefined) menu.element.removeEventListener("pointerenter", this.#menuPointerEnterCallback);
            if (this.#menuPointerLeaveCallback !== undefined) menu.element.removeEventListener("pointerleave", this.#menuPointerLeaveCallback);
        }

        this.#currentClickCallback = undefined;
        this.#currentDoubleClickCallback = undefined;
        this.#currentPointerEnterCallback = undefined;
        this.#currentPointerLeaveCallback = undefined;
        this.#currentPointerDownCallback = undefined;
        this.#currentPointerUpCallback = undefined;
        this.#currentPointerMoveCallback = undefined;
        this.#currentPointerCancelCallback = undefined;

        this.#groupPointerEnterCallback = undefined;
        this.#groupPointerLeaveCallback = undefined;
        this.#menuPointerEnterCallback = undefined;
        this.#menuPointerLeaveCallback = undefined;
    }
}

class WolfermusImageMenuItem extends WolfermusMenuItem {
    /**
     * @param {any} id
     * @param {string} imageSource
     * @param {string} tooltip
     */
    constructor(id, imageSource, tooltip = "") {
        super(id, "", tooltip);
        this.imageSource = imageSource;
    }
    /**
     * @type {string}
     */
    imageSource = "";

    /**
     * @param {WolfermusMenu} menu
     * @returns {string}
     */
    Generate(menu) {
        if (this.id === undefined) return "";

        return `
            <li id="WolfermusMenu${menu.id}${this.id}" class="WolfermusDefaultCSS">
                <img src="${this.imageSource}" class="WolfermusDefaultCSS"></img>
            </li>
        `;
    }
}

class WolfermusMenu {
    constructor() {
        this.id = WolfermusMenu.id;
        WolfermusMenu.id++;

        wolfermusRootRefreshesEvent.push(() => { this.element = null; });
    }
    /**
     * @type {Number}
     */
    static id = 0;
    /**
     * @type {Number}
     */
    id = 0;
    /**
     * @type {Array<WolfermusMenuItem>}
     */
    items = [];
    /**
     * @type {Array<WolfermusMenuItem>}
     */
    #currentItems = [];
    /**
     * @type {HTMLElement | null}
     */
    element = null;
    /**
     * @type {{
     *  id: any,
     *  menu: WolfermusMenu,
     *  timeoutID: Number | undefined,
     *  cooldownTimeoutID: Number | undefined
     * }}
     */
    attached = {
        id: undefined,
        menu: undefined,
        timeoutID: undefined,
        cooldownTimeoutID: undefined
    };
    /**
     * @type {Array<String>}
     */
    #classes = ["WolfermusDefaultCSS", "WolfermusPopUpMenu", "WolfermusText"];
    /**
     * @type {boolean} 
     */
    #showing = false;

    UpdateClasses() {
        if (this.element === undefined || this.element === null) return;
        this.element.classList = this.#classes.join(" ");
    }

    /**
     * @param {HTMLElement} elementToAppendTo
     */
    ValidateElement(elementToAppendTo) {
        if (elementToAppendTo === undefined || elementToAppendTo === null) {
            debugger;
            throw new Error("Wolfermus ERROR - MainMenuLib: elementToAppendTo is invalid");
            return;
        }
        if (this.element !== undefined && this.element !== null) return;
        const gottenElement = document.getElementById(`WolfermusMenu${this.id}`);
        if (gottenElement !== undefined && gottenElement !== null) {
            this.element = gottenElement;
            return;
        }

        this.element = document.createElement("div");
        this.element.id = `WolfermusMenu${this.id}`;
        this.UpdateClasses();

        this.element.style["transition"] = "0s";

        if (this.#showing) {
            this.element.style["visibility"] = "visible";
        } else {
            this.element.style["visibility"] = "hidden";
        }

        elementToAppendTo.append(this.element);
    }

    /**
     * @returns {String}
     */
    #GenerateItems() {
        let wolfermusMenuItemsConverted = "";
        for (const menuItem of this.items) {
            wolfermusMenuItemsConverted += menuItem.Generate(this);
        }
        return wolfermusMenuItemsConverted;
    }

    async #SetupItems() {
        for (const menuItem of this.items) {
            if (await menuItem.SetupEvents(this)) this.#currentItems.push(menuItem);
        }
    }

    UnloadItems() {
        if (this.attached.timeoutID !== undefined) {
            clearTimeout(this.attached.timeoutID);
            this.attached.timeoutID = undefined;
        }
        if (this.attached.cooldownTimeoutID !== undefined) {
            clearTimeout(this.attached.cooldownTimeoutID);
            this.attached.cooldownTimeoutID = undefined;
        }
        this.attached.id = undefined;

        for (const menuItem of this.#currentItems) {
            menuItem.RemoveEvents(this);
        }
        this.#currentItems = [];
    }

    /**
     * @param {String} classString 
     */
    AddClass(classString) {
        if (classString === undefined || classString === null || classString === "") return;
        if (this.#classes.find((value) => value === classString) !== undefined) return;
        this.#classes.push(classString);
    }
    /**
     * @param {String} classString
     */
    RemoveClass(classString) {
        if (classString === undefined || classString === null || classString === "") return;
        let indexOf = this.#classes.findIndex((value) => value === classString);
        if (indexOf === -1) return;
        this.#classes.splice(indexOf, 1);
    }
    /**
     * @param {String} classString
     */
    ToggleClass(classString) {
        if (classString === undefined || classString === null || classString === "") return;
        let indexOf = this.#classes.findIndex((value) => value === classString);
        if (indexOf === -1) {
            this.#classes.push(classString);
            return;
        }
        this.#classes.splice(indexOf, 1);
    }
    /**
     * @param {String} classString
     * @returns {Boolean}
     */
    ContainsClass(classString) {
        if (classString === undefined || classString === null || classString === "") return;
        return this.#classes.includes(classString);
    }

    /**
     * @param {HTMLElement} elementToAppendTo
     * @async
     */
    async Generate(elementToAppendTo) {
        if (elementToAppendTo === undefined || elementToAppendTo === null) {
            debugger;
            throw new Error("Wolfermus ERROR - MainMenuLib: elementToAppendTo is invalid");
            return;
        }
        this.ValidateElement(elementToAppendTo);

        this.UnloadItems();

        this.element.innerHTML = `
            <ul class="WolfermusDefaultCSS">
                ${this.#GenerateItems()}
            </ul>
        `;

        await this.#SetupItems();
    }

    Show() {
        if (this.element !== undefined && this.element !== null) {
            this.element.style["visibility"] = "visible";
        }

        this.#showing = true;
    }

    Hide() {
        if (this.attached?.menu !== undefined) {
            this.attached.menu.Hide();
            this.attached.id = undefined;
        }

        if (this.element !== undefined && this.element !== null) {
            this.element.style["visibility"] = "hidden";
        }

        this.#showing = false;
    }

    ToggleVisibility() {
        if (this.IsHidden()) {
            this.Show();
        } else {
            this.Hide();
        }
    }

    /**
     * @returns {Boolean}
     */
    IsHidden() {
        if (this.element !== undefined && this.element !== null) {
            return this.element.style["visibility"] === "hidden";
        }
        return true;
    }

    IsHoveringAnyMenu() {
        if (this.element !== undefined && this.element !== null) {
            if (this.element.matches(":hover")) return true;
        }

        if (this.attached?.menu !== undefined) {
            return this.attached.menu.IsHoveringAnyMenu();
        }

        return false;
    }
}

/**
 * @param {PointerEvent} event 
 */
async function ToolTipPointerMove(event) {
    if (GetMainMenu().items.length <= 0) return;

    const toolTips = WolfermusMenuItem.GetToolTipMenu();

    if (!toolTips.ContainsClass("WolfermusActive") && !toolTips.ContainsClass("WolfermusToolTipSetActive")) return;

    await toolTips.Generate(await GetWolfermusRoot());

    const x = event.clientX;
    const y = (event.clientY) + 30;

    ContrainElementViaPosition(toolTips.element, new Position(x, y), true, false);
}

/**
 * @param {PointerEvent} event 
 */
function ResetItemBackgroundColor(event) {
    const menu = GetMainMenu();
    if (menu.attached?.id === undefined) return;

    const foundItem = menu.items.find((item) => item.id === menu.attached.id);
    if (foundItem.element !== undefined) foundItem.element.style["background-color"] = "";
}

/**
 * @param {PointerEvent} event 
 */
function CloseWolfermusMainMenu(event) {
    const menu = GetMainMenu();
    if (menu.IsHoveringAnyMenu()) return;
    ResetItemBackgroundColor();
    if (menu.attached?.menu !== undefined) menu.attached.menu.Hide();
}

/**
 * @param {PointerEvent} event 
 */
function HideWolfermusMainMenu(event) {
    const menu = GetMainMenu();
    ResetItemBackgroundColor();
    if (menu.attached?.menu !== undefined) menu.attached.menu.Hide();
}

/**
 * @param {PointerEvent} event 
 */
function CloseWolfermusContextMenu(event) {
    const menu = GetContextMenu();
    if (menu.IsHoveringAnyMenu()) return;
    menu.Hide();
}

/**
 * @param {PointerEvent} event 
 */
function HideWolfermusContextMenu(event) {
    const menu = GetContextMenu();
    menu.Hide();
}

async function FullscreenChangeMainMenu() {
    if (GetMainMenu().items.length <= 0) return;

    const mainMenuRoot = await GetWolfermusRoot();
    const menu1 = GetMainMenu();
    const floatingButtonMenu = GetFloatingButtonMenu();

    if (document.fullscreenElement !== null) {
        mainMenuRoot.style.display = "none";
        floatingButtonMenu.Hide();
        menu1.Hide();
    } else {
        mainMenuRoot.style.display = "block";
        floatingButtonMenu.Show();
    }
}

function AttachInteractionEventsToMainMenu() {
    window.addEventListener("pointerclick", CloseWolfermusMainMenu);
    window.addEventListener("pointerup", CloseWolfermusMainMenu);
    window.addEventListener("pointerleave", HideWolfermusMainMenu);
    window.addEventListener("pointercancel", HideWolfermusMainMenu);
    window.addEventListener('pointermove', ToolTipPointerMove);

    window.addEventListener("pointerclick", CloseWolfermusContextMenu);
    window.addEventListener("pointerup", CloseWolfermusContextMenu);
    window.addEventListener("pointerleave", HideWolfermusContextMenu);
    window.addEventListener("pointercancel", HideWolfermusContextMenu);

    document.addEventListener('fullscreenchange', FullscreenChangeMainMenu);
    window.addEventListener('resize', ContrainMainMenu);
}

function RemoveInteractionEventsToMainMenu() {
    window.removeEventListener("pointerclick", CloseWolfermusMainMenu);
    window.removeEventListener("pointerup", CloseWolfermusMainMenu);
    window.removeEventListener("pointerleave", HideWolfermusMainMenu);
    window.removeEventListener("pointercancel", HideWolfermusMainMenu);
    window.removeEventListener('pointermove', ToolTipPointerMove);

    document.removeEventListener('fullscreenchange', FullscreenChangeMainMenu);
    window.removeEventListener('resize', ContrainMainMenu);
}

/**
 * Call this second.
 * 
 * This function executes a http request strongly advise against calling this often.
 * 
 * @description Updates the Main Menu Items and Regenerates HTML and Re-setups events.
 * @async
 */
async function UpdateMenuItems() {
    const wolfermusRoot = await GetWolfermusRoot();

    let wolfermusFloatingSnapBtnWrapper = document.getElementById("WolfermusFloatingSnapBtnWrapper");
    if (wolfermusFloatingSnapBtnWrapper === undefined || wolfermusFloatingSnapBtnWrapper === null) {
        debugger;
        return;
    }

    const mainMenu = GetMainMenu();
    const floatingButtonMenu = GetFloatingButtonMenu();

    RemoveInteractionEventsToMainMenu();

    if (mainMenu.items.length <= 0) {
        wolfermusRoot.style.display = "none";
        return;
    }

    if (wolfermusFloatingSnapBtnWrapper.classList.contains("WolfermusUpPosition")) {
        mainMenu.RemoveClass("WolfermusDownPosition");
        mainMenu.RemoveClass("WolfermusGroupDownPosition");
        mainMenu.AddClass("WolfermusUpPosition");
        mainMenu.AddClass("WolfermusGroupUpPosition");
    } else {
        mainMenu.RemoveClass("WolfermusUpPosition");
        mainMenu.RemoveClass("WolfermusGroupUpPosition");
        mainMenu.AddClass("WolfermusDownPosition");
        mainMenu.AddClass("WolfermusGroupDownPosition");
    }
    if (wolfermusFloatingSnapBtnWrapper.classList.contains("WolfermusRightPosition")) {
        mainMenu.RemoveClass("WolfermusLeftPosition");
        mainMenu.RemoveClass("WolfermusGroupLeftPosition");
        mainMenu.AddClass("WolfermusRightPosition");
        mainMenu.AddClass("WolfermusGroupRightPosition");
    } else {
        mainMenu.RemoveClass("WolfermusRightPosition");
        mainMenu.RemoveClass("WolfermusGroupRightPosition");
        mainMenu.AddClass("WolfermusLeftPosition");
        mainMenu.AddClass("WolfermusGroupLeftPosition");
    }

    await floatingButtonMenu.Generate(wolfermusFloatingSnapBtnWrapper);
    await mainMenu.Generate(wolfermusFloatingSnapBtnWrapper);

    mainMenu.element.style["transition"] = "";

    AttachInteractionEventsToMainMenu();

    await FullscreenChangeMainMenu();

    // TODO: Update StorageManagerLib to handly localStorage only options.
    if (!localStorage["WolfermusMainMenu"]) localStorage["WolfermusMainMenu"] = "{}";
    let WolfermusMainMenuSettings = JSON.parse(localStorage["WolfermusMainMenu"]);

    ContrainElementViaPosition(wolfermusFloatingSnapBtnWrapper, new Position(WolfermusMainMenuSettings.Left, WolfermusMainMenuSettings.Top));
}

(async () => {
    let wolfermusLoadLoopCounter = 100;
    while (!WolfermusCheckLibraryLoaded("StorageManager")) {
        await Sleep(100);

        if (wolfermusLoadLoopCounter <= 0) {
            alert("ERROR: antiStuckLoop engaged");
            return;
        }
        wolfermusLoadLoopCounter--;
    }

    if (WolfermusCheckLibraryLoaded("MainMenu")) return;

    console.log("Wolfermus Main Menu Library Loading...");

    let MainMenuLibrary = WolfermusGetLibrary("MainMenu", true);

    MainMenuLibrary["Loaded"] = false;

    MainMenuLibrary["Classes"] = {};
    MainMenuLibrary["Classes"]["WolfermusMenu"] = WolfermusMenu;
    MainMenuLibrary["Classes"]["WolfermusMenuItem"] = WolfermusMenuItem;
    MainMenuLibrary["Classes"]["WolfermusImageMenuItem"] = WolfermusImageMenuItem;

    MainMenuLibrary["Menus"] = {};
    MainMenuLibrary["Menus"]["GetMainMenu"] = GetMainMenu;
    MainMenuLibrary["Menus"]["GetFloatingButtonMenu"] = GetFloatingButtonMenu;
    MainMenuLibrary["Menus"]["GetContextMenu"] = GetContextMenu;

    MainMenuLibrary["UpdateWolfermusMainMenuStyle"] = UpdateWolfermusMainMenuStyle;
    MainMenuLibrary["UpdateMenuItems"] = UpdateMenuItems;

    MainMenuLibrary["Loaded"] = true;
})();