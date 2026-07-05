import { useEffect, useRef, useState } from "react";
function CinematicIntro({ onComplete }) {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const hasPlayedRef = useRef(sessionStorage.getItem("cinematicIntroPlayed"));
  useEffect(() => {
    if (hasPlayedRef.current) {
      onComplete();
      return;
    }
    setShouldRender(true);
    sessionStorage.setItem("cinematicIntroPlayed", "true");
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.classList.add("intro-dissolve");
      }
      setTimeout(() => {
        setShouldRender(false);
        onComplete();
      }, 1e3);
    }, 6500);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!shouldRender || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    window.addEventListener("resize", () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });
    const particles = [];
    const particleCount = 100;
    const startTime = Date.now();
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5,
        targetX: width / 2,
        targetY: height / 2,
        phase: Math.random() * Math.PI * 2
      });
    }
    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const elapsed = Date.now() - startTime;
      particles.forEach((p, i) => {
        if (elapsed < 2e3) {
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
          ctx.fillStyle = `rgba(125, 211, 252, ${p.opacity * (elapsed / 1e3)})`;
        } else if (elapsed >= 2e3 && elapsed < 3500) {
          const dx = width / 2 - p.x;
          const dy = height / 2 - p.y;
          p.x += dx * 0.05;
          p.y += dy * 0.05;
          ctx.fillStyle = `rgba(125, 211, 252, ${Math.min(1, p.opacity * 2)})`;
        } else if (elapsed >= 3500 && elapsed < 6500) {
          const radius = 60 + Math.sin(p.phase + elapsed * 2e-3) * 10;
          const angle = p.phase + elapsed * 3e-3;
          p.x = width / 2 + Math.cos(angle) * radius * (i % 2 === 0 ? 1 : 1.5);
          p.y = height / 2 + Math.sin(angle) * radius * (i % 2 === 0 ? 1 : 1.5);
          p.x += (Math.random() - 0.5) * 2;
          p.y += (Math.random() - 0.5) * 2;
          ctx.fillStyle = `rgba(56, 189, 248, ${0.8})`;
        } else if (elapsed >= 6500) {
          const explosionProgress = (elapsed - 6500) / 1e3;
          const angle = p.phase;
          const force = (i % 5 + 1) * 20;
          p.x += Math.cos(angle) * force * 0.1;
          p.y += Math.sin(angle) * force * 0.1;
          ctx.fillStyle = `rgba(125, 211, 252, ${Math.max(0, 1 - explosionProgress)})`;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        if (elapsed > 3500) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#38bdf8";
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldRender]);
  if (!shouldRender) return null;
  return <div ref={containerRef} className="fixed inset-0 z-[9999] bg-[#030712] overflow-hidden intro-container pointer-events-none w-full h-[100vh] flex justify-center items-center">
      
      {
    /* Background Canvas for Particles */
  }
      <canvas ref={canvasRef} className="absolute inset-0 z-0 mix-blend-screen" />

      {
    /* Grid Lines */
  }
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-0 intro-grid" />

      {
    /* Scanning Lines */
  }
      <div className="absolute inset-0 z-0 opacity-0 intro-scanline pointer-events-none bg-[linear-gradient(to_bottom,transparent_0%,rgba(56,189,248,0.1)_50%,transparent_100%)] bg-[length:100%_10px]" />

      {
    /* Scene 1: System Messages */
  }
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center font-mono text-xs tracking-[0.2em] text-sky-400/80 z-10">
        <div className="intro-msg msg-1">INITIALIZING AI CORE...</div>
        <div className="intro-msg msg-2">VERIFYING SECURITY MATRIX...</div>
        <div className="intro-msg msg-3">CONNECTING RESIDENTIAL CLOUD...</div>
        <div className="intro-msg msg-4">LOADING AGENTIC ENGINE...</div>
      </div>

      {
    /* Scene 2 & 3: Energy Core & Shield */
  }
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center">
        
        {
    /* The Central Pulsing Particle -> Morphs into Shield */
  }
        <div className="intro-core">
          {
    /* Shield SVG drawing */
  }
          <svg className="intro-shield-svg w-24 h-24 drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="shield-path-left" d="M50 5 L10 20 L10 60 C10 90 50 115 50 115" stroke="url(#shield-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path className="shield-path-right" d="M50 5 L90 20 L90 60 C90 90 50 115 50 115" stroke="url(#shield-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
            </defs>
          </svg>
          <div className="shield-scan-beam" />
        </div>

      </div>

      {
    /* Scene 4 & 5: Name Reveal & Signature */
  }
      <div className="absolute top-[60%] left-1/2 -translate-x-1/2 flex flex-col items-center z-30 w-full max-w-lg">
        <div className="relative overflow-hidden w-full text-center py-2 intro-name-container">
           {
    /* Light sweep */
  }
           <div className="intro-light-sweep" />
           <div className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-bold mb-2 intro-crafted-by">
             Crafted By
           </div>
           
           <h1 className="text-3xl md:text-5xl font-black tracking-widest uppercase intro-name">
              <span className="intro-name-gradient">Ajai Venkatesh</span>
           </h1>
           
           <div className="text-xs md:text-sm text-sky-200/80 tracking-widest mt-3 font-light intro-subtitle">
             Architect of Intelligent Solutions
           </div>
           
           {
    /* Digital Signature Line */
  }
           <div className="mt-4 relative w-48 h-[2px] mx-auto intro-signature-wrap">
             <div className="absolute inset-0 bg-slate-800 rounded-full" />
             <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-indigo-400 to-teal-400 rounded-full intro-signature-line" />
             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_#fff,0_0_20px_#38bdf8] intro-signature-spark" />
           </div>
        </div>
      </div>

    </div>;
}
export {
  CinematicIntro as default
};
