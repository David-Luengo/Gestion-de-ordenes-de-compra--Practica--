import React, { useState } from "react";
import Select from "react-select";

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: Option[];
  onChange: (selectedOption: Option | null) => void;
  name: string;
  required?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  onChange,
  name,
  required,
}) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const handleSelectChange = (selectedOption: Option | null) => {
    setSelectedOption(selectedOption); // Update the selectedOption state
    onChange(selectedOption); // Call the provided onChange function
  };

  return (
    <Select
      isSearchable
      value={selectedOption}
      onChange={handleSelectChange}
      options={options}
      name={name}
      isClearable={true}
      required={required}
    />)
};

export default SearchableSelect;