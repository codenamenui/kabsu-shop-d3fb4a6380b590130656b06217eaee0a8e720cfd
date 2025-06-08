import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

const ProfileInputComponent = ({
  label,
  type,
  name,
  id,
  placeholder,
  defaultValue,
}: {
  label: string;
  type: string;
  name: string;
  id: string;
  placeholder: string;
  defaultValue: string;
}) => {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        type={type}
        name={name}
        id={id}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required
        className="form-input"
      />
    </div>
  );
};

export default ProfileInputComponent;
