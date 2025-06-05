`
<span id="WolfermusMenuItemToolTip" class="WolfermusPopUpMenu WolfermusText">
    <a id="WolfermusToolTipText">
    </a>
</span>
<div id="WolfermusMainMenuContextMenu" class="WolfermusPopUpMenu WolfermusText">
    <ul class="WolfermusDefaultCSS">
        ${GenerateContextItems()}
    </ul>
</div>
<div id="WolfermusFloatingSnapBtnWrapper"
    class="WolfermusDefaultCSS ${WolfermusMainMenuSettings.Direction?.Horizontal ? WolfermusMainMenuSettings.Direction?.Horizontal : ""} ${WolfermusMainMenuSettings.Direction?.Vertical ? WolfermusMainMenuSettings.Direction?.Vertical : ""}"
    style="${WolfermusMainMenuSettings.Top ? " top: " + WolfermusMainMenuSettings.Top + " px;" : ""}
    ${WolfermusMainMenuSettings.Left ? "left: " + WolfermusMainMenuSettings.Left + "px;" : ""}">
    <!-- BEGIN :: Floating Button -->
    <div id="WolfermusFloatingSnapBtn" class="WolfermusFabBtn WolfermusDefaultCSS WolfermusPopUpMenu">
        <img src="${imgSrc}" class="WolfermusDefaultCSS"></img>
    </div>
    <!-- END :: Floating Button -->
    <!-- BEGIN :: Expand Section -->
    <div class="WolfermusActivatedMainMenuWindow WolfermusDefaultCSS WolfermusPopUpMenu WolfermusText">
        <a>Bruh Test</a>
        <ul class="WolfermusDefaultCSS">
            ${GenerateMenuItems()}
        </ul>
    </div>
    <!-- END :: Expand Section -->
</div>
`