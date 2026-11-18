import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
class GenAIService {
    constructor() {
        this.client = new BedrockRuntimeClient({
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
    // params are passed through unchanged (modelId, system, messages, inferenceConfig, toolConfig).
    // The full response is returned so the caller can read output.message.content and usage.
    async converse(params) {
        const command = new ConverseCommand(params);
        try {
            return await this.client.send(command);
        } catch (error) {
            this.handleError(error, 'converse');
        }
    }
}
// Export a singleton instance
const genAIService = new GenAIService();
export const converse = (params) => genAIService.converse(params);
// Also export the class for backward compatibility
export { GenAIService as GenAI };
