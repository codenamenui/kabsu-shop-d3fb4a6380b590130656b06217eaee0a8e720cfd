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
  Shield,
  FileSpreadsheet,
  Clock,
} from "lucide-react";

type Officer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_number: string;
  contact_number: string;
  year: number;
  section: number;
  created_at: string;
  colleges: { name: string };
  programs: { name: string };
};

const Officers = ({ params }: { params: { shopId: string } }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    activeThisWeek: 0,
    newThisMonth: 0,
  });

  useEffect(() => {
    fetchOfficers();
  }, [params.shopId]);

  const fetchOfficers = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: officersData, error: officersError } = await supabase
        .from("officers")
        .select(
          `
          id,
          profiles(
            id,
            first_name,
            last_name,
            email,
            student_number,
            contact_number,
            year,
            section,
            created_at,
            colleges(name),
            programs(name)
          )
        `,
        )
        .eq("shop_id", params.shopId);

      if (officersError) throw officersError;

      const formattedOfficers =
        officersData?.map((o) => ({
          id: o.id,
          ...o.profiles,
        })) ?? [];

      setOfficers(formattedOfficers);

      // Calculate stats
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      setStats({
        total: formattedOfficers.length,
        activeThisWeek: formattedOfficers.filter(
          (o) => new Date(o.created_at) > weekAgo,
        ).length,
        newThisMonth: formattedOfficers.filter(
          (o) => new Date(o.created_at) > monthAgo,
        ).length,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOfficers = officers.filter((officer) =>
    Object.values(officer).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatsCard
            icon={<Shield className="h-6 w-6 text-blue-500" />}
            title="Total Officers"
            value={stats.total}
            description="Total appointed officers"
          />
          <StatsCard
            icon={<Clock className="h-6 w-6 text-green-500" />}
            title="Active This Week"
            value={stats.activeThisWeek}
            description="Officers active in the last 7 days"
          />
          <StatsCard
            icon={<UserPlus className="h-6 w-6 text-purple-500" />}
            title="New This Month"
            value={stats.newThisMonth}
            description="Officers added in the last 30 days"
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
                  placeholder="Search officers..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <AddOfficerDialog
                  shopId={params.shopId}
                  onSuccess={fetchOfficers}
                />
                <Button variant="outline" className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Officers Table */}
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="text-muted-foreground">Loading officers...</div>
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
                      <TableHead>Joined Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOfficers.map((officer) => (
                      <TableRow key={officer.student_number}>
                        <TableCell className="font-medium">
                          {officer.student_number}
                        </TableCell>
                        <TableCell>
                          {officer.first_name} {officer.last_name}
                        </TableCell>
                        <TableCell>{officer.programs?.name}</TableCell>
                        <TableCell>
                          {officer.year}-{officer.section}
                        </TableCell>
                        <TableCell>{officer.contact_number}</TableCell>
                        <TableCell>{officer.email}</TableCell>
                        <TableCell>
                          {new Date(officer.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredOfficers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No officers found
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

const AddOfficerDialog = ({ shopId, onSuccess }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (searchEmail: string) => {
    setEmail(searchEmail);
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

  const handleSubmit = async (userId: string) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("officers")
        .insert({ shop_id: shopId, user_id: userId });

      if (error) throw error;
      setEmail("");
      setSearchResults([]);
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
          <Shield className="h-4 w-4" />
          Add Officer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Officer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="Search by email..."
              value={email}
              onChange={(e) => {
                handleSearch(e.target.value);
                setError("");
              }}
            />
            {searchResults.length > 0 && (
              <div className="mt-2 rounded-md border bg-white">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    onClick={() => handleSubmit(result.id)}
                  >
                    {result.first_name} {result.last_name} ({result.email})
                  </button>
                ))}
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogClose asChild>
            <Button variant="outline" className="w-full">
              Cancel
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Officers;
