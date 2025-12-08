import * as React from "react";
import { ComboBox, type ComboBoxOption } from "./combobox";
import { useExportCountries } from "../../hooks/useExportCountries";

interface ExportCountrySelectProps {
  value?: number | string;
  onChange: (countryId: number | string, countryName?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export function ExportCountrySelect({
  value,
  onChange,
  placeholder = "Select export country...",
  disabled = false,
  required = false,
  className,
  name = "exportCountryId",
  id = "exportCountryId",
}: ExportCountrySelectProps) {
  const { countries, isLoading, searchCountries } = useExportCountries();

  // Convert countries to ComboBox options
  const countryOptions: ComboBoxOption[] = React.useMemo(() => {
    return countries.map((country) => ({
      value: country.id,
      label: country.name,
    }));
  }, [countries]);

  // Handle country selection
  const handleChange = (countryId: string | number, option?: ComboBoxOption) => {
    onChange(countryId, option?.label);
  };

  // Handle search
  const handleSearchChange = (search: string) => {
    searchCountries(search);
  };

  return (
    <ComboBox
      id={id}
      name={name}
      options={countryOptions}
      value={value}
      onChange={handleChange}
      onSearchChange={handleSearchChange}
      placeholder={placeholder}
      emptyText="No export countries found."
      isLoading={isLoading}
      disabled={disabled}
      required={required}
      className={className}
    />
  );
}