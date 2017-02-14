
var ForgePlugins = ForgePlugins || {};

/**
 * Plugin allowing a selection of the locale, with using a flag for each
 * language. There is no limit in the number of supported locale, only the limit of the screen.
 */
ForgePlugins.LocaleSelector = function()
{
    this._container = null;

    // The list of flags
    this._flags = [];

    // The width of a flag
    this._flagWidth = 0;

    // The height of a flag
    this._flagHeigth = 0;

    // The margin between each flag
    this._flagMargin = 0;
};

ForgePlugins.LocaleSelector.prototype =
{
    /**
     * The boot function, initialize the container of the flags, and then the
     * flags.
     */
    boot: function()
    {
        // Get a list of the supported locales
        var locales = this.viewer.i18n.locales;

        // Set general options
        this._flagWidth = this.plugin.options.flagWidth;
        this._flagHeight = this.plugin.options.flagHeight;
        this._flagMargin = this.plugin.options.flagMargin;

        // Create a root container and place it on the scene
        this._container = this.plugin.create.displayObjectContainer();
        this._container.width = (this._flagWidth * locales.length) + (this._flagMargin * (locales.length - 1));
        this._container.height = this._flagHeight;
        this._container.top = this.plugin.options.top;
        this._container.left = this.plugin.options.left;
        this._container.right = this.plugin.options.right;
        this._container.bottom = this.plugin.options.bottom;

        this._container.horizontalCenter = this.plugin.options.horizontalCenter;
        this._container.verticalCenter = this.plugin.options.verticalCenter;

        // Add the container to the scene
        this.plugin.container.addChild(this._container);

        // Create a flag for each locale
        for (var i = 0, ii = locales.length; i < ii; i++)
        {
            this._createFlag(locales[i]);
        }

    },

    /**
     * Create a flag (from a FORGE.Button) for each locale.
     * @param  {string} locale - the name of the locale
     */
    _createFlag: function(locale)
    {
        // Get the location of the folder containing the flags
        var pluginUrl = this.plugin.fullUrl;
        pluginUrl += FORGE.Utils.endsWith(pluginUrl,"/") ? "" : "/";

        var imgUrl = this.plugin.options.baseURL.replace("{{plugin_url}}", pluginUrl);
            imgUrl += this.plugin.options.fileName.replace("{{locale}}", locale);

        var skinConfig =
        {
            skin:
            {
                "name": "localeSelectorSkin",
                "states":
                {
                    "out":
                    {
                        "image":
                        {
                            "url": imgUrl,
                            "alpha": 0.7
                        }
                    },

                    "over":
                    {
                        "image":
                        {
                            "alpha": 1.0
                        }
                    }
                }
            }
        };

        // The created flag is a FORGE.Button
        var flag = this.plugin.create.button(skinConfig);
        flag.width = this._flagWidth;
        flag.x = this._flags.length * (flag.width + this._flagMargin);
        flag.data = {
            locale: locale
        };

        // Event handling with the pointer object
        flag.pointer.onClick.add(this._flagClickHandler, this);

        // Add the flag to the list and to the container
        this._flags.push(flag);
        this._container.addChild(flag);
    },

    /**
     * Handle the click on a flag by setting the current locale as the one
     * associated to the selected flag.
     */
    _flagClickHandler: function(event)
    {
        var locale = event.emitter.data.locale;
        this.viewer.i18n.locale = locale;
    },

    /**
     * Show the flags
     */
    show: function()
    {
        this._container.show();
    },

    /**
     * Hide the flags
     */
    hide: function()
    {
        this._container.hide();
    },

    /**
     * Destroy the container and its flags
     */
    destroy: function()
    {
        this._container = null;
        this._flags = null;
    }
};