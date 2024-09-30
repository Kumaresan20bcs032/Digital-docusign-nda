import express from "express";
import { sendSuccessResponse, sendErrorResponse } from "../utils/response_handler";
import { generateJWTAcessToken } from "../digital_docs_agreements/edocu_sign_config";
import { sendHTMLEnvelopeToSign } from "../digital_docs_agreements/third_party_nda";

const router = express.Router();


router.get("/jwt-user-token", generateJWTAcessToken);
router.get("/three-part-nda", sendHTMLEnvelopeToSign);

router.get("/success", (req, res) => {
    console.log("Success fully signed");
    return sendSuccessResponse(res, 200, "User signed in successfully", {});
});



export default router;