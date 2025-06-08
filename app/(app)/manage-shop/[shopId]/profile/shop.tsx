"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, Globe, Mail, Building2 } from "lucide-react";
import { College, FullShopInfo } from "@/constants/type";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/supabase/clients/createClient";

const ShopProfilePage = ({
  shop,
  colleges,
}: {
  shop?: FullShopInfo;
  colleges: College[];
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopInfo, setShopInfo] = useState({
    id: shop?.id ?? "",
    name: shop?.name ?? "",
    email: shop?.email ?? "",
    socmed_url: shop?.socmed_url ?? "",
    logo_url: shop?.logo_url ?? "",
    logo_file: null as File | null,
    colleges: {
      id: shop?.colleges.id ?? -1,
      name: shop?.colleges.name ?? "",
    },
    acronym: shop?.acronym ?? "",
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setShopInfo((prev) => ({ ...prev, [name]: value }));
    },
    [],
  );

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File size must be less than 5MB");
          return;
        }
        const logoPreviewUrl = URL.createObjectURL(file);
        setShopInfo((prev) => ({
          ...prev,
          logo_file: file,
          logo_url: logoPreviewUrl,
        }));
        toast.success("Logo selected successfully");
      }
    },
    [],
  );

  const handleCollegeChange = useCallback(
    (collegeId: string) => {
      const selectedCollege = colleges.find(
        (college) => college.id === Number(collegeId),
      );
      setShopInfo((prev) => ({
        ...prev,
        colleges: {
          id: selectedCollege ? selectedCollege.id : -1,
          name: selectedCollege ? selectedCollege.name : "",
        },
      }));
    },
    [colleges],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        toast.error("Authentication error");
        return;
      }

      const updatePayload: Partial<FullShopInfo> = {
        name: shopInfo.name,
        email: shopInfo.email,
        socmed_url: shopInfo.socmed_url,
        acronym: shopInfo.acronym,
      };

      if (shopInfo.logo_file) {
        const fileName = `shop_logo_${shopInfo.id}_${Date.now()}`;
        const { error: storageError } = await supabase.storage
          .from("shop-picture")
          .upload(fileName, shopInfo.logo_file);

        if (storageError) {
          toast.error("Failed to upload logo");
          return;
        }

        const { data: urlData } = supabase.storage
          .from("shop-picture")
          .getPublicUrl(fileName);

        updatePayload.logo_url = urlData.publicUrl;
      }

      if (shopInfo.colleges?.id) {
        updatePayload.college_id = shopInfo.colleges.id;
      }

      const { error } = await supabase
        .from("shops")
        .update(updatePayload)
        .eq("id", shop?.id)
        .select()
        .single();

      if (error) throw error;

      toast.success("Shop profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update shop profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Shop Profile</CardTitle>
          <CardDescription>
            Update your shop information and branding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Shop Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={shopInfo.name}
                    onChange={handleInputChange}
                    placeholder="Enter shop name"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={shopInfo.email}
                    onChange={handleInputChange}
                    placeholder="shop@example.com"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="socmed_url" className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Social Media URL
                    </div>
                  </Label>
                  <Input
                    id="socmed_url"
                    name="socmed_url"
                    value={shopInfo.socmed_url}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="h-10"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      College
                    </div>
                  </Label>
                  <Select
                    onValueChange={handleCollegeChange}
                    value={shopInfo.colleges.id.toString()}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select a college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem
                          key={college.id}
                          value={college.id.toString()}
                        >
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acronym" className="text-sm font-medium">
                    Shop Acronym
                  </Label>
                  <Input
                    id="acronym"
                    name="acronym"
                    value={shopInfo.acronym}
                    onChange={handleInputChange}
                    placeholder="e.g., ABC"
                    className="h-10"
                    maxLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo" className="text-sm font-medium">
                    Shop Logo
                  </Label>
                  <div className="flex items-center gap-4">
                    {shopInfo.logo_url && (
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg border-2">
                        <Image
                          src={shopInfo.logo_url}
                          alt="Shop Logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="m mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
                            <label
                              htmlFor="logoFile"
                              className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
                            >
                              <span>Upload Logo</span>
                              <input
                                id="logoFile"
                                name="logoFile"
                                type="file"
                                className="sr-only"
                                accept="image/jpeg,image/png,image/gif"
                                onChange={handleLogoUpload}
                                required
                              />
                            </label>
                          </div>
                          <p className="text-xs leading-5 text-gray-600">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Shop Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopProfilePage;
