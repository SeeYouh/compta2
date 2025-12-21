import { useCallback, useState } from "react";

import { FIELD_RULES } from "../utils/index";
import { useThemes } from "../../contexts/useThemes";

const initialForm = {
  date: "",
  themeId: "",
  subThemeId: "",
  payment: "",
  designation: "",
  amount: "",
  bankMovement: "",
};

export function useTransactionForm() {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const { getSubThemeById } = useThemes();

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

    // Vérifier si le sous-thème sélectionné est un compte lié (virement)
    const subTheme = getSubThemeById(formData.themeId, formData.subThemeId);
    const linkedAccountId = subTheme?.linkedAccountId || null;

    return {
      date,
      themeId: formData.themeId,
      subThemeId: formData.subThemeId,
      payment: formData.payment,
      designation: formData.designation,
      recette: formData.bankMovement === "recette" ? formData.amount : "",
      depense: formData.bankMovement === "depense" ? formData.amount : "",
      disabled: false,
      linkedAccountId, // Ajout du compte lié si c'est un virement
    };
  }, [formData, getSubThemeById]);

  return { formData, errors, handleChange, validate, reset, toPayload };
}
