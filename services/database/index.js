import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, BatchWriteCommand, BatchGetCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

class DatabaseService {
    constructor() {
        this.client = new DynamoDBClient({
            region: process.env['REGION'] || 'eu-west-2'
        });
        this.docClient = DynamoDBDocumentClient.from(this.client);
    }

    async put(params) {
        const command = new PutCommand(params);

        return new Promise((resolve, reject) => {
            this.docClient.send(command, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async get(params) {
        const command = new GetCommand(params);

        return new Promise((resolve, reject) => {
            this.docClient.send(command, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.Item);
                }
            });
        });
    }

    async update(params) {
        const command = new UpdateCommand(params);

        return new Promise((resolve, reject) => {
            this.docClient.send(command, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data.Attributes);
                }
            });
        });
    }

    async delete(params) {
        const command = new DeleteCommand(params);

        return new Promise((resolve, reject) => {
            this.docClient.send(command, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async batchWrite(params) {
        const command = new BatchWriteCommand(params);

        return new Promise((resolve, reject) => {
            this.docClient.send(command, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }

    async batchGet(params, table) {
        const command = new BatchGetCommand(params);

        return new Promise((resolve, reject) => {
            this.docClient.send(command, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    let response = data.Responses[table].map((item) => {
                        return item;
                    })
                    resolve(response);
                }
            });
        });
    }

    async query(params) {
        const command = new QueryCommand(params);

        return new Promise((resolve, reject) => {
            this.docClient.send(command, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    let response = data.Items.map((item) => {
                        return item;
                    })
                    resolve(response);
                }
            });
        });
    }

    async scan(params) {
        const command = new ScanCommand(params);

        return new Promise((resolve, reject) => {
            this.docClient.send(command, function(err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    let response = data.Items.map((item) => {
                        return item;
                    })
                    resolve(response);
                }
            });
        });
    }
}

// Export a singleton instance
const databaseService = new DatabaseService();
export const put = (params) => databaseService.put(params);
export const get = (params) => databaseService.get(params);
export const update = (params) => databaseService.update(params);
export const deleteItem = (params) => databaseService.delete(params);
export const batchWrite = (params) => databaseService.batchWrite(params);
export const batchGet = (params, table) => databaseService.batchGet(params, table);
export const query = (params) => databaseService.query(params);
export const scan = (params) => databaseService.scan(params);

// Also export the class for backward compatibility
export { DatabaseService as Database };