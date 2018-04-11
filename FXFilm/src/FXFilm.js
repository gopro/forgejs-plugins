var ForgePlugins = ForgePlugins || {};

ForgePlugins.FXFilm = function()
{
    this._pass = null;
};

ForgePlugins.FXFilm.prototype =
{
    boot: function()
    {
        this._pass = new FORGE.ShaderPass(THREE.FilmShader, "tDiffuse");

        this.noiseIntensity = this.plugin.options.noiseIntensity;
        this.scanIntensity = this.plugin.options.scanIntensity;
        this.scanCount = this.plugin.options.scanCount;
        this.grayscale = this.plugin.options.grayscale;
    },

    update: function()
    {
        this._pass.uniforms.time.value = this.viewer.clock.time;
    },

    destroy: function()
    {
        this._pass.destroy();
        this._pass = null;
    }
};

/**
 * Get the shader pass.
 * @name FORGE.FXFilm#pass
 * @type {FORGE.ShaderPass}
 * @readonly
 */
Object.defineProperty(ForgePlugins.FXFilm.prototype, "pass",
{
    /** @this {FORGE.FXFilm} */
    get: function()
    {
        return this._pass;
    }
});

/**
 * Get and set the noiseIntensity.
 * @name FORGE.FXFilm#noiseIntensity
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXFilm.prototype, "noiseIntensity",
{
    /** @this {FORGE.FXFilm} */
    get: function()
    {
        return this._pass.uniforms.nIntensity.value;
    },
    /** @this {FORGE.FXFilm} */
    set: function(value)
    {
        return this._pass.uniforms.nIntensity.value = value;
    }
});

/**
 * Get and set the scanIntensity.
 * @name FORGE.FXFilm#scanIntensity
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXFilm.prototype, "scanIntensity",
{
    /** @this {FORGE.FXFilm} */
    get: function()
    {
        return this._pass.uniforms.sIntensity.value;
    },
    /** @this {FORGE.FXFilm} */
    set: function(value)
    {
        return this._pass.uniforms.sIntensity.value = value;
    }
});

/**
 * Get and set the scanCount.
 * @name FORGE.FXFilm#scanCount
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXFilm.prototype, "scanCount",
{
    /** @this {FORGE.FXFilm} */
    get: function()
    {
        return this._pass.uniforms.sCount.value;
    },
    /** @this {FORGE.FXFilm} */
    set: function(value)
    {
        return this._pass.uniforms.sCount.value = value;
    }
});

/**
 * Get and set the grayscale flag.
 * @name FORGE.FXFilm#grayscale
 * @type {boolean}
 */
Object.defineProperty(ForgePlugins.FXFilm.prototype, "grayscale",
{
    /** @this {FORGE.FXFilm} */
    get: function()
    {
        return Boolean(this._pass.uniforms.grayscale.value);
    },
    /** @this {FORGE.FXFilm} */
    set: function(value)
    {
        return this._pass.uniforms.grayscale.value = Number(value);
    }
});
