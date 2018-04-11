var ForgePlugins = ForgePlugins || {};

ForgePlugins.FXGodRays = function()
{
    this._yaw = 0;
    this._pitch = 0;
    this._pass = null;
    this._mask = null;
};

ForgePlugins.FXGodRays.prototype =
{
    boot: function()
    {
        this._yaw = this.plugin.options.yaw;
        this._pitch = this.plugin.options.pitch;

        this._mask = new THREE.TextureLoader().load( this.plugin.options.mask );

        this._pass = this._createPass();
    },

    _createPass: function()
    {
        var shader =
        {
            uniforms:
            {
                tDiffuse: {type: "t", value: 0, texture: null},
                tMask   : {type: "t", value: 0, texture: null},
                light: {type: "v4", value: new THREE.Vector4()},

                fExposure: {type: "f", value: this.plugin.options.exposure},
                fDecay: {type: "f", value: this.plugin.options.decay},
                fDensity: {type: "f", value: this.plugin.options.density},
                fWeight: {type: "f", value: this.plugin.options.weight},
                fClamp: {type: "f", value: this.plugin.options.clamp},
                fCoeff: { type: "f", value: this.plugin.options.coeff},
                fRed: {type: "f", value: this.plugin.options.red},
                fGreen: {type: "f", value: this.plugin.options.green},
                fBlue: {type: "f", value: this.plugin.options.blue},

                tViewport                : {type: "v4", value: new THREE.Vector4()},
                tModelViewMatrixInverse  : {type: "m4", value: new THREE.Matrix4()},
                tProjectionScale         : {type: "f", value: 1.0}
            },

            vertexShader: FORGE.ShaderLib.get("fx_godrays_vertex"),
            fragmentShader: FORGE.ShaderLib.get("fx_godrays_fragment")
        };

        return new FORGE.ShaderPass(shader, "tDiffuse");
    },

    _getLightVector: function()
    {
        return new THREE.Vector4(Math.cos(this._pitch) * Math.sin(this._yaw),
                                Math.sin(this._pitch),
                                Math.cos(this._pitch) * Math.cos(this._yaw),
                                0.0);
    },

    _updateUniforms: function(viewport)
    {
        var sceneUid = this.viewer.story.sceneUid;

        if (sceneUid !== "")
        {
            var viewport = this.viewer.renderer.scenes.get(sceneUid).viewports.all[0];

            this.pass.material.uniforms.tMask.value = this._mask;

            this.pass.material.uniforms.light.value = this._getLightVector();

            this.pass.material.uniforms.tViewport.value = viewport.rectangle.vector4;
            this.pass.material.uniforms.tModelViewMatrixInverse.value = viewport.camera.modelViewInverse;
            this.pass.material.uniforms.tProjectionScale.value = viewport.view.current.projectionScale;
        }
    },

    update: function()
    {
        this._updateUniforms();
    },

    destroy: function()
    {

    }
};

/**
 * Get the shader pass.
 * @name FORGE.FXGodRays#pass
 * @type {FORGE.ShaderPass}
 * @readonly
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "pass",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this._pass;
    }
});

/**
 * Get and set the yaw.
 * @name FORGE.FXGodRays#yaw
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "yaw",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this._yaw;
    },
    /** @this {FORGE.FXGodRays} */
    set: function(value)
    {
        this._yaw = value;
    }
});

/**
 * Get and set the pitch.
 * @name FORGE.FXGodRays#pitch
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "pitch",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this._pitch;
    },
    /** @this {FORGE.FXGodRays} */
    set: function(value)
    {
        this._pitch = value;
    }
});

/**
 * Get and set the exposure.
 * @name FORGE.FXGodRays#exposure
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "exposure",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this.pass.material.uniforms.fExposure.value;
    },
    /** @this {FORGE.FXGodRays} */
    set: function(value)
    {
        this.pass.material.uniforms.fExposure.value = value;
    }
});

/**
 * Get and set the decay.
 * @name FORGE.FXGodRays#decay
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "decay",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this.pass.material.uniforms.fDecay.value;
    },
    /** @this {FORGE.FXGodRays} */
    set: function(value)
    {
        this.pass.material.uniforms.fDecay.value = value;
    }
});

/**
 * Get and set the density.
 * @name FORGE.FXGodRays#density
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "density",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this.pass.material.uniforms.fDensity.value;
    },
    /** @this {FORGE.FXGodRays} */
    set: function(value)
    {
        this.pass.material.uniforms.fDensity.value = value;
    }
});

/**
 * Get and set the weight.
 * @name FORGE.FXGodRays#weight
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "weight",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this.pass.material.uniforms.fWeight.value;
    },
    /** @this {FORGE.FXGodRays} */
    set: function(value)
    {
        this.pass.material.uniforms.fWeight.value = value;
    }
});

/**
 * Get and set the clamp.
 * @name FORGE.FXGodRays#clamp
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "clamp",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this.pass.material.uniforms.fClamp.value;
    },
    /** @this {FORGE.FXGodRays} */
    set: function(value)
    {
        this.pass.material.uniforms.fClamp.value = value;
    }
});

/**
 * Get and set the coeff.
 * @name FORGE.FXGodRays#coeff
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "coeff",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this.pass.material.uniforms.fCoeff.value;
    },
    /** @this {FORGE.FXGodRays} */
    set: function(value)
    {
        this.pass.material.uniforms.fCoeff.value = value;
    }
});

/**
 * Get and set the red.
 * @name FORGE.FXGodRays#red
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "red",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this.pass.material.uniforms.fRed.value;
    },
    /** @this {FORGE.FXGodRays} */
    set: function(value)
    {
        this.pass.material.uniforms.fRed.value = value;
    }
});

/**
 * Get and set the green.
 * @name FORGE.FXGodRays#green
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "green",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this.pass.material.uniforms.fGreen.value;
    },
    /** @this {FORGE.FXGodRays} */
    set: function(value)
    {
        this.pass.material.uniforms.fGreen.value = value;
    }
});

/**
 * Get and set the blue.
 * @name FORGE.FXGodRays#blue
 * @type {number}
 */
Object.defineProperty(ForgePlugins.FXGodRays.prototype, "blue",
{
    /** @this {FORGE.FXGodRays} */
    get: function()
    {
        return this.pass.material.uniforms.fBlue.value;
    },
    /** @this {FORGE.FXGodRays} */
    set: function(value)
    {
        this.pass.material.uniforms.fBlue.value = value;
    }
});