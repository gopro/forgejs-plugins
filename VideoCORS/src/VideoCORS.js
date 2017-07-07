var ForgePlugins = ForgePlugins || {};

ForgePlugins.VideoCORS = function()
{
    this._frame = null;
    this._textField = null;
    this._icon = null;
};

ForgePlugins.VideoCORS.prototype =
{
    boot: function()
    {
        this._frame = this.plugin.create.displayObjectContainer();
        this._frame.id = "forge-plugins-video-alert-cors";
        this._frame.background = this.plugin.options.background;
        this._frame.borderRadius = this.plugin.options.borderRadius;
        this._frame.width = 520;
        this._frame.height = 200;
        this._frame.horizontalCenter = true;
        this._frame.verticalCenter = true;

        var browserName = FORGE.Device.browser.charAt(0).toUpperCase() + FORGE.Device.browser.slice(1);
        this._textField = this.plugin.create.textField();
        this._textField.value = this.plugin.options.text.replace(new RegExp('{{browser}}', 'g'), browserName);
        this._textField.width = 350;
        this._textField.verticalCenter = true;
        this._textField.right = 10;
        this._textField.pointer.enabled = true;
        this._frame.addChild(this._textField);

        this._icon = this.plugin.create.image(this.plugin.options.icon);
        this._icon.verticalCenter = true;
        this._icon.left = 10;
        this._frame.addChild(this._icon);

        this.plugin.container.addChild(this._frame);

        this._check();
    },

    reset: function()
    {
        this._check();
    },

    show: function()
    {
        this._frame.show();
    },

    hide: function()
    {
        this._frame.hide();
    },

    destroy: function()
    {
        this._frame = null;
        this._textField = null;
        this._icon = null;
    },

    _check: function()
    {
        if(typeof this.viewer.story.scene.config.media !== "undefined" && this.viewer.story.scene.config.media.type === "video")
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