"use client";

import React, { useEffect, useState } from "react";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { College, Program } from "@/constants/type";

const CollegeProgramInput = ({
  colleges,
  programs,
  defaultCollegeId,
  defaultProgramId,
}: {
  colleges: College[];
  programs: Program[];
  defaultCollegeId: number;
  defaultProgramId: number;
}) => {
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(
    defaultCollegeId ? `${defaultCollegeId}` : null,
  );
  const [selectedProgram, setSelectedProgram] = useState<string | null>(
    defaultProgramId ? `${defaultProgramId}` : null,
  );

  useEffect(() => {
    if (defaultCollegeId) {
      const filtered = programs.filter(
        (program) => program.college_id === defaultCollegeId,
      );
      setFilteredPrograms(filtered);

      if (
        defaultProgramId &&
        !filtered.some((p) => p.id.toString() === defaultProgramId.toString())
      ) {
        setSelectedProgram(null);
      }
    } else {
      setFilteredPrograms(programs);
    }
  }, [defaultCollegeId, programs]);

  return (
    <>
      <div className="flex flex-col gap-1">
        <Label>College</Label>
        <Select
          name="college"
          value={selectedCollege || undefined}
          onValueChange={(val) => {
            const filtered = programs?.filter(
              (program) => program.college_id == Number.parseInt(val),
            );
            setSelectedProgram(filtered[0].id.toString());
            setFilteredPrograms(filtered);
            setSelectedCollege(val);
          }}
          required
        >
          <SelectTrigger id="college">
            <SelectValue placeholder="College" />
          </SelectTrigger>
          <SelectContent>
            {colleges?.map((college) => (
              <SelectItem key={college.id} value={`${college.id}`}>
                {college.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor="program">Program</Label>
        <Select
          name="program"
          value={selectedProgram || undefined}
          onValueChange={(val) => {
            setSelectedProgram(val);
          }}
          required
        >
          <SelectTrigger id="program">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filteredPrograms?.map((program) => (
              <SelectItem
                key={program.id.toString()}
                value={program.id.toString()}
              >
                {program.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default CollegeProgramInput;
