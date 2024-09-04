
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { AccessToken, Role } from '@huddle01/server-sdk/auth';
import Cors from 'cors';
import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable'

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


export default async function handler(req: NextRequest, res: NextResponse) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: 'Error parsing the files' });
      }

      const file = files.file;

      // Forward the file to the Flask server
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.filepath));

      fetch(`${process.env.NEXT_PUBLIC_FLASK_SERVER_URL}/upload`, {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          res.status(200).json(data);
        })
        .catch(error => {
          console.error('Error forwarding file to Flask server:', error);
          res.status(500).json({ error: 'Failed to upload file to Flask server' });
        });
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
