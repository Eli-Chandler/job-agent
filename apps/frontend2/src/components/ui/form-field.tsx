import type {Control} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Input} from "@/components/ui/input.tsx";

interface InputFormFieldProps {
    control: Control<any> // eslint-disable-line @typescript-eslint/no-explicit-any
    name: string
    label: string
    placeholder?: string
    type?: string
    disabled?: boolean
}

export function InputFormField({
                                   control,
                                   name,
                                   label,
                                   placeholder,
                                   type = "text",
                                   disabled,
                               }: InputFormFieldProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input
                            type={type}
                            placeholder={placeholder || label}
                            disabled={disabled}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}

interface TextAreaFormFieldProps {
    control: Control<any> // eslint-disable-line @typescript-eslint/no-explicit-any
    name: string
    label: string
    placeholder?: string
    disabled?: boolean
}

export function TextAreaFormField({
                                      control,
                                      name,
                                      label,
                                      placeholder,
                                      disabled,
                                  }:
                                  TextAreaFormFieldProps
) {
    return (
        <FormField
            control={control}
            name={name}
            render={({field}) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder={placeholder || label}
                            disabled={disabled}
                            {...field}
                        />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    )
}