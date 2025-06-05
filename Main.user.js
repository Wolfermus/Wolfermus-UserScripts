// ==UserScript==
// @name         Wolfermus Main Menu
// @namespace    https://greasyfork.org/en/users/900467-feb199
// @version      1.0.22
// @description  This script is a main menu that loads displays all scripts and allows you to enable them.
// @author       Feb199/Dannysmoka
// @homepageURL  https://github.com/Wolfermus/Wolfermus-UserScripts
// @supportURL   https://github.com/Wolfermus/Wolfermus-UserScripts/issues
// @updateURL    https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/main/Main.user.js
// @license      GPLv3
// @match        *
// @match        *://*/*
// @match        http://*/*
// @match        https://*/*
// @require      https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/main/Libraries/StorageManagerLib.user.js
// @require      https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/main/Libraries/MainMenuLib.user.js
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

(async () => {
    /**
     * @param {number | undefined} ms
     */
    function Sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        });
    }

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

    if (WolfermusCheckModuleLoaded("MainMenu")) return;
    if (!mainWindow["Wolfermus"]["MainMenu"]) mainWindow["Wolfermus"]["MainMenu"] = {};

    while (mainWindow["Wolfermus"]["MainMenu"]["Loading"] === true) {
        await Sleep(500);
    }

    if (WolfermusCheckModuleLoaded("MainMenu")) return;

    mainWindow["Wolfermus"]["MainMenu"]["Loaded"] = false;
    mainWindow["Wolfermus"]["MainMenu"]["Loading"] = true;

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

    /**
     * Update Main Menu Items
     * @async
     * @type {() => Promise<void>}
     */
    const UpdateMenuItems = mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["UpdateMenuItems"];

    /**
     * Updates the Main Menu Style
     * @async
     * @type {() => Promise<void>}
     */
    const UpdateWolfermusMainMenuStyle = mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["UpdateWolfermusMainMenuStyle"];

    // async function LoadScript() {
    //     MakeGetRequest(`https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/main/Scripts/Main.js`).then((result) => {
    //         const script = bypassScriptPolicy.createScript(result);
    //         return eval(script)().then(() => {
    //             resolve();
    //         }).catch(() => {
    //             Sleep(200);
    //             return LoadScript();
    //         });
    //     })
    // }

    const bypassScriptPolicyMainMenuMain = trustedTypes.createPolicy("bypassScriptMainMenuMain", {
        createScript: (string) => string,
        createScriptURL: (string) => string
    });

    async function LoadScript() {
        //console.log("Scripts/Main.js - 3");
        const script = bypassScriptPolicyMainMenuMain.createScript(await MakeGetRequest(`https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/main/Scripts/Main.js`));
        return eval(script)();
    }

    await Sleep(1000);

    let wolfermusPreventLoopLock1 = 10;

    async function AttemptLoadScript() {
        //console.log("Scripts/Main.js - 2");
        await LoadScript().then(async () => {
            //console.log("Scripts/Main.js - 4");
            await UpdateWolfermusMainMenuStyle();
            await UpdateMenuItems();
        }).catch(async (error) => {
            if (wolfermusPreventLoopLock1 <= 0) return;
            wolfermusPreventLoopLock1--;
            await Sleep(500);
            await AttemptLoadScript();
        });
    }
    //console.log("Scripts/Main.js - 1");
    await AttemptLoadScript();

    if (wolfermusPreventLoopLock1 <= 0) {
        mainWindow["Wolfermus"]["MainMenu"]["Loading"] = false;
        return;
    }

    //console.log("Scripts/Main.js - 5");

    console.log("Wolfermus Loaded Scripts/Main.js");

    mainWindow["Wolfermus"]["MainMenu"]["Loaded"] = true;
    mainWindow["Wolfermus"]["MainMenu"]["Loading"] = false;
})();
