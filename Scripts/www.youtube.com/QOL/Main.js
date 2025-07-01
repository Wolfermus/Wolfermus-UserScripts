async (baseURL, baseScriptURL, baseWebsiteScriptURL, branch) => {
    const startTime = performance.now();
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

    console.info("Wolfermus Scripts: Youtube - QOL Loading");

    const storageManagerLibrary = WolfermusGetLibrary("StorageManager");

    const removeVideoTypesModule = WolfermusGetModule("YouTubeQOLRemoveVideoTypes", true);

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
     * @async
     * @param {string} key
     * @param {(key: string, oldValue: any, newValue: any, remote: boolean) => void} callback
     * @type {(key: string, callback: ((key: string, oldValue: any, newValue: any, remote: boolean) => void)) => Promise<number>}
     * @returns {Promise<number>}
     */
    const AddValueChangeListener = storageManagerLibrary["AddValueChangeListener"];


    const mainMenuLibrary = WolfermusGetLibrary("MainMenu");

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

    const UtilitiesLibrary = WolfermusGetLibrary("Utilities");

    /**
     * @type {(string: string, rule: string) => boolean}
     * @param {string} string
     * @param {string} rule
     * @returns {boolean}
     */
    const MatchRuleExpl = UtilitiesLibrary["MatchRuleExpl"];

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
            const script = bypassScriptPolicyMainMenuMain.createScript(await MakeGetRequest(`${baseWebsiteScriptURL}QOL/${scriptName}.js`));
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

    const YoutubeGotten = await GetValue("YoutubeQOL", "{}");
    let QOLSettings = JSON.parse(YoutubeGotten);
    if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

    if (!QOLSettings["TimeRemaining"]) QOLSettings["TimeRemaining"] = {};
    let TimeRemainingSettings = QOLSettings["TimeRemaining"];

    if (!QOLSettings["RemoveVideoTypes"]) QOLSettings["RemoveVideoTypes"] = {};
    let RemoveVideoTypesSettings = QOLSettings["RemoveVideoTypes"];

    TimeRemainingSettings.Active ??= false;

    RemoveVideoTypesSettings.Active ??= false;
    RemoveVideoTypesSettings.WebsitesEnabled ??= {};
    RemoveVideoTypesSettings.WebsitesEnabled.Main ??= true;
    RemoveVideoTypesSettings.WebsitesEnabled.Subscriptions ??= true;
    RemoveVideoTypesSettings.WebsitesEnabled.Watch ??= true;
    RemoveVideoTypesSettings.WebsitesEnabled.Playlist ??= false;
    RemoveVideoTypesSettings.WebsitesEnabled.Channels ??= {};
    RemoveVideoTypesSettings.WebsitesEnabled.Channels.Home ??= false;
    RemoveVideoTypesSettings.WebsitesEnabled.Channels.Videos ??= false;
    RemoveVideoTypesSettings.Hide ??= {};
    RemoveVideoTypesSettings.Hide.YouWatch ??= false;
    RemoveVideoTypesSettings.Hide.Members ??= false;
    RemoveVideoTypesSettings.Hide.Live ??= false;
    RemoveVideoTypesSettings.Collapsed ??= false;

    QOLSettings.Collapsed ??= true;

    SetValue("YoutubeQOL", JSON.stringify(QOLSettings));

    if (TimeRemainingSettings.Active) LoadScriptOnce("TimeRemaining");

    const QOLTimeRemainingMenuItem = new WolfermusToggleButtonMenuItem(`Toggle Time Remaining`);
    QOLTimeRemainingMenuItem.toggled = TimeRemainingSettings.Active;
    QOLTimeRemainingMenuItem.ToggledEventAddCallback(async (toggled) => {
        if (QOLTimeRemainingMenuItem.disabled) return;

        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

        if (!QOLSettingsInner["TimeRemaining"]) QOLSettingsInner["TimeRemaining"] = {};
        let TimeRemainingSettingsInner = QOLSettingsInner["TimeRemaining"];

        if (TimeRemainingSettingsInner.Active === toggled) return;

        TimeRemainingSettingsInner.Active = toggled;

        SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));

        if (toggled) LoadScriptOnce("TimeRemaining");
    });

    const RemoveVideoTypesUrlsInclude = {
        Main: ["*www.youtube.com", "*www.youtube.com/"],
        Subscriptions: ["*www.youtube.com/feed/subscriptions", "*www.youtube.com/feed/subscriptions/"],
        Watch: ["*www.youtube.com/watch*"],
        Playlist: ["*www.youtube.com/playlist*"],
        Channels: {
            Home: ["*www.youtube.com/@*", "*www.youtube.com/@*/featured"],
            Videos: ["*www.youtube.com/@*/videos"]
        }
    };
    const RemoveVideoTypesUrlsExcludes = {
        Main: [],
        Subscriptions: [],
        Watch: [],
        Playlist: [],
        Channels: {
            Home: ["*www.youtube.com/@*/shorts", "*www.youtube.com/@*/streams", "*www.youtube.com/@*/playlists", "*www.youtube.com/@*/posts"],
            Videos: []
        }
    };

    /**
     * @returns {Array<string>}
     */
    function FlattenRemoveVideoTypesUrlsIncludes() {
        debugger;

        let falttenedUrls = [];
        for (const urlKey in RemoveVideoTypesUrlsInclude) {
            if (Array.isArray(RemoveVideoTypesUrlsInclude[urlKey])) {
                falttenedUrls.push(...RemoveVideoTypesUrlsInclude[urlKey]);
            } else {
                for (const urlKey2 in RemoveVideoTypesUrlsInclude[urlKey]) {
                    falttenedUrls.push(...RemoveVideoTypesUrlsInclude[urlKey][urlKey2]);
                }
            }
        }
        return falttenedUrls;
    }
    /**
     * @returns {Array<string>}
     */
    function FlattenRemoveVideoTypesUrlsExcludes() {
        debugger;

        let falttenedUrls = [];
        for (const urlKey in RemoveVideoTypesUrlsExcludes) {
            if (Array.isArray(RemoveVideoTypesUrlsExcludes[urlKey])) {
                falttenedUrls.push(...RemoveVideoTypesUrlsExcludes[urlKey]);
            } else {
                for (const urlKey2 in RemoveVideoTypesUrlsExcludes[urlKey]) {
                    falttenedUrls.push(...RemoveVideoTypesUrlsExcludes[urlKey][urlKey2]);
                }
            }
        }
        return falttenedUrls;
    }

    /**
     * @param {Object} json
     * @returns {Array<string>}
     */
    function GetCurrentWebsitesEnabled(json) {
        debugger;

        if (!json["RemoveVideoTypes"]) json["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettings = json["RemoveVideoTypes"];

        RemoveVideoTypesSettings.WebsitesEnabled ??= {};
        RemoveVideoTypesSettings.WebsitesEnabled.Main ??= true; // "*www.youtube.*"
        RemoveVideoTypesSettings.WebsitesEnabled.Subscriptions ??= true; // "*www.youtube.*/feed/subscriptions", "*www.youtube.*/feed/subscriptions/"
        RemoveVideoTypesSettings.WebsitesEnabled.Watch ??= true; // "*www.youtube.*/watch*"
        RemoveVideoTypesSettings.WebsitesEnabled.Playlist ??= false; // "*www.youtube.com/playlist*"
        RemoveVideoTypesSettings.WebsitesEnabled.Channels ??= {};
        RemoveVideoTypesSettings.WebsitesEnabled.Channels.Home ??= false; // "*www.youtube.com/@*", "*www.youtube.com/@*/featured"
        RemoveVideoTypesSettings.WebsitesEnabled.Channels.Videos ??= false; // "*www.youtube.com/@*/videos"

        for (const urlKey in RemoveVideoTypesUrlsInclude) {
            if (Array.isArray(RemoveVideoTypesUrlsInclude[urlKey])) {
                let includesBool = false;
                for (const urlRule of RemoveVideoTypesUrlsInclude[urlKey]) {
                    if (MatchRuleExpl(window.location.href, urlRule)) {
                        includesBool = true;
                        break;
                    }
                }

                let excludesBool = false;
                for (const urlRule of RemoveVideoTypesUrlsExcludes[urlKey]) {
                    if (MatchRuleExpl(window.location.href, urlRule)) {
                        excludesBool = true;
                        break;
                    }
                }

                if (includesBool && !excludesBool) {
                    return [urlKey];
                }
            } else {
                const objKeys = Object.keys(RemoveVideoTypesUrlsInclude[urlKey]);
                for (let i = objKeys.length - 1; i >= 0; i--) {
                    const urlKey2 = objKeys[i];

                    let includesBool = false;
                    for (const urlRule of RemoveVideoTypesUrlsInclude[urlKey][urlKey2]) {
                        if (MatchRuleExpl(window.location.href, urlRule)) {
                            includesBool = true;
                            break;
                        }
                    }

                    let excludesBool = false;
                    for (const urlRule of RemoveVideoTypesUrlsExcludes[urlKey][urlKey2]) {
                        if (MatchRuleExpl(window.location.href, urlRule)) {
                            excludesBool = true;
                            break;
                        }
                    }

                    if (includesBool && !excludesBool) {
                        return [urlKey, urlKey2];
                    }
                }
            }
        }

        return [];
    }

    /**
     * @param {Object} json
     * @returns {boolean}
     */
    function IsCurrentWebsitesEnabled(json) {
        if (!json["RemoveVideoTypes"]) json["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettings = json["RemoveVideoTypes"];

        debugger;
        const keysArray = GetCurrentWebsitesEnabled(json);

        if (keysArray.length > 0) {
            let referenceBool = RemoveVideoTypesSettings.WebsitesEnabled;
            for (const key of keysArray) {
                referenceBool = referenceBool[key];
            }

            if (referenceBool) {
                return true;
            } else {
                return false;
            }
        }

        return false;
    }

    /**
     * @param {Object} json
     */
    function ShouldDisable(json) {
        if (IsCurrentWebsitesEnabled(json)) {
            removeVideoTypesModule.disabled = false;
        } else {
            removeVideoTypesModule.disabled = true;
        }
    }

    const QOLRemoveVideoTypesMenuItem = new WolfermusToggleButtonMenuItem(`Toggle Remove Video Type`);
    QOLRemoveVideoTypesMenuItem.toggled = RemoveVideoTypesSettings.Active;
    QOLRemoveVideoTypesMenuItem.ToggledEventAddCallback(async (toggled) => {
        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

        if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettingsInner = QOLSettingsInner["RemoveVideoTypes"];

        if (RemoveVideoTypesSettingsInner.Active === toggled) return;

        RemoveVideoTypesSettingsInner.Active = toggled;

        SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));

        if (toggled) LoadScriptOnce("RemoveVideoTypes");
    });

    const QOLRemoveVideoTypesTogglePageMenuItem = new WolfermusToggleButtonMenuItem(`Toggle Page`);
    QOLRemoveVideoTypesTogglePageMenuItem.toggled = IsCurrentWebsitesEnabled(QOLSettings);
    QOLRemoveVideoTypesTogglePageMenuItem.ToggledEventAddCallback(async (toggled) => {
        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

        if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettingsInner = QOLSettingsInner["RemoveVideoTypes"];

        debugger;
        const keysArray = GetCurrentWebsitesEnabled(QOLSettingsInner);

        if (keysArray.length > 0) {
            let referenceBool = RemoveVideoTypesSettingsInner.WebsitesEnabled;
            for (const key of keysArray) {
                if (typeof referenceBool[key] == "boolean") {
                    referenceBool[key] = toggled;
                } else referenceBool = referenceBool[key];
            }

            SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));
        } else {
            debugger;
        }
    });

    const QOLRemoveVideoTypesHideYouWatchMenuItem = new WolfermusToggleButtonMenuItem(`Toggle Hide YouWatch`);
    QOLRemoveVideoTypesHideYouWatchMenuItem.toggled = RemoveVideoTypesSettings.Hide.YouWatch;
    QOLRemoveVideoTypesHideYouWatchMenuItem.ToggledEventAddCallback(async (toggled) => {
        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

        if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettingsInner = QOLSettingsInner["RemoveVideoTypes"];

        if (RemoveVideoTypesSettingsInner.Hide.YouWatch === toggled) return;

        RemoveVideoTypesSettingsInner.Hide.YouWatch = toggled;

        SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));
    });

    const QOLRemoveVideoTypesHideMembersMenuItem = new WolfermusToggleButtonMenuItem(`Toggle Hide Members`);
    QOLRemoveVideoTypesHideMembersMenuItem.toggled = RemoveVideoTypesSettings.Hide.Members;
    QOLRemoveVideoTypesHideMembersMenuItem.ToggledEventAddCallback(async (toggled) => {
        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

        if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettingsInner = QOLSettingsInner["RemoveVideoTypes"];

        if (RemoveVideoTypesSettingsInner.Hide.Members === toggled) return;

        RemoveVideoTypesSettingsInner.Hide.Members = toggled;

        SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));
    });

    const QOLRemoveVideoTypesHideLiveMenuItem = new WolfermusToggleButtonMenuItem(`Toggle Hide Live`);
    QOLRemoveVideoTypesHideLiveMenuItem.toggled = RemoveVideoTypesSettings.Hide.Live;
    QOLRemoveVideoTypesHideLiveMenuItem.ToggledEventAddCallback(async (toggled) => {
        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

        if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettingsInner = QOLSettingsInner["RemoveVideoTypes"];

        if (RemoveVideoTypesSettingsInner.Hide.Live === toggled) return;

        RemoveVideoTypesSettingsInner.Hide.Live = toggled;

        SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));
    });


    const QOLRemoveVideoTypesGroupMenuItem = new WolfermusGroupMenuItem(`Remove Video Type`);
    QOLRemoveVideoTypesGroupMenuItem.collapsed = RemoveVideoTypesSettings.Collapsed;
    QOLRemoveVideoTypesGroupMenuItem.CollapsedAddCallback(async (newCollapsed) => {
        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

        if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettingsInner = QOLSettingsInner["RemoveVideoTypes"];

        RemoveVideoTypesSettingsInner.Collapsed = newCollapsed;

        SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));
    });
    QOLRemoveVideoTypesGroupMenuItem.items.push(QOLRemoveVideoTypesMenuItem);
    QOLRemoveVideoTypesGroupMenuItem.items.push(QOLRemoveVideoTypesTogglePageMenuItem);
    QOLRemoveVideoTypesGroupMenuItem.items.push(QOLRemoveVideoTypesHideYouWatchMenuItem);
    QOLRemoveVideoTypesGroupMenuItem.items.push(QOLRemoveVideoTypesHideMembersMenuItem);
    QOLRemoveVideoTypesGroupMenuItem.items.push(QOLRemoveVideoTypesHideLiveMenuItem);

    QOLRemoveVideoTypesGroupMenuItem.includesUrls = FlattenRemoveVideoTypesUrlsIncludes();
    QOLRemoveVideoTypesGroupMenuItem.excludesUrls = FlattenRemoveVideoTypesUrlsExcludes();

    QOLRemoveVideoTypesGroupMenuItem.CheckUrls();

    removeVideoTypesModule.disabled = QOLRemoveVideoTypesGroupMenuItem.disabled;
    removeVideoTypesModule.disabledDone0 = false;
    removeVideoTypesModule.disabledDone1 = false;
    removeVideoTypesModule.disabledDone2 = false;


    if (RemoveVideoTypesSettings.Active && !QOLRemoveVideoTypesGroupMenuItem.disabled) {
        ShouldDisable(QOLSettings);
        LoadScriptOnce("RemoveVideoTypes");
    }

    QOLRemoveVideoTypesGroupMenuItem.DisabledEventAddCallback(async (disabled) => {
        removeVideoTypesModule.disabled = disabled;
        removeVideoTypesModule.disabledDone0 = false;
        removeVideoTypesModule.disabledDone1 = false;
        removeVideoTypesModule.disabledDone2 = false;

        if (!disabled) {
            const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
            let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
            if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

            if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};
            let RemoveVideoTypesSettingsInner = QOLSettingsInner["RemoveVideoTypes"];

            if (RemoveVideoTypesSettingsInner.Active) {
                ShouldDisable(QOLSettingsInner);
                LoadScriptOnce("RemoveVideoTypes");
            }
        }
    });


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
    QOLMenuItem.items.push(QOLRemoveVideoTypesGroupMenuItem);


    await AddValueChangeListener("YoutubeQOL", (key, oldValue, newValue, remote) => {
        let QOLSettings = JSON.parse(newValue);
        if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

        if (!QOLSettings["TimeRemaining"]) QOLSettings["TimeRemaining"] = {};
        let TimeRemainingSettings = QOLSettings["TimeRemaining"];

        if (!QOLSettings["RemoveVideoTypes"]) QOLSettings["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettings = QOLSettings["RemoveVideoTypes"];

        TimeRemainingSettings.Active ??= false;

        RemoveVideoTypesSettings.Active ??= false;
        RemoveVideoTypesSettings.Collapsed ??= false;

        if (RemoveVideoTypesSettings.Active && !QOLRemoveVideoTypesGroupMenuItem.disabled) {
            ShouldDisable(QOLSettings);
        }

        QOLSettings.Collapsed ??= true;

        QOLMenuItem.collapsed = QOLSettings.Collapsed;

        QOLRemoveVideoTypesGroupMenuItem.collapsed = RemoveVideoTypesSettings.Collapsed;
        QOLRemoveVideoTypesMenuItem.toggled = RemoveVideoTypesSettings.Active;

        QOLTimeRemainingMenuItem.toggled = TimeRemainingSettings.Active;
    });

    let oldHref = document.location.href;
    const observeUrlChange = async () => {
        if (oldHref === document.location.href) return;
        oldHref = document.location.href;

        debugger;

        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        let QOLSettings = JSON.parse(YoutubeGottenInner);
        if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

        if (!QOLSettings["RemoveVideoTypes"]) QOLSettings["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettings = QOLSettings["RemoveVideoTypes"];

        RemoveVideoTypesSettings.Active ??= false;

        QOLRemoveVideoTypesTogglePageMenuItem.toggled = IsCurrentWebsitesEnabled(QOLSettings);

        if (RemoveVideoTypesSettings.Active && !QOLRemoveVideoTypesGroupMenuItem.disabled) {
            ShouldDisable(QOLSettings);
        }
    };

    window.addEventListener("yt-navigate-finish", observeUrlChange);


    const mainMenu = GetMainMenu();

    mainMenu.items.push(QOLMenuItem);

    const endTime = performance.now();
    console.info(`Wolfermus Scripts: Youtube - QOL Loaded - Took ${endTime - startTime}ms`);
};