
var ForgePlugins = ForgePlugins || {};

/**
 */
ForgePlugins.EditorUI = function(editor)
{
    this._editor = editor;

    this._container = null;

    this._addButton = null;

    this._boot();
};

ForgePlugins.EditorUI.prototype =
{
    /**
     * The boot function, initialize the container of the flags, and then the
     * flags.
     */
    _boot: function()
    {
        // Create a root container and place it on the scene
        this._container = this._editor.plugin.create.displayObjectContainer();
        this._container.background = "white";
        this._container.width = 300;
        this._container.height = 600;

        this._container.pointer.enabled = true;

        // Add the container to the scene
        this._editor.plugin.container.addChild(this._container);


        this._addButton = document.createElement("button");
        this._addButton.innerHTML = "Add Hotspot";

        this._container.dom.appendChild(this._addButton);
    },

    update: function()
    {

    },

    /**
     * Destroy the container and its flags
     */
    destroy: function()
    {
        this._container = null;
    }
};