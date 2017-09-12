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

    // The half size of the plugin
    this._size = 0;

    // padding for items
    this._padding = 5;

    // init value for the text width
    this._initTextWidth = null;
};

ForgePlugins.Accelerometer.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {
        this._size = this.plugin.options.size / 2;
        // Create the canvas
        this._canvas = this.plugin.create.canvas();
        this._canvas.width = this._size * 3;
        this._canvas.height = this._size * 2;
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
        if (this._data === null)
        {
            return;
        }

        var data = this._getClosestFromTime(this._video.currentTime);

        var ctx = this._canvas.context2D;

        try
        {
            ctx.clearRect(0, 0, this._size * 3, this._size * 2);

            // draw outside circle
            var radius = this._size;
            ctx.beginPath();
            ctx.strokeStyle = this.plugin.options.dial.color;
            ctx.lineWidth = this.plugin.options.dial.width;
            ctx.arc(this._size, this._size, radius - 3, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();

            // draw trail
            var l = this._trail.length,
                r = this.plugin.options.trail.size / 2,
                tx, ty, ratio;

            for (var i = 0, ii = l; i < ii; i++)
            {
                tx = this._trail[i][1] * this._size;
                ty = this._trail[i][0] * this._size;

                ratio = Math.sqrt(tx * tx + ty * ty) / this._size;
                if (ratio > 1)
                {
                    tx /= ratio;
                    ty /= ratio;
                }

                tx += this._size + 3;
                ty += this._size + 3;

                ctx.beginPath();
                ctx.globalAlpha = i / l;
                ctx.fillStyle = this.plugin.options.trail.color;
                ctx.arc(tx, ty, r * (i / l), 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();
            }

            ctx.globalAlpha = 1;

            // current data
            var x = data[1] * this._size;
            var y = data[0] * this._size;

            ratio = Math.sqrt(x * x + y * y) / this._size;
            if (ratio > 1)
            {
                x /= ratio;
                y /= ratio;
            }

            x += this._size + 3;
            y += this._size + 3;

            ctx.beginPath();
            ctx.fillStyle = this.plugin.options.point.color;
            ctx.arc(x, y, this.plugin.options.point.size / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            // draw G value
            var value = data[2].toFixed(1);
            ctx.beginPath();
            ctx.font = (this.plugin.options.text.font !== null) ? this.plugin.options.text.font : this.plugin.options.text.fontStyle + " " + this.plugin.options.text.fontVariant + " " + this.plugin.options.text.fontWeight + " " + this.plugin.options.text.fontSize + " " + this.plugin.options.text.fontFamily;
            ctx.fillStyle = this.plugin.options.text.color;
            if (this._initTextWidth === null)
            {
                this._initTextWidth = ctx.measureText(value).width;
            }
            ctx.textAlign = "right";
            ctx.fillText(value, this._size * 2 + this._initTextWidth, this._size * 2 - this._padding);

            // draw G label
            ctx.textAlign = "left";
            ctx.font = (this.plugin.options.label.font !== null) ? this.plugin.options.label.font : this.plugin.options.label.fontStyle + " " + this.plugin.options.label.fontVariant + " " + this.plugin.options.label.fontWeight + " " + this.plugin.options.label.fontSize + " " + this.plugin.options.label.fontFamily;
            ctx.fillStyle = this.plugin.options.label.color;
            ctx.fillText("G", this._size * 2 + this._initTextWidth + this._padding, this._size * 2 - this._padding);

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

        this._trail = null;
    }
};
