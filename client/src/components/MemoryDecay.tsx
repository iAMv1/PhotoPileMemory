
import { useRef, useEffect, useState } from "react";

interface MemoryDecayProps {
    imageSrc: string;
    width?: number;
    height?: number;
    onReveal?: () => void;
    revealThreshold?: number; // Percentage of scratched area to trigger reveal
}

export function MemoryDecay({
    imageSrc,
    width = 300,
    height = 200,
    onReveal,
    revealThreshold = 50,
}: MemoryDecayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Create the "corruption" overlay
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, width, height);

        // Add noise/static pattern
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.random() * 50;
            data[i] = data[i] + noise; // R
            data[i + 1] = data[i + 1] + noise; // G
            data[i + 2] = data[i + 2] + noise; // B
        }
        ctx.putImageData(imageData, 0, 0);

        // Add some glitch lines
        for (let i = 0; i < 20; i++) {
            const y = Math.random() * height;
            const lineHeight = Math.random() * 5 + 1;
            ctx.fillStyle = `rgba(255, 0, 0, ${Math.random() * 0.3})`;
            ctx.fillRect(0, y, width, lineHeight);
        }

        // Add "CORRUPTED" text
        ctx.font = "bold 16px monospace";
        ctx.fillStyle = "rgba(255, 0, 0, 0.6)";
        ctx.textAlign = "center";
        ctx.fillText("CORRUPTED DATA", width / 2, height / 2 - 10);
        ctx.font = "12px monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillText("Scratch to restore", width / 2, height / 2 + 15);

        // Set composite operation for "erasing"
        ctx.globalCompositeOperation = "destination-out";
    }, [width, height]);

    const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        let x, y;

        if ("touches" in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        return { x, y };
    };

    const scratch = (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();

        // Check reveal percentage
        checkRevealPercentage();
    };

    const checkRevealPercentage = () => {
        const canvas = canvasRef.current;
        if (!canvas || isRevealed) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        let transparent = 0;
        const total = data.length / 4;

        for (let i = 3; i < data.length; i += 4) {
            if (data[i] === 0) transparent++;
        }

        const percentage = (transparent / total) * 100;
        if (percentage >= revealThreshold) {
            setIsRevealed(true);
            if (navigator.vibrate) {
                navigator.vibrate([50, 30, 100]);
            }
            onReveal?.();
        }
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        const { x, y } = getPosition(e);
        scratch(x, y);
    };

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const { x, y } = getPosition(e);
        scratch(x, y);
    };

    const handleEnd = () => {
        setIsDrawing(false);
    };

    return (
        <div
            className="relative rounded-lg overflow-hidden shadow-lg"
            style={{ width, height }}
        >
            {/* The actual image underneath */}
            <img
                src={imageSrc}
                alt="Memory"
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Scratch canvas overlay */}
            {!isRevealed && (
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="absolute inset-0 cursor-crosshair touch-none"
                    onMouseDown={handleStart}
                    onMouseMove={handleMove}
                    onMouseUp={handleEnd}
                    onMouseLeave={handleEnd}
                    onTouchStart={handleStart}
                    onTouchMove={handleMove}
                    onTouchEnd={handleEnd}
                />
            )}

            {/* Revealed overlay */}
            {isRevealed && (
                <div className="absolute inset-0 flex items-end justify-center pb-2 pointer-events-none">
                    <span className="bg-green-500/80 text-white text-xs px-2 py-1 rounded-full">
                        ✓ Memory Restored
                    </span>
                </div>
            )}
        </div>
    );
}
