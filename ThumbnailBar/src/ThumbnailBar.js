var ForgePlugins = ForgePlugins || {};

/**
 * Display somewhere on the screen a bar containing all the thumbnails from the
 * differents scenes, for quick access. The bar can be animated, with a
 * navigation if there are too much thumbnails to display.
 * @constructor
 */
ForgePlugins.ThumbnailBar = function()
{
    this._container = null;
    this._navigationContainer = null;
    this._images = [];
    this._tips = [];

    this._containerTween = null;
};

/**
 * The prototype of the ThumbnailBar.
 */
ForgePlugins.ThumbnailBar.prototype = {

    /**
     * Boot routine.
     * @method ForgePlugins.ThumbnailBar#boot
     */
    boot: function()
    {
        var scenes = this.viewer.story.scenes;

        // First is the container
        this._container = this.plugin.create.displayObjectContainer();

        // Parse from the PTP values
        var position = this.plugin.options.container.position;
        if (position === "topLeft")
        {
            this._position = "top";
            this._alignment = "left";
        }
        else if (position === "top")
        {
            this._position = "top";
            this._alignment = "center";
        }
        else if (position === "topRight")
        {
            this._position = "top";
            this._alignment = "right";
        }
        else if (position === "left")
        {
            this._position = "center";
            this._alignment = "left";
        }
        else if (position === "center")
        {
            this._position = "center";
            this._alignment = "center";
        }
        else if (position === "right")
        {
            this._position = "center";
            this._alignment = "right";
        }
        else if (position === "bottomLeft")
        {
            this._position = "bottom";
            this._alignment = "left";
        }
        else if (position === "bottom")
        {
            this._position = "bottom";
            this._alignment = "center";
        }
        else if (position === "bottomRight")
        {
            this._position = "bottom";
            this._alignment = "right";
        }
        else
        {
            // Get global position of the container
            this._position = this.plugin.options.container.position; // can be top, center or bottom
            this._alignment = this.plugin.options.container.alignment; // can be left, center or right
        }

        this._orientation = this.plugin.options.container.orientation; // can be horizontal or vertical

        if (this._position === "center")
        {
            this._container.verticalCenter = true;
        }
        else if (this._position === "top" || this._position === "bottom")
        {
            this._container[this._position] = 0;
        }

        if (this._alignment === "center")
        {
            this._container.horizontalCenter = true;
        }
        else if (this._alignment === "left" || this._alignment === "right")
        {
            this._container[this._alignment] = 0;
        }

        if (this._orientation === "horizontal")
        {
            this._container.width = "100%";
            this._container.height = this.plugin.options.thumbnail.height + this.plugin.options.thumbnail.margin * 2;
        }
        else if (this._orientation === "vertical")
        {
            this._container.width = this.plugin.options.thumbnail.width + this.plugin.options.thumbnail.margin * 2;
            this._container.height = "100%";
        }

        // Create a subcontainer, which is a clone of the container
        this._navigationContainer = this.plugin.create.displayObjectContainer();
        this._navigationContainer.left = this._container.left;
        this._navigationContainer.top = this._container.top;
        this._navigationContainer.verticalCenter = this._container.verticalCenter;
        this._navigationContainer.horizontalCenter = this._container.horizontalCenter;
        this._navigationContainer.width = this._container.width;
        this._navigationContainer.height = this._container.height;

        if (this._orientation === "horizontal")
        {
            this._navigationContainer.width = this.plugin.options.container.size;
        }
        else if (this._orientation === "vertical")
        {
            this._navigationContainer.height = this.plugin.options.container.size;
        }

        // Stylize the subcontainer
        this._navigationContainer.background = this.plugin.options.container.background;
        this._navigationContainer.borderRadius = this.plugin.options.container.borderRadius;

        this.plugin.container.addChild(this._container);
        this._container.addChild(this._navigationContainer)

        // Navigation container, not heavy at all so create it anyway
        this._thumbContainer = this.plugin.create.displayObjectContainer();
        this._thumbContainer.width = "100%";
        this._thumbContainer.height = "100%";
        this._thumbContainer.overflow = "visible";
        this._navigationContainer.addChild(this._thumbContainer);

        // Create thumbnails
        for (var i = 0, ii = scenes.length; i < ii; i++)
        {
            this._createSceneThumb(scenes[i]);
        }

        this._highlightCurrentScene();

        // Add navigation if activated
        if (this.plugin.options.navigation.enabled)
        {
            // Tween for the container
            this._thumbTween = this.plugin.create.tween(this._thumbContainer);

            // Navigation "mouse" zone (for click, press etc...)
            this._navPrev = this.plugin.create.displayObject();
            this._navNext = this.plugin.create.displayObject();
            this._navPrev.width = this.plugin.options.navigation.width + 2 * this.plugin.options.thumbnail.margin;
            this._navPrev.height = this.plugin.options.navigation.height + 2 * this.plugin.options.thumbnail.margin;
            this._navNext.width = this._navPrev.width;
            this._navNext.height = this._navPrev.height;

            if (this._orientation === "horizontal")
            {
                this._navPrev.x = this._navigationContainer.x - this._navPrev.pixelWidth;
                this._navPrev.y = (this._navigationContainer.height - this._navPrev.height) / 2;
                this._navNext.x = this._navigationContainer.pixelWidth + this._navigationContainer.x;
                this._navNext.y = this._navPrev.y;
            }
            else if (this._orientation === "vertical")
            {
                this._navPrev.x = (this._navigationContainer.width - this._navPrev.width) / 2;
                this._navPrev.y = this._navigationContainer.y - this._navPrev.pixelHeight;
                this._navNext.x = this._navPrev.x;
                this._navNext.y = this._navigationContainer.pixelHeight + this._navigationContainer.y;
            }

            var pluginUrl = this.plugin.fullUrl;
            pluginUrl += FORGE.Utils.endsWith(pluginUrl, "/") ? "" : "/";

            var arrowUrl = this.plugin.options.navigation.background.replace("{{plugin_url}}", pluginUrl);
            this._navPrev.background = arrowUrl;
            this._navNext.background = arrowUrl;

            // Rotate the background if it is an image
            this._navNext.rotation = 180;

            this._navPrev.id = "navThumbPrev";
            this._navNext.id = "navThumbNext";
            this._navPrev.pointer.enabled = true;
            this._navNext.pointer.enabled = true;
            this._navPrev.pointer.cursor = FORGE.Pointer.cursors.POINTER;
            this._navNext.pointer.cursor = FORGE.Pointer.cursors.POINTER;

            if (this.plugin.options.navigation.type === "click")
            {
                this._navPrev.pointer.onClick.add(this._navClickHandler, this);
                this._navNext.pointer.onClick.add(this._navClickHandler, this);
            }

            this._container.addChild(this._navPrev);
            this._container.addChild(this._navNext);

            // Add resize handling if the navigation is active
            this._container.onResize.add(this._onResize, this);
        }

        // Animate the subcontainer
        if (this.plugin.options.container.animation)
        {
            this._containerTween = this.plugin.create.tween(this._navigationContainer);
            this._container.pointer.enabled = true;
            this._container.pointer.onEnter.add(this._mouseEnterHandler, this);
            this._container.pointer.onLeave.add(this._mouseLeaveHandler, this);

            if (this.plugin.options.navigation)
            {
                this._navPrevTween = this.plugin.create.tween(this._navPrev);
                this._navNextTween = this.plugin.create.tween(this._navNext);
            }

            // Hide on start
            this.hide();
        }

        // Handle locale
        this.viewer.i18n.onLocaleChangeComplete.add(this._localeChangeHandler, this);
        this.viewer.story.onSceneLoadComplete.add(this._sceneLoadHandler, this);

    },

    /**
     * Handler for the mouse entering the container zone, to display the
     * container if it was hidden.
     * @method ForgePlugins.ThumbnailBar#_mouseEnterHandler
     * @private
     */
    _mouseEnterHandler: function()
    {
        this.show();
    },

    /**
     * Handler for the mouse leaving the container zone, to hide the
     * container if it was displayed.
     * @method ForgePlugins.ThumbnailBar#_mouseLeaveHandler
     * @private
     */
    _mouseLeaveHandler: function()
    {
        this.hide();
    },

    /**
     * Thumbnails creation routine.
     * @param  {FORGE.Scene} scene - the attached scene to the thumbnail
     * @method ForgePlugins.ThumbnailBar#_createSceneThumb
     * @private
     */
    _createSceneThumb: function(scene)
    {
        if (scene.thumbnails === undefined)
        {
            throw "ThumbnailBar: missing thumbnail for the scene \"" + scene.uid + "\"";
        }

        var thumbTipContainer = this.plugin.create.displayObjectContainer();
        var imageConfig = {
            key: scene.thumbnails[0].uid,
            url: scene.thumbnails[0].url
        };

        var img = this.plugin.create.image(imageConfig, false);

        // Position
        if (this._orientation === "horizontal")
        {
            thumbTipContainer.width = this.plugin.options.thumbnail.width;
            thumbTipContainer.height = this.plugin.options.thumbnail.height;
            thumbTipContainer.x = this.plugin.options.thumbnail.margin + this._images.length * (thumbTipContainer.width + this.plugin.options.thumbnail.margin);
            thumbTipContainer.y = this.plugin.options.thumbnail.margin;

            img.height = this.plugin.options.thumbnail.height;
            img.dom.style.maxWidth = this.plugin.options.thumbnail.width + "px";
        }
        else if (this._orientation === "vertical")
        {
            thumbTipContainer.width = this.plugin.options.thumbnail.width;
            thumbTipContainer.height = this.plugin.options.thumbnail.height;
            thumbTipContainer.x = this.plugin.options.thumbnail.margin;
            thumbTipContainer.y = this.plugin.options.thumbnail.margin + this._images.length * (thumbTipContainer.height + this.plugin.options.thumbnail.margin);

            img.dom.style.maxHeight = this.plugin.options.thumbnail.height + "px";
        }

        // Style
        img.borderRadius = this.plugin.options.thumbnail.borderRadius;
        img.borderColor = this.plugin.options.thumbnail.borderColorOver;

        img.data = {
            scene: scene
        };
        this._images.push(img);
        this._thumbContainer.addChild(thumbTipContainer);
        thumbTipContainer.addChild(img);

        img.pointer.enabled = true;
        img.pointer.cursor = FORGE.Pointer.cursors.POINTER;
        img.pointer.onClick.add(this._thumbClickHandler, this);
        img.pointer.onOver.add(this._thumbOverHandler, this);
        img.pointer.onOut.add(this._thumbOutHandler, this);

        // Create tooltip if enabled
        if (this.plugin.options.tooltip.enabled)
        {
            var tipConfig = {
                value: scene.name,
                color: this.plugin.options.tooltip.color,
                font: this.plugin.options.tooltip.font,
                padding: this.plugin.options.tooltip.padding
            };

            var tip = this.plugin.create.textField(tipConfig);
            this._tips.push(tip);

            thumbTipContainer.addChild(tip);

            tip.width = img.dom.style.maxWidth || img.width;
            tip[this.plugin.options.tooltip.position] = this.plugin.options.tooltip.animation ? -tip.pixelHeight : 0;
            tip.background = this.plugin.options.tooltip.background;
            tip.borderRadius = this.plugin.options.tooltip.borderRadius;

            tip.tween = this.plugin.create.tween(tip);
        }
    },

    /**
     * Handler for click on a thumbnail.
     * @param {FORGE.Event} event - the event
     * @method ForgePlugins.ThumbnailBar#_thumbClickHandler
     * @private
     */
    _thumbClickHandler: function(event)
    {
        var scene = event.emitter.data.scene;
        this.viewer.story.scene = scene;
    },

    /**
     * Handler for getting over a thumbnail. Display the border and the tooltip
     * if one.
     * @param {FORGE.Event} event - the event
     * @method ForgePlugins.ThumbnailBar#_thumbOverHandler
     * @private
     */
    _thumbOverHandler: function(event)
    {
        var img = event.emitter;

        img.borderWidth = this.plugin.options.thumbnail.borderWidth;
        img.borderColor = this.plugin.options.thumbnail.borderColorOver;

        // Show tooltip if enabled
        if (this.plugin.options.tooltip.enabled && this.plugin.options.tooltip.animation)
        {
            var tip = img.parent.children[1];
            var movement = {};

            movement[this.plugin.options.tooltip.position] = 0;
            tip.tween.to(movement, 200, this.plugin.options.tooltip.tweenFunctionIn).start();
        }
    },

    /**
     * Handler for getting over a thumbnail. Hide the border and the tooltip
     * if one.
     * @param {FORGE.Event} event - the event
     * @method ForgePlugins.ThumbnailBar#_thumbOutHandler
     * @private
     */
    _thumbOutHandler: function(event)
    {
        var img = event.emitter;

        if (img.data.scene !== this.viewer.story.scene)
        {
            img.borderWidth = 0;
        }
        else
        {
            img.borderColor = this.plugin.options.thumbnail.borderColor;
        }

        // Hide tooltip if enabled
        if (this.plugin.options.tooltip.enabled && this.plugin.options.tooltip.animation)
        {
            var tip = img.parent.children[1];
            var movement = {};

            movement[this.plugin.options.tooltip.position] = -tip.pixelHeight;
            tip.tween.to(movement, 200, this.plugin.options.tooltip.tweenFunctionOut).start();
        }
    },

    /**
     * Handler for clicking on a navigation arrow.
     * @param  {FORGE.Event} event - the event
     * @method ForgePlugins.ThumbnailBar#_navClickHandler
     * @private
     */
    _navClickHandler: function(event)
    {
        if (event.emitter.id === "navThumbPrev")
        {
            this.move(1);
        }
        else if (event.emitter.id === "navThumbNext")
        {
            this.move(-1);
        }
    },

    /**
     * Handler for the locale change.
     * @method ForgePlugins.ThumbnailBar#_localeChangeHandler
     * @private
     */
    _localeChangeHandler: function()
    {
        if (this._images !== null && this._images.length > 0)
        {
            var img;
            for (var i = 0, ii = this._images.length; i < ii; i++)
            {
                img = this._images[i];
                img.tooltip = img.data.scene.name;

                var tip = this._tips[i];
                if (typeof tip !== "undefined")
                {
                    tip.value = img.data.scene.name;
                }
            }
        }
    },

    /**
     * Handler for the scene loading.
     * @param  {FORGE.Event} event - the event
     * @method ForgePlugins.ThumbnailBar#_sceneLoadHandler
     * @private
     */
    _sceneLoadHandler: function(event)
    {
        this._highlightCurrentScene();
    },

    /**
     * Highlight the current scene in the bar.
     * @method ForgePlugins.ThumbnailBar#_highlightCurrentScene
     * @private
     */
    _highlightCurrentScene: function()
    {
        if (this._images !== null && this._images.length > 0)
        {
            var img;
            for (var i = 0, ii = this._images.length; i < ii; i++)
            {
                img = this._images[i];

                if (img.data.scene == this.viewer.story.scene)
                {
                    img.borderWidth = this.plugin.options.thumbnail.borderWidth;
                    img.borderColor = this.plugin.options.thumbnail.borderColor;
                }
                else
                {
                    img.borderWidth = 0;
                    img.borderColor = this.plugin.options.thumbnail.borderColorOver;
                }
            }
        }
    },

    /**
     * Resize handler for repositionning the navigation.
     * @method ForgePlugins.ThumbnailBar#_onResize
     * @private
     */
    _onResize: function()
    {
        if (this._orientation === "horizontal")
        {
            this._navPrev.x = this._navigationContainer.x - this._navPrev.pixelWidth;
            this._navPrev.y = (this._navigationContainer.height - this._navPrev.height) / 2;
            this._navNext.x = this._navigationContainer.pixelWidth + this._navigationContainer.x;
            this._navNext.y = this._navPrev.y;
        }
        else if (this._orientation === "vertical")
        {
            this._navPrev.x = (this._navigationContainer.width - this._navPrev.width) / 2;
            this._navPrev.y = this._navigationContainer.y - this._navPrev.pixelHeight;
            this._navNext.x = this._navPrev.x;
            this._navNext.y = this._navigationContainer.pixelHeight + this._navigationContainer.y;
        }
    },

    /**
     * Show the container when it was hidden.
     * @method ForgePlugins.ThumbnailBar#show
     */
    show: function()
    {
        var movement = {
            container: null,
            navigation: null
        };

        if (this._orientation === "horizontal")
        {
            if (this._position === "top")
            {
                movement.container = {
                    top: 0
                };
                movement.navigation = {
                    top: (this._navigationContainer.height - this._navPrev.height) / 2
                };
            }
            else if (this._position === "bottom")
            {
                movement.container = {
                    bottom: 0
                };
                movement.navigation = {
                    bottom: (this._navigationContainer.height - this._navPrev.height) / 2
                };
            }
        }
        else if (this._orientation === "vertical")
        {
            if (this._alignment === "left")
            {
                movement.container = {
                    left: 0
                };
                movement.navigation = {
                    left: (this._navigationContainer.width - this._navPrev.width) / 2
                };
            }
            else if (this._alignment === "right")
            {
                movement.container = {
                    right: 0
                };
                movement.navigation = {
                    right: (this._navigationContainer.width - this._navPrev.width) / 2
                };
            }
        }

        this._containerTween.to(movement.container, 400, this.plugin.options.container.tweenFunctionIn).start();
        this._navPrevTween.to(movement.navigation, 400, this.plugin.options.container.tweenFunctionIn).start();
        this._navNextTween.to(movement.navigation, 400, this.plugin.options.container.tweenFunctionIn).start();
    },

    /**
     * Hide the container when it was displayed.
     * @method ForgePlugins.ThumbnailBar#hide
     */
    hide: function()
    {
        var movement = {
            container: null,
            navigation: null
        };

        if (this._orientation === "horizontal")
        {
            if (this._position === "top")
            {
                movement.container = {
                    top: -this._container.pixelHeight
                };
                movement.navigation = {
                    top: -(this._navigationContainer.height + this._navPrev.height) / 2
                };
            }
            else if (this._position === "bottom")
            {
                movement.container = {
                    bottom: -this._container.pixelHeight
                };
                movement.navigation = {
                    bottom: -(this._navigationContainer.height + this._navPrev.height) / 2
                };
            }
        }
        else if (this._orientation === "vertical")
        {
            if (this._alignment === "left")
            {
                movement.container = {
                    left: -this._container.pixelWidth
                };
                movement.navigation = {
                    left: -(this._navigationContainer.width + this._navPrev.width) / 2
                };
            }
            else if (this._alignment === "right")
            {
                movement.container = {
                    right: -this._container.pixelWidth
                };
                movement.navigation = {
                    right: -(this._navigationContainer.width + this._navPrev.width) / 2
                };
            }
        }

        this._containerTween.to(movement.container, 400, this.plugin.options.container.tweenFunctionOut).start();
        this._navPrevTween.to(movement.navigation, 400, this.plugin.options.container.tweenFunctionOut).start();
        this._navNextTween.to(movement.navigation, 400, this.plugin.options.container.tweenFunctionOut).start();
    },

    /**
     * Move the thumbnails into the container, according to a direction.
     * @param {number} direction - the direction to move to, can be 1 or -1
     * @method ForgePlugins.ThumbnailBar#move
     */
    move: function(direction)
    {
        var movement;

        if (this.plugin.options.navigation.type === "click")
        {
            if (this._orientation === "horizontal")
            {
                movement = {
                    left: FORGE.Math.clamp(direction * this.plugin.options.navigation.step + this._thumbContainer.x, -this._images.length * (parseInt(this._images[0].dom.style.maxWidth) + this.plugin.options.thumbnail.margin) + this._thumbContainer.pixelWidth - this.plugin.options.thumbnail.margin, 0)
                }
            }
            else if (this._orientation === "vertical")
            {
                movement = {
                    top: FORGE.Math.clamp(direction * this.plugin.options.navigation.step + this._thumbContainer.y, -this._images.length * (parseInt(this._images[0].dom.style.maxHeight) + this.plugin.options.thumbnail.margin) + this._thumbContainer.pixelHeight - this.plugin.options.thumbnail.margin, 0)
                }
            }
        }

        this._thumbTween.to(movement, 400, this.plugin.options.navigation.tweenFunction).start();
    },

    /**
     * Destroy routine.
     * @method ForgePlugins.ThumbnailBar#destroy
     */
    destroy: function()
    {
        this._container = null;
        this._navigationContainer = null;
        this._images = null;
        this._tips = null;
        this._containerTween = null;
    }

};