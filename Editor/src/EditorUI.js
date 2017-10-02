
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorUI = function(editor)
{
    this._editor = editor;

    this._container = null;

    this._buttonPanel = null;

    this._historyPanel = null;

    this._hierarchyPanel = null;

    this._helperPanel = null;

    this._inspectorPanel = null;

    this._geometryPanel = null;

    this._boot();
};

ForgePlugins.EditorUI.prototype =
{
    _boot: function()
    {
        this._container = document.createElement("div");
        this._container.id = "editor-main-container";
        this._editor.plugin.container.dom.appendChild(this._container);

        this._buttonPanel = new ForgePlugins.EditorButtonPanel(this._editor);
        this._container.appendChild(this._buttonPanel.container);

        this._historyPanel = new ForgePlugins.EditorHistoryPanel(this._editor);
        this._container.appendChild(this._historyPanel.container);

        this._hierarchyPanel = new ForgePlugins.EditorHierarchyPanel(this._editor);
        this._container.appendChild(this._hierarchyPanel.container);

        this._transformPanel = new ForgePlugins.EditorTransformPanel(this._editor);
        this._container.appendChild(this._transformPanel.container);

        this._geometryPanel = new ForgePlugins.EditorGeometryPanel(this._editor);
        this._container.appendChild(this._geometryPanel.container);
    },

    update: function()
    {
        this._transformPanel.update();
    },

    destroy: function()
    {
        this._container.removeChild(this._buttonPanel.container);
        this._buttonPanel.destroy();
        this._buttonPanel = null;

        this._container.removeChild(this._historyPanel.container);
        this._historyPanel.destroy();
        this._historyPanel = null;

        this._container.removeChild(this._hierarchyPanel.container);
        this._hierarchyPanel.destroy();
        this._hierarchyPanel = null;

        this._container.removeChild(this._helperPanel.container);
        this._helperPanel.destroy();
        this._helperPanel = null;

        this._container.removeChild(this._inspectorPanel.container);
        this._inspectorPanel.destroy();
        this._inspectorPanel = null;

        this._container.removeChild(this._geometryPanel.container);
        this._geometryPanel.destroy();
        this._geometryPanel = null;

        this._container = null;
    }
};

Object.defineProperty(ForgePlugins.EditorUI.prototype, "geometry",
{
    get: function()
    {
        return this._geometryPanel;
    }
});
