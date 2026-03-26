import React, { useState, useRef, useEffect } from "react";
import { ArrowIcon, CircleIcon, DropdownArrowIcon, LineIcon, RulerIcon, SquareIcon, TableRulerIcon } from "../../icons";

interface Tool {
    id: string;
    icon: React.ReactNode;
    label: string;
    hasDropdown?: boolean;
}

interface ToolBoxProps {
    tools: Tool[];
    onToolClick?: (toolId: string, option?: string) => void;
}

const ToolBox: React.FC<ToolBoxProps> = ({ tools, onToolClick }) => {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToolClick = (toolId: string, option?: string) => {
        if (toolId === 'color' || toolId === 'shape' || toolId === 'scale') {
            setActiveDropdown(activeDropdown === toolId ? null : toolId);
        } else {
            if (onToolClick) {
                onToolClick(toolId, option);
            }
            setActiveDropdown(null);
        }
    };

    const handleOptionClick = (toolId: string, option: string) => {
        if (onToolClick) {
            onToolClick(toolId, option);
        }
        setActiveDropdown(null);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderColorDropdown = () => (
        <div className="absolute flex  items-center  justify-center top-full w-[36px] h-[128px] mt-1 mr-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="flex flex-col gap-2">
                {['#F00000', '#00F040', '#00E0F0', '#F000C4'].map((color) => (
                    <button
                        key={color}
                        onClick={() => handleOptionClick('color', color)}
                        className="w-[18px] h-[18px] rounded-full hover:border-gray-500 transition-colors"
                        style={{ backgroundColor: color }}
                        title={color}
                    />
                ))}
            </div>
        </div>
    );

    const renderShapeDropdown = () => (
        <div className="absolute flex  items-center  justify-center top-full w-[36px] h-[128px] mt-1 mr-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="flex flex-col gap-3 justify-center items-center">
                <button
                    onClick={() => handleOptionClick('shape', 'rectangle')}
                    className="flex items-center justify-center rounded transition-colors"
                    title="Rectangle"
                >
                    <SquareIcon />
                </button>
                <button
                    onClick={() => handleOptionClick('shape', 'circle')}
                    className="flex items-center justify-center rounded transition-colors"
                    title="Circle"
                >
                    <CircleIcon />
                </button>
                <button
                    onClick={() => handleOptionClick('shape', 'line')}
                    className="flex items-center justify-center rounded transition-colors"
                    title="Line"
                >
                    <ArrowIcon />
                </button>
                <button
                    onClick={() => handleOptionClick('shape', 'line')}
                    className="flex items-center justify-center rounded transition-colors"
                    title="Line"
                >
                    <LineIcon />
                </button>
            </div>
        </div>
    );

    const renderScaleDropdown = () => (
        <div className="absolute flex  items-center  justify-center top-full w-[36px] h-[68px] mt-1 mr-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="flex flex-col">
                <button
                    onClick={() => handleOptionClick('scale', 'ruler')}
                    className="flex items-center justify-center p-2 rounded transition-colors"
                    title="Ruler"
                >
                    <RulerIcon />
                </button>
                <button
                    onClick={() => handleOptionClick('scale', 'measure')}
                    className="flex items-center justify-center p-2 rounded transition-colors"
                    title="Measure"
                >
                    <TableRulerIcon />
                </button>
            </div>
        </div>
    );

    return (
        <div ref={dropdownRef} className="relative hidden lg:flex justify-center items-center px-2 border-[#DDDDDD] border-[1px] rounded-md h-[44px] w-auto m-auto gap-2">
            {/* Separator Icon */}
            <svg
                width="7"
                height="11"
                viewBox="0 0 7 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.53125 1.64062C0.53125 1.52367 0.554287 1.40785 0.599045 1.2998C0.643803 1.19174 0.709406 1.09356 0.792108 1.01086C0.87481 0.928156 0.972992 0.862553 1.08105 0.817795C1.1891 0.773037 1.30492 0.75 1.42188 0.75C1.53883 0.75 1.65465 0.773037 1.7627 0.817795C1.87076 0.862553 1.96894 0.928156 2.05164 1.01086C2.13434 1.09356 2.19995 1.19174 2.24471 1.2998C2.28946 1.40785 2.3125 1.52367 2.3125 1.64062C2.3125 1.87683 2.21867 2.10337 2.05164 2.27039C1.88462 2.43742 1.65808 2.53125 1.42188 2.53125C1.18567 2.53125 0.959132 2.43742 0.792108 2.27039C0.625083 2.10337 0.53125 1.87683 0.53125 1.64062ZM4.6875 1.64062C4.6875 1.40442 4.78133 1.17788 4.94836 1.01086C5.11538 0.843833 5.34192 0.75 5.57812 0.75C5.81433 0.75 6.04087 0.843833 6.20789 1.01086C6.37492 1.17788 6.46875 1.40442 6.46875 1.64062C6.46875 1.87683 6.37492 2.10337 6.20789 2.27039C6.04087 2.43742 5.81433 2.53125 5.57812 2.53125C5.34192 2.53125 5.11538 2.43742 4.94836 2.27039C4.78133 2.10337 4.6875 1.87683 4.6875 1.64062ZM0.53125 5.49406C0.53125 5.3771 0.554287 5.26129 0.599045 5.15323C0.643803 5.04518 0.709406 4.947 0.792108 4.8643C0.87481 4.78159 0.972992 4.71599 1.08105 4.67123C1.1891 4.62647 1.30492 4.60344 1.42188 4.60344C1.53883 4.60344 1.65465 4.62647 1.7627 4.67123C1.87076 4.71599 1.96894 4.78159 2.05164 4.8643C2.13434 4.947 2.19995 5.04518 2.24471 5.15323C2.28946 5.26129 2.3125 5.3771 2.3125 5.49406C2.3125 5.73027 2.21867 5.95681 2.05164 6.12383C1.88462 6.29085 1.65808 6.38469 1.42188 6.38469C1.18567 6.38469 0.959132 6.29085 0.792108 6.12383C0.625083 5.95681 0.53125 5.73027 0.53125 5.49406ZM4.6875 5.49406C4.6875 5.25785 4.78133 5.03132 4.94836 4.8643C5.11538 4.69727 5.34192 4.60344 5.57812 4.60344C5.81433 4.60344 6.04087 4.69727 6.20789 4.8643C6.37492 5.03132 6.46875 5.25785 6.46875 5.49406C6.46875 5.73027 6.37492 5.95681 6.20789 6.12383C6.04087 6.29085 5.81433 6.38469 5.57812 6.38469C5.34192 6.38469 5.11538 6.29085 4.94836 6.12383C4.78133 5.95681 4.6875 5.73027 4.6875 5.49406ZM0.53125 9.35938C0.53125 9.24242 0.554287 9.1266 0.599045 9.01855C0.643803 8.91049 0.709406 8.81231 0.792108 8.72961C0.87481 8.64691 0.972992 8.5813 1.08105 8.53655C1.1891 8.49179 1.30492 8.46875 1.42188 8.46875C1.53883 8.46875 1.65465 8.49179 1.7627 8.53655C1.87076 8.5813 1.96894 8.64691 2.05164 8.72961C2.13434 8.81231 2.19995 8.91049 2.24471 9.01855C2.28946 9.1266 2.3125 9.24242 2.3125 9.35938C2.3125 9.59558 2.21867 9.82212 2.05164 9.98914C1.88462 10.1562 1.65808 10.25 1.42188 10.25C1.18567 10.25 0.959132 10.1562 0.792108 9.98914C0.625083 9.82212 0.53125 9.59558 0.53125 9.35938ZM4.6875 9.35938C4.6875 9.12317 4.78133 8.89663 4.94836 8.72961C5.11538 8.56258 5.34192 8.46875 5.57812 8.46875C5.81433 8.46875 6.04087 8.56258 6.20789 8.72961C6.37492 8.89663 6.46875 9.12317 6.46875 9.35938C6.46875 9.59558 6.37492 9.82212 6.20789 9.98914C6.04087 10.1562 5.81433 10.25 5.57812 10.25C5.34192 10.25 5.11538 10.1562 4.94836 9.98914C4.78133 9.82212 4.6875 9.59558 4.6875 9.35938Z"
                    fill="#C2C1C1"
                />
            </svg>

            {/* Tool Buttons */}
            {tools.map((tool) => (
                <div key={tool.id} className="relative">
                    <button
                        onClick={() => handleToolClick(tool.id)}
                        className={`p-2 hover:bg-gray-100 rounded transition-colors flex items-center justify-center relative ${activeDropdown === tool.id ? 'bg-gray-100' : ''}`}
                        aria-label={tool.label}
                        title={tool.label}
                    >
                        <span className="flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4 relative">
                            {tool.icon}

                            {/* Dropdown arrow */}
                            {tool.hasDropdown && (
                                <span className="absolute bottom-1 right-1 w-3 h-3 flex items-center justify-center pointer-events-none">
                                    <DropdownArrowIcon />
                                </span>

                            )}
                        </span>
                    </button>

                    {/* Render dropdowns */}
                    {activeDropdown === tool.id && tool.id === 'color' && renderColorDropdown()}
                    {activeDropdown === tool.id && tool.id === 'shape' && renderShapeDropdown()}
                    {activeDropdown === tool.id && tool.id === 'scale' && renderScaleDropdown()}
                </div>
            ))}

        </div>
    );
};

export default ToolBox;