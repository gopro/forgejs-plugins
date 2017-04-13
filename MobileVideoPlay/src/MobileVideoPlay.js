var ForgePlugins = ForgePlugins || {};

ForgePlugins.MobileVideoPlay = function()
{
    this._icon = null;
    this._video = null;
};

ForgePlugins.MobileVideoPlay.prototype =
{
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

    reset: function()
    {
        this._setVideo();
    },

    show: function()
    {
        this._icon.show();
    },

    hide: function()
    {
        this._icon.hide();
    },

    destroy: function()
    {
        this._icon.pointer.onClick.remove(this._iconClickHandler, this);
        this._icon = null;

        this._video.onPlay.remove(this._videoPlayHandler, this);
        this._video = null;
    },

    _setVideo: function()
    {
        if(this.viewer.story.scene.media.type === FORGE.MediaType.VIDEO)
        {
            this._video = this.viewer.story.scene.media.displayObject;
            this._video.onPlay.addOnce(this._videoPlayHandler, this);

            if(this._video.playing === false)
            {
                this.show();
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