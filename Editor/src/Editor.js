
var ForgePlugins = ForgePlugins || {};

ForgePlugins.Editor = function()
{
    this._ui = null;

    this._hud = null;

    this._history = null;

    this._selected = null;

    this.onSelected = new FORGE.EventDispatcher(this);

    this.onLoadComplete = new FORGE.EventDispatcher(this);
};

ForgePlugins.Editor.HOTSPOT_DEFAULT_CONFIG =
{
    name: "untitled hotspot",
    facingCenter: true
};

ForgePlugins.Editor.prototype =
{
    boot: function()
    {
        this._history = new ForgePlugins.EditorHistory(this);
        this._history.add();

        this._ui = new ForgePlugins.EditorUI(this);

        this._hud = new ForgePlugins.EditorHUD(this);
    },

    add: function(config, history)
    {
        if(typeof config === "undefined" || config === null)
        {
            config = this._generateHotspotConfig();
        }

        var hotspot = this.viewer.hotspots.create(config);
        hotspot.onClick.add(this._onClickHandler, this);
        this.reset();
        this.selected = hotspot.uid;

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

        if(window.navigator.msSaveOrOpenBlob)
        {
            window.navigator.msSaveOrOpenBlob(blob, "hotspots.json");
        }
        else
        {
            var url  = URL.createObjectURL(blob);

            var a = document.createElement('a');
            a.download = "hotspots.json";
            a.href = url;

            if(typeof document.createEvent === "function")
            {
                var event = document.createEvent("MouseEvents");
                event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                a.dispatchEvent(event);
            }
            else if (typeof a.click === "function")
            {
                a.click();
            }
        }
    },

    load: function(hotspots, clear, history)
    {
        if(clear === false)
        {
            var dump = this.dump();
            hotspots = dump.concat(hotspots);
        }

        this.viewer.hotspots.clear();
        this.clear();

        for(var i = 0, ii = hotspots.length; i < ii; i++)
        {
            var hotspot = this.viewer.hotspots.create(hotspots[i]);
            hotspot.onClick.add(this._onClickHandler, this);
        }

        this.populate();

        if(history === true)
        {
            this._history.add("hotspot load");
        }

        this.onLoadComplete.dispatch(null, true);
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
            var spherical = FORGE.Math.cartesianToSpherical(pos.x, pos.y, pos.z, FORGE.Math.DEGREES);
            this.viewer.camera.lookAt(spherical.theta, spherical.phi, 0, this.viewer.camera.fov, 100);
        }
    },

    update: function()
    {
        this._hud.update();
    },

    dump: function()
    {
        var dump = this.viewer.hotspots.dump();
        return dump;
    },

    destroy: function()
    {
        this._ui.destroy();
        this._ui = null;

        this._hud.destroy();
        this._hud = null;

        this._history.destroy();
        this._history = null;
    },

    _generateHotspotConfig: function()
    {
        var config = FORGE.Utils.extendSimpleObject({}, ForgePlugins.Editor.HOTSPOT_DEFAULT_CONFIG);
        config.transform = { position: { theta: viewer.camera.yaw, phi: viewer.camera.pitch } };

        return config;
    },

    _onClickHandler: function(event)
    {
        this.selected = event.emitter.uid;
    }
};

Object.defineProperty(ForgePlugins.Editor.prototype, "history",
{
    get: function()
    {
        return this._history;
    }
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

        if(value === this._selected)
        {
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