import { useAuth } from "@/hooks/useAuth";
import { getEntityFromContact } from "@/lib/user";
import { User } from "@/types/user";
import { roles } from "@components/habilitations/roles";
import { UnauthorizedError } from "@components/helpers/error/access-level/unauthorized";
import { ReactNode } from "react";

/**
 * Middleware Component
 *
 * Returns children if authenticated user has at least the level passed in params, otherwise redirects to "/"
 */
export const RoleGuard = ({ entity, level, children }: { entity?: string; level: number; children: ReactNode }) => {
  const haveAccess = canHaveAccess(entity, level);

  return <>{haveAccess ? children : <UnauthorizedError />}</>;
};

/**
 * Middleware function
 *
 * Returns true if authenticated user has at least the level passed in params, false otherwise.
 */
export const canHaveAccess = (entity: string | undefined, level: number | undefined) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { user } = useAuth();
  return server_canHaveAccess(user, entity, level);
};

export const server_canHaveAccess = (user: User, entity: string | undefined, level: number | undefined) => {
  // if (process.env.NEXT_PUBLIC_LOCAL === "true") return true;

  if (level === undefined) return false;

  const user_entity = getEntityFromContact(user);
  const user_level = roles.find((r) => r.value === user?.habilitation?.role)?.level || 0;

  if (user_level === roles.find((r) => r.label === "Administrateur général")?.level) return true;

  // if entity is not defined, check only user level
  if (!entity) return user_level >= level;
  // if entity is defined, check user level and entity
  else return user_level >= level && user_entity === entity;
};
