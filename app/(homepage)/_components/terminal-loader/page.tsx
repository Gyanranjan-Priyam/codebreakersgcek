"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TextType from "@/components/TextType";

interface TerminalLoaderProps {
  onLoadingComplete?: () => void;
}

const TerminalLoaderPage = ({ onLoadingComplete }: TerminalLoaderProps = {}) => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInput, setShowInput] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const [invalidAttempt, setInvalidAttempt] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  // State to control sequential typing
  const [line0Complete, setLine0Complete] = useState(false);
  const [line1Complete, setLine1Complete] = useState(false);
  const [line2Complete, setLine2Complete] = useState(false);
  const [line3Complete, setLine3Complete] = useState(false);
  const [line4Complete, setLine4Complete] = useState(false);
  const [line5Complete, setLine5Complete] = useState(false);
  const [line6Complete, setLine6Complete] = useState(false);
  const [line8Complete, setLine8Complete] = useState(false);

  // Hacker background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Matrix-style characters
    const matrixChars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    let frame = 0;
    let skipFrames = 0;

    const animate = () => {
      skipFrames++;
      
      // Skip every other frame to slow down the animation
      if (skipFrames % 2 !== 0) {
        requestAnimationFrame(animate);
        return;
      }

      // Fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frame++;

      // Glitch effect
      const shouldGlitch = Math.random() < 0.03;

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Main character with varying opacity (darker/dimmer)
        const opacity = Math.random() * 0.25 + 0.1;
        ctx.fillStyle = `rgba(0, 180, 45, ${opacity})`;
        ctx.fillText(char, x, y);

        // Glitch effect - RGB split (dimmer)
        if (shouldGlitch && Math.random() < 0.1) {
          ctx.fillStyle = `rgba(180, 0, 0, ${opacity * 0.2})`;
          ctx.fillText(char, x + 2, y + 1);
          ctx.fillStyle = `rgba(0, 180, 180, ${opacity * 0.2})`;
          ctx.fillText(char, x - 2, y - 1);
        }

        // Occasionally reset to top
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }

      // Random glitch blocks (dimmer)
      if (shouldGlitch) {
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const w = Math.random() * 150 + 50;
          const h = Math.random() * 3 + 1;
          ctx.fillStyle = `rgba(0, 180, 0, ${Math.random() * 0.08})`;
          ctx.fillRect(x, y, w, h);
        }
      }

      // Scan line (dimmer)
      if (frame % 120 < 60) {
        const scanY = (frame % 120) * (canvas.height / 60);
        ctx.fillStyle = "rgba(0, 180, 0, 0.02)";
        ctx.fillRect(0, scanY, canvas.width, 2);
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // Sequential animation triggers
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    // Line 0: "Initializing CodeBreakers Website..." (39 chars * 50ms = ~2000ms)
    timers.push(setTimeout(() => setLine0Complete(true), 2000));
    
    // Line 1: "✓ Loading modules..." (20 chars * 50ms = ~1000ms)
    timers.push(setTimeout(() => setLine1Complete(true), 3100));
    
    // Line 2: "✓ Connecting to server..." (27 chars * 50ms = ~1350ms)
    timers.push(setTimeout(() => setLine2Complete(true), 4450));
    
    // Line 3: "✓ Authenticating user..." (26 chars * 50ms = ~1300ms)
    timers.push(setTimeout(() => setLine3Complete(true), 5850));
    
    // Line 4: "✓ Loading profile data..." (27 chars * 50ms = ~1350ms)
    timers.push(setTimeout(() => setLine4Complete(true), 7200));
    
    // Line 5: "✓ Establishing secure connection..." (38 chars * 50ms = ~1900ms)
    timers.push(setTimeout(() => setLine5Complete(true), 8600));
    
    // Line 6: "✓ System ready." (17 chars * 50ms = ~850ms)
    timers.push(setTimeout(() => setLine6Complete(true), 10550));
    
    // Line 8: "Welcome to CodeBreakers Terminal!" (34 chars * 50ms = ~1700ms)
    timers.push(setTimeout(() => setLine8Complete(true), 11650));
    
    // Line 9: "Type 'CodeBreakers' to enter the dashboard..." (47 chars * 50ms = ~2350ms)
    timers.push(setTimeout(() => setTypingComplete(true), 13400));
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Show input after typing completes
  useEffect(() => {
    if (typingComplete) {
      const timer = setTimeout(() => {
        setShowInput(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [typingComplete]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (userInput.toLowerCase() === "codebreakers") {
        setSuccessMessage(true);
        setShowInput(false);
        setTimeout(() => {
          if (onLoadingComplete) {
            onLoadingComplete();
          } else {
            router.push("/");
          }
        }, 1500);
      } else {
        setInvalidAttempt(true);
        setTimeout(() => {
          setInvalidAttempt(false);
          setUserInput("");
        }, 2000);
      }
    }
  };

  const handleSubmit = () => {
    if (userInput.toLowerCase() === "codebreakers") {
      setSuccessMessage(true);
      setShowInput(false);
      setTimeout(() => {
        if (onLoadingComplete) {
          onLoadingComplete();
        } else {
          router.push("/");
        }
      }, 1500);
    } else {
      setInvalidAttempt(true);
      setTimeout(() => {
        setInvalidAttempt(false);
        setUserInput("");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden gap-4 sm:gap-6">
      {/* Hacker Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          background: "linear-gradient(to bottom right, #000000, #001a00, #000000)",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 text-center flex flex-col items-center gap-3 sm:gap-4">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28">
          <Image
            src="/assets/logo.png"
            alt="CodeBreakers Logo"
            fill
            className="object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"
            priority
          />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-green-400 via-emerald-500 to-green-400 mb-1">
            CodeBreakers
          </h1>
          <p className="text-green-400/70 text-sm sm:text-base font-mono">Elite Developer Community of GCE Kalahandi</p>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-2xl relative z-10">{/* macOS Window */}
        <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-700">
          {/* macOS Title Bar */}
          <div className="bg-gray-700 px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 border-b border-gray-600">
            <div className="flex gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer"></div>
            </div>
            <div className="flex-1 text-center text-gray-300 text-xs sm:text-sm font-medium">
              CodeBreakers Terminal
            </div>
          </div>

          {/* Terminal Content */}
          <div className="bg-black p-3 sm:p-4 md:p-5 font-mono text-xs sm:text-sm min-h-[300px] sm:min-h-[350px] max-h-[50vh] overflow-y-auto">
            {/* Line 0 */}
            <div className="mb-1.5 sm:mb-2">
              <TextType
                text="Initializing CodeBreakers Website..."
                typingSpeed={50}
                textColors={["#4ade80"]}
                loop={false}
                showCursor={false}
              />
            </div>

            {/* Line 1 */}
            {line0Complete && (
              <div className="mb-1.5 sm:mb-2">
                <TextType
                  text="✓ Loading modules..."
                  typingSpeed={50}
                  textColors={["#4ade80"]}
                  loop={false}
                  showCursor={false}
                />
              </div>
            )}

            {/* Line 2 */}
            {line1Complete && (
              <div className="mb-1.5 sm:mb-2">
                <TextType
                  text="✓ Connecting to server..."
                  typingSpeed={50}
                  textColors={["#4ade80"]}
                  loop={false}
                  showCursor={false}
                />
              </div>
            )}

            {/* Line 3 */}
            {line2Complete && (
              <div className="mb-1.5 sm:mb-2">
                <TextType
                  text="✓ Authenticating user..."
                  typingSpeed={50}
                  textColors={["#4ade80"]}
                  loop={false}
                  showCursor={false}
                />
              </div>
            )}

            {/* Line 4 */}
            {line3Complete && (
              <div className="mb-1.5 sm:mb-2">
                <TextType
                  text="✓ Loading profile data..."
                  typingSpeed={50}
                  textColors={["#4ade80"]}
                  loop={false}
                  showCursor={false}
                />
              </div>
            )}

            {/* Line 5 */}
            {line4Complete && (
              <div className="mb-1.5 sm:mb-2">
                <TextType
                  text="✓ Establishing secure connection..."
                  typingSpeed={50}
                  textColors={["#4ade80"]}
                  loop={false}
                  showCursor={false}
                />
              </div>
            )}

            {/* Line 6 */}
            {line5Complete && (
              <div className="mb-1.5 sm:mb-2">
                <TextType
                  text="✓ System ready."
                  typingSpeed={50}
                  textColors={["#4ade80"]}
                  loop={false}
                  showCursor={false}
                />
              </div>
            )}

            {/* Line 7 - Empty line */}
            {line6Complete && <div className="mb-1.5 sm:mb-2 h-4"></div>}

            {/* Line 8 */}
            {line6Complete && (
              <div className="mb-1.5 sm:mb-2">
                <TextType
                  text="Welcome to CodeBreakers Terminal!"
                  typingSpeed={50}
                  textColors={["#facc15"]}
                  loop={false}
                  showCursor={false}
                />
              </div>
            )}

            {/* Line 9 */}
            {line8Complete && (
              <div className="mb-1.5 sm:mb-2">
                <TextType
                  text="Type 'CodeBreakers' to enter the dashboard..."
                  typingSpeed={50}
                  textColors={["#facc15"]}
                  loop={false}
                  showCursor={false}
                />
              </div>
            )}

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-1.5 sm:mb-2">
                <div className="text-blue-400">$ {userInput}</div>
                <TextType
                  text="Access granted! Redirecting..."
                  typingSpeed={30}
                  textColors={["#4ade80"]}
                  loop={false}
                  showCursor={false}
                />
              </div>
            )}

            {invalidAttempt && (
              <div className="mb-1.5 sm:mb-2">
                <div className="text-blue-400">$ {userInput}</div>
                <TextType
                  text="Invalid command. Please type 'CodeBreakers'."
                  typingSpeed={30}
                  textColors={["#f87171"]}
                  loop={false}
                  showCursor={false}
                />
              </div>
            )}

            {/* Input Line */}
            {showInput && !successMessage && !invalidAttempt && (
              <div className="flex items-center gap-1 sm:gap-2 mt-2">
                <span className="text-green-400 shrink-0">$</span>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="bg-transparent border-none outline-none text-gray-100 flex-1 font-mono min-w-0 w-full touch-manipulation text-base"
                  style={{ fontSize: '16px' }}
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  placeholder=""
                  inputMode="text"
                />
                <button
                  onClick={handleSubmit}
                  className="text-green-400 shrink-0 px-2 py-1 text-xs sm:text-sm border border-green-400/30 rounded hover:bg-green-400/10 active:bg-green-400/20 touch-manipulation"
                  type="button"
                >
                  Enter
                </button>
              </div>
            )}
          </div>

          {/* Bottom Status Bar */}
          <div className="bg-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between text-[10px] sm:text-xs text-gray-400 border-t border-gray-600">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline">Terminal v1.0</span>
              <span className="sm:inline hidden">•</span>
              <span>Ready</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Connected</span>
            </div>
          </div>
        </div>

        {/* Hint Text */}
        <div className="mt-4 sm:mt-6 text-center text-gray-400 text-xs sm:text-sm px-2">
          <p>Hint: Type "CodeBreakers" and press Enter</p>
        </div>
      </div>
    </div>
  );
};

export default TerminalLoaderPage;
