import gmail from '@googleapis/gmail';
import oauth2 from '@googleapis/oauth2';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import ejs from 'ejs';
// Note: This service depends on @taleofddh/secret package
// For now, we'll comment the functionality inline until we find an approach to pass back secret value on call back

class GmailService {
    constructor(credentials) {
        this.credentials = credentials;
    }

    async getEmailService() {
        /**
         * To use OAuth2 authentication, we need access to a CLIENT_ID, CLIENT_SECRET, AND REDIRECT_URI
         * from the client_secret.json file. To get these credentials for your application, visit
         * https://console.cloud.google.com/apis/credentials.
         */
        const oauth2Client = new oauth2.auth.OAuth2(
            this.credentials.clientId,
            this.credentials.clientSecret,
            'https://developers.google.com/oauthplayground'
        );

        // Access scopes for gmail.
        const scopes = [
            'https://www.googleapis.com/auth/gmail.send'
        ];

        // Generate a url that asks permissions for gmail scope
        const authorizationUrl = oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
            access_type: 'offline',
            /** Pass in the scopes array defined above.
             * Alternatively, if only one scope is needed, you can pass a scope URL as a string */
            scope: scopes,
            // Enable incremental authorization. Recommended as a best practice.
            include_granted_scopes: true
        });

        /** 
         * Global variable that stores user credential in this code example.
         * ACTION ITEM for developers:
         *   Store user's refresh token in your data store if
         *   incorporating this code into your real app.
         *   For more information on handling refresh tokens,
         *   see https://github.com/googleapis/google-api-nodejs-client#handling-refresh-tokens
        **/
        let tokens = {
            access_token: this.credentials.accessToken,
            refresh_token: this.credentials.refreshToken,
            scope: this.credentials.gmailScope ? JSON.parse(this.credentials.gmailScope) : undefined,
            token_type: 'Bearer',
            expiry_date: this.credentials.expiryDate
        }

        oauth2Client.setCredentials(tokens);

        oauth2Client.on('tokens', async (tokens) => {
            let secretValue = this.credentials;
            if (tokens.refresh_token && tokens.refresh_token !== secretValue.refreshToken) {
                // store the refresh_token in your secure persistent database
                secretValue = { ...secretValue, refreshToken: tokens.refresh_token, accessToken: tokens.access_token, expiryDate: tokens.expiry_date };

                // TODO: Replace with @taleofddh/secret package when available
                /*const { putSecretValue } = await import('@taleofddh/secret');
                const params = {
                    SecretId: process.env['GOOGLE_API_CREDENTIALS_KEY'],
                    SecretString: JSON.stringify(secretValue)
                }
                await putSecretValue(params);*/
            }
        });

        return gmail.gmail({ version: 'v1', auth: oauth2Client });
    }

    async renderTemplate(templateName, templateData) {
        return new Promise((resolve, reject) => {
            ejs.renderFile('./resources/' + templateName.toLowerCase() + 'Template.ejs', templateData, function(err, result) {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    }

    async createMail(options) {
        const mailComposer = new MailComposer(options);
        const message = await mailComposer.compile().build();
        return this.encodeMessage(message);
    }

    encodeMessage(message) {
        return Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    async send(toAddress, templateName, templateData, ccAddress = '', bccAddress = '', textContent = '') {
        const emailService = await this.getEmailService();

        let ccList = ccAddress ? ccAddress : '';
        let bccList = bccAddress ? bccAddress : '';

        const htmlBody = await this.renderTemplate(templateName, templateData);
        const options = {
            from: '"' + process.env['FROM_NAME'] + '" <' + process.env['FROM_ADDRESS'] + '>', // sender address
            to: toAddress, // list of receivers
            cc: ccList, //list of copied recipients
            bcc: bccList, //list of blind copy recipients
            subject: templateData.subject, // Subject line
            text: textContent, // plain text body
            html: htmlBody, // html body
            attachments: [{
                filename: process.env['APP_BANNER'],
                path: './resources/' + process.env['APP_BANNER'],
                cid: 'addaSloughLogo' //same cid value as in the html img src
            }],
            sender: process.env['FROM_ADDRESS'],
            replyTo: process.env['FROM_ADDRESS']
        }
        const base64Email = await this.createMail(options);
        const params = {
            userId: 'me',
            requestBody: {
                raw: base64Email
            }
        }

        // for async it only works with Promise and resolve/reject
        return new Promise((resolve, reject) => {
            emailService.users.messages.send(params, function(err, data) {
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

// Factory function to create service instances
export function createService(credentials) {
    return new GmailService(credentials);
}

// Export the class for direct usage
export { GmailService };