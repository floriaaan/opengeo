/* eslint-disable no-console */
import { api_host } from "@resources/apigile";

interface Entry {
  [key: string]: Entry | string;
}
function parseStructureObject(obj: Entry): string[] {
  const result: string[] = [];

  function traverse(entry: Entry) {
    for (const key in entry) {
      const value = entry[key];
      if (typeof value === "string") {
        result.push(value);
      } else {
        traverse(value);
      }
    }
  }

  traverse(obj);
  return result;
}

const EMPTY_IDENTITY = {
  identity: { firstName: "", lastName: "" },
  organization: { name: "", business: "" },
  localization: { address: { street: "", zip_code: "", sitename: "" } },
  contact_point: { phone: "", mobile: "", email: "" },
};

// Fetches contact data for a given id and token
export const apigile_contact = async (id: string, token: string) => {
  // Make API call to fetch contact data
  const contactResponse = await fetch(`${api_host}/contact_data/v3/${id}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  const contact = await contactResponse.json();

  // Extract relevant contact data
  const { identity, organization, localization, contact_point } = contact.contacts[0] ?? EMPTY_IDENTITY;

  // Parse organization structure object
  organization.structure = parseStructureObject(organization.structure.entry);

  // Return contact data
  return { identity, organization, localization, contact_point };
};
