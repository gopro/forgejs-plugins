var ForgePlugins = ForgePlugins || {};


ForgePlugins.Toolbox = function()
{
    this._gui = null;

    this._camera = null;

    this._view = null;

    this._story = null;

    this._scene = null;

    this._controllerPointerOrientation = null;

    this._controllerPointerZoom = null;

    this._canvas = null;

    this._options = null;
};

ForgePlugins.Toolbox.prototype =
{
    /**
     * Boot function
     */
    boot: function()
    {
        this._options = this.plugin.options;

        this._canvas = this.plugin.create.canvas();
        this._canvas.maximize(true);
        this.plugin.container.addChild(this._canvas);

        this._gui = new dat.GUI();

        this._gui.add(FORGE, "VERSION").domElement.firstChild.disabled = true;

        if(typeof this._options.panels.camera === "object")
        {
            this._addCamera();
        }

        if(typeof this._options.panels.view === "object")
        {
            this._addView();
        }

        if(typeof this._options.panels.story === "object")
        {
            this._addStory();
        }

        if(typeof this._options.panels.scene === "object")
        {
            this._addScene();
        }

        if(typeof this._options.panels.controllerPointerOrientation === "object")
        {
            this._addControllerPointerOrientation();
        }

        if(typeof this._options.panels.controllerPointerZoom === "object")
        {
            this._addControllerPointerZoom();
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

        this._camera.add(this._options.panels.camera.options, "cross").name("cross");

        if(this._options.panels.camera.open === true)
        {
            this._camera.open();
        }
    },

    _addView: function()
    {
        var onViewChange = function()
        {
            // Clear options controllers
            var controllers = this._view.__controllers;
            var c;

            var i = controllers.length;
            while (i--)
            {
                c = controllers[i];

                if(c.property !== "type")
                {
                    this._view.remove(c);
                }
            }

            //add controllers for options
            var view = this.viewer.view.current;

            for(var j in view.options)
            {
                this._view.add(this.viewer.view.current.options, j).listen();
            }


        }.bind(this);

        this._view = this._gui.addFolder("View");
        this._view.add(this.viewer.renderer.view, "type", ["rectilinear", "gopro", "flat"]).listen().onChange(onViewChange);


        if(this._options.panels.view.open === true)
        {
            this._view.open();
        }

        onViewChange();
    },

    _addStory: function()
    {
        this._story = this._gui.addFolder("Story");
        this._story.add(this.viewer.story, "sceneUid", this.viewer.story.sceneUids).name("scene").listen();

        if(this.viewer.story.hasGroups() === true)
        {
            this._story.add(this.viewer.story, "groupUid", this.viewer.story.groupUids).name("group").listen();
        }

        if(this._options.panels.story.open === true)
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

        if(this._options.panels.scene.open === true)
        {
            this._scene.open();
        }
    },

    _addControllerPointerOrientation: function()
    {
        this._controllerPointerOrientation = this._gui.addFolder("Controller Pointer Orientation");

        var onDragChange = function(value)
        {
            var display = value === true ? "none" : "block";

            var ul = this._controllerPointerOrientation.domElement.firstChild;
            var li;

            for(var i = 2, ii = ul.children.length; i < ii; i++)
            {
                li = ul.children[i];
                li.style.display = display;
            }
        }.bind(this);

        if(viewer.controllers.getByType("pointer") !== null)
        {
            var drag = this._controllerPointerOrientation.add(viewer.controllers.getByType("pointer").orientation, "drag").onChange(onDragChange);
            this._controllerPointerOrientation.add(viewer.controllers.getByType("pointer").orientation, "hardness");
            this._controllerPointerOrientation.add(viewer.controllers.getByType("pointer").orientation, "damping");
            this._controllerPointerOrientation.add(viewer.controllers.getByType("pointer").orientation, "velocityMax");
            this._controllerPointerOrientation.add(viewer.controllers.getByType("pointer").orientation.invert, "x").name("invert X");
            this._controllerPointerOrientation.add(viewer.controllers.getByType("pointer").orientation.invert, "y").name("invert Y");
        }

        if(this._options.panels.controllerPointerOrientation.open === true)
        {
            this._controllerPointerOrientation.open();
        }

        onDragChange(drag.getValue());
    },

    _addControllerPointerZoom: function()
    {
        this._controllerPointerZoom = this._gui.addFolder("Controller Pointer Zoom");

        if(viewer.controllers.getByType("pointer") !== null)
        {
            this._controllerPointerZoom.add(viewer.controllers.getByType("pointer").zoom, "toPointer");
            this._controllerPointerZoom.add(viewer.controllers.getByType("pointer").zoom, "hardness");
            this._controllerPointerZoom.add(viewer.controllers.getByType("pointer").zoom, "invert");
        }

        if(this._options.panels.controllerPointerZoom.open === true)
        {
            this._controllerPointerZoom.open();
        }
    },

    _onSceneLoadCompleteHandler: function()
    {
        var controller;

        if(this._scene !== null)
        {
            for(var i = 0, ii = this._scene.__controllers.length; i < ii; i++)
            {
                controller = this._scene.__controllers[i];
                controller.object = this.viewer.story.scene;
            }

            this._scene.updateDisplay();
        }

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

        var camera = this._options.panels.camera;

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