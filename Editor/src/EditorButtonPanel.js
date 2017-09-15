
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorButtonPanel = function(editor)
{
    this._addButton = null;

    this._deleteButton = null;

    this._undoButton = null;

    this._redoButton = null;

    this._saveButton = null;

    this._loadInput = null;

    this._loadButton = null;

    ForgePlugins.EditorUIPanel.call(this, editor);

    this._boot();
};

ForgePlugins.EditorButtonPanel.prototype = Object.create(ForgePlugins.EditorUIPanel.prototype);
ForgePlugins.EditorButtonPanel.prototype.constructor = FORGE.EditorButtonPanel;

ForgePlugins.EditorButtonPanel.prototype._boot = function()
{
    ForgePlugins.EditorUIPanel.prototype._boot.call(this);

    this.title = "ForgeJS Editor";

    this.content.classList.add("editor-ui-panel-content-padding");

    this._addButton = document.createElement("button");
    this._addButton.id = "hotspot-add-button";
    this._addButton.innerHTML = "Add";
    this._addButton.addEventListener("click", this._addButtonClickHandler.bind(this), false);
    this.content.appendChild(this._addButton);

    this._deleteButton = document.createElement("button");
    this._deleteButton.id = "hotspot-delete-button";
    this._deleteButton.innerHTML = "Delete";
    this._deleteButton.disabled = true;
    this._deleteButton.addEventListener("click", this._deleteButtonClickHandler.bind(this), false);
    this.content.appendChild(this._deleteButton);

    this._undoButton = document.createElement("button");
    this._undoButton.id = "hotspot-undo-button";
    this._undoButton.innerHTML = "Undo";
    this._undoButton.disabled = true;
    this._undoButton.addEventListener("click", this._undoButtonClickHandler.bind(this), false);
    this.content.appendChild(this._undoButton);

    this._redoButton = document.createElement("button");
    this._redoButton.id = "hotspot-redo-button";
    this._redoButton.innerHTML = "Redo";
    this._redoButton.disabled = true;
    this._redoButton.addEventListener("click", this._redoButtonClickHandler.bind(this), false);
    this.content.appendChild(this._redoButton);

    this._saveButton = document.createElement("button");
    this._saveButton.id = "hotspot-save-button";
    this._saveButton.innerHTML = "Save";
    this._saveButton.addEventListener("click", this._saveButtonClickHandler.bind(this), false);
    this.content.appendChild(this._saveButton);

    this._loadInput = document.createElement("input");
    this._loadInput.type = "file";
    this._loadInput.name = "file";
    this._loadInput.id = "hotspot-load-input";
    this._loadInput.style.display = "none";
    this._loadInput.addEventListener("change", this._loadFileSelectHandler.bind(this), false);
    this.content.appendChild(this._loadInput);

    this._loadButton = document.createElement("button");
    this._loadButton.id = "hotspot-load-button";
    this._loadButton.innerHTML = "Load";
    this._loadButton.addEventListener("click", this._loadButtonClickHandler.bind(this), false);
    this.content.appendChild(this._loadButton);

    this._editor.onSelected.add(this._onSelectedHandler, this);
    this._editor.onLoadComplete.add(this._onLoadCompleteHandler, this);
    this._editor.history.onIndexChange.add(this._onIndexChangeHandler, this);
};

ForgePlugins.EditorButtonPanel.prototype._onSelectedHandler = function()
{
    this._deleteButton.disabled = this._editor.selected === null ? true : false;
};

ForgePlugins.EditorButtonPanel.prototype._onLoadCompleteHandler = function()
{
    this._deleteButton.disabled = this._editor.selected === null ? true : false;
    this._undoButton.disabled = this._editor.history.index === 0 ? true : false;
    this._redoButton.disabled = this._editor.history.index === this._editor.history.states.length - 1 ? true : false;
};

ForgePlugins.EditorButtonPanel.prototype._onIndexChangeHandler = function()
{
    this._undoButton.disabled = this._editor.history.index === 0 ? true : false;
    this._redoButton.disabled = this._editor.history.index === this._editor.history.states.length - 1 ? true : false;
};

ForgePlugins.EditorButtonPanel.prototype._addButtonClickHandler = function(event)
{
    this._editor.add();
};

ForgePlugins.EditorButtonPanel.prototype._deleteButtonClickHandler = function(event)
{
    this._editor.delete(this._editor.selected);
};

ForgePlugins.EditorButtonPanel.prototype._undoButtonClickHandler = function(event)
{
    this._editor.history.undo();
};

ForgePlugins.EditorButtonPanel.prototype._redoButtonClickHandler = function(event)
{
    this._editor.history.redo();
};

ForgePlugins.EditorButtonPanel.prototype._saveButtonClickHandler = function(event)
{
    this._editor.save();
};

ForgePlugins.EditorButtonPanel.prototype._loadButtonClickHandler = function(event)
{
    this._loadInput.click();
};

ForgePlugins.EditorButtonPanel.prototype._loadFileSelectHandler = function(event)
{
    var files = event.target.files;
    var file = files[0];

    if(typeof file !== "undefined" && file !== null)
    {
        var loadReader = new FileReader();
        loadReader.onload = this._loadReaderLoadHandler.bind(this);
        loadReader.readAsText(file);
    }

    var input = event.target;
    input.value = null;
};

ForgePlugins.EditorButtonPanel.prototype._loadReaderLoadHandler = function(event)
{
    var data = JSON.parse(event.target.result);
    // var all = this._editor.viewer.hotspots.dump().concat(data);
    // var validate = FORGE.UID.validate(all);
    var validate = FORGE.UID.validate(data);

    if(validate === false)
    {
        this._loadDialogReplaceOnly(data);
    }
    else
    {
        if(this._editor.viewer.hotspots.count > 0)
        {
            this._loadDialogMergeOrReplace(data);
        }
        else
        {
            this._editor.load(data, true, true);
        }
    }
};

ForgePlugins.EditorButtonPanel.prototype._loadDialogReplaceOnly = function(data)
{
    var dialog = new ForgePlugins.EditorDialogBox(this._editor);

    var buttons =
    [
        {
            label: "Replace",
            callback: this._editor.load,
            context: this._editor,
            args: [data, true, true],
        },

        {
            label: "Close"
        }
    ];

    dialog.open
    (
        "Load Hotspots",
        "You have duplicate uids, you can't merge but only replace current hotspots",
        buttons
    );
};

ForgePlugins.EditorButtonPanel.prototype._loadDialogMergeOrReplace = function(data)
{
    var dialog = new ForgePlugins.EditorDialogBox(this._editor);

    var buttons =
    [
        {
            label: "Merge",
            callback: this._editor.load,
            context: this._editor,
            args: [data, false, true]
        },

        {
            label: "Replace",
            callback: this._editor.load,
            context: this._editor,
            args: [data, true, true],
        },

        {
            label: "Close"
        }
    ];

    dialog.open
    (
        "Load Hotspots",
        "Do you want to replace all hotspots or merge with the current hotspots?",
        buttons
    );
};

ForgePlugins.EditorButtonPanel.prototype.destroy = function()
{
    this._editor.onSelected.remove(this._onSelectedHandler, this);
    this._editor.onLoadComplete.remove(this._onLoadCompleteHandler, this);
    this._editor.history.onIndexChange.remove(this._onIndexChangeHandler, this);

    this._addButton.removeEventListener("click", this._addButtonClickHandler.bind(this), false);
    this.content.removeChild(this._addButton);
    this._addButton = null;

    this._deleteButton.removeEventListener("click", this._deleteButtonClickHandler.bind(this), false);
    this.content.removeChild(this._deleteButton);
    this._deleteButton = null;

    this._undoButton.removeEventListener("click", this._undoButtonClickHandler.bind(this), false);
    this.content.removeChild(this._undoButton);
    this._undoButton = null;

    this._redoButton.removeEventListener("click", this._redoButtonClickHandler.bind(this), false);
    this.content.removeChild(this._redoButton);
    this._redoButton = null;

    this._saveButton.removeEventListener("click", this._redoButtonClickHandler.bind(this), false);
    this.content.removeChild(this._saveButton);
    this._saveButton = null;

    this._loadInput.removeEventListener("change", this._loadFileSelectHandler.bind(this), false);
    this.content.removeChild(this._loadInput);
    this._loadInput = null;

    this._loadButton.removeEventListener("click", this._loadButtonClickHandler.bind(this), false);
    this.content.removeChild(this._loadButton);
    this._loadButton = null;

    ForgePlugins.EditorUIPanel.prototype.destroy.call(this);
};
