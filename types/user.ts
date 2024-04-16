import { HabilitationDocument } from "@/models/Habilitation";

export type User =
  | (Session &
      Partial<Contact> & {
        habilitation?: HabilitationDocument;
      })
  | null;

export type Session = {
  access_token: string;
  refresh_token: string;
  id: string;
  cn: string;
  scope: string;
  token_type: string;
  refresh_token_issued_at: string;
  expires_in: number;
  apigo_client_id: string;
  issued_at: string;
};

export type Contact = {
  id: string;
  identity: {
    contact_id: string;
    name: string;
    first_name: string;
  };
  organization: {
    type: string;
    manager: string;
    assistant: string;
    activity: string;
    business: string;
    company: string;
    country: string;
    referent: string;
    employer: string;
    code_um: string;
    code_uo: string;
    structure: Array<string>;
  };
  localization: {
    address: {
      sitename: string;
      street: string;
      locality: string;
      zip_code: string;
      country: string;
    };
    building: string;
    floor: string;
    room: string;
  };
  contact_point: {
    email: string;
    phone: string;
    mobile: string;
  };
};
