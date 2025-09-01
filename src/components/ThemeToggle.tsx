import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-9 h-9 p-0">
        <div className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      className="w-9 h-9 p-0 transition-all duration-300 hover:scale-105 bg-muted/50 hover:bg-muted/80 border border-primary/20 hover:border-primary/40"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors duration-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}