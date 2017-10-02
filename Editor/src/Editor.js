
var ForgePlugins = ForgePlugins || {};

ForgePlugins.Editor = function()
{
    this._ui = null;

    this._hud = null;

    this._history = null;

    this._selected = null;

    this._transformMode = null;

    this._transformSpace = null;

    this.onHotspotsChange = new FORGE.EventDispatcher(this);

    this.onHotspotChange = new FORGE.EventDispatcher(this);

    this.onSelected = new FORGE.EventDispatcher(this);

    this.onLoadComplete = new FORGE.EventDispatcher(this);

    this.onTransformModeChange = new FORGE.EventDispatcher(this);

    this.onTransformSpaceChange = new FORGE.EventDispatcher(this);
};

ForgePlugins.Editor.HOTSPOT_DEFAULT_CONFIG =
{
    name: "untitled hotspot",
    facingCenter: false
};

ForgePlugins.Editor.transformModes =
{
    TRANSLATE: "translate",
    ROTATE: "rotate",
    SCALE: "scale"
};

ForgePlugins.Editor.transformSpaces =
{
    LOCAL: "local",
    WORLD: "world"
};

ForgePlugins.Editor.prototype =
{
    boot: function()
    {
        this._history = new ForgePlugins.EditorHistory(this);
        this._history.add("init");

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
            this._history.add("add");
        }

        this.onHotspotsChange.dispatch();
    },

    delete: function(uid, history)
    {
        this.viewer.hotspots.remove(uid);
        this.reset();

        this.selected = null;

        if(history !== false)
        {
            this._history.add("delete");
        }

        this.onHotspotsChange.dispatch();
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

        this._selected = null;

        for(var i = 0, ii = hotspots.length; i < ii; i++)
        {
            var hotspot = this.viewer.hotspots.create(hotspots[i]);
            hotspot.onClick.add(this._onClickHandler, this);
        }

        this.populate();

        if(history === true)
        {
            this._history.add("load");
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
        this._ui.update();
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
        // config.geometry = { type: this._ui.geometry.type };

        return config;
    },

    _onClickHandler: function(event)
    {
        this.selected = event.emitter.uid;
    },

    _selectHotspot: function(hotspot, dispatch)
    {
        this._selected = hotspot.uid;
        this.lookAt(this._selected);

        if(this._transformSpace === null)
        {
            this.transformSpace = ForgePlugins.Editor.transformSpaces.LOCAL;
        }

        if(this._transformMode === null)
        {
            this.transformMode = ForgePlugins.Editor.transformModes.TRANSLATE;
        }

        hotspot.transform.onChange.add(this._onHotspotChangeHandler, this);

        if(dispatch !== false)
        {
            this.onSelected.dispatch({ hotspot: hotspot }, true);
        }
    },

    _deselectHotspot: function(dispatch)
    {
        var hotspot = FORGE.UID.get(this._selected);

        if(FORGE.Utils.isTypeOf(hotspot, "Hotspot3D"))
        {
            hotspot.transform.onChange.remove(this._onHotspotChangeHandler, this);
        }

        this._selected = null;

        if(dispatch !== false)
        {
            this.onSelected.dispatch({ hotspot: null }, true);
        }
    },

    _onHotspotChangeHandler: function(event)
    {
        this.onHotspotChange.dispatch(null, true);
    }
};

Object.defineProperty(ForgePlugins.Editor.prototype, "history",
{
    get: function()
    {
        return this._history;
    }
});

Object.defineProperty(ForgePlugins.Editor.prototype, "ui",
{
    get: function()
    {
        return this._ui;
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
            this._deselectHotspot(true);
            return;
        }

        if(value === this._selected)
        {
            return;
        }

        var hotspot = FORGE.UID.get(value);

        if(FORGE.Utils.isTypeOf(hotspot, "Hotspot3D"))
        {
            this._selectHotspot(hotspot, true);
        }
    }
});

Object.defineProperty(ForgePlugins.Editor.prototype, "transformSpace",
{
    get: function()
    {
        return this._transformSpace;
    },

    set: function(value)
    {
        if(value === this._transformSpace)
        {
            return;
        }

        this._transformSpace = value;
        this.onTransformSpaceChange.dispatch({ space: this._transformSpace }, true);
    }
});

Object.defineProperty(ForgePlugins.Editor.prototype, "transformMode",
{
    get: function()
    {
        return this._transformMode;
    },

    set: function(value)
    {
        if(value === this._transformMode)
        {
            return;
        }

        this._transformMode = value;
        this.onTransformModeChange.dispatch({ mode: this._transformMode }, true);
    }
});
