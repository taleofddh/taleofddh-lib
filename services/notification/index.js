import { SNSClient, PublishCommand, SubscribeCommand } from "@aws-sdk/client-sns";

class NotificationService {
    constructor() {
        this.client = new SNSClient({
            region: process.env['REGION'] || 'eu-west-1'
        });
    }

    async publish(params) {
        const command = new PublishCommand(params);

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

    async subscribe(params) {
        const command = new SubscribeCommand(params);

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
const notificationService = new NotificationService();
export const publish = (params) => notificationService.publish(params);
export const subscribe = (params) => notificationService.subscribe(params);

// Also export the class for backward compatibility
export { NotificationService as Notification };