
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

