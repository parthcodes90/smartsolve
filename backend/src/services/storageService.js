const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;

/**
 * Storage Abstraction Layer
 * Supports Local FS or Cloudinary for Phase-2
 */
class StorageService {
    constructor() {
        this.storageType = process.env.STORAGE_TYPE || 'local';
        this.uploadDir = path.join(process.cwd(), 'uploads');

        if (this.storageType === 'cloud') {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });
        }
    }

    async uploadPhoto(buffer, filenamePrefix) {
        if (this.storageType === 'local') {
            return this._uploadToLocal(buffer, filenamePrefix);
        } else {
            return this._uploadToCloud(buffer, filenamePrefix);
        }
    }

    async _uploadToLocal(buffer, filenamePrefix) {
        try {
            // Ensure directory exists
            await fs.mkdir(this.uploadDir, { recursive: true });

            const fileName = `${filenamePrefix}-${uuidv4()}.jpg`;
            const filePath = path.join(this.uploadDir, fileName);

            await fs.writeFile(filePath, buffer);

            // Return public URL (assumes Express static middleware is serving /uploads)
            return `/uploads/${fileName}`;
        } catch (error) {
            console.error('[STORAGE_ERROR]: Local write failed', error);
            throw new Error('Failed to save file locally');
        }
    }

    async _uploadToCloud(buffer, filenamePrefix) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'complaints',
                    public_id: `${filenamePrefix}-${uuidv4()}`,
                    resource_type: 'image'
                },
                (error, result) => {
                    if (error) {
                        console.error('[STORAGE_ERROR]: Cloudinary upload failed', error);
                        // Fallback to local
                        console.warn('[STORAGE] Falling back to local upload');
                        this._uploadToLocal(buffer, filenamePrefix)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        resolve(result.secure_url);
                    }
                }
            );

            // Write the buffer to the stream
            uploadStream.end(buffer);
        });
    }
}

module.exports = new StorageService();
