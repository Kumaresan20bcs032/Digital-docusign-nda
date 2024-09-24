import express from "express";
const app = express();




app.get("/", (req, res) => {
    return res.json({ status_code: 200, status: true, message: "Application working fine." });
})


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server started at host:http://localhost:${PORT}`);
})