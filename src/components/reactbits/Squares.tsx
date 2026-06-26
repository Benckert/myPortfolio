// Custom canvas implementation — reactbits Squares source returned 404.
// Prop interface matches the brief contract: speed, squareSize, borderColor,
// plus optional direction and hoverFillColor.
import React, { useEffect, useRef } from 'react';

interface SquaresProps {
  speed?: number;
  squareSize?: number;
  borderColor?: string;
  direction?: 'diagonal' | 'up' | 'down' | 'left' | 'right';
  hoverFillColor?: string;
  className?: string;
}

const Squares: React.FC<SquaresProps> = ({
  speed = 0.5,
  squareSize = 40,
  borderColor = '#999',
  direction = 'diagonal',
  hoverFillColor = 'rgba(255,255,255,0.08)',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const offsetRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef({ col: -1, row: -1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const ox = ((offsetRef.current.x % squareSize) + squareSize) % squareSize;
      const oy = ((offsetRef.current.y % squareSize) + squareSize) % squareSize;
      hoverRef.current = {
        col: Math.floor((mx - ox + squareSize) / squareSize) - 1,
        row: Math.floor((my - oy + squareSize) / squareSize) - 1
      };
    };
    const handleMouseLeave = () => {
      hoverRef.current = { col: -1, row: -1 };
    };
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const offset = offsetRef.current;
      const ox = ((offset.x % squareSize) + squareSize) % squareSize;
      const oy = ((offset.y % squareSize) + squareSize) % squareSize;

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;

      let col = 0;
      for (let x = -squareSize + ox; x < width + squareSize; x += squareSize, col++) {
        let row = 0;
        for (let y = -squareSize + oy; y < height + squareSize; y += squareSize, row++) {
          if (hoverRef.current.col === col && hoverRef.current.row === row) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(x, y, squareSize, squareSize);
          }
          ctx.strokeRect(x, y, squareSize, squareSize);
        }
      }

      const delta = speed * 0.4;
      switch (direction) {
        case 'diagonal': offset.x -= delta; offset.y -= delta; break;
        case 'up':    offset.y -= delta; break;
        case 'down':  offset.y += delta; break;
        case 'left':  offset.x -= delta; break;
        case 'right': offset.x += delta; break;
      }

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [speed, squareSize, borderColor, direction, hoverFillColor]);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default Squares;
