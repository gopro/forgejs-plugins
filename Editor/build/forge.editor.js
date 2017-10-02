
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


var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorUI = function(editor)
{
    this._editor = editor;

    this._container = null;

    this._buttonPanel = null;

    this._historyPanel = null;

    this._hierarchyPanel = null;

    this._helperPanel = null;

    this._inspectorPanel = null;

    this._geometryPanel = null;

    this._boot();
};

ForgePlugins.EditorUI.prototype =
{
    _boot: function()
    {
        this._container = document.createElement("div");
        this._container.id = "editor-main-container";
        this._editor.plugin.container.dom.appendChild(this._container);

        this._buttonPanel = new ForgePlugins.EditorButtonPanel(this._editor);
        this._container.appendChild(this._buttonPanel.container);

        this._historyPanel = new ForgePlugins.EditorHistoryPanel(this._editor);
        this._container.appendChild(this._historyPanel.container);

        this._hierarchyPanel = new ForgePlugins.EditorHierarchyPanel(this._editor);
        this._container.appendChild(this._hierarchyPanel.container);

        this._transformPanel = new ForgePlugins.EditorTransformPanel(this._editor);
        this._container.appendChild(this._transformPanel.container);

        this._geometryPanel = new ForgePlugins.EditorGeometryPanel(this._editor);
        this._container.appendChild(this._geometryPanel.container);
    },

    update: function()
    {
        this._transformPanel.update();
    },

    destroy: function()
    {
        this._container.removeChild(this._buttonPanel.container);
        this._buttonPanel.destroy();
        this._buttonPanel = null;

        this._container.removeChild(this._historyPanel.container);
        this._historyPanel.destroy();
        this._historyPanel = null;

        this._container.removeChild(this._hierarchyPanel.container);
        this._hierarchyPanel.destroy();
        this._hierarchyPanel = null;

        this._container.removeChild(this._helperPanel.container);
        this._helperPanel.destroy();
        this._helperPanel = null;

        this._container.removeChild(this._inspectorPanel.container);
        this._inspectorPanel.destroy();
        this._inspectorPanel = null;

        this._container.removeChild(this._geometryPanel.container);
        this._geometryPanel.destroy();
        this._geometryPanel = null;

        this._container = null;
    }
};

Object.defineProperty(ForgePlugins.EditorUI.prototype, "geometry",
{
    get: function()
    {
        return this._geometryPanel;
    }
});


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


var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorUIItem = function(editor, config)
{
    this._editor = editor;

    this._container = document.createElement("div");

    this._active = false;

    this.onActivate = new FORGE.EventDispatcher(this);

    this.onDeactivate = new FORGE.EventDispatcher(this);
};

ForgePlugins.EditorUIItem.prototype =
{
    activate: function()
    {
        this._active = true;
        this._container.classList.add("active");
        this.onActivate.dispatch(null, true);
    },

    deactivate: function()
    {
        this._active = false;
        this._container.classList.remove("active");
        this.onDeactivate.dispatch(null, true);
    },

    destroy: function()
    {
        this._container = null;

        this._editor = null;
    }
};

/**
 * Container of the component
 * @name ForgePlugins.EditorUIItem#container
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorUIItem.prototype, "container",
{
    get: function()
    {
        return this._container;
    }
});


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

var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorUIVector3 = function(editor, config)
{
    ForgePlugins.EditorUIItem.call(this, editor);

    this._config = config || { title: "Vector3" };

    this._labelTitle = null;

    this._labelX = null;

    this._inputX = null;

    this._labelY = null;

    this._inputY = null;

    this._labelZ = null;

    this._inputZ = null;

    this._enabled = false;

    this.onChange = null;

    this.onFocus = null;

    this._boot();
};

ForgePlugins.EditorUIVector3.prototype = Object.create(ForgePlugins.EditorUIItem.prototype);
ForgePlugins.EditorUIVector3.prototype.constructor = ForgePlugins.EditorUIVector3;


ForgePlugins.EditorUIVector3.prototype._boot = function()
{
    this._container.className = "editor-ui-vec3-container";
    this._container.addEventListener("click", this._onClickHandler.bind(this));

    this._labelTitle = document.createElement("p");
    this._labelTitle.innerHTML = this._config.title;
    this._container.appendChild(this._labelTitle);

    this._labelX = document.createElement("label");
    this._labelX.innerHTML = "X";
    this._container.appendChild(this._labelX);

    this._inputX = document.createElement("input");
    this._inputX.id = "editor-inspector-transform-x";
    this._inputX.type = "number";
    this._inputX.step = 0.1;
    this._inputX.disabled = true;
    this._inputX.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputX.addEventListener("change", this._onInputChangeHandler.bind(this));
    this._container.appendChild(this._inputX);

    this._labelY = document.createElement("label");
    this._labelY.innerHTML = "Y";
    this._container.appendChild(this._labelY);

    this._inputY = document.createElement("input");
    this._inputY.id = "editor-inspector-transform-y";
    this._inputY.type = "number";
    this._inputY.step = 0.1;
    this._inputY.disabled = true;
    this._inputY.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputY.addEventListener("change", this._onInputChangeHandler.bind(this));
    this._container.appendChild(this._inputY);

    this._labelZ = document.createElement("label");
    this._labelZ.innerHTML = "Z";
    this._container.appendChild(this._labelZ);

    this._inputZ = document.createElement("input");
    this._inputZ.id = "editor-inspector-transform-z";
    this._inputZ.type = "number";
    this._inputZ.step = 0.1;
    this._inputZ.disabled = true;
    this._inputZ.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputZ.addEventListener("change", this._onInputChangeHandler.bind(this));
    this._container.appendChild(this._inputZ);

    this.onChange = new FORGE.EventDispatcher(this);
    this.onFocus = new FORGE.EventDispatcher(this);

    this._editor.onSelected.add(this._onSelectedHandler, this);
    this._editor.onHotspotChange.add(this._onhotspotsChangeHandler, this);
};

ForgePlugins.EditorUIVector3.prototype._onClickHandler = function()
{
    this.activate();
};

ForgePlugins.EditorUIVector3.prototype._onInputFocusHandler = function()
{
    this.activate();
    this.onFocus.dispatch();
};

ForgePlugins.EditorUIVector3.prototype._onInputChangeHandler = function()
{
    this.onChange.dispatch();
};

ForgePlugins.EditorUIVector3.prototype.set = function(vector3)
{
    this._inputX.value = vector3.x;
    this._inputY.value = vector3.y;
    this._inputZ.value = vector3.z;
};

ForgePlugins.EditorUIVector3.prototype.enable = function()
{
    this._inputX.disabled = false;
    this._inputY.disabled = false;
    this._inputZ.disabled = false;
    this._enabled = true;
};

ForgePlugins.EditorUIVector3.prototype.disable = function()
{
    this._inputX.disabled = true;
    this._inputX.value = "";

    this._inputY.disabled = true;
    this._inputY.value = "";

    this._inputZ.disabled = true;
    this._inputZ.value = "";

    this._enabled = false;
};

ForgePlugins.EditorUIVector3.prototype.dump = function()
{
    var dump =
    {
        x: this.x,
        y: this.y,
        z: this.z
    };

    return dump;
};

ForgePlugins.EditorUIVector3.prototype.toString = function()
{
    return this._config.title + "[x: " + this.x + ", y: " + this.y + ", z: " + this.z + "]";
};

ForgePlugins.EditorUIVector3.prototype.destroy = function()
{
    this._inputX.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputX.addEventListener("change", this._onInputChangeHandler.bind(this));

    this._inputY.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputY.addEventListener("change", this._onInputChangeHandler.bind(this));

    this._inputZ.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._inputZ.addEventListener("change", this._onInputChangeHandler.bind(this));

    ForgePlugins.EditorUIItem.prototype.destroy.call(this);
};

Object.defineProperty(ForgePlugins.EditorUIVector3.prototype, "x",
{
    get: function()
    {
        return Number(this._inputX.value) || 0;
    }
});

Object.defineProperty(ForgePlugins.EditorUIVector3.prototype, "y",
{
    get: function()
    {
        return Number(this._inputY.value) || 0;
    }
});

Object.defineProperty(ForgePlugins.EditorUIVector3.prototype, "z",
{
    get: function()
    {
        return Number(this._inputZ.value) || 0;
    }
});

Object.defineProperty(ForgePlugins.EditorUIVector3.prototype, "title",
{
    get: function()
    {
        return this._config.title;
    }
});


var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorUINumber = function(editor, config)
{
    ForgePlugins.EditorUIItem.call(this, editor);

    this._config = config || { title: "Number", name: "number" };

    this._label = null;

    this._input = null;

    this._enabled = false;

    this.onChange = null;

    this.onFocus = null;

    this._boot();
};

ForgePlugins.EditorUINumber.prototype = Object.create(ForgePlugins.EditorUIItem.prototype);
ForgePlugins.EditorUINumber.prototype.constructor = ForgePlugins.EditorUINumber;


ForgePlugins.EditorUINumber.prototype._boot = function()
{
    this._container.className = "editor-ui-number-container";
    this._container.addEventListener("click", this._onClickHandler.bind(this));

    this._label = document.createElement("label");
    this._label.innerHTML = this._config.title;
    this._container.appendChild(this._label);

    this._input = document.createElement("input");
    this._input.className = "editor-ui-number-input";
    this._input.type = "number";
    this._input.disabled = true;
    this._input.addEventListener("focus", this._onInputFocusHandler.bind(this));
    this._input.addEventListener("change", this._onInputChangeHandler.bind(this));
    this._container.appendChild(this._input);

    this.onChange = new FORGE.EventDispatcher(this);
    this.onFocus = new FORGE.EventDispatcher(this);

    // this._editor.onSelected.add(this._onSelectedHandler, this);
    // this._editor.onHotspotChange.add(this._onhotspotsChangeHandler, this);
};

ForgePlugins.EditorUINumber.prototype._onClickHandler = function()
{
    this.activate();
};

ForgePlugins.EditorUINumber.prototype._onInputFocusHandler = function()
{
    this.activate();
    this.onFocus.dispatch();
};

ForgePlugins.EditorUINumber.prototype._onInputChangeHandler = function()
{
    this.onChange.dispatch();
};

ForgePlugins.EditorUINumber.prototype.set = function(number)
{
    this._input.value = number;
};

ForgePlugins.EditorUINumber.prototype.enable = function()
{
    this._input.disabled = false;
    this._enabled = true;
};

ForgePlugins.EditorUINumber.prototype.disable = function()
{
    this._input.disabled = true;
    this._input.value = "";
    this._enabled = false;
};

ForgePlugins.EditorUINumber.prototype.dump = function()
{
    var dump =
    {

    };

    return dump;
};

ForgePlugins.EditorUINumber.prototype.toString = function()
{
    return this._config.title + ": " + this.value;
};

ForgePlugins.EditorUINumber.prototype.destroy = function()
{
    this._input.removeEventListener("focus", this._onInputFocusHandler.bind(this));
    this._input.removeEventListener("change", this._onInputChangeHandler.bind(this));

    ForgePlugins.EditorUIItem.prototype.destroy.call(this);
};

Object.defineProperty(ForgePlugins.EditorUINumber.prototype, "value",
{
    get: function()
    {
        return Number(this._input.value) || 0;
    }
});

Object.defineProperty(ForgePlugins.EditorUINumber.prototype, "title",
{
    get: function()
    {
        return this._config.title;
    }
});

Object.defineProperty(ForgePlugins.EditorUINumber.prototype, "name",
{
    get: function()
    {
        return this._config.name;
    }
});




var ForgePlugins = ForgePlugins || {};

/**
 */
ForgePlugins.EditorUITransformButton = function(editor)
{
    ForgePlugins.EditorUIItem.call(this, editor);

    this._boot();
};

ForgePlugins.EditorUITransformButton.prototype = Object.create(ForgePlugins.EditorUIItem.prototype);
ForgePlugins.EditorUITransformButton.prototype.constructor = ForgePlugins.EditorUITransformButton;


ForgePlugins.EditorUITransformButton.prototype._boot = function()
{
    this._container = document.createElement("button");
    this._container.addEventListener("click", this._onClickHandler.bind(this));
};

ForgePlugins.EditorUITransformButton.prototype._onClickHandler = function()
{
    this.activate();
};

ForgePlugins.EditorUITransformButton.prototype.destroy = function()
{
    ForgePlugins.EditorUIItem.prototype.destroy.call(this);
};

/**
 * Container the title the component
 * @name ForgePlugins.EditorUITransformButton#title
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorUITransformButton.prototype, "title",
{
    get: function()
    {
        return this._config.title;
    }
});


var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorButtonPanel = function(editor)
{
    this._addButton = null;

    this._deleteButton = null;

    this._undoButton = null;

    this._redoButton = null;

    this._saveButton = null;

    this._loadInput = null;

    this._loadButton = null;

    ForgePlugins.EditorUIPanel.call(this, editor);

    this._boot();
};

ForgePlugins.EditorButtonPanel.prototype = Object.create(ForgePlugins.EditorUIPanel.prototype);
ForgePlugins.EditorButtonPanel.prototype.constructor = FORGE.EditorButtonPanel;

ForgePlugins.EditorButtonPanel.prototype._boot = function()
{
    ForgePlugins.EditorUIPanel.prototype._boot.call(this);

    this.title = "ForgeJS Editor";

    this.content.classList.add("editor-ui-panel-content-padding");

    this._addButton = document.createElement("button");
    this._addButton.id = "hotspot-add-button";
    this._addButton.innerHTML = "Add";
    this._addButton.addEventListener("click", this._addButtonClickHandler.bind(this), false);
    this.content.appendChild(this._addButton);

    this._deleteButton = document.createElement("button");
    this._deleteButton.id = "hotspot-delete-button";
    this._deleteButton.innerHTML = "Delete";
    this._deleteButton.disabled = true;
    this._deleteButton.addEventListener("click", this._deleteButtonClickHandler.bind(this), false);
    this.content.appendChild(this._deleteButton);

    this._undoButton = document.createElement("button");
    this._undoButton.id = "hotspot-undo-button";
    this._undoButton.innerHTML = "Undo";
    this._undoButton.disabled = true;
    this._undoButton.addEventListener("click", this._undoButtonClickHandler.bind(this), false);
    this.content.appendChild(this._undoButton);

    this._redoButton = document.createElement("button");
    this._redoButton.id = "hotspot-redo-button";
    this._redoButton.innerHTML = "Redo";
    this._redoButton.disabled = true;
    this._redoButton.addEventListener("click", this._redoButtonClickHandler.bind(this), false);
    this.content.appendChild(this._redoButton);

    this._saveButton = document.createElement("button");
    this._saveButton.id = "hotspot-save-button";
    this._saveButton.innerHTML = "Save";
    this._saveButton.addEventListener("click", this._saveButtonClickHandler.bind(this), false);
    this.content.appendChild(this._saveButton);

    this._loadInput = document.createElement("input");
    this._loadInput.type = "file";
    this._loadInput.name = "file";
    this._loadInput.id = "hotspot-load-input";
    this._loadInput.style.display = "none";
    this._loadInput.addEventListener("change", this._loadFileSelectHandler.bind(this), false);
    this.content.appendChild(this._loadInput);

    this._loadButton = document.createElement("button");
    this._loadButton.id = "hotspot-load-button";
    this._loadButton.innerHTML = "Load";
    this._loadButton.addEventListener("click", this._loadButtonClickHandler.bind(this), false);
    this.content.appendChild(this._loadButton);

    this._editor.onSelected.add(this._onSelectedHandler, this);
    this._editor.onLoadComplete.add(this._onLoadCompleteHandler, this);
    this._editor.history.onIndexChange.add(this._onIndexChangeHandler, this);
};

ForgePlugins.EditorButtonPanel.prototype._onSelectedHandler = function()
{
    this._deleteButton.disabled = this._editor.selected === null ? true : false;
};

ForgePlugins.EditorButtonPanel.prototype._onLoadCompleteHandler = function()
{
    this._deleteButton.disabled = this._editor.selected === null ? true : false;
    this._undoButton.disabled = this._editor.history.index === 0 ? true : false;
    this._redoButton.disabled = this._editor.history.index === this._editor.history.states.length - 1 ? true : false;
};

ForgePlugins.EditorButtonPanel.prototype._onIndexChangeHandler = function()
{
    this._undoButton.disabled = this._editor.history.index === 0 ? true : false;
    this._redoButton.disabled = this._editor.history.index === this._editor.history.states.length - 1 ? true : false;
};

ForgePlugins.EditorButtonPanel.prototype._addButtonClickHandler = function(event)
{
    this._editor.add();
};

ForgePlugins.EditorButtonPanel.prototype._deleteButtonClickHandler = function(event)
{
    this._editor.delete(this._editor.selected);
};

ForgePlugins.EditorButtonPanel.prototype._undoButtonClickHandler = function(event)
{
    this._editor.history.undo();
};

ForgePlugins.EditorButtonPanel.prototype._redoButtonClickHandler = function(event)
{
    this._editor.history.redo();
};

ForgePlugins.EditorButtonPanel.prototype._saveButtonClickHandler = function(event)
{
    this._editor.save();
};

ForgePlugins.EditorButtonPanel.prototype._loadButtonClickHandler = function(event)
{
    this._loadInput.click();
};

ForgePlugins.EditorButtonPanel.prototype._loadFileSelectHandler = function(event)
{
    var files = event.target.files;
    var file = files[0];

    if(typeof file !== "undefined" && file !== null)
    {
        var loadReader = new FileReader();
        loadReader.onload = this._loadReaderLoadHandler.bind(this);
        loadReader.readAsText(file);
    }

    var input = event.target;
    input.value = null;
};

ForgePlugins.EditorButtonPanel.prototype._loadReaderLoadHandler = function(event)
{
    var data = JSON.parse(event.target.result);
    // var all = this._editor.viewer.hotspots.dump().concat(data);
    // var validate = FORGE.UID.validate(all);
    var validate = FORGE.UID.validate(data);

    if(validate === false)
    {
        this._loadDialogReplaceOnly(data);
    }
    else
    {
        if(this._editor.viewer.hotspots.count > 0)
        {
            this._loadDialogMergeOrReplace(data);
        }
        else
        {
            this._editor.load(data, true, true);
        }
    }
};

ForgePlugins.EditorButtonPanel.prototype._loadDialogReplaceOnly = function(data)
{
    var dialog = new ForgePlugins.EditorDialogBox(this._editor);

    var buttons =
    [
        {
            label: "Replace",
            callback: this._editor.load,
            context: this._editor,
            args: [data, true, true],
        },

        {
            label: "Close"
        }
    ];

    dialog.open
    (
        "Load Hotspots",
        "You have duplicate uids, you can't merge but only replace current hotspots",
        buttons
    );
};

ForgePlugins.EditorButtonPanel.prototype._loadDialogMergeOrReplace = function(data)
{
    var dialog = new ForgePlugins.EditorDialogBox(this._editor);

    var buttons =
    [
        {
            label: "Merge",
            callback: this._editor.load,
            context: this._editor,
            args: [data, false, true]
        },

        {
            label: "Replace",
            callback: this._editor.load,
            context: this._editor,
            args: [data, true, true],
        },

        {
            label: "Close"
        }
    ];

    dialog.open
    (
        "Load Hotspots",
        "Do you want to replace all hotspots or merge with the current hotspots?",
        buttons
    );
};

ForgePlugins.EditorButtonPanel.prototype.destroy = function()
{
    this._editor.onSelected.remove(this._onSelectedHandler, this);
    this._editor.onLoadComplete.remove(this._onLoadCompleteHandler, this);
    this._editor.history.onIndexChange.remove(this._onIndexChangeHandler, this);

    this._addButton.removeEventListener("click", this._addButtonClickHandler.bind(this), false);
    this.content.removeChild(this._addButton);
    this._addButton = null;

    this._deleteButton.removeEventListener("click", this._deleteButtonClickHandler.bind(this), false);
    this.content.removeChild(this._deleteButton);
    this._deleteButton = null;

    this._undoButton.removeEventListener("click", this._undoButtonClickHandler.bind(this), false);
    this.content.removeChild(this._undoButton);
    this._undoButton = null;

    this._redoButton.removeEventListener("click", this._redoButtonClickHandler.bind(this), false);
    this.content.removeChild(this._redoButton);
    this._redoButton = null;

    this._saveButton.removeEventListener("click", this._redoButtonClickHandler.bind(this), false);
    this.content.removeChild(this._saveButton);
    this._saveButton = null;

    this._loadInput.removeEventListener("change", this._loadFileSelectHandler.bind(this), false);
    this.content.removeChild(this._loadInput);
    this._loadInput = null;

    this._loadButton.removeEventListener("click", this._loadButtonClickHandler.bind(this), false);
    this.content.removeChild(this._loadButton);
    this._loadButton = null;

    ForgePlugins.EditorUIPanel.prototype.destroy.call(this);
};


var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorHierarchyPanel = function(editor)
{
    this._list = null;

    this._edited = null;

    this._switching = false;

    ForgePlugins.EditorUIPanel.call(this, editor);

    this._boot();
};

ForgePlugins.EditorHierarchyPanel.prototype = Object.create(ForgePlugins.EditorUIPanel.prototype);
ForgePlugins.EditorHierarchyPanel.prototype.constructor = FORGE.EditorHierarchyPanel;

ForgePlugins.EditorHierarchyPanel.prototype._boot = function()
{
    ForgePlugins.EditorUIPanel.prototype._boot.call(this);

    this.title = "Hierarchy";

    this._list = document.createElement("div");
    this._list.id = "hotspots-list";
    this.content.appendChild(this._list);

    this._editor.onSelected.add(this._onSelectedHandler, this);
    this._editor.onHotspotsChange.add(this._onHotspotsChangeHandler, this);
    this._editor.onLoadComplete.add(this._onLoadCompleteHandler, this);
};

ForgePlugins.EditorHierarchyPanel.prototype._onSelectedHandler = function()
{
    this._updateList();
};

ForgePlugins.EditorHierarchyPanel.prototype._onHotspotsChangeHandler = function()
{
    this._updateList();
};

ForgePlugins.EditorHierarchyPanel.prototype._onLoadCompleteHandler = function()
{
    this._updateList();
};

ForgePlugins.EditorHierarchyPanel.prototype._updateList = function()
{
    this._clearList();

    var viewer = this._editor.viewer;
    var hotspots = viewer.hotspots.all;

    var hs, div, p;
    for(var i = 0, ii = hotspots.length; i < ii; i++)
    {
        hs = hotspots[i];

        div = document.createElement("div");
        div.dataset.uid = hs.uid;
        div.addEventListener("click", this._listItemClickHandler.bind(this));
        div.addEventListener("dblclick", this._listItemDoubleClickHandler.bind(this));

        p = document.createElement("p");
        p.innerHTML = hs.name;

        div.appendChild(p);

        if(this._editor.selected === hs.uid)
        {
            div.classList.add("selected");
        }

        this._list.appendChild(div);
    }

    if(this._edited !== null)
    {
        this._enterEdition();
    }
    else
    {
        this._editor.viewer.controllers.enabled = true;
    }

    this._switching = false;
};

ForgePlugins.EditorHierarchyPanel.prototype._clearList = function()
{
    var child, input;

    for(var i = 0, ii = this._list.children.length; i < ii; i++)
    {
        child = this._list.children[i];
        child.removeEventListener("click", this._listItemClickHandler.bind(this));
        child.removeEventListener("dblclick", this._listItemDoubleClickHandler.bind(this));

        if(child.firstChild.nodeName.toLowerCase() === "input")
        {
            input = child.firstChild;
            input.removeEventListener("focusout", this._onInputFocusOutHandler.bind(this));
            input.removeEventListener("keydown", this._onInputKeyPressHandler.bind(this));
        }
    }

    this._list.innerHTML = "";
};

ForgePlugins.EditorHierarchyPanel.prototype._getItemByUid = function(uid)
{
    var child;

    for(var i = 0, ii = this._list.children.length; i < ii; i++)
    {
        child = this._list.children[i];

        if(child.dataset.uid === uid)
        {
            return child;
        }
    }

    return null;
};

ForgePlugins.EditorHierarchyPanel.prototype._listItemClickHandler = function(event)
{
    var div = event.currentTarget;
    var uid = div.dataset.uid;

    if(this._editor.selected === uid)
    {
        this._enterEdition();
    }
    else
    {
        this._editor.selected = uid;
    }
};

ForgePlugins.EditorHierarchyPanel.prototype._listItemDoubleClickHandler = function(event)
{
    this._enterEdition();
};

ForgePlugins.EditorHierarchyPanel.prototype._enterEdition = function(edited)
{
    this._edited = edited || this._editor.selected;

    if(this._edited === null)
    {
        return;
    }

    var div = this._getItemByUid(this._edited);
    var hs = FORGE.UID.get(this._edited);

    while (div.firstChild)
    {
        div.removeChild(div.firstChild);
    }

    var input = document.createElement("input");
    input.addEventListener("focusin", this._onInputFocusInHandler.bind(this));
    input.addEventListener("focusout", this._onInputFocusOutHandler.bind(this));
    input.addEventListener("keydown", this._onInputKeyPressHandler.bind(this));

    input.dataset.nameBackup = hs.name;
    input.value = hs.name;
    div.appendChild(input);
    input.select();
    input.setSelectionRange(0, input.value.length);

    div.classList.add("edited");

    this._editor.viewer.controllers.enabled = false;
};

ForgePlugins.EditorHierarchyPanel.prototype._onInputFocusInHandler = function(event)
{
    this._editor.viewer.controllers.enabled = false;
};

ForgePlugins.EditorHierarchyPanel.prototype._onInputFocusOutHandler = function(event)
{
    var input = event.currentTarget;
    this._saveHotspotNameFromInput(input);
    this._editor.viewer.controllers.enabled = true;
};

ForgePlugins.EditorHierarchyPanel.prototype._onInputKeyPressHandler = function(event)
{
    var input = event.currentTarget;
    var div = input.parentElement;
    var keyCode = event.keyCode;
    var keyCodes = [9, 13, 27]; //9:tab, 13:enter, 27:escape

    if(keyCode === 27)
    {
        input.value = input.dataset.nameBackup;
        this._saveHotspotNameFromInput(input);
        this._edited = null;
    }

    if(keyCode === 13)
    {
        this._saveHotspotNameFromInput(input);
        this._edited = null;
    }

    if(keyCode === 9)
    {
        this._switching = true;

        var hotspots = this._editor.viewer.hotspots.uids;

        if(hotspots.length < 2) { return; }

        var index = hotspots.indexOf(this._editor.selected);
        var next = index + 1;

        if(index === hotspots.length - 1)
        {
            next = 0;
        }

        this._edited = hotspots[next];
        this._editor.selected = hotspots[next];
    }

    if(keyCodes.indexOf(event.keyCode) !== -1)
    {
        event.preventDefault();
        this._updateList();
    }
};

ForgePlugins.EditorHierarchyPanel.prototype._saveHotspotNameFromInput = function(input)
{
    var div = input.parentElement;
    var hs = FORGE.UID.get(div.dataset.uid);

    if(hs.name !== input.value)
    {
        hs.name = input.value;
        this._editor.history.add("rename");
    }
};

ForgePlugins.EditorHierarchyPanel.prototype.destroy = function()
{
    this._editor.onSelected.remove(this._onSelectedHandler, this);
    this._editor.onHotspotsChange.remove(this._onHotspotsChangeHandler, this);
    this._editor.onLoadComplete.remove(this._onLoadCompleteHandler, this);

    this._clearList();
    this.content.removeChild(this._list);
    this._list = null;

    ForgePlugins.EditorUIPanel.prototype.destroy.call(this);
};


var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorHistoryPanel = function(editor)
{
    this._list = null;

    ForgePlugins.EditorUIPanel.call(this, editor);

    this._boot();
};

ForgePlugins.EditorHistoryPanel.prototype = Object.create(ForgePlugins.EditorUIPanel.prototype);
ForgePlugins.EditorHistoryPanel.prototype.constructor = FORGE.EditorHistoryPanel;

ForgePlugins.EditorHistoryPanel.prototype._boot = function()
{
    ForgePlugins.EditorUIPanel.prototype._boot.call(this);

    this.title = "History";

    this._list = document.createElement("div");
    this._list.id = "history-list";
    this.content.appendChild(this._list);

    this._editor.history.onIndexChange.add(this._onIndexChangeHandler, this);
};

ForgePlugins.EditorHistoryPanel.prototype._onIndexChangeHandler = function()
{
    this._updateList();
};

ForgePlugins.EditorHistoryPanel.prototype._updateList = function()
{
    this._clearList();

    var states = this._editor.history.states;

    var s, div, p;
    for(var i = 0, ii = states.length; i < ii; i++)
    {
        s = states[i];

        div = document.createElement("div");
        div.dataset.index = i;
        div.addEventListener("click", this._listItemClickHandler.bind(this));
        div.addEventListener("dblclick", this._listItemDoubleClickHandler.bind(this));

        p = document.createElement("p");
        p.innerHTML = s.name;

        div.appendChild(p);

        if(this._editor.history.index === i)
        {
            div.classList.add("selected");
        }

        this._list.insertBefore(div, this._list.firstChild);
    }
};

ForgePlugins.EditorHistoryPanel.prototype._clearList = function()
{
    var child, input;

    for(var i = 0, ii = this._list.children.length; i < ii; i++)
    {
        child = this._list.children[i];
        child.removeEventListener("click", this._listItemClickHandler.bind(this));
        child.removeEventListener("dblclick", this._listItemDoubleClickHandler.bind(this));

        if(child.firstChild.nodeName.toLowerCase() === "input")
        {
            input = child.firstChild;
            input.removeEventListener("focusout", this._onInputFocusOutHandler.bind(this));
            input.removeEventListener("keydown", this._onInputKeyPressHandler.bind(this));
        }
    }

    this._list.innerHTML = "";
};

ForgePlugins.EditorHistoryPanel.prototype._listItemClickHandler = function(event)
{
    var div = event.currentTarget;
    var index = Number(div.dataset.index);

    this._editor.history.load(index);
};

ForgePlugins.EditorHistoryPanel.prototype._listItemDoubleClickHandler = function(event)
{
    // Placeholder
};

ForgePlugins.EditorHistoryPanel.prototype.destroy = function()
{
    this._clearList();

    this.content.removeChild(this._list);
    this._list = null;

    ForgePlugins.EditorUIPanel.prototype.destroy.call(this);
};

var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorTransformHelper = function(editor)
{
    this._editor = editor;

    this._container = null;

    this._scene = null;

    this._transformControls = null;

    this._buttonGroup = null;

    this._translateButton = null;

    this._rotateButton = null;

    this._scaleButton = null;

    this._spaceSelect = null;

    this._transformBackup = null;

    this._visible = false;

    this._boot();
};

ForgePlugins.EditorTransformHelper.prototype =
{
    _boot: function()
    {
        this._container = document.createElement("div");
        this._container.id = "editor-helper-panel-container";

        this._spaceSelect = document.createElement("select");
        this._spaceSelect.id = "helper-translate-space-select";
        this._spaceSelect.addEventListener("change", this._spaceSelectChangeHandler.bind(this));

        var space, option;
        for(var i in ForgePlugins.Editor.transformSpaces)
        {
            space = ForgePlugins.Editor.transformSpaces[i];
            option = document.createElement("option");
            option.value = space;
            option.innerHTML = space;
            this._spaceSelect.appendChild(option);
        }

        this._container.appendChild(this._spaceSelect);

        this._buttonGroup = new ForgePlugins.EditorUIGroup(this._editor);
        this._buttonGroup.onChildActivate.add(this._onButtonGroupChildActivateHandler, this);
        this._buttonGroup.container.id = "editor-transform-button-group";
        this._container.appendChild(this._buttonGroup.container);

        this._translateButton = new ForgePlugins.EditorUITransformButton(this._editor);
        this._translateButton.container.id = "helper-translate-button";
        this._buttonGroup.add(this._translateButton);

        this._rotateButton = new ForgePlugins.EditorUITransformButton(this._editor);
        this._rotateButton.container.id = "helper-rotate-button";
        this._buttonGroup.add(this._rotateButton);

        this._scaleButton = new ForgePlugins.EditorUITransformButton(this._editor);
        this._scaleButton.container.id = "helper-scale-button";
        this._buttonGroup.add(this._scaleButton);

        this._scene = new THREE.Scene();

        this._transformControls = new THREE.TransformControls( this._editor.viewer.camera.main, this._editor.viewer.container.dom );
        this._transformControls.addEventListener("objectChange", this._objectChangeHandler.bind(this));
        this._transformControls.addEventListener("mouseDown", this._mouseDownHandler.bind(this));
        this._transformControls.addEventListener("mouseUp", this._mouseUpHandler.bind(this));
        this._scene.add(this._transformControls);

        this._editor.onSelected.add(this._onSelectedHandler, this);
        this._editor.onTransformModeChange.add(this._onTransformModeChangedHandler, this);
        this._editor.onTransformSpaceChange.add(this._onTransformSpaceChangedHandler, this);
        this._editor.onLoadComplete.add(this._onLoadCompleteHandler, this);

        // For the render
        this._editor.viewer.renderer.onAfterRender.add(this._onAfterRenderHandler, this);
    },

    _spaceSelectChangeHandler: function(event)
    {
        var select = this._spaceSelect;
        var space = select.options[select.selectedIndex].value;
        this._editor.transformSpace = space;
    },

    _objectChangeHandler: function(event)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        hotspot.transform.updateFromObject3D(hotspot.mesh);
    },

    _mouseDownHandler: function(event)
    {
        this._editor.viewer.controllers.enabled = false;

        var hotspot = FORGE.UID.get(this._editor.selected);
        this._transformBackup = hotspot.transform.dump();
    },

    _mouseUpHandler: function(event)
    {
        this._editor.viewer.controllers.enabled = true;

        var hotspot = FORGE.UID.get(this._editor.selected);

        if (FORGE.Utils.compareObjects(hotspot.transform.dump(), this._transformBackup) === false)
        {
            this._editor.history.add(this._editor.transformMode);
        }
    },

    _onSelectedHandler: function(event)
    {
        this._updateSelectedHotspot();
    },

    _onLoadCompleteHandler: function()
    {
        this._updateSelectedHotspot();
    },

    _onAfterRenderHandler: function()
    {
        if(this._visible === false)
        {
            return;
        }

        var viewer = this._editor.viewer;
        var camera = viewer.camera.main;

        viewer.renderer.webGLRenderer.render(this._scene, camera);
    },

    _onTransformSpaceChangedHandler: function(event)
    {
        this._transformControls.setSpace(event.data.space);
    },

    _onTransformModeChangedHandler: function(event)
    {
        this._transformControls.setMode(event.data.mode);

        switch(event.data.mode)
        {
            case ForgePlugins.Editor.transformModes.TRANSLATE:
                this._buttonGroup.activate(0);
                break;

            case ForgePlugins.Editor.transformModes.ROTATE:
                this._buttonGroup.activate(1);
                break;

            case ForgePlugins.Editor.transformModes.SCALE:
                this._buttonGroup.activate(2);
                break;
        }
    },

    _onButtonGroupChildActivateHandler: function(event)
    {
        var item = event.data.item;
        var index = this._buttonGroup.children.indexOf(item);

        switch(index)
        {
            case 0:
                this._editor.transformMode = ForgePlugins.Editor.transformModes.TRANSLATE;
                break;

            case 1:
                this._editor.transformMode = ForgePlugins.Editor.transformModes.ROTATE;
                break;

            case 2:
                this._editor.transformMode = ForgePlugins.Editor.transformModes.SCALE;
                break;
        }
    },

    _updateSelectedHotspot: function()
    {

        if(this._editor.selected !== null)
        {
            var hotspot = FORGE.UID.get(this._editor.selected);
            this._transformControls.attach(hotspot.mesh);
            this._visible = true;
        }
        else
        {
            this._transformControls.detach();
            this._visible = false;
        }
    },

    update: function()
    {
        this._transformControls.update();
    },

    destroy: function()
    {
        this._editor.viewer.renderer.onAfterRender.remove(this._onAfterRenderHandler, this);
        this._editor.onSelected.remove(this._onSelectedHandler, this);

        this._transformControls.dispose();
        this._transformControls = null;

        this._editor = null;
    }
};

/**
 * Container of the panel
 * @name ForgePlugins.EditorTransformHelper#container
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorTransformHelper.prototype, "container",
{
    get: function()
    {
        return this._container;
    }
});



var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorTransformInspector = function(editor)
{
    this._editor = editor;

    this._container = null;

    this._transform = null;
    this._position = null;
    this._rotation = null;
    this._scale = null;

    this._boot();
};

ForgePlugins.EditorTransformInspector.prototype =
{
    _boot: function()
    {
        this._container = document.createElement("div");
        this._container.id = "editor-inspector-panel-container";

        this._transform = new ForgePlugins.EditorUIGroup();
        this._transform.onChildActivate.add(this._onTransformChildActivateHandler, this);
        this._transform.id = "editor-inspector-transform-group";
        this._container.appendChild(this._transform.container);

        var positionConfig = { title: "Position" };
        this._position = new ForgePlugins.EditorUIVector3(this._editor, positionConfig);
        this._position.onFocus.add(this._onVectorFocusHandler, this);
        this._position.onChange.add(this._onVectorChangeHandler, this);
        this._transform.add(this._position);

        var rotationConfig = { title: "Rotation" };
        this._rotation = new ForgePlugins.EditorUIVector3(this._editor, rotationConfig);
        this._rotation.onFocus.add(this._onVectorFocusHandler, this);
        this._rotation.onChange.add(this._onVectorChangeHandler, this);
        this._transform.add(this._rotation);

        var scaleConfig = { title: "Scale" };
        this._scale = new ForgePlugins.EditorUIVector3(this._editor, scaleConfig);
        this._scale.onFocus.add(this._onVectorFocusHandler, this);
        this._scale.onChange.add(this._onVectorChangeHandler, this);
        this._transform.add(this._scale);

        this._editor.onSelected.add(this._onSelectedHandler, this);
        this._editor.onHotspotChange.add(this._onHotspotsChangeHandler, this);
        this._editor.onTransformModeChange.add(this._onTransformModeChangedHandler, this);
    },

    _onSelectedHandler: function(event)
    {
        var hotspot = event.data.hotspot;

        if(hotspot !== null)
        {
            this.enable();
            this._populate(hotspot.uid);
        }
        else
        {
            this._transform.deactivateAll();
            this.disable();
        }
    },

    _onHotspotsChangeHandler: function(event)
    {
        this._populate();
    },

    _onTransformModeChangedHandler: function(event)
    {
        switch(event.data.mode)
        {
            case ForgePlugins.Editor.transformModes.TRANSLATE:
                this._transform.activate(0);
                break;

            case ForgePlugins.Editor.transformModes.ROTATE:
                this._transform.activate(1);
                break;

            case ForgePlugins.Editor.transformModes.SCALE:
                this._transform.activate(2);
                break;
        }
    },

    _onTransformChildActivateHandler: function(event)
    {
        var item = event.data.item;
        var index = this._transform.children.indexOf(item);

        switch(index)
        {
            case 0:
                this._editor.transformMode = ForgePlugins.Editor.transformModes.TRANSLATE;
                break;

            case 1:
                this._editor.transformMode = ForgePlugins.Editor.transformModes.ROTATE;
                break;

            case 2:
                this._editor.transformMode = ForgePlugins.Editor.transformModes.SCALE;
                break;
        }
    },

    _onVectorFocusHandler: function(event)
    {

    },

    _onVectorChangeHandler: function(event)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        hotspot.transform.load(this.dump());

        this._editor.history.add(this._editor.transformMode);
    },

    _populate: function(uid)
    {
        uid = uid || this._editor.selected;

        var hs = FORGE.UID.get(uid);
        var x, y, z;

        x = hs.transform.position.x.toFixed(2);
        y = hs.transform.position.y.toFixed(2);
        z = hs.transform.position.z.toFixed(2);
        this._position.set(new THREE.Vector3(x, y, z));

        x = hs.transform.rotation.x.toFixed(2);
        y = hs.transform.rotation.y.toFixed(2);
        z = hs.transform.rotation.z.toFixed(2);
        this._rotation.set(new THREE.Vector3(x, y, z));

        x = hs.transform.scale.x.toFixed(2);
        y = hs.transform.scale.y.toFixed(2);
        z = hs.transform.scale.z.toFixed(2);
        this._scale.set(new THREE.Vector3(x, y, z));
    },

    enable: function()
    {
        this._position.enable();
        this._rotation.enable();
        this._scale.enable();
    },

    dump: function()
    {
        var dump =
        {
            position: this._position.dump(),
            rotation: this._rotation.dump(),
            scale: this._scale.dump()
        };

        return dump;
    },

    disable: function()
    {
        this._position.disable();
        this._rotation.disable();
        this._scale.disable();
    },

    destroy: function()
    {
        this._position.onFocus.remove(this._onVectorFocusHandler, this);
        this._position.onChange.remove(this._onVectorChangeHandler, this);
        this._position.detroy();

        this._rotation.onFocus.remove(this._onVectorFocusHandler, this);
        this._rotation.onChange.remove(this._onVectorChangeHandler, this);
        this._rotation.detroy();

        this._scale.onFocus.remove(this._onVectorFocusHandler, this);
        this._scale.onChange.remove(this._onVectorChangeHandler, this);
        this._scale.detroy();

        this._editor = null;
    }
};

/**
 * Container of the panel
 * @name ForgePlugins.EditorTransformInspector#container
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorTransformInspector.prototype, "container",
{
    get: function()
    {
        return this._container;
    }
});

/**
 * The transform group
 * @name ForgePlugins.EditorTransformInspector#transform
 * @readonly
 */
Object.defineProperty(ForgePlugins.EditorTransformInspector.prototype, "transform",
{
    get: function()
    {
        return this._transform;
    }
});


var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorTransformPanel = function(editor)
{
    this._helper = null;

    this._inspector = null;

    ForgePlugins.EditorUIPanel.call(this, editor);

    this._boot();
};

ForgePlugins.EditorTransformPanel.prototype = Object.create(ForgePlugins.EditorUIPanel.prototype);
ForgePlugins.EditorTransformPanel.prototype.constructor = FORGE.EditorTransformPanel;

ForgePlugins.EditorTransformPanel.prototype._boot = function()
{
    ForgePlugins.EditorUIPanel.prototype._boot.call(this);

    this.title = "Transform";

    this.content.classList.add("editor-ui-panel-content-padding");

    this._helper = new ForgePlugins.EditorTransformHelper(this._editor);
    this.content.appendChild(this._helper.container);

    this._inspector = new ForgePlugins.EditorTransformInspector(this._editor);
    this.content.appendChild(this._inspector.container);
};

ForgePlugins.EditorTransformPanel.prototype.update = function()
{
    this._helper.update();
};

ForgePlugins.EditorTransformPanel.prototype.destroy = function()
{
    this._editor = null;
};


var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorGeometryPanel = function(editor)
{
    this._geometryTypeContainer = null;
    this._geometryTypeLabel = null;
    this._geometryTypeSelect = null;

    this._geometryFormContainer = null;

    ForgePlugins.EditorUIPanel.call(this, editor);

    this._boot();
};

ForgePlugins.EditorGeometryPanel.prototype = Object.create(ForgePlugins.EditorUIPanel.prototype);
ForgePlugins.EditorGeometryPanel.prototype.constructor = FORGE.EditorGeometryPanel;

ForgePlugins.EditorGeometryPanel.types =
[
    FORGE.HotspotGeometryType.PLANE,
    FORGE.HotspotGeometryType.BOX,
    FORGE.HotspotGeometryType.SPHERE,
    FORGE.HotspotGeometryType.CYLINDER,
    FORGE.HotspotGeometryType.SHAPE
];

ForgePlugins.EditorGeometryPanel.params =
{
    plane: ["width", "height"],
    box: ["width", "height", "depth"],
    sphere: ["radius"],
    cylinder: ["radiusTop", "radiusBottom", "height"],
    shape: null
};

ForgePlugins.EditorGeometryPanel.prototype._boot = function()
{
    ForgePlugins.EditorUIPanel.prototype._boot.call(this);

    this.title = "Geometry";

    this.content.classList.add("editor-ui-panel-content-padding");

    this._geometryTypeContainer = document.createElement("div");
    this._geometryTypeContainer.id = "geometry-type-container";
    this.content.appendChild(this._geometryTypeContainer);

    this._geometryTypeLabel = document.createElement("p");
    this._geometryTypeLabel.id = "geometry-type-label";
    this._geometryTypeLabel.innerHTML = "Type";
    this._geometryTypeContainer.appendChild(this._geometryTypeLabel);

    this._geometryTypeSelect = document.createElement("select");
    this._geometryTypeSelect.addEventListener("change", this._geometryTypeSelectChangeHandler.bind(this));

    var option, type;
    for(var i = 0, ii = ForgePlugins.EditorGeometryPanel.types.length; i <ii; i++)
    {
        type = ForgePlugins.EditorGeometryPanel.types[i];
        option = document.createElement("option");
        option.value = type;
        option.innerHTML = type;
        this._geometryTypeSelect.appendChild(option);
    }

    this._geometryTypeContainer.appendChild(this._geometryTypeSelect);

    this._geometryFormContainer = new ForgePlugins.EditorUIGroup(this._editor);
    this.content.appendChild(this._geometryFormContainer.container);

    this._editor.onSelected.add(this._onSelectedHandler, this);
};

ForgePlugins.EditorGeometryPanel.prototype._clearGeometryForm = function()
{
    var children = this._geometryFormContainer.children;

    for(var i = 0, ii = children.length; i < ii; i++)
    {
        children[i].onChange.remove(this._numberChangeHandler, this);
    }

    this._geometryFormContainer.container.innerHTML = "";
};

ForgePlugins.EditorGeometryPanel.prototype._generateGeometryForm = function()
{
    var type = this.type;
    var params = ForgePlugins.EditorGeometryPanel.params[type];
    var options = null;

    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        options = hotspot.geometry.dump().options;
    }

    if(params !== null)
    {
        var config, number;
        for(var i = 0, ii = params.length; i < ii; i++)
        {
            config = { title: params[i], name: params[i] };
            number = new ForgePlugins.EditorUINumber(this._editor, config);
            number.onChange.add(this._numberChangeHandler, this);
            number.enable();

            this._geometryFormContainer.add(number);

            if(options !== null)
            {
                number.set(options[params[i]]);
            }
        }
    }
};

ForgePlugins.EditorGeometryPanel.prototype._onSelectedHandler = function()
{
    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        this._geometryTypeSelect.value = hotspot.geometry.type;

        this._clearGeometryForm();
        this._generateGeometryForm();
    }
};

ForgePlugins.EditorGeometryPanel.prototype._geometryTypeSelectChangeHandler = function()
{
    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        hotspot.geometry.onLoadComplete.addOnce(this._geometryLoadCompleteHandler, this);

        var g = { type: this.type };
        hotspot.geometry.load(g);
    }
};

ForgePlugins.EditorGeometryPanel.prototype._numberChangeHandler = function()
{
    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        hotspot.geometry.onLoadComplete.addOnce(this._geometryLoadCompleteHandler, this);

        var children = this._geometryFormContainer.children;

        var g = { type: this.type, options: {} };

        for(var i = 0, ii = children.length; i < ii; i++)
        {
            g.options[children[i].name] = children[i].value;
        }

        hotspot.geometry.load(g);
    }
};

ForgePlugins.EditorGeometryPanel.prototype._geometryLoadCompleteHandler = function()
{
    if(this._editor.selected !== null)
    {
        var hotspot = FORGE.UID.get(this._editor.selected);
        hotspot.mesh.geometry = hotspot.geometry.geometry;

        this._clearGeometryForm();
        this._generateGeometryForm();

        this._editor.history.add("geometry change");
    }
};

ForgePlugins.EditorGeometryPanel.prototype.destroy = function()
{
    this._editor = null;
};

Object.defineProperty(ForgePlugins.EditorGeometryPanel.prototype, "type",
{
    get: function()
    {
        return this._geometryTypeSelect.value;
    }
});

var ForgePlugins = ForgePlugins || {};

ForgePlugins.EditorHUD = function(editor)
{
    this._editor = editor;

    this._canvas = null;

    this._options = { cross: true };

    this._boot();
};

ForgePlugins.EditorHUD.prototype =
{

    _boot: function()
    {
        this._canvas = this._editor.plugin.create.canvas();
        this._canvas.maximize(true);
        this._editor.plugin.container.addChild(this._canvas);
    },

    update: function()
    {
        var ctx = this._canvas.context2D;
        ctx.clearRect(0, 0, this._canvas.pixelWidth, this._canvas.pixelHeight);

        if(this._options.cross === true)
        {
            var center = { x: this._canvas.pixelWidth / 2, y: this._canvas.pixelHeight / 2 };

            ctx.lineWidth = 4;
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(center.x - 11, center.y);
            ctx.lineTo(center.x + 11, center.y);
            ctx.moveTo(center.x, center.y - 11);
            ctx.lineTo(center.x, center.y + 11);
            ctx.stroke();

            ctx.lineWidth = 2;
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.moveTo(center.x - 10, center.y);
            ctx.lineTo(center.x + 10, center.y);
            ctx.moveTo(center.x, center.y - 10);
            ctx.lineTo(center.x, center.y + 10);
            ctx.stroke();
        }
    },

    destroy: function()
    {
        this._canvas = null;
    }
};


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
