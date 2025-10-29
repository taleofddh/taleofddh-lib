import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

class IdentityService {
    constructor() {
        this.client = new STSClient({
            region: process.env["REGION"] || 'eu-west-2'
        });
    }

    async get(params) {
        const command = new GetCallerIdentityCommand(params);

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
const identityService = new IdentityService();
export const get = (params) => identityService.get(params);

// Also export the class for backward compatibility
export { IdentityService as Identity };