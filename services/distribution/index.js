import { getSignedUrl, getSignedCookies } from "@aws-sdk/cloudfront-signer";

class DistributionService {
    constructor() {
    }

    async getSignedUrlWithParameters(params) {
        return getSignedUrl(params);
    }

    async getSignedUrlWithPolicy(params) {
        return getSignedUrl(params);
    }

    async getSignedCookiesWithParameters(params) {
        return getSignedCookies(params);
    }

    async getSignedCookiesWithPolicy(params) {
        return getSignedCookies(params);
    }

}

// Export a singleton instance
const distributionService = new DistributionService();
export const getSignedUrlWithParameters = (params) => distributionService.getSignedUrlWithParameters(params);
export const getSignedUrlWithPolicy = (params) => distributionService.getSignedUrlWithPolicy(params);
export const getSignedCookiesWithParameters  = (params) => distributionService.getSignedCookiesWithParameters (params);
export const getSignedCookiesWithPolicy = (params) => distributionService.getSignedCookiesWithPolicy(params);

// Also export the class for backward compatibility
export { DistributionService as Distribution };