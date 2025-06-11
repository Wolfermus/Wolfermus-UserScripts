async (path) => {
    //debugger;
    //if (window.location.href !== "https://www.youtube.com/") return;

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
        const message = "Wolfermus ERROR: Youtube CSSToggles - Please run in a userscript manager";
        console.error(message);
        throw new Error(message);
    }

    let ChosenXmlHttpRequest;
    if (IsGMXmlHttpRequest2) {
        ChosenXmlHttpRequest = GM.xmlHttpRequest;
    } else if (IsGMXmlHttpRequest1) {
        ChosenXmlHttpRequest = GM_xmlHttpRequest;
    } else {
        const message = "Wolfermus ERROR: Youtube CSSToggles - Unexpected Error";
        console.error(message);
        throw new Error(message);
    }
    if (ChosenXmlHttpRequest === undefined || ChosenXmlHttpRequest === null) {
        const message = "Wolfermus ERROR: Youtube CSSToggles - Unexpected Error";
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

    console.log("Wolfermus: Youtube - CSSToggles Running");

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

    {
        let wolfermusAntiStuckLoop1 = 100;
        while (document.readyState !== "complete") {
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

    console.log("Wolfermus - Adding CSSToggles");

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

    /**
     * @type {WolfermusMenuItem}
     */
    //const WolfermusMenuItem = mainMenuLibrary["Classes"]["WolfermusMenuItem"];

    /**
     * @type {WolfermusMenu}
     */
    const WolfermusMenu = mainMenuLibrary["Classes"]["WolfermusMenu"];

    /**
     * @import {WolfermusMenuItem} from "../../../Libraries/MainMenuLib.user.js"
     */

    /**
     * @import {WolfermusMenu} from "../../../Libraries/MainMenuLib.user.js"
     */

    /**
     * Get Main Menu
     *  
     * @type {() => WolfermusMenu}
     */
    const GetMainMenu = mainMenuLibrary["Menus"]["GetMainMenu"];

    const GUIGotten = await GetValue("CSSToggles", "{}");
    let WolfermusCSSTogglesSettings = JSON.parse(GUIGotten);

    if (WolfermusCSSTogglesSettings["FrostedGlass"] === undefined || WolfermusCSSTogglesSettings["FrostedGlass"] === null) {
        WolfermusCSSTogglesSettings["FrostedGlass"] = false;
    }

    let ChangeFrostedGlassStyle;
    let RestoreFrostedGlassBackgroundColor;

    async function LoadChangeFrostedGlassStyle() {
        if (ChangeFrostedGlassStyle !== undefined && ChangeFrostedGlassStyle !== null) return;

        const bypassScriptPolicy = trustedTypes.createPolicy("bypassScriptChangeFrostedGlassStyle", {
            createScript: (string) => string,
            createScriptURL: (string) => string
        });

        const script = bypassScriptPolicy.createScript(await MakeGetRequest(`${path}/CSSToggles/ChangeFrostedGlassStyle.js`));
        ChangeFrostedGlassStyle = eval(script);
    }

    async function LoadRestoreFrostedGlassBackgroundColor() {
        if (RestoreFrostedGlassBackgroundColor !== undefined && RestoreFrostedGlassBackgroundColor !== null) return;

        const bypassScriptPolicy = trustedTypes.createPolicy("bypassScriptRestoreFrostedGlassBackgroundColor", {
            createScript: (string) => string,
            createScriptURL: (string) => string
        });

        const script = bypassScriptPolicy.createScript(await MakeGetRequest(`${path}/CSSToggles/RestoreFrostedGlassBackgroundColor.js`));
        RestoreFrostedGlassBackgroundColor = eval(script);
    }

    let wolfermusPreventLoopLock1 = 10;

    async function AttemptLoadChangeFrostedGlassStyle() {
        await LoadChangeFrostedGlassStyle().then(async () => {
            wolfermusPreventLoopLock1 = 10;
            await ChangeFrostedGlassStyle();
        }).catch(async (error) => {
            //debugger;
            //console.log("CSSToggles - AttemptLoadChangeFrostedGlassStyle - ERROR");
            //console.log(error);
            if (wolfermusPreventLoopLock1 <= 0) return;
            wolfermusPreventLoopLock1--;
            await Sleep(100);
            await AttemptLoadChangeFrostedGlassStyle();
        });
    }

    let wolfermusPreventLoopLock2 = 10;

    async function AttemptRestoreFrostedGlassBackgroundColor() {
        await LoadRestoreFrostedGlassBackgroundColor().then(async () => {
            wolfermusPreventLoopLock2 = 10;
            await RestoreFrostedGlassBackgroundColor();
        }).catch(async (error) => {
            //debugger;
            //console.log("CSSToggles - AttemptRestoreFrostedGlassBackgroundColor - ERROR");
            //console.log(error);
            if (wolfermusPreventLoopLock2 <= 0) return;
            wolfermusPreventLoopLock2--;
            await Sleep(100);
            await AttemptRestoreFrostedGlassBackgroundColor();
        });
    }

    let ToggleFrostedGlassMenuItem = new WolfermusMenuItem("MainPageScrollFrostedGlass", "Toggle Scroll Frosted Glass", "This script toggles the top bar from a frosted transparent\nlook into solid color");
    ToggleFrostedGlassMenuItem.clickCallback = async () => {
        WolfermusCSSTogglesSettings["FrostedGlass"] = !WolfermusCSSTogglesSettings["FrostedGlass"];

        if (WolfermusCSSTogglesSettings["FrostedGlass"]) {
            await AttemptLoadChangeFrostedGlassStyle();
        } else {
            await AttemptRestoreFrostedGlassBackgroundColor();
        }

        SetValue("CSSToggles", JSON.stringify(WolfermusCSSTogglesSettings));
    };
    ToggleFrostedGlassMenuItem.includesUrls = ["*www.youtube.com", "*www.youtube.com/"];

    ToggleFrostedGlassMenuItem.CheckUrls();

    if (WolfermusCSSTogglesSettings["FrostedGlass"] && !ToggleFrostedGlassMenuItem.disabled) {
        debugger;
        await AttemptLoadChangeFrostedGlassStyle();
    }

    const mainMenu = GetMainMenu();

    mainMenu.items.push(ToggleFrostedGlassMenuItem);
};