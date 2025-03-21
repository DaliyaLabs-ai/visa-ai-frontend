"use client"

import { useState, useCallback } from "react"

type ValidationRules<T> = {
  [K in keyof T | string]?: (value: any) => string | null
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>,
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj)
  }

  const setNestedValue = (obj: any, path: string, value: any) => {
    const parts = path.split('.')
    const last = parts.pop()!
    const target = parts.reduce((acc, part) => acc[part] = acc[part] || {}, obj)
    target[last] = value
  }

  const handleChange = useCallback(
    (field: string, value: any) => {
      setValues((prev) => {
        const newValues = { ...prev }
        setNestedValue(newValues, field, value)
        return newValues
      })

      // Validate on change if field has been touched
      if (touched[field] && validationRules[field]) {
        const error = validationRules[field]!(value)
        setErrors((prev) => ({ ...prev, [field]: error }))
      }
    },
    [touched, validationRules],
  )

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }))

      // Validate on blur
      if (validationRules[field]) {
        const value = getNestedValue(values, field)
        const error = validationRules[field]!(value)
        setErrors((prev) => ({ ...prev, [field]: error }))
      }
    },
    [values, validationRules],
  )

  const validateAll = useCallback(() => {
    const newErrors: Record<string, string | null> = {}
    let isValid = true

    // Validate all fields
    Object.keys(validationRules).forEach((field) => {
      if (validationRules[field]) {
        const value = getNestedValue(values, field)
        const error = validationRules[field]!(value)
        if (error) {
          newErrors[field] = error
          isValid = false
        } else {
          newErrors[field] = null
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validationRules])

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setValues,
  }
}

