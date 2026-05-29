"use client";

import { useEffect, useRef } from "react";

// ─── Vertex shader ────────────────────────────────────────────────────────────
const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// ─── Fragment shader ──────────────────────────────────────────────────────────
const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_mobile;

#define BH_R  0.22
#define D_IN  0.24
#define D_OUT 0.72

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float hash1(float n) { return fract(sin(n) * 43758.5453); }

vec3 stars(vec2 uv, float time) {
  vec3 col = vec3(0.0);
  float layers = u_mobile > 0.5 ? 2.0 : 3.0;
  for (float i = 0.0; i < 3.0; i++) {
    if (i >= layers) break;
    float scale = 25.0 + i * 18.0;
    vec2 g = floor(uv * scale);
    vec2 f = fract(uv * scale) - 0.5;
    float h = hash(g + i * 137.0);
    if (h > 0.96) {
      float b = (h - 0.96) / 0.04;
      float twinkle = 0.7 + 0.3 * sin(time * (1.5 + h * 4.0) + h * 80.0);
      float s = b * twinkle * exp(-dot(f,f) * 300.0);
      vec3 tint = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.92, 0.75), hash1(h * 7.3));
      col += tint * s;
    }
  }
  return col;
}

vec3 diskCol(float r, float ang, float time) {
  float t = 1.0 - clamp((r - D_IN) / (D_OUT - D_IN), 0.0, 1.0);
  vec3 hot  = vec3(1.0,  0.82, 0.45);
  vec3 mid  = vec3(1.0,  0.45, 0.15);
  vec3 cool = vec3(0.18, 0.42, 1.0);
  vec3 col  = t > 0.5
    ? mix(mid,  hot,  (t - 0.5) * 2.0)
    : mix(cool, mid,  t * 2.0);
  float doppler = 0.55 + 0.7 * sin(ang - time * 0.25);
  col *= max(0.0, doppler);
  float turb = hash(vec2(r * 12.0 + time * 0.05, ang * 4.0 + time * 0.1));
  col *= 0.55 + 0.9 * turb;
  col *= pow(t, 1.8) * 2.5;
  return col;
}

float diskMask(float r) {
  return smoothstep(D_IN - 0.015, D_IN + 0.04, r)
       * (1.0 - smoothstep(D_OUT * 0.65, D_OUT, r));
}

void main() {
  vec2 uv  = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  vec2 mp  = u_mouse * 0.04;
  uv -= mp;

  float r   = length(uv);
  vec3  col = vec3(0.0);

  // Stars — background
  col += stars(uv * 0.45 + 0.5 + mp * 0.4, u_time) * 0.9;

  // Event horizon
  if (r < BH_R) {
    float edge = smoothstep(BH_R - 0.012, BH_R, r);
    gl_FragColor = vec4(mix(vec3(0.0), col * 0.15, edge), 1.0);
    return;
  }

  // Gravitational lensing — bend ray inward, sample lensed stars
  float rs      = BH_R * BH_R;
  vec2  bentUV  = uv - normalize(uv) * (rs / (r * r) * 0.55);
  if (length(bentUV) > BH_R * 1.05) {
    col += stars(bentUV * 0.45 + 0.5 + mp * 0.4, u_time)
         * 0.35 * smoothstep(BH_R, BH_R + 0.15, r);
  }

  // Photon ring
  col += vec3(1.0, 0.88, 0.65)
       * exp(-pow((r - BH_R * 1.42) / 0.012, 2.0)) * 1.8;

  // Accretion disk
  float tilt = 0.38;
  vec2  dUV  = vec2(uv.x, uv.y / tilt);
  float dR   = length(dUV);
  float dAng = atan(dUV.y, dUV.x);
  float mask = diskMask(dR);
  if (mask > 0.001) {
    float behind = uv.y < 0.0
      ? smoothstep(0.0, BH_R * 0.9, abs(uv.x) - BH_R * 0.3)
      : 1.0;
    vec3 dc = diskCol(dR, dAng, u_time);
    col = mix(col, col + dc, mask * behind);
    col += vec3(0.9, 0.55, 0.2) * exp(-dR * 1.8) * 0.22 * mask;
  }

  // Nebula haze
  col += vec3(0.3, 0.5, 1.0) * exp(-r * 2.6) * 0.12;

  // Vignette + tone-map + gamma
  col *= 1.0 - smoothstep(0.55, 1.15, r);
  col  = col / (col + 0.85);
  col  = pow(max(col, 0.0), vec3(0.82));

  gl_FragColor = vec4(col, 1.0);
}
`;

// ─── WebGL initialiser ────────────────────────────────────────────────────────
function initGL(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("Shader error:", gl.getShaderInfoLog(s));
    }
    return s;
  };

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  // Full-screen quad (2 triangles)
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  return {
    gl,
    u: {
      res:    gl.getUniformLocation(prog, "u_res"),
      time:   gl.getUniformLocation(prog, "u_time"),
      mouse:  gl.getUniformLocation(prog, "u_mouse"),
      mobile: gl.getUniformLocation(prog, "u_mobile"),
    },
  };
}

// ─── React component ──────────────────────────────────────────────────────────
interface Props {
  className?: string;
}

export function BlackholeCanvas({ className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    // Render at 1× on mobile to save GPU; cap at 2× on desktop
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);

    const ctx = initGL(canvas);
    if (!ctx) return;
    const { gl, u } = ctx;

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.res, canvas.width, canvas.height);
    };
    resize();
    gl.uniform1f(u.mobile, isMobile ? 1.0 : 0.0);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = [
        ((e.clientX - rect.left) / rect.width)  * 2 - 1,
        -(((e.clientY - rect.top)  / rect.height) * 2 - 1),
      ];
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    let raf: number;
    const t0 = performance.now();

    const draw = () => {
      const t = (performance.now() - t0) / 1000;
      gl.uniform1f(u.time, t);
      gl.uniform2f(u.mouse, mouseRef.current[0], mouseRef.current[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none ${className}`}
      aria-hidden="true"
      style={{ display: "block" }}
    />
  );
}
