async (path) => {
    const ValidYTDItems = ["ytd-rich-item-renderer", "ytd-video-renderer", "yt-lockup-view-model"];


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



    let removeVideoTypesStyle = document.getElementById("WolfermusScriptRemoveVideoTypesStyle");

    if (removeVideoTypesStyle === undefined || removeVideoTypesStyle === null) {
        removeVideoTypesStyle = document.createElement("style");
        removeVideoTypesStyle.id = "WolfermusScriptRemoveVideoTypesStyle";
        document.head.append(removeVideoTypesStyle);
    }

    // const editedInnerHTML = wolfermusBypassScriptPolicy.createHTML(`
    const editedInnerHTML = `
        .WolfermusHideVideo {
            background: green;
            //display: none;
        }
        `;

    removeVideoTypesStyle.innerHTML = editedInnerHTML;



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

    let RemoveVideoTypesIsActive = RemoveVideoTypesSettings.Active;
    let RemoveVideoTypesSearchSelector = GetSearchSelector(YoutubeGotten);

    let findVideoElementTagStats = {};
    let findVideoAmountStats = {};

    /**
     * @param {HTMLElement} node
     * @returns {Element | undefined}
     */
    function FindVideo(node) {
        let foundItem = undefined;

        for (const validItem of ValidYTDItems) {
            foundItem = node.closest(validItem);
            if (foundItem && foundItem !== undefined && foundItem !== null) break;
        }
        if (!foundItem || foundItem === undefined || foundItem === null) return undefined;

        return foundItem;
    }

    const observeVideosConfig = { childList: true, subtree: true, attributes: false, characterData: false };
    const observeVideos = new MutationObserver(async (mutations) => {
        if (removeVideoTypesModule.disabled) return;
        if (!RemoveVideoTypesIsActive) return;
        if (!RemoveVideoTypesSearchSelector) return;

        for (const record of mutations) {
            if (record.addedNodes.length > 0) {
                for (let node of record.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;

                    let foundItem = FindVideo(node);
                    if (foundItem === undefined) continue;

                    let videoID = undefined;
                    if (foundItem?.data?.content?.videoRenderer?.videoId) videoID = foundItem.data.content.videoRenderer.videoId;
                    else if (foundItem?.data?.content?.lockupViewModel?.contentId) videoID = foundItem.data.content.lockupViewModel.contentId;
                    else {
                        debugger;
                        return undefined;
                    }

                    let group = "Removed";
                    const foundElements = foundItem.querySelectorAll(RemoveVideoTypesSearchSelector);
                    if (foundElements.length > 0) {
                        group = "Added";
                    }

                    if (!findVideoElementTagStats[videoID]) findVideoElementTagStats[videoID] = {};
                    if (!findVideoElementTagStats[videoID][group]) findVideoElementTagStats[videoID][group] = {};
                    if (!findVideoElementTagStats[videoID][group][node.tagName]) findVideoElementTagStats[videoID][group][node.tagName] = 0;
                    findVideoElementTagStats[videoID][group][node.tagName]++;

                    CheckVideo(foundItem, RemoveVideoTypesSearchSelector, false);
                }
            }
            if (!(record.target instanceof HTMLElement)) continue;

            let foundItem = FindVideo(record.target);
            if (foundItem === undefined) continue;

            let videoID = undefined;
            if (foundItem?.data?.content?.videoRenderer?.videoId) videoID = foundItem.data.content.videoRenderer.videoId;
            else if (foundItem?.data?.content?.lockupViewModel?.contentId) videoID = foundItem.data.content.lockupViewModel.contentId;
            else {
                debugger;
                return undefined;
            }

            let group = "Removed";
            const foundElements = foundItem.querySelectorAll(RemoveVideoTypesSearchSelector);
            if (foundElements.length > 0) {
                group = "Added";
            }

            if (!findVideoElementTagStats[videoID]) findVideoElementTagStats[videoID] = {};
            if (!findVideoElementTagStats[videoID][group]) findVideoElementTagStats[videoID][group] = {};
            if (!findVideoElementTagStats[videoID][group][node.tagName]) findVideoElementTagStats[videoID][group][node.tagName] = 0;
            findVideoElementTagStats[videoID][group][node.tagName]++;

            CheckVideo(foundItem, RemoveVideoTypesSearchSelector, false);
        }
    });

    /**
     * @param {HTMLElement} videoElement
     * @param {boolean} [shouldObserveItem=true] 
     */
    function HideVideo(videoElement, shouldObserveItem = true) {
        if (videoElement.classList.contains("WolfermusHideVideo")) return;

        videoElement.classList.add("WolfermusHideVideo");

        let videoID = undefined;
        if (videoElement?.data?.content?.videoRenderer?.videoId) videoID = videoElement.data.content.videoRenderer.videoId;
        else if (videoElement?.data?.content?.lockupViewModel?.contentId) videoID = videoElement.data.content.lockupViewModel.contentId;
        else {
            debugger;
            return undefined;
        }
        if (!findVideoAmountStats[videoID]) findVideoAmountStats[videoID] = {};
        if (!findVideoAmountStats[videoID]["Added"]) findVideoAmountStats[videoID]["Added"] = 0;
        findVideoAmountStats[videoID]["Added"]++;

        if (shouldObserveItem) {
            observeVideos.observe(videoElement, observeVideosConfig);
        }
    }

    /**
     * @param {HTMLElement} videoElement
     */
    function UnHideVideo(videoElement) {
        if (!videoElement.classList.contains("WolfermusHideVideo")) return;

        let videoID = undefined;
        if (videoElement?.data?.content?.videoRenderer?.videoId) videoID = videoElement.data.content.videoRenderer.videoId;
        else if (videoElement?.data?.content?.lockupViewModel?.contentId) videoID = videoElement.data.content.lockupViewModel.contentId;
        else {
            debugger;
            return undefined;
        }
        if (!findVideoAmountStats[videoID]) findVideoAmountStats[videoID] = {};
        if (!findVideoAmountStats[videoID]["Removed"]) findVideoAmountStats[videoID]["Removed"] = 0;
        findVideoAmountStats[videoID]["Removed"]++;

        videoElement.classList.remove("WolfermusHideVideo");
    }

    /**
     * @param {HTMLElement} videoElement
     * @param {String} searchSelector
     * @param {boolean} [shouldObserveItem=true]
     * @param {boolean} [shouldUnHideFalse=false]
     */
    function CheckVideo(videoElement, searchSelector, shouldObserveItem = true) {
        const foundElements = videoElement.querySelectorAll(searchSelector);
        if (foundElements.length > 0) {
            HideVideo(videoElement, shouldObserveItem);
        } else UnHideVideo(videoElement);
    }

    /**
     * @param {HTMLElement} node
     * @param {boolean} [shouldObserveItem=true] 
     */
    function HideNode(node, shouldObserveItem = true) {
        let foundItem = FindVideo(node);
        if (foundItem === undefined) return;

        let videoID = undefined;
        if (foundItem?.data?.content?.videoRenderer?.videoId) videoID = foundItem.data.content.videoRenderer.videoId;
        else if (foundItem?.data?.content?.lockupViewModel?.contentId) videoID = foundItem.data.content.lockupViewModel.contentId;
        else {
            debugger;
            return undefined;
        }

        let group = "Added";

        if (!findVideoElementTagStats[videoID]) findVideoElementTagStats[videoID] = {};
        if (!findVideoElementTagStats[videoID][group]) findVideoElementTagStats[videoID][group] = {};
        if (!findVideoElementTagStats[videoID][group][node.tagName]) findVideoElementTagStats[videoID][group][node.tagName] = 0;
        findVideoElementTagStats[videoID][group][node.tagName]++;

        HideVideo(foundItem, shouldObserveItem);
    }

    /**
     * @param {HTMLElement} node
     */
    function UnHideNode(node) {
        let foundItem = FindVideo(node);
        if (foundItem === undefined) return;

        UnHideVideo(foundItem);
    }

    /**
     * @param {HTMLElement} node
     * @param {String} searchSelector
     * @param {boolean} [shouldObserveItem=true]
     * @param {boolean} [shouldUnHideFalse=false]
     */
    function CheckNode(node, searchSelector, shouldObserveItem = true) {
        if (node.matches(searchSelector)) {
            HideNode(node, shouldObserveItem);
        }
    }

    function CheckAllNodes() {
        if (removeVideoTypesModule.disabled) return;
        if (!RemoveVideoTypesIsActive) return;
        if (!RemoveVideoTypesSearchSelector) return;

        const ytdBrowses = document.querySelectorAll("ytd-browse");
        if (ytdBrowses.length <= 0) return;

        for (const ytdBrowse of ytdBrowses) {
            const ytdBrowseStyle = window.getComputedStyle(ytdBrowse);
            if (ytdBrowseStyle.display === "none") continue;

            const nodes = ytdBrowse.querySelectorAll(RemoveVideoTypesSearchSelector);
            for (let node of nodes) {
                HideNode(node);
            }
        }
    }

    function UnDoAllNodes() {
        observeVideos.disconnect();
        let nodesHidden = document.querySelectorAll(".WolfermusHideVideo");
        for (let node of nodesHidden) {
            node.classList.remove("WolfermusHideVideo");
        }
    }

    await AddValueChangeListener("YoutubeQOL", (key, oldValue, newValue, remote) => {
        RemoveVideoTypesIsActive = IsActive(newValue);
        RemoveVideoTypesSearchSelector = GetSearchSelector(newValue);

        removeVideoTypesModule.disabled ??= false;
        removeVideoTypesModule.disabledDone0 ??= false;

        UnDoAllNodes();
        if (!RemoveVideoTypesIsActive || removeVideoTypesModule.disabled) {
            if (removeVideoTypesModule.disabled) {
                if (removeVideoTypesModule.disabledDone0) return;
                removeVideoTypesModule.disabledDone0 = true;
            }
            return;
        }
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", async () => {
                CheckAllNodes();
            }, { once: true });
        } else {
            CheckAllNodes();
        }
    });

    const observeConfig = { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] };
    const observeElements = new MutationObserver(async (mutations) => {
        removeVideoTypesModule.disabled ??= false;
        if (removeVideoTypesModule.disabled) return;
        if (!RemoveVideoTypesIsActive) return;
        if (!RemoveVideoTypesSearchSelector) return;

        for (const record of mutations) {
            if (record.addedNodes.length > 0) {
                for (let node of record.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;

                    CheckNode(node, RemoveVideoTypesSearchSelector);
                }
            }

            if (!(record.target instanceof HTMLElement)) continue;
            CheckNode(record.target, RemoveVideoTypesSearchSelector);
        }
    });

    let oldHref = undefined;
    const observeUrlChange = async () => {
        window.addEventListener("yt-navigate-finish", async () => {
            if (oldHref === document.location.href) return;

            observeElements.disconnect();

            console.log("findVideoElementTagStats:");
            console.log(findVideoElementTagStats);
            console.log(findVideoAmountStats);
            findVideoElementTagStats = {};
            findVideoAmountStats = {};

            UnDoAllNodes();

            if (oldHref !== undefined) {
                console.log(`Wolfermus UserScripts: Youtube Remove Video Types: href changed, document.readyState: ${document.readyState}`);
            }

            oldHref = document.location.href;

            const ytdBrowses = document.querySelectorAll("ytd-browse");
            if (ytdBrowses.length <= 0) return;

            for (const ytdBrowse of ytdBrowses) {
                const ytdBrowseStyle = window.getComputedStyle(ytdBrowse);
                if (ytdBrowseStyle.display === "none") continue;

                observeElements.observe(ytdBrowse, observeConfig);
            }

            CheckAllNodes();
        });
    };

    removeVideoTypesModule.disabled ??= false;
    removeVideoTypesModule.disabledDone ??= false;

    await observeUrlChange();

    if (RemoveVideoTypesSettings.Active && !removeVideoTypesModule.disabled) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", async () => {
                CheckAllNodes();
            }, { once: true });
        } else {
            CheckAllNodes();
        }
    }

    removeVideoTypesModule.Loaded = true;

    console.log("\nWolfermus UserScripts: Youtube Remove Video Types: Loaded!\n");
};