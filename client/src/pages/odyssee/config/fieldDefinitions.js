// Source de vérité des champs par type de source.
// Ajouter un champ ici = il apparaît automatiquement dans la sidebar en MODE_RUBRIQUE.
// Ne jamais hardcoder ces champs dans les composants.

// ─── Groupes Passager ─────────────────────────────────────────────────────────

export const PASSENGER_GROUPS = [
  { id: "identity", label: "Identité",  initials: "Id", color: "#4e8070" },
  { id: "contact",  label: "Contact",   initials: "Ct", color: "#4e6080" },
  { id: "address",  label: "Adresse",   initials: "Ad", color: "#805848" },
  { id: "extra",    label: "Infos +",   initials: "I+", color: "#706050" },
];

export const PASSENGER_FIELDS = [
  { id: "avatar",            group: "identity", label: "Photo",                 path: "contentFilesData.avatar",                     type: "image"    },
  { id: "firstName",         group: "identity", label: "Prénom",                path: "contentFilesData.firstName",                  type: "text"     },
  { id: "lastName",          group: "identity", label: "Nom",                   path: "contentFilesData.lastName",                   type: "text"     },
  { id: "aliasName",         group: "identity", label: "Alias",                 path: "contentFilesData.aliasName",                  type: "alias"    },
  { id: "gender",            group: "identity", label: "Genre",                 path: "contentFilesData.gender",                     type: "enum"     },
  { id: "birthDate",         group: "identity", label: "Date de naissance",     path: "contentFilesData.birthDate",                  type: "date"     },
  { id: "phone",             group: "contact",  label: "Téléphone",             path: "contentFilesData.contact.phone",              type: "text"     },
  { id: "email",             group: "contact",  label: "Email",                 path: "contentFilesData.contact.email",              type: "text"     },
  { id: "socialNetworks",    group: "contact",  label: "Réseaux sociaux",       path: "contentFilesData.contact.socialNetworks",     type: "array"    },
  { id: "address",           group: "address",  label: "Rue",                   path: "contentFilesData.address.address",            type: "text"     },
  { id: "addressComplement", group: "address",  label: "Complément adresse",    path: "contentFilesData.address.addressComplement",  type: "text"     },
  { id: "postalCode",        group: "address",  label: "Code postal",           path: "contentFilesData.address.postalCode",         type: "text"     },
  { id: "city",              group: "address",  label: "Ville",                 path: "contentFilesData.address.city",               type: "text"     },
  { id: "country",           group: "address",  label: "Pays",                  path: "contentFilesData.address.country",            type: "text"     },
  { id: "infoSupp",          group: "extra",    label: "Infos supplémentaires", path: "contentFilesData.infoSupp",                   type: "infoSupp" },
];

// ─── Groupes Catalogue ────────────────────────────────────────────────────────

export const CATALOGUE_GROUPS = [
  { id: "product",   label: "Produit",    initials: "Pr", color: "#486080" },
  { id: "treatment", label: "Traitement", initials: "Tr", color: "#604880" },
  { id: "intake",    label: "Prise",      initials: "Pk", color: "#807048" },
];

// intakeTime est éclaté en sous-champs indépendants.
// Le mode avancé permet des valeurs différentes par période mais ne crée pas de nouveaux champs.
export const CATALOGUE_FIELDS = [
  { id: "productName",          group: "product",   label: "Nom du produit",    path: "contentFilesData.productName",                    type: "text"   },
  { id: "aliasName",            group: "product",   label: "Alias",             path: "contentFilesData.aliasName",                      type: "alias"  },
  { id: "img",                  group: "product",   label: "Images",            path: "contentFilesData.img",                            type: "images" },
  { id: "treatmentDuration",    group: "treatment", label: "Durée traitement",  path: "contentFilesData.treatmentDuration",              type: "number" },
  { id: "amountToAdminister",   group: "treatment", label: "Quantité",          path: "contentFilesData.amountToAdminister",             type: "number" },
  { id: "intakeCheckedMoments", group: "intake",    label: "Moments de prise",  path: "contentFilesData.intakeTime.checkedMoments",      type: "array"  },
  { id: "intakeSelectedTime",   group: "intake",    label: "Heure de prise",    path: "contentFilesData.intakeTime.selectedTime",        type: "text"   },
  { id: "intakeDurationBefore", group: "intake",    label: "Durée avant repas", path: "contentFilesData.intakeTime.durationBefore",      type: "number" },
  { id: "intakeDurationAfter",  group: "intake",    label: "Durée après repas", path: "contentFilesData.intakeTime.durationAfter",       type: "number" },
  { id: "intakeNightDuration",  group: "intake",    label: "Durée nuit",        path: "contentFilesData.intakeTime.nightDuration",       type: "number" },
  { id: "intakeDaysTime",       group: "intake",    label: "Horaires par jour", path: "contentFilesData.intakeTime.daysTime",            type: "array"  },
];
