
var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorHistory = function(editor)
{
    this._editor = editor;

    this._initialState = null;

    this._index = -1;

    this._limit = 50;

    this._states = [];

    this.onIndexChange = new FORGE.EventDispatcher(this);
};

ForgePlugins.EditorHistory.prototype =
{

    add: function(name)
    {
        var state =
        {
            name: name,
            hotspots: this._editor.dump(),
            selected: this._editor.selected
        };

        if(this._initialState === null && this._states.length === 0)
        {
            this._initialState = state;
        }

        if(this._index < this._states.length - 1)
        {
            this._states.splice(this._index + 1);
        }

        this._states.push(state);

        if(this._states.length > this._limit)
        {
            this._states.splice(0, 1);
        }

        this._index = this._states.length - 1;

        this.onIndexChange.dispatch(null, true);

        console.log("History Add | index: " + this._index);
    },

    undo: function()
    {
        if(this._index <= 0)
        {
            console.log("History | no more history to undo");
            return;
        }

        console.log("History undo");

        this.load(this._index - 1);
    },

    redo: function()
    {
        if(this._index === this._states.length - 1)
        {
            console.log("History | no more history to redo");
            return;
        }

        console.log("History redo");

        this.load(this._index + 1);
    },

    load: function(index)
    {
        if(index >= 0 && index < this._states.length && index !== this._index)
        {
            this._index = index;
            this.onIndexChange.dispatch(null, true);

            var state = this._states[index];
            var hotspots = state.hotspots;

            this._editor.load(hotspots);
            this._editor.selected = state.selected;

            console.log("History load | index: " + this._index);
        }
    },

    reset: function()
    {
        this._states = [];
        this._index = -1;
        this.onIndexChange.dispatch(null, true);
        this._initialState = null;
    },

    update: function()
    {

    },

    destroy: function()
    {
        this._container = null;
    }
};

/**
 * States accessor
 * @name ForgePlugins.EditorHistory#states
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorHistory.prototype, "states",
{
    get: function()
    {
        return this._states;
    }
});

/**
 * History index accessor
 * @name ForgePlugins.EditorHistory#index
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorHistory.prototype, "index",
{
    get: function()
    {
        return this._index;
    }
});
