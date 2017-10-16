var ForgePlugins = ForgePlugins || {};

/**
 * This plugin displays a simple speedometer, that can be loaded with altitude data.
 */
ForgePlugins.Speedometer = function()
{
    // Canvas
    this._canvas = null;

    // Reference of the video, for synchronization
    this._video = null;

    // Loaded data
    this._data = null;

    // Size of the square
    this._size = 0;

    // Defined lines on json loading
    this._lines = null;

    // Multiplicator for the value on the arc
    this._multiplicator = 0;
};

ForgePlugins.Speedometer.prototype = {

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
            this.plugin.warn("Plugin speedometer can't load json data: invalid URL!");
        }
    },

    /**
     * On JSON loaded, read it and parse it
     */
    _jsonLoadComplete: function(file)
    {
        this._data = file.data;
        this._lines = [];

        var max = 0;
        this._data.data.forEach(function(e)
        {
            if (max < e)
            {
                max = e;
            }
        });

        // find the closest multiplicator
        var multiple = [1, 2, 5, 10, 20, 30, 50];
        var res;
        multiple.some(function(e)
        {
            var a = 8 * e,
                b = 9 * e,
                c = 10 * e;

            if (a > max)
            {
                res = [e, 8];
                return true;
            }
            else if (b > max)
            {
                res = [e, 9];
                return true;
            }
            else if (c > max)
            {
                res = [e, 10];
                return true;
            }
        });

        for (var i = 0; i <= res[1]; i++)
        {
            this._lines[i] = i * res[0];
        }

        this._multiplicator = (0.21 - 0.01 * (this._lines.length - 1)) / (res[0] / 5);
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
     * Update the position of the speedometer given the current time
     */
    update: function()
    {
        if (this._data === null || this._canvas === null)
        {
            return;
        }

        var value = this._getClosestFromTime(this._video.currentTime);
        var angle = Math.PI / 2 + value * this._multiplicator;
        var radius = this._size / 2 - 10;
        var center = this._size / 2;

        var ctx = this._canvas.context2D;

        try
        {
            ctx.clearRect(0, 0, this.plugin.options.width, this.plugin.options.height);

            // Background
            if(typeof this.plugin.options.background === "string")
            {
                ctx.fillStyle = this.plugin.options.background;
                ctx.fillRect(0, 0, this.plugin.options.width, this.plugin.options.height);
            }

            var start, end, text, x, y;
            var offset = 0.21 - 0.01 * (this._lines.length - 1);

            var circleAngle = Math.PI / 2 + (5 * (this._lines.length - 1) + 0.1) * offset;

            // Complete circle
            ctx.strokeStyle = this.plugin.options.gauge.background;
            ctx.lineWidth = this.plugin.options.gauge.line;
            ctx.beginPath();
            ctx.arc(center, center, radius - this.plugin.options.gauge.line, Math.PI / 2, circleAngle);
            ctx.stroke();
            ctx.closePath();

            // draw moving gauge
            ctx.strokeStyle = this.plugin.options.gauge.color;
            ctx.lineWidth = this.plugin.options.gauge.line;
            ctx.beginPath();
            ctx.arc(center, center, radius - this.plugin.options.gauge.line, Math.PI / 2, angle);
            ctx.stroke();
            ctx.closePath();

            // draw lines
            ctx.font = (this.plugin.options.labels.font !== null) ? this.plugin.options.labels.font : this.plugin.options.labels.fontStyle + " " + this.plugin.options.labels.fontVariant + " " + this.plugin.options.labels.fontWeight + " " + (this._size / 10) + "px " + this.plugin.options.labels.fontFamily;
            ctx.fillStyle = this.plugin.options.labels.color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (var i = 0, ii = 5 * (this._lines.length - 1); i <= ii; i++)
            {
                if (i % 5 === 0)
                {
                    start = Math.PI / 2 + (i - 0.1) * offset;
                    end = Math.PI / 2 + (i + 0.2) * offset;

                    text = this._lines[i / 5];
                    x = center + radius * 0.70 * Math.cos(start);
                    y = center + radius * 0.70 * Math.sin(start);

                    ctx.lineWidth = 4;
                    ctx.strokeStyle = this.plugin.options.labels.outline;
                    ctx.strokeText(text, x, y);
                    ctx.fillText(text, x, y);

                    ctx.lineWidth = this.plugin.options.lines.large;
                }
                else
                {
                    start = Math.PI / 2 + i * offset;
                    end = Math.PI / 2 + (i + 0.1) * offset;
                    ctx.lineWidth = this.plugin.options.lines.small;
                }

                ctx.strokeStyle = this.plugin.options.lines.color;

                ctx.beginPath();
                ctx.arc(center, center, radius - this.plugin.options.gauge.line, start, end);
                ctx.stroke();
                ctx.closePath();
            }

            // draw text value
            value = value.toFixed(0);
            ctx.textBaseline = "alphabetic";

            ctx.font = (this.plugin.options.value.font !== null) ? this.plugin.options.value.font : this.plugin.options.value.fontStyle + " " + this.plugin.options.value.fontVariant + " " + this.plugin.options.value.fontWeight + " " + this.plugin.options.value.fontSize + " " + this.plugin.options.value.fontFamily;
            ctx.fillStyle = this.plugin.options.value.color;
            ctx.lineWidth = 4;
            ctx.strokeStyle = this.plugin.options.value.outline;
            x = this._size / 2;
            y = this._size / 2 + 0.2 * parseInt(this.plugin.options.value.fontSize);
            ctx.strokeText(value, x, y);
            ctx.fillText(value, x, y);

            ctx.font = (this.plugin.options.unit.font !== null) ? this.plugin.options.unit.font : this.plugin.options.unit.fontStyle + " " + this.plugin.options.unit.fontVariant + " " + this.plugin.options.unit.fontWeight + " " + this.plugin.options.unit.fontSize + " " + this.plugin.options.unit.fontFamily;
            ctx.fillStyle = this.plugin.options.unit.color;
            ctx.lineWidth = 4;
            ctx.strokeStyle = this.plugin.options.unit.outline;
            x = this._size / 2;
            y = this._size / 2 + 0.9 * parseInt(this.plugin.options.unit.fontSize) + 4;
            ctx.strokeText(this._data.unit, x, y);
            ctx.fillText(this._data.unit, x, y);
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
        this._lines = null;
        this._video = null;
        this._data = null;
    }
};

/**
 * Return the canvas, to use it as texture.
 */
Object.defineProperty(ForgePlugins.Speedometer.prototype, "texture",
{
    get: function()
    {
        return this._canvas;
    }
});
