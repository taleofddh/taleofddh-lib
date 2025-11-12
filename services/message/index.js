import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

class MessageService {
    constructor() {
        this.client = new SQSClient({
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

    async send(params) {
        const command = new SendMessageCommand(params);

        try {
            return await this.client.send(command);
        } catch (error) {
            this.handleError(error, 'send');
        }
    }

    async receive(params) {
        const command = new ReceiveMessageCommand(params);

        try {
            return await this.client.send(command);
        } catch (error) {
            return this.handleError(error, 'receive', { fallback: null });
        }
    }

    async deleteMessage(params) {
        const command = new DeleteMessageCommand(params);

        try {
            return await this.client.send(command);
        } catch (error) {
            this.handleError(error, 'deleteMessage');
        }
    }

    async receiveAndDelete(params) {
        const command = new ReceiveMessageCommand(params);

        try {
            const data = await this.client.send(command);
            if (data.Messages) {
                const deleteParams = {
                    QueueUrl: params.QueueUrl,
                    ReceiptHandle: data.Messages[0].ReceiptHandle
                };
                const deleteCommand = new DeleteMessageCommand(deleteParams);
                return await this.client.send(deleteCommand);
            }
        } catch (error) {
            this.handleError(error, 'receiveAndDelete');
        }
    }
}

// Export a singleton instance
const messageService = new MessageService();
export const send = (params) => messageService.send(params);
export const receive = (params) => messageService.receive(params);
export const deleteMessage = (params) => messageService.deleteMessage(params);
export const receiveAndDelete = (params) => messageService.receiveAndDelete(params);

// Also export the class for backward compatibility
export { MessageService as Message };