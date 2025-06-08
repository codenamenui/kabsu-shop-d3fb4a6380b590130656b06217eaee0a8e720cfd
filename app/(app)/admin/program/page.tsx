"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/clients/createClient";
import { toast } from "sonner";
import { BadgeCheck, BookOpen } from "lucide-react";
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

interface ProgramFormData {
  name: string;
  collegeId: string;
}

interface College {
  id: number;
  name: string;
}

const AddProgramPage: React.FC = () => {
  const [formData, setFormData] = useState<ProgramFormData>({
    name: "",
    collegeId: "",
  });

  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch colleges on component mount
  useEffect(() => {
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

  const validateForm = (): boolean => {
    const { name, collegeId } = formData;

    if (!name.trim()) {
      toast.error("Program name is required");
      return false;
    }

    if (!collegeId) {
      toast.error("Please select a college");
      return false;
    }

    // Optional: Add more specific validation
    if (name.trim().length < 3) {
      toast.error("Program name must be at least 3 characters long");
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

      // Insert program data
      const { data, error } = await supabase
        .from("programs")
        .insert({
          name: formData.name.trim(),
          college_id: parseInt(formData.collegeId),
        })
        .select();

      if (error) {
        // Check for unique constraint violation
        if (error.code === "23505") {
          toast.error("A program with this name already exists");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Program added successfully!");
      router.push("/admin"); // Redirect to programs list
    } catch (error: any) {
      console.error("Error adding program:", error);
      toast.error(error.message || "Failed to add program");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Add New Program</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Create a new academic program by filling out the details below
        </p>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full program name"
                  required
                  maxLength={100}
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

              <div className="flex items-center justify-end space-x-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/admin")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Program"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProgramPage;
