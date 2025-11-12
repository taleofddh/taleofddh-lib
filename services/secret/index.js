import { SecretsManagerClient, GetSecretValueCommand, PutSecretValueCommand } from "@aws-sdk/client-secrets-manager";

class SecretService {
    constructor() {
        this.client = new SecretsManagerClient({
            region: process.env['REGION'] || 'eu-west-1'
        });
    }

    handleError(error, methodName, options = {}) {
        const serviceName = this.constructor.name;
        console.error(`[${serviceName}.${methodName}] Error:`, {
            message: error.message,
            code: error.code || error.name,
            statusCode: error.$metadata?.httpStatusCode,
            requestId: error.$metadata?.requestId
        });
        
        // If a fallback value is provided, return it instead of throwing
        if (options.fallback !== undefined) {
            return options.fallback;
        }
        
        throw error;
    }

    async getSecretValue(params) {
        const command = new GetSecretValueCommand(params);

        try {
            const data = await this.client.send(command);
            // Decrypts secret using the associated KMS CMK.
            // Depending on whether the secret is a string or binary, one of these fields will be populated.
            if ('SecretString' in data) {
                return data.SecretString;
            }
            const buff = Buffer.from(data.SecretBinary, 'base64');
            return buff.toString('ascii');
        } catch (error) {
            return this.handleError(error, 'getSecretValue', { fallback: null });
        }
    }

    async putSecretValue(params) {
        const command = new PutSecretValueCommand(params);

        try {
            return await this.client.send(command);
        } catch (error) {
            this.handleError(error, 'putSecretValue');
        }
    }
}

// Export a singleton instance
const secretService = new SecretService();
export const getSecretValue = (params) => secretService.getSecretValue(params);
export const putSecretValue = (params) => secretService.putSecretValue(params);

// Also export the class for backward compatibility
export { SecretService as Secret };