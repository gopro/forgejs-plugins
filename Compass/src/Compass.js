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

    // Size of the canvas square
    this._size = 0
};

ForgePlugins.Compass.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {
        this._size = Math.min(this.plugin.options.width, this.plugin.options.height);

        // Create the canvas
        this._canvas = this.plugin.create.canvas();
        this._canvas.width = this.plugin.options.width;
        this._canvas.height = this.plugin.options.height;
        this._canvas.top = this.plugin.options.top;
        this._canvas.left = this.plugin.options.left;
        this._canvas.right = this.plugin.options.right;
        this._canvas.bottom = this.plugin.options.bottom;

        this.plugin.container.addChild(this._canvas);

        if (this.plugin.options.visible === false)
        {
            this.hide();
        }

        // Setup the reference to the video
        this._setupVideo();

        // Load the JSON data
        this._loadJsonData();

        this.plugin.notifyInstanceReady();
    },

    /**
     * The reset function, reload the json and synchronize it given the new video
     * of the scene.
     */
    reset: function()
    {
        this._size = Math.min(this.plugin.options.width, this.plugin.options.height);

        this._canvas.width = this.plugin.options.width;
        this._canvas.height = this.plugin.options.height;
        this._canvas.top = this.plugin.options.top;
        this._canvas.left = this.plugin.options.left;
        this._canvas.right = this.plugin.options.right;
        this._canvas.bottom = this.plugin.options.bottom;

        if (this.plugin.options.visible === false)
        {
            this.hide();
        }
        else
        {
            this.show();
        }

        this._video = null;
        this._setupVideo();

        var suffix = this.plugin.data.json.split("/");
        suffix = suffix[suffix.length - 1];
        if (this.viewer.cache.has("json", this.plugin.uid + "_json") === false || this.plugin.data.json !== this.viewer.cache.get("json", this.plugin.uid + suffix + "_json").url)
        {
            this._loadJsonData();
        }
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
            var suffix = json.split("/");
            suffix = suffix[suffix.length - 1];
            this.viewer.load.json(this.plugin.uid + suffix +  "_json", json, this._jsonLoadComplete.bind(this), this);
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
        if (this._data === null || this._canvas === null)
        {
            return;
        }

        var data = this._getClosestFromTime(this._video.currentTime);

        var ctx = this._canvas.context2D;

        try
        {
            var x, y;

            ctx.clearRect(0, 0, this.plugin.options.width, this.plugin.options.height);

            // draw outside circle
            var radius = this._size / 2 - 10;
            ctx.beginPath();
            ctx.strokeStyle = this.plugin.options.arc.color;
            ctx.lineWidth = this.plugin.options.arc.width;
            ctx.arc(this._size / 2, this._size / 2, radius, 1.4, 0.3);
            ctx.stroke();
            ctx.closePath();

            // draw NSEW directions
            ctx.font = (this.plugin.options.labels.font !== null) ? this.plugin.options.labels.font : this.plugin.options.labels.fontStyle + " " + this.plugin.options.labels.fontVariant + " " + this.plugin.options.labels.fontWeight + " " + this.plugin.options.labels.fontSize + " " + this.plugin.options.labels.fontFamily;
            ctx.lineWidth = 4;
            ctx.fillStyle = this.plugin.options.labels.color;
            ctx.strokeStyle = this.plugin.options.labels.outline;

            // north
            ctx.textAlign = "center";
            x = this._size / 2;
            y = parseInt(this.plugin.options.labels.fontSize) + 15;
            ctx.strokeText(this.plugin.options.labels.values.north, x, y);
            ctx.fillText(this.plugin.options.labels.values.north, x, y);

            // south
            ctx.textAlign = "center";
            x = this._size / 2;
            y = this._size - 25;
            ctx.strokeText(this.plugin.options.labels.values.south, x, y);
            ctx.fillText(this.plugin.options.labels.values.south, x, y);

            // east
            ctx.textAlign = "right";
            x = this._size - 25;
            y = this._size / 2 + parseInt(this.plugin.options.labels.fontSize) / 2;
            ctx.strokeText(this.plugin.options.labels.values.east, x, y);
            ctx.fillText(this.plugin.options.labels.values.east, x, y);

            // west
            ctx.textAlign = "left";
            x = 25;
            y = this._size / 2 + parseInt(this.plugin.options.labels.fontSize) / 2;
            ctx.strokeText(this.plugin.options.labels.values.west, x, y);
            ctx.fillText(this.plugin.options.labels.values.west, x, y);

            // draw value
            var value = data.toFixed(0);
            ctx.font = (this.plugin.options.value.font !== null) ? this.plugin.options.value.font : this.plugin.options.value.fontStyle + " " + this.plugin.options.value.fontVariant + " " + this.plugin.options.value.fontWeight + " " + this.plugin.options.value.fontSize + " " + this.plugin.options.value.fontFamily;
            ctx.fillStyle = this.plugin.options.value.color;
            ctx.strokeStyle = this.plugin.options.value.outline;
            ctx.textAlign = "right";
            ctx.strokeText(value + "°", this._size - 2, 7 / 8 * this._size);
            ctx.fillText(value + "°", this._size - 2, 7 / 8 * this._size);

            // arrow
            var c = this._size / 2;
            var v = data * Math.PI / 180 - Math.PI / 2;
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = this.plugin.options.arrow.outline;
            ctx.fillStyle = this.plugin.options.arrow.color;
            ctx.lineTo(c * (1 + 0.1 * Math.cos(v + Math.PI)), c * (1 + 0.1 * Math.sin(v + Math.PI)));
            ctx.lineTo(c * (1 + 0.3 * Math.cos(v + 3 * Math.PI / 4)), c * (1 + 0.3 * Math.sin(v + 3 * Math.PI / 4)));
            ctx.lineTo(c * (1 + 0.5 * Math.cos(v)), c * (1 + 0.5 * Math.sin(v)));
            ctx.lineTo(c * (1 + 0.3 * Math.cos(v - 3 * Math.PI / 4)), c * (1 + 0.3 * Math.sin(v - 3 * Math.PI / 4)));
            ctx.lineTo(c * (1 + 0.1 * Math.cos(v + Math.PI)), c * (1 + 0.1 * Math.sin(v + Math.PI)));
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }
        catch (e)
        {
            // waiting next frame to get the canvas not yet created
        }
    },

    /**
     * Show
     */
    show: function()
    {
        if (this._canvas !== null)
        {
            this._canvas.show();
        }
    },

    /**
     * Hide
     */
    hide: function()
    {
        if (this._canvas !== null)
        {
            this._canvas.hide();
        }
    },

    /**
     * Destroy routine
     */
    destroy: function()
    {
        this.plugin.container.removeChild(this._canvas);

        this._canvas.destroy();

        this._canvas = null;
        this._video = null;
        this._data = null;
    }
};

/**
 * Return the canvas, to use it as texture.
 */
Object.defineProperty(ForgePlugins.Compass.prototype, "texture",
{
    get: function()
    {
        return this._canvas;
    }
});
