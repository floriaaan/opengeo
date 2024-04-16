import { User } from "./user";

export type Log = {
  user: User;
  path: string;
  method: string;
  timestamp: Date;
  error?: {
    message: string;
  };
};

export type Logs = Log;
