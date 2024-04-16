import { fetcher } from "@/lib/fetchers";
import { log } from "@/lib/log";
import { Session, User } from "@/types/user";
import { user } from "@resources/local-fallbacks";

/**
 * Fetches user details based on the provided session.
 * If the user details are not saved in localStorage, it fetches them from the server.
 * If the user details are saved in localStorage, it returns them.
 *
 * @param {Session} session - The session object containing the access token and user id.
 * @returns {Promise<object>} The user details object or null if the access token is not provided.
 */
export const getUserDetails = async (session: Session): Promise<User | null> => {
  if (process.env.NEXT_PUBLIC_LOCAL === "true") return user as unknown as User;
  const { access_token, id } = session;
  if (!access_token) return null;

  // check if contact is saved in localStorage, if not fetch it
  // todo: check if contact is persisted in localStorage, if not => cookie
  const contact_string = localStorage.getItem("contact");
  const contact = contact_string ? JSON.parse(contact_string) : null;

  const isContactSaved = !!contact;
  try {
    const response = await fetcher(`/api/user?complete=${!isContactSaved}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token, id }),
    });
    const { data } = await response.json();

    if (
      !isContactSaved &&
      "identity" in data &&
      "organization" in data &&
      "localization" in data &&
      "contact_point" in data
    ) {
      const { identity, organization, localization, contact_point } = data;
      localStorage.setItem("contact", JSON.stringify({ identity, organization, localization, contact_point }));
    }
    return isContactSaved ? { ...data, ...contact } : data;
  } catch (error) {
    log.error("getUserDetails", error);
    return {
      ...session,
      habilitation: undefined,
    };
  }
};
