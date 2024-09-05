'use server'
export default async function upload(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${process.env.SERVER_URL}/upload_resume`, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      console.log('File uploaded successfully');
    } else {
      console.error('Failed to upload file');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
  }
}
