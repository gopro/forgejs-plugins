
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorUINumber = function(editor, config)
{
    ForgePlugins.EditorUIItem.call(this, editor);

    this._config = config || { title: "Number", name: "number" };

    this._label = null;

    this._input = null;

    this._enabled = false;

    this.onChange = null;

    this.onFocus = null;

    this._boot();
};

ForgePlugins.EditorUINumber.prototype = Object.create(ForgePlugins.EditorUIItem.prototype);
ForgePlugins.EditorUINumber.prototype.constructor = ForgePlugins.EditorUINumber;


ForgePlugins.EditorUINumber.prototype._boot = function()
{
    this._container.className = "editor-ui-number-container";
    this._container.addEventListener("click", this._onClickHandler.bind(this));

    this._label = document.createElement("label");
    this._label.innerHTML = this._config.title;
    this._container.appendChild(this._label);

    this._input = document.createElement("input");
    this._input.className = "editor-ui-number-input";
    this._input.type = "number";
    this._input.disabled = true;
    this._input.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._input.addEventListener("change", this._onInputChangeHandler.bind(this));
    this._container.appendChild(this._input);

    this.onChange = new FORGE.EventDispatcher(this);
    this.onFocus = new FORGE.EventDispatcher(this);

    // this._editor.onSelected.add(this._onSelectedHandler, this);
    // this._editor.onHotspotChange.add(this._onhotspotsChangeHandler, this);
};

ForgePlugins.EditorUINumber.prototype._onClickHandler = function()
{
    this.activate();
};

ForgePlugins.EditorUINumber.prototype._onInputFocusHandler = function()
{
    this.activate();
    this.onFocus.dispatch();
};

ForgePlugins.EditorUINumber.prototype._onInputChangeHandler = function()
{
    this.onChange.dispatch();
};

ForgePlugins.EditorUINumber.prototype.set = function(number)
{
    this._input.value = number;
};

ForgePlugins.EditorUINumber.prototype.enable = function()
{
    this._input.disabled = false;
    this._enabled = true;
};

ForgePlugins.EditorUINumber.prototype.disable = function()
{
    this._input.disabled = true;
    this._input.value = "";
    this._enabled = false;
};

ForgePlugins.EditorUINumber.prototype.dump = function()
{
    var dump =
    {

    };

    return dump;
};

ForgePlugins.EditorUINumber.prototype.toString = function()
{
    return this._config.title + ": " + this.value;
};

ForgePlugins.EditorUINumber.prototype.destroy = function()
{
    this._input.removeEventListener("focus", this._onInputFocusHandler.bind(this));
    this._input.removeEventListener("change", this._onInputChangeHandler.bind(this));

    ForgePlugins.EditorUIItem.prototype.destroy.call(this);
};

Object.defineProperty(ForgePlugins.EditorUINumber.prototype, "value",
{
    get: function()
    {
        return Number(this._input.value) || 0;
    }
});

Object.defineProperty(ForgePlugins.EditorUINumber.prototype, "title",
{
    get: function()
    {
        return this._config.title;
    }
});

Object.defineProperty(ForgePlugins.EditorUINumber.prototype, "name",
{
    get: function()
    {
        return this._config.name;
    }
});


