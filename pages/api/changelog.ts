import { APIResult } from "@/types/api";
import { readFile, readdir } from "fs/promises";
import * as matter from "gray-matter";
import { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";

export type Version = {
  version: string;
  data: Metadata;
  content: matter.GrayMatterFile<string>["content"];
};

export enum Flag {
  FEATURE = "Fonctionnalités",
  REFACTOR = "Changements",
  DEPRECATION = "Dépréciations",
  REMOVAL = "Suppressions",
  BUGFIX = "Correctifs",
  SECURITY = "Sécurité",
  PERFORMANCE = "Performances",
  DOCUMENATION = "Documentation",
  STYLE = "Mise en forme",
  MAINTENANCE = "Maintenance",
}

export type Metadata = {
  title: string;
  version: string;
  date: string;
  slug: string;
  flags: Flag[];
  author: Contributor;
  contributors: Contributor[];
};

export type Contributor = {
  cn: string;
  id: string;
  email: string;

  fallback_avatar?: string;
};

export type Latest = {
  version: string;
  date: string;
};

export default async function changelog_handler(
  req: NextApiRequest,
  res: NextApiResponse<APIResult<Version[] | Latest>>,
) {
  const markdown_files = (await readdir(join(process.cwd(), "docs", "changelog"))).filter((file) =>
    file.endsWith(".md"),
  );
  if (req.query.mode === "latest") {
    try {
      const latest = [...markdown_files.sort()].reverse()[0];

      const version = latest.replace(".md", "");
      const raw = (await readFile(join(process.cwd(), "docs", "changelog", `${version}.md`))).toString();
      const {
        data: { date },
      } = matter.default(raw);

      return res.status(200).json({ data: { version, date }, error: null });
    } catch (error) {
      res.status(500).json({
        data: null,
        error: {
          message:
            (error as Error).message ?? "Une erreur est survenue lors de la récupération de la dernière version.",
        },
      });
    }
  }
  try {
    const versions: Version[] = await Promise.all(
      markdown_files.map(async (file) => {
        const version = file.replace(".md", "");
        const raw = (await readFile(join(process.cwd(), "docs", "changelog", `${version}.md`))).toString();
        const { data, content } = matter.default(raw);
        return {
          version,
          data: data as Metadata,
          content,
        };
      }),
    );

    return res.status(200).json({ data: versions.sort((a, b) => b.version.localeCompare(a.version)), error: null });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: {
        message: (error as Error).message ?? "Une erreur est survenue lors de la récupération des versions.",
      },
    });
  }
}
