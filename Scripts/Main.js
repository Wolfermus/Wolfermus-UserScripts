async () => {
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

    /**
     * @param {number | undefined} ms
     */
    function Sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        });
    }

    //debugger;

    const bypassScriptPolicyScripts = trustedTypes.createPolicy("bypassScriptScripts", {
        createScript: (string) => string,
        createScriptURL: (string) => string
    });

    async function LoadScript(name) {
        //console.log("Scripts/Youtube/Main.js - 3");
        const script = bypassScriptPolicyScripts.createScript(await MakeGetRequest(`https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/main/Scripts/${name}/Main.js`));
        return eval(script)();
    }

    let wolfermusPreventLoopLock1 = 10;

    async function AttemptLoadScript() {
        //console.log("Scripts/Youtube/Main.js - 2");
        await LoadScript("Youtube").catch(async (error) => {
            //debugger;
            //console.log("Scripts/Youtube/Main.js - ERROR");
            //console.log(error);
            if (wolfermusPreventLoopLock1 <= 0) return;
            wolfermusPreventLoopLock1--;
            await Sleep(500);
            await AttemptLoadScript();
        });
    }
    //console.log("Scripts/Youtube/Main.js - 1");
    await AttemptLoadScript();
    //console.log("Scripts/Youtube/Main.js - 4");

    if (wolfermusPreventLoopLock1 <= 0) return;

    console.log("Wolfermus Loaded Scripts/Youtube/Main.js");
};