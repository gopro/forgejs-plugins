var ForgePlugins = ForgePlugins || {};

/**
 * The plugin provides a button for WebVR toggle
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
     * The skin state for off button
     * @name ForgePlugins.WebVRButton#_btnSkinOff
     * @type {ButtonSkinStateConfig}
     * @private
     */
    this._btnSkinOff = null;

    /**
     * The skin state for off button
     * @name ForgePlugins.WebVRButton#_btnSkinOn
     * @type {ButtonSkinStateConfig}
     * @private
     */
    this._btnSkinOn = null;

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
        this._btn.top = this.plugin.options.top;
        this._btn.right = this.plugin.options.right;
        this._btn.bottom = this.plugin.options.bottom;
        this._btn.left = this.plugin.options.left;
        this._btn.horizontalCenter = this.plugin.options.horizontalCenter;
        this._btn.verticalCenter = this.plugin.options.verticalCenter;

        var off =
        {
            autoWidth: false,
            autoHeight: false,
            background: this.plugin.options.background,
            image: { url: this.plugin.fullUrl + this.plugin.options.off },
            label: { value: "" }
        };
        this._btnSkinOff = FORGE.Utils.extendMultipleObjects(this._btn.skin.out, off);

        var on =
        {
            autoWidth: false,
            autoHeight: false,
            background: this.plugin.options.background,
            image: { url: this.plugin.fullUrl + this.plugin.options.on },
            label: { value: "" }
        };
        this._btnSkinOn = FORGE.Utils.extendMultipleObjects(this._btn.skin.out, on);

        // Add the skin
        this._btn.skin.out = this._btnSkinOff;
        this._btn.skin.over = this._btnSkinOn;
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
            this._btn.skin.out = this._btnSkinOn;
            this._btn.skin.over = this._btnSkinOff;
            this._btn.skin.down = this._btn.skin.over;
        }
        else
        {
            this._btn.skin.out = this._btnSkinOff;
            this._btn.skin.over = this._btnSkinOn;
            this._btn.skin.down = this._btn.skin.over;
        }
    },

    destroy: function()
    {
        this._btn = null;
    }
};