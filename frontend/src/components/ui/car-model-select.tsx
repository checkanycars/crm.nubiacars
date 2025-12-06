import * as React from "react";
import { ComboBox, type ComboBoxOption } from "./combobox";
import { useCarModels } from "../../hooks/useCarModels";

interface CarModelSelectProps {
  value?: number | string;
  brandId?: number;
  onChange: (modelId: number | string, modelName?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
}

export function CarModelSelect({
  value,
  brandId,
  onChange,
  placeholder = "Select car model...",
  disabled = false,
  required = false,
  className,
  name = "carModelId",
  id = "carModelId",
}: CarModelSelectProps) {
  const { models, isLoading, searchModels, filterByBrand } = useCarModels('', brandId);

  // Update filter when brandId changes
  React.useEffect(() => {
    filterByBrand(brandId);
  }, [brandId, filterByBrand]);

  // Convert models to ComboBox options
  const modelOptions: ComboBoxOption[] = React.useMemo(() => {
    return models.map((model) => ({
      value: model.id,
      label: model.model_name,
    }));
  }, [models]);

  // Handle model selection
  const handleChange = (modelId: string | number, option?: ComboBoxOption) => {
    onChange(modelId, option?.label);
  };

  // Handle search
  const handleSearchChange = (search: string) => {
    searchModels(search);
  };

  return (
    <ComboBox
      id={id}
      name={name}
      options={modelOptions}
      value={value}
      onChange={handleChange}
      onSearchChange={handleSearchChange}
      placeholder={brandId ? placeholder : "Select a brand first..."}
      emptyText={brandId ? "No car models found." : "Please select a brand first."}
      isLoading={isLoading}
      disabled={disabled || !brandId}
      required={required}
      className={className}
    />
  );
}