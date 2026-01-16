import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const css = (strings: TemplateStringsArray, ...values: any[]) => {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] || '')
  }, '')
}
