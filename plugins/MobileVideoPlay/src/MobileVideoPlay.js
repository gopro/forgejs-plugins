var ForgePlugins = ForgePlugins || {};

/**
 * This plugin is a wrapper around FORGE.TextField, allowing someone to create a
 * text field from a tour.json, without having to access the javascript code and
 * instantiate itself a FORGE.TextField.
 */
ForgePlugins.MobileVideoPlay = function()
{
    this._icon = null;
    this._video = null;
};

ForgePlugins.MobileVideoPlay.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {
        this._icon = this.plugin.create.image(this.plugin.options.icon);
        this._icon.height = "40%";
        this._icon.horizontalCenter = true;
        this._icon.verticalCenter = true;
        this._icon.pointer.enabled = true;
        this._icon.pointer.onClick.add(this._iconClickHandler, this);
        this._icon.hide();
        this.plugin.container.addChild(this._icon);

        this._setVideo();
    },

    /**
     * Reset
     */
    reset: function()
    {
        this.viewer.renderer.onMediaReady.remove(this._setVideo, this);

        this._setVideo();
    },

    /**
     * Show the button
     */
    show: function()
    {
        this._icon.show();
    },

    /**
     * Hide the button
     */
    hide: function()
    {
        this._icon.hide();
    },

    /**
     * Destroy the plugin
     */
    destroy: function()
    {
        this.viewer.renderer.onMediaReady.remove(this._setVideo, this);

        this._icon.pointer.onClick.remove(this._iconClickHandler, this);
        this._icon = null;

        this._video.onPlay.remove(this._videoPlayHandler, this);
        this._video = null;
    },

    /**
     * Get the video media
     */
    _setVideo: function()
    {
        if(this.viewer.story.scene.config.media.type === "video")
        {
            if (this.viewer.renderer.media !== null)
            {
                this._video = this.viewer.renderer.media.displayObject;
                this._video.onPlay.addOnce(this._videoPlayHandler, this);

                if(this._video.playing === false)
                {
                    this.show();
                }
            }
            else
            {
                if (this.viewer.renderer.onMediaReady.has(this._setVideo, this) === false)
                {
                    this.viewer.renderer.onMediaReady.addOnce(this._setVideo, this);
                }
            }
        }
        else
        {
            this._video = null;
            this.hide();
        }
    },

    _iconClickHandler: function()
    {
        this._video.play();
    },

    _videoPlayHandler: function()
    {
        this.hide();
    }
};