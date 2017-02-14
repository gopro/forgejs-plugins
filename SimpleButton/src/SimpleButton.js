var ForgePlugins = ForgePlugins || {};

/**
 * This plugin is a wrapper around FORGE.Button, allowing someone to create a
 * button from the project json configuration, without having to access the javascript code and
 * instantiate itself a FORGE.Button.
 */
ForgePlugins.SimpleButton = function()
{
    // The button, a FORGE.Button instance
    this._btn = null;
};

ForgePlugins.SimpleButton.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {
        // Create a FORGE.Button instance
        this._btn = this.plugin.create.button();

        // Set properties to the button
        this._btn.top = this.plugin.options.top;
        this._btn.right = this.plugin.options.right;
        this._btn.bottom = this.plugin.options.bottom;
        this._btn.left = this.plugin.options.left;
        this._btn.horizontalCenter = this.plugin.options.horizontalCenter;
        this._btn.verticalCenter = this.plugin.options.verticalCenter;

        var skin = this._btn.skin;

        // Set the skin if any
        if (typeof this.plugin.options.skin !== "undefined")
        {
            // default state
            if (typeof this.plugin.options.skin.out !== "undefined")
            {
                skin.out = FORGE.Utils.extendMultipleObjects((this.plugin.options.defaultSkin === true ? FORGE.ButtonSkin.DEFAULT_STATE : {}), skin.out, this.plugin.options.skin.out);
            }

            // skin.out is the default skin state for over state
            if (typeof this.plugin.options.skin.over !== "undefined")
            {
                skin.over = FORGE.Utils.extendMultipleObjects(skin.out, skin.over, this.plugin.options.skin.over);
            }

            // skin.out is the default skin state for down state
            if (typeof this.plugin.options.skin.down !== "undefined")
            {
                skin.down = FORGE.Utils.extendMultipleObjects(skin.out, skin.down, this.plugin.options.skin.down);
            }
        }

        // Set the global value if any
        if (this.plugin.options.value !== undefined && this.plugin.options.value !== null)
        {
            if(typeof skin.out.label !== "undefined")
            {
                skin.out.label.value = this.plugin.options.value;
            }
            if(typeof skin.over.label !== "undefined")
            {
                skin.over.label.value = this.plugin.options.value;
            }
            if(typeof skin.down.label !== "undefined")
            {
                skin.down.label.value = this.plugin.options.value;
            }
        }

        this._btn.updateSkin();

        this._btn.width = this.plugin.options.width;
        this._btn.height = this.plugin.options.height;

        // Add the button to the main container
        this.plugin.container.addChild(this._btn);

        // Add the events handlers
        this._btn.pointer.onClick.add(this._btnClickHandler, this);
        this._btn.pointer.onOut.add(this._btnOutHandler, this);
        this._btn.pointer.onOver.add(this._btnOverHandler, this);
        this._btn.pointer.onDown.add(this._btnDownHandler, this);
    },

    /**
     * Fires the handler for a click on the button.
     */
    _btnClickHandler: function(event)
    {
        this.plugin.events.onClick.dispatch();
    },

    /**
     * Fires the handler for going out the button.
     */
    _btnOutHandler: function(event)
    {
        this.plugin.events.onOut.dispatch();
    },

    /**
     * Fires the handler for being over the button.
     */
    _btnOverHandler: function(event)
    {
        this.plugin.events.onOver.dispatch();
    },

    /**
     * Fires the handler for the button currently being click on (click
     * maintained).
     */
    _btnDownHandler: function(event)
    {
        this.plugin.events.onDown.dispatch();
    },

    /**
     * Show the button
     */
    show: function()
    {
        this._btn.show();
    },

    /**
     * Hide the button
     */
    hide: function()
    {
        this._btn.hide();
    },

    /**
     * Set a new text
     * @param {string} value
     */
    setText: function(value)
    {
        if (value !== undefined && value !== null)
        {
            var skin = this._btn.skin;

            if(typeof skin.out.label !== "undefined")
            {
                skin.out.label.value = value;
            }
            if(typeof skin.over.label !== "undefined")
            {
                skin.over.label.value = value;
            }
            if(typeof skin.down.label !== "undefined")
            {
                skin.down.label.value = value;
            }

            this._btn.updateSkin();
        }
    },

    /**
     * Destroy the button.
     */
    destroy: function()
    {
        this._btn.destroy();
        this._btn = null;
    }
};