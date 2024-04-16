import { HabilitationDocument } from "@/models/Habilitation";

export const user = {
  id: "@floriaaan",
  identity: {
    contact_id: "@floriaaan",
    name: "LEROUX",
    first_name: "Florian",
  },
  organization: {
    type: "",
    manager: "",
    assistant: "",
    activity: "",
    business: "developer",
    company: "",
    country: "",
    referent: "",
    employer: "",
    code_um: "",
    code_uo: "",
    structure: ["DR NORMANDIE"],
  },
  localization: {
    address: { sitename: "", street: "", locality: "", zip_code: "", country: "" },
    building: "",
    floor: "",
    room: "",
  },
  contact_point: { email: "conf@ident.tial", phone: "***", mobile: "***" },

  habilitation: {
    _id: "***",
    user: {
      cn: "FLORIAN LEROUX",
      id: "@floriaaan",
      entity: "DR NORMANDIE",
    },
    // role: "PZW_USER",
    role: "PZW_ADMINISTRATEUR-GENERAL",
    validatedBy: {
      cn: "FLORIAN LEROUX",
      id: "@floriaaan",
      entity: "DR NORMANDIE",
    },
    validatedAt: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    __v: 0,
  },
};

export const session = {
  access_token: "***",
  refresh_token: "***",
  id: "@floriaaan",
  cn: "FLORIAN LEROUX",
  scope: "default",
  token_type: "Bearer",
  refresh_token_issued_at: "***",
  expires_in: 12600,
  apigo_client_id: "***",
  issued_at: "***",
};

export const habilitation = {
  _id: "***",
  user: {
    cn: "FLORIAN LEROUX",
    id: "@floriaaan",
    entity: "DR NORMANDIE",
  },
  // role: "PZW_USER",
  role: "PZW_ADMINISTRATEUR-GENERAL",

  validatedBy: null,
  validatedAt: null,
  createdAt: "2024-01-01T00:00:00.000Z",
  __v: 0,
} as unknown as HabilitationDocument;
