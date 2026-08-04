const express = require("express");
const router = express.Router();

// Index - posts -> GET /posts
router.get("/", (req, res) => {
    res.send("GET for posts");
});

// Show - post -> GET /posts/:id
router.get("/:id", (req, res) => {
    res.send("GET for post id");
});

// Post - posts -> POST /posts
router.post("/", (req, res) => {
    res.send("POST for posts");
});

// Delete - post -> DELETE /posts/:id
router.delete("/:id", (req, res) => {
    res.send("DELETE for post id");
});

module.exports = router;