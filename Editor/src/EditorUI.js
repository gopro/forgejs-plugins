
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorUI = function(editor)
{
    this._editor = editor;

    this._container = null;

    this._buttonPanel = null;

    this._hierarchyPanel = null;

    this._helperPanel = null;

    this._inspectorPanel = null;

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

        this._hierarchyPanel = new ForgePlugins.EditorHierarchyPanel(this._editor);
        this._container.appendChild(this._hierarchyPanel.container);

        this._helperPanel = new ForgePlugins.EditorHelperPanel(this._editor);
        this._container.appendChild(this._helperPanel.container);

        // this._inspectorPanel = new ForgePlugins.EditorInspectorPanel(this._editor);
        // this._container.appendChild(this._inspectorPanel.container);
    },

    update: function()
    {

    },

    destroy: function()
    {
        this._container.removeChild(this._buttonPanel.container);
        this._buttonPanel.destroy();
        this._buttonPanel = null;

        this._container.removeChild(this._hierarchyPanel.container);
        this._hierarchyPanel.destroy();
        this._hierarchyPanel = null;

        this._container.removeChild(this._helperPanel.container);
        this._helperPanel.destroy();
        this._helperPanel = null;

        this._container.removeChild(this._inspectorPanel.container);
        this._inspectorPanel.destroy();
        this._inspectorPanel = null;

        this._container = null;
    }
};

Object.defineProperty(ForgePlugins.EditorUI.prototype, "helper",
{
    get: function()
    {
        return this._helperPanel;
    }
});