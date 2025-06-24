async (path) => {
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

    const storageManagerLibrary = WolfermusGetLibrary("StorageManager");

    if (WolfermusCheckModuleLoaded("YouTubeQOLRemoveVideoTypes")) return;
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

    let YoutubeGotten = await GetValue("YoutubeQOL", "{}");
    if (!YoutubeGotten || typeof YoutubeGotten !== "string") YoutubeGotten = "{}";
    let QOLSettings = JSON.parse(YoutubeGotten);
    if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

    if (!QOLSettings["RemoveVideoTypes"]) QOLSettings["RemoveVideoTypes"] = {};
    let RemoveVideoTypesSettings = QOLSettings["RemoveVideoTypes"];

    RemoveVideoTypesSettings.Active ??= false;
    RemoveVideoTypesSettings.Hide ??= {};
    RemoveVideoTypesSettings.Hide.YouWatch ??= false;
    RemoveVideoTypesSettings.Hide.Members ??= false;
    RemoveVideoTypesSettings.Hide.Live ??= false;

    await SetValue("YoutubeQOL", JSON.stringify(QOLSettings));

    /**
     * @param {any | undefined | null} YoutubeGotten
     * @returns {Boolean}
     */
    function IsActive(YoutubeGotten) {
        let QOLSettings = JSON.parse(YoutubeGotten);
        if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

        if (!QOLSettings["RemoveVideoTypes"]) QOLSettings["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettings = QOLSettings["RemoveVideoTypes"];

        RemoveVideoTypesSettings.Active ??= false;

        return RemoveVideoTypesSettings.Active;
    }

    /**
     * @param {any | undefined | null} YoutubeGotten
     * @param {Boolean} [GetFullSearch=false]
     * @returns {String}
     */
    function GetSearchSelector(YoutubeGotten, GetFullSearch = false) {
        let QOLSettings = JSON.parse(YoutubeGotten);
        if (!QOLSettings || typeof QOLSettings !== "object") QOLSettings = {};

        if (!QOLSettings["RemoveVideoTypes"]) QOLSettings["RemoveVideoTypes"] = {};
        let RemoveVideoTypesSettings = QOLSettings["RemoveVideoTypes"];

        RemoveVideoTypesSettings.Active ??= false;
        RemoveVideoTypesSettings.Hide ??= {};
        RemoveVideoTypesSettings.Hide.YouWatch ??= false;
        RemoveVideoTypesSettings.Hide.Members ??= false;
        RemoveVideoTypesSettings.Hide.Live ??= false;

        let searchSelectorArray = [];
        if (RemoveVideoTypesSettings.Hide.YouWatch || GetFullSearch) searchSelectorArray.push(".youwatch-mark");
        if (RemoveVideoTypesSettings.Hide.Members || GetFullSearch) searchSelectorArray.push(".badge-style-type-members-only");
        if (RemoveVideoTypesSettings.Hide.Live || GetFullSearch) searchSelectorArray.push(".badge-style-type-live-now-alternate");

        return searchSelectorArray.join(", ");
    }

    /**
     * @param {HTMLElement} node
     */
    function HideNode(node) {
        let foundItem = node.closest("ytd-rich-item-renderer");
        if (foundItem === undefined || foundItem === null) {
            foundItem = node.closest("ytd-video-renderer");
            if (foundItem === undefined || foundItem === null) {
                foundItem = node.closest("yt-lockup-view-model");
                if (foundItem === undefined || foundItem === null) return;
            }
        }

        foundItem.style["background"] = "green";
        //foundItem.style["display"] = "none";
    }

    /**
     * @param {HTMLElement} node
     */
    function UnHideNode(node) {
        let foundItem = node.closest("ytd-rich-item-renderer");
        if (foundItem === undefined || foundItem === null) {
            foundItem = node.closest("ytd-video-renderer");
            if (foundItem === undefined || foundItem === null) {
                foundItem = node.closest("yt-lockup-view-model");
                if (foundItem === undefined || foundItem === null) return;
            }
        }

        foundItem.style["background"] = "";
        //foundItem.style["display"] = "";
    }

    /**
     * @param {HTMLElement} node
     * @param {String} searchSelector
     */
    function CheckNode(node, searchSelector) {
        if (node.matches(searchSelector)) {
            HideNode(node);
        }
    }

    /**
     * @param {any | undefined | null} YoutubeGotten
     */
    function CheckAllNodes(YoutubeGotten) {
        let ytContentsSections = document.querySelectorAll("#contents.ytd-item-section-renderer");
        if (ytContentsSections.length <= 0) {
            ytContentsSections = document.querySelectorAll("#contents.ytd-rich-grid-renderer");
        }
        if (ytContentsSections.length <= 0) return;

        const searchSelector = GetSearchSelector(YoutubeGotten);
        if (!searchSelector) return;

        for (let ytContents of ytContentsSections) {
            const nodes = ytContents.querySelectorAll(searchSelector);
            for (let node of nodes) {
                HideNode(node);
            }
        }
    }

    /**
     * @param {Boolean} [GetFullSearch=false]
     * @param {any | undefined | null} YoutubeGotten
     */
    function UnDoAllNodes(YoutubeGotten, GetFullSearch = false) {
        let ytContentsSections = document.querySelectorAll("#contents.ytd-item-section-renderer");
        if (ytContentsSections.length <= 0) {
            ytContentsSections = document.querySelectorAll("#contents.ytd-rich-grid-renderer");
        }
        if (ytContentsSections.length <= 0) return;

        const searchSelector = GetSearchSelector(YoutubeGotten, GetFullSearch);
        if (!searchSelector) return;

        for (let ytContents of ytContentsSections) {
            const nodes = ytContents.querySelectorAll(searchSelector);
            for (let node of nodes) {
                UnHideNode(node);
            }
        }
    }

    await AddValueChangeListener("YoutubeQOL", (key, oldValue, newValue, remote) => {
        debugger;

        removeVideoTypesModule.disabled ??= false;
        removeVideoTypesModule.disabledDone ??= false;

        if (!IsActive(newValue) || removeVideoTypesModule.disabled) {
            if (removeVideoTypesModule.disabled) {
                if (removeVideoTypesModule.disabledDone) return;
                removeVideoTypesModule.disabledDone = true;
            }
            UnDoAllNodes(oldValue, true);
            return;
        }
        UnDoAllNodes(oldValue);
        CheckAllNodes(newValue);
    });

    const observeElements = new MutationObserver(async (mutations) => {
        for (const record of mutations) {
            if (record.addedNodes.length > 0) {
                const YoutubeGotten = await GetValue("YoutubeQOL", "{}");
                if (!IsActive(YoutubeGotten)) return;

                removeVideoTypesModule.disabled ??= false;
                removeVideoTypesModule.disabledDone ??= false;

                if (removeVideoTypesModule.disabled) {
                    if (removeVideoTypesModule.disabledDone) return;
                    removeVideoTypesModule.disabledDone = true;
                    UnDoAllNodes(YoutubeGotten, true);
                    return;
                }


                const searchSelector = GetSearchSelector(YoutubeGotten);
                if (!searchSelector) return;

                for (let node of record.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;

                    CheckNode(node, searchSelector);
                }
            }

            if (!(record.target instanceof HTMLElement)) continue;

            const YoutubeGotten = await GetValue("YoutubeQOL", "{}");
            if (!IsActive(YoutubeGotten)) return;

            removeVideoTypesModule.disabled ??= false;
            removeVideoTypesModule.disabledDone ??= false;

            if (removeVideoTypesModule.disabled) {
                if (removeVideoTypesModule.disabledDone) return;
                removeVideoTypesModule.disabledDone = true;
                UnDoAllNodes(YoutubeGotten, true);
                return;
            }

            const searchSelector = GetSearchSelector(YoutubeGotten);
            if (!searchSelector) return;

            CheckNode(record.target, searchSelector);
        }
    });
    observeElements.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    removeVideoTypesModule.disabled ??= false;
    removeVideoTypesModule.disabledDone ??= false;

    if (RemoveVideoTypesSettings.Active && !removeVideoTypesModule.disabled) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", async () => {
                const YoutubeGotten = await GetValue("YoutubeQOL", "{}");
                CheckAllNodes(YoutubeGotten);
            });
        } else {
            CheckAllNodes(YoutubeGotten);
        }
    }

    removeVideoTypesModule.Loaded = true;

    console.log("\nWolfermus UserScripts: Youtube Remove Video Types: Loaded!\n");
};