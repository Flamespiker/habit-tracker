// 'use client' required: renders interactive filter buttons with onClick event handlers.
"use client";

import { Button } from "@/components/ui/button";
import { Category, categoryColors, categoryLabels } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface CategoryFilterProps {
  selected: Category | "all";
  onSelect: (category: Category | "all") => void;
}

const categories: (Category | "all")[] = [
  "all",
  "health",
  "fitness",
  "mindfulness",
  "productivity",
  "learning",
];

/**
 * A row of pill buttons for filtering habits by category.
 * The active category is highlighted; "All" shows all habits.
 */
export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isAll = category === "all";
        const isSelected = selected === category;
        const colors = isAll ? null : categoryColors[category];

        return (
          <Button
            key={category}
            variant="ghost"
            onClick={() => onSelect(category)}
            className={cn(
              "h-auto rounded-full px-3 py-1.5 text-sm font-medium",
              isSelected
                ? isAll
                  ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                  : cn(
                      colors?.bg,
                      colors?.text,
                      colors?.border,
                      "border hover:opacity-90",
                    )
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {isAll ? "All" : categoryLabels[category]}
          </Button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
