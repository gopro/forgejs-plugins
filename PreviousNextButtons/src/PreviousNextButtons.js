var ForgePlugins = ForgePlugins || {};

ForgePlugins.PreviousNextButtons = function()
{
    this._previous = null;
    this._next = null;
    this._multiple = true;
};

ForgePlugins.PreviousNextButtons.prototype =
{
    /**
     * The boot function
     */
    boot: function()
    {
        if (this.viewer.story.scenes.length > 1)
        {
            this._previous = this.plugin.create.image(this.plugin.options.previous);
            this._previous.keepRatio = false;
            this._previous.width = this.plugin.options.width;
            this._previous.height = this.plugin.options.height;
            this._previous.verticalCenter = true;
            this._previous.left = this.plugin.options.offset;
            this._previous.pointer.enabled = true;
            this._previous.pointer.cursor = "pointer";
            this._previous.pointer.onClick.add(this._previousClickHandler, this);
            this.plugin.container.addChild(this._previous);

            this._next = this.plugin.create.image(this.plugin.options.next);
            this._next.keepRatio = false;
            this._next.width = this.plugin.options.width;
            this._next.height = this.plugin.options.height;
            this._next.verticalCenter = true;
            this._next.right = this.plugin.options.offset;
            this._next.pointer.enabled = true;
            this._next.pointer.cursor = "pointer";
            this._next.pointer.onClick.add(this._nextClickHandler, this);
            this.plugin.container.addChild(this._next);
        }
        else
        {
            this._multiple = false;
        }
    },

    /**
     * Show the button
     */
    show: function()
    {
        if (this._multiple === true)
        {
            this._previous.show();
            this._next.show();
        }
    },

    /**
     * Hide the button
     */
    hide: function()
    {
        if (this._multiple === true)
        {
            this._previous.hide();
            this._next.hide();
        }
    },

    /**
     * Destroy the button.
     */
    destroy: function()
    {
        if (this._multiple === true)
        {
            this._previous.pointer.onClick.remove(this._previousClickHandler, this);
            this._next.pointer.onClick.remove(this._previousClickHandler, this);

            this._previous = null;
            this._next = null;
        }
    },

    _previousClickHandler: function(event)
    {
        this.viewer.story.previousScene();
    },

    _nextClickHandler: function(event)
    {
        this.viewer.story.nextScene();
    }
};