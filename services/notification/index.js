import { SNSClient, PublishCommand, SubscribeCommand } from "@aws-sdk/client-sns";

class NotificationService {
    constructor() {
        this.client = new SNSClient({
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

    async publish(params) {
        const command = new PublishCommand(params);

        try {
            return await this.client.send(command);
        } catch (error) {
            this.handleError(error, 'publish');
        }
    }

    async subscribe(params) {
        const command = new SubscribeCommand(params);

        try {
            return await this.client.send(command);
        } catch (error) {
            this.handleError(error, 'subscribe');
        }
    }
}

// Export a singleton instance
const notificationService = new NotificationService();
export const publish = (params) => notificationService.publish(params);
export const subscribe = (params) => notificationService.subscribe(params);

// Also export the class for backward compatibility
export { NotificationService as Notification };