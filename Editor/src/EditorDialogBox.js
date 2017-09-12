
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorDialogBox = function(editor)
{
    this._editor = editor;

    this._container = null;

    this._titleContainer = null;

    this._messageContainer = null;

    this._buttonsContainer = null;

    this._title = "Title";

    this._message = "Message";

    this._buttons =[];

    this._boot();
};

ForgePlugins.EditorDialogBox.prototype =
{

    _boot: function()
    {
        this._container = document.createElement("div");
        this._container.id = "editor-dialog-container";
        this._editor.plugin.container.dom.appendChild(this._container);

        this._titleContainer = document.createElement("p");
        this._titleContainer.id = "editor-dialog-title";
        this._container.appendChild(this._titleContainer);

        this._messageContainer = document.createElement("p");
        this._messageContainer.id = "editor-dialog-message";
        this._container.appendChild(this._messageContainer);

        this._buttonsContainer = document.createElement("div");
        this._buttonsContainer.id = "editor-dialog-buttons";
        this._container.appendChild(this._buttonsContainer);

        this._buttons.push(
        {
            label: "Close",
            close: true
        });
    },

    _createButtons: function(buttons)
    {
        var button;

        for(var i = 0, ii = buttons.length; i < ii; i++)
        {
            button = document.createElement("button");
            button.dataset.index = i;
            button.innerHTML = buttons[i].label;
            button.addEventListener("click", this._buttonClickHandler.bind(this), false);
            this._buttonsContainer.appendChild(button);
        }

    },

    _buttonClickHandler: function(event)
    {
        var button = event.target;
        var buttonConfig = this._buttons[button.dataset.index];

        if(typeof buttonConfig.callback === "function")
        {
            var context = (typeof buttonConfig.context !== "undefined" && buttonConfig.context !== null) ? buttonConfig.context : this;
            var args = (typeof buttonConfig.args !== "undefined") ? buttonConfig.args : null;

            if (!Array.isArray(args))
            {
                args = [args];
            }

            buttonConfig.callback.apply(context, args);
        }

        if(buttonConfig.close !== false)
        {
            this.close();
        }
    },

    open: function(title, message, buttons)
    {
        this._title = (typeof title === "string") ? title : this._title;
        this._message = (typeof message === "string") ? message : this._message;
        this._buttons = (Array.isArray(buttons) === true) ? buttons : this._buttons;

        this._titleContainer.innerHTML = this._title;
        this._messageContainer.innerHTML = this._message;

        this._createButtons(this._buttons);

        this.show();
        this.center();
    },

    close: function()
    {
        this.destroy();
    },

    center: function()
    {
        var x = (this._editor.viewer.container.pixelWidth - this._container.clientWidth) / 2;
        var y = (this._editor.viewer.container.pixelHeight - this._container.clientHeight) / 2;

        this._container.style.top = y+"px";
        this._container.style.left = x+"px";
    },

    show: function()
    {
        this._container.style.display = "block";
    },

    hide: function()
    {
        this._container.style.display = "none";
    },

    update: function()
    {

    },

    destroy: function()
    {
        this._editor.plugin.container.dom.removeChild(this._container);
        this._container = null;

        this._editor = null;
    }
};
