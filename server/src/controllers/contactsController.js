import { Account } from "../models/Account.js";
import { Contact } from "../models/Contact.js";
import { User } from "../models/User.js";

// GET /api/contacts
export const getContacts = async (req, res) => {
  const contacts = await Contact.find({ ownerId: req.userId }).sort({
    name: 1,
  });

  // Pour chaque contact, enrichir avec les accès comptes actifs
  const enriched = await Promise.all(
    contacts.map(async (contact) => {
      // Trouver le user correspondant à cet email (s'il existe)
      const user = await User.findOne({ email: contact.email }).select("id");
      const accountsAccess = [];

      if (user) {
        // Trouver les comptes partagés avec ce user (appartenant au propriétaire du contact)
        const sharedAccounts = await Account.find({
          userId: req.userId,
          "sharedWith.userId": user.id,
        }).select("id name sharedWith");

        for (const account of sharedAccounts) {
          const membership = account.sharedWith.find(
            (s) => s.userId === user.id,
          );
          if (membership) {
            accountsAccess.push({
              accountId: account.id,
              accountName: account.name,
              permissions: membership.permissions,
            });
          }
        }
      }

      return {
        ...contact.toJSON(),
        isRegistered: !!user,
        accountsAccess,
      };
    }),
  );

  return res.status(200).json(enriched);
};

// POST /api/contacts
export const addContact = async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ message: "Email et nom requis" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Empêcher d'ajouter sa propre adresse
  const owner = await User.findOne({ id: req.userId });
  if (owner && owner.email === normalizedEmail) {
    return res
      .status(400)
      .json({ message: "Vous ne pouvez pas vous ajouter vous-même" });
  }

  const existing = await Contact.findOne({
    ownerId: req.userId,
    email: normalizedEmail,
  });
  if (existing) {
    return res.status(409).json({ message: "Ce contact existe déjà" });
  }

  const contact = await Contact.create({
    ownerId: req.userId,
    email: normalizedEmail,
    name: name.trim(),
  });

  return res.status(201).json(contact.toJSON());
};

// PATCH /api/contacts/:id
export const updateContact = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const contact = await Contact.findOne({ id, ownerId: req.userId });
  if (!contact) {
    return res.status(404).json({ message: "Contact introuvable" });
  }

  if (name) contact.name = name.trim();
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    const duplicate = await Contact.findOne({
      ownerId: req.userId,
      email: normalizedEmail,
      id: { $ne: id },
    });
    if (duplicate)
      return res
        .status(409)
        .json({ message: "Un contact avec cet email existe déjà" });
    contact.email = normalizedEmail;
  }

  await contact.save();
  return res.status(200).json(contact.toJSON());
};

// DELETE /api/contacts/:id
export const deleteContact = async (req, res) => {
  const { id } = req.params;

  const contact = await Contact.findOne({ id, ownerId: req.userId });
  if (!contact) {
    return res.status(404).json({ message: "Contact introuvable" });
  }

  await contact.deleteOne();
  return res.status(200).json({ message: "Contact supprimé" });
};
