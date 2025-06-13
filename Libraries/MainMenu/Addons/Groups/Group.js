(async () => {
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
        await Sleep(200);
        antiStuckLoop--;
    }

    const mainMenuLibrary = WolfermusGetLibrary("MainMenu");

    if (mainMenuLibrary["Classes"]["Addons"]?.["Groups"]?.["WolfermusGroupMenuItem"] !== undefined) return;

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
        constructor(id, title, tooltip = "") {
            super(id, title, tooltip);
            this.RemoveClass("WolfermusTextItem");
        }

        /**
         * @type {Array<WolfermusMenuItem>}
         */
        items = [];

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
         * @param {WolfermusMenu} menu
         * @returns {string}
         */
        Generate(menu) {
            if (this.id === undefined) return "";

            return `
                <li id="WolfermusMenu${menu.id}${this.id}" class="${this.classes.join(" ")}">
                    <a class="WolfermusGroup WolfermusGroupRightPosition"><</a>    
                    <a class="WolfermusTitle">${this.title}</a>
                    <a class="WolfermusGroup WolfermusGroupLeftPosition">></a>
                </li>
            `;
        }

        /**
         * @param {WolfermusMenu} menu
         * @returns {Boolean}
         */
        async SetupEvents(menu) {
            // TODO: Check which RemoveEvents gets called within super.SetupEvents
            if (!super.SetupEvents(menu)) return false;

            const wolfermusRoot = await GetWolfermusRoot();
            if (wolfermusRoot === undefined || wolfermusRoot === null) return false;

            /**
             * @param {PointerEvent} event 
             */
            this.#menuPointerEnterCallback = (event) => {
                if (this.id === undefined) return;

                if (menu.attached?.id !== this.id) {
                    if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                    return;
                }
                if (menu.attached?.menu === undefined) return;
                if (menu.attached?.menu.element === undefined) return;
                if (menu.attached.menu.IsHoveringAnyMenu()) return;

                if (menu.attached?.cooldownTimeoutID !== undefined) {
                    clearTimeout(menu.attached.cooldownTimeoutID);
                    menu.attached.cooldownTimeoutID = undefined;
                }

                menu.attached.cooldownTimeoutID = setTimeout(() => {
                    if (menu.attached?.id !== this.id) {
                        if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                        return;
                    }
                    if (menu.attached?.menu === undefined) return;
                    if (menu.attached?.menu.element === undefined) return;
                    if (menu.attached.menu.IsHoveringAnyMenu()) return;

                    if (this.element !== undefined && this.element !== null) {
                        if (this.element.matches(":hover") && menu.element.style["visibility"] !== "hidden") return;
                    }
                    if (menu.element !== undefined && menu.element !== null) {
                        if (!menu.element.matches(":hover") && menu.element.style["visibility"] !== "hidden") return;
                    }

                    //console.log(`${menu.attached.menu.id} Closing Via menuPointerEnterCallback`);

                    menu.attached.menu.Hide();
                    menu.attached.id = undefined;
                    if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                }, 500);
            }

            /**
             * @param {PointerEvent} event 
             */
            this.#menuPointerLeaveCallback = (event) => {
                if (this.id === undefined) return;

                if (menu.attached?.id !== this.id) {
                    if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                    return;
                }
                if (menu.attached?.menu === undefined) return;

                if (menu.attached?.cooldownTimeoutID !== undefined) {
                    clearTimeout(menu.attached.cooldownTimeoutID);
                    menu.attached.cooldownTimeoutID = undefined;
                }
            }

            /**
             * @param {PointerEvent} event 
             */
            this.#groupPointerEnterCallback = async (event) => {
                if (menu.attached?.timeoutID !== undefined) {
                    clearTimeout(menu.attached.timeoutID);
                    menu.attached.timeoutID = undefined;
                }

                if (this.id === undefined) {
                    if (menu.attached?.cooldownTimeoutID !== undefined) {
                        clearTimeout(menu.attached.cooldownTimeoutID);
                        menu.attached.cooldownTimeoutID = undefined;
                    }
                    return;
                }

                if (menu.attached === undefined) menu.attached = {};
                if (menu.attached.menu === undefined) {
                    menu.attached.menu = new WolfermusMenu();
                    menu.attached.menu.AddClass("WolfermusGroupMenuWindow");
                }

                if (menu.attached.id === this.id) return;

                if (menu.attached.id !== undefined) {
                    this.element.style["background-color"] = "";
                }

                if (menu.attached?.cooldownTimeoutID !== undefined) {
                    clearTimeout(menu.attached.cooldownTimeoutID);
                    menu.attached.cooldownTimeoutID = undefined;
                    let gottenItem = menu.items.find((item) => item.id === menu.attached.id);
                    if (gottenItem !== undefined && gottenItem.element !== undefined && gottenItem.element !== null) gottenItem.element.style["background-color"] = "";
                }

                menu.attached.menu.Hide();

                if (this.element === undefined || this.element === null) return;

                if (menu.element === undefined || menu.element.style["visibility"] === "hidden") return;

                const menuItemGroupCollection = this.element.getElementsByClassName("WolfermusGroup");
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

                menu.attached.id = this.id;

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

                if (menu.attached?.cooldownTimeoutID !== undefined) {
                    clearTimeout(menu.attached.cooldownTimeoutID);
                    menu.attached.cooldownTimeoutID = undefined;
                    let gottenItem = menu.items.find((item) => item.id === menu.attached.id);
                    if (gottenItem !== undefined && gottenItem.element !== undefined && gottenItem.element !== null) gottenItem.element.style["background-color"] = "";
                }

                menu.attached.menu.Show();
                this.element.style["background-color"] = "#3d3d3d";

                //console.log(`${menu.attached.menu.id} Opening elementPointerEnterCallback`);
            };

            /**
             * @param {PointerEvent} event 
             */
            this.#groupPointerLeaveCallback = (event) => {
                if (this.id === undefined) return;

                if (menu.attached?.id !== this.id) {
                    if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                    return;
                }
                if (menu.attached?.menu === undefined) return;
                if (menu.attached.menu.element === undefined) return;

                if (menu.attached?.cooldownTimeoutID !== undefined) {
                    clearTimeout(menu.attached.cooldownTimeoutID);
                    menu.attached.cooldownTimeoutID = undefined;
                }

                if (menu.attached.menu.attached?.id !== undefined) return;

                menu.attached.cooldownTimeoutID = setTimeout(() => {
                    if (menu.attached?.id !== this.id) {
                        if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                        return;
                    }
                    if (menu.attached?.menu === undefined) return;
                    if (menu.attached.menu.element === undefined) return;

                    if (menu.attached.menu.attached.id !== undefined) return;

                    if (this.element !== undefined && this.element !== null) {
                        if (this.element.matches(":hover") && menu.element.style["visibility"] !== "hidden") return;
                    }
                    if (!menu.element.matches(":hover") && menu.element.style["visibility"] !== "hidden") return;

                    //console.log(`${menu.attached.menu.id} Closing Via elementPointerLeaveCallback setTimeout 0`);

                    menu.attached.menu.Hide();
                    menu.attached.id = undefined;
                    if (this.element !== undefined && this.element !== null) this.element.style["background-color"] = "";
                }, 500);

                menu.attached.menu.element.style["transition"] = "";

                menu.attached.timeoutID = setTimeout(() => {
                    if (menu.attached?.menu?.element === undefined) return;
                    menu.attached.menu.element.style["transition"] = "0s";
                }, 200);
            };

            menu.element.addEventListener("pointerenter", this.#menuPointerEnterCallback);
            menu.element.addEventListener("pointerleave", this.#menuPointerLeaveCallback);

            this.element.addEventListener("pointerenter", this.#groupPointerEnterCallback);
            this.element.addEventListener("pointerleave", this.#groupPointerLeaveCallback);

            return true;
        }

        /**
         * @param {WolfermusMenu} menu
         */
        RemoveEvents(menu) {
            super.RemoveEvents(menu);

            if (this.element !== undefined && this.element !== null) {
                if (this.#groupPointerEnterCallback !== undefined) this.element.removeEventListener("pointerenter", this.#groupPointerEnterCallback);
                if (this.#groupPointerLeaveCallback !== undefined) this.element.removeEventListener("pointerleave", this.#groupPointerLeaveCallback);
                this.#groupPointerEnterCallback = undefined;
                this.#groupPointerLeaveCallback = undefined;
            }

            if (menu?.element !== undefined) {
                if (this.#menuPointerEnterCallback !== undefined) menu.element.removeEventListener("pointerenter", this.#menuPointerEnterCallback);
                if (this.#menuPointerLeaveCallback !== undefined) menu.element.removeEventListener("pointerleave", this.#menuPointerLeaveCallback);
                this.#menuPointerEnterCallback = undefined;
                this.#menuPointerLeaveCallback = undefined;
            }
        }
    }

    mainMenuLibrary["Classes"]["Addons"]["Groups"] = {};
    mainMenuLibrary["Classes"]["Addons"]["Groups"]["WolfermusGroupMenuItem"] = WolfermusGroupMenuItem;
})();