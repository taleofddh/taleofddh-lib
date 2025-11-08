import { getSignedUrl, getSignedCookies } from "@aws-sdk/cloudfront-signer";

class DistributionService {
    constructor() {
    }

    getSignedUrlWithParameters(params) {
        return getSignedUrl(params);
    }

    getSignedUrlWithPolicy(params) {
        return getSignedUrl(params);
    }

    getSignedCookiesWithParameters(params) {
        return getSignedCookies(params);
    }

    getSignedCookiesWithPolicy(params) {
        return getSignedCookies(params);
    }

    getSignatureParameters(publicKeyId, privateKey, isPolicy = false, prefix = "", minutesToExpire = 30, minutesToGrant = 0, ipAddress = "0.0.0.0/0") {
        const params = {};
        const expiryDate = new Date(new Date().setMinutes(new Date().getMinutes() + minutesToExpire));
        const grantDate = new Date(new Date().setMinutes(new Date().getMinutes() + minutesToGrant));
        if (publicKeyId) {
            params.keyPairId = publicKeyId;
        }
        if (privateKey) {
            params.privateKey = privateKey;
        }
        if (isPolicy) {
            params.policy = JSON.stringify({
                Statement: [
                    {
                        Resource: prefix + '*',
                        Condition: {
                            DateLessThan: {
                                "AWS:EpochTime": new Date(expiryDate).getTime() / 1000, // time in seconds
                            },
                            DateGreaterThan: {
                                "AWS:EpochTime": new Date(grantDate).getTime() / 1000, // time in seconds
                            },
                            IpAddress: ipAddress
                        },
                    },
                ],
            });
        } else {
            if (minutesToExpire) {
                params.dateLessThan = expiryDate;
            }
            if (minutesToGrant) {
                params.dateGreaterThan = grantDate;
            }
            if (ipAddress) {
                params.ipAddress = ipAddress;
            }
        }
        return params;
    }
}

// Export a singleton instance
const distributionService = new DistributionService();
export const getSignedUrlWithParameters = (params) => distributionService.getSignedUrlWithParameters(params);
export const getSignedUrlWithPolicy = (params) => distributionService.getSignedUrlWithPolicy(params);
export const getSignedCookiesWithParameters  = (params) => distributionService.getSignedCookiesWithParameters (params);
export const getSignedCookiesWithPolicy = (params) => distributionService.getSignedCookiesWithPolicy(params);
export const getSignatureParameters = (publicKeyId, privateKey, isPolicy = false, prefix = "", minutesToExpire = 30, minutesToGrant = 0, ipAddress = "0.0.0.0/0") => distributionService.getSignatureParameters(publicKeyId, privateKey, isPolicy, prefix, minutesToExpire, minutesToGrant, ipAddress);

// Also export the class for backward compatibility
export { DistributionService as Distribution };