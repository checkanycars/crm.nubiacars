import * as React from "react";
import { ComboBox, type ComboBoxOption } from "./combobox";
import { useCustomers } from "../../hooks/useCustomers";

interface CustomerSelectProps {
  value?: number | string;
  onChange: (customerId: number | string, customerName?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  id?: string;
  onAddNew?: () => void;
}

export function CustomerSelect({
  value,
  onChange,
  placeholder = "Select customer...",
  disabled = false,
  required = false,
  className,
  name = "customerId",
  id = "customerId",
  onAddNew,
}: CustomerSelectProps) {
  const { customers, isLoading, searchCustomers } = useCustomers();

  // Convert customers to ComboBox options
  const customerOptions: ComboBoxOption[] = React.useMemo(() => {
    const options: ComboBoxOption[] = customers.map((customer) => ({
      value: customer.id,
      label: customer.fullName,
      subLabel: customer.email || customer.phone,
    }));

    // Add "Add Other Customer" option at the end if handler is provided
    if (onAddNew) {
      options.push({
        value: 'add_new',
        label: '+ Add Other Customer',
        className: 'text-blue-600 font-medium border-t border-gray-200 mt-1 pt-1',
      });
    }

    return options;
  }, [customers, onAddNew]);

  // Handle customer selection
  const handleChange = (customerId: string | number, option?: ComboBoxOption) => {
    // Check if "Add Other Customer" was clicked
    if (customerId === 'add_new' && onAddNew) {
      onAddNew();
      return;
    }

    onChange(customerId, option?.label);
  };

  // Handle search
  const handleSearchChange = (search: string) => {
    searchCustomers(search);
  };

  return (
    <ComboBox
      id={id}
      name={name}
      options={customerOptions}
      value={value}
      onChange={handleChange}
      onSearchChange={handleSearchChange}
      placeholder={placeholder}
      emptyText="No customers found."
      isLoading={isLoading}
      disabled={disabled}
      required={required}
      className={className}
    />
  );
}