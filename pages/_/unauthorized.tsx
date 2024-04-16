import { UnauthorizedError } from "@components/helpers/error/access-level/unauthorized";

export default function Unauthorized() {
  return (
    <>
      <UnauthorizedError />
    </>
  );
}
