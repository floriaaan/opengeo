import { GenericObject } from "@/types/generic-object";
import { SyntheseChildMetadata, SyntheseType } from "@/types/synthese";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { Fragment } from "react";

export const Synthese = ({ synthese, object }: { synthese: SyntheseType; object: GenericObject }) => {
  // return <pre className="text-xs">{JSON.stringify({ synthese, object })}</pre>;
  return (
    <div className="flex flex-col w-full p-4">
      <div className="h-16 inline-flex overflow-visible items-end justify-between w-full py-2 after:bg-[url('/header-border.svg')]  after:absolute after:w-full after:h-[3px] after:z-[60] after:bottom-0 relative">
        <Image
          src="/img/logo.company.svg"
          alt="logo"
          width={100}
          height={72}
          className="object-contain w-auto h-3/5 "
        />
        <QRCodeSVG height={56} width={56} value={`${window.location.origin}/generic-object/${object._id}`} />
      </div>

      <div className="ml-auto text-sm">
        dernière mise à jour:{" "}
        {new Date(object.metadata.updated_at).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
      <div className="flex items-center justify-center p-2 mt-4 text-xl font-bold uppercase border">
        {object.values.find((v) => v.label === "Nom")?.value as string} - Fiche synthèse: {synthese.metadata.label}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        {synthese.children.map((c) => {
          const subs = object.children[c.metadata.label];
          if (!subs) return null;
          // handle subs is empty
          return (
            <Fragment key={c._id}>
              <div className="text-lg font-bold first-letter:uppercase">{c.metadata.label}</div>
              {(c.metadata as SyntheseChildMetadata).header && (
                <p className="text-[0.8rem] -mt-2 text-muted-foreground">
                  {(c.metadata as SyntheseChildMetadata).header}
                </p>
              )}
              <table className="w-full border-collapse rounded-sm">
                <thead>
                  <tr>
                    {subs[0].values.map((v) => (
                      <th
                        key={v.label}
                        className="text-sm bg-gray-50 font-semibold border px-1 py-0.5 text-left"
                        style={{
                          width: `${100 / subs[0].values.length}%`,
                        }}
                      >
                        {v.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subs.map((sub) => (
                    <tr key={sub._id}>
                      {sub.values.map((v) => (
                        <td key={v.label} className="border text-sm font-normal px-1 py-0.5">
                          {(v.value || "").toString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {(c.metadata as SyntheseChildMetadata).footer && (
                <p className="text-[0.8rem] -mt-2 text-muted-foreground">
                  {(c.metadata as SyntheseChildMetadata).footer}
                </p>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
