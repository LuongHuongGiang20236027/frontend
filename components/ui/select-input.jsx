"use client"

export function SelectInput({ value, onChange, disabled, children }) {
    return (
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="
        w-full h-10 rounded-md border border-input bg-background px-3 text-sm
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
      "
        >
            {children}
        </select>
    )
}
