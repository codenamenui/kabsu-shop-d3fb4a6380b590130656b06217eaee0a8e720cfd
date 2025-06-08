"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { BadgeCheck, Upload } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoryFormData {
  name: string;
  pictureFile: File | null;
}

const AddCategoryPage: React.FC = () => {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    pictureFile: null,
  });
  const [picturePreview, setPicturePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error(
          "Invalid file type. Please upload JPEG, PNG, GIF, or WebP.",
        );
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        pictureFile: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const { name, pictureFile } = formData;

    if (!name.trim()) {
      toast.error("Category name is required");
      return false;
    }

    if (!pictureFile) {
      toast.error("Category picture is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      const fileExt = formData.pictureFile!.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("category-picture")
        .upload(filePath, formData.pictureFile!);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("category-picture").getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: formData.name.trim(),
          picture_url: publicUrl,
        })
        .select();

      if (error) throw error;

      toast.success("Category added successfully!");
      router.push("/admin");
    } catch (error: any) {
      console.error("Error adding category:", error);
      toast.error(error.message || "Failed to add category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Add New Category</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Create a new category by filling out the details below
        </p>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  required
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pictureFile">Category Picture</Label>
                {/* <Input
                  type="file"
                  id="pictureFile"
                  name="pictureFile"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                  required
                /> */}
                <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex justify-center text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="logoFile"
                        className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
                      >
                        <span>Upload a file</span>
                        <input
                          id="logoFile"
                          name="logoFile"
                          type="file"
                          className="sr-only"
                          accept="image/jpeg,image/png,image/gif"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
                {picturePreview && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={picturePreview}
                      alt="Category Preview"
                      className="max-h-48 max-w-48 rounded-lg object-contain shadow-md"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/admin")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Category"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddCategoryPage;
