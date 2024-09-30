import path from "path";
import fs from "node:fs";
import docusign from "docusign-esign";
import { sendErrorResponse, sendSuccessResponse } from "../utils/response_handler";
import dsApiClient, { generateJWTAcessToken } from "./edocu_sign_config";

//create the envelope to send document sign for user.
export const makeEnvelope = (args) => {

    let signer = docusign.Signer.constructFromObject({
        email: args.signerEmail,
        name: args.signerName,
        clientUserId: args.signerClientId,
        recipientId: '1',
        routingOrder: '1',
        roleName: 'Signer',
    });

    // create a cc recipient to receive a copy of the documents, identified by name and email
    // We're setting the parameters via setters
    let cc = new docusign.CarbonCopy.constructFromObject({
        email: args.ccEmail,
        name: args.ccName,
        routingOrder: '2',
        recipientId: '2',
    });

    // add formula tabs
    const price1 = 5;
    const formulaTab1 = docusign.FormulaTab.constructFromObject({
        font: 'helvetica',
        fontSize: 'size11',
        fontColor: 'black',
        anchorString: '/l1e/',
        anchorYOffset: '-8',
        anchorUnits: 'pixels',
        anchorXOffset: '105',
        tabLabel: 'l1e',
        formula: `[l1q] * ${price1}`,
        roundDecimalPlaces: '0',
        required: 'true',
        locked: 'true',
        disableAutoSize: 'false',
    });

    const price2 = 150;
    const formulaTab2 = docusign.FormulaTab.constructFromObject({
        font: 'helvetica',
        fontSize: 'size11',
        fontColor: 'black',
        anchorString: '/l2e/',
        anchorYOffset: '-8',
        anchorUnits: 'pixels',
        anchorXOffset: '105',
        tabLabel: 'l2e',
        formula: `[l2q] * ${price2}`,
        roundDecimalPlaces: '0',
        required: 'true',
        locked: 'true',
        disableAutoSize: 'false',
    });

    const formulaTab3 = docusign.FormulaTab.constructFromObject({
        font: 'helvetica',
        fontSize: 'size11',
        fontColor: 'black',
        anchorString: '/l3t/',
        anchorYOffset: '-8',
        anchorUnits: 'pixels',
        anchorXOffset: '105',
        tabLabel: 'l3t',
        formula: '[l1e] + [l2e]',
        roundDecimalPlaces: '0',
        required: 'true',
        locked: 'true',
        disableAutoSize: 'false',
        bold: 'true',
    });

    const signerTabs = docusign.Tabs.constructFromObject({
        formulaTabs: [formulaTab1, formulaTab2, formulaTab3]
    });
    signer.tabs = signerTabs;

    // Add the recipients to the envelope object
    let recipients = docusign.Recipients.constructFromObject({
        signers: [signer],
        carbonCopies: [cc],
    });

    // add the document
    let htmlDefinition = new docusign.DocumentHtmlDefinition();
    htmlDefinition.source = getHTMLDocument(args);

    let document = new docusign.Document();
    document.name = 'three_party_nda_content.html'; // can be different from actual file name
    document.documentId = '1'; // a label used to reference the doc
    document.htmlDefinition = htmlDefinition;

    // create the envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.emailSubject = 'VUT solutions nda facilitation';
    env.documents = [document];
    env.recipients = recipients;
    env.status = "Sent";

    return env;
}

/**
 * Gets the HTML document
 * @function
 * @private
 * @param {Object} args parameters for the envelope
 * @returns {string} A document in HTML format
 */

function getHTMLDocument(args) {

    let docHTMLContent = fs.readFileSync(args.docFile, { encoding: 'utf8' });

    // Substitute values into the HTML
    // Substitute for: {signerName}, {signerEmail}, {ccName}, {ccEmail}
    // return docHTMLContent
    //     .replace('{signerName}', args.signerName)
    //     .replace('{signerEmail}', args.signerEmail)
    //     .replace('{ccName}', args.ccName)
    //     .replace('{ccEmail}', args.ccEmail)
    //     .replace('/sn1/', '<ds-signature data-ds-role=\"Signer\"/>')
    //     .replace('/l1q/', '<input data-ds-type=\"number\" name=\"l1q\"/>')
    //     .replace('/l2q/', '<input data-ds-type=\"number\" name=\"l2q\"/>');

    return docHTMLContent
        .replace('{result.ownerName}', "Garnuyaa S")
        .replace('{result.agentFirstName}', "Kumaresan R")
        .replace('{result.agentFirstName}', "Kumaresan R")
        .replace('{result.ownerName}', "Garnuyaa S")
        .replace('{result.ownerEmail}', "garunyaa123@yopmail.com")
        .replace('{result.agentEmail}', "kumaresan123@yopmail.com")
        .replace('{result.name}', "Kumaresan R")
        .replace('/sn1/', '<ds-signature data-ds-role=\"Signer\"/>')

}

function makeRecipientViewRequest(args) {


    let viewRequest = new docusign.RecipientViewRequest();


    viewRequest.returnUrl = "http://localhost:3000/api/success" + '?state=123';

    viewRequest.authenticationMethod = 'email';


    viewRequest.email = args.signerEmail;
    viewRequest.userName = args.signerName;
    viewRequest.clientUserId = args.signerClientId;

    return viewRequest;
}




export const sendHTMLEnvelopeToSign = async (req, res) => {
    try {


        const envelopeArgs = {
            signerEmail: "kumaresan123@yopmail.com",
            signerName: "Kumaresan Raja",
            ccName: "Kumaresan Raja",
            ccEmail: "edocusignnode@yopmail.com",
            signerClientId: "66bb0e8b974c85967cceb321",
            docFile: path.join(process.cwd(), 'src', 'Agreement_contents', 'three_party_nda_content.html')

        }

        const { accessToken } = await generateJWTAcessToken();

        dsApiClient.setBasePath(process.env.DEVELOPMENT_URL);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);

        let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

        // Step 1. Make the envelope body
        let envelope = makeEnvelope(envelopeArgs);

        // Step 2. Send the envelope
        let results = await envelopesApi.createEnvelope(process.env.ACCOUNT_ID, {
            envelopeDefinition: envelope,
        });
        let envelopeId = results.envelopeId;

        // Step 3. Create the recipient view
        let viewRequest = makeRecipientViewRequest(envelopeArgs);

        // Call the CreateRecipientView API
        // Exceptions will be caught by the calling function
        results = await envelopesApi.createRecipientView(process.env.ACCOUNT_ID, envelopeId, {
            recipientViewRequest: viewRequest,
        });

        console.log("result url", results);

        return sendSuccessResponse(res, 200, "Nda signing document url", results);
    }
    catch (error) {

        console.error(error);
        return sendErrorResponse(res, 500, error.message);
    }
}