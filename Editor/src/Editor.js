
var ForgePlugins = ForgePlugins || {};

ForgePlugins.Editor = function()
{
    this._ui = null;

    this._count = 0;

    this._history = null;

    this._selected = null;

    this.onSelected = new FORGE.EventDispatcher(this);
};

ForgePlugins.Editor.HOTSPOT_DEFAULT_CONFIG =
{
    facingCenter: true
};

ForgePlugins.Editor.prototype =
{
    boot: function()
    {
        this._ui = new ForgePlugins.EditorUI(this);
        this._history = new ForgePlugins.EditorHistory(this);
        this._history.add();
    },

    add: function(config, history)
    {
        if(typeof config === "undefined" || config === null)
        {
            config = this._generateHotspotConfig();
        }

        this.viewer.hotspots.create(config);
        this.reset();
        this.selected = config.uid;

        if(history !== false)
        {
            this._history.add("hotspot add");
        }
    },

    delete: function(uid, history)
    {
        this.viewer.hotspots.remove(uid);
        this.reset();

        this.selected = null;

        if(history !== false)
        {
            this._history.add();
        }
    },

    save: function()
    {
        var dump = this.dump();
        var json = JSON.stringify(dump, null, 4);
        var blob = new Blob([json], {type: "application/json"});
        var url  = URL.createObjectURL(blob);

        var a = document.createElement('a');
        a.download = "hotspots.json";
        a.href = url;
        a.click();
    },

    load: function(hotspots)
    {
        this.viewer.hotspots.clear();
        this.clear();

        for(var i = 0, ii = hotspots.length; i < ii; i++)
        {
            this.viewer.hotspots.create(hotspots[i]);
        }

        this.populate();
    },

    clear: function()
    {
        this.viewer.renderer.objects.clear();
    },

    populate: function()
    {
        this.viewer.renderer.objects.createRenderScenes();
        this.viewer.renderer.renderPipeline.addRenderScenes(viewer.renderer.objects.renderScenes);
    },

    reset: function()
    {
        this.clear();
        this.populate();
    },

    lookAt: function(uid)
    {
        var hs = FORGE.UID.get(uid);

        if(FORGE.Utils.isTypeOf(hs, "Hotspot3D"))
        {
            var pos = hs.transform.position;
            var spherical = FORGE.Math.cartesianToSpherical(pos.x, pos.y, pos.z, "deg");
            this.viewer.camera.lookAt(spherical.theta, spherical.phi, 0, this.viewer.camera.fov, 100);
        }
    },

    update: function()
    {

    },

    dump: function()
    {
        var dump = this.viewer.hotspots.dump();
        return dump;
    },

    destroy: function()
    {
        this._ui.destroy;
        this._ui = null;
    },

    _generateHotspotConfig: function()
    {
        var config = FORGE.Utils.extendSimpleObject({}, ForgePlugins.Editor.HOTSPOT_DEFAULT_CONFIG);
        config.uid = "hotspot-3d-editor-" + this._count;
        config.transform = { position: { theta: viewer.camera.yaw, phi: viewer.camera.pitch } };
        this._count++;

        return config;
    }
};

Object.defineProperty(ForgePlugins.Editor.prototype, "history",
{
    get: function()
    {
        return this._history;
    },
});

Object.defineProperty(ForgePlugins.Editor.prototype, "selected",
{
    get: function()
    {
        return this._selected;
    },

    set: function(value)
    {
        if(value === null)
        {
            this._selected = null;
            this.onSelected.dispatch();
            return;
        }

        var hs = FORGE.UID.get(value);

        if(FORGE.Utils.isTypeOf(hs, "Hotspot3D"))
        {
            this._selected = value;
            this.lookAt(this._selected);
            this.onSelected.dispatch();
        }
    }
});