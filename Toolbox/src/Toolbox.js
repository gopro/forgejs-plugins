var ForgePlugins = ForgePlugins || {};


ForgePlugins.Toolbox = function()
{
    this._gui = null;

    this._camera = null;

    this._view = null;

    this._story = null;

    this._scene = null;

    this._controllers = null;

    this._canvas = null;

    this._options = null;
};

ForgePlugins.Toolbox.DEFAULT_OPTIONS =
{
    pannels:
    {
        camera: { open: false, options: { cross: false } },
        view: { open: false },
        story: { open: false },
        scene : { open: false },
        controllers: { open: true }
    }
};

ForgePlugins.Toolbox.prototype =
{
    /**
     * Boot function
     */
    boot: function()
    {
        this._options = FORGE.Utils.extendSimpleObject(ForgePlugins.Toolbox.DEFAULT_OPTIONS, this.plugin.options, true);
        console.log(this._options)

        this._canvas = this.plugin.create.canvas();
        this._canvas.maximize(true);
        this.plugin.container.addChild(this._canvas);

        this._gui = new dat.GUI();

        this._gui.add(FORGE, "VERSION").domElement.firstChild.disabled = true;

        if(typeof this._options.pannels.camera === "object")
        {
            this._addCamera();
        }

        if(typeof this._options.pannels.view === "object")
        {
            this._addView();
        }

        if(typeof this._options.pannels.story === "object")
        {
            this._addStory();
        }

        if(typeof this._options.pannels.scene === "object")
        {
            this._addScene();
        }

        if(typeof this._options.pannels.controllers === "object")
        {
            this._addControllers();
        }

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

        this._camera.add(this._options.pannels.camera.options, "cross").name("cross");

        if(this._options.pannels.camera.open === true)
        {
            this._camera.open();
        }
    },

    _addView: function()
    {
        this._view = this._gui.addFolder("View");
        this._view.add(this.viewer.renderer.view, "type", ["rectilinear", "gopro", "flat"]).listen();

        if(this._options.pannels.view.open === true)
        {
            this._view.open();
        }
    },

    _addStory: function()
    {
        this._story = this._gui.addFolder("Story");
        this._story.add(this.viewer.story, "sceneUid", this.viewer.story.sceneUids).name("scene").listen();

        if(this.viewer.story.hasGroups() === true)
        {
            this._story.add(this.viewer.story, "groupUid", this.viewer.story.groupUids).name("group").listen();
        }

        if(this._options.pannels.story.open === true)
        {
            this._story.open();
        }
    },

    _addScene: function()
    {
        this._scene = this._gui.addFolder("Scene");
        this._scene.add(this.viewer.story.scene, "uid");
        this._scene.add(this.viewer.story.scene, "name");
        this._scene.add(this.viewer.story.scene, "slug");
        this._scene.add(this.viewer.story.scene, "viewCount");

        if(this._options.pannels.scene.open === true)
        {
            this._scene.open();
        }
    },

    _addControllers: function()
    {
        this._controllers = this._gui.addFolder("Controllers");

        var onDragChange = function(value)
        {
            var display = value === true ? "none" : "block";

            var ul = this._controllers.domElement.firstChild;
            var li;

            for(var i = 2, ii = ul.children.length; i < ii; i++)
            {
                li = ul.children[i];
                li.style.display = display;
            }
        }.bind(this);

        if(viewer.controllers.getByType("pointer") !== null)
        {
            var drag = this._controllers.add(viewer.controllers.getByType("pointer").orientation, "drag").onChange(onDragChange);
            this._controllers.add(viewer.controllers.getByType("pointer").orientation, "hardness");
            this._controllers.add(viewer.controllers.getByType("pointer").orientation, "damping");
            this._controllers.add(viewer.controllers.getByType("pointer").orientation, "velocityMax");
            this._controllers.add(viewer.controllers.getByType("pointer").orientation.invert, "x").name("invert X");
            this._controllers.add(viewer.controllers.getByType("pointer").orientation.invert, "y").name("invert Y");
        }

        if(this._options.pannels.controllers.open === true)
        {
            this._controllers.open();
        }

        onDragChange(drag.getValue());
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

    _clearCanvas: function()
    {
        var ctx = this._canvas.context2D;
        ctx.clearRect(0, 0, this._canvas.pixelWidth, this._canvas.pixelHeight);
    },

    _drawCross: function()
    {
        var ctx = this._canvas.context2D;
        var center = { x: this._canvas.pixelWidth / 2, y: this._canvas.pixelHeight / 2 };

        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.beginPath();
        ctx.moveTo(center.x - 10, center.y);
        ctx.lineTo(center.x + 10, center.y);
        ctx.moveTo(center.x, center.y - 10);
        ctx.lineTo(center.x, center.y + 10);
        ctx.stroke();
    },

    update: function()
    {
        this._clearCanvas();

        var camera = this._options.pannels.camera;

        if(typeof camera === "object" && camera.options.cross === true)
        {
            this._drawCross();
        }
    },

    destroy: function()
    {
        this._btn = null;
    }
};