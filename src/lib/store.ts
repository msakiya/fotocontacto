import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SavedContact } from "./types";

type ContactsState = {
  contacts: SavedContact[];
  add: (contact: SavedContact) => void;
  update: (id: string, patch: Partial<SavedContact>) => void;
  remove: (id: string) => void;
};

export const useContacts = create<ContactsState>()(
  persist(
    (set) => ({
      contacts: [],
      add: (contact) =>
        set((state) => ({
          contacts: [contact, ...state.contacts.filter((item) => item.id !== contact.id)],
        })),
      update: (id, patch) =>
        set((state) => ({
          contacts: state.contacts.map((item) =>
            item.id === id ? { ...item, ...patch } : item,
          ),
        })),
      remove: (id) =>
        set((state) => ({
          contacts: state.contacts.filter((item) => item.id !== id),
        })),
    }),
    { name: "ficha-contacts" },
  ),
);
