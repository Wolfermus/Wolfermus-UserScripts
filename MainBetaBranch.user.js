// ==UserScript==
// @name         Wolfermus Main Menu (Beta)
// @namespace    https://greasyfork.org/en/users/900467-feb199
// @version      2.0.8
// @description  This script is a main menu that loads displays all scripts and allows you to enable them. (Beta)
// @author       Feb199/Dannysmoka
// @homepageURL  https://github.com/Wolfermus/Wolfermus-UserScripts
// @supportURL   https://github.com/Wolfermus/Wolfermus-UserScripts/issues
// @updateURL    https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/beta/Main.user.js
// @license      GPLv3
// @noframes
// @match        *
// @match        *://*/*
// @match        http://*/*
// @match        https://*/*
// @require      https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/beta/Libraries/StorageManagerLib.user.js
// @require      https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/beta/Libraries/MainMenuLib.user.js
// @connect      raw.githubusercontent.com
// @connect      api.github.com
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

    if (WolfermusCheckModuleLoaded("MainMenu")) return;
    let mainMenuModule = WolfermusGetModule("MainMenu", true);

    while (mainMenuModule["Loading"] === true) {
        await Sleep(500);
    }

    if (WolfermusCheckModuleLoaded("MainMenu")) return;

    mainMenuModule["Loaded"] = false;
    mainMenuModule["Loading"] = true;

    console.log("Wolfermus Main Menu Loading...");

    let wolfermusLoadLoopCounter = 0;
    while (!WolfermusCheckLibraryLoaded("MainMenu")) {
        await Sleep(500);

        if (wolfermusLoadLoopCounter >= 100) {
            alert("ERROR: antiStuckLoop engaged");
            return;
        }
        wolfermusLoadLoopCounter++;
    }
    let mainMenuLibrary = WolfermusGetLibrary("MainMenu");

    /**
     * Update Main Menu Items
     * @async
     * @type {() => Promise<void>}
     */
    const UpdateMenuItems = mainMenuLibrary["UpdateMenuItems"];

    /**
     * Updates the Main Menu Style
     * @async
     * @type {() => Promise<void>}
     */
    const UpdateWolfermusMainMenuStyle = mainMenuLibrary["UpdateWolfermusMainMenuStyle"];

    // async function LoadScript() {
    //     MakeGetRequest(`https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/main/Scripts/Main.js`).then((result) => {
    //         const script = wolfermusBypassScriptPolicy.createScript(result);
    //         return eval(script)().then(() => {
    //             resolve();
    //         }).catch(() => {
    //             Sleep(200);
    //             return LoadScript();
    //         });
    //     })
    // }

    const websiteName = window.location.hostname;
    const branch = "beta";
    const baseScriptURL = `https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/${branch}/Scripts/${websiteName}`;
    async function GetScripts() {
        let gottenBody = JSON.parse(await MakeGetRequest(`https://api.github.com/repos/Wolfermus/Wolfermus-UserScripts/git/trees/${branch}`));
        let scriptsFolderItem = gottenBody.tree.find(item => item.path === "Scripts");

        let gottenScriptsFolder = JSON.parse(await MakeGetRequest(scriptsFolderItem.url));

        let websiteFolderItem = gottenScriptsFolder.tree.filter(item => item.type === "tree").find(item => item.path === websiteName);

        let scriptsURLS = [];

        let gottenWebsiteScriptsFolder = JSON.parse(await MakeGetRequest(websiteFolderItem.url));
        for (let scriptItem of gottenWebsiteScriptsFolder.tree) {
            if (scriptItem.type === "blob") {
                scriptsURLS.push(`${baseScriptURL}/${scriptItem.path}`);
            } else if (scriptItem.type === "tree") {
                scriptsURLS.push(`${baseScriptURL}/${scriptItem.path}/Main.js`);
            }
        }

        return scriptsURLS;
    }

    const bypassScriptPolicyMainMenuMain = trustedTypes.createPolicy("bypassScriptMainMenuMain", {
        createScript: (string) => string,
        createScriptURL: (string) => string
    });

    let wolfermusPreventLoopLock1 = 10;
    async function LoadScript(path) {
        //console.log("Scripts/Main.js - 3");
        try {
            const script = bypassScriptPolicyMainMenuMain.createScript(await MakeGetRequest(path));
            eval(script)(baseScriptURL);
        } catch (error) {
            if (wolfermusPreventLoopLock1 <= 0) return;
            wolfermusPreventLoopLock1--;
            await Sleep(100);
            await LoadScript(path);
        }
    }

    //await Sleep(1000);



    async function AttemptLoadScript() {
        const fetchedScripts = await GetScripts();
        for (let scriptURL of fetchedScripts) {
            //console.log("Scripts/Main.js - 2");
            await LoadScript(scriptURL).catch(async (error) => {
                debugger;
                console.error(`Wolfermus ERROR: Main - Failed To Load Scripts\n${error}`);
            });
        }
    }
    //console.log("Scripts/Main.js - 1");
    await AttemptLoadScript();

    {
        let wolfermusAntiStuckLoop1 = 100;
        while (document.readyState !== "complete") {
            await Sleep(100);

            if (wolfermusAntiStuckLoop1 < 0) {
                alert("ERROR: antiStuckLoop engaged");
                return;
            }
            wolfermusAntiStuckLoop1--;
        }
    }

    await Sleep(500);

    await UpdateWolfermusMainMenuStyle();
    await UpdateMenuItems();

    if (wolfermusPreventLoopLock1 <= 0) {
        mainMenuModule["Loading"] = false;
        return;
    }

    //console.log("Scripts/Main.js - 5");

    console.log("Wolfermus Loaded Scripts/Main.js");

    mainMenuModule["Loaded"] = true;
    mainMenuModule["Loading"] = false;
})();
