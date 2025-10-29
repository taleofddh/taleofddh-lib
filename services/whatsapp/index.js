import axios from "axios";

class WhatsAppService {
    constructor(credentials) {
        this.credentials = credentials;
    }

    async send(toAddress, templateName, templateData) {
        const content = JSON.stringify({
            'messaging_product': 'whatsapp',
            'to': toAddress,
            'type': 'template',
            'template': {
                'name': templateName,
                'language': {
                    'code': 'en_GB'
                },
                'components': templateData
            }
        });

        return new Promise( async (resolve, reject) => {
            try {
                const response = await axios({
                    method: 'post',
                    url: `${process.env['WHATSAPP_API_ENDPOINT']}/${this.credentials.phoneNumberId}/messages`,
                    headers: {
                        'Authorization': `Bearer ${this.credentials.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    data: content
                });
                const data = await response.data;
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }
}

// Factory function to create service instances
export function createService(credentials) {
    return new WhatsAppService(credentials);
}

// Export the class for direct usage
export { WhatsAppService };