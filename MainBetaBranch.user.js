// ==UserScript==
// @name         Wolfermus Main Menu (Beta)
// @namespace    https://greasyfork.org/en/users/900467-feb199
// @version      2.0.14-beta
// @description  This script is a main menu that loads displays all scripts and allows you to enable them. (Beta)
// @author       Feb199/Dannysmoka
// @homepageURL  https://github.com/Wolfermus/Wolfermus-UserScripts
// @supportURL   https://github.com/Wolfermus/Wolfermus-UserScripts/issues
// @updateURL    https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/beta/MainBetaBranch.user.js
// @downloadURL  https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/beta/MainBetaBranch.user.js
// @license      GPLv3
// @noframes
// @match        *
// @match        *://*/*
// @match        http://*/*
// @match        https://*/*
// @require      https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/beta/Libraries/StorageManagerLib.user.js
// @require      https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/beta/Libraries/MainMenu/MainMenuLib.user.js
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

const wolfermusMainMenuStartTime = performance.now();

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
                    reject(response.statusText);
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
        await Sleep(100);
    }

    if (WolfermusCheckModuleLoaded("MainMenu")) return;

    mainMenuModule["Loaded"] = false;
    mainMenuModule["Loading"] = true;

    console.info("Wolfermus Main Menu Loading...");

    let wolfermusLoadLoopCounter = 0;
    while (!WolfermusCheckLibraryLoaded("MainMenu")) {
        await Sleep(50);

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
    const baseURL = `https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/${branch}/`;
    const baseScriptURL = `${baseURL}Scripts/`;
    const baseWebsiteScriptURL = `${baseScriptURL}${websiteName}/`;
    async function GetScripts() {
        //const wholeFunctionStartTime = performance.now();

        let startsWithString = "Scripts/";
        let websiteNameStartsWithString = `${websiteName}/`;
        let scriptsURLS = [];

        let gottenBody = JSON.parse(await MakeGetRequest(`https://api.github.com/repos/Wolfermus/Wolfermus-UserScripts/git/trees/${branch}?recursive=true`));

        let scriptsItems = gottenBody.tree.filter(item => item.path.startsWith(startsWithString));
        scriptsItems.forEach(item => item.path = item.path.slice(startsWithString.length));

        {
            let everyWhereScripts = scriptsItems.filter(item => (!item.path.includes("/") && item.type === "blob"));
            scriptsURLS.push(...everyWhereScripts.map(item => baseScriptURL + item.path));
        }

        let websiteFolderItems = scriptsItems.filter(item => item.path.startsWith(websiteNameStartsWithString));
        websiteFolderItems.forEach(item => item.path = item.path.slice(websiteNameStartsWithString.length));

        {
            let youtubeSingleScripts = websiteFolderItems.filter(item => (!item.path.includes("/") && item.type === "blob"));
            scriptsURLS.push(...youtubeSingleScripts.map(item => baseWebsiteScriptURL + item.path));
        }

        {
            let youtubeModuleScripts = websiteFolderItems.filter(item => (item.path.endsWith("/Main.js") && item.type === "blob"));
            scriptsURLS.push(...youtubeModuleScripts.map(item => baseWebsiteScriptURL + item.path));
        }

        //console.info(`Wolfermus Main Menu Loaded - GetScripts - wholeFunction - Took ${performance.now() - wholeFunctionStartTime}ms`);

        return scriptsURLS;
    }

    const bypassScriptPolicyMainMenuMain = trustedTypes.createPolicy("bypassScriptMainMenuMain", {
        createScript: (string) => string,
        createScriptURL: (string) => string
    });

    let wolfermusPreventLoopLock1 = 10;
    async function LoadScript(path) {
        try {
            const script = bypassScriptPolicyMainMenuMain.createScript(await MakeGetRequest(path));
            await eval(script)(baseURL, baseScriptURL, baseWebsiteScriptURL, branch);
        } catch (error) {
            if (wolfermusPreventLoopLock1 <= 0) return;
            wolfermusPreventLoopLock1--;
            await Sleep(50);
            await LoadScript(path);
        }
    }

    async function AttemptLoadScript() {
        const fetchedScripts = await GetScripts();

        // {
        //     const endTime = performance.now();
        //     console.info(`Wolfermus Main Menu Loaded - 1 - Took ${endTime - wolfermusMainMenuStartTime}ms`);
        // }

        for (let scriptURL of fetchedScripts) {
            await LoadScript(scriptURL).catch(async (error) => {
                debugger;
                console.error(`Wolfermus ERROR: Main - Failed To Load Scripts\n${error}`);
            });
        }

        // {
        //     const endTime = performance.now();
        //     console.info(`Wolfermus Main Menu Loaded - 2 - Took ${endTime - wolfermusMainMenuStartTime}ms`);
        // }
    }
    await AttemptLoadScript();

    await UpdateWolfermusMainMenuStyle();
    await UpdateMenuItems();

    if (wolfermusPreventLoopLock1 <= 0) {
        mainMenuModule["Loading"] = false;
        return;
    }

    const endTime = performance.now();

    console.info(`Wolfermus Main Menu Loaded - Took ${endTime - wolfermusMainMenuStartTime}ms`);

    mainMenuModule["Loaded"] = true;
    mainMenuModule["Loading"] = false;
})();