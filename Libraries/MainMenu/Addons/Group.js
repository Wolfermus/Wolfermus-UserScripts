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

    if (mainMenuLibrary["Classes"]["Addons"]?.["WolfermusGroupMenuItem"] !== undefined) return;

    /**
     * @import {WolfermusMenu, WolfermusBaseGroupMenuItem} from "../..//MainMenuLib.user.js"
     */

    /**
     * @type {WolfermusBaseGroupMenuItem}
     */
    const WolfermusBaseGroupMenuItem = mainMenuLibrary["Classes"]["Bases"]["WolfermusBaseGroupMenuItem"];

    /**
     * @async
     * @throws If failed to load HTML or create element
     * @type {(forceRequest?: boolean) => HTMLElement}
     */
    const GetWolfermusRoot = mainMenuLibrary["Elements"]["GetWolfermusRoot"];

    class WolfermusGroupMenuItem extends WolfermusBaseGroupMenuItem {
        /**
         * @param {any} id
         * @param {string} title
         * @param {string} tooltip
         */
        constructor(title, tooltip = "") {
            super(title, tooltip);
            this.RemoveClass("WolfermusTextItem");
        }

        /**
         * @type {(PointerEvent) => void}
         */
        #menuPointerEnterCallback = undefined;
        /**
         * @type {(PointerEvent) => void}
         */
        #menuPointerLeaveCallback = undefined;
        /**
         * @type {(PointerEvent) => void}
         */
        #groupPointerEnterCallback = undefined;
        /**
         * @type {(PointerEvent) => void}
         */
        #groupPointerLeaveCallback = undefined;

        /**
         * @type {boolean}
         */
        #collapsed = true;

        /**
         * @type {Array<(collapsed: boolean) => void>}
         */
        #collapsedEvent = [];

        /**
         * @param {WolfermusMenu} menu
         * @returns {string}
         */
        #GenerateItems(menu) {
            let menuItemsConverted = "";
            for (const menuItem of this.items) {
                menuItemsConverted += menuItem.Generate(menu);
            }
            return menuItemsConverted;
        }

        /**
         * @type {((event: InputEvent) => void) | undefined}
         */
        #collapse = undefined;

        /**
         * @type {((event: InputEvent) => void) | undefined}
         */
        #expand = undefined;

        Collapse() {
            if (this.#collapse !== undefined && this.#collapse !== null) {
                this.#collapse();
            } else {
                this.#collapsed = true;
                this.#ExecuteCollapsedEvent();
            }
        }

        Expand() {
            if (this.#expand !== undefined && this.#expand !== null) {
                this.#expand();
            } else {
                this.#collapsed = false;
                this.#ExecuteCollapsedEvent();
            }
        }

        set collapsed(newValue) {
            if (typeof newValue !== "boolean") return;
            if (newValue === this.#collapsed) return;

            if (newValue) {
                this.Collapse();
            } else {
                this.Expand();
            }
        }
        get collapsed() { return this.#collapsed; }

        #ExecuteCollapsedEvent() {
            for (let callback of this.#collapsedEvent) {
                callback?.(this.#collapsed);
            }
        }

        /**
         * @param {(collapsed: boolean) => void} callback 
         */
        CollapsedAddCallback(callback) {
            if (callback === undefined || callback === null) return;
            if (this.#collapsedEvent.includes(callback)) return;

            this.#collapsedEvent.push(callback);
        }

        /**
         * @param {(collapsed: boolean) => void} callback 
         */
        CollapsedRemoveCallback(callback) {
            if (callback === undefined || callback === null) return;
            const foundIndex = this.#collapsedEvent.findIndex((callbackItem) => callbackItem === callback);
            if (foundIndex <= -1) return;

            this.#collapsedEvent.splice(foundIndex, 1);
        }

        /**
         * @param {WolfermusMenu} menu
         * @returns {string}
         */
        Generate(menu) {
            if (this.id === undefined) return "";

            const validTitle = (this.title !== undefined && this.title !== null & this.title !== "");

            return `
                <div id="WolfermusMenu${menu.id}${this.id}" class="${this.classes.join(" ")}">
                    <li id="WolfermusMenu${menu.id}${this.id}Group" class="WolfermusGroupItem" style="${this.#collapsed ? "" : "display: none;"}">
                        <a class="WolfermusGroup WolfermusGroupRightPosition"><</a>
                        <a class="WolfermusTitle Wolfermus${this.id}Title">${this.title}</a>
                        <a class="WolfermusGroup WolfermusGroupLeftPosition">></a>
                    </li>
                    <li id="WolfermusMenu${menu.id}${this.id}Section" style="background: transparent;
                    border-radius: 20px;
                    border-color: #272727;
                    border-width: 4px;
                    border-style: solid;
                    ${!this.#collapsed ? "" : "display: none;"}">
                        <a id="WolfermusMenu${menu.id}${this.id}GroupCollapseButton" style="position: absolute;top: 0; right: 0;pointer-events: all !important;cursor: pointer;z-index: 9600;">x</a>
                        <ul class="WolfermusDefaultCSS">
                            <li class="WolfermusDefaultCSS WolfermusTextItem Wolfermus${this.id}TitleItem" style="${validTitle ? "" : "display: none;"}">
                                <a class="WolfermusTitle Wolfermus${this.id}Title" style="font-size: 18px;">${this.title}</a>
                            </li>
                            ${this.#GenerateItems(menu)}
                        </ul>
                    </li>
                </div>
            `;

            // return `
            //     <li id="WolfermusMenu${menu.id}${this.id}" class="${this.classes.join(" ")}">
            //         <a class="WolfermusGroup WolfermusGroupRightPosition"><</a>    
            //         <a class="WolfermusTitle">${this.title}</a>
            //         <a class="WolfermusGroup WolfermusGroupLeftPosition">></a>
            //     </li>
            // `;
        }

        /**
         * @param {WolfermusMenu} menu
         * @returns {Boolean}
         */
        async SetupEvents(menu) {
            if (!super.SetupEvents(menu)) return false;

            const wolfermusRoot = await GetWolfermusRoot();
            if (wolfermusRoot === undefined || wolfermusRoot === null) return false;

            const gottenGroup = document.getElementById(`WolfermusMenu${menu.id}${this.id}Group`);
            const gottenSection = document.getElementById(`WolfermusMenu${menu.id}${this.id}Section`);
            if (gottenGroup === undefined || gottenGroup === null) return false;
            if (gottenSection === undefined || gottenSection === null) return false;

            const gottenCollapseButton = document.getElementById(`WolfermusMenu${menu.id}${this.id}GroupCollapseButton`);
            if (gottenCollapseButton === undefined || gottenCollapseButton === null) return false;

            /**
             * @param {PointerEvent} event 
             */
            this.#menuPointerEnterCallback = (event) => {
                if (this.id === undefined) return;

                if (menu.timeoutID !== undefined && menu.timeoutID !== null) {
                    clearTimeout(menu.timeoutID);
                    menu.timeoutID = undefined;
                }

                if (menu.attached?.menu?.attachedItem !== this) {
                    if (this.ContainsClass("WolfermusActive")) {
                        this.RemoveClass("WolfermusActive");
                        this.UpdateClasses();
                    }
                    return;
                }
                if (menu.attached?.menu === undefined) return;
                if (menu.attached?.menu.element === undefined) return;
                if (menu.attached.menu.IsHoveringAnyMenu()) return;

                if (menu.attached?.menu?.cooldownTimeoutID !== undefined) {
                    clearTimeout(menu.attached.menu.cooldownTimeoutID);
                    menu.attached.menu.cooldownTimeoutID = undefined;
                }

                menu.attached.menu.cooldownTimeoutID = setTimeout(() => {
                    if (menu.attached?.menu?.attachedItem !== this) {
                        if (this.ContainsClass("WolfermusActive")) {
                            this.RemoveClass("WolfermusActive");
                            this.UpdateClasses();
                        }
                        return;
                    }
                    if (menu.attached?.menu === undefined) return;
                    if (menu.attached?.menu.element === undefined) return;
                    if (menu.attached.menu.IsHoveringAnyMenu()) return;

                    if (gottenGroup !== undefined && gottenGroup !== null) {
                        if (gottenGroup.matches(":hover") && menu.element.style["visibility"] !== "hidden") {
                            if (menu?.attached?.menu?.attached?.menu !== undefined) {
                                if (menu.attached.menu.attached.menu?.attachedItem?.ContainsClass?.("WolfermusActive")) {
                                    menu.attached.menu.attached.menu.attachedItem.RemoveClass("WolfermusActive");
                                    menu.attached.menu.attached.menu.attachedItem.UpdateClasses();
                                }

                                menu.attached.menu.attached.menu.Hide();
                            }
                            return;
                        }
                    }
                    if (menu.element !== undefined && menu.element !== null) {
                        if (!menu.element.matches(":hover") && menu.element.style["visibility"] !== "hidden") return;
                    }

                    //console.log(`${menu.attached.menu.id} Closing Via menuPointerEnterCallback`);

                    menu.attached.menu.Hide();
                    if (this.ContainsClass("WolfermusActive")) {
                        this.RemoveClass("WolfermusActive");
                        this.UpdateClasses();
                    }
                    menu.attached.menu.cooldownTimeoutID = undefined;
                }, 500);
            }

            /**
             * @param {PointerEvent} event 
             */
            this.#menuPointerLeaveCallback = (event) => {
                if (this.id === undefined) return;

                if (menu.attached?.menu?.attachedItem !== this) {
                    if (this.ContainsClass("WolfermusActive")) {
                        this.RemoveClass("WolfermusActive");
                        this.UpdateClasses();
                    }
                    return;
                }
                if (menu.attached?.menu === undefined) return;

                if (menu.attached?.menu?.cooldownTimeoutID !== undefined) {
                    clearTimeout(menu.attached.menu.cooldownTimeoutID);
                    menu.attached.menu.cooldownTimeoutID = undefined;
                }
            }

            /**
             * @param {PointerEvent} event 
             */
            this.#groupPointerEnterCallback = async (event) => {
                if (menu.attached?.menu?.timeoutID !== undefined) {
                    clearTimeout(menu.attached.menu.timeoutID);
                    menu.attached.menu.timeoutID = undefined;
                }

                if (this.id === undefined) {
                    if (menu.attached?.menu?.cooldownTimeoutID !== undefined) {
                        clearTimeout(menu.attached.menu.cooldownTimeoutID);
                        menu.attached.menu.cooldownTimeoutID = undefined;
                    }
                    return;
                }

                if (menu.attached === undefined) menu.attached = {};
                if (menu.attached.menu === undefined) {
                    menu.attached.menu = new WolfermusMenu();
                    menu.attached.menu.AddClass("WolfermusGroupMenuWindow");
                }

                if (menu.attached.menu.attachedItem === this) return;

                if (menu.attached.menu.attachedItem !== undefined) {
                    if (this.ContainsClass("WolfermusActive")) {
                        this.RemoveClass("WolfermusActive");
                        this.UpdateClasses();
                    }
                    if (menu.attached.menu.attachedItem.ContainsClass("WolfermusActive")) {
                        menu.attached.menu.attachedItem.RemoveClass("WolfermusActive");
                        menu.attached.menu.attachedItem.UpdateClasses();
                    }
                }

                if (menu.attached?.menu?.cooldownTimeoutID !== undefined) {
                    clearTimeout(menu.attached.menu.cooldownTimeoutID);
                    menu.attached.menu.cooldownTimeoutID = undefined;
                }

                menu.attached.menu.Hide();

                if (this.element === undefined || this.element === null) return;

                if (menu.element === undefined || menu.element.style["visibility"] === "hidden") return;

                let preventInfLoop = 10;
                while (menu.transitioning && preventInfLoop > 0) {
                    await Sleep(100);
                    preventInfLoop--;
                }

                menu.attached.menu.Hide();

                if (this.element === undefined || this.element === null) return;

                if (menu.element === undefined || menu.element.style["visibility"] === "hidden") return;

                const menuItemGroupCollection = gottenGroup.getElementsByClassName("WolfermusGroup");
                if (menuItemGroupCollection === undefined || menuItemGroupCollection === null || menuItemGroupCollection.length <= 0) return;

                let menuItemGroup = undefined;
                for (let foundElement of menuItemGroupCollection) {
                    const computedStyle = window.getComputedStyle(foundElement);
                    if (computedStyle["visibility"] !== "hidden") {
                        menuItemGroup = foundElement;
                        break;
                    }
                }
                if (menuItemGroup === undefined || menuItemGroup === null) return;

                menu.attached.menu.ValidateElement(wolfermusRoot);

                const clientRect = menuItemGroup.getBoundingClientRect();
                let position = new Position(clientRect.left + clientRect.width / 2, clientRect.top + clientRect.height / 2);

                if (menu.ContainsClass("WolfermusGroupRightPosition")) {
                    position.x -= 4;
                    menu.attached.menu.AddClass("WolfermusRightPosition");
                    menu.attached.menu.AddClass("WolfermusGroupRightPosition");
                    menu.attached.menu.RemoveClass("WolfermusLeftPosition");
                    menu.attached.menu.RemoveClass("WolfermusGroupLeftPosition");
                } else {
                    position.x += 4;
                    menu.attached.menu.AddClass("WolfermusLeftPosition");
                    menu.attached.menu.AddClass("WolfermusGroupLeftPosition");
                    menu.attached.menu.RemoveClass("WolfermusRightPosition");
                    menu.attached.menu.RemoveClass("WolfermusGroupRightPosition");
                }
                if (menu.ContainsClass("WolfermusGroupUpPosition")) {
                    position.y += clientRect.height / 2;
                    menu.attached.menu.AddClass("WolfermusUpPosition");
                    menu.attached.menu.AddClass("WolfermusGroupUpPosition");
                    menu.attached.menu.RemoveClass("WolfermusDownPosition");
                    menu.attached.menu.RemoveClass("WolfermusGroupDownPosition");
                } else {
                    position.y -= clientRect.height / 2;
                    menu.attached.menu.AddClass("WolfermusDownPosition");
                    menu.attached.menu.AddClass("WolfermusGroupDownPosition");
                    menu.attached.menu.RemoveClass("WolfermusUpPosition");
                    menu.attached.menu.RemoveClass("WolfermusGroupUpPosition");
                }
                menu.attached.menu.UpdateClasses();

                menu.attached.menu.items = this.items;
                await menu.attached.menu.Generate(wolfermusRoot);

                menu.attached.menu.Hide();

                menu.attached.menu.element.style["left"] = position.x + "px";
                menu.attached.menu.element.style["top"] = position.y + "px";

                const attachedMenuClientRect = menu.attached.menu.element.getBoundingClientRect();
                let checkPosition = new Position(clientRect.left + clientRect.width / 2, clientRect.top + clientRect.height / 2);

                if (menu.attached.menu.ContainsClass("WolfermusRightPosition")) {
                    checkPosition.x -= attachedMenuClientRect.width;
                    checkPosition.x += clientRect.height / 2;
                    checkPosition.x -= attachedMenuClientRect.width;
                } else {
                    checkPosition.x += attachedMenuClientRect.width;
                    checkPosition.x -= clientRect.height / 2;
                    checkPosition.x += attachedMenuClientRect.width;
                }
                if (menu.attached.menu.ContainsClass("WolfermusUpPosition")) {
                    checkPosition.y += clientRect.height / 2;
                    checkPosition.y -= attachedMenuClientRect.height;
                    checkPosition.y += clientRect.height;
                    checkPosition.y -= attachedMenuClientRect.height;
                } else {
                    checkPosition.y += attachedMenuClientRect.height;
                }

                const mainMenuRoot = await GetWolfermusRoot();

                const windowClientRect = mainMenuRoot.getBoundingClientRect();

                if (checkPosition.x < 0) {
                    menu.attached.menu.AddClass("WolfermusGroupLeftPosition");
                    menu.attached.menu.RemoveClass("WolfermusGroupRightPosition");
                } else if (checkPosition.x > windowClientRect.width) {
                    menu.attached.menu.AddClass("WolfermusGroupRightPosition");
                    menu.attached.menu.RemoveClass("WolfermusGroupLeftPosition");
                }

                if (checkPosition.y < 0) {
                    menu.attached.menu.AddClass("WolfermusGroupDownPosition");
                    menu.attached.menu.RemoveClass("WolfermusGroupUpPosition");
                } else if (checkPosition.y > windowClientRect.height) {
                    menu.attached.menu.AddClass("WolfermusGroupUpPosition");
                    menu.attached.menu.RemoveClass("WolfermusGroupDownPosition");
                }

                menu.attached.menu.UpdateClasses();

                if (menu.attached?.menu?.cooldownTimeoutID !== undefined) {
                    clearTimeout(menu.attached.menu.cooldownTimeoutID);
                    menu.attached.menu.cooldownTimeoutID = undefined;
                    if (menu.attached.menu.attachedItem.ContainsClass("WolfermusActive")) {
                        menu.attached.menu.attachedItem.RemoveClass("WolfermusActive");
                        menu.attached.menu.attachedItem.UpdateClasses();
                    }
                }

                menu.attached.menu.attachedItem = this;

                menu.attached.menu.Show();
                if (!this.ContainsClass("WolfermusActive")) {
                    this.AddClass("WolfermusActive");
                    this.UpdateClasses();
                }

                //console.log(`${menu.attached.menu.id} Opening elementPointerEnterCallback`);
            };

            /**
             * @param {PointerEvent} event 
             */
            this.#groupPointerLeaveCallback = (event) => {
                if (this.id === undefined) return;

                if (menu.attached?.menu?.attachedItem !== this) {
                    if (this.ContainsClass("WolfermusActive")) {
                        this.RemoveClass("WolfermusActive");
                        this.UpdateClasses();
                    }
                    return;
                }
                if (menu.attached?.menu === undefined) return;
                if (menu.attached.menu.element === undefined) return;

                if (menu.attached.menu.attached?.menu?.attachedItem !== undefined) return;

                if (menu.attached?.menu?.cooldownTimeoutID !== undefined) {
                    clearTimeout(menu.attached.menu.cooldownTimeoutID);
                    menu.attached.menu.cooldownTimeoutID = undefined;
                }

                menu.attached.menu.cooldownTimeoutID = setTimeout(() => {
                    if (menu.attached?.menu?.attachedItem !== this) {
                        if (this.ContainsClass("WolfermusActive")) {
                            this.RemoveClass("WolfermusActive");
                            this.UpdateClasses();
                        }
                        return;
                    }
                    if (menu.attached?.menu === undefined) return;
                    if (menu.attached.menu.element === undefined) return;

                    if (menu.attached.menu.attached?.menu?.attachedItem !== undefined) return;

                    if (gottenGroup !== undefined && gottenGroup !== null) {
                        if (gottenGroup.matches(":hover") && menu.element.style["visibility"] !== "hidden") return;
                    }
                    if (!menu.element.matches(":hover") && menu.element.style["visibility"] !== "hidden") return;

                    //console.log(`${menu.attached.menu.id} Closing Via elementPointerLeaveCallback setTimeout 0`);

                    menu.attached.menu.Hide();
                    if (this.ContainsClass("WolfermusActive")) {
                        this.RemoveClass("WolfermusActive");
                        this.UpdateClasses();
                    }
                    menu.attached.menu.cooldownTimeoutID = undefined;
                }, 500);

                menu.attached.menu.element.style["transition"] = "";

                menu.attached.menu.timeoutID = setTimeout(() => {
                    if (menu.attached?.menu?.element === undefined) return;
                    menu.attached.menu.element.style["transition"] = "0s";
                    menu.attached.menu.timeoutID = undefined;
                }, 200);
            };

            menu.element.addEventListener("pointerenter", this.#menuPointerEnterCallback);
            menu.element.addEventListener("pointerleave", this.#menuPointerLeaveCallback);

            gottenGroup.addEventListener("pointerenter", this.#groupPointerEnterCallback);
            gottenGroup.addEventListener("pointerleave", this.#groupPointerLeaveCallback);


            /**
             * @param {InputEvent} event 
             */
            this.#collapse = (event) => {
                if (this.id === undefined) return;

                if (gottenGroup === undefined || gottenGroup === null) return;
                if (gottenSection === undefined || gottenSection === null) return;

                this.#UnloadItems(menu);

                this.#collapsed = true;
                gottenGroup.style.display = "";
                gottenSection.style.display = "none";

                this.#ExecuteCollapsedEvent();
            };

            /**
             * @param {InputEvent} event 
             */
            this.#expand = async (event) => {
                if (this.id === undefined) return;

                if (gottenGroup === undefined || gottenGroup === null) return;
                if (gottenSection === undefined || gottenSection === null) return;

                this.#collapsed = false;
                gottenGroup.style.display = "none";
                gottenSection.style.display = "";

                menu.attached?.menu?.Hide?.();

                this.#UnloadItems(menu);
                await this.#SetupItems(menu);

                this.#ExecuteCollapsedEvent();
            };

            gottenCollapseButton.addEventListener("click", this.#collapse);
            gottenGroup.addEventListener("click", this.#expand);

            if (!this.#collapsed) {
                gottenGroup.style.display = "none";
                gottenSection.style.display = "";
                this.#SetupItems(menu);
            } else {
                gottenGroup.style.display = "";
                gottenSection.style.display = "none";
            }

            return true;
        }

        /**
         * @param {WolfermusMenu} menu
         */
        RemoveEvents(menu) {
            super.RemoveEvents(menu);

            if (!this.#collapsed) {
                this.#UnloadItems(menu);
            }

            const gottenGroup = document.getElementById(`WolfermusMenu${menu.id}${this.id}Group`);
            const gottenCollapseButton = document.getElementById(`WolfermusMenu${menu.id}${this.id}GroupCollapseButton`);

            if (gottenGroup !== undefined && gottenGroup !== null) {
                if (this.#groupPointerEnterCallback !== undefined) gottenGroup.removeEventListener("pointerenter", this.#groupPointerEnterCallback);
                if (this.#groupPointerLeaveCallback !== undefined) gottenGroup.removeEventListener("pointerleave", this.#groupPointerLeaveCallback);
                if (this.#expand !== undefined) gottenGroup.removeEventListener("click", this.#expand);
            }

            if (gottenCollapseButton !== undefined && gottenCollapseButton !== null) {
                if (this.#collapse !== undefined) gottenCollapseButton.removeEventListener("click", this.#collapse);
            }

            this.#groupPointerEnterCallback = undefined;
            this.#groupPointerLeaveCallback = undefined;
            this.#expand = undefined;
            this.#collapse = undefined;

            if (menu?.element !== undefined) {
                if (this.#menuPointerEnterCallback !== undefined) menu.element.removeEventListener("pointerenter", this.#menuPointerEnterCallback);
                if (this.#menuPointerLeaveCallback !== undefined) menu.element.removeEventListener("pointerleave", this.#menuPointerLeaveCallback);
                this.#menuPointerEnterCallback = undefined;
                this.#menuPointerLeaveCallback = undefined;
            }
        }

        /**
         * @param {WolfermusMenu} menu
         * @returns {Boolean}
         */
        async #SetupItems(menu) {
            for (const menuItem of this.items) {
                await menuItem.SetupEvents(menu);
            }
        }

        /**
         * @param {WolfermusMenu} menu
         */
        #UnloadItems(menu) {
            for (const menuItem of this.items) {
                menuItem.RemoveEvents(menu);
            }
        }
    }

    mainMenuLibrary["Classes"]["Addons"]["WolfermusGroupMenuItem"] = WolfermusGroupMenuItem;

    const endTime = performance.now();
    console.info(`Wolfermus MainMenu: Addons - GroupMenuItem Added - Took ${endTime - startTime}ms`);
})();