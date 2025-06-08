interface FormFieldProps {
  label: string;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
}) => (
  <div className="mb-4">
    <label
      htmlFor={name}
      className="mb-2 block text-sm font-bold text-gray-700"
    >
      {label}
    </label>
    <div className="flex items-center">
      {icon && <div className="mr-2">{icon}</div>}
      <input
        type="text"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
      />
    </div>
  </div>
);

export { FormField };
