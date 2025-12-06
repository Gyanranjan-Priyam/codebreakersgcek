"use client";

import { useEffect, useRef } from "react";

const HackerTerminal = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Terminal lines
    const lines: Array<{
      text: string;
      x: number;
      y: number;
      speed: number;
      opacity: number;
      glitchOffset: number;
      color: string;
    }> = [];

    const colors = [
      "#00ff00", // Classic green
      "#00ff41", // Bright green
      "#39ff14", // Neon green
      "#0f0",    // Short green
      "#0f0",    // Short green
      "#00ff88", // Cyan-green
    ];

    // Create initial lines
    for (let i = 0; i < 20; i++) {
      lines.push({
        text: "",
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.3 + Math.random() * 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        glitchOffset: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Matrix-style characters
    const matrixChars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const matrixColumns = Math.floor(canvas.width / 20);
    const matrixDrops: number[] = [];
    
    for (let i = 0; i < matrixColumns; i++) {
      matrixDrops[i] = Math.random() * canvas.height;
    }

    let frame = 0;
    let glitchTime = 0;

    const animate = () => {
      // Fade effect with transparency
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frame++;
      glitchTime++;

      // Random glitch effect
      const shouldGlitch = Math.random() < 0.02;

      // Draw matrix rain (subtle)
      if (frame % 2 === 0) {
        ctx.font = "14px monospace";
        for (let i = 0; i < matrixDrops.length; i++) {
          const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
          ctx.fillStyle = `rgba(0, 255, 65, ${Math.random() * 0.25 + 0.1})`;
          ctx.fillText(char, i * 20, matrixDrops[i]);

          if (matrixDrops[i] > canvas.height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
          }
          matrixDrops[i] += 0.5;
        }
      }

      // Draw terminal lines
      lines.forEach((line) => {
        // Update position
        line.y += line.speed;

        // Random glitch
        if (shouldGlitch) {
          line.glitchOffset = (Math.random() - 0.5) * 10;
        } else if (glitchTime % 60 === 0) {
          line.glitchOffset = 0;
        }

        // Flicker opacity
        if (Math.random() < 0.1) {
          line.opacity = Math.random() * 0.3 + 0.1;
        }

        // Draw text with glitch effect (only if text exists)
        if (line.text) {
          ctx.font = "16px 'Courier New', monospace";
          ctx.fillStyle = line.color.replace(")", `, ${line.opacity})`).replace("rgb", "rgba");
          
          // Main text
          ctx.fillText(line.text, line.x + line.glitchOffset, line.y);

          // Glitch duplicate (occasional)
          if (shouldGlitch && Math.random() < 0.3) {
            ctx.fillStyle = `rgba(255, 0, 0, ${line.opacity * 0.5})`;
            ctx.fillText(line.text, line.x + line.glitchOffset + 2, line.y + 1);
            ctx.fillStyle = `rgba(0, 255, 255, ${line.opacity * 0.5})`;
            ctx.fillText(line.text, line.x + line.glitchOffset - 2, line.y - 1);
          }
        }

        // Reset when off screen
        if (line.y > canvas.height + 50) {
          line.y = -20;
          line.x = Math.random() * canvas.width;
          line.text = "";
          line.color = colors[Math.floor(Math.random() * colors.length)];
        }
      });

      // Scan line effect
      if (frame % 180 < 90) {
        const scanY = (frame % 180) * (canvas.height / 90);
        ctx.fillStyle = "rgba(0, 255, 0, 0.02)";
        ctx.fillRect(0, scanY, canvas.width, 2);
      }

      // Random noise/glitch blocks
      if (shouldGlitch) {
        for (let i = 0; i < 3; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const w = Math.random() * 200 + 50;
          const h = Math.random() * 5 + 2;
          ctx.fillStyle = `rgba(0, 255, 0, ${Math.random() * 0.1})`;
          ctx.fillRect(x, y, w, h);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        background: "linear-gradient(to bottom, #000000, #001a00, #000000)",
      }}
    />
  );
};

export default HackerTerminal;
