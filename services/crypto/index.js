import { KMSClient, DecryptCommand, EncryptCommand } from "@aws-sdk/client-kms";

class CryptoService {
    constructor() {
        this.client = new KMSClient({
            region: process.env['REGION'] || 'eu-west-1'
        });
    }

    async decrypt(env) {
        const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
        const encrypted = process.env[env];

        if (!process.env[env]) {
            throw Error(`Environment variable ${env} not found`)
        }
        const input = {
            CiphertextBlob: Buffer.from(encrypted, 'base64'),
            EncryptionContext: { LambdaFunctionName: functionName },
        }

        const command = new DecryptCommand(input);
        try {
            const data = await this.client.send(command);
            console.info(`Environment variable ${env} decrypted`)
            return data.Plaintext.toString('ascii');
        } catch (err) {
            console.log('Decryption error:', err);
            throw err;
        }
    }

    async encrypt(plaintext, keyId, encryptionContext = {}) {
        const input = {
            KeyId: keyId,
            Plaintext: Buffer.from(plaintext),
            EncryptionContext: encryptionContext
        };

        const command = new EncryptCommand(input);
        try {
            const data = await this.client.send(command);
            console.info('Data encrypted successfully');
            return data.CiphertextBlob.toString('base64');
        } catch (err) {
            console.log('Encryption error:', err);
            throw err;
        }
    }
}

// Export a singleton instance
const cryptoService = new CryptoService();
export const decrypt = (env) => cryptoService.decrypt(env);
export const encrypt = (plaintext, keyId, encryptionContext) => cryptoService.encrypt(plaintext, keyId, encryptionContext);

// Also export as default for backward compatibility (since original was default export)
export default (env) => cryptoService.decrypt(env);

// Also export the class for backward compatibility
export { CryptoService as Crypto };