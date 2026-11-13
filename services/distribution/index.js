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

    /**
     * Build CloudFront signing parameters.
     *
     * - ipAddress: optional CIDR. No IP condition is added unless given. IPv6 is only
     *   supported with isPolicy = true; the SDK's canned path accepts IPv4 only.
     * - minutesToGrant: optional delay before the URL becomes valid. No start-time
     *   condition is added unless > 0.
     * - isPolicy: when true, signs a custom policy for exactly `prefix`. Pass
     *   `prefix + '*'` explicitly if a wildcard is required.
     */
    getSignatureParameters(publicKeyId, privateKey, isPolicy = false, prefix = "", minutesToExpire = 30, minutesToGrant = 0, ipAddress = null) {
        const params = {};
        const now = Date.now();
        const expiryDate = new Date(now + minutesToExpire * 60 * 1000);
        const grantDate = minutesToGrant > 0 ? new Date(now + minutesToGrant * 60 * 1000) : null;
        if (publicKeyId) {
            params.keyPairId = publicKeyId;
        }
        if (privateKey) {
            params.privateKey = privateKey;
        }
        if (isPolicy) {
            const condition = {
                DateLessThan: {
                    "AWS:EpochTime": Math.floor(expiryDate.getTime() / 1000), // time in seconds
                },
            };
            if (grantDate) {
                condition.DateGreaterThan = {
                    "AWS:EpochTime": Math.floor(grantDate.getTime() / 1000), // time in seconds
                };
            }
            if (ipAddress) {
                condition.IpAddress = { "AWS:SourceIp": ipAddress };
            }
            params.policy = JSON.stringify({
                Statement: [
                    {
                        Resource: prefix,
                        Condition: condition,
                    },
                ],
            });
        } else {
            if (minutesToExpire) {
                params.dateLessThan = expiryDate;
            }
            if (grantDate) {
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
export const getSignatureParameters = (publicKeyId, privateKey, isPolicy = false, prefix = "", minutesToExpire = 30, minutesToGrant = 0, ipAddress = null) => distributionService.getSignatureParameters(publicKeyId, privateKey, isPolicy, prefix, minutesToExpire, minutesToGrant, ipAddress);

// Also export the class for backward compatibility
export { DistributionService as Distribution };