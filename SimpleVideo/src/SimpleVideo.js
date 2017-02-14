var ForgePlugins = ForgePlugins || {};

/**
 * This plugin is a wrapper around FORGE.Video, allowing someone to create a
 * video from a project json configuration, without having to access the javascript code and
 * instantiate itself a FORGE.Video.
 */
ForgePlugins.SimpleVideo = function()
{
    this._video = null;
};

ForgePlugins.SimpleVideo.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {
        // Create a FORGE.Video instance
        this._video = this.plugin.create.video(this.plugin.uid + "-video", this.plugin.data.video, this.plugin.data.streaming);

        // Set properties to the image
        this._video.width = this.plugin.options.width;
        this._video.height = this.plugin.options.height;
        this._video.top = this.plugin.options.top;
        this._video.left = this.plugin.options.left;
        this._video.right = this.plugin.options.right;
        this._video.bottom = this.plugin.options.bottom;
        this._video.horizontalCenter = this.plugin.options.horizontalCenter;
        this._video.verticalCenter = this.plugin.options.verticalCenter;

        if (this.plugin.options.autoPlay === true)
        {
            this._video.play();
        }
        else
        {
            this._video.pause();
        }

        this._video.loop = this.plugin.options.loop;
        this._video.volume = this.plugin.options.volume;

        // Add the events handlers
        this._video.onPlay.add(this._onPlayHandler, this);
        this._video.onPause.add(this._onPauseHandler, this);
        this._video.onSeeked.add(this._onSeekedHandler, this);
        this._video.onEnded.add(this._onEndedHandler, this);

        // Add the video to the main container
        this.plugin.container.addChild(this._video);

        this.plugin.notifyInstanceReady();
    },

    /**
     * Fires the handler when the video is played.
     */
    _onPlayHandler: function(event)
    {
        this.plugin.events.onPlay.dispatch();
    },

    /**
     * Fires the handler when the video is paused.
     */
    _onPauseHandler: function(event)
    {
        this.plugin.events.onPause.dispatch();
    },

    /**
     * Fires the handler when the video is seeked.
     */
    _onSeekedHandler: function(event)
    {
        this.plugin.events.onSeeked.dispatch();
    },

    /**
     * Fires the handler when the video is ended.
     */
    _onEndedHandler: function(event)
    {
        this.plugin.events.onEnded.dispatch();
    },

    /**
     * Play the video
     */
    play: function()
    {
        if (this._video !== null)
        {
            this._video.play();
        }
    },

    /**
     * Pause the video
     */
    pause: function()
    {
        if (this._video !== null)
        {
            this._video.pause();
        }
    },

    /**
     * Destroy the image
     */
    destroy: function()
    {
        this._video = null;
    }
};

/**
 * Get the video object.
 */
Object.defineProperty(ForgePlugins.SimpleVideo.prototype, "video",
{
    get: function()
    {
        return this._video;
    }
});