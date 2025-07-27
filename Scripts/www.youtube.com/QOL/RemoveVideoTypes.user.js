// ==UserScript==
// @name         Wolfermus RemoveVideoTypes Test (Beta)
// @namespace    https://greasyfork.org/en/users/900467-feb199
// @version      3.1.2-beta.6
// @description  This script is RemoveVideoTypes script test. (Beta)
// @author       Feb199/Dannysmoka
// @homepageURL  https://github.com/Wolfermus/Wolfermus-UserScripts
// @supportURL   https://github.com/Wolfermus/Wolfermus-UserScripts/issues
// @license      GPLv3
// @noframes
// @match        https://www.youtube.com
// @match        https://www.youtube.com/*
// @require      https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/RemoveVideoTypes-Script/Libraries/StorageManagerLib.user.js
// @require      https://github.com/Wolfermus/Wolfermus-UserScripts/raw/refs/heads/RemoveVideoTypes-Script/Libraries/MainMenu/MainMenuLib.user.js
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
 * @param {boolean} [forceLocal = false]
 * @param {boolean} [ignoreEqual = false]
 * @type {(key: string, callback: ((key: string, oldValue: any, newValue: any, remote: boolean) => void, forceLocal?: boolean, ignoreEqual?: boolean)) => Promise<number>}
 * @returns {Promise<number>}
 */
let AddValueChangeListener = undefined;

const WolfermusShouldLogTrace = false;
let RemoveVideoTypesIsActive = false;
let RemoveVideoTypesIsDisabled = false;

function ShouldRunCode() {
    if (RemoveVideoTypesIsDisabled) return false;
    return RemoveVideoTypesIsActive;
}

let wolfermusVideoTypesDebug = true;
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

function GenerateCSS() {
    if (!wolfermusVideoTypesSettings) return undefined;
    let generatedCSS = "";
    for (const key in wolfermusVideoTypesSettings) {
        const settingsObject = wolfermusVideoTypesSettings[key];
        if (!settingsObject) continue;
        if (typeof settingsObject !== "object") continue;
        generatedCSS += `.${key} {
`;
        if (settingsObject.hide) {
            if (wolfermusVideoTypesDebug || settingsObject.debug) {
                generatedCSS += `   background: ${settingsObject.background}`;
            } else {
                generatedCSS += "   display: none";
            }
        }
        generatedCSS += `
}
`;
    }
    return generatedCSS;
}

let WolfermusCSSIsEmpty = true;
function UpdateCSS(emptyCSS = false) {
    let mainMenuStyle = document.getElementById("WolfermusRemoveTypeTestScriptStyle");

    if (mainMenuStyle === undefined || mainMenuStyle === null) {
        mainMenuStyle = document.createElement("style");
        mainMenuStyle.id = "WolfermusRemoveTypeTestScriptStyle";
        document.head.append(mainMenuStyle);
    }

    let generatedCSS = "";
    if (!emptyCSS) generatedCSS = GenerateCSS();

    WolfermusCSSIsEmpty = (generatedCSS === "");

    const editedInnerHTML = wolfermusBypassScriptPolicy.createHTML(generatedCSS);

    mainMenuStyle.innerHTML = editedInnerHTML;
}

function ProcessSettings(settings) {
    if (typeof settings !== "object") return false;
    const hasHide = typeof settings.Hide === "object";
    const hasBackground = typeof settings.Background === "object";
    const hasDebug = typeof settings.Debug === "object";
    if (!hasHide && !hasBackground && !hasDebug) return false;

    let hasUpdate = false;

    for (const key in wolfermusVideoTypesSettings) {
        const settingsObject = wolfermusVideoTypesSettings[key];
        if (!settingsObject) continue;
        if (typeof settingsObject !== "object") continue;

        let keyCopy = key.replace("Wolfermus", "");
        if (!keyCopy) continue;

        if (hasHide) {
            if (typeof settings.Hide[keyCopy] === "boolean") {
                if (settingsObject.hide !== settings.Hide[keyCopy]) {
                    settingsObject.hide = settings.Hide[keyCopy];
                    hasUpdate = true;
                }
            }
        }
        if (hasBackground) {
            if (typeof settings.Background[keyCopy] === "string") {
                if (settingsObject.background !== settings.Background[keyCopy]) {
                    settingsObject.background = settings.Background[keyCopy];
                    hasUpdate = true;
                }
            }
        }
        if (hasDebug) {
            if (typeof settings.Debug[keyCopy] === "boolean") {
                if (settingsObject.debug !== settings.Debug[keyCopy]) {
                    settingsObject.debug = settings.Debug[keyCopy];
                    hasUpdate = true;
                }
            }
        }
    }

    return hasUpdate;
}

let WolfermusActiveChanged = false;
function YoutubeQOLValueChangedCallback(oldValue, newValue, remote) {
    let QOLSettings = JSON.parse(newValue);
    if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

    if (!QOLSettings["RemoveVideoTypes"]) QOLSettings["RemoveVideoTypes"] = {};
    let RemoveVideoTypesSettings = QOLSettings["RemoveVideoTypes"];

    RemoveVideoTypesSettings.Active ??= false;
    if (RemoveVideoTypesIsActive !== RemoveVideoTypesSettings.Active) WolfermusActiveChanged = true;

    RemoveVideoTypesIsActive = RemoveVideoTypesSettings.Active;

    if (!ShouldRunCode()) {
        UpdateCSS(true);
        WolfermusActiveChanged = true;
        return;
    }

    if (ProcessSettings(RemoveVideoTypesSettings) || WolfermusCSSIsEmpty) UpdateCSS();

    if (WolfermusActiveChanged) {
        WolfermusActiveChanged = false;
        FindAllVideos();
    }
}

function LocalYoutubeQOLValueChangedCallback(oldValue, newValue, remote) {
    debugger;
    let QOLSettings = JSON.parse(newValue);
    if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

    if (!QOLSettings["RemoveVideoTypes"]) QOLSettings["RemoveVideoTypes"] = {};
    let RemoveVideoTypesSettings = QOLSettings["RemoveVideoTypes"];

    RemoveVideoTypesSettings.Disabled ??= false;
    if (RemoveVideoTypesIsDisabled !== RemoveVideoTypesSettings.Disabled) WolfermusActiveChanged = true;

    RemoveVideoTypesIsDisabled = RemoveVideoTypesSettings.Disabled;

    if (!ShouldRunCode()) {
        UpdateCSS(true);
        WolfermusActiveChanged = true;
        return;
    }

    if (WolfermusCSSIsEmpty) UpdateCSS();

    if (WolfermusActiveChanged) {
        WolfermusActiveChanged = false;
        FindAllVideos();
    }
}

function ValueChangedCallback(key, oldValue, newValue, remote) {
    switch (key) {
        case "YoutubeQOL":
            YoutubeQOLValueChangedCallback(oldValue, newValue, remote);
            break;
        case "YoutubeQOLLocal":
            LocalYoutubeQOLValueChangedCallback(oldValue, newValue, remote);
            break;
        default:
            break;
    }
}

function DefaultVideoElementCheck(videoElement) {
    if (typeof videoElement?.polymerController?.__data?.data === "object") {
        return [videoElement.polymerController.__data, "data"];
    }
    return [videoElement, "data"];
}

function DefaultSignalCacheElementCheck(videoElement) {
    if (typeof videoElement?.polymerController?.signalProxy?.signalCache?.data === "object") {
        const hiddentSignalCacheData = videoElement.polymerController.signalProxy.signalCache.data;
        for (const key in hiddentSignalCacheData) {
            if (!key) continue
            if (!key.endsWith("getImpl")) continue;
            const symbolKey = Reflect.ownKeys(hiddentSignalCacheData[key]).find(key => key.toString().startsWith("Symbol"));
            if (!symbolKey) continue;
            if (typeof hiddentSignalCacheData[key]?.[symbolKey]?.value === "object") {
                return [hiddentSignalCacheData[key][symbolKey], "value"];
            }
        }
    }
    if (typeof videoElement?.polymerController?.__data?.data === "object") {
        return [videoElement.polymerController.__data, "data"];
    }
    return [videoElement, "data"];
}

const validVideoTagNamesVideo = {
    "ytd-video-renderer": (videoElement) => DefaultVideoElementCheck(videoElement),
    "ytd-grid-video-renderer": (videoElement) => DefaultVideoElementCheck(videoElement),
    "ytd-rich-item-renderer": (videoElement) => DefaultVideoElementCheck(videoElement),
    "yt-lockup-view-model.ytd-item-section-renderer": (videoElement) => [videoElement.firstElementChild, "data"],
    "yt-lockup-view-model.yt-horizontal-list-renderer": (videoElement) => [videoElement.firstElementChild, "data"],
    "ytm-shorts-lockup-view-model-v2.yt-horizontal-list-renderer": (videoElement) => [videoElement.firstElementChild, "data"],
    ".ytGridShelfViewModelGridShelfItem": (videoElement) => [videoElement.firstElementChild.firstElementChild, "data"],
    "ytd-compact-video-renderer": (videoElement) => DefaultVideoElementCheck(videoElement),
    "ytd-playlist-video-renderer": (videoElement) => DefaultSignalCacheElementCheck(videoElement),
    "ytd-game-card-renderer": (videoElement) => DefaultSignalCacheElementCheck(videoElement),
    "ytd-grid-movie-renderer": (videoElement) => DefaultSignalCacheElementCheck(videoElement),
    "ytd-grid-channel-renderer": (videoElement) => DefaultSignalCacheElementCheck(videoElement),
    "ytd-post-renderer": (videoElement) => DefaultSignalCacheElementCheck(videoElement)
};

const validVideoTagNamesShelf = {
    "ytd-shelf-renderer": (videoElement) => DefaultSignalCacheElementCheck(videoElement),
    "ytd-rich-section-renderer": (videoElement) => DefaultSignalCacheElementCheck(videoElement),
    "ytd-item-section-renderer": (videoElement) => DefaultSignalCacheElementCheck(videoElement),
    "ytd-reel-shelf-renderer": (videoElement) => DefaultSignalCacheElementCheck(videoElement),
    "ytd-horizontal-card-list-renderer": (videoElement) => DefaultSignalCacheElementCheck(videoElement)
};

const validVideoTagNames = [...Object.keys(validVideoTagNamesVideo), ...Object.keys(validVideoTagNamesShelf)];
const ignoreProperties = ["isToggled", "thumbnail", "richThumbnail", "channelThumbnailSupportedRenderers", "avatar"];

function GetDataFromArray(array) {
    if (!array || !array[0] || !array[1]) return undefined;
    const data = array[0]?.[array[1]];
    return data;
}

function GetDataFromElement(element) {
    if (!element) return undefined;

    for (const key in validVideoTagNamesShelf) {
        if (!element.matches(key)) continue;
        return GetDataFromArray(validVideoTagNamesShelf[key](element));
    }

    for (const key in validVideoTagNamesVideo) {
        if (!element.matches(key)) continue;
        return GetDataFromArray(validVideoTagNamesVideo[key](element));
    }

    return undefined;
}

const TrackContentNotDetected = [];
let TrackContentNotDetectedLastLengthLogged = 0;

const TrackContentsNotDetected = [];
let TrackContentsNotDetectedLastLengthLogged = 0;

function GetDataContent(data) {
    if (!data) return undefined;
    if (data instanceof HTMLElement) {
        let gottenData = GetDataFromElement(data);
        if (gottenData) {
            data = gottenData;
        } else {
            data = data?.data;
        }
    }
    if (!data) return undefined;

    //#region Misc
    if (data?.content?.backgroundPromoRenderer) {
        return data.content.backgroundPromoRenderer;
    }
    if (data?.content?.adSlotRenderer) {
        return data.content.adSlotRenderer;
    }
    if (data?.content?.feedNudgeRenderer) {
        return data.content.feedNudgeRenderer;
    }
    //#endregion -Misc

    //#region Channel
    if (data?.content?.gridChannelRenderer) {
        return data.content.gridChannelRenderer;
    }
    //#endregion -Channel

    //#region Game
    if (data?.content?.game) {
        if (data.content.game?.gameDetailsRenderer) {
            return data.content.game.gameDetailsRenderer;
        }
        return data.content.game;
    }
    //#endregion -Game

    //#region Videos
    if (data?.content?.videoRenderer) {
        return data.content.videoRenderer;
    }
    if (data?.content?.shortsLockupViewModel) {
        return data.content.shortsLockupViewModel;
    }
    if (data?.content?.miniGameCardViewModel) {
        return data.content.miniGameCardViewModel;
    }
    if (data?.content?.lockupViewModel) {
        return data.content.lockupViewModel;
    }
    if (data?.content?.gridVideoRenderer) {
        return data.content.gridVideoRenderer;
    }
    //#endregion -Videos

    //#region Shelfs
    if (data?.content?.shelfRenderer) {
        return data.content.shelfRenderer;
    }
    if (data?.content?.richShelfRenderer) {
        return data.content.richShelfRenderer;
    }
    if (data?.content?.reelShelfRenderer) {
        return data.content.reelShelfRenderer;
    }
    if (data?.content?.channelVideoPlayerRenderer) {
        return data.content.channelVideoPlayerRenderer;
    }
    if (data?.content?.carouselItemRenderer) {
        return data.content.carouselItemRenderer;
    }
    //#endregion -Shelfs

    else if (data?.content) {
        for (const key in data.content) {
            if (TrackContentNotDetected.includes(key)) continue;
            TrackContentNotDetected.push(key);
        }
        if (TrackContentNotDetectedLastLengthLogged !== TrackContentNotDetected.length) {
            console.warn("TrackContentNotDetected", TrackContentNotDetected);
            TrackContentNotDetectedLastLengthLogged = TrackContentNotDetected.length;
        }
    } else if (data?.contents) {
        for (const key in data.contents) {
            if (TrackContentsNotDetected.includes(key)) continue;
            TrackContentsNotDetected.push(key);
        }
        if (TrackContentsNotDetectedLastLengthLogged !== TrackContentsNotDetected.length) {
            console.warn("TrackContentsNotDetected", TrackContentsNotDetected);
            TrackContentsNotDetectedLastLengthLogged = TrackContentsNotDetected.length;
        }
    }

    return data;
}

function GetDataContents(data) {
    if (!data) return undefined;
    if (data instanceof HTMLElement) {
        let gottenData = GetDataFromElement(data);
        if (gottenData) {
            data = gottenData;
        } else {
            data = data?.data;
        }
    }
    if (!data) return undefined;

    if (data?.contents) {
        return data.contents;
    }

    const gottenContent = GetDataContent(data);
    if (!gottenContent) return undefined;

    if (gottenContent?.contents) {
        return gottenContent.contents;
    }

    return undefined;
}

function GetDataID(data) {
    if (!data) return undefined;

    const gottenDataContent = GetDataContent(data);
    if (!gottenDataContent) return undefined;

    if (gottenDataContent?.videoId) {
        return gottenDataContent.videoId;
    } else if (gottenDataContent?.contentId) {
        return gottenDataContent.contentId;
    } else if (gottenDataContent?.entityId) {
        return gottenDataContent.entityId;
    }

    return undefined;
}

function SetupProxyDeletePropertyCallback(videoElement) {
    return (target, property) => {
        delete target[property];
        if (!ShouldRunCode()) return true;
        if (property.startsWith(propertyWolfermus)) return true;
        if (ignoreProperties.includes(property)) return true;
        if (WolfermusShouldLogTrace) {
            console.log(target);
            console.log(property);
            console.log(" ");
        }

        let shouldDoForLoopVideos = true;

        for (const validVideoTag in validVideoTagNamesShelf) {
            if (!videoElement.matches(validVideoTag)) continue;
            UpdateClassesToVideoElementShelf(videoElement);
            shouldDoForLoopVideos = false;
            break;
        }

        if (shouldDoForLoopVideos) {
            for (const validVideoTag in validVideoTagNamesVideo) {
                if (!videoElement.matches(validVideoTag)) continue;
                UpdateClassesToVideoElement(videoElement);
                break;
            }
        }
        return true;
    };
}

const propertyWolfermus = "_Wolfermus_";
const propertyWolfermusRaw = "_Wolfermus_Raw_";

function SetupProxySetCallback(videoElement) {
    return (target, property, value, receiver) => {
        let wolfermusProcess = true;

        if (target[property] === value) wolfermusProcess = false;
        if (property.startsWith(propertyWolfermus)) wolfermusProcess = false;
        if (ignoreProperties.includes(property)) wolfermusProcess = false;

        if (wolfermusProcess && ShouldRunCode()) {
            if (WolfermusShouldLogTrace) {
                console.log(target);
                console.log(property);
                if (typeof value === "object") {
                    console.log("object");
                } else console.log(value);

                console.log(`old ${property}`);
                if (typeof target[property] === "object") {
                    console.log("object");
                } else console.log(target[property]);

                console.log(receiver);
                console.log(" ");
            }

            let shouldDoForLoopVideos = true;

            for (const validVideoTag in validVideoTagNamesShelf) {
                if (!videoElement.matches(validVideoTag)) continue;
                UpdateClassesToVideoElementShelf(videoElement);
                shouldDoForLoopVideos = false;
                break;
            }

            if (shouldDoForLoopVideos) {
                for (const validVideoTag in validVideoTagNamesVideo) {
                    if (!videoElement.matches(validVideoTag)) continue;
                    UpdateClassesToVideoElement(videoElement);
                    break;
                }
            }
        }

        target[property] = value;

        if (wolfermusProcess && typeof target[property] === "object") AttachProxies(videoElement, target, property);
        return true;
    };
}

function AttachProxies(videoElement, target, property, shouldSetProxy = true) {
    let storedWolfermusObjectKey = propertyWolfermus + property;
    let storedWolfermusObjectRawKey = propertyWolfermusRaw + property;

    if (shouldSetProxy && !ignoreProperties.includes(property)) {
        if (typeof target[property] !== "object") {
            target[property] = {};
        }

        target[storedWolfermusObjectRawKey] = target[property];

        target[storedWolfermusObjectKey] = new Proxy(target[storedWolfermusObjectRawKey], {
            deleteProperty: SetupProxyDeletePropertyCallback(videoElement),
            set: SetupProxySetCallback(videoElement)
        });


        const descriptor = Object.getOwnPropertyDescriptor(target, property);
        const hasSetter = descriptor && typeof descriptor.set === 'function';

        if (!hasSetter) {
            Object.defineProperty(target, property, {
                get() {
                    if (!videoElement) return undefined;
                    if (!document.contains(videoElement)) return undefined;
                    return target[propertyWolfermus + property];
                },
                set(newValue) {
                    if (typeof newValue !== "object") {
                        debugger;
                        return;
                    }
                    if (!videoElement) return;
                    if (!document.contains(videoElement)) return;

                    if (WolfermusShouldLogTrace) {
                        const gottenOldID = GetDataID(target[propertyWolfermus + property]);
                        const gottenNewID = GetDataID(newValue);

                        console.log("Setter");
                        console.log(`Old ID: ${gottenOldID}`);
                        console.log(`New ID: ${gottenNewID}`);
                        console.log(" ");
                    }

                    target[propertyWolfermus + property] = newValue
                    AttachProxies(videoElement, target, property, true);

                    let shouldDoForLoopVideos = true;

                    for (const validVideoTag in validVideoTagNamesShelf) {
                        if (!videoElement.matches(validVideoTag)) continue;
                        UpdateClassesToVideoElementShelf(videoElement);
                        shouldDoForLoopVideos = false;
                        break;
                    }

                    if (shouldDoForLoopVideos) {
                        for (const validVideoTag in validVideoTagNamesVideo) {
                            if (!videoElement.matches(validVideoTag)) continue;
                            UpdateClassesToVideoElement(videoElement);
                            break;
                        }
                    }
                },
                enumerable: true,
                configurable: true,
            });
        }
    }

    for (const subObjectKey in target[storedWolfermusObjectKey]) {
        if (typeof target[storedWolfermusObjectKey][subObjectKey] !== "object") continue;
        if (subObjectKey.startsWith(propertyWolfermus)) continue;
        if (ignoreProperties.includes(subObjectKey)) continue;

        AttachProxies(videoElement, target[storedWolfermusObjectKey], subObjectKey);
    }
}

function SetupVideoElement(videoElement, target, property) {
    if (!videoElement || !target || !property) return;

    AttachProxies(videoElement, target, property);
}

const detectShelfToClass = {
    "shorts": "WolfermusShortsShelf",
    "playables": "WolfermusPlayablesShelf",
    "post": "WolfermusPostsShelf"
};

function UpdateClassesToVideoElementShelf(videoElement) {
    if (!ShouldRunCode()) return;

    const content = GetDataContent(videoElement);

    let foundSomthing = false;
    videoElement.classList.remove(...Object.values(detectShelfToClass));


    const titleLowerCase = content?.title?.runs?.[0]?.text?.toLocaleLowerCase();

    if (titleLowerCase) {
        for (const detectKey in detectShelfToClass) {
            if (!titleLowerCase?.includes?.(detectKey)) continue;
            videoElement.classList.add(detectShelfToClass[detectKey]);
            foundSomthing = true;
        }
    }

    const simpleTitleLowerCase = videoElement?.data?.title?.simpleText?.toLocaleLowerCase();

    if (simpleTitleLowerCase) {
        for (const detectKey in detectShelfToClass) {
            if (!simpleTitleLowerCase?.includes?.(detectKey)) continue;
            videoElement.classList.add(detectShelfToClass[detectKey]);
            foundSomthing = true;
        }
    }

    const findGridShelfViewModels = videoElement.querySelectorAll("#contents grid-shelf-view-model");

    if (findGridShelfViewModels) {
        for (const gridShelfViewElement of findGridShelfViewModels) {
            let foundInnerSomthing = false;
            const spans = gridShelfViewElement.querySelectorAll("yt-shelf-header-layout span");
            for (const spanElement of spans) {
                if (!spanElement?.innerText) continue;

                const titleLowerCaseInner = spanElement.innerText?.toLocaleLowerCase();
                if (!titleLowerCaseInner) continue;

                for (const detectKey in detectShelfToClass) {
                    if (!titleLowerCaseInner?.includes?.(detectKey)) continue;
                    gridShelfViewElement.classList.add(detectShelfToClass[detectKey]);
                    foundInnerSomthing = true;
                }
                if (foundInnerSomthing) break;
            }
        }
    }


    // const findGridShelfViewModel = videoElement.querySelector("#contents grid-shelf-view-model");

    // if (findGridShelfViewModel) {
    //     const gottenContents = GetDataContents(videoElement);
    //     for (const gottenContent of gottenContents) {
    //         for (const gottenObjectKey in gottenContent) {
    //             if (gottenObjectKey === "gridShelfViewModel") {
    //                 const gottenObject = gottenContent[gottenObjectKey];

    //                 const gottenObjectTitleLowerCase = gottenObject?.header?.sectionHeaderViewModel?.headline?.content?.toLocaleLowerCase();

    //                 for (const detectKey in detectShelfToClass) {
    //                     if (!gottenObjectTitleLowerCase?.includes?.(detectKey)) continue;
    //                     videoElement.classList.add(detectShelfToClass[detectKey]);
    //                     findGridShelfViewModel.classList.add(detectShelfToClass[detectKey]);
    //                     foundSomthing = true;
    //                 }
    //             }
    //         }
    //     }
    // }

    if (content?.header) {
        const headerContent = content.header?.richListHeaderRenderer;
        if (headerContent) {
            const titleLowerCaseInnerSimpleText = headerContent?.title?.simpleText?.toLocaleLowerCase?.();
            const titleLowerCaseInner = headerContent?.title?.runs?.[0]?.text?.toLocaleLowerCase?.();

            if (titleLowerCaseInner) {
                for (const detectKey in detectShelfToClass) {
                    if (!titleLowerCaseInner?.includes?.(detectKey)) continue;
                    videoElement.classList.add(detectShelfToClass[detectKey]);
                    foundSomthing = true;
                }
            }
            if (titleLowerCaseInnerSimpleText) {
                for (const detectKey in detectShelfToClass) {
                    if (!titleLowerCaseInner?.includes?.(detectKey)) continue;
                    videoElement.classList.add(detectShelfToClass[detectKey]);
                    foundSomthing = true;
                }
            }
        }
    }

    // const contents = GetDataContents(videoElement);
    // if (contents && contents.length > 0) {
    //     for (const item of contents) {
    //         if (!item) continue;
    //         const gottenContent = GetDataContent(item);
    //         if (!gottenContent) continue;

    //         const titleLowerCaseInner = content?.title?.runs?.[0]?.text?.toLocaleLowerCase();

    //         for (const detectKey in detectShelfToClass) {
    //             if (!titleLowerCaseInner?.includes?.(detectKey)) continue;
    //             videoElement.classList.add(detectShelfToClass[detectKey]);
    //             foundSomthing = true;
    //         }
    //     }
    // }

    videoElement.classList.remove("WolfermusOther", "WolfermusSelfOther")
    if (!foundSomthing) videoElement.classList.add("WolfermusSelfOther");

    return foundSomthing;
}

const timeOutIDs = {};
function CheckForYouWatchMark(videoElement, detectXToClass) {
    if (!videoElement) return false;

    if (videoElement.querySelector(".youwatch-mark")) {
        videoElement.classList.add(detectXToClass["watched"]);
        videoElement.classList.remove("WolfermusOther", "WolfermusSelfOther");

        const gottenID = GetDataID(videoElement);
        if (gottenID) {
            if (timeOutIDs?.[gottenID]) {
                for (const id of timeOutIDs[gottenID]) {
                    clearInterval(id);
                }
                timeOutIDs[gottenID] = [];
            }
        }

        return true;
    }

    return false;
}

const detectVideoToClass = {
    "shorts": "WolfermusShortVideo",
    "playables": "WolfermusPlayablesVideo",
    "live": "WolfermusLiveVideo",
    "streamed": "WolfermusStreamedVideo",
    "members first": "WolfermusMembersFirstVideo",
    "members only": "WolfermusMembersOnlyVideo",
    "scheduled": "WolfermusScheduledVideo",
    "upcoming": "WolfermusScheduledVideo",
    "watched": "WolfermusWatchedVideo",
    "post": "WolfermusPostItem"
};

function UpdateClassesToVideoElement(videoElement) {
    if (!ShouldRunCode()) return;

    const content = GetDataContent(videoElement);

    let foundSomthing = false;
    videoElement.classList.remove(...Object.values(detectVideoToClass));

    if (content?.thumbnailOverlays && content?.thumbnailOverlays?.length > 0) {
        for (const thumbnailOverlay of content.thumbnailOverlays) {
            if (!thumbnailOverlay.thumbnailOverlayTimeStatusRenderer && !thumbnailOverlay.thumbnailOverlayPlaybackStatusRenderer && !thumbnailOverlay.thumbnailOverlayResumePlaybackRenderer) continue;

            const thumbnailOverlayTimeStatusRenderer = thumbnailOverlay?.thumbnailOverlayTimeStatusRenderer;
            if (thumbnailOverlayTimeStatusRenderer) {
                const lowerCaseSimpleText = thumbnailOverlayTimeStatusRenderer?.text?.simpleText?.toLocaleLowerCase?.();

                if (lowerCaseSimpleText) {
                    for (const detectKey in detectVideoToClass) {
                        if (!lowerCaseSimpleText?.includes?.(detectKey)) continue;
                        videoElement.classList.add(detectVideoToClass[detectKey]);
                        foundSomthing = true;
                    }
                }
            }

            const thumbnailOverlayPlaybackStatusRenderer = thumbnailOverlay?.thumbnailOverlayPlaybackStatusRenderer;
            if (thumbnailOverlayPlaybackStatusRenderer) {
                if (thumbnailOverlayPlaybackStatusRenderer?.texts && thumbnailOverlayPlaybackStatusRenderer?.texts?.length > 0) {
                    for (const textObject of thumbnailOverlayPlaybackStatusRenderer.texts) {
                        if (!textObject?.runs) continue;
                        if (textObject.runs?.length <= 0) continue;
                        for (const runsObject of textObject.runs) {
                            if (!runsObject?.text) continue;
                            const lowerCaserunsObjectText = runsObject.text?.toLocaleLowerCase?.();
                            if (!lowerCaserunsObjectText) continue;

                            for (const detectKey in detectVideoToClass) {
                                if (!lowerCaserunsObjectText?.includes?.(detectKey)) continue;
                                videoElement.classList.add(detectVideoToClass[detectKey]);
                                foundSomthing = true;
                            }
                        }
                    }
                }
            }

            const thumbnailOverlayResumePlaybackRenderer = thumbnailOverlay?.thumbnailOverlayResumePlaybackRenderer;
            if (thumbnailOverlayResumePlaybackRenderer) {
                if (thumbnailOverlayResumePlaybackRenderer?.percentDurationWatched && thumbnailOverlayResumePlaybackRenderer?.percentDurationWatched >= 75) {
                    videoElement.classList.add(detectVideoToClass["watched"]);
                    foundSomthing = true;
                }
            }
        }
    }

    if (content?.badges && content?.badges?.length > 0) {
        for (const badge of content.badges) {
            if (!badge?.metadataBadgeRenderer) continue;

            const badgeContent = badge.metadataBadgeRenderer;
            const lowerCaseLabel = badgeContent?.label?.toLocaleLowerCase?.();

            if (!lowerCaseLabel) continue;
            for (const detectKey in detectVideoToClass) {
                if (!lowerCaseLabel?.includes?.(detectKey)) continue;
                videoElement.classList.add(detectVideoToClass[detectKey]);
                foundSomthing = true;
            }
        }
    }

    if (content?.publishedTimeText?.simpleText) {
        const lowerCasePublishedTimeText = content.publishedTimeText.simpleText?.toLocaleLowerCase?.();
        if (lowerCasePublishedTimeText) {
            for (const detectKey in detectVideoToClass) {
                if (!lowerCasePublishedTimeText?.includes?.(detectKey)) continue;
                videoElement.classList.add(detectVideoToClass[detectKey]);
                foundSomthing = true;
            }
        }
    }

    if (videoElement?.isMiniGameCardShelf) {
        videoElement.classList.add(detectVideoToClass["playables"]);
        foundSomthing = true;
    }

    if (videoElement?.data?.content?.shortsLockupViewModel) {
        videoElement.classList.add(detectVideoToClass["shorts"]);
        foundSomthing = true;
    }

    if (content?.entityId) {
        const lowerCaseEntityId = content.entityId?.toLocaleLowerCase?.();
        if (lowerCaseEntityId) {
            for (const detectKey in detectVideoToClass) {
                if (!lowerCaseEntityId?.includes?.(detectKey)) continue;
                videoElement.classList.add(detectVideoToClass[detectKey]);
                foundSomthing = true;
            }
        }
    }

    if (content?.postId) {
        videoElement.classList.add(detectVideoToClass["post"]);
        foundSomthing = true;
    }

    videoElement.classList.remove("WolfermusOther", "WolfermusSelfOther");
    if (!foundSomthing) videoElement.classList.add("WolfermusOther");

    if (!videoElement.classList.contains(detectVideoToClass["watched"])) {
        if (CheckForYouWatchMark(videoElement, detectVideoToClass)) foundSomthing = true;
        else {
            const gottenID = GetDataID(videoElement);
            if (gottenID) {
                if (!timeOutIDs[gottenID]) timeOutIDs[gottenID] = [];
                timeOutIDs[gottenID].push(setTimeout(CheckForYouWatchMark, 50, videoElement, detectVideoToClass));
                timeOutIDs[gottenID].push(setTimeout(CheckForYouWatchMark, 100, videoElement, detectVideoToClass));
                timeOutIDs[gottenID].push(setTimeout(CheckForYouWatchMark, 200, videoElement, detectVideoToClass));
                timeOutIDs[gottenID].push(setTimeout(CheckForYouWatchMark, 500, videoElement, detectVideoToClass));
                timeOutIDs[gottenID].push(setTimeout(CheckForYouWatchMark, 1000, videoElement, detectVideoToClass));
                timeOutIDs[gottenID].push(setTimeout(CheckForYouWatchMark, 2000, videoElement, detectVideoToClass));
            }
        }
    }

    return foundSomthing;
}

function CheckVideoElement(videoElement) {
    if (!ShouldRunCode()) return;

    if (!videoElement) return;
    if (!document.contains(videoElement)) return;

    for (const validVideoTag in validVideoTagNamesShelf) {
        if (!videoElement.matches(validVideoTag)) continue;
        SetupVideoElement(videoElement, ...validVideoTagNamesShelf[validVideoTag](videoElement));
        UpdateClassesToVideoElementShelf(videoElement);
        return;
    }

    for (const validVideoTag in validVideoTagNamesVideo) {
        if (!videoElement.matches(validVideoTag)) continue;
        SetupVideoElement(videoElement, ...validVideoTagNamesVideo[validVideoTag](videoElement));
        UpdateClassesToVideoElement(videoElement);
        break;
    }
}

const config = { childList: true, subtree: true };

const listOfSelectorsToTreeWalkThrough = ["#contents grid-shelf-view-model", ".ytGridShelfViewModelGridShelfRow"];

const callback = (mutationRecordList, observer) => {
    if (!ShouldRunCode()) return;

    for (const mutationRecord of mutationRecordList) {
        if (mutationRecord.addedNodes.length > 0) {
            for (const addedNode of mutationRecord.addedNodes) {
                for (const validVideoTag of listOfSelectorsToTreeWalkThrough) {
                    if (!addedNode?.matches?.(validVideoTag)) continue;
                    const treeWalker = document.createTreeWalker(addedNode);
                    let currentNode = treeWalker.currentNode;
                    while (currentNode) {
                        for (const validVideoTag of validVideoTagNames) {
                            if (!currentNode?.matches?.(validVideoTag)) continue;
                            CheckVideoElement(currentNode);
                            break;
                        }
                        currentNode = treeWalker.nextNode();
                    }
                    break;
                }
                for (const validVideoTag of validVideoTagNames) {
                    if (!addedNode?.matches?.(validVideoTag)) continue;
                    CheckVideoElement(addedNode);
                    break;
                }
            }
        }
    }
};

function FindAllVideos() {
    if (!ShouldRunCode()) return;

    const foundVideos = document.querySelectorAll(validVideoTagNames.join(", "));
    if (foundVideos.length <= 0) return;

    for (let index = 0; index < foundVideos.length; index++) {
        const videoElement = foundVideos[index];

        CheckVideoElement(videoElement);
    }
}

let wolfermusLoadedPageTypes = [];

function SetupYTDApp() {
    const observerVideosAdded = new MutationObserver(callback);

    const ytdApp = document.querySelector("ytd-app");
    if (!ytdApp) return false;

    const pageManager = ytdApp?.polymerController?.$?.["page-manager"];
    if (!pageManager) return false;

    const currentPage = pageManager.currentPage;

    if (currentPage) {
        observerVideosAdded.observe(currentPage, config);
        wolfermusLoadedPageTypes.push(currentPage);
    }

    ytdApp.addEventListener("yt-page-data-updated", (event) => {
        if (!ShouldRunCode()) return;

        if (!wolfermusLoadedPageTypes.includes(event.target)) {
            observerVideosAdded.observe(event.target, config);
            FindAllVideos();
            wolfermusLoadedPageTypes.push(event.target);
        }

        if (WolfermusShouldLogTrace) {
            console.log(event);
            console.log("yt-page-data-updated");
        }
    });

    return true;
}

async function SetupEvents() {
    let YoutubeGotten = await GetValue("YoutubeQOL", "{}");
    if (!YoutubeGotten || typeof YoutubeGotten !== "string") YoutubeGotten = "{}";

    const localYoutubeQOLJson = await GetValue("YoutubeQOLLocal", "{}", true);
    if (!localYoutubeQOLJson || typeof localYoutubeQOLJson !== "string") localYoutubeQOLJson = "{}";

    await AddValueChangeListener("YoutubeQOL", ValueChangedCallback);
    await AddValueChangeListener("YoutubeQOLLocal", ValueChangedCallback, true, true);

    ValueChangedCallback("YoutubeQOLLocal", undefined, localYoutubeQOLJson, false);
    ValueChangedCallback("YoutubeQOL", undefined, YoutubeGotten, false);
}

/**
 * @async
 * @param { string } path 
 * @returns { Promise<boolean> }
 */
async function EntryRun(baseURL, baseScriptURL, baseWebsiteScriptURL, branch) {
    // const EntryRun = async (path) => {
    'use strict';

    debugger;

    if (!(await WolfermusWaitForLibrary("StorageManager"))) return false;

    if (WolfermusCheckModuleLoaded("YouTubeQOLRemoveVideoTypes")) return;
    const removeVideoTypesModule = WolfermusGetModule("YouTubeQOLRemoveVideoTypes", true);
    if (!removeVideoTypesModule) return false;

    const storageManagerLibrary = WolfermusGetLibrary("StorageManager");
    if (!storageManagerLibrary) return false;

    GetValue = storageManagerLibrary["GetValue"];
    AddValueChangeListener = storageManagerLibrary["AddValueChangeListener"];

    if (!SetupYTDApp()) return false;
    await SetupEvents();

    removeVideoTypesModule.Loaded = true;

    console.log("\nWolfermus UserScripts: Youtube Remove Video Types: Loaded!\n");
    return true;
};

// Uncomment below if running in console.
// EntryRun("");