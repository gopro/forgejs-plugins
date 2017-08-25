var ForgePlugins = ForgePlugins || {};

/**
 * This plugin displays a simple altimeter, that can be loaded with altitude data.
 */
ForgePlugins.Altimeter = function()
{
    // Text field containing the value
    this._valueField = null;

    // Altitude legend
    this._altitudeField = null;

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
        // Create the textfield
        this._valueField = this.plugin.create.textField();
        this._valueField.width = this.plugin.options.width;
        this._valueField.height = this.plugin.options.height / 2;
        this._valueField.top = this.plugin.options.top;
        this._valueField.left = this.plugin.options.left;
        this._valueField.right = this.plugin.options.right;
        this._valueField.bottom = this.plugin.options.bottom;
        this._valueField.textAlign = "right";

        this._valueField.color = this.plugin.options.text.color;
        this._valueField.font = this.plugin.options.text.font;
        this._valueField.fontFamily = this.plugin.options.text.fontFamily;
        this._valueField.fontSize = this.plugin.options.text.fontSize;
        this._valueField.fontStyle = this.plugin.options.text.fontStyle;
        this._valueField.fontVariant = this.plugin.options.text.fontVariant;
        this._valueField.fontWeight = this.plugin.options.text.fontWeight;

        this._valueField.value = "0";

        this.plugin.container.addChild(this._valueField);

        // Create the altitude legend
        this._altitudeField = this.plugin.create.textField();
        this._altitudeField.width = this.plugin.options.width;
        this._altitudeField.height = this.plugin.options.height / 2;
        this._altitudeField.top = this.plugin.options.top + this._valueField.dom.children[0].getBoundingClientRect().height;
        this._altitudeField.left = this.plugin.options.left;
        this._altitudeField.right = this.plugin.options.right;
        this._altitudeField.bottom = this.plugin.options.bottom;
        this._altitudeField.textAlign = "right";

        this._altitudeField.color = this.plugin.options.label.color;
        this._altitudeField.font = this.plugin.options.label.font;
        this._altitudeField.fontFamily = this.plugin.options.label.fontFamily;
        this._altitudeField.fontSize = this.plugin.options.label.fontSize;
        this._altitudeField.fontStyle = this.plugin.options.label.fontStyle;
        this._altitudeField.fontVariant = this.plugin.options.label.fontVariant;
        this._altitudeField.fontWeight = 100;

        this._altitudeField.value = this.plugin.options.label.value || "altitude";

        this.plugin.container.addChild(this._altitudeField);

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
        if (this._data === null)
        {
            return;
        }

        var value = this._getClosestFromTime(this._video.currentTime);

        this._valueField.value = value.toFixed() + " " + this._data.unit;
    },

    /**
     * Destroy routine
     */
    destroy: function()
    {
        this._valueField.destroy();
        this._valueField = null;

        this._altitudeField.destroy();
        this._altitudeField = null;

        this._video = null;
        this._data = null;
    }
};
