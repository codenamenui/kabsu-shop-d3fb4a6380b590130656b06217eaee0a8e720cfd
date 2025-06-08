"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/supabase/clients/createClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Search,
  GraduationCap,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";

type Profile = {
  student_number: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  section: string;
  year: string;
  colleges: { name: string };
  programs: { name: string };
};

const Membership = ({ params }: { params: { shopId: string } }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    pending: 0,
  });

  useEffect(() => {
    fetchMembers();
  }, [params.shopId]);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: memberships, error: membershipError } = await supabase
        .from("memberships")
        .select(`id, email`)
        .eq("shop_id", params.shopId);

      if (membershipError) throw membershipError;

      const emails = memberships?.map((m) => m.email) ?? [];

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select(
          "student_number, first_name, last_name, email, contact_number, section, year, colleges(name), programs(name)",
        )
        .in("email", emails);

      if (profileError) throw profileError;

      setProfiles(profiles ?? []);
      setStats({
        total: emails.length,
        registered: profiles?.length ?? 0,
        pending: emails.length - (profiles?.length ?? 0),
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProfiles = profiles.filter((profile) =>
    Object.values(profile).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatsCard
            icon={<Users className="h-6 w-6 text-blue-500" />}
            title="Total Members"
            value={stats.total}
            description="Total registered members"
          />
          <StatsCard
            icon={<GraduationCap className="h-6 w-6 text-green-500" />}
            title="Active Members"
            value={stats.registered}
            description="Members with complete profiles"
          />
          <StatsCard
            icon={<AlertCircle className="h-6 w-6 text-orange-500" />}
            title="Pending Profiles"
            value={stats.pending}
            description="Members pending registration"
          />
        </div>

        {/* Main Content */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            {/* Actions Bar */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search members..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <AddMemberDialog
                  shopId={params.shopId}
                  onSuccess={fetchMembers}
                />
                <Button variant="outline" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Members Table */}
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-muted-foreground">Loading members...</div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Year & Section</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.student_number}>
                        <TableCell className="font-medium">
                          {profile.student_number}
                        </TableCell>
                        <TableCell>
                          {profile.first_name} {profile.last_name}
                        </TableCell>
                        <TableCell>{profile.programs?.name}</TableCell>
                        <TableCell>
                          {profile.year}-{profile.section}
                        </TableCell>
                        <TableCell>{profile.contact_number}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                      </TableRow>
                    ))}
                    {filteredProfiles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No members found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatsCard = ({ icon, title, value, description }) => (
  <Card>
    <CardContent className="flex items-center p-6">
      <div className="mr-4 rounded-lg bg-gray-100 p-3">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const AddMemberDialog = ({ shopId, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("memberships")
        .insert({ shop_id: shopId, email });

      if (error) throw error;
      setEmail("");
      onSuccess?.();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter student email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Adding..." : "Add Member"}
            </Button>
            <DialogClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Membership;
