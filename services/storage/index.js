import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, SelectObjectContentCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class StorageService {
    constructor() {
        this.client = new S3Client({
            region: process.env['REGION'] || 'eu-west-2'
        });
    }

    async listBucket(params) {
        const command = new ListObjectsV2Command(params);

        return new Promise((resolve, reject) => {
            this.client.send(command, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log(data);
                    let objects = data.CommonPrefixes.map((commonPrefix) => {
                        return commonPrefix.Prefix.substring(params.Prefix.length).replace('/', '');
                    });
                    console.log(objects);
                    resolve(objects);
                }
            });
        });
    }

    async listFolder(params) {
        const command = new ListObjectsV2Command(params);

        return new Promise((resolve, reject) => {
            this.client.send(command, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log(data);
                    let objects = data.Contents.map((object) => {
                        return object.Key.substring(params.Prefix.length);
                    });
                    console.log(objects);
                    resolve(objects);
                }
            });
        });
    }

    async getObject(params) {
        const command = new GetObjectCommand(params);

        return new Promise((resolve, reject) => {
            this.client.send(command, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async putObjectSignedUrl(params) {
        const command = new PutObjectCommand(params);

        return new Promise(async (resolve, reject) => {
            try {
                const data = await getSignedUrl(this.client, command, { expiresIn: 3600 });
                resolve(data);
            } catch (err) {
                reject(err);
            }
        });
    }

    async getObjectSignedUrl(params) {
        const command = new GetObjectCommand(params);

        return new Promise(async (resolve, reject) => {
            try {
                const data = await getSignedUrl(this.client, command, { expiresIn: 3600 });
                resolve(data);
            } catch (err) {
                reject(err);
            }
        });
    }

    async putObject(params) {
        const command = new PutObjectCommand(params);

        return new Promise((resolve, reject) => {
            this.client.send(command, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async deleteObject(params) {
        const command = new DeleteObjectCommand(params);

        return new Promise((resolve, reject) => {
            this.client.send(command, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async selectObjectContent(params) {
        const command = new SelectObjectContentCommand(params);

        return new Promise((resolve, reject) => {
            this.client.send(command, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async headObject(params) {
        const command = new HeadObjectCommand(params);

        return new Promise((resolve, reject) => {
            this.client.send(command, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
}

// Export a singleton instance
const storageService = new StorageService();
export const listBucket = (params) => storageService.listBucket(params);
export const listFolder = (params) => storageService.listFolder(params);
export const getObject = (params) => storageService.getObject(params);
export const putObjectSignedUrl = (params) => storageService.putObjectSignedUrl(params);
export const getObjectSignedUrl = (params) => storageService.getObjectSignedUrl(params);
export const putObject = (params) => storageService.putObject(params);
export const deleteObject = (params) => storageService.deleteObject(params);
export const selectObjectContent = (params) => storageService.selectObjectContent(params);
export const headObject = (params) => storageService.headObject(params);

// Also export as default for backward compatibility
export default StorageService;