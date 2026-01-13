
import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    onChange: (value: number) => void;
    className?: string;
}

export const Slider = ({ value, min = 0, max = 100, step = 1, onChange, className }: SliderProps) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                <div
                    className="absolute h-full bg-blue-600 transition-all duration-150 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div
                className="absolute h-5 w-5 rounded-full border-2 border-blue-600 bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                style={{ left: `calc(${percentage}% - 10px)` }}
            />
        </div>
    );
};
