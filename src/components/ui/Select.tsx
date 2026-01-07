'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'default' | 'badge' | 'compact';
  className?: string;
}

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Auswaehlen...',
  disabled = false,
  icon,
  variant = 'default',
  className,
}: SelectProps) {
  const selected = options.find(o => o.value === value);

  const buttonClasses = clsx(
    'relative w-full cursor-pointer text-left transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    'disabled:bg-gray-100 disabled:cursor-not-allowed',
    // Variant base styles
    variant === 'default' && 'rounded-lg bg-white py-3 border border-gray-300',
    variant === 'badge' && 'rounded-full py-1.5 px-3 pr-8 text-sm font-medium border-0',
    variant === 'compact' && 'rounded-lg bg-white py-2.5 border border-gray-300 text-sm',
    // Icon padding (for default and compact)
    variant !== 'badge' && icon && 'pl-10 pr-10',
    variant !== 'badge' && !icon && 'pl-4 pr-10',
    // Badge color
    variant === 'badge' && selected?.color,
    className
  );

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <Listbox.Button className={buttonClasses}>
          {icon && variant !== 'badge' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </span>
          )}
          <span className={clsx(
            'block truncate',
            !selected && 'text-gray-400',
            variant === 'badge' && 'pr-4'
          )}>
            {selected?.label || placeholder}
          </span>
          <span className={clsx(
            'absolute top-1/2 -translate-y-1/2 pointer-events-none',
            variant === 'badge' ? 'right-2' : 'right-3',
            variant === 'badge' ? 'text-current opacity-60' : 'text-gray-400'
          )}>
            <ChevronDown className={clsx(
              variant === 'badge' ? 'h-4 w-4' : 'h-5 w-5'
            )} />
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
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  clsx(
                    'relative cursor-pointer select-none py-2.5 pl-10 pr-4',
                    active ? 'bg-primary-50 text-primary-900' : 'text-gray-900'
                  )
                }
              >
                {({ selected: isSelected }) => (
                  <>
                    {variant === 'badge' && option.color ? (
                      <span className={clsx(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        option.color
                      )}>
                        {option.label}
                      </span>
                    ) : (
                      <span className={clsx('block truncate', isSelected && 'font-medium')}>
                        {option.label}
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-600">
                        <Check className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
