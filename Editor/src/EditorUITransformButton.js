
var ForgePlugins = ForgePlugins || {};

/**
 */
ForgePlugins.EditorUITransformButton = function(editor)
{
    ForgePlugins.EditorUIItem.call(this, editor);

    this._boot();
};

ForgePlugins.EditorUITransformButton.prototype = Object.create(ForgePlugins.EditorUIItem.prototype);
ForgePlugins.EditorUITransformButton.prototype.constructor = ForgePlugins.EditorUITransformButton;


ForgePlugins.EditorUITransformButton.prototype._boot = function()
{
    this._container = document.createElement("button");
    this._container.addEventListener("click", this._onClickHandler.bind(this));
};

ForgePlugins.EditorUITransformButton.prototype._onClickHandler = function()
{
    this.activate();
};

ForgePlugins.EditorUITransformButton.prototype.destroy = function()
{
    ForgePlugins.EditorUIItem.prototype.destroy.call(this);
};

/**
 * Container the title the component
 * @name ForgePlugins.EditorUITransformButton#title
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorUITransformButton.prototype, "title",
{
    get: function()
    {
        return this._config.title;
    }
});
