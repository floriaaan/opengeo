import { useFetch } from "@/hooks/useFetch";
import { APIResult } from "@/types/api";
import { GenericObject } from "@/types/generic-object";
import { SyntheseType } from "@/types/synthese";
import { Synthese } from "@components/synthese";
import { Button } from "@components/ui";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useMemo } from "react";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return { props: { _id: ctx.query._id, synthese_id: ctx.query.synthese } };
};

const GenericObjectSynthesePage = ({ _id, synthese_id }: { _id: string; synthese_id: string }) => {
  const { data: api_g, loading: lg } = useFetch<APIResult<GenericObject>>(`/api/generic-object/get?id=${_id}`);
  const { data: api_s, loading: ls } = useFetch<APIResult<SyntheseType>>(`/api/synthese/get?id=${synthese_id}`);

  const object = useMemo(() => api_g?.data, [api_g]);
  const synthese = useMemo(() => api_s?.data, [api_s]);

  if (lg || ls) return <div>Loading...</div>;
  if (!object || !synthese) return <div>Not found</div>;

  return (
    <>
      <div className="inline-flex items-center justify-between w-full p-2 print:hidden">
        <Button asChild variant="outline">
          <Link href={`/generic-object/${_id}`}>
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Retour
          </Link>
        </Button>
        <Button
          onClick={() => {
            window.print();
          }}
        >
          Imprimer
        </Button>
      </div>
      <Synthese {...{ object, synthese }} />
    </>
  );
};

export default GenericObjectSynthesePage;
