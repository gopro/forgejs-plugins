var ForgePlugins = ForgePlugins || {};

ForgePlugins.FXVignette = function()
{
    this._pass = null;
};

ForgePlugins.FXVignette.prototype =
{
    boot: function()
    {
        this._pass = new FORGE.ShaderPass(THREE.VignetteShader, "tDiffuse");

        this.offset = this.plugin.options.offset;
        this.darkness = this.plugin.options.darkness;
    },

    destroy: function()
    {
        this._pass.destroy();
        this._pass = null;
    }
};

/**
 * Get the shader pass.
 * @name FORGE.FXVignette#pass
 * @type {FORGE.ShaderPass}
 * @readonly
 */
Object.defineProperty(ForgePlugins.FXVignette.prototype, "pass",
{
    /** @this {FORGE.FXVignette} */
    get: function()
    {
        return this._pass;
    }
});

/**
 * Get and set the offset.
 * @name FORGE.FXVignette#offset
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXVignette.prototype, "offset",
{
    /** @this {FORGE.FXVignette} */
    get: function()
    {
        return this._pass.uniforms.offset.value;
    },
    /** @this {FORGE.FXVignette} */
    set: function(value)
    {
        return this._pass.uniforms.offset.value = value;
    }
});

/**
 * Get and set the darkness.
 * @name FORGE.FXVignette#darkness
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXVignette.prototype, "darkness",
{
    /** @this {FORGE.FXVignette} */
    get: function()
    {
        return this._pass.uniforms.darkness.value;
    },
    /** @this {FORGE.FXVignette} */
    set: function(value)
    {
        this._pass.uniforms.darkness.value = value;
    }
});