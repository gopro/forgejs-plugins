
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorGeometryPanel = function(editor)
{
    this._geometryTypeContainer = null;
    this._geometryTypeLabel = null;
    this._geometryTypeSelect = null;

    ForgePlugins.EditorUIPanel.call(this, editor);

    this._boot();
};

ForgePlugins.EditorGeometryPanel.prototype = Object.create(ForgePlugins.EditorUIPanel.prototype);
ForgePlugins.EditorGeometryPanel.prototype.constructor = FORGE.EditorGeometryPanel;

ForgePlugins.EditorGeometryPanel.params =
{
    plan: ["width", "height"],
    box: ["width", "height", "depth"],
    sphere: ["radius"],
    cylinder: ["radiusTop", "radiusBottom", "height"],
    shape: null
};

ForgePlugins.EditorGeometryPanel.prototype._boot = function()
{
    ForgePlugins.EditorUIPanel.prototype._boot.call(this);

    this.title = "Geometry";

    this.content.classList.add("editor-ui-panel-content-padding");

    this._geometryTypeContainer = document.createElement("div");
    this._geometryTypeContainer.id = "geometry-type-container";
    this.content.appendChild(this._geometryTypeContainer);

    this._geometryTypeLabel = document.createElement("p");
    this._geometryTypeLabel.id = "geometry-type-label";
    this._geometryTypeLabel.innerHTML = "Type";
    this._geometryTypeContainer.appendChild(this._geometryTypeLabel);

    this._geometryTypeSelect = document.createElement("select");
    this._geometryTypeSelect.addEventListener("change", this._geometryTypeSelectChangeHandler.bind(this));

    var option;
    for(var type in FORGE.HotspotGeometryType)
    {
        option = document.createElement("option");
        option.value = FORGE.HotspotGeometryType[type];
        option.innerHTML = FORGE.HotspotGeometryType[type];
        this._geometryTypeSelect.appendChild(option);
    }

    this._geometryTypeContainer.appendChild(this._geometryTypeSelect);

    this._editor.onSelected.add(this._onSelectedHandler, this);
};

ForgePlugins.EditorGeometryPanel.prototype._onSelectedHandler = function()
{
    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        this._geometryTypeSelect.value = hotspot.geometry.type;
    }
};

ForgePlugins.EditorGeometryPanel.prototype._geometryTypeSelectChangeHandler = function()
{
    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);

        hotspot.geometry.onLoadComplete.addOnce(this._geometryLoadCompleteHandler, this);

        var g = { type: this.type };
        hotspot.geometry.load(g);
    }
};

ForgePlugins.EditorGeometryPanel.prototype._geometryLoadCompleteHandler = function()
{
    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        hotspot.mesh.geometry = hotspot.geometry.geometry;

        this._editor.history.add("geometry change");
    }
};

ForgePlugins.EditorGeometryPanel.prototype.destroy = function()
{
    this._editor = null;
};

Object.defineProperty(ForgePlugins.EditorGeometryPanel.prototype, "type",
{
    get: function()
    {
        return this._geometryTypeSelect.value;
    }
});