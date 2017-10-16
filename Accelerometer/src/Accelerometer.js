var ForgePlugins = ForgePlugins || {};

/**
 * This plugin displays a simple google maps, that can be loaded with GPX data.
 */
ForgePlugins.Accelerometer = function()
{
    // Canvas of the plugin
    this._canvas = null;

    // Reference of the video, for synchronization
    this._video = null;

    // Loaded data
    this._data = null;

    // The "history" to draw the trail
    this._trail = [];

    // The size of the square
    this._size = 0;
};

ForgePlugins.Accelerometer.prototype = {

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

        // set the trail
        this._trail = [];
        var idx;

        for (var i = 0, ii = this.plugin.options.trail.length; i < ii; i++)
        {
            idx = index - i;

            if (idx > -1 && typeof this._data.data[idx] !== "undefined")
            {
                this._trail.unshift(this._data.data[idx]);
            }
        }

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
            var radius = this._size / 2 - 10;
            var w = this.plugin.options.width;
            var h = this.plugin.options.height;

            ctx.clearRect(0, 0, w, h);

            // draw outside arc
            ctx.beginPath();
            ctx.strokeStyle = this.plugin.options.arc.color;
            ctx.lineWidth = this.plugin.options.arc.width;
            ctx.arc(this._size / 2, this._size / 2, radius - 2, 1.4, 0.3);
            ctx.stroke();
            ctx.closePath();

            // draw trail
            var l = this._trail.length;
            var r = this.plugin.options.trail.size / 2;
            var tx, ty, ratio;

            for (var i = 0, ii = l; i < ii; i++)
            {
                tx = this._trail[i][1] * (w / 2);
                ty = this._trail[i][0] * (h / 2);

                ratio = Math.sqrt(tx * tx + ty * ty) / (this._size / 2);
                if (ratio > 1)
                {
                    tx /= ratio;
                    ty /= ratio;
                }

                tx += this._size / 2 + 3;
                ty += this._size / 2 + 3;

                ctx.beginPath();
                ctx.globalAlpha = i / l;
                ctx.fillStyle = this.plugin.options.trail.color;
                ctx.arc(tx, ty, r * (i / l), 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            }

            ctx.globalAlpha = 1;

            // current data
            var x = data[1] * this._size / 2;
            var y = data[0] * this._size / 2;

            ratio = Math.sqrt(x * x + y * y) / this._size;
            if (ratio > 1)
            {
                x /= ratio;
                y /= ratio;
            }

            x += this._size / 2 + 3;
            y += this._size / 2 + 3;

            ctx.beginPath();
            ctx.fillStyle = this.plugin.options.point.color;
            ctx.arc(x, y, this.plugin.options.point.size / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            // draw value
            var value = data[2].toFixed(1);
            ctx.font = (this.plugin.options.value.font !== null) ? this.plugin.options.value.font : this.plugin.options.value.fontStyle + " " + this.plugin.options.value.fontVariant + " " + this.plugin.options.value.fontWeight + " " + this.plugin.options.value.fontSize + " " + this.plugin.options.value.fontFamily;
            ctx.fillStyle = this.plugin.options.value.color;
            ctx.strokeStyle = this.plugin.options.value.outline;
            ctx.textAlign = "right";
            ctx.lineWidth = 4;
            ctx.strokeText(value + " G", this._size - 2, 7 / 8 * this._size);
            ctx.fillText(value + " G", this._size - 2, 7 / 8 * this._size);
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
        this._trail = null;
        this._video = null;
        this._data = null;
    }
};

/**
 * Return the canvas, to use it as texture.
 */
Object.defineProperty(ForgePlugins.Accelerometer.prototype, "texture",
{
    get: function()
    {
        return this._canvas;
    }
});

