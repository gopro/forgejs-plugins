var ForgePlugins = ForgePlugins || {};

/**
 * The plugin provides a button for Gyroscope toggle
 */
ForgePlugins.GyroscopeButton = function()
{
    /**
     * The image that is the button. It is made of a single sprite that got two frames.
     * @name ForgePlugins.GyroscopeButton#_image
     * @type {FORGE.Image}
     * @private
     */
    this._image = null;
};

ForgePlugins.GyroscopeButton.prototype =
{
    /**
     * Boot function, add the button to the scene given the position.
     */
    boot: function()
    {
        if (FORGE.Device.ready === false)
        {
            window.setTimeout(ForgePlugins.GyroscopeButton.prototype.boot.bind(this), 10);
            return;
        }

        var config = {
            url: this.plugin.fullUrl + this.plugin.options.image,
        };

        this._image = this.plugin.create.image(config);
        this._image.top = this.plugin.options.top;
        this._image.right = this.plugin.options.right;
        this._image.bottom = this.plugin.options.bottom;
        this._image.left = this.plugin.options.left;
        this._image.horizontalCenter = this.plugin.options.horizontalCenter;
        this._image.verticalCenter = this.plugin.options.verticalCenter;
        this._image.width = 64;
        this._image.height = 64;

        this.plugin.container.addChild(this._image);

        this._image.pointer.enabled = true;
        this._image.pointer.cursor = FORGE.Pointer.cursors.POINTER;
        this._image.pointer.onClick.add(this._imageClickHandler, this);

        this._imageChange(this.viewer.controllers.gyroscope);
    },

    _imageClickHandler: function()
    {
        this.viewer.controllers.gyroscope = !this.viewer.controllers.gyroscope;
        this._imageChange(this.viewer.controllers.gyroscope);
    },

    _imageChange: function(on)
    {
        var frame = { x: 0, y: 64, w: 64, h: 64 };

        if (on === true)
        {
            frame.y = 0;
        }

        this._image.frame = frame;
    },

    destroy: function()
    {
        this._image = null;
    }
};
