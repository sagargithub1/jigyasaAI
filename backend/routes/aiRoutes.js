const express = require("express");
const router = express.Router();
const { getAIResponse } = require("../controllers/aiController");

router.post("/chat", getAIResponse);

module.exports = router;
