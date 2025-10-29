import pkg from "@aws-sdk/client-pinpoint";
const { PinpointClient, SendMessageCommand } = pkg;

class ChannelService {
    constructor() {
        this.client = new PinpointClient({
            region: process.env['REGION']  || 'eu-west-1'
        });
        
        // Default configuration - can be overridden in methods
        this.defaultConfig = {
            originationNumber: "+447451274623",
            applicationId: "6b25a20545a54a4aaa4bcd910a9d96a8",
            messageType: "TRANSACTIONAL",
            registeredKeyword: "KEYWORD_506883070544",
            senderId: "MySenderID"
        };
    }

    async sendSMS(options = {}) {
        const {
            destinationNumber = "+447825034533",
            message = "This message was sent through Amazon Pinpoint using the AWS SDK for JavaScript in Node.js. Reply STOP to opt out.",
            originationNumber = this.defaultConfig.originationNumber,
            applicationId = this.defaultConfig.applicationId,
            messageType = this.defaultConfig.messageType,
            registeredKeyword = this.defaultConfig.registeredKeyword,
            senderId = this.defaultConfig.senderId
        } = options;

        const params = {
            ApplicationId: applicationId,
            MessageRequest: {
                Addresses: {
                    [destinationNumber]: {
                        ChannelType: "SMS",
                    },
                },
                MessageConfiguration: {
                    SMSMessage: {
                        Body: message,
                        registeredKeyword: registeredKeyword,
                        MessageType: messageType,
                        OriginationNumber: originationNumber,
                        SenderId: senderId
                    },
                },
            },
        };

        const command = new SendMessageCommand(params);

        return new Promise((resolve, reject) => {
            this.client.send(command, function (err, data) {
                if (err) {
                    console.log('SMS send error:', err.message);
                    reject(err);
                } else {
                    const result = data["MessageResponse"]["Result"][destinationNumber]["StatusMessage"];
                    console.log("Message sent! " + result);
                    resolve(data);
                }
            });
        });
    }

    updateDefaultConfig(newConfig) {
        this.defaultConfig = { ...this.defaultConfig, ...newConfig };
    }
}

// Export a singleton instance
const channelService = new ChannelService();
export const sendSMS = (options) => channelService.sendSMS(options);
export const updateDefaultConfig = (config) => channelService.updateDefaultConfig(config);

// Also export the class for backward compatibility
export { ChannelService as Channel };