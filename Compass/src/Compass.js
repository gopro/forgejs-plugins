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
            this.plugin.warn("Plugin compass can't load json data: invalid URL!");
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

        try
        {
            ctx.clearRect(0, 0, this._size, this._size);

            // draw outside circle
            var radius = this._size / 2;
            ctx.beginPath();
            ctx.strokeStyle = this.plugin.options.arc.color;
            ctx.lineWidth = this.plugin.options.arc.width;
            ctx.arc(this._size / 2, this._size / 2, radius - 2, 1.4, 0.3);
            ctx.stroke();
            ctx.closePath();

            // draw NSEW directions
            ctx.beginPath();
            ctx.font = (this.plugin.options.label.font !== null) ? this.plugin.options.label.font : this.plugin.options.label.fontStyle + " " + this.plugin.options.label.fontVariant + " " + this.plugin.options.label.fontWeight + " " + this.plugin.options.label.fontSize + " " + this.plugin.options.label.fontFamily;
            ctx.fillStyle = this.plugin.options.label.color;
            ctx.textAlign = "center";
            ctx.fillText(this.plugin.options.label.values.north, this._size / 2, parseInt(this.plugin.options.label.fontSize) + 5);
            ctx.fillText(this.plugin.options.label.values.south, this._size / 2, this._size - 10);
            ctx.textAlign = "right";
            ctx.fillText(this.plugin.options.label.values.east, this._size - 10, this._size / 2 + parseInt(this.plugin.options.label.fontSize) / 2);
            ctx.textAlign = "left";
            ctx.fillText(this.plugin.options.label.values.west, 10, this._size / 2 + parseInt(this.plugin.options.label.fontSize) / 2);
            ctx.closePath();

            // draw value
            var value = data.toFixed(0);
            ctx.beginPath();
            ctx.font = (this.plugin.options.text.font !== null) ? this.plugin.options.text.font : this.plugin.options.text.fontStyle + " " + this.plugin.options.text.fontVariant + " " + this.plugin.options.text.fontWeight + " " + this.plugin.options.text.fontSize + " " + this.plugin.options.text.fontFamily;
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
        }
        catch (e)
        {
            // waiting next frame to get the canvas not yet created
        }
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
