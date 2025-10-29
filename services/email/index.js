const { SESClient, SendTemplatedEmailCommand } = require("@aws-sdk/client-ses");

class EmailService {
    constructor() {
        this.client = new SESClient({
            region: process.env['REGION'] || 'eu-west-1'
        });
    }

    async send(params) {
        const command = new SendTemplatedEmailCommand(params);

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