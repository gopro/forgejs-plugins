var ForgePlugins = ForgePlugins || {};

ForgePlugins.FXPixelize = function()
{
    this._pass = null;
};

ForgePlugins.FXPixelize.prototype =
{
    boot: function()
    {
        this._pass = new FORGE.ShaderPass(THREE.PixelizeShader, "tDiffuse");

        this.pixelSize = this.plugin.options.pixelSize;
    },

    update: function()
    {
        this._updateUniforms();
    },

    destroy: function()
    {
        this._pass.destroy();
        this._pass = null;
    },

    _updateUniforms: function(viewport)
    {
        var sceneUid = this.viewer.story.sceneUid;

        if (sceneUid !== "")
        {

            var rect = this._pass.viewport.rectangle;
            this.pass.material.uniforms.resolution.value = new THREE.Vector2(rect.width, rect.height);
        }
    },
};

/**
 * Get the shader pass.
 * @name FORGE.FXPixelize#pass
 * @type {FORGE.ShaderPass}
 * @readonly
 */
Object.defineProperty(ForgePlugins.FXPixelize.prototype, "pass",
{
    /** @this {FORGE.FXPixelize} */
    get: function()
    {
        return this._pass;
    }
});

/**
 * Get and set the pixelSize.
 * @name FORGE.FXPixelize#pixelSize
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXPixelize.prototype, "pixelSize",
{
    /** @this {FORGE.FXPixelize} */
    get: function()
    {
        return this._pass.uniforms.pixelSize.value;
    },
    /** @this {FORGE.FXPixelize} */
    set: function(value)
    {
        return this._pass.uniforms.pixelSize.value = value;
    }
});