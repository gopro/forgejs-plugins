var ForgePlugins = ForgePlugins || {};

/**
 * This plugin displays a simple google maps, that can be loaded with GPX data.
 */
ForgePlugins.Compass = function()
{
    // Canvas of the plugin
    this._canvas = null;

    // Reference of the video, for synchronization
    this._video = null;

    // Loaded data
    this._data = null;

    // Reference to the size of the plugin
    this._size = 0
};

ForgePlugins.Compass.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {
        this._size = this.plugin.options.size;

        // Create the canvas
        this._canvas = this.plugin.create.canvas();
        this._canvas.width = this.plugin.options.size;
        this._canvas.height = this.plugin.options.size;
        this._canvas.top = this.plugin.options.top;
        this._canvas.left = this.plugin.options.left;
        this._canvas.right = this.plugin.options.right;
        this._canvas.bottom = this.plugin.options.bottom;

        this.plugin.container.addChild(this._canvas);

        // Setup the reference to the video
        this._setupVideo();

        // Load the JSON data
        this._loadJsonData();
    },

    /**
     * The reset function, reload the json and synchronize it given the new video
     * of the scene.
     */
    reset: function()
    {
        this._video = null;
        this._setupVideo();
    },

    /**
     * Setup a video file. Can be a scene media or a plugin
     */
    _setupVideo: function()
    {
        if (this.plugin.options.source === "media")
        {
            this._video = this.viewer.story.scene.media.displayObject;
        }
        else if (FORGE.UID.isTypeOf(this.plugin.options.source, "Plugin") === true)
        {
            var plugin = FORGE.UID.get(this.plugin.options.source);

            if (plugin.instanceReady === true)
            {
                this._video = plugin.instance.video;
            }
            else
            {
                if (plugin.onInstanceReady.has(this._setupVideo, this) === false)
                {
                    plugin.onInstanceReady.addOnce(this._setupVideo, this);
                }
            }
        }
    },

    /**
     * Load the data from the json file
     */
    _loadJsonData: function()
    {
        var json = this.plugin.data.json;

        if (typeof json === "string" && json !== "")
        {
            this.viewer.load.json(this.plugin.uid + "_json", json, this._jsonLoadComplete.bind(this), this);
        }
        else
        {
            this.plugin.warn("Plugin accelerometer can't load json data: invalid URL!");
        }
    },

    /**
     * On JSON loaded, read it and parse it
     */
    _jsonLoadComplete: function(file)
    {
        this._data = file.data;
    },

    /**
     * Return the triple numbers which correspond to the closest one given a time.
     */
    _getClosestFromTime: function(time)
    {
        var index = Math.floor(time * this._data.frequency);
        return this._data.data[index];
    },

    /**
     * Update the position of the accelerometer given the current time
     */
    update: function()
    {
        if (this._data === null)
        {
            return;
        }

        var data = this._getClosestFromTime(this._video.currentTime);

        var ctx = this._canvas.context2D;
        ctx.clearRect(0, 0, this._size, this._size);

        // draw outside circle
        var radius = this._size / 2;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(120, 120, 120, 0.6)";
        ctx.lineWidth = 4;
        ctx.arc(this._size / 2, this._size / 2, radius - 2, 1.4, 0.3);
        ctx.stroke();
        ctx.closePath();

        // draw NSEW directions
        ctx.beginPath();
        ctx.font = this.plugin.options.text.style + " " + this.plugin.options.text.size + " " + this.plugin.options.text.font;
        ctx.fillStyle = this.plugin.options.text.color;
        ctx.textAlign = "center";
        ctx.fillText("N", this._size / 2, parseInt(this.plugin.options.text.size) + 5);
        ctx.fillText("S", this._size / 2, this._size - 10);
        ctx.textAlign = "right";
        ctx.fillText("E", this._size - 10, this._size / 2 + parseInt(this.plugin.options.text.size) / 2);
        ctx.textAlign = "left";
        ctx.fillText("W", 10, this._size / 2 + parseInt(this.plugin.options.text.size) / 2);
        ctx.closePath();

        // draw value
        var value = data.toFixed(0);
        ctx.beginPath();
        ctx.font = this.plugin.options.text.style + " " + this.plugin.options.text.size + " " + this.plugin.options.text.font;
        ctx.fillStyle = this.plugin.options.text.color;
        ctx.textAlign = "right";
        ctx.fillText(value + "°", this._size - 2, 7 / 8 * this._size);
        ctx.closePath();

        // arrow
        var c = this._size / 2;
        var v = data * Math.PI / 180 - Math.PI / 2;
        ctx.beginPath();
        ctx.fillStyle = this.plugin.options.arrow.color;
        ctx.lineTo(c * (1 + 0.1 * Math.cos(v + Math.PI)), c * (1 + 0.1 * Math.sin(v + Math.PI)));
        ctx.lineTo(c * (1 + 0.3 * Math.cos(v + 3 * Math.PI / 4)), c * (1 + 0.3 * Math.sin(v + 3 * Math.PI / 4)));
        ctx.lineTo(c * (1 + 0.5 * Math.cos(v)), c * (1 + 0.5 * Math.sin(v)));
        ctx.lineTo(c * (1 + 0.3 * Math.cos(v - 3 * Math.PI / 4)), c * (1 + 0.3 * Math.sin(v - 3 * Math.PI / 4)));
        ctx.lineTo(c * (1 + 0.1 * Math.cos(v + Math.PI)), c * (1 + 0.1 * Math.sin(v + Math.PI)));
        ctx.fill();
        ctx.closePath();
    },

    /**
     * Destroy routine
     */
    destroy: function()
    {
        this._canvas.destroy();
        this._canvas = null;

        this._video = null;

        this._data = null;
    }
};
