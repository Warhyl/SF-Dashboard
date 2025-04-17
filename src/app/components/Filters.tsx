import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import SearchableDropdown from './SearchableDropdown';

interface FiltersProps {
  salesData: any[];
  funnelData: any[];
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  dateRange: { start: string; end: string } | null;
  city: string | null;
  financer: string | null;
  store: string | null;
  storeCode: string | null;
  model: string | null;
}



export default function Filters({ salesData, funnelData, onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: null,
    city: null,
    financer: null,
    store: null,
    storeCode: null,
    model: null,
  });
  


  // Extract unique values for each filter from the data
  const [options, setOptions] = useState({
    dates: [] as string[],
    cities: [] as string[],
    financers: [] as string[],
    stores: [] as string[],
    storeCodes: [] as string[],
    models: [] as string[],
  });

  useEffect(() => {
    if (salesData.length > 0) {
      const dates = [...new Set(salesData.map(item => item.Financed_Date))].sort();
      const cities = [...new Set(salesData.map(item => item.City))].filter(Boolean).sort();
      const financers = [...new Set(salesData.map(item => item.Financer))].filter(Boolean).sort();
      const models = [...new Set(salesData.map(item => item.Purchased_Model_Name))].filter(Boolean).sort();
      
      let stores: string[] = [];
      let storeCodes: string[] = [];
      if (salesData[0]?.Channel_Name) {
        stores = [...new Set(salesData.map(item => item.Channel_Name))].filter(Boolean).sort();
      } else if (salesData[0]?.Store_Name) {
        stores = [...new Set(salesData.map(item => item.Store_Name))].filter(Boolean).sort();
      }
      if (salesData[0]?.Channel_Code) {
        storeCodes = [...new Set(salesData.map(item => String(item.Channel_Code)))].filter(Boolean).sort();
      }
      setOptions({
        dates,
        cities,
        financers,
        stores,
        storeCodes,
        models,
      });
    }
  }, [salesData]);

  const handleFilterChange = (filterName: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [filterName]: value === '' ? null : value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  


  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    // Initialize with empty values if null, otherwise use existing values
    const dateRange = filters.dateRange ? { ...filters.dateRange } : { start: '', end: '' };
    dateRange[type] = value;
    
    if (dateRange.start && dateRange.end) {
      handleFilterChange('dateRange', dateRange);
    } else if (!dateRange.start && !dateRange.end) {
      handleFilterChange('dateRange', null);
    } else {
      setFilters({ ...filters, dateRange });
    }
  };

  // Determine min and max dates for the date picker
  const minDate = options.dates.length > 0 ? options.dates[0] : '';
  const maxDate = options.dates.length > 0 ? options.dates[options.dates.length - 1] : '';

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Date Range</label>
          <div className="flex gap-2">
            <input
              type="date"
              className="border rounded p-2 text-sm w-full"
              min={minDate}
              max={maxDate}
              value={filters.dateRange?.start || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
            />
            <input
              type="date"
              className="border rounded p-2 text-sm w-full"
              min={filters.dateRange?.start || minDate}
              max={maxDate}
              value={filters.dateRange?.end || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
            />
          </div>
        </div>

        {/* City Filter with Searchable Dropdown */}
        <SearchableDropdown
          options={options.cities}
          placeholder="All Cities"
          value={filters.city || ''}
          label="City"
          onChange={(value) => handleFilterChange('city', value)}
        />

        {/* Financer Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Financer</label>
          <select
            className="border rounded p-2 text-sm w-full"
            value={filters.financer || ''}
            onChange={(e) => handleFilterChange('financer', e.target.value)}
          >
            <option value="">All Financers</option>
            {options.financers.map((financer) => (
              <option key={financer} value={financer}>{financer}</option>
            ))}
          </select>
        </div>

        {/* Store Filter with Searchable Dropdown */}
        <SearchableDropdown
          options={options.stores}
          placeholder="All Stores"
          value={filters.store || ''}
          label="Store"
          onChange={(value) => handleFilterChange('store', value)}
        />

        {/* Model Filter with Searchable Dropdown */}
        <SearchableDropdown
          options={options.models}
          placeholder="All Models"
          value={filters.model || ''}
          label="Model"
          onChange={(value) => handleFilterChange('model', value)}
        />
        {/* Store Code Filter with Searchable Dropdown */}
        <SearchableDropdown
          options={options.storeCodes}
          placeholder="All Store Codes"
          value={filters.storeCode || ''}
          label="Store Code"
          onChange={(value) => handleFilterChange('storeCode', value)}
        />
      </div>
      
      {/* Reset Filters Button */}
      <div className="mt-4">
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm font-medium"
          onClick={() => {
            const resetFilters = {
              dateRange: null,
              city: null,
              financer: null,
              store: null,
              storeCode: null,
              model: null,
            };
            setFilters(resetFilters);
            onFilterChange(resetFilters);
          }}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
