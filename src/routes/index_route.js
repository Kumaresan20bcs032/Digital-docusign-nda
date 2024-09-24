import express from "express";
import { generateJWTAcessToken } from "../digital_docs_agreements/edocu_sign_config";

const router = express.Router();


router.get("/jwt-user-token", generateJWTAcessToken);


export default router;