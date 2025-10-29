import axios from "axios";

class TicketTailorService {
    constructor(credentials) {
        this.credentials = credentials;
    }

    async get(url, endpoint, data) {
        return new Promise( async (resolve, reject) => {
            let request = {
                method: 'get',
                baseURL: url,
                url: endpoint,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                auth: {
                    username: this.credentials.apiKey,
                    password: ''
                }
            }
            if(data) {
                request['params'] = data;
            }
            try {
                const response = await axios(request);
                const data = await response.data;
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    }

    async post(url, endpoint, data) {
        return new Promise( async (resolve, reject) => {
            let request = {
                method: 'post',
                baseURL: url,
                url: endpoint,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                auth: {
                    username: this.credentials.apiKey,
                    password: ''
                }
            }
            if(data) {
                request['data'] = data;
            }
            try {
                const response = await axios(request);
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
    return new TicketTailorService(credentials);
}

// Export the class for direct usage
export { TicketTailorService };