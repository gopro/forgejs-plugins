
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

    this._loadReader = null;

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
        this._undoButton.addEventListener("click", this._undoButtonClickHandler.bind(this), false);
        this._container.appendChild(this._undoButton);

        this._redoButton = document.createElement("button");
        this._redoButton.id = "hotspot-redo-button";
        this._redoButton.innerHTML = "Redo";
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

        this._loadReader = new FileReader();
        this._loadReader.onload = this._loadReaderLoadHandler.bind(this);

        this._hotspotList = document.createElement("div");
        this._hotspotList.id = "hotspots-list";
        this._container.appendChild(this._hotspotList);

        this._updateList();

        this._editor.onSelected.add(this._onSelectedHandler, this);
        this._editor.onLoadComplete.add(this._onLoadCompleteHandler, this);
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

        if(typeof file !== "undefined" && file.type.match("application/json"))
        {
            console.log("json file ok");
            this._loadReader.readAsText(file);
        }
    },

    _loadReaderLoadHandler: function(event)
    {
        console.log(event);
        var data = JSON.parse(event.target.result);
        this._editor.load(data);
    },

    _onSelectedHandler: function()
    {
        this._deleteButton.disabled = this._editor.selected === null ? true : false;
        this._updateList();
    },

    _onLoadCompleteHandler: function()
    {
        this._deleteButton.disabled = this._editor.selected === null ? true : false;
        this._updateList();
    },

    _updateList: function()
    {
        this._clearList();

        var viewer = this._editor.viewer;
        var hotspots = viewer.hotspots.all;

        var hs, p;
        for(var i = 0, ii = hotspots.length; i < ii; i++)
        {
            hs = hotspots[i];
            p = document.createElement("p");
            p.id = hs.uid;
            p.addEventListener("click", this._hotspotListClickHandler.bind(this));
            p.innerHTML = hs.name;

            if(this._editor.selected === hs.uid)
            {
                p.className = "selected";
            }

            this._hotspotList.appendChild(p);
        }
    },

    _clearList: function()
    {
        this._hotspotList.innerHTML = "";
    },

    _hotspotListClickHandler: function(event)
    {
        this._editor.selected = event.target.id;
    },

    update: function()
    {

    },

    destroy: function()
    {
        this._container = null;
    }
};