var ForgePlugins = ForgePlugins || {};

ForgePlugins.FXSepia = function()
{
    this._pass = null;
};

ForgePlugins.FXSepia.prototype =
{
    boot: function()
    {
        this._pass = new FORGE.ShaderPass(THREE.SepiaShader, "tDiffuse");

        this.amount = this.plugin.options.amount;
    },

    destroy: function()
    {
        this._pass.destroy();
        this._pass = null;
    }
};

/**
 * Get the shader pass.
 * @name FORGE.FXSepia#pass
 * @type {FORGE.ShaderPass}
 * @readonly
 */
Object.defineProperty(ForgePlugins.FXSepia.prototype, "pass",
{
    /** @this {FORGE.FXSepia} */
    get: function()
    {
        return this._pass;
    }
});

/**
 * Get and set the amount.
 * @name FORGE.FXSepia#amount
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXSepia.prototype, "amount",
{
    /** @this {FORGE.FXSepia} */
    get: function()
    {
        return this._pass.uniforms.amount.value;
    },
    /** @this {FORGE.FXSepia} */
    set: function(value)
    {
        return this._pass.uniforms.amount.value = value;
    }
});
