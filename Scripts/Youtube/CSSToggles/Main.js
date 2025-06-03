async () => {
    //debugger;
    if (window.location.href !== "https://www.youtube.com/") return;

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
        const message = "Wolfermus ERROR: Youtube CSSToggles - Unexpected Error";
        alert(message);
        console.log(message);
        return;
    }
    if (ChosenXmlHttpRequest === undefined || ChosenXmlHttpRequest === null) {
        const message = "Wolfermus ERROR: Youtube CSSToggles - Unexpected Error";
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
            await Sleep(500);

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
            await Sleep(500);

            if (wolfermusAntiStuckLoop1 < 0) {
                alert("ERROR: antiStuckLoop engaged");
                return;
            }
            wolfermusAntiStuckLoop1--;
        }
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

    {
        let wolfermusLoadLoopCounter = 0;
        while (!WolfermusCheckLibraryLoaded("StorageManager")) {
            await Sleep(500);

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
            await Sleep(500);

            if (wolfermusLoadLoopCounter >= 100) {
                alert("ERROR: antiStuckLoop engaged");
                return;
            }
            wolfermusLoadLoopCounter++;
        }
    }

    console.log("Wolfermus - Adding CSSToggles");

    /**
     * @async
     * @type {(key: string, value: any) => void}
     */
    const SetValue = mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["SetValue"];

    /**
     * @async
     * @type {(key: string, defaultValue: any) => Promise<any | undefined | null>}
     */
    const GetValue = mainWindow["Wolfermus"]["Libraries"]["StorageManager"]["GetValue"];

    /**
     * @import {WolfermusMenuItem} from "../Libraries/MainMenuLib.user.js"
     */

    /**
     * @type {WolfermusMenuItem}
     */
    const WolfermusMenuItemClass = mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["WolfermusMenuItem"];

    /**
     * Add/Set a Menu Item to Main Menu
     * 
     * @type {(item: WolfermusMenuItem) => void}
     */
    const SetMenuItem = mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["SetMenuItem"];

    const GUIGotten = await GetValue("CSSToggles", "{}");
    let WolfermusCSSTogglesSettings = JSON.parse(GUIGotten);

    if (WolfermusCSSTogglesSettings["FrostedGlass"] === undefined || WolfermusCSSTogglesSettings["FrostedGlass"] === null) {
        WolfermusCSSTogglesSettings["FrostedGlass"] = false;
    }

    let ChangeFrostedGlassStyle;
    let RestoreFrostedGlassBackgroundColor;

    async function LoadChangeFrostedGlassStyle() {
        if (ChangeFrostedGlassStyle !== undefined && ChangeFrostedGlassStyle !== null) {
            return;
        }
        const bypassScriptPolicy = trustedTypes.createPolicy("bypassScriptChangeFrostedGlassStyle", {
            createScript: (string) => string,
            createScriptURL: (string) => string
        });

        const script = bypassScriptPolicy.createScript(await MakeGetRequest("https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/main/Scripts/Youtube/CSSToggles/ChangeFrostedGlassStyle.js"));
        ChangeFrostedGlassStyle = eval(script);
    }

    async function LoadRestoreFrostedGlassBackgroundColor() {
        if (RestoreFrostedGlassBackgroundColor !== undefined && RestoreFrostedGlassBackgroundColor !== null) {
            return;
        }
        const bypassScriptPolicy = trustedTypes.createPolicy("bypassScriptRestoreFrostedGlassBackgroundColor", {
            createScript: (string) => string,
            createScriptURL: (string) => string
        });

        const script = bypassScriptPolicy.createScript(await MakeGetRequest("https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/main/Scripts/Youtube/CSSToggles/RestoreFrostedGlassBackgroundColor.js"));
        RestoreFrostedGlassBackgroundColor = eval(script);
    }

    let wolfermusPreventLoopLock1 = 10;

    async function AttemptLoadChangeFrostedGlassStyle() {
        await Sleep(100);
        await LoadChangeFrostedGlassStyle().then(async () => {
            wolfermusPreventLoopLock1 = 10;
            await ChangeFrostedGlassStyle();
        }).catch(async (error) => {
            //debugger;
            //console.log("CSSToggles - AttemptLoadChangeFrostedGlassStyle - ERROR");
            //console.log(error);
            if (wolfermusPreventLoopLock1 <= 0) return;
            wolfermusPreventLoopLock1--;
            await AttemptLoadChangeFrostedGlassStyle();
        });
    }

    let wolfermusPreventLoopLock2 = 10;

    async function AttemptRestoreFrostedGlassBackgroundColor() {
        await Sleep(100);
        await LoadRestoreFrostedGlassBackgroundColor().then(async () => {
            wolfermusPreventLoopLock2 = 10;
            await RestoreFrostedGlassBackgroundColor();
        }).catch(async (error) => {
            //debugger;
            //console.log("CSSToggles - AttemptRestoreFrostedGlassBackgroundColor - ERROR");
            //console.log(error);
            if (wolfermusPreventLoopLock2 <= 0) return;
            wolfermusPreventLoopLock2--;
            await AttemptRestoreFrostedGlassBackgroundColor();
        });
    }


    //debugger;

    if (WolfermusCSSTogglesSettings["FrostedGlass"]) {
        await AttemptLoadChangeFrostedGlassStyle();
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

    SetMenuItem(ToggleFrostedGlassMenuItem);
};