
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorUI = function(editor)
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

    this._hotspotList = null;

    this._boot();
};

ForgePlugins.EditorUI.prototype =
{
    _boot: function()
    {
        this._container = document.createElement("div");
        this._container.id = "editor-main-container";
        this._editor.plugin.container.dom.appendChild(this._container);

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
        this._loadInput.addEventListener('change', this._loadFileSelectHandler.bind(this), false);
        this._container.appendChild(this._loadInput);

        this._loadButton = document.createElement("button");
        this._loadButton.id = "hotspot-load-button";
        this._loadButton.innerHTML = "Load";
        this._loadButton.addEventListener("click", this._loadButtonClickHandler.bind(this), false);
        this._container.appendChild(this._loadButton);

        this._hotspotList = document.createElement("div");
        this._hotspotList.id = "hotspots-list";
        this._container.appendChild(this._hotspotList);

        this._updateList();

        this._editor.onSelected.add(this._onSelectedHandler, this);
        this._editor.onLoadComplete.add(this._onLoadCompleteHandler, this);
        this._editor.history.onIndexChange.add(this._onIndexChangeHandler, this);
    },

    _addButtonClickHandler: function(event)
    {
        this._editor.add();
        this._updateList();
    },

    _deleteButtonClickHandler: function(event)
    {
        this._editor.delete(this._editor.selected);
        this._updateList();
    },

    _undoButtonClickHandler: function(event)
    {
        this._editor.history.undo();
        this._updateList();
    },

    _redoButtonClickHandler: function(event)
    {
        this._editor.history.redo();
        this._updateList();
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
            console.log("JSON file ok");

            var loadReader = new FileReader();
            loadReader.onload = this._loadReaderLoadHandler.bind(this);
            loadReader.readAsText(file);
        }

        var input = event.target;
        input.value = null;
    },

    _loadReaderLoadHandler: function(event)
    {
        console.log(event);
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

    _onSelectedHandler: function()
    {
        this._deleteButton.disabled = this._editor.selected === null ? true : false;
        this._updateList();
    },

    _onLoadCompleteHandler: function()
    {
        this._deleteButton.disabled = this._editor.selected === null ? true : false;
        this._undoButton.disabled = this._editor.history.index === 0 ? true : false;
        this._redoButton.disabled = this._editor.history.index === this._editor.history.states.length - 1 ? true : false;
        this._updateList();
    },

    _onIndexChangeHandler: function()
    {
        this._undoButton.disabled = this._editor.history.index === 0 ? true : false;
        this._redoButton.disabled = this._editor.history.index === this._editor.history.states.length - 1 ? true : false;
    },

    _updateList: function()
    {
        this._clearList();

        var viewer = this._editor.viewer;
        var hotspots = viewer.hotspots.all;

        var hs, div, p;
        for(var i = 0, ii = hotspots.length; i < ii; i++)
        {
            hs = hotspots[i];

            div = document.createElement("div");
            div.dataset.uid = hs.uid;
            div.addEventListener("click", this._hotspotListClickHandler.bind(this));
            div.addEventListener("dblclick", this._hotspotListDoubleClickHandler.bind(this));

            p = document.createElement("p");
            p.innerHTML = hs.name;

            div.appendChild(p);

            if(this._editor.selected === hs.uid)
            {
                div.classList.add("selected");
            }

            this._hotspotList.appendChild(div);
        }
    },

    _clearList: function()
    {
        this._hotspotList.innerHTML = "";
    },

    _hotspotListClickHandler: function(event)
    {
        var div = event.currentTarget;
        this._editor.selected = div.dataset.uid;
    },

    _hotspotListDoubleClickHandler: function(event)
    {
        var div = event.currentTarget;
        var hs = FORGE.UID.get(div.dataset.uid);

        while (div.firstChild)
        {
            div.removeChild(div.firstChild);
        }

        var input = document.createElement("input");
        input.addEventListener("focusout", this._onInputFocusOutHandler.bind(this));
        input.addEventListener("keydown", this._onInputKeyPressHandler.bind(this));

        // window.addEventListener

        input.dataset.nameBackup = hs.name;
        input.value = hs.name;
        div.appendChild(input);
        input.select();
        input.setSelectionRange(0, input.value.length);


        div.classList.add("edited");

        this._editor.viewer.controllers.enabled = false;

    },

    _onInputFocusOutHandler: function(event)
    {
        var input = event.currentTarget;

        this._saveHotspotNameFromInput(input);
        this._exitEdition();
    },

    _onInputKeyPressHandler: function(event)
    {
        var input = event.currentTarget;

        switch(event.keyCode)
        {
            case 13:
                this._saveHotspotNameFromInput(input);
                this._exitEdition();
                break;

            case 27:
                input.value = input.dataset.nameBackup;
                this._saveHotspotNameFromInput(input);
                this._exitEdition();
                break;
        }
    },

    _saveHotspotNameFromInput: function(input)
    {
        var div = input.parentElement;
        var hs = FORGE.UID.get(div.dataset.uid);
        hs.name = input.value;
    },

    _exitEdition: function()
    {
        this._editor.viewer.controllers.enabled = true;

        this._updateList();
    },

    update: function()
    {

    },

    destroy: function()
    {
        this._container = null;
    }
};