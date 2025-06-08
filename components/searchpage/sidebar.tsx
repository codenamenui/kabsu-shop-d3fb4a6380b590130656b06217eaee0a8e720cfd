import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Category, Shop } from "@/constants/type";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface SearchSidebarProps {
  handleCategoryChange: (categoryId: number) => void;
  selectedCategories: number[];
  categories: Category[];
  shops?: Shop[];
  handleShopChange?: (shopId: number) => void;
  selectedShops: number[];
  className?: string;
}

const SearchSidebar = ({
  handleCategoryChange,
  selectedCategories,
  categories,
  shops,
  selectedShops,
  handleShopChange,
  className,
}: SearchSidebarProps) => {
  const FilterSection = ({
    title,
    items,
    selectedItems,
    handleChange,
    getName,
    getId,
  }: {
    title: string;
    items: any[];
    selectedItems: number[];
    handleChange: (id: number) => void;
    getName: (item: any) => string;
    getId: (item: any) => number;
  }) => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground/80">{title}</h3>
      <ScrollArea className="pr-4">
        <div className="space-y-3">
          {items.map((item) => {
            const id = getId(item);
            const isSelected = selectedItems.includes(id);
            return (
              <div
                key={id}
                className={cn(
                  "group flex items-center space-x-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted",
                  isSelected && "bg-muted",
                )}
              >
                <Checkbox
                  id={`${title.toLowerCase()}-${id}`}
                  checked={isSelected}
                  onCheckedChange={() => handleChange(id)}
                  className="border-muted-foreground/30"
                />
                <label
                  htmlFor={`${title.toLowerCase()}-${id}`}
                  className={cn(
                    "cursor-pointer select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    isSelected && "text-foreground",
                    !isSelected && "text-muted-foreground",
                  )}
                >
                  {getName(item)}
                </label>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <aside className={cn("w-full space-y-6", className)}>
      <div className="space-y-6">
        <FilterSection
          title="Categories"
          items={categories}
          selectedItems={selectedCategories}
          handleChange={handleCategoryChange}
          getName={(item: Category) => item.name}
          getId={(item: Category) => item.id}
        />

        {handleShopChange && shops && shops.length > 0 && (
          <>
            <Separator className="my-4" />
            <FilterSection
              title="Shops"
              items={shops}
              selectedItems={selectedShops}
              handleChange={handleShopChange}
              getName={(item: Shop) => item.acronym}
              getId={(item: Shop) => item.id}
            />
          </>
        )}
      </div>
    </aside>
  );
};

export default SearchSidebar;
