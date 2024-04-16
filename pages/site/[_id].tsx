import { GetServerSideProps } from "next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return { props: { _id: ctx.query._id } };
};

// This page is a simple redirect to the generic object page.
export default function SiteRedirectToGenericObject({ _id }: { _id: string }) {
  const { push } = useRouter();
  useEffect(() => push(`/generic-object/${_id}`), [push, _id]);
  return null;
}
