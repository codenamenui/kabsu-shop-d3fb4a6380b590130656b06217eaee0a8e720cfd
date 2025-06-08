"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { Merch, Shop, Category } from "@/constants/type";
import SearchSidebar from "@/components/searchpage/sidebar";
import ResultsDisplay from "@/components/searchpage/results";
import { Card } from "@/components/ui/card";
import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const SearchPage = () => {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sort, setSort] = useState("date");
  const categoryParam = searchParams.get("category");
  const query = searchParams.get("query");
  const shopParam = searchParams.get("shop");
  const [merchandises, setMerchandises] = useState<Merch[]>([]);
  const [results, setResults] = useState<Merch[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedShops, setSelectedShops] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filterMerchandises = (
    query: string,
    categories: number[],
    shops: number[],
  ) => {
    let filteredResults: Merch[];
    if (merchandises == null) {
      filteredResults = [];
      return;
    }

    filteredResults = merchandises.filter((item) => {
      return item.name.toLowerCase().includes(query?.toLowerCase() ?? "");
    });
    console.log(filteredResults);
    if (categories.length > 0) {
      filteredResults = filteredResults.filter((item) => {
        return item.merchandise_categories?.some((category) =>
          categories.includes(category.cat_id),
        );
      });
    }

    if (shops.length > 0) {
      filteredResults = filteredResults.filter((item) => {
        return shops.includes(item.shops?.id);
      });
    }

    if (sort === "date") {
      filteredResults.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    } else if (sort === "ascending") {
      filteredResults.sort((a, b) => {
        const priceA = a.variants[0]?.original_price || 0;
        const priceB = b.variants[0]?.original_price || 0;
        return priceA - priceB;
      });
    } else if (sort === "descending") {
      filteredResults.sort((a, b) => {
        const priceA = a.variants[0]?.original_price || 0;
        const priceB = b.variants[0]?.original_price || 0;
        return priceB - priceA;
      });
    }
    setResults(filteredResults || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch Merchandises
        const { data: merchandises } = await supabase
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
          .returns<Merch[]>();

        setMerchandises(merchandises ?? []);

        // Fetch categories
        const { data: categories } = await supabase
          .from("categories")
          .select("id, name");
        setCategories(categories ?? []);

        // Fetch shops
        const { data: shops } = await supabase
          .from("shops")
          .select("id, acronym");
        setShops(shops ?? []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (merchandises.length === 0) return;

    let categoryIds: number[] = [];
    let shopIds: number[] = [];
    if (categoryParam) {
      categoryIds = categoryParam.split(",").map(Number);
      setSelectedCategories(categoryIds);
    }

    if (shopParam) {
      shopIds = shopParam.split(",").map(Number);
      setSelectedShops(shopIds);
    }

    if (categoryParam && shopParam) {
      filterMerchandises(query ?? "", categoryIds, shopIds);
    } else if (categoryParam) {
      filterMerchandises(query ?? "", categoryIds, selectedShops);
    } else if (shopParam) {
      filterMerchandises(query ?? "", selectedCategories, shopIds);
    } else {
      filterMerchandises(query ?? "", selectedCategories, selectedShops);
    }
  }, [merchandises, query, categoryParam, shopParam, sort]);

  const handleCategoryChange = (categoryId: number): void => {
    const updatedSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    setSelectedCategories(updatedSelected);
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("category", updatedSelected.join(","));
    router.push(`/search?${queryParams.toString()}`);
  };

  const handleShopChange = (shopId: number): void => {
    const updatedSelected = selectedShops.includes(shopId)
      ? selectedShops.filter((id) => id !== shopId)
      : [...selectedShops, shopId];

    setSelectedShops(updatedSelected);
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("shop", updatedSelected.join(","));
    router.push(`/search?${queryParams.toString()}`);
  };

  const inShopPage = (): boolean => {
    const currentUrl = usePathname();
    return currentUrl.startsWith(`${process.env.NEXT_PUBLIC_BASE_URL}/shop`);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedShops([]);
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.delete("category");
    queryParams.delete("shop");
    router.push(`/search?${queryParams.toString()}`);
  };

  const getActiveFiltersCount = () => {
    return selectedCategories.length + selectedShops.length;
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {query ? `Search results for "${query}"` : "All Products"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {results.length} {results.length === 1 ? "result" : "results"}{" "}
              found
              {getActiveFiltersCount() > 0 &&
                ` • ${getActiveFiltersCount()} filters applied`}
            </p>
          </div>

          {/* Mobile Filters Button */}
          <div className="flex items-center gap-2 lg:hidden">
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
                <div className="py-4">
                  <SearchSidebar
                    handleCategoryChange={handleCategoryChange}
                    handleShopChange={handleShopChange}
                    shops={shops}
                    categories={categories}
                    selectedCategories={selectedCategories}
                    selectedShops={selectedShops}
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

        {/* Main Content */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-64">
            <div className="sticky top-6">
              <Card className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  {/* <h2 className="font-semibold">Filters</h2> */}
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
                  handleShopChange={handleShopChange}
                  shops={shops}
                  categories={categories}
                  selectedCategories={selectedCategories}
                  selectedShops={selectedShops}
                />
              </Card>
            </div>
          </div>

          {/* Results Area */}
          <div className="min-h-[500px] flex-1">
            {isLoading ? (
              <Card className="flex h-full min-h-[500px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                  <p className="mt-4 text-sm text-gray-500">
                    Loading results...
                  </p>
                </div>
              </Card>
            ) : results.length === 0 ? (
              <Card className="flex h-full min-h-[500px] flex-col items-center justify-center p-12">
                <Search className="mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  No results found
                </h3>
                <p className="max-w-md text-center text-sm text-gray-500">
                  {query
                    ? `We couldn't find any products matching "${query}". Try checking for typos or using different keywords.`
                    : "No products available. Try adjusting your filters or check back later."}
                </p>
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="outline"
                    className="mt-6"
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
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
