export type ColorSettings = {
  brightness: number;
  contrast: number;
  saturation: number;
  grayscale: boolean;
  sepia?: number;
  blur?: number;
  linearColor?: boolean;
  exposure?: number;
  temperature?: number;
  tint?: number;
  vignette?: number;
  toneMap?: "none" | "aces";
};
const vertex = `#version 300 es
in vec2 aPosition;
out vec2 uv;
void main(){uv=(aPosition+1.0)*0.5;gl_Position=vec4(aPosition,0,1);}`;
const color = `#version 300 es
precision highp float;
uniform sampler2D source;
uniform vec2 imageSize,tileOrigin,tileSize,textureSizePx;
uniform float exposure,temperature,tint,vignette,brightness,contrast,saturation,sepia,blurRadius;
uniform bool grayscale,linearAdjust;
in vec2 uv;out vec4 outColor;
vec3 linearRGB(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(vec3(.04045),c));}
vec4 sampleLinear(vec2 p){vec4 c=texture(source,p);return vec4(linearRGB(c.rgb)*c.a,c.a);}
void main(){
 vec2 q=vec2(16.0+uv.x*tileSize.x,textureSizePx.y-16.0-(1.0-uv.y)*tileSize.y)/textureSizePx;
 vec4 c=sampleLinear(q)*.25;
 vec2 d=vec2(blurRadius)/textureSizePx;
 c+=sampleLinear(q+vec2(d.x,0))*.125; c+=sampleLinear(q-vec2(d.x,0))*.125;
 c+=sampleLinear(q+vec2(0,d.y))*.125; c+=sampleLinear(q-vec2(0,d.y))*.125;
 c+=sampleLinear(q+d)*.0625; c+=sampleLinear(q-d)*.0625;
 c+=sampleLinear(q+vec2(d.x,-d.y))*.0625;c+=sampleLinear(q+vec2(-d.x,d.y))*.0625;
 vec3 rgb=c.a>0.0?c.rgb/c.a:vec3(0);
 rgb*=exp2(exposure)*vec3(1.0+temperature*.003,1.0+tint*.003,1.0-temperature*.003);
 if(linearAdjust){
   rgb*=brightness;
   rgb=(rgb-vec3(.18))*contrast+vec3(.18);
   float l=dot(rgb,vec3(.2126,.7152,.0722));
   rgb=mix(vec3(l),rgb,grayscale?0.0:saturation);
   vec3 vintage=vec3(dot(rgb,vec3(.393,.769,.189)),dot(rgb,vec3(.349,.686,.168)),dot(rgb,vec3(.272,.534,.131)));
   rgb=mix(rgb,vintage,sepia);
 }
 vec2 global=(tileOrigin+vec2(uv.x,1.0-uv.y)*tileSize)/imageSize-vec2(.5);
 rgb*=1.0-vignette*smoothstep(.15,.72,length(global));
 outColor=vec4(max(rgb,vec3(0)),c.a);
}`;
const display = `#version 300 es
precision highp float;
uniform sampler2D source;uniform bool aces;uniform vec2 displayScale;
in vec2 uv;out vec4 outColor;
vec3 srgb(vec3 c){return mix(12.92*c,1.055*pow(max(c,vec3(0)),vec3(1.0/2.4))-.055,step(vec3(.0031308),c));}
void main(){vec4 c=texture(source,uv*displayScale);vec3 x=c.rgb;
 if(aces)x=clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.0,1.0);
 outColor=vec4(srgb(clamp(x,0.0,1.0)),c.a);}`;
/** Two bounded passes: linear floating point adjustment, then sRGB display. */
export class TiledColorRenderer {
  readonly canvas = new OffscreenCanvas(512, 512);
  private readonly upload = new OffscreenCanvas(544, 544);
  private readonly gl: WebGL2RenderingContext;
  private readonly programs: WebGLProgram[] = [];
  private readonly shaders: WebGLShader[] = [];
  private readonly texture: WebGLTexture;
  private readonly intermediate: WebGLTexture;
  private readonly fbo: WebGLFramebuffer;
  private readonly vao: WebGLVertexArrayObject;
  private readonly buffer: WebGLBuffer;
  private readonly uniforms: Map<string, WebGLUniformLocation>[] = [];
  readonly floatingPoint: boolean;
  constructor() {
    const gl = this.canvas.getContext("webgl2", {
      premultipliedAlpha: false,
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) throw Error("WEBGL2_UNAVAILABLE");
    this.gl = gl;
    try {
      const compile = (kind: number, src: string) => {
        const s = gl.createShader(kind)!;
        this.shaders.push(s);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
          throw Error("COLOR_SHADER");
        return s;
      };
      const v = compile(gl.VERTEX_SHADER, vertex);
      for (const src of [color, display]) {
        const p = gl.createProgram()!;
        this.programs.push(p);
        gl.attachShader(p, v);
        gl.attachShader(p, compile(gl.FRAGMENT_SHADER, src));
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS))
          throw Error("COLOR_PROGRAM");
        const map = new Map<string, WebGLUniformLocation>();
        for (
          let i = 0;
          i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
          i++
        ) {
          const name = gl.getActiveUniform(p, i)!.name;
          map.set(name, gl.getUniformLocation(p, name)!);
        }
        this.uniforms.push(map);
      }
      this.vao = gl.createVertexArray()!;
      this.buffer = gl.createBuffer()!;
      gl.bindVertexArray(this.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      for (const p of this.programs) {
        const a = gl.getAttribLocation(p, "aPosition");
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      }
      this.texture = gl.createTexture()!;
      this.intermediate = gl.createTexture()!;
      this.fbo = gl.createFramebuffer()!;
      for (const texture of [this.texture, this.intermediate]) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      }
      this.floatingPoint = !!gl.getExtension("EXT_color_buffer_float");
      gl.bindTexture(gl.TEXTURE_2D, this.intermediate);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        this.floatingPoint ? gl.RGBA16F : gl.RGBA8,
        512,
        512,
        0,
        gl.RGBA,
        this.floatingPoint ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE,
        null,
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        this.intermediate,
        0,
      );
      if (
        gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE
      ) {
        throw Error("COLOR_FRAMEBUFFER");
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } catch (error) {
      this.dispose();
      throw error;
    }
  }
  render(
    source: OffscreenCanvas,
    output: OffscreenCanvas,
    s: ColorSettings,
    compare = false,
  ) {
    const gl = this.gl,
      ctx = output.getContext("2d")!,
      upload = this.upload.getContext("2d")!;
    if (gl.isContextLost()) throw Error("COLOR_CONTEXT_LOST");
    if (output.width !== source.width) output.width = source.width;
    if (output.height !== source.height) output.height = source.height;
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    for (let y = 0; y < source.height; y += 512)
      for (let x = 0; x < source.width; x += 512) {
        const w = Math.min(512, source.width - x),
          h = Math.min(512, source.height - y);
        upload.clearRect(0, 0, 544, 544);
        // Halo is sampled from neighboring tiles, including clamped outer edges.
        upload.drawImage(
          source,
          x - 16,
          y - 16,
          w + 32,
          h + 32,
          0,
          0,
          w + 32,
          h + 32,
        );
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          this.upload,
        );
        gl.useProgram(this.programs[0]);
        const u = this.uniforms[0];
        gl.uniform1i(u.get("source")!, 0);
        gl.uniform2f(u.get("imageSize")!, source.width, source.height);
        gl.uniform2f(u.get("tileOrigin")!, x, y);
        gl.uniform2f(u.get("tileSize")!, w, h);
        gl.uniform2f(u.get("textureSizePx")!, 544, 544);
        gl.uniform1f(u.get("exposure")!, compare ? 0 : (s.exposure ?? 0));
        gl.uniform1f(u.get("temperature")!, compare ? 0 : (s.temperature ?? 0));
        gl.uniform1f(u.get("tint")!, compare ? 0 : (s.tint ?? 0));
        gl.uniform1f(u.get("vignette")!, compare ? 0 : (s.vignette ?? 0) / 100);
        gl.uniform1f(u.get("brightness")!, s.brightness / 100);
        gl.uniform1f(u.get("contrast")!, s.contrast / 100);
        gl.uniform1f(u.get("saturation")!, s.saturation / 100);
        gl.uniform1f(u.get("sepia")!, (s.sepia ?? 0) / 100);
        gl.uniform1i(u.get("grayscale")!, +s.grayscale);
        gl.uniform1i(u.get("linearAdjust")!, +(!!s.linearColor && !compare));
        gl.uniform1f(
          u.get("blurRadius")!,
          compare || !s.linearColor ? 0 : (s.blur ?? 0),
        );
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.viewport(0, 0, w, h);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.useProgram(this.programs[1]);
        gl.bindTexture(gl.TEXTURE_2D, this.intermediate);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, w, h);
        gl.uniform1i(this.uniforms[1].get("source")!, 0);
        gl.uniform1i(
          this.uniforms[1].get("aces")!,
          +(!compare && s.toneMap === "aces"),
        );
        gl.uniform2f(this.uniforms[1].get("displayScale")!, w / 512, h / 512);
        // The intermediate texture is fixed-size; sample only the populated region.
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        ctx.drawImage(this.canvas, 0, 512 - h, w, h, x, y, w, h);
      }
  }
  dispose() {
    const gl = this.gl;
    for (const p of this.programs) gl.deleteProgram(p);
    for (const s of this.shaders) gl.deleteShader(s);
    if (this.texture) gl.deleteTexture(this.texture);
    if (this.intermediate) gl.deleteTexture(this.intermediate);
    if (this.fbo) gl.deleteFramebuffer(this.fbo);
    if (this.buffer) gl.deleteBuffer(this.buffer);
    if (this.vao) gl.deleteVertexArray(this.vao);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.canvas.width = 1;
    this.canvas.height = 1;
    this.upload.width = 1;
    this.upload.height = 1;
  }
}
