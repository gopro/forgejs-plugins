var ForgePlugins = ForgePlugins || {};

/**
 * This plugin create an url with camera parameters for view sharing.<br>
 * This plugin accepts 2 sets of querystring parameters:
 * - normal: &yaw=<decimal-value>&pitch=<decimal-value>&roll=<decimal-value>&fov=<decimal-value>&view=<[rectilinear,gopro,flat]>
 * - short: &y<decimal-value>p<decimal-value>r<decimal-value>f<decimal-value>v<[rectilinear,gopro,flat]>
 */
ForgePlugins.Share = function()
{
    // Timer object
    this._timer = null;

    // Timer event object
    this._loop = null;

    // Parameters suffix
    this._paramSuffix = "&";
};

ForgePlugins.Share.prototype = {

    /**
     * The boot function
     */
    boot: function()
    {
        this.viewer.story.onSceneLoadComplete.add(this._sceneLoadCompleteHandler, this);
        this._sceneLoadCompleteHandler();
    },

    /**
     * Destroy the button.
     */
    destroy: function()
    {
        this._timer.stop();

        this._timer.destroy();
        this._timer = null;

        this._loop = null;
    },

    createURL: function()
    {
        var camera = this.viewer.camera;
        var history = this.viewer.history;

        var hash = history.generateHash(this.viewer.story.scene, false);

        var format = this.plugin.options.format;
        var precision = this.plugin.options.precision;

        if (format === "short")
        {
            hash += this._paramSuffix;
        }

        if (this.plugin.options.yaw === true)
        {
            hash += (format !== "short" ? this._paramSuffix + "yaw=" + camera.yaw.toFixed(precision) : camera.yaw.toFixed(precision) + "y,");
        }
        if (this.plugin.options.pitch === true)
        {
            hash += (format !== "short" ? this._paramSuffix + "pitch=" + camera.pitch.toFixed(precision) : camera.pitch.toFixed(precision) + "p,");
        }
        if (this.plugin.options.roll === true)
        {
            hash += (format !== "short" ? this._paramSuffix + "roll=" + camera.roll.toFixed(precision) : camera.roll.toFixed(precision) + "r,");
        }
        if (this.plugin.options.fov === true)
        {
            hash += (format !== "short" ? this._paramSuffix + "fov=" + camera.fov.toFixed(precision) : camera.fov.toFixed(precision) + "f,");
        }
        if (this.plugin.options.view === true)
        {
            hash += (format !== "short" ? this._paramSuffix + "view=" + this.viewer.view.type : this.viewer.view.type + "v,");
        }

        // remove last comma
        if (format === "short" && hash.substr(-1) === ",")
        {
            hash = hash.slice(0, -1);
        }

        return hash;
    },

    updateURL: function()
    {
        var url = this.createURL();

        if (window.history.replaceState)
        {
            var scene = this.viewer.story.scene;
            var state =
            {
                "viewer":
                {
                    uid: this.viewer.uid
                },

                "scene":
                {
                    uid: scene.uid
                },

                "locale": this.viewer.i18n.locale
            }

            window.history.replaceState(state, scene.name, url);
        }
        else
        {
            window.location.hash = url;
        }
    },

    _sceneLoadCompleteHandler: function()
    {
        var hashParameters = FORGE.URL.parse()["hashParameters"];

        if (hashParameters !== null)
        {
            // verify and apply the normal URL parameters
            if (typeof hashParameters.view === "string" && this.plugin.options.view === true)
            {
                this.viewer.view.type = hashParameters.view.toLowerCase();
            }

            if (typeof hashParameters.fov === "string" && this.plugin.options.fov === true)
            {
                this.viewer.camera.fov = Number(hashParameters.fov);
            }

            if (typeof hashParameters.yaw === "string" && this.plugin.options.yaw === true)
            {
                this.viewer.camera.yaw = Number(hashParameters.yaw);
            }

            if (typeof hashParameters.pitch === "string" && this.plugin.options.pitch === true)
            {
                this.viewer.camera.pitch = Number(hashParameters.pitch);
            }

            if (typeof hashParameters.roll === "string" && this.plugin.options.roll === true)
            {
                this.viewer.camera.roll = Number(hashParameters.roll);
            }

            // hash for short URL
            var hash = FORGE.URL.parse()["hash"];

            // verify and apply the short URL parameters
            var re = /&?([0-9\-.]+|rectilinear|gopro|flat)(y|p|r|f|v)\,?/gi;
            var rr;
            var result = {};
            while ((rr = re.exec(hash)) !== null)
            {
                if (typeof rr[1] === "string")
                {
                    if (rr[2] === "v" && this.plugin.options.view === true)
                    {
                        result.view = rr[1].toLowerCase();
                    }
                    if (rr[2] === "f" && this.plugin.options.fov === true)
                    {
                        result.fov = Number(rr[1]);
                    }
                    if (rr[2] === "y" && this.plugin.options.yaw === true)
                    {
                        result.yaw = Number(rr[1]);
                    }
                    if (rr[2] === "p" && this.plugin.options.pitch === true)
                    {
                        result.pitch = Number(rr[1]);
                    }
                    if (rr[2] === "r" && this.plugin.options.roll === true)
                    {
                        result.roll = Number(rr[1]);
                    }
                }
            }

            // This order needs to be respected, of else bad update might happen
            if (typeof result.view !== "undefined")
            {
                this.viewer.view.type = result.view;
            }
            if (typeof result.fov !== "undefined")
            {
                this.viewer.camera.fov = result.fov;
            }
            if (typeof result.yaw !== "undefined")
            {
                this.viewer.camera.yaw = result.yaw;
            }
            if (typeof result.pitch !== "undefined")
            {
                this.viewer.camera.pitch = result.pitch;
            }
            if (typeof result.roll !== "undefined")
            {
                this.viewer.camera.roll = result.roll;
            }

            this.viewer.view.current.updateUniforms();
        }

        if (this._timer === null)
        {
            this._timer = this.viewer.clock.create(false);
            this._loop = this._timer.create(1000, true, Infinity, this.updateURL, this);
            this._timer.start();
        }
    }

};
