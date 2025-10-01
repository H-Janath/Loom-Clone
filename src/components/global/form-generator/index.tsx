import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ErrorMessage } from "@hookform/error-message"
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form"

type Option = {
  value: string
  label: string
  id: string
}

type Props = {
  type?: "text" | "email" | "password" | "number"
  inputType: "select" | "input" | "textarea"
  options?: Option[]
  label?: string
  placeholder?: string
  register: UseFormRegister<any>
  name: string
  errors: FieldErrors<FieldValues>
  lines?: number
}

const FormGenerator: React.FC<Props> = ({
  inputType,
  options = [],
  label,
  placeholder,
  register,
  name,
  errors,
  type = "text",
  lines = 3,
}) => {
  const renderError = () => (
    <ErrorMessage
      errors={errors}
      name={name}
      render={({ message }) => (
        <p className="text-red-400 mt-2">{message === "Required" ? "" : message}</p>
      )}
    />
  )

  switch (inputType) {
    case "input":
      return (
        <Label className="flex flex-col gap-2 text-[#9D9D9D]" htmlFor={`input-${name}`}>
          {label && label}
          <Input
            id={`input-${name}`}
            type={type}
            placeholder={placeholder}
            className="bg-transparent border-themeGray text-themeTextGray"
            {...register(name)}
          />
          {renderError()}
        </Label>
      )

    case "textarea":
      return (
        <Label className="flex flex-col gap-2 text-[#9D9D9D]" htmlFor={`textarea-${name}`}>
          {label && label}
          <textarea
            id={`textarea-${name}`}
            placeholder={placeholder}
            rows={lines}
            className="bg-transparent border border-themeGray text-themeTextGray rounded-md px-3 py-2"
            {...register(name)}
          />
          {renderError()}
        </Label>
      )

    case "select":
      return (
        <Label className="flex flex-col gap-2 text-[#9D9D9D]" htmlFor={`select-${name}`}>
          {label && label}
          <select
            id={`select-${name}`}
            className="bg-transparent border border-themeGray text-themeTextGray rounded-md px-3 py-2"
            {...register(name)}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {renderError()}
        </Label>
      )

    default:
      return <div>Unsupported input type</div>
  }
}

export default FormGenerator
