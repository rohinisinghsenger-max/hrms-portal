import { useState, useCallback, type ChangeEvent, type FormEvent } from 'react';

interface UseFormOptions<T extends object> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void> | void;
}

export function useForm<T extends object>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      // Clear error on change
      if (errors[name as keyof T]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors],
  );

  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (validate) {
        const errs = validate(values);
        setErrors((prev) => ({ ...prev, [name]: errs[name as keyof T] }));
      }
    },
    [validate, values],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (validate) {
        const errs = validate(values);
        if (Object.keys(errs).length > 0) {
          setErrors(errs);
          // Mark all fields as touched
          const allTouched = Object.keys(values).reduce(
            (acc, k) => ({ ...acc, [k]: true }),
            {} as Partial<Record<keyof T, boolean>>,
          );
          setTouched(allTouched);
          return;
        }
      }
      await onSubmit(values);
    },
    [validate, values, onSubmit],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setField = useCallback(<K extends keyof T>(name: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  return { values, errors, touched, handleChange, handleBlur, handleSubmit, reset, setField };
}
