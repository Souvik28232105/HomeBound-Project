const express = require("express");
const router = express.Router();

// Index - users -> GET /users
router.get("/", (req, res) => {
    res.send("GET for users");
});

// Show - user -> GET /users/:id
router.get("/:id", (req, res) => {
    res.send("GET for user id");
});

// Post - users -> POST /users
router.post("/", (req, res) => {
    res.send("POST for users");
});

// Delete - user -> DELETE /users/:id
router.delete("/:id", (req, res) => {
    res.send("DELETE for user id");
});

module.exports = router;