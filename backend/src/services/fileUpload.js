const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;

const uploadDir = path.join(process.cwd(), 'uploads');

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
}

async function uploadLocal(buffer) {
  await fs.mkdir(uploadDir, { recursive: true });
  const name = `${uuidv4()}.jpg`;
  const dest = path.join(uploadDir, name);
  await fs.writeFile(dest, buffer);
  return `/uploads/${name}`;
}

async function uploadCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'municipal-complaints', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

async function uploadPhoto(photoBuffer) {
  if (!photoBuffer) return null;

  if (process.env.CLOUDINARY_URL) {
    try {
      return await uploadCloudinary(photoBuffer);
    } catch (error) {
      console.warn('[UPLOAD] Cloudinary failed, falling back to local storage.', error.message);
    }
  }

  return uploadLocal(photoBuffer);
}

module.exports = { uploadPhoto };
