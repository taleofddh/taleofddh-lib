import drive from '@googleapis/drive';
import oauth2 from '@googleapis/oauth2';
import fs from "fs";

class DriveService {
    constructor(credentials) {
        this.credentials = credentials;
    }

    async getDriveService() {
    // Create OAuth Client with Client Id, Client Secret & Redirect Url
    const oauth2Client = new oauth2.auth.OAuth2(
        this.credentials.clientId,
        this.credentials.clientSecret,
        'https://developers.google.com/oauthplayground'
    );

    // Access scopes for gmail.
    const scopes = [
        'https://www.googleapis.com/auth/drive.file'
    ];

    // Generate a url that asks permissions for gmail scope
    const authorizationUrl = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
        // Pass in the scopes array defined above.
        // Alternatively, if only one scope is needed, you can pass a scope URL as a string
        scope: scopes,
        // Enable incremental authorization. Recommended as a best practice.
        include_granted_scopes: true
    });


    // Variable that Hold Credentials for Authorization
    let tokens = {
        access_token: this.credentials.accessToken,
        refresh_token: this.credentials.refreshToken,
        scope: this.credentials.driveScope ? JSON.parse(this.credentials.driveScope) : scopes,
        token_type: 'Bearer',
        expiry_date: this.credentials.expiryDate
    }

    oauth2Client.setCredentials(tokens);

    oauth2Client.on('tokens', async (tokens) => {
        let secretValue = this.credentials;
        if (tokens.refresh_token && tokens.refresh_token !== secretValue.refreshToken) {
            // store the refresh_token in your secure persistent database
            secretValue = { ...secretValue, refreshToken: tokens.refresh_token, accessToken: tokens.access_token, expiryDate: tokens.expiry_date };
            
            // TODO: Replace with @taleofddh/secret package when available
            /*const { putSecretValue } = await import('@taleofddh/secret');
            const params = {
                SecretId: process.env['GOOGLE_API_CREDENTIALS_KEY'],
                SecretString: JSON.stringify(secretValue)
            }
            await putSecretValue(params);*/
        }
    });

        return drive.drive({ version: 'v3', auth: oauth2Client });
    }

    async listFiles(query) {
        const driveService = await this.getDriveService();

        const params = {
            q: query,
            fields: 'nextPageToken, files(id, name)',
            spaces: 'drive'
        }

        return new Promise((resolve, reject) => {
            driveService.files.list(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async createFolder(folder) {
        const driveService = await this.getDriveService();

        const metaData = {
            name: folder,
            mimeType: 'application/vnd.google-apps.folder'
        };

        const params = {
            requestBody: metaData
        }

        return new Promise((resolve, reject) => {
            driveService.files.create(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async uploadFile(file, fileId = '') {
        const driveService = await this.getDriveService();

        const media = {
            mimeType: file.mimeType,
            body: fs.createReadStream(file.folder ? file.folder + '/' + file.fileName : file.fileName)
        };

        const metaData = {
            name: file.fileName,
            mimeType: this.googleDriveMimeTypes(file.mimeType),
        };

        const params = {
            media: media
        }

        return new Promise((resolve, reject) => {
            if(fileId === "") {
                // Create a new file
                driveService.files.create({...params, requestBody: metaData}, function(err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            } else {
                // Overwrite existing file (fileId)
                driveService.files.update({...params, fileId: fileId}, function(err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            }
        });
    }

    async getFile(fileId) {
        const driveService = await this.getDriveService();

        const params = {
            fileId: fileId,
            fields: 'name, parents, fileExtension, webViewLink, modifiedTime'
        }

        return new Promise((resolve, reject) => {
            driveService.files.get(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async deleteFile(fileId) {
        const driveService = await this.getDriveService();

        const bodyValue = {
            'trashed': true
        };

        const params = {
            fileId: fileId,
            requestBody: bodyValue,
        }

        return new Promise((resolve, reject) => {
            driveService.files.update(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async listPermissions(fileId) {
        const driveService = await this.getDriveService();

        const params = {
            fileId: fileId
        }

        return new Promise((resolve, reject) => {
            driveService.permissions.list(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async createPermission(fileId, type, role, entity) {
        const driveService = await this.getDriveService();

        const permission = {
            type: type,
            role: role,
            ...entity
        }

        const params = {
            resource: permission,
            fileId: fileId
        }

        return new Promise((resolve, reject) => {
            driveService.permissions.create(params, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    mimeTypeConversionFormat(mimeType) {
        return this.googleDriveMimeTypes(mimeType);
    }

    googleDriveMimeTypes(mimeType) {
    let conversionFormat = ""

    switch(mimeType) {
        case 'application/msword':
            conversionFormat = 'application/vnd.google-apps.document';
            break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            conversionFormat = 'application/vnd.google-apps.document';
            break;
        case 'application/vnd.ms-excel':
            conversionFormat = 'application/vnd.google-apps.spreadsheet';
            break;
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            conversionFormat = 'application/vnd.google-apps.spreadsheet';
            break;
        case 'application/vnd.ms-powerpoint':
            conversionFormat = 'application/vnd.google-apps.presentation';
            break;
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            conversionFormat = 'application/vnd.google-apps.presentation';
            break;
        default:
            conversionFormat = mimeType;
            break;
    }

        return conversionFormat
    }
}

// Factory function to create DriveService instance
export function createService(credentials) {
    return new DriveService(credentials);
}

// Export the DriveService class
export { DriveService };