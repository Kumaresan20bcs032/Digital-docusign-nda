import docusign from "docusign-esign";
import path from "path";
import fs from "fs";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response_handler";

let dsApiClient = new docusign.ApiClient();

const scopes = ["signature", "impersonation"];

//configure jwt lifeseconds.
const jwtLifeSeconds = 60 * 60;

// set oauth base path for client login.
dsApiClient.setOAuthBasePath("account-d.docusign.com");

// If new account then sent oauth redirection.
// https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id={replace your integration key}&redirect_uri={http://localhost:port}

// Generate jwt token for each user.
export const generateJWTAcessToken = async (req, res) => {
    try {
        const results = await dsApiClient.requestJWTUserToken(
            process.env.INTEGRATION_KEY,
            process.env.USER_ID,
            scopes,
            fs.readFileSync(path.join(process.cwd(), 'rsa.key')),
            jwtLifeSeconds
        );

        const token = { accessToken: results.body.access_token };
        console.log("token:", token);

        return sendSuccessResponse(res, 200, "Application token", token);
    }
    catch (error) {
        console.error("Token error:", error.message);
    }
}