var ForgePlugins = ForgePlugins || {};

/**
 * This plugin is a wrapper around FORGE.TextField, allowing someone to create a
 * text field from a tour.json, without having to access the javascript code and
 * instantiate itself a FORGE.TextField.
 */
ForgePlugins.SafariCORS = function()
{
    this._frame = null;
    this._textField = null;
    this._icon = null;
};

ForgePlugins.SafariCORS.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {

        this._frame = this.plugin.create.displayObjectContainer();
        this._frame.id = "forge-plugins-safari-alert-cors";
        this._frame.background = this.plugin.options.background;
        this._frame.borderRadius = this.plugin.options.borderRadius;
        this._frame.width = 520;
        this._frame.height = 200;
        this._frame.horizontalCenter = true;
        this._frame.verticalCenter = true;

        this._textField = this.plugin.create.textField();
        this._textField.value = this.plugin.options.text;
        this._textField.width = 350;
        this._textField.verticalCenter = true;
        this._textField.right = 10;
        this._textField.pointer.enabled = true;
        this._frame.addChild(this._textField);

        this._icon = this.plugin.create.image(this.plugin.options.icon);
        this._icon.verticalCenter = true;
        this._icon.left = 10;
        this._frame.addChild(this._icon);

        // Add the text field to the main container
        this.plugin.container.addChild(this._frame);

        this._check();
    },

    /**
     * Reload the configuration of the text field
     */
    reset: function()
    {
        this._check();
    },

    /**
     * Show the text field
     */
    show: function()
    {
        this._frame.show();
    },

    /**
     * Hide the text field
     */
    hide: function()
    {
        this._frame.hide();
    },

    /**
     * Destroy the text field
     */
    destroy: function()
    {
        this._frame = null;
        this._textField = null;
        this._icon = null;
    },

    _check: function()
    {
        if(FORGE.Device.safari === true && this.viewer.story.scene.config.media.type === "video")
        {
            var mediaConfig = this.viewer.story.scene.config.media;
            var mediaOptions = mediaConfig.options || {};

            mediaOptions.autoPlay = false;

            this.show();
        }
        else
        {
            this.hide();
        }
    }
};