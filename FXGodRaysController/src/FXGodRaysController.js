var ForgePlugins = ForgePlugins || {};


ForgePlugins.FXGodRaysController = function()
{
    this._gui = null;

    this._fxUid = "";

    this._yaw = 4.1;
    this._pitch = 0.36;
    this._exposure = 1.0;
    this._decay = 0.93;
    this._density = 0.57;
    this._weight = 0.55;
    this._clamp = 1.0;
    this._coeff = 1.0;
    this._red = 1.0;
    this._green = 1.0;
    this._blue = 1.0;
};


ForgePlugins.FXGodRaysController.prototype =
{
    /**
     * Boot function
     */
    boot: function()
    {
        this._fxUid = this.plugin.options.fx;

        this._gui = new dat.GUI();

        this._gui.add(FORGE, "VERSION");
        this._gui.add(this, "yaw", 0.0, 2*3.14159).listen();
        this._gui.add(this, "pitch", -3.14159/2.0, 3.14159/2.0).listen();
        this._gui.add(this, "exposure", 0.0, 1.0).listen();
        this._gui.add(this, "decay", 0.0, 1.0).listen();
        this._gui.add(this, "density", 0.0, 1.0).listen();
        this._gui.add(this, "weight", 0.0, 1.0).listen();
        this._gui.add(this, "clamp", 0.0, 1.0).listen();
        this._gui.add(this, "coeff", 0.0, 1.0).listen();
        this._gui.add(this, "red",   0.0, 5.0).listen();
        this._gui.add(this, "green", 0.0, 5.0).listen();
        this._gui.add(this, "blue",  0.0, 5.0).listen();

        this.viewer.story.onSceneLoadComplete.add(this._onSceneLoadCompleteHandler, this);
    },

    update: function()
    {
        var plugin = FORGE.UID.get(this._fxUid);

        if (typeof plugin !== "undefined")
        {
            var fx = plugin.instance;

            fx.yaw = this._yaw;
            fx.pitch = this._pitch;
            fx.exposure = this._exposure;
            fx.decay = this._decay;
            fx.density = this._density;
            fx.weight = this._weight;
            fx.clamp = this._clamp;
            fx.coeff = this._coeff;
            fx.red = this._red;
            fx.green = this._green;
            fx.blue = this._blue;
        }
    },

    destroy: function()
    {
        this._gui = null;
    }
};


Object.defineProperty(ForgePlugins.FXGodRaysController.prototype, "yaw",
{
    get: function()     {   return this._yaw; },
    set: function(pos)  {   this._yaw = pos;  }
});

Object.defineProperty(ForgePlugins.FXGodRaysController.prototype, "pitch",
{
    get: function()     {   return this._pitch; },
    set: function(pos)  {   this._pitch = pos;  }
});

Object.defineProperty(ForgePlugins.FXGodRaysController.prototype, "exposure",
{
    get: function()     {   return this._exposure; },
    set: function(pos)  {   this._exposure = pos;  }
});

Object.defineProperty(ForgePlugins.FXGodRaysController.prototype, "decay",
{
    get: function()     {   return this._decay; },
    set: function(pos)  {   this._decay = pos;  }
});

Object.defineProperty(ForgePlugins.FXGodRaysController.prototype, "density",
{
    get: function()     {   return this._density; },
    set: function(pos)  {   this._density = pos;  }
});

Object.defineProperty(ForgePlugins.FXGodRaysController.prototype, "weight",
{
    get: function()     {   return this._weight; },
    set: function(pos)  {   this._weight = pos;  }
});

Object.defineProperty(ForgePlugins.FXGodRaysController.prototype, "clamp",
{
    get: function()     {   return this._clamp; },
    set: function(pos)  {   this._clamp = pos;  }
});

Object.defineProperty(ForgePlugins.FXGodRaysController.prototype, "coeff",
{
    get: function()     {   return this._coeff; },
    set: function(value)  {   this._coeff = value;  }
});

Object.defineProperty(ForgePlugins.FXGodRaysController.prototype, "red",
{
    get: function()     {   return this._red; },
    set: function(value)  {   this._red = value;  }
});

Object.defineProperty(ForgePlugins.FXGodRaysController.prototype, "green",
{
    get: function()     {   return this._green; },
    set: function(value)  {   this._green = value;  }
});

Object.defineProperty(ForgePlugins.FXGodRaysController.prototype, "blue",
{
    get: function()     {   return this._blue; },
    set: function(value)  {   this._blue = value;  }
});
