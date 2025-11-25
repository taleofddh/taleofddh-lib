import { SESClient, SendTemplatedEmailCommand }  from "@aws-sdk/client-ses";
import { simpleParser } from 'mailparser';

class EmailService {
    constructor() {
        this.client = new SESClient({
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
        const command = new SendTemplatedEmailCommand(params);

        try {
            return await this.client.send(command);
        } catch (error) {
            this.handleError(error, 'send');
        }
    }

    async parse(params) {
        try {
            const email = await simpleParser(data.Body);
            const message = {
                from: email.from.text,
                date: JSON.parse(JSON.stringify(email.date)),
                to: email.to ? email.to.text : '',
                cc: email.cc ? email.cc.text : '',
                subject: email.subject,
                body: email.text,
                attachments: JSON.stringify(email.attachments),
                processFlag: true,
                readFlag: false
            }
            console.log(message);
            return message;
        } catch (error) {
            console.error(error.stack);
            return error;
        }
    }
}

// Export a singleton instance
const emailService = new EmailService();
export const send = (params) => emailService.send(params);
export const parse = (params) => emailService.parse(params);

// Also export the class for backward compatibility
export { EmailService as Email };