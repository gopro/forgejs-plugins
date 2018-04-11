var ForgePlugins = ForgePlugins || {};

ForgePlugins.FXHorizontalBlur = function()
{
    this._pass = null;
};

ForgePlugins.FXHorizontalBlur.prototype =
{
    boot: function()
    {
        this._pass = new FORGE.ShaderPass(THREE.HorizontalBlurShader, "tDiffuse");

        this.intensity = this.plugin.options.intensity;
    },

    destroy: function()
    {
        this._pass.destroy();
        this._pass = null;
    }
};

/**
 * Get the shader pass.
 * @name FORGE.FXHorizontalBlur#pass
 * @type {FORGE.ShaderPass}
 * @readonly
 */
Object.defineProperty(ForgePlugins.FXHorizontalBlur.prototype, "pass",
{
    /** @this {FORGE.FXHorizontalBlur} */
    get: function()
    {
        return this._pass;
    }
});

/**
 * Get and set the intensity.
 * @name FORGE.FXHorizontalBlur#intensity
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXHorizontalBlur.prototype, "intensity",
{
    /** @this {FORGE.FXHorizontalBlur} */
    get: function()
    {
        return this._pass.uniforms.h.value;
    },
    /** @this {FORGE.FXHorizontalBlur} */
    set: function(value)
    {
        return this._pass.uniforms.h.value = value;
    }
});
