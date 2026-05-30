// // //server/src/modules/documents/document.routes.js
// const express = require("express");

// const {
//   uploadDocument,
//   getMyDocuments,
//   getDocumentById,
//   updateDocumentStatus,
//   signDocument,
//   deleteDocument,
// } = require("./document.controller");

// const { protect } = require("../../middleware/auth.middleware");
// const upload = require("../../middleware/upload.middleware");

// const router = express.Router();

// router.use(protect);


// router.post("/upload", upload.single("document"), uploadDocument);
// router.get("/", getMyDocuments);
// router.get("/:id", getDocumentById);
// router.patch("/:id/status", updateDocumentStatus);
// router.post("/:id/sign", upload.single("signature"), signDocument);
// router.delete("/:id", deleteDocument);

// module.exports = router;

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
const validateRequest = require("../../middleware/validate.middleware");
const {
  uploadDocumentValidator,
  documentIdValidator,
  updateDocumentStatusValidator,
} = require("../../validators/document.validators");

const router = express.Router();

router.use(protect);

router.post(
  "/upload",
  upload.single("document"),
  uploadDocumentValidator,
  validateRequest,
  uploadDocument,
);

router.get("/", getMyDocuments);

router.get("/:id", documentIdValidator, validateRequest, getDocumentById);

router.patch(
  "/:id/status",
  updateDocumentStatusValidator,
  validateRequest,
  updateDocumentStatus,
);

router.post(
  "/:id/sign",
  documentIdValidator,
  validateRequest,
  upload.single("signature"),
  signDocument,
);

router.delete("/:id", documentIdValidator, validateRequest, deleteDocument);

module.exports = router;