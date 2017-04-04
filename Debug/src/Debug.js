var ForgePlugins = ForgePlugins || {};


ForgePlugins.Debug = function()
{
    this._gui = null;

    this._camera = null;

    this._view = null;

    this._story = null;

    this._scene = null;

    this._canvas = null;

    this._options =
    {
        cross: true
    }
};

ForgePlugins.Debug.prototype =
{
    /**
     * Boot function
     */
    boot: function()
    {
        this._canvas = this.plugin.create.canvas();
        this._canvas.maximize(true);
        this.plugin.container.addChild(this._canvas);

        this._gui = new dat.GUI();

        this._gui.add(FORGE, "VERSION");

        this._addCamera();
        this._addView();
        this._addStory();
        this._addScene();

        this.viewer.story.onSceneLoadComplete.add(this._onSceneLoadCompleteHandler, this);
    },

    _addCamera: function()
    {
        this._camera = this._gui.addFolder("Camera");

        var camera = viewer.camera;
        this._camera.add(this.viewer.camera, "yaw").listen();
        this._camera.add(this.viewer.camera, "pitch").listen();
        this._camera.add(this.viewer.camera, "roll").listen();
        this._camera.add(this.viewer.camera, "fov").listen();
        this._camera.add(this.viewer.camera, "parallax", 0, 1).listen();

        this._camera.add(this._options, "cross").name("cross");
    },

    _addView: function()
    {
        this._view = this._gui.addFolder("View");
        this._view.add(this.viewer.renderer.view, "type", ["rectilinear", "gopro", "flat"]).listen();
    },

    _addStory: function()
    {
        this._story = this._gui.addFolder("Story");
        this._story.add(this.viewer.story, "sceneUid", this.viewer.story.sceneUids).name("scene").listen();

        if(this.viewer.story.hasGroups() === true)
        {
            this._story.add(this.viewer.story, "groupUid", this.viewer.story.groupUids).name("group").listen();
        }

    },

    _addScene: function()
    {
        this._scene = this._gui.addFolder("Scene");
        this._scene.add(this.viewer.story.scene, "uid");
        this._scene.add(this.viewer.story.scene, "name");
        this._scene.add(this.viewer.story.scene, "slug");
        this._scene.add(this.viewer.story.scene, "viewCount");
    },

    _onSceneLoadCompleteHandler: function()
    {
        var controller;

        for(var i = 0, ii = this._scene.__controllers.length; i < ii; i++)
        {
            controller = this._scene.__controllers[i];
            controller.object = this.viewer.story.scene;
        }

        this._scene.updateDisplay();
    },

    update: function()
    {
        var ctx = this._canvas.context2D;
        ctx.clearRect(0, 0, this._canvas.pixelWidth, this._canvas.pixelHeight);

        if(this._options.cross === true)
        {
            var center = { x: this._canvas.pixelWidth / 2, y: this._canvas.pixelHeight / 2 };

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
        this._btn = null;
    }
};