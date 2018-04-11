var ForgePlugins = ForgePlugins || {};

ForgePlugins.FXVerticalBlur = function()
{
    this._pass = null;
};

ForgePlugins.FXVerticalBlur.prototype =
{
    boot: function()
    {
        this._pass = new FORGE.ShaderPass(THREE.VerticalBlurShader, "tDiffuse");

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
 * @name FORGE.FXVerticalBlur#pass
 * @type {FORGE.ShaderPass}
 * @readonly
 */
Object.defineProperty(ForgePlugins.FXVerticalBlur.prototype, "pass",
{
    /** @this {FORGE.FXVerticalBlur} */
    get: function()
    {
        return this._pass;
    }
});

/**
 * Get and set the intensity.
 * @name FORGE.FXVerticalBlur#intensity
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXVerticalBlur.prototype, "intensity",
{
    /** @this {FORGE.FXVerticalBlur} */
    get: function()
    {
        return this._pass.uniforms.v.value;
    },
    /** @this {FORGE.FXVerticalBlur} */
    set: function(value)
    {
        return this._pass.uniforms.v.value = value;
    }
});
