
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorUIPanel = function(editor)
{
    this._editor = editor;

    this._container = null;

    this._titleContainer = null;

    this._contentContainer = null;

    this._opened = true;
};

ForgePlugins.EditorUIPanel.prototype =
{
    _boot: function()
    {
        this._container = document.createElement("div");
        this._container.classList.add("editor-ui-panel-container");

        this._titleContainer = document.createElement("p");
        this._titleContainer.classList.add("editor-ui-panel-title");
        this._titleContainer.addEventListener("click", this._titleClickHandler.bind(this));
        this._container.appendChild(this._titleContainer);

        this._contentContainer = document.createElement("div");
        this._contentContainer.classList.add("editor-ui-panel-content");
        this._container.appendChild(this._contentContainer);

        this.open();
    },

    _titleClickHandler: function()
    {
        if(this._opened === true)
        {
            this.close();
        }
        else
        {
            this.open();
        }
    },

    open: function()
    {
        this._contentContainer.style.display = "block";
        this._titleContainer.classList.add("editor-ui-panel-title-open");
        this._titleContainer.classList.remove("editor-ui-panel-title-close");
        this._opened = true;
    },

    close: function()
    {
        this._contentContainer.style.display = "none";
        this._titleContainer.classList.remove("editor-ui-panel-title-open");
        this._titleContainer.classList.add("editor-ui-panel-title-close");
        this._opened = false;
    },

    destroy: function()
    {
        this._editor = null;
    }
};

Object.defineProperty(ForgePlugins.EditorUIPanel.prototype, "container",
{
    get: function()
    {
        return this._container;
    }
});

Object.defineProperty(ForgePlugins.EditorUIPanel.prototype, "title",
{
    get: function()
    {
        return this._titleContainer.innerHTML;
    },

    set: function(value)
    {
        this._titleContainer.innerHTML = value;
    }
});

Object.defineProperty(ForgePlugins.EditorUIPanel.prototype, "content",
{
    get: function()
    {
        return this._contentContainer;
    }
});
