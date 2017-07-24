
var ForgePlugins = ForgePlugins || {};

/**
 */
ForgePlugins.EditorHierarchyPanel = function(editor)
{
    this._editor = editor;

    this._container = null;

    this._list = null;

    this._boot();
};

ForgePlugins.EditorHierarchyPanel.prototype =
{
    _boot: function()
    {
        this._container = document.createElement("div");
        this._container.id = "editor-hierarchy-panel-container";

        this._list = document.createElement("div");
        this._list.id = "hotspots-list";
        this._container.appendChild(this._list);

        this._editor.onSelected.add(this._onSelectedHandler, this);
        this._editor.onHotspotsChange.add(this._onHotspotsChangeHandler, this);
        this._editor.onLoadComplete.add(this._onLoadCompleteHandler, this);
    },

    _onSelectedHandler: function()
    {
        this._updateList();
    },

    _onHotspotsChangeHandler: function()
    {
        this._updateList();
    },

    _onLoadCompleteHandler: function()
    {
        this._updateList();
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
            div.addEventListener("click", this._listItemClickHandler.bind(this));
            div.addEventListener("dblclick", this._listItemDoubleClickHandler.bind(this));

            p = document.createElement("p");
            p.innerHTML = hs.name;

            div.appendChild(p);

            if(this._editor.selected === hs.uid)
            {
                div.classList.add("selected");
            }

            this._list.appendChild(div);
        }
    },

    _clearList: function()
    {
        var child, input;

        for(var i = 0, ii = this._list.children.length; i < ii; i++)
        {
            child = this._list.children[i];
            child.removeEventListener("click", this._listItemClickHandler.bind(this));
            child.removeEventListener("dblclick", this._listItemDoubleClickHandler.bind(this));

            if(child.firstChild.nodeName.toLowerCase() === "input")
            {
                input = child.firstChild;
                input.removeEventListener("focusout", this._onInputFocusOutHandler.bind(this));
                input.removeEventListener("keydown", this._onInputKeyPressHandler.bind(this));
            }
        }

        this._list.innerHTML = "";
    },

    _getItemByUid: function(uid)
    {
        var child;

        for(var i = 0, ii = this._list.children.length; i < ii; i++)
        {
            child = this._list.children[i];

            if(child.dataset.uid === uid)
            {
                return child;
            }
        }

        return null;
    },

    _listItemClickHandler: function(event)
    {
        var div = event.currentTarget;
        var uid = div.dataset.uid;

        if(this._editor.selected === uid)
        {
            this._enterEdition();
        }
        else
        {
            this._editor.selected = uid;
        }
    },

    _listItemDoubleClickHandler: function(event)
    {
        this._enterEdition();
    },

    _enterEdition: function()
    {
        var div = this._getItemByUid(this._editor.selected);
        var hs = FORGE.UID.get(this._editor.selected);

        while (div.firstChild)
        {
            div.removeChild(div.firstChild);
        }

        var input = document.createElement("input");
        input.addEventListener("focusout", this._onInputFocusOutHandler.bind(this));
        input.addEventListener("keydown", this._onInputKeyPressHandler.bind(this));

        input.dataset.nameBackup = hs.name;
        input.value = hs.name;
        div.appendChild(input);
        input.select();
        input.setSelectionRange(0, input.value.length);

        div.classList.add("edited");

        this._editor.viewer.controllers.enabled = false;
    },

    _exitEdition: function()
    {
        this._editor.viewer.controllers.enabled = true;
        this._updateList();
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
        var div = input.parentElement;
        var keyCode = event.keyCode;
        var keyCodes = [9, 13, 27]; //9:tab, 13:enter, 27:escape

        if(keyCode === 27)
        {
            input.value = input.dataset.nameBackup;
        }


        if(keyCodes.indexOf(event.keyCode) !== -1)
        {
            event.preventDefault();
            this._saveHotspotNameFromInput(input);
            this._exitEdition();
        }

        if(keyCode === 9)
        {
            var hotspots = this._editor.viewer.hotspots.uids;

            if(hotspots.length < 2) { return; }

            var index = hotspots.indexOf(this._editor.selected);
            var next = index + 1;

            if(index === hotspots.length - 1)
            {
                next = 0;
            }

            this._editor.selected = hotspots[next];
            this._enterEdition();
        }
    },

    _saveHotspotNameFromInput: function(input)
    {
        var div = input.parentElement;
        var hs = FORGE.UID.get(div.dataset.uid);

        if(hs.name !== input.value)
        {
            hs.name = input.value;
            this._editor.history.add();
        }
    },

    destroy: function()
    {
        this._editor.onSelected.remove(this._onSelectedHandler, this);
        this._editor.onHotspotsChange.remove(this._onHotspotsChangeHandler, this);
        this._editor.onLoadComplete.remove(this._onLoadCompleteHandler, this);

        this._clearList();
        this._container.removeChild(this._list);
        this._list = null;

        this._editor = null;
    }
};

/**
 * Container of the panel
 * @name ForgePlugins.EditorHierarchyPanel#container
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorHierarchyPanel.prototype, "container",
{
    get: function()
    {
        return this._container;
    }
});
