import express from "express";
import router from "./routes/index_route";
import { sendSuccessResponse } from "./utils/response_handler";

const app = express();

// Accept incoming data as json.
app.use(express.json());

// Initilize the api router
app.use("/api", router);

// Send application server is working fine.
app.get("/", (req, res) => {
    return sendSuccessResponse(res, 200, "Application is working");
});

// Extract and configure the port in env.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started at host:http://localhost:${PORT}`);
});