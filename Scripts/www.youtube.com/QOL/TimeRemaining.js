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

    /**
     * @async
     * @type {(key: string, defaultValue: any) => Promise<any | undefined | null>}
    */
    const GetValue = storageManagerLibrary["GetValue"];


    /**
 * @param {Element | ChildNode} referenceNode
 * @param {Element} newNode
 * @returns {Element | null}
 */
    function InsertAfter(referenceNode, newNode) {
        if (referenceNode.parentNode) {
            return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
        } else {
            // notification({
            //     title: "Warning",
            //     text: "referenceNode dosnt have a parentNode therefore cannot InsertAfter",
            //     image: wlfLogo
            // });
            return null;
        }
    }

    /**
     * @param {Element | ChildNode} referenceNode
     * @param {Element} newNode
     * @returns {Element | null}
     */
    function InsertBefore(referenceNode, newNode) {
        if (referenceNode.parentNode) {
            return referenceNode.parentNode.insertBefore(newNode, referenceNode);
        } else {
            // notification({
            //     title: "Warning",
            //     text: "referenceNode dosnt have a parentNode therefore cannot InsertBefore",
            //     image: wlfLogo
            // });
            return null;
        }
    }

    /**
     * @param {number} nonConvertedSeconds
     * @returns {string}
     */
    function ConvertTimeSecondsToDisplay(nonConvertedSeconds) {
        // console.log(`nonConvertedSeconds: ${nonConvertedSeconds}\n`);

        let secondsRemaining = nonConvertedSeconds % 60;
        // console.log(`secondsRemaining: ${secondsRemaining}\n`);

        let convertedTimeMinutesInSeconds = nonConvertedSeconds - secondsRemaining;
        let minutesConverted = 0;
        if (convertedTimeMinutesInSeconds > 0) minutesConverted = (convertedTimeMinutesInSeconds / 60) % 60;
        // console.log(`convertedTimeMinutesInSeconds: ${convertedTimeMinutesInSeconds}`);
        // console.log(`minutesConverted: ${minutesConverted}\n`);

        let convertedTimeHoursInMinutes = (convertedTimeMinutesInSeconds - (minutesConverted * 60)) / 60;
        let hoursConverted = 0;
        if (convertedTimeHoursInMinutes > 0) hoursConverted = (convertedTimeHoursInMinutes / 60) % 24;
        // console.log(`convertedTimeHoursInMinutes: ${convertedTimeHoursInMinutes}`);
        // console.log(`hoursConverted: ${hoursConverted}\n`);

        let convertedTimeDaysInHours = (convertedTimeHoursInMinutes - (hoursConverted * 60)) / 60;
        let daysConverted = 0;
        if (convertedTimeDaysInHours > 0) daysConverted = convertedTimeDaysInHours / 24;
        // console.log(`convertedTimeDaysInHours: ${convertedTimeDaysInHours}`);
        // console.log(`daysConverted: ${daysConverted}\n`);

        let convertedTimeText = "";
        if (secondsRemaining > 0 || minutesConverted > 0 || hoursConverted > 0 || daysConverted > 0) {
            convertedTimeText = secondsRemaining.toFixed().toString();
        }
        if (minutesConverted > 0 || hoursConverted > 0 || daysConverted > 0) {
            if (secondsRemaining < 9.5) convertedTimeText = `0${convertedTimeText}`;
            convertedTimeText = `${minutesConverted.toFixed().toString()}:${convertedTimeText}`;
        }
        if (hoursConverted > 0 || daysConverted > 0) {
            //if(minutesConverted <= 0) convertedTimeText = `0:${convertedTimeText}`;
            if (minutesConverted < 9.5) convertedTimeText = `0${convertedTimeText}`;
            convertedTimeText = `${hoursConverted.toFixed().toString()}:${convertedTimeText}`;
        }
        if (daysConverted > 0) {
            //if(minutesConverted <= 0 && hoursConverted <= 0) convertedTimeText = `0:${convertedTimeText}`;
            //if(hoursConverted <= 0) convertedTimeText = `0:${convertedTimeText}`;
            if (hoursConverted < 9.5) convertedTimeText = `0${convertedTimeText}`;
            convertedTimeText = `${daysConverted.toFixed().toString()}:${convertedTimeText}`;
        }

        return convertedTimeText;
    }

    var lastRemainingTime;

    /**
     * @returns {string}
     */
    function GetRemainingTimeText() {
        let videoArray = document.getElementsByTagName("video");
        if (videoArray.length <= 0) return;
        let video = videoArray[0];

        if (!video) return;

        const playbackSpeed = video.playbackRate;
        let remainingTimeText = "";

        if (playbackSpeed != 0) {
            let remainingTime = video.duration - video.currentTime;
            if (remainingTime != 0) {
                remainingTime /= playbackSpeed;

                if (remainingTime <= 0 || Number.isNaN(remainingTime)) remainingTime = 0;
                if (lastRemainingTime === remainingTime) return;

                lastRemainingTime = remainingTime;

                remainingTimeText = ConvertTimeSecondsToDisplay(remainingTime);
            }
        } else remainingTimeText = "Inf";

        return remainingTimeText;
    }

    /**
     * @returns {HTMLCollectionOf<Element>}
     */
    function GetTimeRemainingElements() {
        return document.getElementsByClassName("wlfYTTimeRemaining");
    }

    /**
     * @async
     * @returns {{Active: boolean}}
     */
    async function GetTimeRemainingSettings() {
        const YoutubeGotten = await GetValue("Youtube", "{}");
        let YoutubeSettings = JSON.parse(YoutubeGotten);
        if (!YoutubeSettings || typeof YoutubeSettings !== "object") YoutubeSettings = {};

        if (!YoutubeSettings["QOL"]) YoutubeSettings["QOL"] = {};
        let QOLSettings = YoutubeSettings["QOL"];

        if (!QOLSettings["TimeRemaining"]) QOLSettings["TimeRemaining"] = {};
        let TimeRemainingSettings = QOLSettings["TimeRemaining"];

        TimeRemainingSettings.Active ??= false;

        return TimeRemainingSettings;
    }

    /**
     * @async
     * @returns {boolean}
     */
    async function IsTimeRemainingActive() {
        return GetTimeRemainingSettings().Active;
    }

    async function CreateRemainingLeft() {
        if (!(await IsTimeRemainingActive())) return;

        let videoArray = document.getElementsByTagName("video");
        if (videoArray.length <= 0) return;
        let video = videoArray[0];

        if (!video) return;

        let remainingTimeText = GetRemainingTimeText();

        // console.log(`video.currentTime: ${video.currentTime}`);
        // console.log(`video.duration: ${video.duration}`);
        // console.log(`remainingTime: ${remainingTime}`);
        // console.log(`remainingTimeText: ${remainingTimeText}`);

        // watch for a specific class change

        const timeRemainingModule = WolfermusGetModule("QOLTimeRemaining", true);

        document.querySelectorAll(".ytp-time-display").forEach(async (timeDisplay) => {
            try {
                if (timeDisplay) {
                    let hasTimeRemainingArray = timeDisplay.getElementsByClassName("wlfYTTimeRemaining");
                    // console.log(timeDisplay);
                    if (hasTimeRemainingArray.length > 0) return;

                    let timeDisplayDurationArray = timeDisplay.getElementsByClassName("ytp-time-duration");
                    if (timeDisplayDurationArray.length <= 0) return;
                    let timeDisplayDuration = timeDisplayDurationArray[0];
                    if (!timeDisplayDuration) return;

                    let timeRemaining = document.createElement("span");
                    timeRemaining.className = "wlfYTTimeRemaining";
                    if (remainingTimeText !== "") {
                        timeRemaining.innerText = ` [${remainingTimeText}]`;
                    } else {
                        timeRemaining.innerText = "   ";
                    }


                    InsertAfter(timeDisplayDuration, timeRemaining);

                    // console.log("Added New Time Remaining:");
                    // console.log(timeRemaining);
                    // console.log("");
                }
            } catch (e) {
                console.error(e);
            }
        });

        // console.log(document.getElementsByClassName("ytp-time-display"));

        // console.log(player);
        // console.log(video);

        let lastValue;
        video.addEventListener("timeupdate", async (event) => {
            if (!(await IsTimeRemainingActive())) return;

            if (lastValue !== video.currentTime) {
                lastValue = video.currentTime;
                // console.log(video.currentTime);
                await UpdateRemainingLeft();
            }
        });
        video.addEventListener("ratechange", async (event) => {
            if (!(await IsTimeRemainingActive())) return;

            await UpdateRemainingLeft();
        });

        video.addEventListener("durationchange", async (event) => {
            if (!(await IsTimeRemainingActive())) return;

            await UpdateRemainingLeft();
        });
    }

    var shouldUpdate = true;

    async function UpdateRemainingLeft() {
        if (!(await IsTimeRemainingActive())) return;

        let videoArray = document.getElementsByTagName("video");
        if (videoArray.length <= 0) return;
        let video = videoArray[0];

        if (!video || !shouldUpdate) return;

        let remainingTimeText = GetRemainingTimeText();

        // console.log(`video.currentTime: ${video.currentTime}`);
        // console.log(`video.duration: ${video.duration}`);
        // console.log(`remainingTime: ${remainingTime}`);
        // console.log(`remainingTimeText: ${remainingTimeText}`);

        document.querySelectorAll(".wlfYTTimeRemaining").forEach(async (element) => {
            try {
                if (element) {
                    'use strict';
                    // console.log(element);
                    if (remainingTimeText !== "") {
                        element.innerHTML = window.trustedTypes.defaultPolicy.createHTML(` [${remainingTimeText}]`);
                    } else {
                        element.innerHTML = window.trustedTypes.defaultPolicy.createHTML("   ");
                    }
                }
            } catch (e) {
                console.error(e);
            }
        });

        // console.log(`Remaining time: ${remainingTime}`);
    }

    /**
     * @param {string} text
     * @returns {number}
     */
    function GetSecondsFromText(text) {
        let textArray = text.split(':');
        textArray.reverse();

        let seconds = 0;

        let secondsText = "";
        let minutesText = "";
        let hoursText = "";
        let daysText = "";

        if (textArray.length > 0) secondsText = textArray[0];
        if (textArray.length > 1) minutesText = textArray[1];
        if (textArray.length > 2) hoursText = textArray[2];
        if (textArray.length > 3) daysText = textArray[3];

        // @ts-ignore
        if (secondsText && !isNaN(secondsText)) seconds = parseInt(secondsText);
        // @ts-ignore
        if (minutesText && !isNaN(minutesText)) seconds += parseInt(minutesText) * 60;
        // @ts-ignore
        if (hoursText && !isNaN(hoursText)) seconds += parseInt(hoursText) * 60 * 60;
        // @ts-ignore
        if (daysText && !isNaN(daysText)) seconds += parseInt(daysText) * 24 * 60 * 60;

        return seconds;
    }



    /**
     * @type {Element | null} element
     */
    var lastPreviewToolTipTextElement;
    /**
     * @type {HTMLSpanElement | undefined} wlfPreviewToolTipTimeRemainingElementLeft
     */
    var wlfPreviewToolTipTimeRemainingElementLeft;
    /**
     * @type {HTMLSpanElement | undefined} wlfPreviewToolTipTimeRemainingElementRight
     */
    var wlfPreviewToolTipTimeRemainingElementRight;

    var lastPreviewRemainingFromElementTime;
    var lastPreviewRemainingFromCurrentTime;

    /**
     * @param {Element} elementToInsertAfter
     */
    async function CreatePreviewRemaingLeft(elementToInsertAfter) {
        if (!(await IsTimeRemainingActive())) return;

        let player = document.getElementById("player");
        if (!player) return;
        // console.log("Found player");

        if (!elementToInsertAfter || (elementToInsertAfter && !document.contains(elementToInsertAfter))) return;

        let videoArray = document.getElementsByTagName("video");
        if (videoArray.length <= 0) return;
        let video = videoArray[0];

        if (!video) return;

        const playbackSpeed = video.playbackRate;
        let remainingTimeFromElementText = "";
        let remainingTimeFromCurrentText = "";

        const elementTime = GetSecondsFromText(elementToInsertAfter.innerHTML);
        let remainingTimeFromElementTime = video.duration - elementTime;
        let remainingTimeFromCurrentTime = elementTime - video.currentTime;
        if (playbackSpeed != 0) {
            let hasUpdated = false;
            if (remainingTimeFromElementTime != 0) {
                remainingTimeFromElementTime /= playbackSpeed;

                if (remainingTimeFromElementTime <= 0 || Number.isNaN(remainingTimeFromElementTime)) remainingTimeFromElementTime = 0;
                if (lastPreviewRemainingFromElementTime !== remainingTimeFromElementTime) {
                    hasUpdated = true;
                    remainingTimeFromElementText = ConvertTimeSecondsToDisplay(remainingTimeFromElementTime);
                }
            }
            if (remainingTimeFromCurrentTime != 0) {
                remainingTimeFromCurrentTime /= playbackSpeed;

                if (remainingTimeFromCurrentTime == 0 || Number.isNaN(remainingTimeFromCurrentTime)) remainingTimeFromCurrentTime = 0;
                if (lastPreviewRemainingFromCurrentTime !== remainingTimeFromCurrentTime) {
                    hasUpdated = true;
                    if (remainingTimeFromCurrentTime < 0) remainingTimeFromCurrentText = "-";
                    remainingTimeFromCurrentText += ConvertTimeSecondsToDisplay(Math.abs(remainingTimeFromCurrentTime));
                }
            }

            if (!hasUpdated) return;
        } else {
            remainingTimeFromElementText = "Inf";
            remainingTimeFromCurrentText = "Inf";
        }

        // console.log(`elementTime: ${elementTime}`);
        // console.log(`video.duration: ${video.duration}`);
        // console.log(`remainingTime: ${remainingTime}`);
        // console.log(`remainingTimeFromElementText: ${remainingTimeFromElementText}`);

        // watch for a specific class change


        const hasTimeRemainingFromElementArray = elementToInsertAfter.parentElement?.getElementsByClassName("wlfYTTimePreviewRemainingRight");
        // console.log(timeDisplay);
        if (hasTimeRemainingFromElementArray && hasTimeRemainingFromElementArray.length <= 0) {
            wlfPreviewToolTipTimeRemainingElementRight = document.createElement("span");
            wlfPreviewToolTipTimeRemainingElementRight.className = elementToInsertAfter.className;
            wlfPreviewToolTipTimeRemainingElementRight.classList.add("wlfYTTimePreviewRemainingRight");
            // wlfPreviewToolTipTimeRemainingElementRight.style.top = "33px";
            if (remainingTimeFromElementText !== "") {
                wlfPreviewToolTipTimeRemainingElementRight.innerText = `[${remainingTimeFromElementText}]`;
            } else {
                wlfPreviewToolTipTimeRemainingElementRight.innerText = "   ";
            }

            InsertAfter(elementToInsertAfter, wlfPreviewToolTipTimeRemainingElementRight);

            // console.log("Added New Time Remaining:");
            // console.log(wlfPreviewToolTipTimeRemainingElementRight);
            // console.log("");

            // console.log(document.getElementsByClassName("ytp-time-display"));
        }

        const hasTimeRemainingFromCurrentArray = elementToInsertAfter.parentElement?.getElementsByClassName("wlfYTTimePreviewRemainingLeft");
        // console.log(timeDisplay);
        if (hasTimeRemainingFromCurrentArray && hasTimeRemainingFromCurrentArray.length <= 0) {
            wlfPreviewToolTipTimeRemainingElementLeft = document.createElement("span");
            wlfPreviewToolTipTimeRemainingElementLeft.className = elementToInsertAfter.className;
            wlfPreviewToolTipTimeRemainingElementLeft.classList.add("wlfYTTimePreviewRemainingLeft");
            // wlfPreviewToolTipTimeRemainingElementLeft.style.top = "33px";
            if (remainingTimeFromCurrentText !== "") {
                wlfPreviewToolTipTimeRemainingElementLeft.innerText = `[${remainingTimeFromCurrentText}]`;
            } else {
                wlfPreviewToolTipTimeRemainingElementLeft.innerText = "     ";
            }

            InsertBefore(elementToInsertAfter, wlfPreviewToolTipTimeRemainingElementLeft);

            // console.log("Added New Time Remaining:");
            // console.log(wlfPreviewToolTipTimeRemainingElementLeft);
            // console.log("");

            // console.log(document.getElementsByClassName("ytp-time-display"));
        }

        if (playbackSpeed != 0) {
            lastPreviewRemainingFromElementTime = remainingTimeFromElementTime;
            lastPreviewRemainingFromCurrentTime = remainingTimeFromCurrentTime;
        }
        // console.log(player);
        // console.log(video);

        var lastValue;
        var lastClassValue;

        // @ts-ignore
        const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        const observer = new MutationObserver(async () => {
            if (!(await IsTimeRemainingActive())) return;

            if (lastValue !== elementToInsertAfter.innerHTML) {
                lastValue = remainingTimeFromElementTime;
                // console.log(remainingTimeFromElementTime);
                await UpdatePreviewRemainingLeft();
            }
            if (lastClassValue !== elementToInsertAfter.className) {
                lastClassValue = elementToInsertAfter.className;
                if (wlfPreviewToolTipTimeRemainingElementLeft) {
                    wlfPreviewToolTipTimeRemainingElementLeft.className = "";
                    wlfPreviewToolTipTimeRemainingElementLeft.className = elementToInsertAfter.className;
                    wlfPreviewToolTipTimeRemainingElementLeft.classList.add("wlfYTTimePreviewRemainingLeft");
                }
                if (wlfPreviewToolTipTimeRemainingElementRight) {
                    wlfPreviewToolTipTimeRemainingElementRight.className = "";
                    wlfPreviewToolTipTimeRemainingElementRight.className = elementToInsertAfter.className;
                    wlfPreviewToolTipTimeRemainingElementRight.classList.add("wlfYTTimePreviewRemainingRight");
                }
            }
        });
        observer.observe(elementToInsertAfter, {
            childList: false,
            attributes: true,
            characterData: false
        });

        video.addEventListener("ratechange", async (event) => {
            if (!(await IsTimeRemainingActive())) return;

            await UpdatePreviewRemainingLeft();
        });

        video.addEventListener("durationchange", async (event) => {
            if (!(await IsTimeRemainingActive())) return;

            await UpdatePreviewRemainingLeft();
        });

        video.addEventListener("timeupdate", async (event) => {
            if (!(await IsTimeRemainingActive())) return;

            await UpdatePreviewRemainingLeft();
        });
    }

    /**
     * @param {HTMLVideoElement} video
     */
    async function UpdatePreviewRemainingLeft() {
        if (!(await IsTimeRemainingActive())) return;

        let videoArray = document.getElementsByTagName("video");
        if (videoArray.length <= 0) return;
        let video = videoArray[0];

        if (!video) return;

        const wlfPreviewToolTipTimeRemainingElementRightFound = wlfPreviewToolTipTimeRemainingElementRight && document.contains(wlfPreviewToolTipTimeRemainingElementRight);
        const wlfPreviewToolTipTimeRemainingElementLeftFound = wlfPreviewToolTipTimeRemainingElementLeft && document.contains(wlfPreviewToolTipTimeRemainingElementLeft);

        if ((!wlfPreviewToolTipTimeRemainingElementRightFound || wlfPreviewToolTipTimeRemainingElementRight.style.display == "none")
            && (!wlfPreviewToolTipTimeRemainingElementLeftFound || wlfPreviewToolTipTimeRemainingElementLeft.style.display == "none")) return;

        if (!lastPreviewToolTipTextElement || !document.contains(lastPreviewToolTipTextElement)) return;

        const playbackSpeed = video.playbackRate;
        let remainingTimeFromElementText = "";
        let remainingTimeFromCurrentText = "";

        let remainingTimeFromElementTimeUpdated = false;
        let remainingTimeFromCurrentTimeUpdated = false;
        if (playbackSpeed != 0) {
            const elementTime = GetSecondsFromText(lastPreviewToolTipTextElement.innerHTML);
            let remainingTimeFromElementTime = video.duration - elementTime;
            let remainingTimeFromCurrentTime = elementTime - video.currentTime;

            if (remainingTimeFromElementTime != 0) {
                remainingTimeFromElementTime /= playbackSpeed;

                if (remainingTimeFromElementTime <= 0 || Number.isNaN(remainingTimeFromElementTime)) remainingTimeFromElementTime = 0;
                if (lastPreviewRemainingFromElementTime !== remainingTimeFromElementTime) {
                    remainingTimeFromElementTimeUpdated = true;
                    lastPreviewRemainingFromElementTime = remainingTimeFromElementTime;
                    remainingTimeFromElementText = ConvertTimeSecondsToDisplay(remainingTimeFromElementTime);
                }
            }
            if (remainingTimeFromCurrentTime != 0) {
                remainingTimeFromCurrentTime /= playbackSpeed;

                if (remainingTimeFromCurrentTime == 0 || Number.isNaN(remainingTimeFromCurrentTime)) remainingTimeFromCurrentTime = 0;
                if (lastPreviewRemainingFromCurrentTime !== remainingTimeFromCurrentTime) {
                    remainingTimeFromCurrentTimeUpdated = true;
                    lastPreviewRemainingFromCurrentTime = remainingTimeFromCurrentTime;
                    if (remainingTimeFromCurrentTime < 0) remainingTimeFromCurrentText = "-";
                    remainingTimeFromCurrentText += ConvertTimeSecondsToDisplay(Math.abs(remainingTimeFromCurrentTime));
                }
            }
        } else {
            remainingTimeFromElementTimeUpdated = true;
            remainingTimeFromCurrentTimeUpdated = true;
            remainingTimeFromElementText = "Inf";
            remainingTimeFromCurrentText = "Inf";
        }

        if (!remainingTimeFromElementTimeUpdated && !remainingTimeFromCurrentTimeUpdated) return;

        // console.log(`video.duration: ${video.duration}`);
        // console.log(`remainingTimeFromElementTime: ${remainingTimeFromElementTime}`);
        // console.log(`remainingTimeFromElementText: ${remainingTimeFromElementText}`);

        if (remainingTimeFromElementTimeUpdated) {
            'use strict';
            if (remainingTimeFromElementText !== "") {
                wlfPreviewToolTipTimeRemainingElementRight.innerHTML = window.trustedTypes.defaultPolicy.createHTML(`[${remainingTimeFromElementText}]`);
            } else {
                wlfPreviewToolTipTimeRemainingElementRight.innerHTML = window.trustedTypes.defaultPolicy.createHTML("  ");
            }
        }

        if (remainingTimeFromCurrentTimeUpdated) {
            'use strict';
            if (remainingTimeFromCurrentText !== "") {
                wlfPreviewToolTipTimeRemainingElementLeft.innerHTML = window.trustedTypes.defaultPolicy.createHTML(`[${remainingTimeFromCurrentText}]`);
            } else {
                wlfPreviewToolTipTimeRemainingElementLeft.innerHTML = window.trustedTypes.defaultPolicy.createHTML("    ");
            }
        }

        // document.querySelectorAll(".wlfYTTimePreviewRemaining").forEach(async (element) => {
        //     try {
        //         if(element) {
        //             // console.log(element);
        //             if(remainingTimeText !== "") {
        //                 element.innerHTML = `[${remainingTimeText}]`;
        //             } else {
        //                 element.innerHTML = "  ";
        //             }
        //         }
        //     } catch (e) {
        //         console.error(e);
        //     }
        // });

        // console.log(`Remaining time: ${remainingTime}`);
    }

    console.log("\nWolfermus UserScripts: Youtube Time Remaining: Loaded!\n");

    var lastHref;
    var lastTimeRemainingParentAutoHideElement;

    setInterval(async () => {
        const timeRemainingModule = WolfermusGetModule("QOLTimeRemaining", true);

        if (!(await IsTimeRemainingActive())) {
            for (let element of GetTimeRemainingElements()) {
                element.style.display = "none";
            }
            return;
        }

        if (window.trustedTypes && window.trustedTypes.createPolicy && window.trustedTypes.defaultPolicy === null) {
            window.trustedTypes.createPolicy('default', {
                createHTML: (string, sink) => string
            });
        }

        for (let element of GetTimeRemainingElements()) {
            element.style.display = "";
        }

        const timeRemainingArray = document.getElementsByClassName("wlfYTTimeRemaining");
        const ytTimeDisplayArray = document.getElementsByClassName("ytp-time-display");
        if (timeRemainingArray.length !== ytTimeDisplayArray.length) {
            lastHref = null;
        }

        if (lastTimeRemainingParentAutoHideElement || timeRemainingArray.length > 0) {
            if (!lastTimeRemainingParentAutoHideElement) {
                for (const timeRemainingElement of timeRemainingArray) {
                    if (!timeRemainingElement) continue;

                    /**
                     * @type {Element | null} element
                     */
                    let element = timeRemainingElement;


                    while (element && !element.classList.contains("ytp-autohide")) {
                        element = element.parentElement;
                    }

                    if (element && element.classList.contains("ytp-autohide")) lastTimeRemainingParentAutoHideElement = element;
                }
            }
            if (lastTimeRemainingParentAutoHideElement) {
                if (lastTimeRemainingParentAutoHideElement.classList.contains("ytp-autohide")) shouldUpdate = false;
                else shouldUpdate = true;
            }
        }

        if (window.location.href === lastHref) return;
        lastHref = window.location.href;

        await CreateRemainingLeft();
    }, 200);

    /**
     * @type {Element | null} element
     */
    let lastPreviewElement;

    let lastClassValue;
    // @ts-ignore
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    const wlfYTPPreviewObserver = new MutationObserver(async () => {
        if (!(await IsTimeRemainingActive())) return;

        if (lastClassValue !== lastPreviewElement.className) {
            lastClassValue = lastPreviewElement.className;
            if (lastPreviewElement.classList.contains("ytp-preview")) {
                wlfPreviewToolTipTimeRemainingElementRight.style.display = "inline";
                wlfPreviewToolTipTimeRemainingElementLeft.style.display = "inline";
            } else {
                wlfPreviewToolTipTimeRemainingElementRight.style.display = "none";
                wlfPreviewToolTipTimeRemainingElementLeft.style.display = "none";
            }
        }
    });

    setInterval(async () => {
        if (!(await IsTimeRemainingActive())) {
            if (wlfPreviewToolTipTimeRemainingElementRight && document.contains(wlfPreviewToolTipTimeRemainingElementRight)) wlfPreviewToolTipTimeRemainingElementRight.style.display = "none";
            if (wlfPreviewToolTipTimeRemainingElementLeft && document.contains(wlfPreviewToolTipTimeRemainingElementLeft)) wlfPreviewToolTipTimeRemainingElementLeft.style.display = "none";
            lastClassValue = undefined;
            return;
        }

        if (window.trustedTypes && window.trustedTypes.createPolicy && window.trustedTypes.defaultPolicy === null) {
            window.trustedTypes.createPolicy('default', {
                createHTML: (string, sink) => string
            });
        }

        if (!lastPreviewElement || (lastPreviewElement && !document.contains(lastPreviewElement))) {
            const ytPreviewArray = document.querySelectorAll(".ytp-preview");
            if (ytPreviewArray.length <= 0) return;

            const ytPreviewElement = ytPreviewArray[0];
            if (!ytPreviewElement) return;
            if (lastPreviewElement !== ytPreviewElement) {
                lastPreviewElement = ytPreviewElement;
                wlfYTPPreviewObserver.disconnect();

                wlfYTPPreviewObserver.observe(lastPreviewElement, {
                    childList: false,
                    attributes: true,
                    characterData: false
                });
            }
        }

        if (!lastPreviewToolTipTextElement || (lastPreviewToolTipTextElement && !document.contains(lastPreviewToolTipTextElement))) {
            if (lastPreviewElement && document.contains(lastPreviewElement)) {
                const ytPreviewToolTipTextArray = lastPreviewElement.getElementsByClassName("ytp-tooltip-text");
                if (ytPreviewToolTipTextArray.length <= 0) return;

                const ytPreviewToolTipTextElement = ytPreviewToolTipTextArray[0];
                if (!ytPreviewToolTipTextElement) return;
                lastPreviewToolTipTextElement = ytPreviewToolTipTextElement;
            } else return;
        }
        if (!lastPreviewToolTipTextElement || (lastPreviewToolTipTextElement && !document.contains(lastPreviewToolTipTextElement))) return;

        let wlfPreviewToolTipTimeRemainingElementRightFound = wlfPreviewToolTipTimeRemainingElementRight && document.contains(wlfPreviewToolTipTimeRemainingElementRight);
        let wlfPreviewToolTipTimeRemainingElementLeftFound = wlfPreviewToolTipTimeRemainingElementLeft && document.contains(wlfPreviewToolTipTimeRemainingElementLeft);
        if (!wlfPreviewToolTipTimeRemainingElementRightFound || !wlfPreviewToolTipTimeRemainingElementLeftFound) {
            await CreatePreviewRemaingLeft(lastPreviewToolTipTextElement);
        }

        // wlfPreviewToolTipTimeRemainingElementRightFound = wlfPreviewToolTipTimeRemainingElementRight && document.contains(wlfPreviewToolTipTimeRemainingElementRight);
        // wlfPreviewToolTipTimeRemainingElementLeftFound = wlfPreviewToolTipTimeRemainingElementLeft && document.contains(wlfPreviewToolTipTimeRemainingElementLeft);
        // if (!wlfPreviewToolTipTimeRemainingElementRightFound || !wlfPreviewToolTipTimeRemainingElementLeftFound) return;

        // if (lastPreviewElement.classList.contains("ytp-preview")) {
        //     wlfPreviewToolTipTimeRemainingElementRight.style.display = "inline";
        //     wlfPreviewToolTipTimeRemainingElementLeft.style.display = "inline";
        //     return;
        // }
        // wlfPreviewToolTipTimeRemainingElementRight.style.display = "none";
        // wlfPreviewToolTipTimeRemainingElementLeft.style.display = "none";
    }, 200);
};