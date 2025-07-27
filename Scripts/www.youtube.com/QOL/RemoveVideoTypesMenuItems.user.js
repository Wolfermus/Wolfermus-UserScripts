// TODO: In the userscipt section require group.js

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

let MakeGetRequest = undefined;
/**
 * @type {(string: string, rule: string) => boolean}
 * @param {string} string
 * @param {string} rule
 * @returns {boolean}
 */
let MatchRuleExpl = undefined;

/**
 * @async
 * @type {(key: string, value: any, forceLocal: boolean) => void}
*/
let SetValue = undefined;
/**
 * @async
 * @type {(key: string, defaultValue: any, forceLocal: boolean) => Promise<any | undefined | null>}
*/
let GetValue = undefined;

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
let AddValueChangeListener = undefined;

/**
 * @import {WolfermusMenu, WolfermusToggleButtonMenuItem} from "../../../Libraries/MainMenu/MainMenuLib.user.js"
 * @import {WolfermusGroupMenuItem} from "../../../Libraries/MainMenu/Addons/Group.js"
 */

/**
 * @type {WolfermusToggleButtonMenuItem}
 */
let WolfermusToggleButtonMenuItem = undefined;
/**
 * @type {WolfermusGroupMenuItem}
 */
let WolfermusGroupMenuItem = undefined;

/**
 * Get Main Menu
 *  
 * @type {() => WolfermusMenu}
 */
let GetMainMenu = undefined;

async function SetupUtilities(baseURL, baseScriptURL, baseWebsiteScriptURL, branch) {
    if (!(await WolfermusWaitForLibrary("StorageManager"))) return false;
    if (!(await WolfermusWaitForLibrary("MainMenu"))) return false;
    if (!(await WolfermusWaitForLibrary("Utilities"))) return false;

    let UtilitiesLibrary = WolfermusGetLibrary("Utilities");
    if (!UtilitiesLibrary) return false;

    MakeGetRequest = UtilitiesLibrary["MakeGetRequest"];
    MatchRuleExpl = UtilitiesLibrary["MatchRuleExpl"];

    const storageManagerLibrary = WolfermusGetLibrary("StorageManager");

    SetValue = storageManagerLibrary["SetValue"];
    GetValue = storageManagerLibrary["GetValue"];
    AddValueChangeListener = storageManagerLibrary["AddValueChangeListener"];

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

    WolfermusToggleButtonMenuItem = mainMenuLibrary["Classes"]["Addons"]["Buttons"]["WolfermusToggleButtonMenuItem"];
    WolfermusGroupMenuItem = mainMenuLibrary["Classes"]["Addons"]["WolfermusGroupMenuItem"];

    GetMainMenu = mainMenuLibrary["Menus"]["GetMainMenu"];

    return true;
}

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
        const script = bypassScriptPolicyMainMenuMain.createScript(await MakeGetRequest(`${baseWebsiteScriptURL}QOL/${scriptName}.user.js`));
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

const wolfermusVideoTypesSettings = {
    "WolfermusShortsShelf": {
        hide: true,
        background: "red",
        debug: false
    },
    "WolfermusShortVideo": {
        hide: true,
        background: "darkred",
        debug: false
    },
    "WolfermusPlayablesShelf": {
        hide: true,
        background: "blue",
        debug: false
    },
    "WolfermusPlayablesVideo": {
        hide: true,
        background: "darkblue",
        debug: false
    },
    "WolfermusWatchedVideo": {
        hide: true,
        background: "green",
        debug: false
    },
    "WolfermusLiveVideo": {
        hide: true,
        background: "purple",
        debug: false
    },
    "WolfermusStreamedVideo": {
        hide: true,
        background: "pink",
        debug: false
    },
    "WolfermusMembersFirstVideo": {
        hide: true,
        background: "cyan",
        debug: false
    },
    "WolfermusMembersOnlyVideo": {
        hide: true,
        background: "yellow",
        debug: false
    },
    "WolfermusScheduledVideo": {
        hide: true,
        background: "orange",
        debug: false
    },
    "WolfermusPostsShelf": {
        hide: true,
        background: "lavender",
        debug: true
    },
    "WolfermusPostItem": {
        hide: true,
        background: "lavenderblush !important",
        debug: true
    },
    "WolfermusSelfOther": {
        hide: false,
        background: "darkgray",
        debug: false
    },
    "WolfermusOther": {
        hide: true,
        background: "gray",
        debug: false
    }
};

/**
 * @param {object} objectBase 
 * @param {string} name 
 * @param {boolean} [defaultActive=true] 
 */
function ValidateWebsiteEnabledSetting(objectBase, name, defaultActive = true) {
    if (typeof objectBase[name] !== "object") objectBase[name] = {};

    objectBase[name].Active ??= defaultActive;

    if (typeof objectBase[name].Hide !== "object") objectBase[name].Hide = {};
    if (typeof objectBase[name].Background !== "object") objectBase[name].Background = {};
    if (typeof objectBase[name].Debug !== "object") objectBase[name].Debug = {};

    for (const key in wolfermusVideoTypesSettings) {
        const settingsObject = wolfermusVideoTypesSettings[key];
        if (!settingsObject) continue;
        if (typeof settingsObject !== "object") continue;

        let keyCopy = key.replace("Wolfermus", "");
        if (!keyCopy) continue;

        objectBase[name].Hide[keyCopy] ??= settingsObject.hide;
        objectBase[name].Background[keyCopy] ??= settingsObject.background;
        objectBase[name].Debug[keyCopy] ??= settingsObject.debug;
    }
}

const RemoveVideoTypesUrlsInclude = {
    Main: ["*www.youtube.com", "*www.youtube.com/"],
    Subscriptions: ["*www.youtube.com/feed/subscriptions", "*www.youtube.com/feed/subscriptions/"],
    Watch: ["*www.youtube.com/watch*"],
    Playlist: ["*www.youtube.com/playlist*"],
    Results: ["*www.youtube.com/results*"],
    Channels: {
        Home: ["*www.youtube.com/@*", "*www.youtube.com/@*/featured", "*www.youtube.com/channel/*", "*www.youtube.com/channel/*/featured"],
        Videos: ["*www.youtube.com/@*/videos", "*www.youtube.com/channel/*/videos"],
        Search: ["*www.youtube.com/@*/search*", "*www.youtube.com/channel/*/search*"]
    }
};
const RemoveVideoTypesUrlsExcludes = {
    Main: [],
    Subscriptions: [],
    Watch: [],
    Playlist: [],
    Results: [],
    Channels: {
        Home: [
            "*www.youtube.com/@*/shorts", "*www.youtube.com/@*/streams", "*www.youtube.com/@*/playlists", "*www.youtube.com/@*/posts",
            "*www.youtube.com/channel/*/shorts", "*www.youtube.com/channel/*/streams", "*www.youtube.com/channel/*/playlists", "*www.youtube.com/channel/*/posts"
        ],
        Videos: [],
        Search: []
    }
};

/**
 * @returns {Array<string>}
 */
function FlattenRemoveVideoTypesUrlsIncludes() {
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
 * @returns {Array<string>}
 */
function GetCurrentWebsitesEnabled() {
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
 * @returns {Object | undefined}
 */
function GetCurrentWebsitesObject(json) {
    const keysArray = GetCurrentWebsitesEnabled();

    if (keysArray.length <= 0) {
        return undefined;
    }

    if (!json["RemoveVideoTypes"]) json["RemoveVideoTypes"] = {};
    let RemoveVideoTypesSettings = json["RemoveVideoTypes"];

    let referenceObject = RemoveVideoTypesSettings.WebsitesEnabled;
    for (const key of keysArray) {
        if (typeof referenceObject[key] !== "object") {
            referenceObject[key] = {};
        }
        referenceObject = referenceObject[key];
    }

    return referenceObject;
}

/**
 * @param {Object} json
 * @returns {boolean}
 */
function IsCurrentWebsitesEnabled(json) {
    const currentWebsitesObject = GetCurrentWebsitesObject(json);
    if (currentWebsitesObject === undefined) return false;

    if (currentWebsitesObject.Active) {
        return true;
    } else {
        return false;
    }
}

function GetLocalSettings(json) {
    if (!json || typeof json !== "object") json = {};

    if (!json["RemoveVideoTypes"]) json["RemoveVideoTypes"] = {};
    return json["RemoveVideoTypes"];
}

/**
 * @param { object } json
 * @param { object } json2
 * @returns { boolean }
 */
function ShouldDisable(json, json2) {
    const currentWebsitesObject = GetCurrentWebsitesObject(json);
    if (typeof json2 !== "object") {
        throw new Error(`Wolfermus ERROR: RemoveVideoTypesMenuItems - json2 is invalid`);
        return true;
    }
    const localSettings = GetLocalSettings(json2);

    let shouldSave = false;
    if (currentWebsitesObject !== undefined && currentWebsitesObject.Active) {
        let shouldEnable = false;
        const keysArray = GetCurrentWebsitesEnabled();
        if (keysArray.length === 1) {
            if (keysArray[0] === "Playlist") {
                if (currentWebsitesObject?.IdsToHide) {
                    let params = new URL(document.location.toString()).searchParams;
                    if (params.has("list")) {
                        shouldEnable = currentWebsitesObject.IdsToHide.includes(params.get("list"));
                    }
                }
            }
        }
        if (localSettings.Disabled !== shouldEnable) shouldSave = true;
        localSettings.Disabled = shouldEnable;
    } else {
        if (localSettings.Disabled !== true) shouldSave = true;
        localSettings.Disabled = true;
    }

    if (shouldSave) SetValue("LocalYoutubeQOL", JSON.stringify(json2), true);

    return localSettings.Disabled;
}

async function ValueChangedCallback(key, oldValue, newValue, remote) {
    let QOLSettings = JSON.parse(newValue);
    if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

    if (!QOLSettings["RemoveVideoTypes"]) QOLSettings["RemoveVideoTypes"] = {};
    let RemoveVideoTypesSettings = QOLSettings["RemoveVideoTypes"];

    RemoveVideoTypesSettings.Active ??= false;
    RemoveVideoTypesSettings.Collapsed ??= false;

    const currentWebsitesObject = GetCurrentWebsitesObject(QOLSettings);

    const keysArray = GetCurrentWebsitesEnabled();
    if (keysArray.length === 1) {
        if (keysArray[0] === "Playlist") {
            QOLRemoveVideoTypesPlaylistMenuItem.disabled = false;
            if (currentWebsitesObject === undefined) return;
            if (currentWebsitesObject?.IdsToHide) {
                let params = new URL(document.location.toString()).searchParams;
                if (params.has("list")) {
                    QOLRemoveVideoTypesPlaylistMenuItem.toggled = !currentWebsitesObject.IdsToHide.includes(params.get("list"));
                }
            }
        }
        else QOLRemoveVideoTypesPlaylistMenuItem.disabled = true;
    } else QOLRemoveVideoTypesPlaylistMenuItem.disabled = true;

    if (keysArray.length > 0) {
        QOLRemoveVideoTypesPageTypeGroupMenuItem.title = keysArray.join(" - ");
        QOLRemoveVideoTypesPageTypeGroupMenuItem.disabled = false;
    } else QOLRemoveVideoTypesPageTypeGroupMenuItem.disabled = true;

    if (currentWebsitesObject === undefined) return;

    QOLRemoveVideoTypesTogglePageMenuItem.toggled = currentWebsitesObject.Active;

    let shouldSave = false;
    for (const key in wolfermusVideoTypesSettings) {
        const settingsObject = wolfermusVideoTypesSettings[key];
        if (!settingsObject) continue;
        if (typeof settingsObject !== "object") continue;

        let keyCopy = key.replace("Wolfermus", "");
        if (!keyCopy) continue;

        removeVideoTypesCreatedMenuItems[keyCopy].toggled = currentWebsitesObject.Hide[keyCopy];

        if (RemoveVideoTypesSettings.Hide[keyCopy] !== currentWebsitesObject.Hide[keyCopy]) {
            RemoveVideoTypesSettings.Hide[keyCopy] = currentWebsitesObject.Hide[keyCopy];
            shouldSave = true;
        }
    }

    if (RemoveVideoTypesSettings.Active && !QOLRemoveVideoTypesGroupMenuItem.disabled) {
        const localYoutubeQOLJson = await GetValue("LocalYoutubeQOL", "{}", true);
        const localYoutubeQOLParsed = JSON.parse(localYoutubeQOLJson);

        ShouldDisable(QOLSettings, localYoutubeQOLParsed);
    }

    QOLRemoveVideoTypesGroupMenuItem.collapsed = RemoveVideoTypesSettings.Collapsed;
    QOLRemoveVideoTypesMenuItem.toggled = RemoveVideoTypesSettings.Active;

    if (shouldSave) SetValue("YoutubeQOL", JSON.stringify(QOLSettings));
}

const removeVideoTypesCreatedMenuItems = {};

/**
 * @async
 * @param { string } baseURL
 * @param { string } baseScriptURL
 * @param { string } baseWebsiteScriptURL
 * @param { string } branch 
 * @returns { Promise<WolfermusGroupMenuItem | undefined> }
 */
async function EntryRun(baseURL, baseScriptURL, baseWebsiteScriptURL, branch) {
    // const EntryRun = async (baseURL, baseScriptURL, baseWebsiteScriptURL, branch) => {
    const startTime = performance.now();

    const removeVideoTypesModule = WolfermusGetModule("YouTubeQOLRemoveVideoTypes", true);
    if (removeVideoTypesModule.LoadedMenuItems) return undefined;
    removeVideoTypesModule.LoadedMenuItems = false;
    removeVideoTypesModule.LoadingMenuItems = true;

    if (!(await SetupUtilities(baseURL, baseScriptURL, baseWebsiteScriptURL, branch))) return undefined;


    console.info("Wolfermus Scripts: Youtube - QOL - Remove Video Types Menu Items Loading");

    const YoutubeGotten = await GetValue("YoutubeQOL", "{}");
    let QOLSettings = JSON.parse(YoutubeGotten);
    if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

    if (!QOLSettings["RemoveVideoTypes"]) QOLSettings["RemoveVideoTypes"] = {};
    let RemoveVideoTypesSettings = QOLSettings["RemoveVideoTypes"];


    RemoveVideoTypesSettings.Active ??= false;
    if (typeof RemoveVideoTypesSettings.WebsitesEnabled !== "object") RemoveVideoTypesSettings.WebsitesEnabled = {};
    let WebsitesEnabledSettings = RemoveVideoTypesSettings.WebsitesEnabled;

    ValidateWebsiteEnabledSetting(WebsitesEnabledSettings, "Main");
    ValidateWebsiteEnabledSetting(WebsitesEnabledSettings, "Subscriptions");
    ValidateWebsiteEnabledSetting(WebsitesEnabledSettings, "Watch");
    ValidateWebsiteEnabledSetting(WebsitesEnabledSettings, "Playlist", false);
    if (typeof WebsitesEnabledSettings.Playlist.IdsToHide !== "object" || !Array.isArray(WebsitesEnabledSettings.Playlist.IdsToHide)) WebsitesEnabledSettings.Playlist.IdsToHide = [];
    ValidateWebsiteEnabledSetting(WebsitesEnabledSettings, "Results");


    if (typeof WebsitesEnabledSettings.Channels !== "object") WebsitesEnabledSettings.Channels = {};

    ValidateWebsiteEnabledSetting(WebsitesEnabledSettings.Channels, "Home", false);
    ValidateWebsiteEnabledSetting(WebsitesEnabledSettings.Channels, "Videos", false);
    ValidateWebsiteEnabledSetting(WebsitesEnabledSettings.Channels, "Search", false);

    RemoveVideoTypesSettings.Collapsed ??= false;

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

    const currentWebsites = GetCurrentWebsitesObject(QOLSettings);
    if (currentWebsites === undefined) currentWebsites = {};

    const QOLRemoveVideoTypesTogglePageMenuItem = new WolfermusToggleButtonMenuItem(`Toggle Page Type`, "Main/Subscriptions<br>/Channels/Playlists");
    QOLRemoveVideoTypesTogglePageMenuItem.toggled = currentWebsites?.Active ? true : false;
    QOLRemoveVideoTypesTogglePageMenuItem.ToggledEventAddCallback(async (toggled) => {
        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

        if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};

        const currentWebsitesObject = GetCurrentWebsitesObject(QOLSettingsInner);
        if (currentWebsitesObject === undefined) return;

        if (currentWebsitesObject.Active === toggled) return;
        currentWebsitesObject.Active = toggled;

        SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));
    });

    debugger;

    if (typeof RemoveVideoTypesSettings.Hide !== "object") RemoveVideoTypesSettings.Hide = {};
    if (typeof RemoveVideoTypesSettings.Background !== "object") RemoveVideoTypesSettings.Background = {};
    if (typeof RemoveVideoTypesSettings.Debug !== "object") RemoveVideoTypesSettings.Debug = {};

    const currentWebsitesObjectOutter = GetCurrentWebsitesObject(QOLSettings);
    if (currentWebsitesObjectOutter === undefined) return undefined;
    for (const key in wolfermusVideoTypesSettings) {
        const settingsObject = wolfermusVideoTypesSettings[key];
        if (!settingsObject) continue;
        if (typeof settingsObject !== "object") continue;

        let keyCopy = key.replace("Wolfermus", "");
        if (!keyCopy) continue;

        RemoveVideoTypesSettings.Hide[keyCopy] ??= currentWebsitesObjectOutter.Hide[keyCopy];
        RemoveVideoTypesSettings.Background[keyCopy] ??= currentWebsitesObjectOutter.Background[keyCopy];
        RemoveVideoTypesSettings.Debug[keyCopy] ??= currentWebsitesObjectOutter.Debug[keyCopy];

        let keyFormmated = keyCopy.replace(/([A-Z])/g, ' $1').trim();

        const newQOLRemoveVideoTypesMenuItem = new WolfermusToggleButtonMenuItem(`Toggle Hide ${keyFormmated}`);
        newQOLRemoveVideoTypesMenuItem.toggled = RemoveVideoTypesSettings.Hide[keyCopy];
        newQOLRemoveVideoTypesMenuItem.ToggledEventAddCallback(async (toggled) => {
            const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
            let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
            if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

            if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};
            let RemoveVideoTypesSettingsInner = QOLSettingsInner["RemoveVideoTypes"];

            const currentWebsitesObject = GetCurrentWebsitesObject(QOLSettingsInner);
            if (currentWebsitesObject === undefined) return;

            if (currentWebsitesObject.Hide[keyCopy] === toggled) return;
            currentWebsitesObject.Hide[keyCopy] = toggled;

            RemoveVideoTypesSettingsInner.Hide[keyCopy] = toggled;

            SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));
        });

        removeVideoTypesCreatedMenuItems[keyCopy] = newQOLRemoveVideoTypesMenuItem;
    }

    SetValue("YoutubeQOL", JSON.stringify(QOLSettings));

    const QOLRemoveVideoTypesPlaylistMenuItem = new WolfermusToggleButtonMenuItem(`Toggle This Playlist`);
    QOLRemoveVideoTypesPlaylistMenuItem.disabled = true;
    QOLRemoveVideoTypesPlaylistMenuItem.toggled = true;
    if (currentWebsites?.IdsToHide) {
        let params = new URL(document.location.toString()).searchParams;
        if (params.has("list")) {
            QOLRemoveVideoTypesPlaylistMenuItem.toggled = !currentWebsites.IdsToHide.includes(params.get("list"));
        }
    }
    QOLRemoveVideoTypesPlaylistMenuItem.ToggledEventAddCallback(async (toggled) => {
        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
        if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

        if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettingsInner = QOLSettingsInner["RemoveVideoTypes"];

        const currentWebsitesObject = GetCurrentWebsitesObject(QOLSettingsInner);
        if (currentWebsitesObject === undefined) return;

        const keysArray = GetCurrentWebsitesEnabled();
        if (keysArray.length !== 1) return;
        if (keysArray[0] !== "Playlist") return;
        if (!(currentWebsitesObject?.IdsToHide)) currentWebsitesObject.IdsToHide = [];

        let params = new URL(document.location.toString()).searchParams;
        if (!params.has("list")) return;

        const indexOfIdsToHide = currentWebsitesObject.IdsToHide.indexOf(params.get("list"));

        let shouldSave = false;

        if (toggled) {
            if (indexOfIdsToHide > -1) {
                currentWebsitesObject.IdsToHide.splice(indexOfIdsToHide, 1);
                shouldSave = true;
            }
        } else if (indexOfIdsToHide <= -1) {
            currentWebsitesObject.IdsToHide.push(params.get("list"));
            shouldSave = true;
        }

        if (shouldSave) SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));
    });
    const keysArray = GetCurrentWebsitesEnabled();
    if (keysArray.length === 1) {
        if (keysArray[0] === "Playlist") QOLRemoveVideoTypesPlaylistMenuItem.disabled = false;
    }

    const QOLRemoveVideoTypesPageTypeGroupMenuItem = new WolfermusGroupMenuItem(keysArray.join(" - "));
    QOLRemoveVideoTypesPageTypeGroupMenuItem.collapsed = true; // TODO Store this
    // QOLRemoveVideoTypesPageTypeGroupMenuItem.CollapsedAddCallback(async (newCollapsed) => {
    //     const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
    //     let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
    //     if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

    //     if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};
    //     let RemoveVideoTypesSettingsInner = QOLSettingsInner["RemoveVideoTypes"];

    //     RemoveVideoTypesSettingsInner.Collapsed = newCollapsed;

    //     SetValue("YoutubeQOL", JSON.stringify(QOLSettingsInner));
    // });
    QOLRemoveVideoTypesPageTypeGroupMenuItem.items.push(QOLRemoveVideoTypesTogglePageMenuItem);
    QOLRemoveVideoTypesPageTypeGroupMenuItem.items.push(...Object.values(removeVideoTypesCreatedMenuItems));
    QOLRemoveVideoTypesPageTypeGroupMenuItem.items.push(QOLRemoveVideoTypesPlaylistMenuItem);

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
    QOLRemoveVideoTypesGroupMenuItem.items.push(QOLRemoveVideoTypesPageTypeGroupMenuItem);


    QOLRemoveVideoTypesGroupMenuItem.includesUrls = FlattenRemoveVideoTypesUrlsIncludes();
    QOLRemoveVideoTypesGroupMenuItem.excludesUrls = FlattenRemoveVideoTypesUrlsExcludes();

    QOLRemoveVideoTypesGroupMenuItem.CheckUrls();


    if (RemoveVideoTypesSettings.Active && !QOLRemoveVideoTypesGroupMenuItem.disabled) {
        const localYoutubeQOLJson = await GetValue("LocalYoutubeQOL", "{}", true);
        const localYoutubeQOLParsed = JSON.parse(localYoutubeQOLJson);

        ShouldDisable(QOLSettings, localYoutubeQOLParsed);
        LoadScriptOnce("RemoveVideoTypes");
    }

    QOLRemoveVideoTypesGroupMenuItem.DisabledEventAddCallback(async (disabled) => {
        const localYoutubeQOLJson = await GetValue("LocalYoutubeQOL", "{}", true);
        const localYoutubeQOLParsed = JSON.parse(localYoutubeQOLJson);
        const localYoutubeQOL = GetLocalSettings(localYoutubeQOLParsed);

        let shouldSave = (localYoutubeQOL.Disabled !== disabled);
        localYoutubeQOL.Disabled = disabled;

        if (!disabled) {
            const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
            let QOLSettingsInner = JSON.parse(YoutubeGottenInner);
            if (!QOLSettingsInner || typeof QOLSettingsInner !== "object") QOLSettingsInner = {};

            if (!QOLSettingsInner["RemoveVideoTypes"]) QOLSettingsInner["RemoveVideoTypes"] = {};
            let RemoveVideoTypesSettingsInner = QOLSettingsInner["RemoveVideoTypes"];

            if (RemoveVideoTypesSettingsInner.Active) {
                ShouldDisable(QOLSettingsInner, localYoutubeQOLParsed);
                LoadScriptOnce("RemoveVideoTypes");
            }
        }
        if (localYoutubeQOL.Disabled !== disabled) shouldSave = false;
        if (shouldSave) SetValue("LocalYoutubeQOL", JSON.stringify(localYoutubeQOLParsed), true);
    });

    await AddValueChangeListener("YoutubeQOL", ValueChangedCallback);

    let oldHref = document.location.href;
    const observeUrlChange = async () => {
        if (oldHref === document.location.href) return;
        oldHref = document.location.href;

        const YoutubeGottenInner = await GetValue("YoutubeQOL", "{}");
        ValueChangedCallback("YoutubeQOL", undefined, YoutubeGottenInner, false);
    };

    window.addEventListener("yt-navigate-finish", observeUrlChange);

    const endTime = performance.now();

    removeVideoTypesModule.LoadedMenuItems = true;
    removeVideoTypesModule.LoadingMenuItems = false;

    console.info(`Wolfermus Scripts: Youtube - QOL - Remove Video Types Menu Items Loaded - Took ${endTime - startTime}ms`);
    return QOLRemoveVideoTypesGroupMenuItem;
};

// Uncomment below if running in console.
// EntryRun("");