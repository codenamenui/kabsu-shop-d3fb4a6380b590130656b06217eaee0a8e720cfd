"use client";

import React, { useState, useEffect } from "react";
import { College, Profile, Program } from "@/constants/type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Phone,
  GraduationCap,
  BookOpen,
  Users,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { createClient } from "@/supabase/clients/createClient";

const NewProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [hasProfile, setHasProfile] = useState(false);
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [switched, setSwitched] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      // Get user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Get colleges
      const { data: collegesData } = await supabase.from("colleges").select();
      setColleges(collegesData || []);

      // Get programs
      const { data: programsData } = await supabase.from("programs").select();
      setPrograms(programsData || []);

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();

      // Explicitly convert numeric fields to numbers
      const processedProfileData = profileData
        ? {
            ...profileData,
            college_id: Number(profileData.college_id),
            program_id: Number(profileData.program_id),
            year: Number(profileData.year),
            section: Number(profileData.section),
          }
        : null;

      setProfile(processedProfileData);
      setHasProfile(!!processedProfileData);

      // If profile exists, filter programs for the existing college
      if (processedProfileData?.college_id) {
        const collegePrograms =
          programsData?.filter(
            (program) => program.college_id === processedProfileData.college_id,
          ) || [];
        setFilteredPrograms(collegePrograms);
      }
    };

    fetchData();
  }, []);

  const handleCollegeChange = (value: string) => {
    const selectedCollegeId = Number(value);

    // Filter programs based on selected college
    const collegePrograms = programs.filter(
      (program) => program.college_id === selectedCollegeId,
    );

    // Update profile and filtered programs
    setProfile((prev) => ({
      ...prev,
      college_id: selectedCollegeId,
    }));
    if (switched == false) {
      setSwitched(true);
    }
    setFilteredPrograms(collegePrograms);
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        student_number: formData.get("student_number"),
        contact_number: formData.get("contact_number"),
        college_id: formData.get("college"),
        program_id: formData.get("program"),
        year: formData.get("year"),
        section: formData.get("section"),
        email: user?.email,
      };

      const supabase = createClient();

      if (hasProfile) {
        const { error } = await supabase
          .from("profiles")
          .update(data)
          .eq("id", user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert([{ id: user?.id, ...data }]);

        if (error) throw error;
        setHasProfile(true);
      }

      toast.success("Profile saved successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center space-x-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Student Profile</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Complete your profile to access all features
        </p>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-medium">
              <User className="mr-2 h-5 w-5 text-primary" />
              Personal Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="First Name"
                name="first_name"
                defaultValue={profile?.first_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
                placeholder="Enter your first name"
              />
              <FormField
                label="Last Name"
                name="last_name"
                defaultValue={profile?.last_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
                placeholder="Enter your last name"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Student Number"
                name="student_number"
                defaultValue={profile?.student_number || ""}
                placeholder="Enter your student number"
                icon={<GraduationCap className="h-4 w-4 text-gray-500" />}
              />
              <FormField
                label="Contact Number"
                name="contact_number"
                defaultValue={profile?.contact_number || ""}
                placeholder="Enter your contact number"
                icon={<Phone className="h-4 w-4 text-gray-500" />}
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="flex items-center text-lg font-medium">
              <BookOpen className="mr-2 h-5 w-5 text-primary" />
              Academic Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>College</Label>
                <Select
                  name="college"
                  value={profile?.college_id?.toString() ?? "-1"}
                  onValueChange={handleCollegeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges?.map((college) => (
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
                <Label>Program</Label>
                <Select
                  name="program"
                  value={profile?.program_id?.toString() ?? "-1"}
                  onValueChange={(value) => {
                    if (switched == true) {
                      setSwitched(false);
                    }
                    setProfile((prev) => ({
                      ...prev,
                      program_id: Number(value),
                    }));
                  }}
                  disabled={!profile?.college_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your program" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPrograms?.map((program) => (
                      <SelectItem
                        key={program.id}
                        value={program.id.toString()}
                      >
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Year Level"
                name="year"
                defaultValue={profile?.year?.toString() || ""}
                placeholder="Enter your year level"
                icon={<Users className="h-4 w-4 text-gray-500" />}
              />
              <FormField
                label="Section"
                name="section"
                defaultValue={profile?.section?.toString() || ""}
                placeholder="Enter your section"
                icon={<Users className="h-4 w-4 text-gray-500" />}
              />
            </div>
          </div>

          <Button
            disabled={isLoading || switched}
            type="submit"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

// Helper component for form fields
const FormField = ({
  label,
  name,
  defaultValue,
  placeholder,
  icon,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder: string;
  icon?: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label htmlFor={name}>{label}</Label>
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
      )}
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={icon ? "pl-10" : ""}
        required
      />
    </div>
  </div>
);

export default NewProfile;
