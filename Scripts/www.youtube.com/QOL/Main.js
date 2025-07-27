async (baseURL, baseScriptURL, baseWebsiteScriptURL, branch) => {
    const startTime = performance.now();

    debugger;

    /**
     * @param {number | undefined} ms
     */
    function Sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        });
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

    async function WolfermusWaitForLibrary(key) {
        let wolfermusLoadLoopCounter = 0;
        while (!WolfermusCheckLibraryLoaded(key)) {
            await Sleep(100);

            if (wolfermusLoadLoopCounter >= 100) {
                alert(`ERROR - antiStuckLoop: ${key}`);
                return false;
            }
            wolfermusLoadLoopCounter++;
        }

        return true;
    }
    //#endregion -Utilities

    if (!(await WolfermusWaitForLibrary("StorageManager"))) return false;
    if (!(await WolfermusWaitForLibrary("MainMenu"))) return false;
    if (!(await WolfermusWaitForLibrary("Utilities"))) return false;

    console.info("Wolfermus Scripts: Youtube - QOL Loading");

    let utilitiesLibrary = WolfermusGetLibrary("Utilities");
    if (!utilitiesLibrary) return false;

    const MakeGetRequest = utilitiesLibrary["MakeGetRequest"];

    const storageManagerLibrary = WolfermusGetLibrary("StorageManager");
    if (!storageManagerLibrary) return false;

    /**
     * @async
     * @type {(key: string, value: any, forceLocal: boolean) => void}
    */
    const SetValue = storageManagerLibrary["SetValue"];

    /**
     * @async
     * @type {(key: string, defaultValue: any, forceLocal: boolean) => Promise<any | undefined | null>}
    */
    const GetValue = storageManagerLibrary["GetValue"];

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
     * - A boolean to use local storage
     * @async
     * @param {string} key
     * @param {(key: string, oldValue: any, newValue: any, remote: boolean) => void} callback
     * @type {(key: string, callback: ((key: string, oldValue: any, newValue: any, remote: boolean) => void)) => Promise<number>}
     * @returns {Promise<number>}
     */
    const AddValueChangeListener = storageManagerLibrary["AddValueChangeListener"];

    const mainMenuLibrary = WolfermusGetLibrary("MainMenu");
    if (!mainMenuLibrary) return false;

    if (mainMenuLibrary["Classes"]["Addons"]?.["WolfermusGroupMenuItem"] === undefined) {
        let preventLoopLock = 20;
        async function LoadWolfermusGroupMenuItem() {
            try {
                const script = bypassScriptPolicyMainMenuMain.createScript(await MakeGetRequest(`${baseURL}Libraries/MainMenu/Addons/Group.js`));
                await eval(script);
            } catch (error) {
                if (preventLoopLock <= 0) return;
                preventLoopLock--;
                await Sleep(50);
                await LoadWolfermusGroupMenuItem();
            }
        }
        await LoadWolfermusGroupMenuItem();
    }
    if (mainMenuLibrary["Classes"]["Addons"]?.["WolfermusGroupMenuItem"] === undefined) return false;

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
        if (wolfermusPreventLoopLock1[scriptName].once) return undefined;
        //console.log("Scripts/Main.js - 3");
        try {
            const script = bypassScriptPolicyMainMenuMain.createScript(await MakeGetRequest(`${baseWebsiteScriptURL}QOL/${scriptName}.js`));
            await eval(script);
            if (typeof EntryRun !== "function") return undefined;
            const result = EntryRun(baseURL, baseScriptURL, baseWebsiteScriptURL, branch);
            if (!result) return undefined;
            wolfermusPreventLoopLock1[scriptName].once = true;
            return result;
        } catch (error) {
            if (!wolfermusPreventLoopLock1[scriptName]) return undefined;
            if (wolfermusPreventLoopLock1[scriptName].value <= 0) return undefined;
            wolfermusPreventLoopLock1[scriptName].value--;
            await Sleep(100);
            await LoadScriptOnce(scriptName);
        }
    }

    const YoutubeGotten = await GetValue("YoutubeQOL", "{}");
    let QOLSettings = JSON.parse(YoutubeGotten);
    if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

    if (!QOLSettings["TimeRemaining"]) QOLSettings["TimeRemaining"] = {};
    let TimeRemainingSettings = QOLSettings["TimeRemaining"];

    TimeRemainingSettings.Active ??= false;

    QOLSettings.Collapsed ??= true;

    SetValue("YoutubeQOL", JSON.stringify(QOLSettings));

    if (TimeRemainingSettings.Active) LoadScriptOnce("TimeRemaining.user");


    let QOLMenuItem = new WolfermusGroupMenuItem("Quality Of Life");
    QOLMenuItem.collapsed = QOLSettings.Collapsed;
    QOLMenuItem.CollapsedAddCallback(async (newCollapsed) => {
        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

        QOLSettingsInner.Collapsed = newCollapsed;

        SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));
    });
    QOLMenuItem.items.push(QOLTimeRemainingMenuItem);


    const gottenMenuItem = await LoadScriptOnce("RemoveVideoTypesMenuItems.user");
    if (gottenMenuItem) QOLMenuItem.items.push(gottenMenuItem);
    else {
        debugger;
        const message = "Wolfermus ERROR: Youtube QOL - RemoveVideoTypesMenuItems.user - EntryRun - invalid type";
        console.error(message);
    }

    function ValueChangedCallback(key, oldValue, newValue, remote) {
        let QOLSettings = JSON.parse(newValue);
        if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

        if (!QOLSettings["TimeRemaining"]) QOLSettings["TimeRemaining"] = {};
        let TimeRemainingSettings = QOLSettings["TimeRemaining"];

        TimeRemainingSettings.Active ??= false;

        QOLSettings.Collapsed ??= true;
        QOLMenuItem.collapsed = QOLSettings.Collapsed;

        QOLTimeRemainingMenuItem.toggled = TimeRemainingSettings.Active;
    }

    await AddValueChangeListener("YoutubeQOL", ValueChangedCallback);

    let oldHref = document.location.href;
    const observeUrlChange = async () => {
        if (oldHref === document.location.href) return;
        oldHref = document.location.href;

        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        ValueChangedCallback("YoutubeQOL", undefined, YoutubeGottenInner, false);
    };

    window.addEventListener("yt-navigate-finish", observeUrlChange);


    const mainMenu = GetMainMenu();

    mainMenu.items.push(QOLMenuItem);

    const endTime = performance.now();
    console.info(`Wolfermus Scripts: Youtube - QOL Loaded - Took ${endTime - startTime}ms`);

    return true;
};