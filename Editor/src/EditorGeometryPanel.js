
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorGeometryPanel = function(editor)
{
    this._geometryTypeContainer = null;
    this._geometryTypeLabel = null;
    this._geometryTypeSelect = null;

    this._geometryFormContainer = null;

    ForgePlugins.EditorUIPanel.call(this, editor);

    this._boot();
};

ForgePlugins.EditorGeometryPanel.prototype = Object.create(ForgePlugins.EditorUIPanel.prototype);
ForgePlugins.EditorGeometryPanel.prototype.constructor = FORGE.EditorGeometryPanel;

ForgePlugins.EditorGeometryPanel.types =
[
    FORGE.HotspotGeometryType.PLANE,
    FORGE.HotspotGeometryType.BOX,
    FORGE.HotspotGeometryType.SPHERE,
    FORGE.HotspotGeometryType.CYLINDER,
    FORGE.HotspotGeometryType.SHAPE
];

ForgePlugins.EditorGeometryPanel.params =
{
    plane: ["width", "height"],
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

    var option, type;
    for(var i = 0, ii = ForgePlugins.EditorGeometryPanel.types.length; i <ii; i++)
    {
        type = ForgePlugins.EditorGeometryPanel.types[i];
        option = document.createElement("option");
        option.value = type;
        option.innerHTML = type;
        this._geometryTypeSelect.appendChild(option);
    }

    this._geometryTypeContainer.appendChild(this._geometryTypeSelect);

    this._geometryFormContainer = new ForgePlugins.EditorUIGroup(this._editor);
    this.content.appendChild(this._geometryFormContainer.container);

    this._editor.onSelected.add(this._onSelectedHandler, this);
};

ForgePlugins.EditorGeometryPanel.prototype._clearGeometryForm = function()
{
    var children = this._geometryFormContainer.children;

    for(var i = 0, ii = children.length; i < ii; i++)
    {
        children[i].onChange.remove(this._numberChangeHandler, this);
    }

    this._geometryFormContainer.container.innerHTML = "";
};

ForgePlugins.EditorGeometryPanel.prototype._generateGeometryForm = function()
{
    var type = this.type;
    var params = ForgePlugins.EditorGeometryPanel.params[type];
    var options = null;

    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        options = hotspot.geometry.dump().options;
    }

    if(params !== null)
    {
        var config, number;
        for(var i = 0, ii = params.length; i < ii; i++)
        {
            config = { title: params[i], name: params[i] };
            number = new ForgePlugins.EditorUINumber(this._editor, config);
            number.onChange.add(this._numberChangeHandler, this);
            number.enable();

            this._geometryFormContainer.add(number);

            if(options !== null)
            {
                number.set(options[params[i]]);
            }
        }
    }
};

ForgePlugins.EditorGeometryPanel.prototype._onSelectedHandler = function()
{
    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        this._geometryTypeSelect.value = hotspot.geometry.type;

        this._clearGeometryForm();
        this._generateGeometryForm();
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

ForgePlugins.EditorGeometryPanel.prototype._numberChangeHandler = function()
{
    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        hotspot.geometry.onLoadComplete.addOnce(this._geometryLoadCompleteHandler, this);

        var children = this._geometryFormContainer.children;

        var g = { type: this.type, options: {} };

        for(var i = 0, ii = children.length; i < ii; i++)
        {
            g.options[children[i].name] = children[i].value;
        }

        hotspot.geometry.load(g);
    }
};

ForgePlugins.EditorGeometryPanel.prototype._geometryLoadCompleteHandler = function()
{
    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        hotspot.mesh.geometry = hotspot.geometry.geometry;

        this._clearGeometryForm();
        this._generateGeometryForm();

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