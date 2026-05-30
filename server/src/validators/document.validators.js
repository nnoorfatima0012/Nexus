//server/src/validators/document.validators.js
const { body, param } = require("express-validator");

const uploadDocumentValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Document title is required")
    .isLength({ max: 120 })
    .withMessage("Document title cannot exceed 120 characters"),

  body("relatedUser")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("Valid related user ID is required"),
];

const documentIdValidator = [
  param("id").isMongoId().withMessage("Valid document ID is required"),
];

const updateDocumentStatusValidator = [
  param("id").isMongoId().withMessage("Valid document ID is required"),

  body("status")
    .isIn(["pending", "reviewed", "signed", "rejected"])
    .withMessage("Invalid document status"),
];

module.exports = {
  uploadDocumentValidator,
  documentIdValidator,
  updateDocumentStatusValidator,
};