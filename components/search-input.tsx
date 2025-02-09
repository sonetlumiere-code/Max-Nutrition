import { forwardRef } from "react"
import { Input } from "./ui/input"
import { Icons } from "./icons"
import { cn } from "@/lib/utils"

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ placeholder = "Buscar", className, disabled, onChange }, ref) => {
    return (
      <div className='relative'>
        <Input
          type='text'
          autoFocus
          placeholder={placeholder}
          onChange={onChange}
          className={cn("pl-10 pr-4", className)}
          disabled={disabled}
          ref={ref}
        />
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Icons.search className='h-4 w-4 text-gray-500' />
        </div>
      </div>
    )
  }
)

SearchInput.displayName = "SearchInput"

export default SearchInput
