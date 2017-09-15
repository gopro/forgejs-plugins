
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
