
var ForgePlugins = ForgePlugins || {};

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

    this._enabled = false;

    this.onChange = null;

    this.onFocus = null;

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
    this._inputX.type = "number";
    this._inputX.step = 0.1;
    this._inputX.disabled = true;
    this._inputX.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputX.addEventListener("change", this._onInputChangeHandler.bind(this));
    this._container.appendChild(this._inputX);

    this._labelY = document.createElement("label");
    this._labelY.innerHTML = "Y";
    this._container.appendChild(this._labelY);

    this._inputY = document.createElement("input");
    this._inputY.id = "editor-inspector-transform-y";
    this._inputY.type = "number";
    this._inputY.step = 0.1;
    this._inputY.disabled = true;
    this._inputY.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputY.addEventListener("change", this._onInputChangeHandler.bind(this));
    this._container.appendChild(this._inputY);

    this._labelZ = document.createElement("label");
    this._labelZ.innerHTML = "Z";
    this._container.appendChild(this._labelZ);

    this._inputZ = document.createElement("input");
    this._inputZ.id = "editor-inspector-transform-z";
    this._inputZ.type = "number";
    this._inputZ.step = 0.1;
    this._inputZ.disabled = true;
    this._inputZ.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputZ.addEventListener("change", this._onInputChangeHandler.bind(this));
    this._container.appendChild(this._inputZ);

    this.onChange = new FORGE.EventDispatcher(this);
    this.onFocus = new FORGE.EventDispatcher(this);

    this._editor.onSelected.add(this._onSelectedHandler, this);
    this._editor.onHotspotChange.add(this._onhotspotsChangeHandler, this);
};

ForgePlugins.EditorUIVector3.prototype._onClickHandler = function()
{
    this.activate();
};

ForgePlugins.EditorUIVector3.prototype._onInputFocusHandler = function()
{
    this.activate();
    this.onFocus.dispatch();
};

ForgePlugins.EditorUIVector3.prototype._onInputChangeHandler = function()
{
    this.onChange.dispatch();
};

ForgePlugins.EditorUIVector3.prototype.set = function(vector3)
{
    this._inputX.value = vector3.x;
    this._inputY.value = vector3.y;
    this._inputZ.value = vector3.z;
};

ForgePlugins.EditorUIVector3.prototype.enable = function()
{
    this._inputX.disabled = false;
    this._inputY.disabled = false;
    this._inputZ.disabled = false;
    this._enabled = true;
};

ForgePlugins.EditorUIVector3.prototype.disable = function()
{
    this._inputX.disabled = true;
    this._inputX.value = "";

    this._inputY.disabled = true;
    this._inputY.value = "";

    this._inputZ.disabled = true;
    this._inputZ.value = "";

    this._enabled = false;
};

ForgePlugins.EditorUIVector3.prototype.dump = function()
{
    var dump =
    {
        x: this.x,
        y: this.y,
        z: this.z
    };

    return dump;
};

ForgePlugins.EditorUIVector3.prototype.toString = function()
{
    return this._config.title + "[x: " + this.x + ", y: " + this.y + ", z: " + this.z + "]";
};

ForgePlugins.EditorUIVector3.prototype.destroy = function()
{
    this._inputX.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputX.addEventListener("change", this._onInputChangeHandler.bind(this));

    this._inputY.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputY.addEventListener("change", this._onInputChangeHandler.bind(this));

    this._inputZ.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputZ.addEventListener("change", this._onInputChangeHandler.bind(this));

    ForgePlugins.EditorUIItem.prototype.destroy.call(this);
};

Object.defineProperty(ForgePlugins.EditorUIVector3.prototype, "x",
{
    get: function()
    {
        return Number(this._inputX.value) || 0;
    }
});

Object.defineProperty(ForgePlugins.EditorUIVector3.prototype, "y",
{
    get: function()
    {
        return Number(this._inputY.value) || 0;
    }
});

Object.defineProperty(ForgePlugins.EditorUIVector3.prototype, "z",
{
    get: function()
    {
        return Number(this._inputZ.value) || 0;
    }
});

Object.defineProperty(ForgePlugins.EditorUIVector3.prototype, "title",
{
    get: function()
    {
        return this._config.title;
    }
});
