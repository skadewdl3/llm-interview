import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.body

  let response
  try {
    response = await fetch("https://api.huddle01.com/api/v1/create-room", {
      method: "POST",
      body: JSON.stringify({
        title: name,
      }),
      headers: {
        "Content-type": "application/json",
        "x-api-key": process.env.API_KEY || "",
      },
    });
  } catch (err) {
    return res.status(500).json({ error: `Error while creating room - ${err}` })
  }


  let data
  try {
    data = await response.json();
  } catch (err) {
    return res.status(500).json({ error: `Error while reading JSON - ${err}` })
  }

  const roomId = data.data.roomId;
  res.status(200).json({ roomId })

}
