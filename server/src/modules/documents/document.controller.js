//server/src/modules/documents/document.controller.js
const streamifier = require("streamifier");
const cloudinary = require("../../config/cloudinary");
const Document = require("./document.model");
const User = require("../users/user.model");
const { createNotification } = require("../notifications/notification.service");
const populateDocument = [
  { path: "uploadedBy", select: "name email role avatarUrl" },
  { path: "relatedUser", select: "name email role avatarUrl" },
  { path: "signedBy", select: "name email role avatarUrl" },
];

const uploadBufferToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      },
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const uploadDocument = async (req, res) => {
  try {
    const { title, relatedUser } = req.body || {};
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Document title is required",
      });
    }

    if (relatedUser) {
      const userExists = await User.findById(relatedUser);

      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "Related user not found",
        });
      }
    }

    const result = await uploadBufferToCloudinary(uploadedFile.buffer, {
      folder: "nexus/documents",
      resource_type: "raw",
      use_filename: true,
      unique_filename: true,
    });
    const latestVersion = await Document.findOne({
      title,
      uploadedBy: req.user._id,
    }).sort({ version: -1 });

    const document = await Document.create({
      title,
      fileName: uploadedFile.originalname,
      fileType: uploadedFile.mimetype,
      fileSize: uploadedFile.size,
      fileUrl: result.secure_url,
      cloudinaryPublicId: result.public_id,
      uploadedBy: req.user._id,
      relatedUser: relatedUser || null,
      version: latestVersion ? latestVersion.version + 1 : 1,
    });

    if (document.relatedUser) {
      await createNotification({
        recipient: document.relatedUser,
        sender: req.user._id,
        type: "document_uploaded",
        title: "New document shared",
        message: `${req.user.name} uploaded a document for you: ${document.title}`,
        entityType: "document",
        entityId: document._id,
      });
    }

    const populatedDocument = await Document.findById(document._id).populate(
      populateDocument,
    );

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document: populatedDocument,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
      error: error.message,
    });
  }
};

const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [{ uploadedBy: req.user._id }, { relatedUser: req.user._id }],
    })
      .populate(populateDocument)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get documents",
      error: error.message,
    });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate(
      populateDocument,
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const canAccess =
      document.uploadedBy._id.toString() === req.user._id.toString() ||
      document.relatedUser?._id?.toString() === req.user._id.toString();

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this document",
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to get document",
      error: error.message,
    });
  }
};

const updateDocumentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "reviewed", "signed", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document status",
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const canUpdate =
      document.uploadedBy.toString() === req.user._id.toString() ||
      document.relatedUser?.toString() === req.user._id.toString();

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this document",
      });
    }

    document.status = status;
    await document.save();

    const populatedDocument = await Document.findById(document._id).populate(
      populateDocument,
    );

    return res.status(200).json({
      success: true,
      message: "Document status updated successfully",
      document: populatedDocument,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update document status",
      error: error.message,
    });
  }
};

const signDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Signature image is required",
      });
    }

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const canSign =
      document.uploadedBy.toString() === req.user._id.toString() ||
      document.relatedUser?.toString() === req.user._id.toString();

    if (!canSign) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to sign this document",
      });
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: "nexus/signatures",
      resource_type: "image",
      use_filename: true,
      unique_filename: true,
    });

    document.signatureUrl = result.secure_url;
    document.signaturePublicId = result.public_id;
    document.signedBy = req.user._id;
    document.signedAt = new Date();
    document.status = "signed";

    await document.save();

    await createNotification({
      recipient: document.uploadedBy,
      sender: req.user._id,
      type: "document_signed",
      title: "Document signed",
      message: `${req.user.name} signed your document: ${document.title}`,
      entityType: "document",
      entityId: document._id,
    });

    const populatedDocument = await Document.findById(document._id).populate(
      populateDocument,
    );

    return res.status(200).json({
      success: true,
      message: "Document signed successfully",
      document: populatedDocument,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to sign document",
      error: error.message,
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (document.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only uploader can delete this document",
      });
    }

    await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
      resource_type: "raw",
    });

    if (document.signaturePublicId) {
      await cloudinary.uploader.destroy(document.signaturePublicId, {
        resource_type: "image",
      });
    }

    await document.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  updateDocumentStatus,
  signDocument,
  deleteDocument,
};
