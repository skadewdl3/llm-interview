import { NextApiRequest, NextApiResponse } from "next";

import Cors from 'cors';

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  const { roomId } = req.body

  let response
  try {
    response = await fetch(`${process.env.SERVER_URL}/generate_summary`, {
      method: "POST",
      body: JSON.stringify({
        room_id: roomId
      }),
      headers: {
        "Content-type": "application/json",
      },
    });

    try {
      response = await response.json();
      response = response.summary
    } catch (err) {
      return res.status(500).json({ error: `Error while parsing json - ${err}` })
    }

    return res.status(200).json({ summary: response })
  } catch (err) {
    return res.status(500).json({ error: `Error while appending conversation - ${err}` })
  }

}
