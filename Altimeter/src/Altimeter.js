var ForgePlugins = ForgePlugins || {};

/**
 * This plugin displays a simple altimeter, that can be loaded with altitude data.
 */
ForgePlugins.Altimeter = function()
{
    // Canvas
    this._canvas = null;

    // Reference of the video, for synchronization
    this._video = null;

    // Loaded data
    this._data = null;
};

ForgePlugins.Altimeter.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {
        // Create the canvas container
        this._canvas = this.plugin.create.canvas();
        this._canvas.width = this.plugin.options.width;
        this._canvas.height = this.plugin.options.height;
        this._canvas.top = this.plugin.options.top;
        this._canvas.left = this.plugin.options.left;
        this._canvas.right = this.plugin.options.right;
        this._canvas.bottom = this.plugin.options.bottom;

        if (this.plugin.options.dom === true)
        {
            this.plugin.container.addChild(this._canvas);
        }

        // Setup the reference to the video
        this._setupVideo();

        // Load the JSON data
        this._loadJsonData();

        if (this.plugin.options.dom === false)
        {
            this.plugin.notifyInstanceReady();
        }
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
            this.plugin.warn("Plugin altimeter can't load json data: invalid URL!");
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
     * Update the position of the altimeter given the current time
     */
    update: function()
    {
        if (this._data === null || this._canvas === null)
        {
            return;
        }

        var value = this._getClosestFromTime(this._video.currentTime);

        var ctx = this._canvas.context2D;

        if (typeof value !== "undefined")
        {
            try
            {
                ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

                ctx.beginPath();

                var text = value.toFixed() + " " + this._data.unit;
                var label = this.plugin.options.label.value || "altitude";

                // draw text values
                ctx.font = (this.plugin.options.text.font !== null) ? this.plugin.options.text.font : this.plugin.options.text.fontStyle + " " + this.plugin.options.text.fontVariant + " " + this.plugin.options.text.fontWeight + " " + this.plugin.options.text.fontSize + " " + this.plugin.options.text.fontFamily;
                ctx.fillStyle = this.plugin.options.text.color;
                ctx.textBaseline = "top";

                var xpos = 0;
                if (this.plugin.options.align === "center")
                {
                    ctx.textAlign = "center";
                    xpos = this._canvas.width / 2;
                }
                else if (this.plugin.options.align === "right")
                {
                    ctx.textAlign = "right";
                    xpos = this._canvas.width;
                }
                else
                {
                    ctx.textAlign = "left";
                }
                var lineHeight = ctx.measureText('M').width + 2;

                ctx.fillText(text, xpos, 0);

                ctx.font = (this.plugin.options.label.font !== null) ? this.plugin.options.label.font : this.plugin.options.label.fontStyle + " " + this.plugin.options.label.fontVariant + " " + this.plugin.options.label.fontWeight + " " + this.plugin.options.label.fontSize + " " + this.plugin.options.label.fontFamily;
                ctx.fillStyle = this.plugin.options.label.color;
                ctx.fillText(label, xpos, lineHeight);

                ctx.closePath();
            }
            catch (e)
            {
                // waiting next frame to get the canvas not yet created
            }
        }
    },

    /**
     * Show
     */
    show: function()
    {
        this._canvas.show();
    },

    /**
     * Hide
     */
    hide: function()
    {
        this._canvas.hide();
    },

    /**
     * Destroy routine
     */
    destroy: function()
    {
        this._video = null;
        this._data = null;

        this._canvas.destroy();
        this._canvas = null;
    }
};

/**
 * Return the canvas, to use it as texture.
 */
Object.defineProperty(ForgePlugins.Altimeter.prototype, "texture",
{
    get: function()
    {
        return this._canvas;
    }
});