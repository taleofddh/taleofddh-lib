import { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } from "@aws-sdk/client-secrets-manager";

class SecretService {
    constructor() {
        this.client = new SecretsManagerClient({
            region: process.env['REGION'] || 'eu-west-2'
        });
    }

    async getSecretValue(params) {
        const command = new GetSecretValueCommand(params);

        return new Promise((resolve, reject) => {
            this.client.send(command, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    // Decrypts secret using the associated KMS CMK.
                    // Depending on whether the secret is a string or binary, one of these fields will be populated.
                    if ('SecretString' in data) {
                        resolve(data.SecretString);
                    } else {
                        let buff = new Buffer(data.SecretBinary, 'base64');
                        resolve(buff.toString('ascii'));
                    }
                }
            });
        });
    }

    async putSecretValue(params) {
        const command = new PutSecretValueCommand(params);

        return new Promise((resolve, reject) => {
            this.client.send(command, function(err, data) {
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
const secretService = new SecretService();
export const getSecretValue = (params) => secretService.getSecretValue(params);
export const putSecretValue = (params) => secretService.putSecretValue(params);

// Also export the class for backward compatibility
export { SecretService as Secret };