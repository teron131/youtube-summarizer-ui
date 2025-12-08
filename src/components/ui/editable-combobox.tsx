import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"
import * as React from "react"

export interface ComboboxOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface EditableComboboxProps {
  value: string
  onChange: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  className?: string
  inputClassName?: string
  renderOption?: (option: ComboboxOption) => React.ReactNode
  renderIcon?: (value: string) => React.ReactNode
  type?: "text" | "url"
}

export function EditableCombobox({
  value,
  onChange,
  options,
  placeholder,
  className,
  inputClassName,
  renderOption,
  renderIcon,
  type = "text",
}: EditableComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Filter options based on input value
  const filteredOptions = React.useMemo(() => {
    if (!value) return options
    const lowerValue = value.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lowerValue) ||
        option.value.toLowerCase().includes(lowerValue)
    )
  }, [value, options])

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    if (!open) setOpen(true)
  }

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleInputFocus = () => {
    setOpen(true)
  }

  const toggleOpen = () => {
    if (open) {
      setOpen(false)
    } else {
      setOpen(true)
      inputRef.current?.focus()
    }
  }

  // Find selected option for display purposes if needed (e.g. to bold it)
  // const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative flex items-center">
        {/* Render icon inside input if provided */}
        {renderIcon && (
          <div className="absolute left-3 z-10 flex items-center justify-center pointer-events-none">
            {renderIcon(value)}
          </div>
        )}
        
        <Input
          ref={inputRef}
          type={type}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={cn(
            "pr-10 transition-all duration-200", 
            renderIcon ? "pl-10" : "pl-3",
            open ? "ring-2 ring-ring ring-offset-2" : "",
            inputClassName
          )}
          autoComplete="off"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-foreground"
          onClick={toggleOpen}
          aria-label="Toggle options"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} />
        </Button>
      </div>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No options found. You can type a custom value.
            </div>
          ) : (
            <div className="p-1">
              {filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                    value === option.value && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleOptionClick(option.value)}
                >
                  <div className="flex items-center gap-2 w-full">
                    {renderOption ? (
                      renderOption(option)
                    ) : (
                      <>
                        {option.icon && <span className="flex h-4 w-4 items-center justify-center">{option.icon}</span>}
                        <span>{option.label}</span>
                      </>
                    )}
                  </div>
                  {value === option.value && (
                    <Check className="ml-auto h-4 w-4 opacity-50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

