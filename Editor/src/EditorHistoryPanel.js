
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorHistoryPanel = function(editor)
{
    this._list = null;

    ForgePlugins.EditorUIPanel.call(this, editor);

    this._boot();
};

ForgePlugins.EditorHistoryPanel.prototype = Object.create(ForgePlugins.EditorUIPanel.prototype);
ForgePlugins.EditorHistoryPanel.prototype.constructor = FORGE.EditorHistoryPanel;

ForgePlugins.EditorHistoryPanel.prototype._boot = function()
{
    ForgePlugins.EditorUIPanel.prototype._boot.call(this);

    this.title = "History";

    this._list = document.createElement("div");
    this._list.id = "history-list";
    this.content.appendChild(this._list);

    this._editor.history.onIndexChange.add(this._onIndexChangeHandler, this);
};

ForgePlugins.EditorHistoryPanel.prototype._onIndexChangeHandler = function()
{
    this._updateList();
};

ForgePlugins.EditorHistoryPanel.prototype._updateList = function()
{
    this._clearList();

    var states = this._editor.history.states;

    var s, div, p;
    for(var i = 0, ii = states.length; i < ii; i++)
    {
        s = states[i];

        div = document.createElement("div");
        div.dataset.index = i;
        div.addEventListener("click", this._listItemClickHandler.bind(this));
        div.addEventListener("dblclick", this._listItemDoubleClickHandler.bind(this));

        p = document.createElement("p");
        p.innerHTML = s.name;

        div.appendChild(p);

        if(this._editor.history.index === i)
        {
            div.classList.add("selected");
        }

        this._list.insertBefore(div, this._list.firstChild);
    }
};

ForgePlugins.EditorHistoryPanel.prototype._clearList = function()
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
};

ForgePlugins.EditorHistoryPanel.prototype._listItemClickHandler = function(event)
{
    var div = event.currentTarget;
    var index = Number(div.dataset.index);

    this._editor.history.load(index);
};

ForgePlugins.EditorHistoryPanel.prototype._listItemDoubleClickHandler = function(event)
{
    // Placeholder
};

ForgePlugins.EditorHistoryPanel.prototype.destroy = function()
{
    this._clearList();

    this.content.removeChild(this._list);
    this._list = null;

    ForgePlugins.EditorUIPanel.prototype.destroy.call(this);
};