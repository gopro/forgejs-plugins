var ForgePlugins = ForgePlugins || {};

ForgePlugins.PerformanceMonitor = function()
{
    this._container = null;
    this._stats = null;
    this._mode = 0;

    this._modes = ["fps", "ms", "mb"];
};

ForgePlugins.PerformanceMonitor.prototype =
{
    boot: function()
    {
        this._container = this.plugin.create.displayObjectContainer();

        var pixelRatio = Math.round( window.devicePixelRatio || 1 );
        this._container.width = 80 * pixelRatio;
        this._container.height = 48 * pixelRatio;
        this._container.pointer.cursor = "pointer";
        this._container.drag.enabled = this.plugin.options.draggable;
        this._container.pointer.onClick.add(this._clickHandler, this);
        this._container.top = this.plugin.options.top;
        this._container.right = this.plugin.options.right;
        this._container.bottom = this.plugin.options.bottom;
        this._container.left = this.plugin.options.left;
        this._container.horizontalCenter = this.plugin.options.horizontalCenter;
        this._container.verticalCenter = this.plugin.options.verticalCenter;
        this.plugin.container.addChild(this._container);

        this._stats = new Stats();
        this._stats.dom.style.position = "relative";
        this._stats.dom.style.pointerEvents = "none";
        this._container.dom.appendChild(this._stats.dom);

        var mode = this.plugin.options.mode;

        if(typeof mode === "string")
        {
            mode = this._modes.indexOf(mode);
        }

        if(typeof mode === "number" && mode < this._modes.length && mode >= 0)
        {
            this._mode = mode
        }

        this._stats.showPanel(this._mode);
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
        this._container = null;
        this._stats = null;
    },

    _clickHandler: function()
    {
        this._stats.showPanel(++ this._mode % this._stats.dom.children.length);
    }
};