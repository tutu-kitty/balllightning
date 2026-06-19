import React, { useEffect, useRef, useState } from "react";
import { audioSynth } from "../utils/audio";

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  noiseX: number;
  noiseY: number;
}

export interface Ball {
  id: string;
  x: number;
  y: number;
  z: number; // 2.5D depth: 0 is far, 1 is close (window foreground)
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  state: "unexcited" | "excited" | "observed";
  color: "orange" | "blue" | "purple";
  life: number; // 1 to 0
  decayRate: number;
  particles: Particle[];
  trail: { x: number; y: number; life: number }[];
}

interface LightningBranch {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface RainyDrop {
  x: number;
  y: number;
  speed: number;
  len: number;
  opacity: number;
}

interface WindowSplash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

interface CanvasProps {
  isWindowOpen: boolean;
  magneticFieldOn: boolean;
  onBallsUpdated: (balls: Ball[]) => void;
  triggerLightningFlash: boolean;
  setTriggerLightningFlash: (v: boolean) => void;
}

export default function BallLightningCanvas({
  isWindowOpen,
  magneticFieldOn,
  onBallsUpdated,
  triggerLightningFlash,
  setTriggerLightningFlash,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const flashIntensityRef = useRef<number>(0);
  const lightningBranchesRef = useRef<LightningBranch[]>([]);
  const windowDropsRef = useRef<WindowSplash[]>([]); // Raindrops currently sliding on the window pane

  // Ambient rain drops (full screen falling)
  const rainDropsRef = useRef<RainyDrop[]>([]);

  // Track hover/observe state
  const [hoveredBallId, setHoveredBallId] = useState<string | null>(null);
  const hoveredBallIdRef = useRef<string | null>(null);

  // Screen resize dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update hovered ref
  useEffect(() => {
    hoveredBallIdRef.current = hoveredBallId;
  }, [hoveredBallId]);

  // Initial populate raindrops and size matching
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const rect = canvasRef.current.parentElement.getBoundingClientRect();
        setDimensions({
          width: rect.width || window.innerWidth,
          height: rect.height || window.innerHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Initialize 60 rain particles
    const rain: RainyDrop[] = [];
    for (let i = 0; i < 70; i++) {
      rain.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        speed: 10 + Math.random() * 12,
        len: 15 + Math.random() * 20,
        opacity: 0.15 + Math.random() * 0.3,
      });
    }
    rainDropsRef.current = rain;

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Sync state to parent on updates
  const updateBallsParent = (updated: Ball[]) => {
    onBallsUpdated([...updated]);
  };

  // Generate a random Ball Lightning
  const spawnBall = (width: number, height: number) => {
    if (ballsRef.current.length >= 4) return;

    const colors: ("orange" | "blue" | "purple")[] = ["orange", "blue", "purple"];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    // State probability
    const stateRand = Math.random();
    const state: Ball["state"] = stateRand < 0.1 ? "unexcited" : "excited";

    // 20-30cm diameter -> we map 30 to 50px
    const size = 30 + Math.random() * 15;

    // Outer quantum orbit particles inside Ball Lightning
    const particlesCount = 20 + Math.floor(Math.random() * 15);
    const particles: Particle[] = Array.from({ length: particlesCount }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 0.9,
      speed: (0.02 + Math.random() * 0.04) * (Math.random() > 0.5 ? 1 : -1),
      size: 1 + Math.random() * 2,
      noiseX: Math.random() * 0.1,
      noiseY: Math.random() * 0.1,
    }));

    // Spawn far away in the storm sky (small Z value, moving outward)
    const newBall: Ball = {
      id: "ball_" + Math.random().toString(36).substr(2, 9),
      x: width * 0.2 + Math.random() * width * 0.6,
      y: height * 0.15 + Math.random() * height * 0.35,
      z: 0.1, // starts small & far away
      targetX: width * 0.3 + Math.random() * width * 0.4,
      targetY: height * 0.3 + Math.random() * height * 0.4,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1,
      vz: 0.003 + Math.random() * 0.004, // slowly comes closer in 3D
      size,
      state,
      color: chosenColor,
      life: 1.0,
      // Purple lives longer as specified in the rules
      decayRate: chosenColor === "purple" ? 0.0021 : 0.0038 + Math.random() * 0.0015,
      particles,
      trail: [],
    };

    ballsRef.current.push(newBall);
    updateBallsParent(ballsRef.current);
  };

  // Generate procedural lightning tree branch
  const generateLightning = (width: number, height: number) => {
    const startX = width * 0.2 + Math.random() * width * 0.6;
    const branches: LightningBranch[] = [];

    const segments = 15;
    let curX = startX;
    let curY = 0;

    for (let i = 0; i < segments; i++) {
      const nextY = (height * 0.75 * (i + 1)) / segments;
      const nextX = curX + (Math.random() - 0.5) * 60;
      branches.push({ x1: curX, y1: curY, x2: nextX, y2: nextY });

      // Occasional extra fork
      if (Math.random() < 0.25) {
        const forkX = nextX + (Math.random() - 0.5) * 80;
        const forkY = nextY + (Math.random() * 40 + 20);
        branches.push({ x1: nextX, y1: nextY, x2: forkX, y2: forkY });
      }

      curX = nextX;
      curY = nextY;
    }

    lightningBranchesRef.current = branches;
    flashIntensityRef.current = 1.0;
    audioSynth.playThunder();

    // Spawn ball lightning sometimes when lightning strikes!
    if (magneticFieldOn && Math.random() < 0.8) {
      setTimeout(() => {
        spawnBall(width, height);
      }, 150);
    }
  };

  // Handle flash triggers from parent (or interval)
  useEffect(() => {
    if (triggerLightningFlash) {
      generateLightning(dimensions.width, dimensions.height);
      setTriggerLightningFlash(false);
    }
  }, [triggerLightningFlash, dimensions]);

  // Periodic spawn checks when magnetic field is active
  useEffect(() => {
    let intervalId: number;
    if (magneticFieldOn) {
      intervalId = window.setInterval(() => {
        if (ballsRef.current.length < 4 && Math.random() < 0.25) {
          spawnBall(dimensions.width, dimensions.height);
        }
      }, 3500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [magneticFieldOn, dimensions]);

  // Click / observe event handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mX = e.clientX - rect.left;
    const mY = e.clientY - rect.top;

    let clickedBall: Ball | null = null;
    let clickedDist = Infinity;

    // Check click hit on balls
    ballsRef.current.forEach((b) => {
      const currentRadius = b.size * (0.4 + b.z * 1.2);
      const dx = b.x - mX;
      const dy = b.y - mY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < currentRadius + 15) {
        if (dist < clickedDist) {
          clickedBall = b;
          clickedDist = dist;
        }
      }
    });

    if (clickedBall) {
      const ball = clickedBall as Ball;
      ball.state = "observed";
      setHoveredBallId(ball.id);
      audioSynth.playQuantumSparkle();
      updateBallsParent(ballsRef.current);
    }
  };

  const handleMouseUp = () => {
    ballsRef.current.forEach((b) => {
      if (b.state === "observed") {
        b.state = "excited";
      }
    });
    setHoveredBallId(null);
    updateBallsParent(ballsRef.current);
  };

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      const w = dimensions.width;
      const h = dimensions.height;

      canvas.width = w;
      canvas.height = h;

      // 1. Draw Background Sky (Dark stormy color, flashes white when thunder occurs)
      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, w, h);

      if (flashIntensityRef.current > 0.05) {
        // Full flash effect
        const opacity = flashIntensityRef.current;
        ctx.fillStyle = `rgba(215, 230, 255, ${opacity * 0.7})`;
        ctx.fillRect(0, 0, w, h);

        // Render branching lightning trails
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.shadowBlur = 30;
        ctx.shadowColor = "#cae3ff";
        ctx.lineWidth = 3 + opacity * 4;
        ctx.beginPath();
        lightningBranchesRef.current.forEach((b) => {
          ctx.moveTo(b.x1, b.y1);
          ctx.lineTo(b.x2, b.y2);
        });
        ctx.stroke();

        ctx.shadowBlur = 0; // reset
        flashIntensityRef.current *= 0.91; // flash decay
      }

      // Audio frequency ball tracking
      audioSynth.setBallLightningCount(ballsRef.current.length);

      // 2. Draw Wind Rain falling outdoors
      ctx.strokeStyle = "rgba(125, 150, 190, 0.28)";
      ctx.lineWidth = 1;
      rainDropsRef.current.forEach((drop) => {
        // Move drops diagonally with wind
        drop.y += drop.speed;
        drop.x -= 2.6; // wind lean

        if (drop.y > h || drop.x < -30) {
          drop.y = -20;
          drop.x = Math.random() * w + 50;
        }

        ctx.strokeStyle = `rgba(165, 190, 220, ${drop.opacity})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 4, drop.y + drop.len);
        ctx.stroke();
      });

      // 3. Spawning / moving Window Splashes (droplets scrolling/dripping)
      if (Math.random() < 0.12) {
        windowDropsRef.current.push({
          x: Math.random() * w,
          y: Math.random() * (h * 0.8),
          vx: (Math.random() - 0.5) * 0.15,
          vy: 0.5 + Math.random() * 1.5,
          life: 1.0,
          size: 1 + Math.random() * 2,
        });
      }

      // Draw glass water droplets
      ctx.fillStyle = "rgba(235, 245, 255, 0.42)";
      windowDropsRef.current.forEach((drop, i) => {
        drop.y += drop.vy;
        drop.x += drop.vx;

        // Path drawing representing dripping water trails
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.size * (1 + (1 - drop.life) * 0.5), 0, Math.PI * 2);
        ctx.fill();

        drop.size *= 0.995;
        if (drop.y > h) {
          windowDropsRef.current.splice(i, 1);
        }
      });

      // 4. Update and Render Ball Lightnings
      const currentBalls = ballsRef.current;
      ballsRef.current = currentBalls.filter((b) => {
        // Check magnet switch logic
        if (!magneticFieldOn) {
          // If magnetic confinement is lost, balls rapidly decay and burst
          b.life -= 0.015;
        } else {
          b.life -= b.decayRate;
        }

        if (b.life <= 0) {
          return false; // delete dead ball
        }

        // Motion physics: move via chaotic organic forces (Bézier-like floating noise)
        b.z += b.vz; // slowly approach Foreground
        if (b.z > 1.1) {
          // Wrap or sparkle escape
          b.vz = -b.vz * 0.5;
        }

        // Floating targets
        const targetWeight = 0.018;
        b.vx += (b.targetX - b.x) * targetWeight + (Math.random() - 0.5) * 0.45;
        b.vy += (b.targetY - b.y) * targetWeight + (Math.random() - 0.5) * 0.45;

        // Speed limit
        const maxV = 2.4;
        const curSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (curSpeed > maxV) {
          b.vx = (b.vx / curSpeed) * maxV;
          b.vy = (b.vy / curSpeed) * maxV;
        }

        b.x += b.vx;
        b.y += b.vy;

        // Periodic target redirection
        if (Math.random() < 0.02) {
          b.targetX = w * 0.2 + Math.random() * w * 0.6;
          b.targetY = h * 0.2 + Math.random() * h * 0.6;
        }

        // Maintain trail positions
        b.trail.unshift({ x: b.x, y: b.y, life: 1.0 });
        if (b.trail.length > 25) {
          b.trail.pop();
        }

        // Render current Ball
        const pulse = 1 + Math.sin(Date.now() * 0.006) * 0.045;
        const currentRadius = b.size * (0.5 + b.z * 0.8) * pulse;

        // Draw trail (neon light dragging tail)
        if (b.state === "excited" || b.state === "observed") {
          ctx.beginPath();
          ctx.lineWidth = currentRadius * 0.24 * b.life;
          const gradientColor = b.color === "orange" ? "245, 110, 50" : b.color === "blue" ? "30, 144, 255" : "155, 60, 235";
          
          b.trail.forEach((t, index) => {
            const trailOpacity = (1 - index / b.trail.length) * 0.22 * b.life;
            ctx.strokeStyle = `rgba(${gradientColor}, ${trailOpacity})`;
            if (index === 0) {
              ctx.moveTo(t.x, t.y);
            } else {
              ctx.lineTo(t.x, t.y);
            }
          });
          ctx.stroke();
        }

        // Check if under observation (clicked state)
        const isObserved = b.state === "observed";

        // BALL GLOW GRADIENT
        const radGrad = ctx.createRadialGradient(
          b.x,
          b.y,
          currentRadius * 0.05,
          b.x,
          b.y,
          currentRadius
        );

        if (b.state === "unexcited") {
          // Near-invisible, transparent soap bubble style
          radGrad.addColorStop(0, "rgba(220, 230, 240, 0.01)");
          radGrad.addColorStop(0.7, "rgba(200, 210, 220, 0.06)");
          radGrad.addColorStop(1, "rgba(220, 235, 255, 0.28)");

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius, 0, Math.PI * 2);
          ctx.fill();

          // Fragile white halo rim
          ctx.strokeStyle = `rgba(230, 240, 255, ${0.3 * b.life})`;
          ctx.lineWidth = 1;
          ctx.stroke();

        } else if (b.state === "excited") {
          // Rich color, pulsar, galaxy star cluster interior
          const rgb = b.color === "orange" ? "255, 95, 30" : b.color === "blue" ? "0, 190, 255" : "180, 50, 255";
          const coreRgb = b.color === "orange" ? "255, 240, 210" : b.color === "blue" ? "220, 245, 255" : "250, 225, 255";

          radGrad.addColorStop(0, `rgba(${coreRgb}, ${0.85 * b.life})`);
          radGrad.addColorStop(0.3, `rgba(${rgb}, ${0.60 * b.life})`);
          radGrad.addColorStop(0.7, `rgba(${rgb}, ${0.22 * b.life})`);
          radGrad.addColorStop(1, `rgba(${rgb}, 0)`);

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius, 0, Math.PI * 2);
          ctx.fill();

          // Render interior galaxy orbital particles
          ctx.fillStyle = `rgba(${coreRgb}, ${b.life * 0.9})`;
          b.particles.forEach((p) => {
            p.angle += p.speed; // rotate
            // add subtle physics jitter
            p.noiseX = Math.sin(Date.now() * 0.005 + p.angle) * 3;
            p.noiseY = Math.cos(Date.now() * 0.0053 + p.angle) * 3;

            const orbitRadius = currentRadius * p.radius;
            const px = b.x + Math.cos(p.angle) * orbitRadius + p.noiseX;
            const py = b.y + Math.sin(p.angle) * orbitRadius + p.noiseY;

            ctx.beginPath();
            ctx.arc(px, py, p.size * (0.6 + b.z * 0.5), 0, Math.PI * 2);
            ctx.fill();
          });

          // Outer plasma boundary
          ctx.strokeStyle = `rgba(${rgb}, ${0.4 * b.life})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius * 0.88, 0, Math.PI * 2);
          ctx.stroke();

        } else if (isObserved) {
          // Collapse form: Perfectly sharp circle, glowing high intensity white gold/electric neon
          const rgb = "255, 223, 70"; // gold quantum state
          const coreRgb = "255, 255, 255";

          // Radial bright flash
          ctx.shadowBlur = 40;
          ctx.shadowColor = "rgba(255, 215, 0, 0.9)";

          radGrad.addColorStop(0, `rgba(${coreRgb}, ${1.0 * b.life})`);
          radGrad.addColorStop(0.4, `rgba(${rgb}, ${0.8 * b.life})`);
          radGrad.addColorStop(0.8, `rgba(${rgb}, ${0.3 * b.life})`);
          radGrad.addColorStop(1, `rgba(${rgb}, 0)`);

          ctx.fillStyle = radGrad;
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius * 1.1, 0, Math.PI * 2);
          ctx.fill();

          // Concentric neat collapsed rings (deterministic, organized order!)
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 * b.life})`;
          ctx.shadowBlur = 0; // reset shadow for lines
          
          // Outer stable ring
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius * 0.8, 0, Math.PI * 2);
          ctx.stroke();

          // Intermediary stable track ring
          ctx.strokeStyle = `rgba(255, 223, 70, ${0.45 * b.life})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(b.x, b.y, currentRadius * 0.55, 0, Math.PI * 2);
          ctx.stroke();

          // Locked particles orbiting cleanly on track
          ctx.fillStyle = "#ffffff";
          b.particles.forEach((p, idx) => {
            // align particles precisely to 3 orbital ring tracks based on index to demonstrate wave-collapse
            const trackRadius = currentRadius * (idx % 3 === 0 ? 0.8 : idx % 3 === 1 ? 0.55 : 0.3);
            p.angle += Math.abs(p.speed) * 0.5; // stable, non-chaotic spin
            
            const px = b.x + Math.cos(p.angle) * trackRadius;
            const py = b.y + Math.sin(p.angle) * trackRadius;

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw observation energy laser flares (spikes)
          ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
          ctx.lineWidth = 1;
          for (let deg = 0; deg < 360; deg += 45) {
            const rad = (deg * Math.PI) / 180;
            ctx.beginPath();
            ctx.moveTo(b.x + Math.cos(rad) * (currentRadius * 0.85), b.y + Math.sin(rad) * (currentRadius * 0.85));
            ctx.lineTo(b.x + Math.cos(rad) * (currentRadius * 1.3), b.y + Math.sin(rad) * (currentRadius * 1.3));
            ctx.stroke();
          }
        }

        return true;
      });

      // Maintain callback to state tree
      onBallsUpdated([...ballsRef.current]);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, magneticFieldOn, listDepsButRefIsConstant()]);

  // Small utility helper to hook dependencies accurately without breaking ESLint
  function listDepsButRefIsConstant() {
    return 1;
  }

  return (
    <canvas
      id="ball-lightning-quantum-canvas"
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={(e) => {
        // Map touch events to click
        if (e.touches && e.touches[0]) {
          const t = e.touches[0];
          const mockEvent = {
            clientX: t.clientX,
            clientY: t.clientY,
          } as any;
          handleMouseDown(mockEvent);
        }
      }}
      onTouchEnd={handleMouseUp}
      className="absolute inset-0 block cursor-crosshair z-0 rounded-md overflow-hidden bg-black"
      style={{ touchAction: "none" }}
    />
  );
}
