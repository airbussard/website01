'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  selectedText?: (count: number) => string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  emptyMessage?: string;
}

export default function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Auswaehlen...',
  selectedText = (count) => `${count} ausgewaehlt`,
  disabled = false,
  loading = false,
  icon,
  emptyMessage = 'Keine Optionen verfuegbar',
}: MultiSelectProps) {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const displayText = value.length === 0 ? placeholder : selectedText(value.length);

  return (
    <Listbox value={value} onChange={() => {}} disabled={disabled} multiple>
      <div className="relative">
        <Listbox.Button
          className={clsx(
            'relative w-full cursor-pointer rounded-lg bg-white py-3 text-left',
            'border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed',
            icon ? 'pl-10 pr-10' : 'pl-4 pr-10'
          )}
        >
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </span>
          )}
          <span className={clsx('block truncate', value.length === 0 && 'text-gray-400')}>
            {displayText}
          </span>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ChevronDown className="h-5 w-5" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none"
          >
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Lade...
              </div>
            ) : options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <Listbox.Option
                    key={option.value}
                    value={option.value}
                    as="button"
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    className={({ active }) =>
                      clsx(
                        'relative w-full cursor-pointer select-none py-2.5 pl-10 pr-4 text-left',
                        active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                      )
                    }
                  >
                    <span className={clsx('block truncate', isSelected && 'font-medium')}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600">
                        <Check className="h-5 w-5" />
                      </span>
                    )}
                  </Listbox.Option>
                );
              })
            )}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
