import { User } from "@/types/user";

export const getUserMinimum = (user: User) =>
  user
    ? {
        id: user.id,
        cn: user.cn,
        email: user.contact_point?.email,
        entity: getEntityFromContact(user),
      }
    : null;

export const getEntityFromContact = (user: User) => {
  if (user === null) return "";
  if (!("organization" in user)) return "";

  return user.organization?.structure.find((str) => str.startsWith("DR ")) || "";
};
