import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

class IdentityService {
    constructor() {
        this.client = new STSClient({
            region: process.env["REGION"] || 'eu-west-1'
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

    async get(params) {
        const command = new GetCallerIdentityCommand(params);

        try {
            return await this.client.send(command);
        } catch (error) {
            return this.handleError(error, 'get', { fallback: null });
        }
    }
}

// Export a singleton instance
const identityService = new IdentityService();
export const get = (params) => identityService.get(params);

// Also export the class for backward compatibility
export { IdentityService as Identity };