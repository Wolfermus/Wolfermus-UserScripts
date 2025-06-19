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
     * @import {WolfermusMenu, WolfermusInputMenuItem} from "../MainMenuLib.user.js"
     */

    /**
     * @type {WolfermusInputMenuItem}
     */
    const WolfermusInputMenuItem = mainMenuLibrary["Classes"]["WolfermusInputMenuItem"];

    class WolfermusSliderMenuItem extends WolfermusInputMenuItem {
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
            super("range", title, tooltip, value, min, max, step);
            this.AddClass("WolfermusSliderItem");

            this.ValueChangeAddCallback(() => {
                if (this.type !== "text") {
                    this.#UpdateSliderToolTip();
                    return;
                }

                this.type = "range";
                this.#UpdateSliderToolTip();

                if (this.element === undefined || this.element === null) return;

                const gottonWolfermusSliderElements = this.element.getElementsByClassName("WolfermusSlider");
                if (gottonWolfermusSliderElements.length <= 0) return;

                const wolfermusSliderElement = gottonWolfermusSliderElements[0];
                wolfermusSliderElement.removeEventListener("focusout", this.#focusOutCallback);
            });
        }

        /**
         * @param {string} newValue
         */
        set type(newValue) {
            if (newValue !== "text" && newValue !== "range") return;
            super.type = newValue;
        }
        get type() { return super.type; }

        /**
         * @returns {Array<string>}
         */
        GetCssURL() {
            let gottenCssURL = super.GetCssURL();
            gottenCssURL.push("/Libraries/MainMenu/Addons/Input/Slider.css");
            return gottenCssURL;
        }

        #focusOutCallback = (event) => {
            if (this.type !== "text") return;
            this.type = "range";

            this.#UpdateSliderToolTip();

            if (this.element === undefined || this.element === null) return;

            const gottonWolfermusSliderElements = this.element.getElementsByClassName("WolfermusSlider");
            if (gottonWolfermusSliderElements.length <= 0) return;

            const wolfermusSliderElement = gottonWolfermusSliderElements[0];
            wolfermusSliderElement.removeEventListener("focusout", this.#focusOutCallback);
        };

        /**
         * @param {MouseEvent} event
         * @type {(MouseEvent) => void}
         */
        #doubleClickCallback = (event) => {
            if (this.type === "text") return;

            this.type = "text";

            this.#UpdateSliderToolTip();

            if (this.element === undefined || this.element === null) return;

            const gottonWolfermusSliderElements = this.element.getElementsByClassName("WolfermusSlider");
            if (gottonWolfermusSliderElements.length <= 0) return;

            const wolfermusSliderElement = gottonWolfermusSliderElements[0];
            wolfermusSliderElement.addEventListener("focusout", this.#focusOutCallback);
        };

        /**
         * @type {(void) => void}
         */
        #UpdateSliderToolTip = () => {
            if (this.element === undefined || this.element === null) return;

            const gottonWolfermusSliderToolTipElements = this.element.getElementsByClassName("WolfermusSliderToolTip");
            if (gottonWolfermusSliderToolTipElements.length <= 0) return;

            const wolfermusSliderToolTipElement = gottonWolfermusSliderToolTipElements[0];
            wolfermusSliderToolTipElement.innerText = this.value;

            if (this.type === "range") {
                wolfermusSliderToolTipElement.style.display = "";
            } else wolfermusSliderToolTipElement.style.display = "none";
        };

        /**
         * @param {WolfermusMenu} menu
         * @returns {string}
         */
        Generate(menu) {
            if (this.id === undefined) return "";

            this.ValidateCSS();

            const validTitle = (this.title !== undefined && this.title !== null & this.title !== "");

            return `
                <li id="WolfermusMenu${menu.id}${this.id}" class="${this.classes.join(" ")}">
                    <a class="WolfermusTitle Wolfermus${this.id}Title Wolfermus${this.id}TitleItem" style="${validTitle ? "" : "display: none;"}">${this.title}</a>
                    <div>
                        <input class="WolfermusInput WolfermusSlider WolfermusText" type="range" value="${this.value}" min="${this.min}" max="${this.max}" step="${this.step}">
                        <span class="WolfermusSliderToolTip">${this.value}</span>
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

            wolfermusSliderElement.addEventListener("dblclick", this.#doubleClickCallback);

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

                    wolfermusSliderElement.removeEventListener("dblclick", this.#doubleClickCallback);
                    wolfermusSliderElement.removeEventListener("focusout", this.#focusOutCallback);
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
        const css = wolfermusBypassScriptPolicy.createScript(await MakeGetRequest(`${baseResourcesURL}Libraries/MainMenu/Addons/Input/Slider.css`));
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