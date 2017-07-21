
var ForgePlugins = ForgePlugins || {};

/**
 */
ForgePlugins.EditorButtonPanel = function(editor)
{
    this._editor = editor;

    this._container = null;

    this._addButton = null;

    this._deleteButton = null;

    this._undoButton = null;

    this._redoButton = null;

    this._saveButton = null;

    this._loadInput = null;

    this._loadButton = null;

    this._boot();
};

ForgePlugins.EditorButtonPanel.prototype =
{
    _boot: function()
    {
        this._container = document.createElement("div");
        this._container.id = "editor-button-panel-container";

        this._addButton = document.createElement("button");
        this._addButton.id = "hotspot-add-button";
        this._addButton.innerHTML = "Add";
        this._addButton.addEventListener("click", this._addButtonClickHandler.bind(this), false);
        this._container.appendChild(this._addButton);

        this._deleteButton = document.createElement("button");
        this._deleteButton.id = "hotspot-delete-button";
        this._deleteButton.innerHTML = "Delete";
        this._deleteButton.disabled = true;
        this._deleteButton.addEventListener("click", this._deleteButtonClickHandler.bind(this), false);
        this._container.appendChild(this._deleteButton);

        this._undoButton = document.createElement("button");
        this._undoButton.id = "hotspot-undo-button";
        this._undoButton.innerHTML = "Undo";
        this._undoButton.disabled = true;
        this._undoButton.addEventListener("click", this._undoButtonClickHandler.bind(this), false);
        this._container.appendChild(this._undoButton);

        this._redoButton = document.createElement("button");
        this._redoButton.id = "hotspot-redo-button";
        this._redoButton.innerHTML = "Redo";
        this._redoButton.disabled = true;
        this._redoButton.addEventListener("click", this._redoButtonClickHandler.bind(this), false);
        this._container.appendChild(this._redoButton);

        this._saveButton = document.createElement("button");
        this._saveButton.id = "hotspot-save-button";
        this._saveButton.innerHTML = "Save";
        this._saveButton.addEventListener("click", this._saveButtonClickHandler.bind(this), false);
        this._container.appendChild(this._saveButton);

        this._loadInput = document.createElement("input");
        this._loadInput.type = "file";
        this._loadInput.name = "file";
        this._loadInput.id = "hotspot-load-input";
        this._loadInput.style.display = "none";
        this._loadInput.addEventListener("change", this._loadFileSelectHandler.bind(this), false);
        this._container.appendChild(this._loadInput);

        this._loadButton = document.createElement("button");
        this._loadButton.id = "hotspot-load-button";
        this._loadButton.innerHTML = "Load";
        this._loadButton.addEventListener("click", this._loadButtonClickHandler.bind(this), false);
        this._container.appendChild(this._loadButton);

        this._editor.onSelected.add(this._onSelectedHandler, this);
        this._editor.onLoadComplete.add(this._onLoadCompleteHandler, this);
        this._editor.history.onIndexChange.add(this._onIndexChangeHandler, this);
    },

    _onSelectedHandler: function()
    {
        this._deleteButton.disabled = this._editor.selected === null ? true : false;
    },

    _onLoadCompleteHandler: function()
    {
        this._deleteButton.disabled = this._editor.selected === null ? true : false;
        this._undoButton.disabled = this._editor.history.index === 0 ? true : false;
        this._redoButton.disabled = this._editor.history.index === this._editor.history.states.length - 1 ? true : false;
    },

    _onIndexChangeHandler: function()
    {
        this._undoButton.disabled = this._editor.history.index === 0 ? true : false;
        this._redoButton.disabled = this._editor.history.index === this._editor.history.states.length - 1 ? true : false;
    },

    _addButtonClickHandler: function(event)
    {
        this._editor.add();
    },

    _deleteButtonClickHandler: function(event)
    {
        this._editor.delete(this._editor.selected);
    },

    _undoButtonClickHandler: function(event)
    {
        this._editor.history.undo();
    },

    _redoButtonClickHandler: function(event)
    {
        this._editor.history.redo();
    },

    _saveButtonClickHandler: function(event)
    {
        this._editor.save();
    },

    _loadButtonClickHandler: function(event)
    {
        this._loadInput.click();
    },

    _loadFileSelectHandler: function(event)
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
    },

    _loadReaderLoadHandler: function(event)
    {
        var data = JSON.parse(event.target.result);
        var validate = FORGE.UID.validate(this._editor.viewer.hotspots.all.concat(data));

        if(validate === false)
        {
            this._loadDialogError();
        }
        else
        {
            if(this._editor.viewer.hotspots.count > 0)
            {
                this._loadDialogMerge(data);
            }
            else
            {
                this._editor.load(data, true, true);
            }
        }
    },

    _loadDialogError: function()
    {
        var dialog = new ForgePlugins.EditorDialogBox(this._editor);

        dialog.open
        (
            "Load Hotspots error",
            "You have duplicate uids",
            [{ label: "Close"}]
        );
    },

    _loadDialogMerge: function(data)
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
    },

    destroy: function()
    {
        this._editor.onSelected.remove(this._onSelectedHandler, this);
        this._editor.onLoadComplete.remove(this._onLoadCompleteHandler, this);
        this._editor.history.onIndexChange.remove(this._onIndexChangeHandler, this);

        this._addButton.removeEventListener("click", this._addButtonClickHandler.bind(this), false);
        this._container.removeChild(this._addButton);
        this._addButton = null;

        this._deleteButton.removeEventListener("click", this._deleteButtonClickHandler.bind(this), false);
        this._container.removeChild(this._deleteButton);
        this._deleteButton = null;

        this._undoButton.removeEventListener("click", this._undoButtonClickHandler.bind(this), false);
        this._container.removeChild(this._undoButton);
        this._undoButton = null;

        this._redoButton.removeEventListener("click", this._redoButtonClickHandler.bind(this), false);
        this._container.removeChild(this._redoButton);
        this._redoButton = null;

        this._saveButton.removeEventListener("click", this._redoButtonClickHandler.bind(this), false);
        this._container.removeChild(this._saveButton);
        this._saveButton = null;

        this._loadInput.removeEventListener("change", this._loadFileSelectHandler.bind(this), false);
        this._container.removeChild(this._loadInput);
        this._loadInput = null;

        this._loadButton.removeEventListener("click", this._loadButtonClickHandler.bind(this), false);
        this._container.removeChild(this._loadButton);
        this._loadButton = null;

        this._editor = null;
    }
};

/**
 * Container of the panel
 * @name ForgePlugins.EditorButtonPanel#container
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorButtonPanel.prototype, "container",
{
    get: function()
    {
        return this._container;
    }
});
