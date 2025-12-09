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
  const [searchText, setSearchText] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Sync searchText with value when value changes externally (only when closed)
  React.useEffect(() => {
    if (!open) {
      setSearchText(value || "")
    }
  }, [value, open])

  // Filter options: show all when searchText is empty or matches current value, otherwise filter
  const filteredOptions = React.useMemo(() => {
    if (!searchText || searchText === value) return options
    
    const lowerSearch = searchText.toLowerCase()
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lowerSearch) ||
        option.value.toLowerCase().includes(lowerSearch)
    )
  }, [searchText, value, options])

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

  const openDropdown = () => {
    setSearchText("")
    setOpen(true)
    inputRef.current?.focus()
  }

  const closeDropdown = () => {
    setOpen(false)
    setSearchText(value || "")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchText(newValue)
    onChange(newValue)
    if (!open) setOpen(true)
  }

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setSearchText(optionValue)
    closeDropdown()
    inputRef.current?.blur()
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setSearchText("")
    setOpen(true)
    e.target.select()
  }

  const toggleOpen = () => {
    if (open) {
      closeDropdown()
    } else {
      openDropdown()
    }
  }

  const displayValue = open ? (searchText || value || "") : (value || "")

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
          value={displayValue}
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

