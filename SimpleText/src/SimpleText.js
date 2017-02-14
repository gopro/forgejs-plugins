var ForgePlugins = ForgePlugins || {};

/**
 * This plugin is a wrapper around FORGE.TextField, allowing someone to create a
 * text field from a project json configuration, without having to access the javascript code and
 * instantiate itself a FORGE.TextField.
 */
ForgePlugins.SimpleText = function()
{
    // The text field, a FORGE.TextField instance
    this._textField = null;
};

ForgePlugins.SimpleText.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {
        // Create a FORGE.TextField instance
        this._textField = this.plugin.create.textField(this.plugin.options.config);

        // Set properties to the text field
        this._textField.top = this.plugin.options.top;
        this._textField.right = this.plugin.options.right;
        this._textField.bottom = this.plugin.options.bottom;
        this._textField.left = this.plugin.options.left;
        this._textField.horizontalCenter = this.plugin.options.horizontalCenter;
        this._textField.verticalCenter = this.plugin.options.verticalCenter;

        // Add the text field to the main container
        this.plugin.container.addChild(this._textField);
    },

    /**
     * Reload the configuration of the text field
     */
    reset: function()
    {
        this._textField.load(this.plugin.options.config);
    },

    /**
     * Show the text field
     */
    show: function()
    {
        this._textField.show();
    },

    /**
     * Hide the text field
     */
    hide: function()
    {
        this._textField.hide();
    },

    /**
     * Destroy the text field
     */
    destroy: function()
    {
        this._textField = null;
    }
};