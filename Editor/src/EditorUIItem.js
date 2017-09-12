
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorUIItem = function(editor, config)
{
    this._editor = editor;

    this._container = document.createElement("div");

    this._active = false;

    this.onActivate = new FORGE.EventDispatcher(this);

    this.onDeactivate = new FORGE.EventDispatcher(this);
};

ForgePlugins.EditorUIItem.prototype =
{
    activate: function()
    {
        this._active = true;
        this._container.classList.add("active");
        this.onActivate.dispatch(null, true);
    },

    deactivate: function()
    {
        this._active = false;
        this._container.classList.remove("active");
        this.onDeactivate.dispatch(null, true);
    },

    destroy: function()
    {
        this._container = null;

        this._editor = null;
    }
};

/**
 * Container of the component
 * @name ForgePlugins.EditorUIItem#container
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorUIItem.prototype, "container",
{
    get: function()
    {
        return this._container;
    }
});
