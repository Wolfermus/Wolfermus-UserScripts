await(async () => {
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

    WolfermusYoutubeGetSetStyleElement().textContent = ``;
})();