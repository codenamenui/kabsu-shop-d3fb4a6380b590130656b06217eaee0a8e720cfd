"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { toast } from "sonner";
import { BadgeCheck, Building2, Upload, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface ShopFormData {
  name: string;
  acronym: string;
  email: string;
  collegeId: string;
  socmedUrl: string;
  logoFile: File | null;
  initialOfficerEmail?: string;
}

interface College {
  id: number;
  name: string;
}

const AddShopPage: React.FC = () => {
  const [formData, setFormData] = useState<ShopFormData>({
    name: "",
    acronym: "",
    email: "",
    collegeId: "",
    socmedUrl: "",
    logoFile: null,
    initialOfficerEmail: "",
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const router = useRouter();

  // Fetch colleges on component mount
  React.useEffect(() => {
    const fetchColleges = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("colleges")
        .select("id, name")
        .order("name");

      if (error) {
        toast.error("Failed to load colleges");
        return;
      }

      setColleges(data || []);
    };

    fetchColleges();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload JPEG, PNG, or GIF.");
        return;
      }

      if (file.size > maxSize) {
        toast.error("File size exceeds 5MB limit.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        logoFile: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOfficerSearch = async (searchEmail: string) => {
    if (!searchEmail) {
      setSearchResults([]);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .ilike("email", `${searchEmail}%`)
        .limit(5);

      if (error) throw error;
      setSearchResults(data ?? []);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const validateForm = (): boolean => {
    const { name, acronym, email, collegeId, socmedUrl, logoFile } = formData;

    if (!name.trim()) {
      toast.error("Shop name is required");
      return false;
    }
    if (!acronym.trim()) {
      toast.error("Shop acronym is required");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Valid email is required");
      return false;
    }
    if (!collegeId) {
      toast.error("Please select a college");
      return false;
    }
    if (!socmedUrl.trim()) {
      toast.error("Social media URL is required");
      return false;
    }
    if (!logoFile) {
      toast.error("Shop logo is required");
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

      // Upload logo to Supabase storage
      const fileExt = formData.logoFile!.name.split(".").pop();
      const fileName = `${formData.name}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to shop-picture bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("shop-picture")
        .upload(filePath, formData.logoFile!);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("shop-picture").getPublicUrl(filePath);

      // Insert shop data
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .insert({
          name: formData.name,
          acronym: formData.acronym,
          email: formData.email,
          college_id: parseInt(formData.collegeId),
          socmed_url: formData.socmedUrl,
          logo_url: publicUrl,
        })
        .select();

      if (shopError) {
        throw shopError;
      }

      // If an initial officer email is provided, add the officer
      if (formData.initialOfficerEmail) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", formData.initialOfficerEmail)
          .single();

        if (profileError) {
          throw profileError;
        }

        const { error: officerError } = await supabase.from("officers").insert({
          shop_id: shopData[0].id,
          user_id: profileData.id,
        });

        if (officerError) {
          throw officerError;
        }
      }

      toast.success("Shop added successfully!");
      router.push("/admin"); // Redirect to shops list
    } catch (error: any) {
      console.error("Error adding shop:", error);
      toast.error(error.message || "Failed to add shop");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Add New Shop</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Create a new shop by filling out the details below
        </p>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Shop Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter shop name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acronym">Shop Acronym</Label>
                  <Input
                    id="acronym"
                    name="acronym"
                    value={formData.acronym}
                    onChange={handleInputChange}
                    placeholder="Enter shop acronym"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter contact email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collegeId">College</Label>
                <Select
                  name="collegeId"
                  value={formData.collegeId}
                  onValueChange={(value) =>
                    handleInputChange({
                      target: { name: "collegeId", value },
                    } as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a College" />
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
                <Label htmlFor="socmedUrl">Social Media URL</Label>
                <Input
                  id="socmedUrl"
                  name="socmedUrl"
                  value={formData.socmedUrl}
                  onChange={handleInputChange}
                  placeholder="Enter social media profile URL"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoFile">Shop Logo</Label>
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
                {logoPreview && (
                  <div className="mt-4 flex justify-center">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="max-h-[200px] max-w-[200px] rounded-md object-contain"
                    />
                  </div>
                )}
              </div>

              {/* New Optional Officer Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Initial Officer (Optional)</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Add Officer
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Initial Officer</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          placeholder="Search by email..."
                          value={formData.initialOfficerEmail || ""}
                          onChange={(e) => {
                            handleOfficerSearch(e.target.value);
                            handleInputChange({
                              target: {
                                name: "initialOfficerEmail",
                                value: e.target.value,
                              },
                            } as any);
                          }}
                        />
                        {searchResults.length > 0 && (
                          <div className="mt-2 rounded-md border bg-white">
                            {searchResults.map((result) => (
                              <button
                                key={result.id}
                                type="button"
                                className="w-full px-4 py-2 text-left hover:bg-gray-50"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    initialOfficerEmail: result.email,
                                  }));
                                  setSearchResults([]);
                                }}
                              >
                                {result.first_name} {result.last_name} (
                                {result.email})
                              </button>
                            ))}
                          </div>
                        )}
                        {formData.initialOfficerEmail && (
                          <div className="mt-2 rounded-md bg-green-50 p-2">
                            <p className="text-sm text-green-700">
                              Initial Officer: {formData.initialOfficerEmail}
                            </p>
                          </div>
                        )}
                        <DialogClose asChild>
                          <Button variant="outline" className="w-full">
                            Close
                          </Button>
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                {formData.initialOfficerEmail && (
                  <p className="text-sm text-muted-foreground">
                    An officer will be added to this shop upon creation
                  </p>
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
                  {isLoading ? "Adding..." : "Add Shop"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddShopPage;
