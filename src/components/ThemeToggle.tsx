
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <Toggle
      pressed={theme === "dark"}
      onPressedChange={(pressed) => setTheme(pressed ? "dark" : "light")}
      className={cn("", className)}
      aria-label="Переключить тему"
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Toggle>
  );
};

export default ThemeToggle;
