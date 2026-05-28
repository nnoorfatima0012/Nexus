// //server/src/modules/documents/document.routes.js
const express = require("express");

const {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  updateDocumentStatus,
  signDocument,
  deleteDocument,
} = require("./document.controller");

const { protect } = require("../../middleware/auth.middleware");
const upload = require("../../middleware/upload.middleware");

const router = express.Router();

router.use(protect);


router.post("/upload", upload.single("document"), uploadDocument);
router.get("/", getMyDocuments);
router.get("/:id", getDocumentById);
router.patch("/:id/status", updateDocumentStatus);
router.post("/:id/sign", upload.single("signature"), signDocument);
router.delete("/:id", deleteDocument);

module.exports = router;