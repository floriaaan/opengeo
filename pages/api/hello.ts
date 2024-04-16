// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

/**
 * A function that handles requests to the Next.js API route.
 *
 * @remarks The function takes two arguments: `req`, which is the request object, and `res`, which is the response object. The function sets the response status to 200 and sends a JSON object with a `name` property set to "John Doe". The function is exported as the default export of the module, and is used to handle requests to the API route.
 *
 * @param req - The request object.
 * @param res - The response object.
 *
 * @returns A JSON object with a `name` property set to "John Doe".
 *
 * @example
 * GET /api/hello
 * Response: { "name": "John Doe" }
 */
export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  res.status(200).json({ name: "John Doe" });
}
