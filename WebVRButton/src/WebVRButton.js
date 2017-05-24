var ForgePlugins = ForgePlugins || {};

/**
 * The plugin provides a button for Gyroscope toggle
 */
ForgePlugins.WebVRButton = function()
{
    /**
     * The image that is the button. It is made of a single sprite that got two frames.
     * @name ForgePlugins.WebVRButton#_image
     * @type {FORGE.Image}
     * @private
     */
    this._image = null;
};

ForgePlugins.WebVRButton.prototype =
{
    /**
     * Boot function, add the button to the scene given the position.
     */
    boot: function()
    {
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
        this._image.pointer.onOver.add(this._imageOverHandler, this);
        this._image.pointer.onOut.add(this._imageOutHandler, this);

        this._imageChange(this.viewer.renderer.presentingVR);
    },

    _imageClickHandler: function()
    {
        this.viewer.renderer.toggleVR();
        this._imageChange(this.viewer.renderer.presentingVR);
    },

    _imageOverHandler: function()
    {
        this._imageChange(!this.viewer.renderer.presentingVR);
    },

    _imageOutHandler: function()
    {
        this._imageChange(this.viewer.renderer.presentingVR);
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
