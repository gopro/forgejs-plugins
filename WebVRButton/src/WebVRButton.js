var ForgePlugins = ForgePlugins || {};

/**
 * The plugin provides a button
 */
ForgePlugins.WebVRButton = function()
{
    /**
     * The real button.
     * @name ForgePlugins.WebVRButton#_btn
     * @type {FORGE.Button}
     * @private
     */
    this._btn = null;

    /**
     * Is the VR activated?
     * @name ForgePlugins.WebVRButton#_vrActivated
     * @type {boolean}
     * @private
     */
    this._vrActivated = false;
};

ForgePlugins.WebVRButton.prototype =
{
    /**
     * Boot function, add the button to the scene given the position.
     */
    boot: function()
    {
        // Create the button
        this._btn = this.plugin.create.button();

        // Parse the value of the position
        var vPos, hPos;

        switch(this.plugin.options.position)
        {
            case "topLeft":
                vPos = "top";
                hPos = "left";
                break;
            case "top":
                vPos = "top";
                hPos = "center";
                break;
            case "topRight":
                vPos = "top";
                hPos = "right";
                break;
            case "left":
                vPos = "center";
                hPos = "left";
                break;
            case "right":
                vPos = "center";
                hPos = "right";
                break;
            case "bottomLeft":
                vPos = "bottom";
                hPos = "left";
                break;
            case "bottom":
                vPos = "bottom";
                hPos = "center";
                break;
            default:
                vPos = "bottom";
                hPos = "right";
                break;
        }

        if (vPos === "center")
        {
            this._btn.verticalCenter = true;
        }
        else if (vPos === "top" || vPos === "bottom")
        {
            this._btn[vPos] = this.plugin.options.offset;
        }

        if (hPos === "center")
        {
            this._btn.horizontalCenter = true;
        }
        else if (hPos === "left" || hPos === "right")
        {
            this._btn[hPos] = this.plugin.options.offset;
        }

        // Add the skin
        this._btn.skin.out = FORGE.Utils.extendMultipleObjects(this._btn.skin.out,
            {
                autoWidth: false,
                autoHeight: false,
                image: { url: this.plugin.fullUrl + this.plugin.options.off },
                label: { value: "" }
            });
        this._btn.skin.over = FORGE.Utils.extendMultipleObjects(this._btn.skin.out,
            {
                autoWidth: false,
                autoHeight: false,
                image: { url: this.plugin.fullUrl + this.plugin.options.on },
                label: { value: "" }
            });
        this._btn.skin.down = this._btn.skin.over;

        // Apply the skin
        this._btn.updateSkin();

        this._btn.width = 60;
        this._btn.height = 40;

        // Add the button
        this.plugin.container.addChild(this._btn);

        // Add on click event
        this._btn.pointer.onClick.add(this._btnClickHandler, this);
    },

    _btnClickHandler: function()
    {
        this.viewer.renderer.toggleVR();

        this._vrActivated = this.viewer.renderer.presentingVR;

        if (this._vrActivated === true)
        {
            this._btn.skin.out = FORGE.Utils.extendMultipleObjects(this._btn.skin.out,
                {
                    autoWidth: false,
                    autoHeight: false,
                    image: { url: this.plugin.fullUrl + this.plugin.options.on },
                    label: { value: "" }
                });
            this._btn.skin.over = FORGE.Utils.extendMultipleObjects(this._btn.skin.out,
                {
                    autoWidth: false,
                    autoHeight: false,
                    image: { url: this.plugin.fullUrl + this.plugin.options.off },
                    label: { value: "" }
                });
            this._btn.skin.down = this._btn.skin.over;
        }
        else
        {
            this._btn.skin.out = FORGE.Utils.extendMultipleObjects(this._btn.skin.out,
                {
                    autoWidth: false,
                    autoHeight: false,
                    image: { url: this.plugin.fullUrl + this.plugin.options.off },
                    label: { value: "" }
                });
            this._btn.skin.over = FORGE.Utils.extendMultipleObjects(this._btn.skin.out,
                {
                    autoWidth: false,
                    autoHeight: false,
                    image: { url: this.plugin.fullUrl + this.plugin.options.on },
                    label: { value: "" }
                });
            this._btn.skin.down = this._btn.skin.over;
        }
    },

    destroy: function()
    {
        this._btn.destroy();
        this._btn = null;
    }
};