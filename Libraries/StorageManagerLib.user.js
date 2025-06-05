// ==UserScript==
// @name         Wolfermus Storage Manager Library
// @namespace    https://greasyfork.org/en/users/900467-feb199
// @version      1.0.2
// @description  This script is a storage manager that manages storage between local and GM
// @author       Feb199/Dannysmoka
// @homepageURL  https://github.com/Wolfermus/Wolfermus-UserScripts
// @supportURL   https://github.com/Wolfermus/Wolfermus-UserScripts/issues
// @license      GPLv3
// @noframes
// @match        *
// @match        *://*/*
// @match        http://*/*
// @match        https://*/*
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM_setValue
// @grant        GM.setValue
// @grant        GM_addValueChangeListener
// @grant        GM.addValueChangeListener
// @grant        GM_notification
// @grant        GM.notification
// @icon         https://i.imgur.com/XFeWfV0.png
// ==/UserScript== 

// TODO: Run at start

(async () => {
    /**
     * @param {number | undefined} ms
     */
    function Sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
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

    console.log("Wolfermus Storage Manager Library Loading...");

    let wlfLogoNormal = "https://i.imgur.com/nUWGXp0.png";
    let wlfLogoRounded = "https://i.imgur.com/XFeWfV0.png";

    if (!mainWindow["Wolfermus"]) mainWindow["Wolfermus"] = {};

    if (!mainWindow["Wolfermus"]["Logo"]) { // TODO: Extract to WolfermusLogoLib.user.js
        mainWindow["Wolfermus"]["Logo"] = {
            "Normal": wlfLogoNormal,
            "Rounded": wlfLogoRounded
        }
    }

    if (WolfermusCheckLibraryLoaded("StorageManager")) return;

    if (!mainWindow["Wolfermus"]["Libraries"]) mainWindow["Wolfermus"]["Libraries"] = {};


    let IsGMSetValue1 = false;
    // @ts-ignore
    if (typeof GM_setValue !== "undefined" && typeof GM_setValue !== "null" && GM_setValue) IsGMSetValue1 = true;

    let IsGMSetValue2 = false;
    // @ts-ignore
    if (typeof GM !== "undefined" && typeof GM.setValue !== "undefined") IsGMSetValue2 = true;

    let IsGMSetValue = false;
    if (IsGMSetValue1 || IsGMSetValue2) IsGMSetValue = true;


    let IsGMGetValue1 = false;
    // @ts-ignore
    if (typeof GM_getValue !== "undefined" && typeof GM_getValue !== "null" && GM_getValue) IsGMGetValue1 = true;

    let IsGMGetValue2 = false;
    // @ts-ignore
    if (typeof GM !== "undefined" && typeof GM.getValue !== "undefined") IsGMGetValue2 = true;

    let IsGMGetValue = false;
    if (IsGMGetValue1 || IsGMGetValue2) IsGMGetValue = true;


    let IsGMAddValueChangeListener1 = false;
    // @ts-ignore
    if (typeof GM_addValueChangeListener !== "undefined" && typeof GM_addValueChangeListener !== "null" && GM_addValueChangeListener) IsGMAddValueChangeListener1 = true;

    let IsGMAddValueChangeListener2 = false;
    // @ts-ignore
    if (typeof GM !== "undefined" && typeof GM.addValueChangeListener !== "undefined") IsGMAddValueChangeListener2 = true;

    let IsGMAddValueChangeListener = false;
    if (IsGMAddValueChangeListener1 || IsGMAddValueChangeListener2) IsGMAddValueChangeListener = true;


    let IsGMRemoveValueChangeListener1 = false;
    // @ts-ignore
    if (typeof GM_removeValueChangeListener !== "undefined" && typeof GM_removeValueChangeListener !== "null" && GM_removeValueChangeListener) IsGMRemoveValueChangeListener1 = true;

    let IsGMRemoveValueChangeListener2 = false;
    // @ts-ignore
    if (typeof GM !== "undefined" && typeof GM.removeValueChangeListener !== "undefined") IsGMRemoveValueChangeListener2 = true;

    let IsGMRemoveValueChangeListener = false;
    if (IsGMRemoveValueChangeListener1 || IsGMRemoveValueChangeListener2) IsGMRemoveValueChangeListener = true;


    let IsGMNotification1 = false;
    // @ts-ignore
    if (typeof GM_notification !== "undefined" && typeof GM_notification !== "null" && GM_notification) IsGMNotification1 = true;

    let IsGMNotification2 = false;
    // @ts-ignore
    if (typeof GM !== "undefined" && typeof GM.notification !== "undefined") IsGMNotification2 = true;

    let IsGMNotification = false;
    if (IsGMNotification1 || IsGMNotification2) IsGMNotification = true;

    let IsAdGuardSet = false;
    // @ts-ignore
    if (IsGMSetValue && !IsGMAddValueChangeListener && GM && GM.info && GM.info.scriptHandler && GM.info.scriptHandler.toLowerCase() === "adguard") IsAdGuardSet = true;
    let IsAdGuardGet = false;
    // @ts-ignore
    if (IsGMGetValue && !IsGMAddValueChangeListener && GM && GM.info && GM.info.scriptHandler && GM.info.scriptHandler.toLowerCase() === "adguard") IsAdGuardGet = true;

    let wlfShouldValueChangeListeners = true; // TODO: Use
    let wlfValueChangeListeners = {};


    /**
     *  The available options include:
     * - text: A string containing the message to display in the notification.
     * - title: The title of the notification.
     * - image: The URL of an image to display in the notification.
     * - highlight: A boolean flag whether to highlight the tab that sends the notfication (required unless text is set)
     * - silent: A boolean flag whether to not play a sound
     * - timeout: The time, in milliseconds, after which the notification should automatically close.
     * - onclick: A callback function that will be called when the user clicks on the notification.
     * - ondone: A callback function that will be called when the notification is closed (no matter if this was triggered by a timeout or a click) or the tab was highlighted
     * 
     * @param { object } details
     * @returns
     */
    async function Notify(details) { // TODO: Move its own file its unrelated to storage
        console.log("Notify Start");
        if (IsGMNotification) {
            // @ts-ignore
            if (IsGMNotification2) {
                console.log("notification2");
                // @ts-ignore
                await GM.notification(
                    details.text,
                    details.title,
                    details.image,
                    details.onclick,
                    details.ondone,
                    details.highlight,
                    details.silent,
                    details.timeout
                );
            } else if (IsGMNotification1) {
                console.log("notification1");
                // @ts-ignore
                await GM_notification(
                    details.text,
                    details.title,
                    details.image,
                    details.onclick,
                    details.ondone,
                    details.highlight,
                    details.silent,
                    details.timeout
                );
            } else {
                let IsGMNotificationErrorMsg = "ERROR: IsGMNotification is true but IsGMNotification1 and IsGMNotification2 is false.";
                alert(IsGMNotificationErrorMsg);
            }
        } else {
            console.log("Notify Else");
            await alert(`${details.title}\n${details.text}`);
            if (details.onclick) details.onclick();
        }
        console.log("Notify End");
    }

    /**
     * @async
     * @param { string } key
     * @param { any } value
     */
    async function SetValue(key, value) {
        if (IsGMSetValue && IsGMGetValue) {
            // @ts-ignore
            if (IsAdGuardSet) { // TODO: Test removing this
                // @ts-ignore
                await GM.setValue(key, value);
                localStorage[`Wolfermus${key}`] = await value;
            } else if (IsGMSetValue2) {
                // @ts-ignore
                await GM.setValue(key, value);
                localStorage.removeItem(`Wolfermus${key}`);
            } else if (IsGMSetValue1) {
                // @ts-ignore
                await GM_setValue(key, value);
                localStorage.removeItem(`Wolfermus${key}`);
            } else {
                Notify({
                    title: "Error",
                    text: "IsGMSetValue is true but IsGMSetValue1 and IsGMSetValue2 is false.\nFalling back to localStorage",
                    image: wlfLogoRounded
                });
                localStorage[`Wolfermus${key}`] = await value;
            }
        } else {
            localStorage[`Wolfermus${key}`] = await value;
        }
    }

    /**
     * @async
     * @param {string} key
     * @param {any} defaultValue
     * @returns {Promise<any | undefined | null>}
     */
    async function GetValue(key, defaultValue = undefined) {
        let retrievedValue;
        if (IsGMGetValue && IsGMSetValue) {
            // @ts-ignore
            if (IsAdGuardGet) { // TODO: Test removing this
                // @ts-ignore
                retrievedValue = await localStorage[`Wolfermus${key}`];
                if (retrievedValue == undefined && defaultValue) retrievedValue = await defaultValue;
            } else if (IsGMGetValue2) {
                // @ts-ignore
                retrievedValue = await GM.getValue(key, defaultValue);
                localStorage.removeItem(`Wolfermus${key}`);
            } else if (IsGMGetValue1) {
                // @ts-ignore
                retrievedValue = await GM_getValue(key, defaultValue);
                localStorage.removeItem(`Wolfermus${key}`);
            } else {
                Notify({
                    title: "Error",
                    text: "IsGMGetValue is true but IsGMGetValue1 and IsGMGetValue2 is false.\nFalling back to localStorage",
                    image: wlfLogoRounded
                });
                retrievedValue = await localStorage[`Wolfermus${key}`];
                if (retrievedValue == undefined && defaultValue) retrievedValue = await defaultValue;
            }
        } else {
            retrievedValue = await localStorage[`Wolfermus${key}`];
            if (retrievedValue == undefined && defaultValue) retrievedValue = await defaultValue;
        }
        return retrievedValue;
    }

    setInterval(async () => {
        if (Object.keys(wlfValueChangeListeners).length <= 0) return;

        for (const listenerId in wlfValueChangeListeners) {
            if (!wlfValueChangeListeners[listenerId].handledByGM && wlfValueChangeListeners[listenerId].callback !== null) {
                const key = wlfValueChangeListeners[listenerId].key;
                const oldValue = wlfValueChangeListeners[listenerId].oldValue;
                const newValue = await GetValue(key, wlfValueChangeListeners[listenerId].oldValue);

                if (oldValue !== newValue) {
                    wlfValueChangeListeners[listenerId].oldValue = newValue;
                    await wlfValueChangeListeners[listenerId].callback(key, oldValue, newValue, true);
                }
            }
        }
    }, 500);

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
     * @param {string} key
     * @param {(key: string, oldValue: any, newValue: any, remote: boolean) => void} callback
     * @returns {Promise<number>}
     */
    async function AddValueChangeListener(key, callback) {
        let oldValue = await GetValue("key");

        let listener = {
            "key": key,
            "oldValue": oldValue,
            "callback": callback,
            "handledByGM": false
        };
        let listenerId;
        if (IsGMAddValueChangeListener) {
            // @ts-ignore
            if (IsGMAddValueChangeListener2) {
                // @ts-ignore
                listenerId = await GM.addValueChangeListener(key, listener.callback);
                listener.handledByGM = true;
            } else if (IsGMAddValueChangeListener1) {
                // @ts-ignore
                listenerId = await GM_addValueChangeListener(key, listener.callback);
                listener.handledByGM = true;
            } else {
                Notify({
                    title: "Error",
                    text: "IsGMAddValueChangeListener is true but IsGMAddValueChangeListener1 and IsGMAddValueChangeListener2 is false\nFalling back to localHandler",
                    image: wlfLogoRounded
                });
                listenerId = Object.keys(wlfValueChangeListeners).length;
            }
        } else {
            listenerId = Object.keys(wlfValueChangeListeners).length;
        }

        if (listenerId !== undefined && listenerId !== null) wlfValueChangeListeners[listenerId] = listener;
        return listenerId;
    }

    /**
     * Removes a listener for changes to the value of a specific key in the userscript's storage.
     * 
     * @param {number} listenerId
     */
    async function RemoveValueChangeListener(listenerId) {
        if (listenerId === undefined || listenerId === null || !wlfValueChangeListeners[listenerId]) {
            await Notify({
                title: "Error",
                text: "listenerId is invalid",
                image: wlfLogoRounded
            });

            return;
        }

        if (IsGMRemoveValueChangeListener) {
            // @ts-ignore
            if (IsGMRemoveValueChangeListener2) {
                // @ts-ignore
                await GM.removeValueChangeListener(listenerId);
            } else if (IsGMRemoveValueChangeListener1) {
                // @ts-ignore
                await GM_removeValueChangeListener(listenerId);
            } else {
                await Notify({
                    title: "Error",
                    text: "IsGMRemoveValueChangeListener is true but IsGMRemoveValueChangeListener1 and IsGMRemoveValueChangeListener2 is false\nFalling back to localHandler",
                    image: wlfLogoRounded
                });
            }
        }

        wlfValueChangeListeners[listenerId].callback = null;
    }


    mainWindow["Wolfermus"]["Libraries"]["StorageManager"] = {};

    mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["Loaded"] = false;

    mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["Notify"] = Notify;
    mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["SetValue"] = SetValue;
    mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["GetValue"] = GetValue;
    mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["AddValueChangeListener"] = AddValueChangeListener;
    mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["RemoveValueChangeListener"] = RemoveValueChangeListener;

    mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["Loaded"] = true;
})();