import { getSignedUrl, getSignedCookies } from "@aws-sdk/cloudfront-signer";

class DistributionService {
    constructor() {
    }

    async getSignedUrl(params) {
        return getSignedUrl(params);
    }

    async getSignedUrlWithPolicy(params) {
        return getSignedUrl(params);
    }

    async getSignedCookies(params) {
        return getSignedCookies(params);
    }

    async getSignedCookiesWithPolicy(params) {
        return getSignedCookies(params);
    }

}

// Export a singleton instance
const distributionService = new DistributionService();
export const getSignedUrl = (params) => distributionService.getSignedUrl(params);
export const getSignedUrlWithPolicy = (params) => distributionService.getSignedUrlWithPolicy(params);
export const getSignedCookies  = (params) => distributionService.getSignedCookies (params);
export const getSignedCookiesWithPolicy = (params) => distributionService.getSignedCookiesWithPolicy(params);

// Also export the class for backward compatibility
export { DistributionService as Distribution };