async (path, branch) => {
    //#region Setting Up ChosenXmlHttpRequest
    let IsGMXmlHttpRequest1 = false;
    // @ts-ignore
    if (typeof GM_xmlHttpRequest !== "undefined" && typeof GM_xmlHttpRequest !== "null" && GM_xmlHttpRequest) IsGMXmlHttpRequest1 = true;

    let IsGMXmlHttpRequest2 = false;
    // @ts-ignore
    if (typeof GM !== "undefined" && typeof GM.xmlHttpRequest !== "undefined") IsGMXmlHttpRequest2 = true;

    let IsGMXmlHttpRequest = false;
    if (IsGMXmlHttpRequest1 || IsGMXmlHttpRequest2) IsGMXmlHttpRequest = true;

    if (!IsGMXmlHttpRequest) {
        const message = "Wolfermus ERROR: Youtube QOL - Please run in a userscript manager";
        console.error(message);
        throw new Error(message);
    }

    let ChosenXmlHttpRequest;
    if (IsGMXmlHttpRequest2) {
        ChosenXmlHttpRequest = GM.xmlHttpRequest;
    } else if (IsGMXmlHttpRequest1) {
        ChosenXmlHttpRequest = GM_xmlHttpRequest;
    } else {
        const message = "Wolfermus ERROR: Youtube QOL - Unexpected Error";
        console.error(message);
        throw new Error(message);
    }
    if (ChosenXmlHttpRequest === undefined || ChosenXmlHttpRequest === null) {
        const message = "Wolfermus ERROR: Youtube QOL - Unexpected Error";
        console.error(message);
        throw new Error(message);
    }
    //#endregion -Setting Up ChosenXmlHttpRequest

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

    {
        let wolfermusAntiStuckLoop1 = 100;
        while (window === undefined || window === null) {
            await Sleep(100);

            if (wolfermusAntiStuckLoop1 < 0) {
                alert("ERROR: antiStuckLoop engaged");
                return;
            }
            wolfermusAntiStuckLoop1--;
        }
    }

    //#region Utilities
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
    //#endregion -Utilities

    {
        let wolfermusLoadLoopCounter = 0;
        while (!WolfermusCheckLibraryLoaded("StorageManager")) {
            await Sleep(100);

            if (wolfermusLoadLoopCounter >= 100) {
                alert("ERROR: antiStuckLoop engaged");
                return;
            }
            wolfermusLoadLoopCounter++;
        }
    }

    {
        let wolfermusLoadLoopCounter = 0;
        while (!WolfermusCheckLibraryLoaded("MainMenu")) {
            await Sleep(100);

            if (wolfermusLoadLoopCounter >= 100) {
                alert("ERROR: antiStuckLoop engaged");
                return;
            }
            wolfermusLoadLoopCounter++;
        }
    }

    console.log("Wolfermus: Youtube - QOL Running");

    const storageManagerLibrary = WolfermusGetLibrary("StorageManager");

    /**
     * @async
     * @type {(key: string, value: any) => void}
    */
    const SetValue = storageManagerLibrary["SetValue"];

    /**
     * @async
     * @type {(key: string, defaultValue: any) => Promise<any | undefined | null>}
    */
    const GetValue = storageManagerLibrary["GetValue"];


    const mainMenuLibrary = WolfermusGetLibrary("MainMenu");

    if (mainMenuLibrary["Classes"]["Addons"]?.["WolfermusGroupMenuItem"] === undefined) {
        let preventLoopLock = 10;
        const baseURL = `https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/${branch}`;
        async function LoadWolfermusGroupMenuItem() {
            try {
                const script = bypassScriptPolicyMainMenuMain.createScript(await MakeGetRequest(`${baseURL}/Libraries/MainMenu/Addons/Group.js`));
                await eval(script);
            } catch (error) {
                if (preventLoopLock <= 0) return;
                preventLoopLock--;
                await Sleep(100);
                await LoadWolfermusGroupMenuItem();
            }
        }
        await LoadWolfermusGroupMenuItem();
    }
    if (mainMenuLibrary["Classes"]["Addons"]?.["WolfermusGroupMenuItem"] === undefined) return;


    /**
     * @type {WolfermusToggleButtonMenuItem}
     */
    const WolfermusToggleButtonMenuItem = mainMenuLibrary["Classes"]["Addons"]["Buttons"]["WolfermusToggleButtonMenuItem"];

    /**
     * @type {WolfermusGroupMenuItem}
     */
    const WolfermusGroupMenuItem = mainMenuLibrary["Classes"]["Addons"]["WolfermusGroupMenuItem"];

    /**
     * @import {WolfermusMenu, WolfermusToggleButtonMenuItem} from "../../../Libraries/MainMenu/MainMenuLib.user.js"
     * @import {WolfermusGroupMenuItem} from "../../../Libraries/MainMenu/Addons/Group.js"
     */

    /**
     * Get Main Menu
     *  
     * @type {() => WolfermusMenu}
     */
    const GetMainMenu = mainMenuLibrary["Menus"]["GetMainMenu"];



    let wolfermusPreventLoopLock1 = {};
    async function LoadScriptOnce(scriptName) {
        if (!wolfermusPreventLoopLock1[scriptName]) {
            wolfermusPreventLoopLock1[scriptName] = {
                once: false,
                value: 10
            }
        }
        if (wolfermusPreventLoopLock1[scriptName].once) return;
        //console.log("Scripts/Main.js - 3");
        try {
            const script = bypassScriptPolicyMainMenuMain.createScript(await MakeGetRequest(`${path}/QOL/${scriptName}.js`));
            // TODO: Allow scripts to return an object detailing to only load script once, a menuitem.
            await eval(script)(baseScriptURL);
            wolfermusPreventLoopLock1[scriptName].once = true;
        } catch (error) {
            if (!wolfermusPreventLoopLock1[scriptName]) return;
            if (wolfermusPreventLoopLock1[scriptName].value <= 0) return;
            wolfermusPreventLoopLock1[scriptName].value--;
            await Sleep(100);
            await LoadScriptOnce(scriptName);
        }
    }


    const YoutubeGotten = await GetValue("Youtube", "{}");
    let YoutubeSettings = JSON.parse(YoutubeGotten);
    if (!YoutubeSettings || typeof YoutubeSettings !== "object") YoutubeSettings = {};

    if (!YoutubeSettings["QOL"]) YoutubeSettings["QOL"] = {};
    let QOLSettings = YoutubeSettings["QOL"];

    if (!QOLSettings["TimeRemaining"]) QOLSettings["TimeRemaining"] = {};
    let TimeRemainingSettings = QOLSettings["TimeRemaining"];

    TimeRemainingSettings.Active ??= false;

    SetValue("Youtube", JSON.stringify(YoutubeSettings));

    if (TimeRemainingSettings.Active) LoadScriptOnce("TimeRemaining");

    const QOLTimeRemainingMenuItem = new WolfermusToggleButtonMenuItem(`Toggle Time Remaining`);
    QOLTimeRemainingMenuItem.toggled = TimeRemainingSettings.Active;
    QOLTimeRemainingMenuItem.ToggledEventAddCallback(async (toggled) => {
        const YoutubeGottenInner = await GetValue("Youtube", "{}");
        let YoutubeSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!YoutubeSettingsInner || typeof YoutubeSettingsInner !== "object") YoutubeSettingsInner = {};

        if (!YoutubeSettingsInner["QOL"]) YoutubeSettingsInner["QOL"] = {};
        let QOLSettingsInner = YoutubeSettingsInner["QOL"];

        if (!QOLSettingsInner["TimeRemaining"]) QOLSettingsInner["TimeRemaining"] = {};
        let TimeRemainingSettingsInner = QOLSettingsInner["TimeRemaining"];

        TimeRemainingSettingsInner.Active = toggled;

        SetValue("Youtube", JSON.stringify(YoutubeSettingsInner));

        if (toggled) LoadScriptOnce("TimeRemaining");
    });

    QOLSettings.Collapsed ??= true;

    let QOLMenuItem = new WolfermusGroupMenuItem("Quality Of Life");
    QOLMenuItem.collapsed = QOLSettings.Collapsed;
    QOLMenuItem.CollapsedAddCallback(async (newCollapsed) => {
        const YoutubeGottenInner = await GetValue("Youtube", "{}");
        let YoutubeSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!YoutubeSettingsInner || typeof YoutubeSettingsInner !== "object") YoutubeSettingsInner = {};

        if (!YoutubeSettingsInner["QOL"]) YoutubeSettingsInner["QOL"] = {};
        let QOLSettingsInner = YoutubeSettingsInner["QOL"];

        QOLSettingsInner.Collapsed = newCollapsed;

        SetValue("Youtube", JSON.stringify(YoutubeSettingsInner));
    });
    QOLMenuItem.items.push(QOLTimeRemainingMenuItem);

    const mainMenu = GetMainMenu();

    mainMenu.items.push(QOLMenuItem);
};