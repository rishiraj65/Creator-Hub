"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Component as EtheralShadow } from "./etheral-shadow"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { gsap } from "gsap"

const vertexShader = `
  attribute vec4 position;
  void main() {
    gl_Position = position;
  }
`

const fragmentShader = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_intensity;
  
  // Simplified noise for performance
  vec3 hash3(vec2 p) {
    vec3 q = vec3(dot(p, vec2(127.1, 311.7)), 
                  dot(p, vec2(269.5, 183.3)), 
                  dot(p, vec2(419.2, 371.9)));
    return fract(sin(q) * 23.5453); // Reduced multiplier
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f); // Standard smoothstep for performance
    return mix(mix(dot(hash3(i + vec2(0.0,0.0)).xy, f - vec2(0.0,0.0)), 
                   dot(hash3(i + vec2(1.0,0.0)).xy, f - vec2(1.0,0.0)), u.x),
               mix(dot(hash3(i + vec2(0.0,1.0)).xy, f - vec2(0.0,1.0)), 
                   dot(hash3(i + vec2(1.0,1.0)).xy, f - vec2(1.0,1.0)), u.x), u.y);
  }
  
  float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.4; // Slightly increased
    // Hardcoded max octaves for performance, compiler can optimize better
    for(int i = 0; i < 5; i++) {
      if(i >= octaves) break;
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  // Simplified Voronoi (3x3 instead of 5x5)
  float voronoi(vec2 p) {
    vec2 n = floor(p);
    vec2 f = fract(p);
    float md = 8.0;
    
    for(int i = -1; i <= 1; i++) {
      for(int j = -1; j <= 1; j++) {
        vec2 g = vec2(i, j);
        vec2 o = hash3(n + g).xy;
        o = 0.5 + 0.4 * sin(u_time * 0.8 + 6.28 * o);
        vec2 r = g + o - f;
        float d = dot(r, r);
        md = min(md, d);
      }
    }
    return sqrt(md);
  }
  
  float plasma(vec2 p, float time) {
    float a = sin(p.x * 4.0 + time);
    float b = sin(p.y * 4.0 + time * 0.8);
    float c = sin((p.x + p.y) * 4.0 + time * 0.5);
    return (a + b + c) * 0.3;
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 st = (uv - 0.5) * 2.0;
    st.x *= u_resolution.x / u_resolution.y;
    
    float time = u_time * 0.15;
    
    // Simplified fluid logic
    float n = fbm(st * 1.5 + time, 4);
    vec2 flowField = st + vec2(n * 0.4, n * 0.3);
    
    // Fewer distortion layers and lower octaves
    float dist1 = fbm(flowField * 1.2 + time * 0.5, 5) * 0.4;
    float dist2 = fbm(flowField * 1.8 - time * 0.4, 4) * 0.3;
    
    float cells = voronoi(flowField * 2.0 + time * 0.3);
    cells = smoothstep(0.1, 0.8, cells);
    
    float pEffect = plasma(flowField + dist1, time) * 0.2;
    float totalDist = dist1 + dist2 + pEffect;
    
    // Simplified streak calc
    float streak = sin((st.x + totalDist) * 12.0 + time * 2.0) * 0.5 + 0.5;
    streak = smoothstep(0.3, 0.7, streak);
    
    // Main shape logic simplified
    float shape = 1.0 - abs(st.x + totalDist * 0.5);
    shape = smoothstep(0.0, 1.0, shape);
    
    // Colors (Deep Black / Monochromatic Theme)
    vec3 color1 = vec3(0.2, 0.2, 0.2);   // Light Gray Glow
    vec3 color2 = vec3(0.1, 0.1, 0.1);   // Medium Gray
    vec3 color3 = vec3(0.05, 0.05, 0.05); // Dark Gray
    vec3 colorBg = vec3(0.0, 0.0, 0.0);   // Pure Black Bg
    
    float grad = 1.0 - uv.y;
    vec3 finalColor = mix(colorBg, color2, smoothstep(0.0, 0.5, grad));
    finalColor = mix(finalColor, color1, smoothstep(0.5, 1.0, grad));
    
    float intensity = shape * streak * u_intensity;
    intensity += (1.0 - length(st - (u_mouse/u_resolution - 0.5)*2.0) * 0.6) * 0.2;
    intensity = max(0.0, intensity);
    
    vec3 result = mix(colorBg, finalColor, intensity);
    result += (cells * 0.1 * color1); // Subtle detail
    
    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 0.7;
    result *= smoothstep(0.0, 1.0, vignette);
    
    gl_FragColor = vec4(result, 1.0);
  }
`

interface NavLinkProps {
  children: React.ReactNode
  href: string
  gradient: string
}

function NavLink({ children, href, gradient }: NavLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const link = linkRef.current
    if (!link) return

    const handleMouseEnter = () => {
      gsap.to(link, {
        scale: 1.05,
        duration: 0.25,
        ease: "power3.out",
        overwrite: true,
      })
    }

    const handleMouseLeave = () => {
      gsap.to(link, {
        scale: 1,
        duration: 0.25,
        ease: "power3.out",
        overwrite: true,
      })
    }

    link.addEventListener("mouseenter", handleMouseEnter)
    link.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      link.removeEventListener("mouseenter", handleMouseEnter)
      link.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <Link
      ref={linkRef}
      href={href}
      className="block mb-2 text-4xl md:text-6xl lg:text-8xl font-black leading-tight cursor-pointer transition-all duration-300 transform-gpu"
      style={{
        background: gradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </Link>
  )
}

export default function WebGLHero() {
  const { isAuthenticated } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const intensityRef = useRef(1.0)
  const startTimeRef = useRef(Date.now())
  const animationFrameRef = useRef<number>(0)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const programRef = useRef<WebGLProgram | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Cap devicePixelRatio for performance
    const dpr = Math.min(window.devicePixelRatio, 2.0)
    
    const gl = canvas.getContext("webgl", { 
      alpha: false, 
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false
    })
    if (!gl) return
    glRef.current = gl

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const vert = createShader(gl.VERTEX_SHADER, vertexShader)
    const frag = createShader(gl.FRAGMENT_SHADER, fragmentShader)
    if (!vert || !frag) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    programRef.current = program

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, "position")
    const timeLoc = gl.getUniformLocation(program, "u_time")
    const resLoc = gl.getUniformLocation(program, "u_resolution")
    const mouseLoc = gl.getUniformLocation(program, "u_mouse")
    const intensityLoc = gl.getUniformLocation(program, "u_intensity")

    const resize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const animate = () => {
      const time = (Date.now() - startTimeRef.current) * 0.001
      
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.enableVertexAttribArray(posLoc)
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

      gl.uniform1f(timeLoc, time)
      gl.uniform2f(resLoc, gl.canvas.width, gl.canvas.height)
      gl.uniform2f(mouseLoc, mouseRef.current.x, mouseRef.current.y)
      gl.uniform1f(intensityLoc, intensityRef.current)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX * dpr
      mouseRef.current.y = (window.innerHeight - e.clientY) * dpr
      
      gsap.to(intensityRef, {
        current: 1.1,
        duration: 0.2,
        overwrite: true,
        onComplete: () => {
          gsap.to(intensityRef, {
            current: 1.0,
            duration: 0.8,
            ease: "power2.out"
          })
        }
      })
    }

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", handleMouseMove)
    resize()
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  const navLinks = [
    { text: "PRODUCTS", href: "/products", gradient: "linear-gradient(135deg, #ffffff, #888888)" },
    { text: "DASHBOARD", href: "/dashboard", gradient: "linear-gradient(135deg, #ffffff, #888888)" },
    { text: "FORUM", href: "/forum", gradient: "linear-gradient(135deg, #ffffff, #888888)" },
    !isAuthenticated && { text: "JOIN US", href: "/signup", gradient: "linear-gradient(135deg, #ffffff, #888888)" },
  ].filter(Boolean) as any[]

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-0 pointer-events-none opacity-80 z-0">
        <EtheralShadow
          color="rgba(0, 0, 0, 1)"
          animation={{ scale: 100, speed: 60 }}
          noise={{ opacity: 0.8, scale: 1.5 }}
          sizing="fill"
        />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-12 pointer-events-none">
        <div className="text-left mt-16 md:mt-20">
          <p className="text-white/60 text-sm md:text-base uppercase tracking-wider font-bold">
            Discover the best digital tools,
          </p>
          <p className="text-white text-sm md:text-base uppercase tracking-wider font-bold">
            Grow faster with CreatorHub
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end pointer-events-auto">
          <nav className="text-left mb-8 md:mb-0">
            {navLinks.map((link) => (
              <NavLink key={link.text} href={link.href} gradient={link.gradient}>
                {link.text}
              </NavLink>
            ))}
          </nav>

          <div className="text-right text-gray-400 text-xs md:text-sm max-w-xs backdrop-blur-md bg-white/[0.03] p-6 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <p className="mb-2 font-semibold text-white">Explore powerful tools,</p>
            <p className="mb-2 font-semibold text-white">templates, and resources</p>
            <p className="mb-4 text-gray-400">designed for creators and startups.</p>
            <p className="mb-6 text-gray-400">Start building faster today.</p>
            <p className="text-white font-bold text-lg tracking-tight">
              CreatorHub Marketplace
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export const Component = () => <WebGLHero />