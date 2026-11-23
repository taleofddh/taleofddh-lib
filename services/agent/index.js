import { BedrockAgentCoreClient, InvokeAgentRuntimeCommand } from "@aws-sdk/client-bedrock-agentcore";
// AgentCore requires runtime session ids of at least 33 characters
const MIN_RUNTIME_SESSION_ID_LENGTH = 33;
class AgentService {
    constructor() {
        this.client = new BedrockAgentCoreClient({
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
    async invokeAgentRuntime({ agentRuntimeArn, runtimeSessionId, payload, qualifier, timeoutMs } = {}) {
        if (!agentRuntimeArn) {
            throw new Error('invokeAgentRuntime: agentRuntimeArn is required');
        }
        if (typeof runtimeSessionId !== 'string' || runtimeSessionId.length < MIN_RUNTIME_SESSION_ID_LENGTH) {
            throw new Error(`invokeAgentRuntime: runtimeSessionId is required and must be at least ${MIN_RUNTIME_SESSION_ID_LENGTH} characters`);
        }
        const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
        const input = {
            agentRuntimeArn,
            runtimeSessionId,
            payload: new TextEncoder().encode(body),
            contentType: 'application/json',
            accept: 'application/json'
        };
        if (qualifier) {
            input.qualifier = qualifier;
        }
        const options = timeoutMs ? { abortSignal: AbortSignal.timeout(timeoutMs) } : undefined;
        const command = new InvokeAgentRuntimeCommand(input);
        try {
            const response = await this.client.send(command, options);
            const stream = response.response;
            const text = typeof stream?.transformToString === 'function'
                ? await stream.transformToString('utf-8')
                : '';
            return {
                runtimeSessionId: response.runtimeSessionId ?? runtimeSessionId,
                statusCode: response.statusCode,
                body: text
            };
        } catch (error) {
            this.handleError(error, 'invokeAgentRuntime');
        }
    }
}
// Export a singleton instance
const agentService = new AgentService();
export const invokeAgentRuntime = (params) => agentService.invokeAgentRuntime(params);
// Also export the class for backward compatibility
export { AgentService as Agent };
