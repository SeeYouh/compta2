import { useCallback, useState } from "react";

import { FIELD_RULES } from "../utils/index";

const initialForm = {
  date: "",
  theme: "",
  subTheme: "",
  payment: "",
  designation: "",
  amount: "",
  bankMovement: "",
};

export function useTransactionForm() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
  }, []);

  const validate = useCallback(() => {
    const errs = FIELD_RULES.reduce((acc, rule) => {
      const invalid =
        typeof rule.validate === "function"
          ? rule.validate(formData)
          : !formData[rule.field];
      if (invalid) acc[rule.field] = rule.message;
      return acc;
    }, {});
    setErrors(errs);
    return errs;
  }, [formData]);

  const reset = useCallback(() => {
    setFormData(initialForm);
    setErrors({});
  }, []);

  const toPayload = useCallback(() => {
    const [year, month, day] = formData.date.split("-");
    const date = `${day}/${month}/${year}`;
    return {
      date,
      theme: formData.theme,
      subTheme: formData.subTheme,
      payment: formData.payment,
      designation: formData.designation,
      recette: formData.bankMovement === "recette" ? formData.amount : "",
      depense: formData.bankMovement === "depense" ? formData.amount : "",
    };
  }, [formData]);

  return { formData, errors, handleChange, validate, reset, toPayload };
}
