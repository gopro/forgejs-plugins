var ForgePlugins = ForgePlugins || {};


ForgePlugins.FPS = function()
{
    this._stats = null;
};

ForgePlugins.FPS.prototype =
{
    boot: function()
    {
        this._stats = new Stats();
        this.plugin.container.dom.appendChild(this._stats.dom);

        this._stats.begin();
    },

    update: function()
    {
        this._stats.end();
        this._stats.begin();
    },

    show: function()
    {
        this._frame.show();
    },

    hide: function()
    {
        this._frame.hide();
    },

    destroy: function()
    {
        this.plugin.container.dom.removeChild(this._stats.dom);
        this._stats = null;
    }
};