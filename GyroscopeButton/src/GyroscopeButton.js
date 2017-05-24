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

    /**
     * The reference to the gyroscope controller.
     * @name ForgePlugins.GyroscopeButton#_gyroscope
     * @type {FORGE.ControllerGyroscope}
     * @private
     */
    this._gyroscope = null;
};

ForgePlugins.GyroscopeButton.prototype =
{
    /**
     * Boot function, add the button to the scene given the position.
     */
    boot: function()
    {
        FORGE.Device.onReady.addOnce(this._deviceReadyHandler, this);
    },

    _deviceReadyHandler: function()
    {
        this._gyroscope = this.viewer.controllers.getByType(FORGE.ControllerType.GYROSCOPE);

        if (this._gyroscope === null)
        {
            return;
        }

        var config = {
            url: this.plugin.options.image
        };

        this._image = this.plugin.create.image(config);
        this._image.background = this.plugin.options.background;
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

        this._imageChange(this._gyroscope.enabled);
    },

    _imageClickHandler: function()
    {
        this._gyroscope.enabled = !this._gyroscope.enabled;
        this._imageChange(this._gyroscope.enabled);
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
