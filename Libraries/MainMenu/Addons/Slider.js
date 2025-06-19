(async () => {
    const startTime = performance.now();

    //#region Utilities
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

    let antiStuckLoop = 50;
    while (!WolfermusCheckLibraryLoaded("MainMenu") && antiStuckLoop > 0) {
        await Sleep(50);
        antiStuckLoop--;
    }

    const mainMenuLibrary = WolfermusGetLibrary("MainMenu");
    const UtilitiesLibrary = WolfermusGetLibrary("Utilities", true);

    if (mainMenuLibrary["Classes"]["Addons"]?.["WolfermusdSliderMenuItem"] !== undefined) return;

    /**
     * @type {(void) => boolean}
     */
    const IsBeta = UtilitiesLibrary["IsBeta"];

    /**
     * @async
     * @type {(path: string) => Promise<any>}
     */
    const MakeGetRequest = UtilitiesLibrary["MakeGetRequest"];

    /**
     * @import {WolfermusMenu, WolfermusMenuItem} from "../MainMenuLib.user.js"
     */

    /**
     * @type {WolfermusMenuItem}
     */
    const WolfermusMenuItem = mainMenuLibrary["Classes"]["WolfermusMenuItem"];

    class WolfermusSliderMenuItem extends WolfermusMenuItem {
        /**
         * @param {any} id
         * @param {string} title
         * @param {string} [tooltip=""]
         * @param {any} [value=0]
         * @param {any} [min=0]
         * @param {any} [max=100]
         * @param {any} [step=1]
         */
        constructor(title, tooltip = "", value = 0, min = 0, max = 100, step = 1) {
            super(title, tooltip);
            this.AddClass("WolfermusSliderItem");

            this.#min = min;
            this.#max = max;
            this.#step = step;
            this.value = value;
        }

        /**
         * @type {any}
         */
        #value = 0;
        /**
         * @type {any}
         */
        #min = 0;
        /**
         * @type {any}
         */
        #max = 100;
        /**
         * @type {any}
         */
        #step = 1;

        /**
         * @type {Array<(void) => void>}
         */
        #valueChangeEvent = [];

        /**
         * @param {InputEvent} event 
         * @type {(event: InputEvent) => voud}
         */
        #inputCallback = (event) => {
            this.value = event.target.value;
        };

        /**
         * @param {(void) => void} callback 
         */
        ValueChangeAddCallback(callback) {
            if (callback === undefined || callback === null) return;
            if (this.#valueChangeEvent.includes(callback)) return;

            this.#valueChangeEvent.push(callback);
        }

        /**
         * @param {(void) => void} callback 
         */
        ValueChangeRemoveCallback(callback) {
            if (callback === undefined || callback === null) return;
            const foundIndex = this.#valueChangeEvent.findIndex((callbackItem) => callbackItem === callback);
            if (foundIndex <= -1) return;

            this.#valueChangeEvent.splice(foundIndex, 1);
        }

        /**
         * @type {(void) => void}
         */
        #ValidateValue = () => {
            if (this.#value < this.#min) this.value = this.#min;
            else if (this.#value > this.#max) this.value = this.#max;
        };

        /**
         * @type {(void) => void}
         */
        #UpdateSlider = () => {
            if (this.element === undefined || this.element === null) return;

            const gottonWolfermusSliderElements = this.element.getElementsByClassName("WolfermusSlider");
            if (gottonWolfermusSliderElements.length <= 0) return;

            const wolfermusSliderElement = gottonWolfermusSliderElements[0];
            wolfermusSliderElement.value = this.#value;
            wolfermusSliderElement.min = this.#min;
            wolfermusSliderElement.max = this.#max;
            wolfermusSliderElement.step = this.#step;
        };

        /**
         * @type {(void) => void}
         */
        #UpdateSliderToolTip = () => {
            if (this.element === undefined || this.element === null) return;

            const gottonWolfermusSliderToolTipElements = this.element.getElementsByClassName("WolfermusSliderToolTip");
            if (gottonWolfermusSliderToolTipElements.length <= 0) return;

            const wolfermusSliderToolTipElement = gottonWolfermusSliderToolTipElements[0];
            wolfermusSliderToolTipElement.innerText = this.#value;
        };

        /**
         * @param {any} newValue
         */
        set value(newValue) {
            if (newValue === this.#value) return;

            if (newValue < this.#min) this.value = this.#min;
            else if (newValue > this.#max) this.value = this.#max;
            else this.#value = newValue;

            this.#UpdateSlider();
            this.#UpdateSliderToolTip();

            for (let callback of this.#valueChangeEvent) {
                callback?.();
            }
        }
        get value() { return this.#value; }

        /**
         * @param {any} newValue
         */
        set min(newValue) {
            if (newValue === this.#min) return;

            this.#min = newValue;
            this.#ValidateValue();

            this.#UpdateSlider();
        }
        get min() { return this.#min; }

        /**
         * @param {any} newValue
         */
        set max(newValue) {
            if (newValue === this.#max) return;

            this.#max = newValue;
            this.#ValidateValue();

            this.#UpdateSlider();
        }
        get max() { return this.#max; }

        /**
         * @param {any} newValue
         */
        set step(newValue) {
            if (newValue === this.#step) return;

            this.#step = newValue;

            this.#UpdateSlider();
        }
        get step() { return this.#step; }

        /**
         * @param {WolfermusMenu} menu
         * @returns {string}
         */
        Generate(menu) {
            if (this.id === undefined) return "";

            const validTitle = (this.title !== undefined && this.title !== null & this.title !== "");

            return `
                <li id="WolfermusMenu${menu.id}${this.id}" class="${this.classes.join(" ")}">
                    <a class="WolfermusTitle Wolfermus${this.id}Title Wolfermus${this.id}TitleItem" style="${validTitle ? "" : "display: none;"}">${this.title}</a>
                    <div>
                        <input class="WolfermusSlider" type="range" value="${this.#value}" min="${this.#min}" max="${this.max}" step="${this.step}">
                        <span class="WolfermusSliderToolTip">${this.#value}</span>
                    </div>
                </li>
            `;
        }

        /**
         * @param {WolfermusMenu} menu
         * @returns {Boolean}
         */
        async SetupEvents(menu) {
            if (!super.SetupEvents(menu)) return false;

            if (this.element === undefined || this.element === null) return false;

            const gottonWolfermusSliderElements = this.element.getElementsByClassName("WolfermusSlider");
            if (gottonWolfermusSliderElements.length <= 0) return false;

            const wolfermusSliderElement = gottonWolfermusSliderElements[0];

            wolfermusSliderElement.addEventListener("input", this.#inputCallback);

            return true;
        }

        /**
         * @param {WolfermusMenu} menu
         */
        RemoveEvents(menu) {
            super.RemoveEvents(menu);

            if (this.element !== undefined && this.element !== null) {
                const gottonWolfermusSliderElements = this.element.getElementsByClassName("WolfermusSlider");
                if (gottonWolfermusSliderElements.length > 0) {
                    const wolfermusSliderElement = gottonWolfermusSliderElements[0];

                    wolfermusSliderElement.removeEventListener("input", this.#inputCallback);
                }
            }
        }
    }

    mainMenuLibrary["Classes"]["Addons"]["WolfermusSliderMenuItem"] = WolfermusSliderMenuItem;

    let sliderMenuItemStyle = document.getElementById("WolfermusSliderMenuItemStyle");

    if (sliderMenuItemStyle === undefined || sliderMenuItemStyle === null) {
        sliderMenuItemStyle = document.createElement("style");
        sliderMenuItemStyle.id = "WolfermusSliderMenuItemStyle";
        document.head.append(sliderMenuItemStyle);
    }

    let branch = "main";
    if (IsBeta()) {
        branch = "beta";
    }

    async function GetCSS() {
        const baseResourcesURL = `https://raw.githubusercontent.com/Wolfermus/Wolfermus-UserScripts/refs/heads/${branch}/Resources/`;
        const css = wolfermusBypassScriptPolicy.createScript(await MakeGetRequest(`${baseResourcesURL}Libraries/MainMenu/Addons/Slider.css`));
        return css;
    }

    let wolfermusPreventLoopLock1 = 10;
    async function AttemptLoadCSS() {
        return await GetCSS().then(async (response) => {
            return response;
        }).catch(async (error) => {
            if (wolfermusPreventLoopLock1 <= 0) return;
            wolfermusPreventLoopLock1--;
            await Sleep(50);
            return await AttemptLoadCSS();
        });
    }

    const editedInnerHTML = wolfermusBypassScriptPolicy.createHTML(await AttemptLoadCSS());

    sliderMenuItemStyle.innerHTML = editedInnerHTML;

    const endTime = performance.now();
    console.info(`Wolfermus MainMenu: Addons - SliderMenuItem Added - Took ${endTime - startTime}ms`);
})();