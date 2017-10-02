
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorUIGroup = function(editor)
{
    this._editor = editor;

    this._container = null;

    this._active = null;

    this._children = [];

    this.onChildActivate = new FORGE.EventDispatcher(this);

    this._boot();
};

ForgePlugins.EditorUIGroup.prototype =
{

    _boot: function()
    {
        this._container = document.createElement("div");
    },

    add: function(child)
    {
        child.onActivate.add(this._onChildActivateHandler, this);
        this._children.push(child);
        this._container.appendChild(child.container);
    },

    activate: function(index)
    {
        var i = this._children.indexOf(this._active);

        if(i !== index)
        {
            this._children[index].activate();
        }
    },

    deactivateAll: function()
    {
        for (var i = 0, ii = this._children.length; i < ii; i++)
        {
            this._children[i].deactivate();
        }
    },

    _onChildActivateHandler: function(event)
    {
        this._active = event.emitter;
        var child;

        for (var i = 0, ii = this._children.length; i < ii; i++)
        {
            child = this._children[i];

            if(child !== this._active)
            {
                child.deactivate();
            }
        }

        this.onChildActivate.dispatch({ item: this._active }, true);
    },

    destroy: function()
    {
        this._container = null;
        this._editor = null;
    }
};

/**
 * Container of the component
 * @name ForgePlugins.EditorUIGroup#container
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorUIGroup.prototype, "container",
{
    get: function()
    {
        return this._container;
    }
});

/* Get the array of children
 * @name ForgePlugins.EditorUIGroup#children
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorUIGroup.prototype, "children",
{
    get: function()
    {
        return this._children;
    }
});

/**
 * Get the active child of the group
 * @name ForgePlugins.EditorUIGroup#active
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorUIGroup.prototype, "active",
{
    get: function()
    {
        return this._active;
    }
});