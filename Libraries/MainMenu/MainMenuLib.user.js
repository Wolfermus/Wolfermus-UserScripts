// ==UserScript==
// @name         Wolfermus Main Menu Library
// @namespace    https://greasyfork.org/en/users/900467-feb199
// @version      4.1.1
// @description  This script is a main menu library that provides easy means to add menu items and manipulate main menu
// @author       Feb199/Dannysmoka
// @homepageURL  https://github.com/Wolfermus/Wolfermus-UserScripts
// @supportURL   https://github.com/Wolfermus/Wolfermus-UserScripts/issues
// @updateURL    https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/main/Libraries/MainMenu/MainMenuLib.user.js
// @downloadURL  https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/main/Libraries/MainMenu/MainMenuLib.user.js
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

const wolfermusMainMenuLibStartTime = performance.now();

if (typeof wolfermusBypassScriptPolicy === "undefined" || typeof wolfermusBypassScriptPolicy === "null") {
    var wolfermusBypassScriptPolicy = trustedTypes.createPolicy("wolfermusBypassScript", {
        createHTML: (string) => string,
        createScript: (string) => string,
        createScriptURL: (string) => string
    });
}

//#region Setting Up ChosenXmlHttpRequest
if (typeof ChosenXmlHttpRequest === "undefined" || typeof ChosenXmlHttpRequest === "null") {
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

// TODO: Move MakeGetRequest to Utilities Lib
function MakeGetRequest(url) {
    return new Promise((resolve, reject) => {
        ChosenXmlHttpRequest({
            method: "GET",
            url: url,
            onload: (response) => {
                if (response.status !== 200) {
                    reject(response.statusText);
                    return;
                }
                resolve(response.responseText);
            },
            onerror: error => reject(error)
        });
    });
}

let IsGMInfo1 = false;
// @ts-ignore
if (typeof GM_info !== "undefined" && typeof GM_info !== "null" && GM_info) IsGMInfo1 = true;

let IsGMInfo2 = false;
// @ts-ignore
if (typeof GM !== "undefined" && typeof GM !== "null" && typeof GM.info !== "undefined" && typeof GM.info !== "null") IsGMInfo2 = true;

let IsGMInfo = false;
if (IsGMInfo1 || IsGMInfo2) IsGMInfo = true;

/**
 * @description Gets version of this script.
 * 
 * @throws If GM Info dosent exist or unknown error
 * @returns {string}
 */
function GetVersion() {
    if (!IsGMInfo) {
        throw new Error("Wolfermus ERROR - MainMenuLib: GM Info dosent exist");
        return undefined;
    }

    if (IsGMInfo2) {
        return GM.info.script.version;
    } else if (IsGMInfo1) {
        return GM_info.script.version;
    } else {
        throw new Error("Wolfermus ERROR - MainMenuLib: Unknown Error");
        return undefined;
    }
}

/**
 * @description Returns true if this script is beta.
 * 
 * @returns {boolean}
 */
function IsBeta() {
    return GetVersion().includes("beta");
}

/**
 * @param {number | undefined} ms
 */
function Sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    });
}

function MatchRuleExpl(str, rule) {
    // for this solution to work on any string, no matter what characters it has
    var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");

    // "."  => Find a single character, except newline or line terminator
    // ".*" => Matches any string that contains zero or more characters
    rule = rule.split("*").map(escapeRegex).join(".*");

    // "^"  => Matches any string with the following at the beginning of it
    // "$"  => Matches any string with that in front at the end of it
    rule = "^" + rule + "$"

    //Create a regular expression object for matching string
    var regex = new RegExp(rule);

    //Returns true if it finds a match, otherwise it returns false
    return regex.test(str);
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

    let branch = "main";
    if (IsBeta()) {
        branch = "beta";
    }

    async function GetHTML() {
        const baseResourcesURL = `https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/${branch}/Resources/`;
        const script = wolfermusBypassScriptPolicy.createScript(await MakeGetRequest(`${baseResourcesURL}Libraries/MainMenu/MainMenuLibHTML.js`));
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

    const editedInnerHTML = wolfermusBypassScriptPolicy.createHTML(eval(await AttemptLoadHTML()));

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
 * @type {WolfermusMenuItem | undefined}
 */
let WolfermusFabImageMenuItem = undefined;

/**
 * @returns {WolfermusMenuItem}
 */
function GetWolfermusFabImageMenuItem() {
    if (WolfermusFabImageMenuItem === undefined) {
        let mainWindow = window;

        try {
            if (unsafeWindow !== undefined) mainWindow = unsafeWindow;
        } catch (e) {

        }

        let imgSrc = "";
        if (!mainWindow["Wolfermus"]["Logo"] || !mainWindow["Wolfermus"]["Logo"]["Rounded"]) {
            console.log("Unable to locate logo");
        } else imgSrc = mainWindow["Wolfermus"]["Logo"]["Rounded"];

        // TODO: Update StorageManagerLib to handly localStorage only options.
        if (!localStorage["WolfermusMainMenu"]) localStorage["WolfermusMainMenu"] = "{}";
        let WolfermusMainMenuSettings = JSON.parse(localStorage["WolfermusMainMenu"]);

        WolfermusFabImageMenuItem = new WolfermusImageMenuItem(imgSrc);

        WolfermusMainMenuSettings.FloatingButton ??= {};
        WolfermusMainMenuSettings.FloatingButton.ToggleMovement ??= true;

        localStorage["WolfermusMainMenu"] = JSON.stringify(WolfermusMainMenuSettings);

        WolfermusFabImageMenuItem.pointerDownCallback = (event) => {
            // TODO: Update StorageManagerLib to handly localStorage only options.
            if (!localStorage["WolfermusMainMenu"]) localStorage["WolfermusMainMenu"] = "{}";
            let WolfermusMainMenuSettings = JSON.parse(localStorage["WolfermusMainMenu"]);

            if (!(WolfermusMainMenuSettings?.FloatingButton?.ToggleMovement ?? true)) return;

            const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
            if (fabElement === undefined || fabElement === null) return;

            if (WolfermusFabImageMenuItem.element === undefined || WolfermusFabImageMenuItem.element === null) return;

            WolfermusFabImageMenuItem.element.setPointerCapture(event.pointerId);

            WolfermusFabImageMenuItem.oldPositionX = fabElement.style.left;
            WolfermusFabImageMenuItem.oldPositionY = fabElement.style.top;

            WolfermusFabImageMenuItem.ShouldMove = true;

            fabElement.style.transition = "none";
        };

        WolfermusFabImageMenuItem.pointerUpCallback = async (event) => {
            // TODO: Update StorageManagerLib to handly localStorage only options.
            if (!localStorage["WolfermusMainMenu"]) localStorage["WolfermusMainMenu"] = "{}";
            let WolfermusMainMenuSettings = JSON.parse(localStorage["WolfermusMainMenu"]);

            if (!(WolfermusMainMenuSettings?.FloatingButton?.ToggleMovement ?? true)) return;

            const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
            if (fabElement === undefined || fabElement === null) return;

            if (WolfermusFabImageMenuItem.element === undefined || WolfermusFabImageMenuItem.element === null) return;

            //const GUIGotten = await GetValue("MainMenu", "{}");

            WolfermusFabImageMenuItem.ShouldMove = false;

            WolfermusFabImageMenuItem.element.releasePointerCapture(event.pointerId);

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

        WolfermusFabImageMenuItem.pointerMoveCallback = async (event) => {
            if (WolfermusFabImageMenuItem.element === undefined || WolfermusFabImageMenuItem.element === null) return;

            if (WolfermusFabImageMenuItem.ShouldMove !== true) return;

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
        WolfermusFabImageMenuItem.clickCallback = (event) => {
            const fabElement = document.getElementById("WolfermusFloatingSnapBtnWrapper");
            if (fabElement === undefined || fabElement === null) return;

            if ((WolfermusFabImageMenuItem.oldPositionY === undefined || WolfermusFabImageMenuItem.oldPositionX === undefined) || (WolfermusFabImageMenuItem.oldPositionY === fabElement.style.top && WolfermusFabImageMenuItem.oldPositionX === fabElement.style.left)) {
                GetMainMenu().ToggleVisibility();
            }
        };

        const updateMenuItemsContextMenuItem = new WolfermusButtonMenuItem(
            "Update Menu Items",
            "This Updates this whole menu and the floating button itself"
        );
        updateMenuItemsContextMenuItem.clickCallback = async (event) => {
            await UpdateMenuItems();

            updateMenuItemsContextMenuItem.contextMenu.Hide();
        };

        const forceRefreshWolfermusRootItem = new WolfermusButtonMenuItem(
            "Force Refresh WolfermusRoot HTMLElement",
            `This forces HTTP request latest WolfermusRoot HTML
            and refreshes the WolfermusRoot HTML`
        );
        forceRefreshWolfermusRootItem.clickCallback = async (event) => {
            await GetWolfermusRoot(true);

            await UpdateMenuItems();

            updateMenuItemsContextMenuItem.contextMenu.Hide();

            await WolfermusMenuItem.HideToolTip();
        };

        const updateWolfermusMainMenuStyleContextMenuItem = new WolfermusButtonMenuItem(
            "Update Wolfermus Main Menu Style CSS",
            `This Refreshes/Updates the Wolfermus Main Menu Style CSS`
        );
        updateWolfermusMainMenuStyleContextMenuItem.clickCallback = async (event) => {
            await UpdateWolfermusMainMenuStyle();

            updateMenuItemsContextMenuItem.contextMenu.Hide();

            await WolfermusMenuItem.HideToolTip();
        };

        const toggleMovementMenuItem = new WolfermusToggleButtonMenuItem(
            `Toggle Movement (On This Page)`,
            `Toggles the ability to move the floating button (per page setting)`
        );
        toggleMovementMenuItem.ToggledEventAddCallback(async (toggled) => {
            // TODO: Update StorageManagerLib to handly localStorage only options.
            if (!localStorage["WolfermusMainMenu"]) localStorage["WolfermusMainMenu"] = "{}";
            let WolfermusMainMenuSettings = JSON.parse(localStorage["WolfermusMainMenu"]);

            WolfermusMainMenuSettings.FloatingButton ??= {};

            WolfermusMainMenuSettings.FloatingButton.ToggleMovement = toggled;

            localStorage["WolfermusMainMenu"] = JSON.stringify(WolfermusMainMenuSettings);
        });

        WolfermusFabImageMenuItem.contextMenu.items.push(updateMenuItemsContextMenuItem);
        WolfermusFabImageMenuItem.contextMenu.items.push(forceRefreshWolfermusRootItem);
        WolfermusFabImageMenuItem.contextMenu.items.push(updateWolfermusMainMenuStyleContextMenuItem);
        WolfermusFabImageMenuItem.contextMenu.items.push(toggleMovementMenuItem);
    }
    return WolfermusFabImageMenuItem;
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

        FloatingButtonMenu.items.push(GetWolfermusFabImageMenuItem());
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

    let branch = "main";
    if (IsBeta()) {
        branch = "beta";
    }

    async function GetCSS() {
        const baseResourcesURL = `https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/${branch}/Resources/`;
        const css = wolfermusBypassScriptPolicy.createScript(await MakeGetRequest(`${baseResourcesURL}Libraries/MainMenu/MainMenuLib.css`));
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

    const editedInnerHTML = wolfermusBypassScriptPolicy.createHTML(await AttemptLoadCSS());

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

    if (mainMenuRoot.style.display === "none") return;
    if (fabElement.style.display === "none") return;

    if (fabElement.style.left === undefined || fabElement.style.left === null || fabElement.style.left === "" || !fabElement.style.left) return;
    if (fabElement.style.top === undefined || fabElement.style.top === null || fabElement.style.top === "" || !fabElement.style.top) return;

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

let wolfermusHrefChangesEvent = [];

let oldHref = document.location.href;
const observeUrlChange = () => {
    const body = document.querySelector('body');
    const observer = new MutationObserver(mutations => {
        if (oldHref !== document.location.href) {
            oldHref = document.location.href;
            for (let callback of wolfermusHrefChangesEvent) {
                callback?.();
            }
        }
    });
    observer.observe(body, { childList: true, subtree: true });
};

window.addEventListener("load", observeUrlChange);
observeUrlChange();

class WolfermusMenuItem {
    /**
     * @param {any} id
     * @param {string} title
     * @param {string} tooltip
     */
    constructor(title, tooltip = "") {
        WolfermusMenu.id++;
        this.id = WolfermusMenu.id;

        this.title = title;
        this.tooltip = tooltip;

        this.contextMenu.AddClass("WolfermusMainMenuContextMenu");

        wolfermusRootRefreshesEvent.push(() => {
            this.element = null;
            if (WolfermusMenuItem.#tooltipTimeoutID !== undefined) {
                clearTimeout(WolfermusMenuItem.#tooltipTimeoutID);
                WolfermusMenuItem.#tooltipTimeoutID = undefined;
            }
        });
        wolfermusHrefChangesEvent.push(this.CheckUrls);
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
     * @type {string}
     */
    #title;
    /**
     * @type {HTMLElement | null}
     */
    element = null;
    /**
     * @type {WolfermusMenu}
     */
    contextMenu = new WolfermusMenu();
    /**
     * @type {string}
     */
    tooltip = "";
    /**
     * @type {number}
     */
    tooltipTimeOut = 400;
    /**
     * @type {boolean}
     */
    #disabled = false;
    /**
     * @type {Array<String>}
     */
    classes = ["WolfermusDefaultCSS", "WolfermusTextItem"];

    get disabled() { return this.#disabled; }

    #ProxyDeletePropertyCallback = (target, property) => {
        delete target[property];
        if (isNaN(property)) return true;
        this.CheckUrls();
        return true;
    };

    #ProxySetCallback = (target, property, value, receiver) => {
        target[property] = value;
        if (isNaN(property)) return true;
        this.CheckUrls();
        return true;
    };

    //#region includesUrls
    /**
     * @type {Array<string>}
     * @default ["*"]
     */
    #includesArray = ["*"];

    #includesArrayProxy = new Proxy(this.#includesArray, {
        deleteProperty: this.#ProxyDeletePropertyCallback,
        set: this.#ProxySetCallback
    });

    /**
     * @type {Array<string>}
     * @default ["*"]
     */
    set includesUrls(newValue) {
        this.#includesArray.splice(0, this.#includesArray.length);

        if (Array.isArray(newValue)) {
            for (let newItem of newValue) {
                this.#includesArrayProxy.push(newItem);
            }
            return;
        }

        this.#includesArrayProxy.push(newValue);
    }
    /**
     * @type {Array<string>}
     * @default ["*"]
     */
    get includesUrls() { return this.#includesArrayProxy; }
    //#endregion -includesUrls

    //#region excludesUrls
    /**
     * @type {Array<string>}
     * @default []
     */
    #excludesArray = [];

    #excludesArrayProxy = new Proxy(this.#excludesArray, {
        deleteProperty: this.#ProxyDeletePropertyCallback,
        set: this.#ProxySetCallback
    });

    /**
     * @type {Array<string>}
     * @default []
     */
    set excludesUrls(newValue) {
        this.#excludesArray.splice(0, this.#excludesArray.length);

        if (Array.isArray(newValue)) {
            for (let newItem of newValue) {
                this.#excludesArrayProxy.push(newItem);
            }
            return;
        }

        this.#excludesArrayProxy.push(newValue);
    }
    /**
     * @type {Array<string>}
     * @default []
     */
    get excludesUrls() { return this.#excludesArrayProxy; }
    //#endregion -excludesUrls

    CheckUrls = () => {
        let includesBool = false;
        let excludesBool = false;

        for (const urlRule of this.#includesArray) {
            if (MatchRuleExpl(window.location.href, urlRule)) {
                includesBool = true;
                break;
            }
        }
        for (const urlRule of this.#excludesArray) {
            if (MatchRuleExpl(window.location.href, urlRule)) {
                excludesBool = true;
                break;
            }
        }

        if (includesBool && !excludesBool) {
            this.#disabled = false;
            if (this.element !== undefined && this.element !== null) {
                this.element.style.display = "";
            }
        } else {
            this.#disabled = true;
            if (this.element !== undefined && this.element !== null) {
                this.element.style.display = "none";
            }
            this.contextMenu.Hide();
        }
    }

    /**
     * @param {string} newTitle 
     */
    set title(newTitle) {
        this.#title = newTitle;
        if (this.element !== undefined && this.element !== null) {
            const gottenTitleElementGroup = this.element.getElementsByClassName(`Wolfermus${this.id}Title`);
            const gottenTitleItemElementGroup = this.element.getElementsByClassName(`Wolfermus${this.id}TitleItem`);
            const validTitle = (this.title !== undefined && this.title !== null & this.title !== "");

            for (let titleElement of gottenTitleElementGroup) {
                titleElement.innerText = this.#title;
            }
            for (let titleItemElement of gottenTitleItemElementGroup) {
                if (validTitle) {
                    titleItemElement.style.display = "";
                } else {
                    titleItemElement.style.display = "none";
                }
            }
        }
    }
    /**
     * @returns {string}
     */
    get title() {
        return this.#title;
    }

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
            this.#ToolTipMenuItem = new WolfermusMenuItem("");
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

        toolTips.RemoveClass("WolfermusToolTipSetVisable");
        toolTips.RemoveClass("WolfermusVisable");
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

        toolTips.AddClass("WolfermusToolTipSetVisable");
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

            toolTips.AddClass("WolfermusVisable");
            toolTips.RemoveClass("WolfermusToolTipSetVisable");
            toolTips.UpdateClasses();

            await toolTips.Generate(await GetWolfermusRoot());
        }, this.tooltipTimeOut);
    };
    /**
     * @param {PointerEvent} event
     * @type {(PointerEvent) => void}
     */
    #toolTipPointerLeaveCallback = async (event) => { await WolfermusMenuItem.HideToolTip(); };

    /**
     * @type {((PointerEvent) => void) | undefined}
     */
    #contextMenuCallback = undefined;

    /**
     * @type {((PointerEvent) => void) | undefined}
     */
    #closeWolfermusContextMenu = undefined;

    UpdateClasses() {
        if (this.element === undefined || this.element === null) return;
        this.element.classList = this.classes.join(" ");
    }

    /**
     * @param {String} classString 
     */
    AddClass(classString) {
        if (classString === undefined || classString === null || classString === "") return;
        if (this.classes.find((value) => value === classString) !== undefined) return;
        this.classes.push(classString);
    }
    /**
     * @param {String} classString
     */
    RemoveClass(classString) {
        if (classString === undefined || classString === null || classString === "") return;
        let indexOf = this.classes.findIndex((value) => value === classString);
        if (indexOf === -1) return;
        this.classes.splice(indexOf, 1);
    }
    /**
     * @param {String} classString
     */
    ToggleClass(classString) {
        if (classString === undefined || classString === null || classString === "") return;
        let indexOf = this.classes.findIndex((value) => value === classString);
        if (indexOf === -1) {
            this.classes.push(classString);
            return;
        }
        this.classes.splice(indexOf, 1);
    }
    /**
     * @param {String} classString
     * @returns {Boolean}
     */
    ContainsClass(classString) {
        if (classString === undefined || classString === null || classString === "") return;
        return this.classes.includes(classString);
    }

    /**
     * @returns {Array<string>}
     */
    GetCssURL() {
        return [];
    }

    UnloadCSS() {
        const gottenCssURL = this.GetCssURL();
        if (gottenCssURL === undefined || gottenCssURL === null || gottenCssURL.length <= 0) return;

        for (const urlIndex in gottenCssURL) {
            let menuItemStyle = document.getElementById(`${this.constructor.name}${urlIndex}Style`);

            if (menuItemStyle === undefined || menuItemStyle === null) continue;

            menuItemStyle.remove();
        }
    }

    /**
     * @async
     */
    async ValidateCSS() {
        const gottenCssURL = this.GetCssURL();
        if (gottenCssURL === undefined || gottenCssURL === null || gottenCssURL.length <= 0) return;

        let branch = "main";
        if (IsBeta()) {
            branch = "beta";
        }

        async function GetCSS(url) {
            if (url.startsWith("/")) {
                const baseResourcesURL = `https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/${branch}/Resources`;
                const css = await MakeGetRequest(`${baseResourcesURL}${url}`);
                return css;
            } else {
                const css = await MakeGetRequest(url);
                return css;
            }
        }

        let wolfermusPreventLoopLock1 = 10;
        async function AttemptLoadCSS(url) {
            return await GetCSS(url).then(async (response) => {
                return response;
            }).catch(async (error) => {
                if (wolfermusPreventLoopLock1 <= 0) return;
                wolfermusPreventLoopLock1--;
                await Sleep(50);
                return await AttemptLoadCSS(url);
            });
        }

        for (const urlIndex in gottenCssURL) {
            let menuItemStyle = document.getElementById(`${this.constructor.name}${urlIndex}Style`);

            if (menuItemStyle !== undefined && menuItemStyle !== null) continue;

            menuItemStyle = document.createElement("style");
            menuItemStyle.id = `${this.constructor.name}${urlIndex}Style`;
            document.head.append(menuItemStyle);

            const url = gottenCssURL[urlIndex];

            wolfermusPreventLoopLock1 = 10;
            const editedInnerHTML = wolfermusBypassScriptPolicy.createHTML(await AttemptLoadCSS(url));

            menuItemStyle.innerHTML = editedInnerHTML;
        }
    }

    /**
     * @param {WolfermusMenu} menu
     * @returns {string}
     */
    Generate(menu) {
        if (this.id === undefined) return "";

        this.ValidateCSS();

        const validTitle = (this.title !== undefined && this.title !== null & this.title !== "");

        return `
            <li id="WolfermusMenu${menu.id}${this.id}" class="${this.classes.join(" ")}">
                <a class="WolfermusTitle Wolfermus${this.id}Title Wolfermus${this.id}TitleItem" style="${validTitle ? "" : "display: none;"}">${this.title}</a>
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

        /**
         * 
         * @param {PointerEvent} event 
         * @type {(PointerEvent) => void}
         */
        this.#contextMenuCallback = async (event) => {
            if (this.id === undefined || this.id === null) return;
            if (this.contextMenu.attachedItem === this) return;

            this.contextMenu.Hide();
            menu.attached.contextMenu = undefined;

            if (this.contextMenu.items.length <= 0) return;

            event.preventDefault();

            const x = event.clientX;
            const y = event.clientY;

            this.contextMenu.attachedItem = this;
            menu.attached.contextMenu = this.contextMenu;

            this.contextMenu.UpdateClasses();
            await this.contextMenu.Generate(await GetWolfermusRoot());
            this.contextMenu.Show();

            ContrainElementViaPosition(this.contextMenu.element, new Position(x, y), false, false);
        };

        /**
         * @param {PointerEvent} event 
         * @type {(PointerEvent) => void}
         */
        this.#closeWolfermusContextMenu = (event) => {
            if (this.id === undefined) return;

            if (this.contextMenu.IsHoveringAnyMenu()) return;
            this.contextMenu.Hide();
            menu.attached.contextMenu = undefined;
        }

        this.element.addEventListener("contextmenu", this.#contextMenuCallback);

        window.addEventListener("pointerclick", this.#closeWolfermusContextMenu);
        window.addEventListener("pointerdown", this.#closeWolfermusContextMenu);
        window.addEventListener("pointerup", this.#closeWolfermusContextMenu);
        window.addEventListener("pointerleave", this.#closeWolfermusContextMenu);
        window.addEventListener("pointercancel", this.#closeWolfermusContextMenu);

        this.CheckUrls();

        return true;
    }

    /**
     * @param {WolfermusMenu} menu
     */
    RemoveEvents(menu) {
        if (this.element !== undefined && this.element !== null) {
            if (this.#currentClickCallback !== undefined) this.element.removeEventListener("click", this.#currentClickCallback);
            if (this.#currentDoubleClickCallback !== undefined) this.element.removeEventListener("dblclick", this.#currentDoubleClickCallback);
            if (this.#currentPointerEnterCallback !== undefined) this.element.removeEventListener("pointerenter", this.#currentPointerEnterCallback);
            if (this.#currentPointerLeaveCallback !== undefined) this.element.removeEventListener("pointerleave", this.#currentPointerLeaveCallback);
            if (this.#currentPointerDownCallback !== undefined) this.element.removeEventListener("pointerdown", this.#currentPointerDownCallback);
            if (this.#currentPointerUpCallback !== undefined) this.element.removeEventListener("pointerup", this.#currentPointerUpCallback);
            if (this.#currentPointerMoveCallback !== undefined) this.element.removeEventListener("pointermove", this.#currentPointerMoveCallback);
            if (this.#currentPointerCancelCallback !== undefined) this.element.removeEventListener("pointercancel", this.#currentPointerCancelCallback);

            this.element.removeEventListener("pointerenter", this.#toolTipPointerEnterCallback);
            this.element.removeEventListener("pointerleave", this.#toolTipPointerLeaveCallback);
            this.element.removeEventListener("pointercancel", this.#toolTipPointerLeaveCallback);
            this.element.removeEventListener("contextmenu", this.#contextMenuCallback);
        }

        this.#currentClickCallback = undefined;
        this.#currentDoubleClickCallback = undefined;
        this.#currentPointerEnterCallback = undefined;
        this.#currentPointerLeaveCallback = undefined;
        this.#currentPointerDownCallback = undefined;
        this.#currentPointerUpCallback = undefined;
        this.#currentPointerMoveCallback = undefined;
        this.#currentPointerCancelCallback = undefined;


        window.removeEventListener("pointerclick", this.#closeWolfermusContextMenu);
        window.removeEventListener("pointerdown", this.#closeWolfermusContextMenu);
        window.removeEventListener("pointerup", this.#closeWolfermusContextMenu);
        window.removeEventListener("pointerleave", this.#closeWolfermusContextMenu);
        window.removeEventListener("pointercancel", this.#closeWolfermusContextMenu);

        this.#contextMenuCallback = undefined;
        this.#closeWolfermusContextMenu = undefined;
    }
}

class WolfermusImageMenuItem extends WolfermusMenuItem {
    /**
     * @param {string} imageSource
     * @param {string} tooltip
     */
    constructor(imageSource, tooltip = "") {
        super("", tooltip);
        this.imageSource = imageSource;
        this.RemoveClass("WolfermusTextItem");
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

        this.ValidateCSS();

        return `
            <li id="WolfermusMenu${menu.id}${this.id}" class="${this.classes.join(" ")}">
                <img src="${this.imageSource}" class="WolfermusDefaultCSS"></img>
            </li>
        `;
    }
}

class WolfermusButtonMenuItem extends WolfermusMenuItem {
    /**
     * @param {string} title
     * @param {string} tooltip
     */
    constructor(title, tooltip = "") {
        super(title, tooltip);
        this.RemoveClass("WolfermusTextItem");
        this.AddClass("WolfermusActivable");
    }
}

class WolfermusToggleButtonMenuItem extends WolfermusButtonMenuItem {
    /**
     * @param {string} title
     * @param {string} tooltip
     */
    constructor(title, tooltip = "") {
        super(title, tooltip);
        this.AddClass("WolfermusToggleable");
        this.AddClass("WolfermusFalse");
    }

    /**
     * @type {boolean}
     */
    #toggledValue = false;

    /**
     * @type {Array<(toggled: boolean) => void>}
     */
    #toggledEvent = [];
    /**
     * @type {Array<() => void>}
     */
    #toggledTrueEvent = [];
    /**
     * @type {Array<() => void>}
     */
    #toggledFalseEvent = [];

    /**
     * @param {PointerEvent} event 
     */
    #toggledClickCallback = (event) => {
        this.Toggle();
    };

    /**
     * @param {boolean} newValue
     */
    set toggled(newValue) {
        if (typeof newValue !== "boolean") return;
        this.#toggledValue = newValue;

        this.RemoveClass("WolfermusTrue");
        this.RemoveClass("WolfermusFalse");
        if (this.#toggledValue) {
            this.AddClass("WolfermusTrue");
        } else {
            this.AddClass("WolfermusFalse");
        }

        this.UpdateClasses();

        for (const callback of this.#toggledEvent) {
            callback?.(this.#toggledValue);
        }

        if (this.#toggledValue) {
            for (const callback of this.#toggledTrueEvent) {
                callback?.();
            }
        } else {
            for (const callback of this.#toggledFalseEvent) {
                callback?.();
            }
        }
    }
    get toggled() { return this.#toggledValue; }

    Toggle() {
        this.toggled = !this.toggled;
    }

    /**
     * @param {WolfermusMenu} menu
     * @returns {Boolean}
     */
    async SetupEvents(menu) {
        if (!super.SetupEvents(menu)) return false;

        this.element.addEventListener("click", this.#toggledClickCallback);

        return true;
    }

    /**
     * @param {WolfermusMenu} menu
     */
    RemoveEvents(menu) {
        super.RemoveEvents(menu);

        if (this.element === undefined || this.element === null) return;

        this.element.removeEventListener("click", this.#toggledClickCallback);
    }

    /**
     * Duplicate callbacks will be ignored.
     * 
     * @param {(toggled: boolean) => void} callback 
     */
    ToggledEventAddCallback(callback) {
        if (this.#toggledEvent.includes(callback)) return;
        this.#toggledEvent.push(callback);
    }
    /**
     * @param {(toggled: boolean) => void} callback 
     */
    ToggledEventRemoveCallback(callback) {
        const foundIndex = this.#toggledEvent.findIndex(callbackItem => callbackItem === callback);
        if (foundIndex <= -1) return;

        this.#toggledEvent.splice(foundIndex, 1);
    }

    /**
     * Duplicate callbacks will be ignored.
     * 
     * @param {() => void} callback 
     */
    ToggledTrueEventAddCallback(callback) {
        if (this.#toggledTrueEvent.includes(callback)) return;
        this.#toggledTrueEvent.push(callback);
    }
    /**
     * @param {() => void} callback 
     */
    ToggledTrueEventRemoveCallback(callback) {
        const foundIndex = this.#toggledTrueEvent.findIndex(callbackItem => callbackItem === callback);
        if (foundIndex <= -1) return;

        this.#toggledTrueEvent.splice(foundIndex, 1);
    }

    /**
     * Duplicate callbacks will be ignored.
     * 
     * @param {() => void} callback 
     */
    ToggledFalseEventAddCallback(callback) {
        if (this.#toggledFalseEvent.includes(callback)) return;
        this.#toggledFalseEvent.push(callback);
    }
    /**
     * @param {() => void} callback 
     */
    ToggledFalseEventRemoveCallback(callback) {
        const foundIndex = this.#toggledFalseEvent.findIndex(callbackItem => callbackItem === callback);
        if (foundIndex <= -1) return;

        this.#toggledFalseEvent.splice(foundIndex, 1);
    }
}

class WolfermusBaseGroupMenuItem extends WolfermusMenuItem {
    /**
     * @param {string} title
     * @param {string} tooltip
     */
    constructor(title, tooltip = "") {
        super(title, tooltip);
    }

    /**
     * @type {Array<WolfermusMenuItem>}
     */
    items = [];
}

class WolfermusSpacerMenuItem extends WolfermusMenuItem {
    /**
     * @param {any} height
     */
    constructor(height = "30px") {
        super("", "");

        this.#height = height;
    }

    #height = "30px";

    set height(newValue) {
        if (newValue === this.#height) return;
        this.#height = newValue;

        if (this.element === undefined || this.element === null || !this.element) return;
        this.element.style.height = this.#height;
    }
    get height() { return this.#height; }

    /**
     * @param {WolfermusMenu} menu
     * @returns {string}
     */
    Generate(menu) {
        if (this.id === undefined) return "";

        this.ValidateCSS();

        return `
            <li id="WolfermusMenu${menu.id}${this.id}" class="${this.classes.join(" ")}" style="height: ${this.#height};"></li>
        `;
    }
}

class WolfermusInputMenuItem extends WolfermusMenuItem {
    /**
     * @param {string} type
     * @param {any} id
     * @param {string} title
     * @param {string} [tooltip=""]
     * @param {any} [value=0]
     * @param {any} [min=0]
     * @param {any} [max=100]
     * @param {any} [step=1]
     */
    constructor(type, title, tooltip = "", value = 0, min = undefined, max = undefined, step = 1) {
        super(title, tooltip);
        this.AddClass("WolfermusInputItem");

        this.#min = min;
        this.#max = max;
        this.#step = step;
        this.value = value;
        this.type = type
    }

    /**
     * @type {any}
     */
    #value = 0;
    /**
     * @type {any}
     */
    #min = undefined;
    /**
     * @type {any}
     */
    #max = undefined;
    /**
     * @type {any}
     */
    #step = 1;

    /**
     * @type {string}
     */
    #type = "text";

    /**
     * @returns {Array<string>}
     */
    GetCssURL() {
        let gottenCssURL = super.GetCssURL();
        gottenCssURL.push("/Libraries/MainMenu/Input.css");
        return gottenCssURL;
    }

    /**
     * @type {Array<(currentValue, previousValue) => void>}
     */
    #valueChangeEvent = [];

    /**
     * @param {InputEvent} event 
     * @type {(event: InputEvent) => voud}
     */
    #inputCallback = (event) => {
        this.value = event.target.value;
    };

    get inputCallback() { return this.#inputCallback; }

    /**
     * @param {(currentValue, previousValue) => void} callback 
     */
    ValueChangeAddCallback(callback) {
        if (callback === undefined || callback === null) return;
        if (this.#valueChangeEvent.includes(callback)) return;

        this.#valueChangeEvent.push(callback);
    }

    /**
     * @param {(currentValue, previousValue) => void} callback 
     */
    ValueChangeRemoveCallback(callback) {
        if (callback === undefined || callback === null) return;
        const foundIndex = this.#valueChangeEvent.findIndex((callbackItem) => callbackItem === callback);
        if (foundIndex <= -1) return;

        this.#valueChangeEvent.splice(foundIndex, 1);
    }

    /**
     * @type {(void) => void}
     */
    #ValidateValue = () => {
        if (this.#min !== undefined && this.#min !== null && this.#value < this.#min) this.value = this.#min;
        else if (this.#max !== undefined && this.#max !== null && this.#value > this.#max) this.value = this.#max;
    };

    /**
     * @type {(void) => void}
     */
    #UpdateInput = () => {
        if (this.element === undefined || this.element === null) return;

        const gottonWolfermusInputElements = this.element.getElementsByClassName("WolfermusInput");
        if (gottonWolfermusInputElements.length <= 0) return;

        const wolfermusInputElement = gottonWolfermusInputElements[0];

        if (wolfermusInputElement.type !== "range" && this.#type === "range") {
            wolfermusInputElement.removeEventListener("input", this.#inputCallback);
            wolfermusInputElement.removeEventListener("change", this.#inputCallback);

            wolfermusInputElement.addEventListener("input", this.#inputCallback);
        } else if (wolfermusInputElement.type === "range" && this.#type !== "range") {
            wolfermusInputElement.removeEventListener("input", this.#inputCallback);
            wolfermusInputElement.removeEventListener("change", this.#inputCallback);

            wolfermusInputElement.addEventListener("change", this.#inputCallback);
        }

        wolfermusInputElement.value = this.#value;
        wolfermusInputElement.min = this.#min;
        wolfermusInputElement.max = this.#max;
        wolfermusInputElement.step = this.#step;
        wolfermusInputElement.type = this.#type;
    };

    get UpdateInput() { return this.#UpdateInput; }

    /**
     * @param {string} newValue
     */
    set type(newValue) {
        if (newValue === this.#value) return;

        this.#type = newValue;

        this.#UpdateInput();
    }
    get type() { return this.#type; }

    /**
     * @param {any} newValue
     */
    set value(newValue) {
        if (newValue === this.#value) return;

        const oldValue = this.#value;

        if (newValue < this.#min) this.#value = this.#min;
        else if (newValue > this.#max) this.#value = this.#max;
        else this.#value = newValue;

        this.#UpdateInput();

        for (let callback of this.#valueChangeEvent) {
            callback?.(this.#value, oldValue);
        }
    }
    get value() { return this.#value; }

    /**
     * @param {any} newValue
     */
    set min(newValue) {
        if (newValue === this.#min) return;

        this.#min = newValue;
        this.#ValidateValue();

        this.#UpdateInput();
    }
    get min() { return this.#min; }

    /**
     * @param {any} newValue
     */
    set max(newValue) {
        if (newValue === this.#max) return;

        this.#max = newValue;
        this.#ValidateValue();

        this.#UpdateInput();
    }
    get max() { return this.#max; }

    /**
     * @param {any} newValue
     */
    set step(newValue) {
        if (newValue === this.#step) return;

        this.#step = newValue;

        this.#UpdateInput();
    }
    get step() { return this.#step; }

    /**
     * @param {WolfermusMenu} menu
     * @returns {string}
     */
    Generate(menu) {
        if (this.id === undefined) return "";

        this.ValidateCSS();

        const validTitle = (this.title !== undefined && this.title !== null & this.title !== "");

        return `
            <li id="WolfermusMenu${menu.id}${this.id}" class="${this.classes.join(" ")}">
                <a class="WolfermusTitle Wolfermus${this.id}Title Wolfermus${this.id}TitleItem" style="${validTitle ? "" : "display: none;"}">${this.title}</a>
                <div>
                    <input class="WolfermusInput WolfermusText" type="${this.#type}" value="${this.#value}" min="${this.#min}" max="${this.max}" step="${this.step}">
                </div>
            </li>
        `;
    }

    /**
     * @param {WolfermusMenu} menu
     * @returns {Boolean}
     */
    async SetupEvents(menu) {
        if (!super.SetupEvents(menu)) return false;

        if (this.element === undefined || this.element === null) return false;

        const gottonWolfermusInputElements = this.element.getElementsByClassName("WolfermusInput");
        if (gottonWolfermusInputElements.length <= 0) return false;

        const wolfermusInputElement = gottonWolfermusInputElements[0];

        if (this.#type === "range") {
            wolfermusInputElement.addEventListener("input", this.#inputCallback);
        } else wolfermusInputElement.addEventListener("change", this.#inputCallback);

        return true;
    }

    /**
     * @param {WolfermusMenu} menu
     */
    RemoveEvents(menu) {
        super.RemoveEvents(menu);

        if (this.element !== undefined && this.element !== null) {
            const gottonWolfermusInputElements = this.element.getElementsByClassName("WolfermusInput");
            if (gottonWolfermusInputElements.length > 0) {
                const wolfermusInputElement = gottonWolfermusInputElements[0];

                wolfermusInputElement.removeEventListener("input", this.#inputCallback);
                wolfermusInputElement.removeEventListener("change", this.#inputCallback);
            }
        }
    }
}

class WolfermusMenu {
    constructor() {
        WolfermusMenu.id++;
        this.id = WolfermusMenu.id;

        wolfermusRootRefreshesEvent.push(() => {
            this.RemoveEvents();
            this.element = null;
        });
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
     * @type {WolfermusMenuItem | undefined}
     */
    attachedItem = undefined;
    /**
     * @type {Array<WolfermusMenuItem>}
     */
    items = [];
    /**
     * @type {Array<WolfermusMenuItem>}
     */
    #currentItems = []; // TODO: Remove and have add/remove/set for items instead for live updating, instead of UpdateMenuItems being required. But still allow items to be added without having to regenerate with pass in variable.
    /**
     * @type {HTMLElement | null}
     */
    element = null;
    /**
     * @type {{
     *  menu: WolfermusMenu,
     *  contextMenu: WolfermusMenu
     * }}
     */
    attached = {
        menu: undefined,
        contextMenu: undefined
    };

    /**
     * @type {Number | undefined}
     */
    timeoutID = undefined;
    /**
     * @type {Number | undefined}
     */
    cooldownTimeoutID = undefined;

    /**
     * @type {Array<String>}
     */
    #classes = ["WolfermusDefaultCSS", "WolfermusPopUpMenu", "WolfermusText"];
    /**
     * @type {boolean} 
     */
    #showing = false;
    /**
     * @type {boolean}
     */
    #transitioningValue = false;

    /**
    * @returns {boolean}
    */
    get transitioning() {
        return this.#transitioningValue;
    }

    /**
     * @param {TransitionEvent} event
     * @type {(TransitionEvent) => void}
     */
    #transitionStartCallback = (event) => {
        this.#transitioningValue = true;
    };
    /**
    * @param {TransitionEvent} event
    * @type {(TransitionEvent) => void}
    */
    #transitionEndCallback = (event) => {
        this.#transitioningValue = false;
    };

    /**
     * @returns {Boolean}
     */
    async SetupEvents() {
        if (this.id === undefined) return false;
        if (this.element === undefined || this.element === null) return false;

        this.element.addEventListener("transitionstart", this.#transitionStartCallback);
        this.element.addEventListener("transitionend", this.#transitionEndCallback);
        this.element.addEventListener("transitioncancel", this.#transitionEndCallback);

        return true;
    }

    RemoveEvents() {
        if (this.element !== undefined && this.element !== null) {
            this.element.removeEventListener("transitionstart", this.#transitionStartCallback);
            this.element.removeEventListener("transitionend", this.#transitionEndCallback);
            this.element.removeEventListener("transitioncancel", this.#transitionEndCallback);
        }

        this.#transitioningValue = false;
    }

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

        this.SetupEvents();
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
        if (this.attached?.menu?.timeoutID !== undefined) {
            clearTimeout(this.attached.menu.timeoutID);
            this.attached.menu.timeoutID = undefined;
        }
        if (this.attached?.menu?.cooldownTimeoutID !== undefined) {
            clearTimeout(this.attached.menu.cooldownTimeoutID);
            this.attached.menu.cooldownTimeoutID = undefined;
        }
        if (this.attached.menu !== undefined && this.attached.menu !== null) {
            this.attached.menu.Hide();
        }
        if (this.attached.contextMenu !== undefined && this.attached.contextMenu !== null) {
            this.attached.contextMenu.Hide();
            this.attached.contextMenu = undefined;
        }

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

        this.element.innerHTML = wolfermusBypassScriptPolicy.createHTML(`
            <ul class="WolfermusDefaultCSS">
                ${this.#GenerateItems()}
            </ul>
        `);

        await this.#SetupItems();
    }

    Show() {
        if (this.element !== undefined && this.element !== null) {
            this.element.style["visibility"] = "visible";
        }

        this.#showing = true;
    }

    Hide() {
        if (this.attached?.contextMenu !== undefined) {
            this.attached.contextMenu.Hide();
            this.attached.contextMenu = undefined;
        }

        if (this.attached?.menu !== undefined) {
            this.attached.menu.Hide();
        }

        if (this.element !== undefined && this.element !== null) {
            this.element.style["visibility"] = "hidden";
        }

        this.#showing = false;
        this.attachedItem = undefined;
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
            if (this.attached.menu.IsHoveringAnyMenu()) return true;
        }

        if (this.attached?.contextMenu !== undefined) {
            if (this.attached.contextMenu.IsHoveringAnyMenu()) return true;
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

    if (!toolTips.ContainsClass("WolfermusVisable") && !toolTips.ContainsClass("WolfermusToolTipSetVisable")) return;

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
    if (menu.attached?.menu?.id === undefined) return;

    if (menu.attached.menu?.attachedItem?.ContainsClass?.("WolfermusActive")) {
        menu.attached.menu.attachedItem.RemoveClass("WolfermusActive");
        menu.attached.menu.attachedItem.UpdateClasses();
    }
}

/**
 * @param {PointerEvent} event 
 */
function CloseWolfermusMainMenu(event) {
    const menu = GetMainMenu();
    if (menu.IsHoveringAnyMenu()) return;
    ResetItemBackgroundColor();
    if (menu.attached?.menu !== undefined) {
        menu.attached.menu.Hide();
    }
}

/**
 * @param {PointerEvent} event 
 */
function HideWolfermusMainMenu(event) {
    const menu = GetMainMenu();
    ResetItemBackgroundColor();
    if (menu.attached?.menu !== undefined) {
        menu.attached.menu.Hide();
    }
}

async function FullscreenChangeMainMenu() {
    const mainMenu = GetMainMenu();
    if (mainMenu.items.length <= 0) return;

    const mainMenuRoot = await GetWolfermusRoot();
    const floatingButtonMenu = GetFloatingButtonMenu();

    if (document.fullscreenElement !== null) {
        mainMenuRoot.style.display = "none";
        floatingButtonMenu.Hide();
        mainMenu.Hide();
    } else {
        mainMenuRoot.style.display = "block";
        floatingButtonMenu.Show();
    }
}

function AttachInteractionEventsToMainMenu() {
    window.addEventListener("pointerclick", CloseWolfermusMainMenu);
    window.addEventListener("pointerdown", CloseWolfermusMainMenu);
    window.addEventListener("pointerup", CloseWolfermusMainMenu);
    window.addEventListener("pointerleave", HideWolfermusMainMenu);
    window.addEventListener("pointercancel", HideWolfermusMainMenu);
    window.addEventListener('pointermove', ToolTipPointerMove);

    document.addEventListener('fullscreenchange', FullscreenChangeMainMenu);
    window.addEventListener('resize', ContrainMainMenu);
}

function RemoveInteractionEventsToMainMenu() {
    window.removeEventListener("pointerclick", CloseWolfermusMainMenu);
    window.removeEventListener("pointerdown", CloseWolfermusMainMenu);
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

    console.info("Wolfermus MainMenu Library - Loading...");

    let MainMenuLibrary = WolfermusGetLibrary("MainMenu", true);

    if (!WolfermusCheckLibraryLoaded("Utilities")) {
        let UtilitiesLibrary = WolfermusGetLibrary("Utilities", true);

        UtilitiesLibrary["Loaded"] = false;

        UtilitiesLibrary["MakeGetRequest"] = MakeGetRequest;
        UtilitiesLibrary["IsBeta"] = IsBeta;

        UtilitiesLibrary["Loaded"] = true;
    }

    MainMenuLibrary["Loaded"] = false;

    MainMenuLibrary["Classes"] = {};
    MainMenuLibrary["Classes"]["WolfermusMenu"] = WolfermusMenu;
    MainMenuLibrary["Classes"]["WolfermusMenuItem"] = WolfermusMenuItem;
    MainMenuLibrary["Classes"]["WolfermusInputMenuItem"] = WolfermusInputMenuItem;
    MainMenuLibrary["Classes"]["WolfermusSpacerMenuItem"] = WolfermusSpacerMenuItem;

    MainMenuLibrary["Classes"]["Bases"] = {}
    MainMenuLibrary["Classes"]["Bases"]["WolfermusBaseGroupMenuItem"] = WolfermusBaseGroupMenuItem;

    MainMenuLibrary["Classes"]["Addons"] = {};
    MainMenuLibrary["Classes"]["Addons"]["WolfermusImageMenuItem"] = WolfermusImageMenuItem;

    MainMenuLibrary["Classes"]["Addons"]["Buttons"] = {};
    MainMenuLibrary["Classes"]["Addons"]["Buttons"]["WolfermusButtonMenuItem"] = WolfermusButtonMenuItem;
    MainMenuLibrary["Classes"]["Addons"]["Buttons"]["WolfermusToggleButtonMenuItem"] = WolfermusToggleButtonMenuItem;


    MainMenuLibrary["Menus"] = {};
    MainMenuLibrary["Menus"]["GetMainMenu"] = GetMainMenu;
    MainMenuLibrary["Menus"]["GetFloatingButtonMenu"] = GetFloatingButtonMenu;

    MainMenuLibrary["Elements"] = {};
    MainMenuLibrary["Elements"]["GetWolfermusRoot"] = GetWolfermusRoot;

    MainMenuLibrary["UpdateWolfermusMainMenuStyle"] = UpdateWolfermusMainMenuStyle;
    MainMenuLibrary["UpdateMenuItems"] = UpdateMenuItems;

    MainMenuLibrary["Loaded"] = true;

    const endTime = performance.now();
    console.info(`Wolfermus MainMenu Library: Loaded - Took ${endTime - wolfermusMainMenuLibStartTime}ms`);
})();