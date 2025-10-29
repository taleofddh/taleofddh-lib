import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

class MessageService {
    constructor() {
        this.client = new SQSClient({
            region: process.env['REGION'] || 'eu-west-1'
        });
    }

    async send(params) {
        const command = new SendMessageCommand(params);

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

    async receive(params) {
        const command = new ReceiveMessageCommand(params);

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

    async deleteMessage(params) {
        const command = new DeleteMessageCommand(params);

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

    async receiveAndDelete(params) {
        let command = new ReceiveMessageCommand(params);

        return new Promise((resolve, reject) => {
            this.client.send(command, function(err, data) {
                if (err) {
                    console.log("Receive Error", err);
                    reject(err);
                } else if (data.Messages) {
                    let deleteParams = {
                        QueueUrl: params.QueueUrl,
                        ReceiptHandle: data.Messages[0].ReceiptHandle
                    };
                    let command = new DeleteMessageCommand(deleteParams);
                    this.client.send(command, function(err, data) {
                        if (err) {
                            console.log("Delete Error", err);
                            reject(err);
                        } else {
                            console.log("Message Deleted", data);
                            resolve(data);
                        }
                    });
                }
            });
        });
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