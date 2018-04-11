
varying vec2 vUv;

uniform vec4 tViewport;
uniform mat4 tModelViewMatrixInverse;
uniform float tProjectionScale;

uniform sampler2D tDiffuse;
uniform sampler2D tMask;

uniform vec4 light;

uniform float fExposure;
uniform float fDecay;
uniform float fDensity;
uniform float fWeight;
uniform float fClamp;
uniform float fRed;
uniform float fGreen;
uniform float fBlue;
uniform float fCoeff;

const int iSamples = 100;

#include <defines>
#include <helpers>
#include <coordinates>
#include <texcoords>
#include <stw_frag_rectilinear>

vec2 projection()
{
    vec2 screenPT = getScreenPoint(gl_FragCoord, tViewport);
    vec3 spherePT = screenToWorld(screenPT, tViewport, tModelViewMatrixInverse, tProjectionScale);
    return cartesianToSpherical(spherePT).yz;
}

vec4 quaternionNormalize(vec4 q)
{
   float l = 1.0 / length(q);
    return l * q;
}

float quaternionAngle(vec4 q)
{
    return 2.0 * acos( quaternionNormalize(q).w );
}

vec4 quaternionFromVectors(vec4 a, vec4 b)
{
     vec4 q;
     float r = dot(a,b) + 1.0;

    if (r < 0.000001)
    {
        r = 0.0;

        if (abs(a.x) > abs(a.z))
        {
            q = vec4(-a.y, a.x, 0.0, r);
        }
        else
        {
            q = vec4(0.0, -a.z, a.y, r);
        }
    }
    else
    {
        q = vec4( cross(a.xyz, b.xyz), r);
    }

    return quaternionNormalize(q);
}

void main()
{
    float delta = 1.0 / float(iSamples) * fDensity;
    vec4 coord = vec4( sphericalToCartesian( vec3(1.0, projection()) ), 0.0);
    float illuminationDecay = 1.0;
    vec4 FragColor = vec4(0.0);

    vec4 rotation = quaternionFromVectors(light, coord);
    float lightAngle = quaternionAngle(rotation);

    if (lightAngle > PI/3.0)
    {
        gl_FragColor = texture2D( tDiffuse, vUv );
        return;
    }

    float t=0.0;
    vec4 maxLightValue = vec4(0.0);

    for (int i=0; i < iSamples ; i++)
    {
        vec4 pos = (1.0 - t) * coord + t * light;
        t += delta;

        vec2 texelCoords = getTexCoords(pos.xyz* vec3(-1.0, 1.0, 1.0), 0);
        vec4 texel = texture2D(tMask, texelCoords );

        if (texel.a < 0.01)
        {
            texel = vec4(0.0, 0.0, 0.0, 0.0);
        }

        // if ( length(texel) > length(maxLightValue))
        // {
        //     maxLightValue = texel;
        // }
        // else
        // {
        //     texel = maxLightValue;
        // }

        texel *= illuminationDecay * fWeight;

        if (fRed + fGreen + fBlue > 0.001)
        {
            texel.rgb = vec3(texel.r * fRed, texel.g * fGreen, texel.b * fBlue) / (fRed + fGreen + fBlue) ;
        }

        FragColor += texel;
        illuminationDecay *= fDecay;
    }

    FragColor *= fExposure  * (1.0 - lightAngle / (PI/3.0) ) ;
    FragColor = clamp(FragColor, 0.0, fClamp);

    vec4 texel = texture2D( tDiffuse, vUv );
    gl_FragColor = texel + vec4(FragColor.rgb, 1.0) * fCoeff;
}