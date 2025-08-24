import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type {AxiosError} from "axios";
import type {ErrorModel, HTTPValidationError} from "@/api/models";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractErrorMessage(error: AxiosError<HTTPValidationError | ErrorModel> | null): string | null {
    if (!error) {
        return null;
    }
    if (error.response) {
        const data = error.response.data;
        if ('detail' in data) {
            if (Array.isArray(data.detail)) {
                // Handle validation errors
                return data.detail.map((err) => `${err.loc.join(' -> ')}: ${err.msg}`).join('; ');
            } else if (typeof data.detail === 'string') {
                return data.detail;
            }
        } else if ('message' in data && typeof data.message === 'string') {
            return data.message;
        }
    }
    return error.message || "An unknown error occurred";
}