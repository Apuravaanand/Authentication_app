import React from "react";

export default function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="mb-1 font-semibold">{label}</label>}
      <input
        type={type}
        name={name}
        value={value}          
        onChange={onChange}    
        placeholder={placeholder}
        required={required}
        className="border p-2 rounded focus:outline-none focus:ring focus:border-blue-500"
      />
    </div>
  );
}
