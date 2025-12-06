import * as React from "react";
import { ComboBox, type ComboBoxOption } from "./combobox";
import { useCarBrands } from "../../hooks/useCarBrands";

interface CarBrandSelectProps {
  value?: number | string;
  onChange: (brandId: number | string, brandName?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export function CarBrandSelect({
  value,
  onChange,
  placeholder = "Select car brand...",
  disabled = false,
  required = false,
  className,
  name = "carBrandId",
  id = "carBrandId",
}: CarBrandSelectProps) {
  const { brands, isLoading, searchBrands } = useCarBrands();

  // Convert brands to ComboBox options
  const brandOptions: ComboBoxOption[] = React.useMemo(() => {
    return brands.map((brand) => ({
      value: brand.id,
      label: brand.name,
    }));
  }, [brands]);

  // Handle brand selection
  const handleChange = (brandId: string | number, option?: ComboBoxOption) => {
    onChange(brandId, option?.label);
  };

  // Handle search
  const handleSearchChange = (search: string) => {
    searchBrands(search);
  };

  return (
    <ComboBox
      id={id}
      name={name}
      options={brandOptions}
      value={value}
      onChange={handleChange}
      onSearchChange={handleSearchChange}
      placeholder={placeholder}
      emptyText="No car brands found."
      isLoading={isLoading}
      disabled={disabled}
      required={required}
      className={className}
    />
  );
}