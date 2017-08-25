var ForgePlugins = ForgePlugins || {};


ForgePlugins.Share = function()
{
    this._timer = null;

    this._loop = null;
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
        this._timer.destroy();
        this._timer = null;
    },

    createURL: function()
    {
        var camera = this.viewer.camera;
        var history = this.viewer.history;

        var hash = history.generateHash(this.viewer.story.scene, false);
        hash += "&yaw=" + camera.yaw.toFixed(0);
        hash += "&pitch=" + camera.pitch.toFixed(0);
        hash += "&roll=" + camera.roll.toFixed(0);
        hash += "&fov=" + camera.fov.toFixed(0);
        hash += "&view=" + this.viewer.view.type;

        return hash;
    },

    updateURL: function()
    {
        window.location.hash = this.createURL();
    },

    _sceneLoadCompleteHandler: function()
    {
        var hashParameters = FORGE.URL.parse()["hashParameters"];

        if(hashParameters !== null)
        {
            if(typeof hashParameters.view === "string")
            {
                this.viewer.view.type = hashParameters.view;
            }

            if(typeof hashParameters.yaw === "string")
            {
                this.viewer.camera.yaw = Number(hashParameters.yaw);
            }

            if(typeof hashParameters.pitch === "string")
            {
                this.viewer.camera.pitch = Number(hashParameters.pitch);
            }

            if(typeof hashParameters.roll === "string")
            {
                this.viewer.camera.roll = Number(hashParameters.roll);
            }

            if(typeof hashParameters.fov === "string")
            {
                this.viewer.camera.fov = Number(hashParameters.fov);
            }
        }

        if(this._timer === null)
        {
            this._timer = this.viewer.clock.create(false);
            this._loop = this._timer.create(1000, true, Infinity, this.updateURL, this);
            this._timer.start();
        }
    }

};