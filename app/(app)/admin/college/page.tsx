"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CollegeFormData {
  name: string;
}

const AddCollegePage: React.FC = () => {
  const [formData, setFormData] = useState<CollegeFormData>({
    name: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const { name } = formData;

    if (!name.trim()) {
      toast.error("College name is required");
      return false;
    }

    // Optional: Add more specific validation (e.g., minimum length)
    if (name.trim().length < 3) {
      toast.error("College name must be at least 3 characters long");
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

      // Insert college data
      const { data, error } = await supabase
        .from("colleges")
        .insert({
          name: formData.name.trim(),
        })
        .select();

      if (error) {
        // Check for unique constraint violation
        if (error.code === "23505") {
          toast.error("A college with this name already exists");
        } else {
          throw error;
        }
        return;
      }

      toast.success("College added successfully!");
      router.push("/admin"); // Redirect to colleges list
    } catch (error: any) {
      console.error("Error adding college:", error);
      toast.error(error.message || "Failed to add college");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Add New College</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Create a new college by filling out the details below
        </p>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">College Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter college name"
                  required
                  maxLength={100}
                />
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
                  {isLoading ? "Adding..." : "Add College"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddCollegePage;
