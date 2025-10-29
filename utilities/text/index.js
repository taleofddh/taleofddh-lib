class TextService {
    constructor() {
        // Default configuration for text templates
        this.defaultConfig = {
            companyName: 'Tale of DDH',
            supportEmail: 'enquiries@servease.io',
            website: 'https://servease.io'
        };
    }

    get(templateName, templateData) {
        let result;
        switch(templateName) {
            case 'subscription':
                result = this.subscriptionText(templateData);
                break;
            case 'enquiry':
                result = this.enquiryText(templateData);
                break;
            case 'quotation':
                result = this.quotationText(templateData);
                break;
            case 'instruction':
                result = this.instructionText(templateData);
                break;
            default:
                result = '';
                break;
        }
        return result;
    }

    subscriptionText(templateData) {
        return `We are delighted that you chose to stay connected with us. This email is an acknowledgement for the same.
        
        ${templateData.servEaseEnquiryList && templateData.servEaseEnquiryList.length > 0 ?
        `Your Response to ${this.defaultConfig.companyName} Enquiry
        | Enquiry | Response | 
        ${this.enquiries(templateData.servEaseEnquiryList)}` : ``}
        
        We shall keep you informed about our roadmap and plan of launching new services.
        
        ${this.defaultConfig.companyName} Team
        
        If you don't wish to receive emails in future, you may unsubscribe by writing to ${this.defaultConfig.supportEmail} with subject 'UNSUBSCRIBE ME'`;
    }

    enquiryText(templateData) {
        return `Dear ${templateData.name},

        We have received following service enquiry # ${templateData.number} from you.

        ${templateData.message}

        This email is an acknowledgement for the same. We'll revert back on your query shortly.

        ${templateData.responseList && templateData.responseList.length > 0 ?
        `Your Response to Questionnaire
        | Question | Response |
        ${this.responses(templateData.responseList)}` : ``}
        
        ${templateData.servEaseEnquiryList && templateData.servEaseEnquiryList.length > 0 ?
        `Your Response to ServEase Enquiry
        | Enquiry | Response | 
        ${this.enquiries(templateData.servEaseEnquiryList)}` : ``}
        
        ServEase Team`;
    }

    quotationText(templateData) {
        return `Dear ${templateData.name},

        Thank you for using ServEase to compare ${templateData.service} quotations from authorised firms. Based on your responses to the questions, we have curated the quotations for you. Your enquiry reference number is ${templateData.quotationNumber}. Please click on button below to retrieve your quotations. These quotes are valid for 30 days

        Please copy and paste the following link in your browser to view your ${templateData.service} quotes [${templateData.baseUrl}/${templateData.category}-quotation-retrieve?key=${templateData.key}]

        This email is an acknowledgement for the same. We'll revert back on your query shortly.

        ${templateData.responseList && templateData.responseList.length > 0 ?
        `Your Response to Questionnaire
        | Question | Response |
        ${this.responses(templateData.responseList)}` : ``}
        
        ${templateData.servEaseEnquiryList && templateData.servEaseEnquiryList.length > 0 ?
        `Your Response to ServEase Enquiry
        | Enquiry | Response | 
        ${this.enquiries(templateData.servEaseEnquiryList)}` : ``}
        
        If you would like to change any of the responses, please resubmit details for amended quotes.

        We look forward to hearing from you.

        Kind regards,
        The ServEase Team

        You received this email because {{email}} was used to generate a quotation on ${this.defaultConfig.website}. The contents of this email message and any attachments are intended solely for the addressee(s) and may contain confidential and/or privileged information and may be legally protected from disclosure. If you are not the intended recipient of this message or their agent, or if this message has been addressed to you in error, please immediately alert the sender by reply email and then delete this message and any attachments. If you are not the intended recipient, you are hereby notified that any use, dissemination, copying, or storage of this message or its attachments is strictly prohibited. If you don't wish to receive emails from us in future, you may unsubscribe by writing to ${this.defaultConfig.supportEmail} with subject 'UNSUBSCRIBE ME'. ServEase Ltd is incorporated in England and Wales under company registration number 12325243. Our registered office address is 54 Middleton Gardens, Greater London, IG2 6DX, United Kingdom. ServEase Ltd is registered with the UK Information Commissioner's Office for data protection under ICO reference number ZA839745.`;
    }

    instructionText(templateData) {
        return `Dear ${templateData.supplierQuote.supplier.name},

        We are delighted to inform you that ${templateData.customerName} has reviewed ${templateData.service} quotations from ServEase and wish to instruct your firm for their ${templateData.service} requirements.

        Kindly contact the client to complete the instruction and on-boarding process.
        
        Client details
        Name: ${templateData.customerName}
        Email: ${templateData.customerEmail}
        Instructions: ${templateData.customerInstruction}
        
        ${templateData.service} requirements are listed below
        | Question | Response |
        ${this.responses(templateData.responseList)}
        
        If you would like to change any of the responses, please resubmit details for amended quotes.

        ${templateData.service} partner
        ${templateData.supplierQuote.supplier.name}
        ${templateData.supplierQuote.supplier.shortDescription}

        ${templateData.service} cost details
        Legal Fee: £ ${templateData.supplierQuote.legalFeeTotal}
        Base Amount: £ ${templateData.supplierQuote.legalFee.baseFee}
        Tax Amount: £ ${templateData.supplierQuote.legalFee.taxAmount}
        Disbursments: £ ${templateData.supplierQuote.disbursementsTotal}
        ${this.fees(templateData.disbursementList)}
        Tax Amount: £ ${templateData.supplierQuote.disbursementsTax}
        Additional Fee: £ ${templateData.supplierQuote.additionalFeeTotal}
        ${this.fees(templateData.additionalFeeList)}
        Tax Amount: £ ${templateData.supplierQuote.additionalFeeTax}

        Total: ${templateData.supplierQuote.totalFee}

        Stamp Duty: £ ${templateData.supplierQuote.stampDutyTotal}
        Land Registration: £ ${templateData.supplierQuote.landRegistrationTotal}
        
        What is included in our Legal Fees?
        In our legal service we include electronic ID checks, bank transfer fees, acting for a lender, completing a Stamp Duty Land Tax Return, Local Search, Drainage Search, Environmental Search, Mining Search (if applicable) and Land Registry (Bankruptcy and Priority) Searches. We think it's much easier to have them all in one fee.

        What do we assume when calculating our Legal Fees?
        To be able to offer simple pricing, we have to make some assumptions and these are that your case is a straightforward purchase. If things are not as straightforward as we assume then there may be additional costs which we will always explain to you and want to agree with you as soon as we become aware of them. Should we find any unexpected issues during the case, we will explain and discuss these with you in writing as soon as possible and agree any additional fees with you before we carry out the work. We want to avoid any surprises when you receive our bill at the end of your case which is why it is important for you to let us know as much information about your case as you can at the beginning.
        For Leasehold properties the landlord is likely to charge a registration fee. This fee is not included within the quote as it is charged at the landlord's discretion and cannot be known without first contacting the landlord. We will advise you of these costs during your case and in writing as soon as we become aware of them.
        Our Legal Fee is only payable if your case completes. If additional work is identified during your case as outlined above then this is not included in our no completion, no fee arrangement.

        Kind regards,
        ServEase Team

        The contents of this email message and any attachments are intended solely for the addressee(s) and may contain confidential and/or privileged information and maybe legally protected from disclosure. If you are not the intended recipient of this message or their agent, or if this message has been addressed to you in error, please immediately alert the sender by reply email and then delete this message and any attachments. If you are not the intended recipient, you are hereby notified that any use, dissemination, copying, or storage of this message or its attachments is strictly prohibited. If you don't wish to receive emails from us in future, you may unsubscribe by writing to ${this.defaultConfig.supportEmail} with subject 'UNSUBSCRIBE ME'. ServEase Ltd is incorporated in England and Wales under company registration number 12325243. Our registered office address is 54 Middleton Gardens, Greater London, IG2 6DX, United Kingdom. ServEase Ltd is registered with the UK Information Commissioner's Office for data protection under ICO reference number ZA839745.`;
    }

    responses(data) {
        if (!data || !Array.isArray(data)) {
            console.log('No response data provided');
            return '';
        }
        
        console.log(data);
        let result = ``;
        for (const response of data) {
            if (!response.hidden) {
                result += '| ' + response.question + ' | ' + response.choice + ' |';
            }
        }
        return result;
    }

    enquiries(data) {
        if (!data || !Array.isArray(data)) {
            console.log('No enquiry data provided');
            return '';
        }
        
        console.log(data);
        return data.map((item) =>
            `| ${item.enquiry} | ${item.response} |`
        ).join('\n');
    }

    fees(data) {
        if (!data || !Array.isArray(data)) {
            return '';
        }
        
        return data.map((item) =>
            `${item.type}: £ ${item.baseFee}`
        ).join('\n');
    }

    updateConfig(newConfig) {
        this.defaultConfig = { ...this.defaultConfig, ...newConfig };
    }
}

// Export a singleton instance
const textService = new TextService();
export const get = (templateName, templateData) => textService.get(templateName, templateData);
export const updateConfig = (config) => textService.updateConfig(config);