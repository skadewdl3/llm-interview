
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roomId, personName, text } = req.body

  let response
  try {
    response = await fetch(`${process.env.SERVER_URL}/append_conversation`, {
      method: "POST",
      body: JSON.stringify({
        room_id: roomId, person_name: personName, text
      }),
      headers: {
        "Content-type": "application/json",
      },
    });
    res.status(200).json({ message: 'Conversation appended successfully' })
  } catch (err) {
    return res.status(500).json({ error: `Error while appending conversation - ${err}` })
  }

}
