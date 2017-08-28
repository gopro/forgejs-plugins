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

    // Reference to the size of the plugin
    this._size = 0;

    // Defined graduation on json loading
    this._graduation = [];

    // Multiplicator for the value on the arc
    this._multiplicator = 0;
};

ForgePlugins.Speedometer.prototype = {

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
            this.plugin.warn("Plugin speedometer can't load json data: invalid URL!");
        }
    },

    /**
     * On JSON loaded, read it and parse it
     */
    _jsonLoadComplete: function(file)
    {
        this._data = file.data;

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
            this._graduation[i] = i * res[0];
        }

        this._multiplicator = (0.21 - 0.01 * (this._graduation.length - 1)) / 2;
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
        if (this._data === null)
        {
            return;
        }

        var value = this._getClosestFromTime(this._video.currentTime);
        var angle = Math.PI / 2 + value * this._multiplicator;
        var radius = this._size / 2 - 2;

        var ctx = this._canvas.context2D;

        try
        {
            ctx.clearRect(0, 0, this._size, this._size);

            // draw moving gauge
            ctx.strokeStyle = this.plugin.options.gaugeColor;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(radius, radius, radius - 5, Math.PI / 2, angle);
            ctx.stroke();
            ctx.closePath();

            // draw graduation
            ctx.strokeStyle = this.plugin.options.color;
            ctx.font = (this.plugin.options.text.font !== null) ? this.plugin.options.text.font : this.plugin.options.text.fontStyle + " " + this.plugin.options.text.fontVariant + " " + this.plugin.options.text.fontWeight + " 12px " + this.plugin.options.text.fontFamily;
            ctx.fillStyle = this.plugin.options.text.color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            var start, end;
            var offset = 0.21 - 0.01 * (this._graduation.length - 1)
            for (var i = 0, ii = 5 * (this._graduation.length - 1); i <= ii; i++)
            {
                if (i % 5 === 0)
                {
                    start = Math.PI / 2 + (i - 0.1) * offset;
                    end = Math.PI / 2 + (i + 0.2) * offset;
                    ctx.lineWidth = 10;
                    ctx.fillText(this._graduation[i / 5], radius + this._size * 0.35 * Math.cos(start), radius + this._size * 0.35 * Math.sin(start));
                }
                else
                {
                    start = Math.PI / 2 + i * offset;
                    end = Math.PI / 2 + (i + 0.1) * offset;
                    ctx.lineWidth = 6;
                }

                ctx.beginPath();
                ctx.arc(radius, radius, radius - 5, start, end);
                ctx.stroke();
                ctx.closePath();
            }

            // draw end of moving gauge
            ctx.fillStyle = this.plugin.options.gaugeColor;
            ctx.beginPath();
            ctx.arc(this._size * (0.5 + 0.465 * Math.cos(angle)), this._size * (0.5 + 0.465 * Math.sin(angle)), 5, 0, 2 * Math.PI);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            // draw text value
            value = value.toFixed(0);
            ctx.beginPath();
            ctx.font = (this.plugin.options.text.font !== null) ? this.plugin.options.text.font : this.plugin.options.text.fontStyle + " " + this.plugin.options.text.fontVariant + " " + this.plugin.options.text.fontWeight + " " + this.plugin.options.text.fontSize + " " + this.plugin.options.text.fontFamily;
            ctx.fillStyle = this.plugin.options.text.color;
            ctx.textBaseline = "alphabetic";
            ctx.textAlign = "right";
            ctx.fillText(value, this._size / 2 + 24, this._size / 2);
            ctx.textAlign = "center";
            ctx.fillText(this._data.unit, this._size / 2, this._size / 2 + 0.7 * parseInt(this.plugin.options.text.fontSize));
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
        this._video = null;
        this._data = null;
        this._graduation = null;

        this._canvas.destroy();
    }
};
