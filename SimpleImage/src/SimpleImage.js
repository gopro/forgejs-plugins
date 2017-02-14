var ForgePlugins = ForgePlugins || {};

/**
 * This plugin is a wrapper around FORGE.Image, allowing someone to create a
 * image from a project json configuration, without having to access the javascript code and
 * instantiate itself a FORGE.Image.
 */
ForgePlugins.SimpleImage = function()
{
    // The image, a FORGE.Image instance
    this._image = null;
};

ForgePlugins.SimpleImage.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {
        // The config for FORGE.Image constructor
        var config = {
            width: this.plugin.options.width,
            height: this.plugin.options.height,
            alpha: this.plugin.options.alpha,
            key: this.plugin.options.key,
            url: this.plugin.options.url,
            keepRatio: this.plugin.options.keepRatio,
            maximized: this.plugin.options.maximized
        };

        // Create a FORGE.Image instance
        this._image = this.plugin.create.image(config, false);

        // Set properties to the image
        this._image.top = this.plugin.options.top;
        this._image.right = this.plugin.options.right;
        this._image.bottom = this.plugin.options.bottom;
        this._image.left = this.plugin.options.left;
        this._image.horizontalCenter = this.plugin.options.horizontalCenter;
        this._image.verticalCenter = this.plugin.options.verticalCenter;

        // Add the image to the main container
        this.plugin.container.addChild(this._image);

        // Add the events handlers
        this._image.pointer.onClick.add(this._imgClickHandler, this);
        this._image.pointer.onOut.add(this._imgOutHandler, this);
        this._image.pointer.onOver.add(this._imgOverHandler, this);
        this._image.pointer.onDown.add(this._imgDownHandler, this);
    },

    /**
     * Fires the handler for a click on the image
     */
    _imgClickHandler: function(event)
    {
        this.plugin.events.click.dispatch();
    },

    /**
     * Fires the handler for going out on the image
     */
    _imgOutHandler: function(event)
    {
        this.plugin.events.out.dispatch();
    },

    /**
     * Fires the handler for being over the image
     */
    _imgOverHandler: function(event)
    {
        this.plugin.events.over.dispatch();
    },

    /**
     * Fires the handler for the image currently being click on (click
     * maintained)
     */
    _imgDownHandler: function(event)
    {
        this.plugin.events.down.dispatch();
    },

    /**
     * Show the image
     */
    show: function()
    {
        this._image.show();
    },

    /**
     * Hide the image
     */
    hide: function()
    {
        this._image.hide();
    },

    /**
     * Destroy the image
     */
    destroy: function()
    {
        this._image = null;
    }
};