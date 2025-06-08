"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { Merch, Shop, Category, FullShopInfo } from "@/constants/type";
import SearchSidebar from "@/components/searchpage/sidebar";
import ResultsDisplay from "@/components/searchpage/results";
import ShopDisplayCard from "@/components/shop-display";
import { Card } from "@/components/ui/card";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SearchPage = () => {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { shopId } = useParams();

  const [sort, setSort] = useState("date");
  const [merchandises, setMerchandises] = useState<Merch[]>([]);
  const [results, setResults] = useState<Merch[]>([]);
  const [shop, setShop] = useState<FullShopInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const categoryParam = searchParams.get("category");
  const query = searchParams.get("query");

  const filterMerchandises = (searchQuery: string, categoryIds: number[]) => {
    if (!merchandises?.length) {
      setResults([]);
      return;
    }

    let filteredResults = merchandises.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery?.toLowerCase() ?? "") &&
        item.shops.id.toString() === shopId.toString(),
    );

    if (categoryIds.length > 0) {
      filteredResults = filteredResults.filter((item) =>
        item.merchandise_categories?.some((category) =>
          categoryIds.includes(category.cat_id),
        ),
      );
    }

    filteredResults.sort((a, b) => {
      if (sort === "date") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      const priceA = a.variants[0]?.original_price || 0;
      const priceB = b.variants[0]?.original_price || 0;
      return sort === "ascending" ? priceA - priceB : priceB - priceA;
    });

    setResults(filteredResults);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [merchandiseData, categoryData, shopData] = await Promise.all([
          supabase
            .from("merchandises")
            .select(
              `
              id, 
              name, 
              created_at,
              ready,
              merchandise_pictures(picture_url), 
              variants(original_price, membership_price), 
              shops!inner(id, name, acronym),
              merchandise_categories(id, cat_id)
            `,
            )
            .returns<Merch[]>(),

          supabase.from("categories").select("id, name"),

          supabase
            .from("shops")
            .select(
              "id, name, email, socmed_url, logo_url, colleges(id, name), acronym",
            )
            .eq("id", shopId)
            .returns<FullShopInfo>()
            .single(),
        ]);

        setMerchandises(merchandiseData.data ?? []);
        setCategories(categoryData.data ?? []);
        setShop(shopData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  useEffect(() => {
    if (!merchandises.length) return;

    let categoryIds: number[] = [];
    if (categoryParam) {
      categoryIds = categoryParam.split(",").map(Number);
      setSelectedCategories(categoryIds);
    }

    filterMerchandises(
      query ?? "",
      categoryIds.length ? categoryIds : selectedCategories,
    );
  }, [merchandises, query, categoryParam, sort, shopId]);

  const handleCategoryChange = (categoryId: number) => {
    const updatedCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(updatedCategories);
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("category", updatedCategories.join(","));
    router.push(`/shop/${shopId}?${queryParams.toString()}`);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.delete("category");
    router.push(`/shop/${shopId}?${queryParams.toString()}`);
  };

  const getActiveFiltersCount = () => {
    return selectedCategories.length;
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Shop Information */}
        <ShopDisplayCard shop={shop} />

        {/* Header Section with Stats and Mobile Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {results.length} {results.length === 1 ? "product" : "products"}{" "}
              available
              {getActiveFiltersCount() > 0 &&
                ` • ${getActiveFiltersCount()} filters applied`}
            </p>
          </div>

          {/* Mobile Filters */}
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters{" "}
                  {getActiveFiltersCount() > 0 &&
                    `(${getActiveFiltersCount()})`}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <div className="py-6">
                  <SearchSidebar
                    handleCategoryChange={handleCategoryChange}
                    categories={categories}
                    selectedCategories={selectedCategories}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => setSort(sort === "date" ? "ascending" : "date")}
            >
              <ArrowUpDown className="h-4 w-4" />
              Sort
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-72">
            <div className="sticky top-8">
              <Card className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-semibold">Filters</h2>
                  {getActiveFiltersCount() > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                <SearchSidebar
                  handleCategoryChange={handleCategoryChange}
                  categories={categories}
                  selectedCategories={selectedCategories}
                />
              </Card>
            </div>
          </div>

          {/* Results Area */}
          <div className="min-h-[600px] flex-1">
            {isLoading ? (
              <Card className="flex h-full min-h-[600px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
                  <p className="mt-4 text-sm text-gray-500">
                    Loading products...
                  </p>
                </div>
              </Card>
            ) : results.length === 0 ? (
              <Card className="flex h-full min-h-[600px] flex-col items-center justify-center p-12">
                <Search className="mb-6 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No products found
                </h3>
                <p className="max-w-md text-center text-sm text-gray-500">
                  {query
                    ? `We couldn't find any products matching "${query}". Try checking for typos or using different keywords.`
                    : "No products available. Try adjusting your filters or check back later."}
                </p>
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="outline"
                    className="mt-8"
                    onClick={clearAllFilters}
                  >
                    Clear all filters
                  </Button>
                )}
              </Card>
            ) : (
              <ResultsDisplay
                setSort={setSort}
                query={query ?? ""}
                results={results}
                inShop={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
