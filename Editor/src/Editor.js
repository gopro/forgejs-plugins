
var ForgePlugins = ForgePlugins || {};

/**
 */
ForgePlugins.Editor = function()
{
    this._ui = null;

    this._history = null;
};

ForgePlugins.Editor.prototype =
{
    /**
     * The boot function, initialize the container of the flags, and then the
     * flags.
     */
    boot: function()
    {
        this._ui = new ForgePlugins.EditorUI(this);
    },

    update: function()
    {

    },

    /**
     * Destroy the container and its flags
     */
    destroy: function()
    {
        this._ui.destroy;
        this._ui = null;
    }
};