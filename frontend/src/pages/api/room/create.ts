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

  try {
    let res = await fetch(`${process.env.SERVER_URL}/create_room`, {
      method: "POST",
      body: JSON.stringify({
        room_id: roomId
      }),
      headers: {
        "Content-type": "application/json",
      },
    })

    console.log(await res.json())
  } catch (err) {
    return res.status(500).json({ error: `Error while creating room on Redis - ${err}` })
  }

  res.status(200).json({ roomId })

}
