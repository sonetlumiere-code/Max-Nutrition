import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Icons } from "./icons"

export type OptionType = {
  value: string
  label: string | JSX.Element
}

function SelectedItems({
  selected,
  options,
  handleUnselect,
}: {
  selected: string[]
  options: OptionType[]
  handleUnselect: (item: string) => void
}) {
  return selected.map((item, i) => (
    <Badge
      key={item + i}
      className='mr-1 break-words whitespace-normal'
      onClick={(e) => e.stopPropagation()}
    >
      {options.find((option) => option.value === item)?.label}
      <span
        className='ml-1 ring-offset-background rounded-full outline-none focus:ring-1 focus:ring-ring focus:ring-offset-2'
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleUnselect(item)
          }
        }}
        onClick={() => {
          handleUnselect(item)
        }}
      >
        <Icons.x className='h-3 w-3 text-white hover:text-secondary' />
      </span>
    </Badge>
  ))
}

function MultiSelect({
  options,
  selected,
  onChange,
  disabled,
  isLoading,
  hideSelectedOptions = true,
  isMulti = true,
  className,
  ...props
}: {
  options: OptionType[]
  selected: string[]
  onChange: React.Dispatch<React.SetStateAction<string[]>>
  disabled?: boolean
  isLoading?: boolean
  hideSelectedOptions?: boolean
  isMulti?: boolean
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  const selectables: OptionType[] = hideSelectedOptions
    ? options.filter((option) => !selected.includes(option.value))
    : options

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true} {...props}>
      <PopoverTrigger asChild className={cn("hover:bg-transparent", className)}>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between h-9", {
            "h-fit": isMulti && selected.length > 1,
          })}
          onClick={() => setOpen(!open)}
        >
          <div className='flex gap-1 flex-wrap align-middle'>
            <SelectedItems
              selected={selected}
              options={options}
              handleUnselect={(item: string) => {
                onChange(selected.filter((i) => i !== item))
              }}
            />
          </div>
          <Icons.caretSortIcon className='h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-0'>
        <Command>
          {isLoading ? (
            <div className='flex justify-around p-4'>
              <Icons.spinner className='animate-spin' />
            </div>
          ) : (
            <>
              <CommandInput placeholder='Buscar' />
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup className='max-h-64 overflow-y-scroll [&::-webkit-scrollbar]:hidden'>
                {isMulti && (
                  <>
                    {selected.length !== options.length && (
                      <CommandItem
                        onSelect={() =>
                          onChange(options.map((option) => option.value))
                        }
                      >
                        Seleccionar todos
                      </CommandItem>
                    )}
                    {selected.length > 0 && (
                      <CommandItem onSelect={() => onChange([])}>
                        Deseleccionar todos
                      </CommandItem>
                    )}
                  </>
                )}
                {selectables.map((option, i) => (
                  <CommandItem
                    key={option.value + i}
                    className='flex justify-between'
                    onSelect={() => {
                      onChange(
                        isMulti
                          ? selected.includes(option.value)
                            ? selected.filter((item) => item !== option.value)
                            : [...selected, option.value]
                          : [option.value]
                      )
                    }}
                  >
                    {option.label}
                    {!hideSelectedOptions && (
                      <Icons.check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected.includes(option.value)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect }
