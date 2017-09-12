
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorTransformPanel = function(editor)
{
    this._helper = null;

    this._inspector = null;

    ForgePlugins.EditorUIPanel.call(this, editor);

    this._boot();
};

ForgePlugins.EditorTransformPanel.prototype = Object.create(ForgePlugins.EditorUIPanel.prototype);
ForgePlugins.EditorTransformPanel.prototype.constructor = FORGE.EditorTransformPanel;

ForgePlugins.EditorTransformPanel.prototype._boot = function()
{
    ForgePlugins.EditorUIPanel.prototype._boot.call(this);

    this.title = "Transform";

    this.content.classList.add("editor-ui-panel-content-padding");

    this._helper = new ForgePlugins.EditorTransformHelper(this._editor);
    this.content.appendChild(this._helper.container);

    this._inspector = new ForgePlugins.EditorTransformInspector(this._editor);
    this.content.appendChild(this._inspector.container);
};

ForgePlugins.EditorTransformPanel.prototype.update = function()
{
    this._helper.update();
};

ForgePlugins.EditorTransformPanel.prototype.destroy = function()
{
    this._editor = null;
};
