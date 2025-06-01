async () => {
    if (window.location.href !== "https://www.youtube.com") return;

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

    const bypassScriptPolicy = trustedTypes.createPolicy("bypassScript", {
        createHTML: (string) => string,
        createScript: (string) => string,
        createScriptURL: (string) => string
    });

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

    console.log("WolfermusMainMenu Test Loading...");

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
     * Add/Set a Menu Item to Main Menu
     * 
     * @type {(itemName: string, callback: () => void) => void}
     */
    const SetMenuItem = mainWindow["Wolfermus"]["Libraries"]["MainMenu"]["SetMenuItem"];

    const GUIGotten = await GetValue("CSSToggles", "{}");
    let WolfermusCSSTogglesSettings = JSON.parse(GUIGotten);

    if (WolfermusCSSTogglesSettings["FrostedGlass"] === undefined || WolfermusCSSTogglesSettings["FrostedGlass"] === null) {
        WolfermusCSSTogglesSettings["FrostedGlass"] = false;
    }

    let ChangeFrostedGlassStyle;
    let RestoreFrostedGlassBackgroundColor;

    // async function LoadChangeFrostedGlassStyle() {
    //     if (ChangeFrostedGlassStyle !== undefined && ChangeFrostedGlassStyle !== null) {
    //         return;
    //     }
    //     const script = bypassScriptPolicy.createScript(await MakeGetRequest("https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/main/Scripts/Youtube/CSSToggles/ChangeFrostedGlassStyle.js"));
    //     ChangeFrostedGlassStyle = eval(script);
    // }

    // async function LoadRestoreFrostedGlassBackgroundColor() {
    //     if (RestoreFrostedGlassBackgroundColor !== undefined && RestoreFrostedGlassBackgroundColor !== null) {
    //         return;
    //     }
    //     const script = bypassScriptPolicy.createScript(await MakeGetRequest("https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/main/Scripts/Youtube/CSSToggles/RestoreFrostedGlassBackgroundColor.js"));
    //     RestoreFrostedGlassBackgroundColor = eval(script);
    // }

    // async function AttemptLoadChangeFrostedGlassStyle() {
    //     await Sleep(100);
    //     LoadChangeFrostedGlassStyle().then(async () => {
    //         return await ChangeFrostedGlassStyle();
    //     }).catch(AttemptLoadChangeFrostedGlassStyle);
    // }

    // async function AttemptRestoreFrostedGlassBackgroundColor() {
    //     await Sleep(100);
    //     LoadRestoreFrostedGlassBackgroundColor().then(async () => {
    //         return await RestoreFrostedGlassBackgroundColor();
    //     }).catch(AttemptRestoreFrostedGlassBackgroundColor);
    // }

    // if (WolfermusCSSTogglesSettings["FrostedGlass"]) {
    //     await AttemptLoadChangeFrostedGlassStyle();
    // }

    // SetMenuItem("Main Page Scroll Frosted Glass", async () => {
    //     WolfermusCSSTogglesSettings["FrostedGlass"] = !WolfermusCSSTogglesSettings["FrostedGlass"];

    //     if (WolfermusCSSTogglesSettings["FrostedGlass"]) {
    //         await AttemptLoadChangeFrostedGlassStyle();
    //     } else {
    //         await AttemptRestoreFrostedGlassBackgroundColor();
    //     }

    //     SetValue("CSSToggles", JSON.stringify(WolfermusCSSTogglesSettings));
    // });
};