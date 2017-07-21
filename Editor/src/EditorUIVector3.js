
var ForgePlugins = ForgePlugins || {};

/**
 */
ForgePlugins.EditorUIVector3 = function(editor, config)
{
    ForgePlugins.EditorUIItem.call(this, editor);

    this._config = config || { title: "Vector3" };

    this._labelTitle = null;

    this._labelX = null;

    this._inputX = null;

    this._labelY = null;

    this._inputY = null;

    this._labelZ = null;

    this._inputZ = null;

    this._boot();
};

ForgePlugins.EditorUIVector3.prototype = Object.create(ForgePlugins.EditorUIItem.prototype);
ForgePlugins.EditorUIVector3.prototype.constructor = ForgePlugins.EditorUIVector3;


ForgePlugins.EditorUIVector3.prototype._boot = function()
{
    this._container.className = "editor-ui-vec3-container";
    this._container.addEventListener("click", this._onClickHandler.bind(this));

    this._labelTitle = document.createElement("p");
    this._labelTitle.innerHTML = this._config.title;
    this._container.appendChild(this._labelTitle);

    this._labelX = document.createElement("label");
    this._labelX.innerHTML = "X";
    this._container.appendChild(this._labelX);

    this._inputX = document.createElement("input");
    this._inputX.id = "editor-inspector-transform-x";
    this._container.appendChild(this._inputX);

    this._labelY = document.createElement("label");
    this._labelY.innerHTML = "Y";
    this._container.appendChild(this._labelY);

    this._inputY = document.createElement("input");
    this._inputY.id = "editor-inspector-transform-y";
    this._container.appendChild(this._inputY);

    this._labelZ = document.createElement("label");
    this._labelZ.innerHTML = "Z";
    this._container.appendChild(this._labelZ);

    this._inputZ = document.createElement("input");
    this._inputZ.id = "editor-inspector-transform-z";
    this._container.appendChild(this._inputZ);

    this._editor.onSelected.add(this._onSelectedHandler, this);
    this._editor.onHotspotChange.add(this._onhotspotsChangeHandler, this);
};

ForgePlugins.EditorUIVector3.prototype._onClickHandler = function()
{
    this.activate();
};

ForgePlugins.EditorUIVector3.prototype.set = function(vector3)
{
    this._inputX.value = vector3.x;
    this._inputY.value = vector3.y;
    this._inputZ.value = vector3.z;
};

ForgePlugins.EditorUIVector3.prototype.destroy = function()
{
    ForgePlugins.EditorUIItem.prototype.destroy.call(this);
};

/**
 * Container the title the component
 * @name ForgePlugins.EditorUIVector3#title
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorUIVector3.prototype, "title",
{
    get: function()
    {
        return this._config.title;
    }
});
