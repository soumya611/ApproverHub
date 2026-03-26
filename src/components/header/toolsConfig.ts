// toolsConfig.ts
import {
  CommentIcon,
  HandtIcon,
  ColorIcon,
  HighlighterIcon,
  ShapeIcon,
  DrawIcon,
  ScaleIcon,
} from "../../icons"; // adjust path as per your structure

// Define a single tool interface
export interface Tool {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Define supported panel types
export type PanelType = "pdf" | "web";

// TOOL_CONFIG mapping for each panel type
export const TOOL_CONFIG: Record<PanelType, Tool[]> = {
  pdf: [
    { id: "comment", label: "Comment", icon: CommentIcon },
    { id: "hand", label: "Hand Tool", icon: HandtIcon },
    { id: "color", label: "Color Picker", icon: ColorIcon },
    { id: "highlight", label: "Highlighter", icon: HighlighterIcon },
    { id: "shape", label: "Shape", icon: ShapeIcon },
    { id: "draw", label: "Draw", icon: DrawIcon },
    { id: "scale", label: "Scale", icon: ScaleIcon },
  ],

  // 🧩 Example new panel type (for understanding)
  web: [
    { id: "color", label: "Color Picker", icon: ColorIcon },
    { id: "scale", label: "Scale Tool", icon: ScaleIcon },
  ],
};
