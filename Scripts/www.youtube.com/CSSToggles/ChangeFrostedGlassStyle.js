async () => {
    /**
     * @param {number | undefined} ms
     */
    function Sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        });
    }

    /**
     * @returns {HTMLStyleElement}
     */
    function WolfermusYoutubeGetSetStyleElement() {
        const wlfYoutubeStyleElementIDName = "wlf-youtube-style-overrides";

        let wlfYoutubeStyleElement = document.getElementById(wlfYoutubeStyleElementIDName);

        if (wlfYoutubeStyleElement === null) {
            wlfYoutubeStyleElement = document.createElement('style');
            wlfYoutubeStyleElement.id = wlfYoutubeStyleElementIDName;
            document.head.append(wlfYoutubeStyleElement);
        }

        return wlfYoutubeStyleElement;
    }

    let gottenElement = document.getElementById("frosted-glass");
    if (gottenElement === null) return;

    // Get the current background-color value:
    let value = getComputedStyle(gottenElement).getPropertyValue("background-color");
    console.log(value);

    // Get all color components (alpha may not be there if = 1):
    let parts = value.match(/[\d.]+/g);

    // If alpha is not there, add it:
    if (parts.length === 3) {
        parts.push(1);
    }

    let wlfStopInf = 50;

    while (parts[0] === "0" && parts[1] === "0" && parts[2] === "0") {
        if (wlfStopInf <= 0) return;
        await Sleep(200);

        parts = null;

        gottenElement = document.getElementById("frosted-glass");
        if (gottenElement === null) return;

        // TODO: Fix bug when no background colour for example when opening youtube in private and there is not videos.
        // Get the current background-color value:
        value = getComputedStyle(gottenElement).getPropertyValue("background-color");

        // Get all color components (alpha may not be there if = 1):
        parts = value.match(/[\d.]+/g);

        // If alpha is not there, add it:
        if (parts.length === 3) {
            parts.push(1);
        }
        wlfStopInf--;
    }

    // Modify alpha:
    parts[3] = "1";

    WolfermusYoutubeGetSetStyleElement().textContent = `
    #frosted-glass.with-chipbar.ytd-app {
        background: rgba(${parts.join(',')});
    }
    `;
};