// //src/pages/documents/DocumentsPage.tsx
import React, { useEffect, useState } from "react";
import {
  Download,
  FileText,
  Trash2,
  Upload,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";

import { Card, CardHeader, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { NexusDocument } from "../../types";
import {
  deleteDocument,
  getMyDocuments,
} from "../../services/documentService";
import { DocumentUpload } from "../../components/documents/DocumentUpload";
import { DocumentPreview } from "../../components/documents/DocumentPreview";
import { SignaturePad } from "../../components/documents/SignaturePad";
import { useAuth } from "../../context/AuthContext";

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();

  const [documents, setDocuments] = useState<NexusDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<NexusDocument | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await getMyDocuments();
      setDocuments(data.documents || []);

      if (selectedDocument) {
        const updatedSelected = data.documents.find(
          (doc: NexusDocument) => doc._id === selectedDocument._id,
        );
        setSelectedDocument(updatedSelected || null);
      }
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = async (documentId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this document?");

    if (!confirmDelete) return;

    try {
      await deleteDocument(documentId);
      toast.success("Document deleted successfully");

      if (selectedDocument?._id === documentId) {
        setSelectedDocument(null);
      }

      loadDocuments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete document");
    }
  };

  const usedStorage = documents.reduce((total, doc) => total + doc.fileSize, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">
            Upload, preview, and sign important startup documents
          </p>
        </div>

        <Button
          leftIcon={<Upload size={18} />}
          onClick={() => setShowUpload((prev) => !prev)}
        >
          {showUpload ? "Close Upload" : "Upload Document"}
        </Button>
      </div>

      {showUpload && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Upload New Document</h2>
          </CardHeader>
          <CardBody>
            <DocumentUpload
              onUploaded={() => {
                setShowUpload(false);
                loadDocuments();
              }}
            />
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">
                  {formatFileSize(usedStorage)}
                </span>
              </div>

              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-primary-600 rounded-full"
                  style={{ width: `${Math.min((usedStorage / 10000000) * 100, 100)}%` }}
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Documents</span>
                <span className="font-medium text-gray-900">{documents.length}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Selected Preview</h3>
              <DocumentPreview document={selectedDocument} />
            </div>
          </CardBody>
        </Card>

        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
              <Button variant="outline" size="sm" onClick={loadDocuments}>
                Refresh
              </Button>
            </CardHeader>

            <CardBody>
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="text-sm text-gray-500">No documents uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => {
                    const isUploader = doc.uploadedBy._id === user?.id;

                    return (
                      <div
                        key={doc._id}
                        className="p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-gray-100"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary-50 rounded-lg">
                            <FileText size={24} className="text-primary-600" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {doc.title}
                              </h3>

                              <Badge
                                variant={
                                  doc.status === "signed"
                                    ? "success"
                                    : doc.status === "rejected"
                                    ? "error"
                                    : "secondary"
                                }
                                size="sm"
                              >
                                {doc.status}
                              </Badge>

                              <Badge variant="outline" size="sm">
                                v{doc.version}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>{doc.fileName}</span>
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span>
                                Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                              Uploaded by {doc.uploadedBy.name}
                              {doc.relatedUser && ` for ${doc.relatedUser.name}`}
                            </p>

                            {doc.signedBy && (
                              <p className="text-xs text-success-600 mt-1">
                                Signed by {doc.signedBy.name}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2"
                              aria-label="Preview"
                              onClick={() => setSelectedDocument(doc)}
                            >
                              <Eye size={18} />
                            </Button>

                            <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2"
                                aria-label="Download"
                              >
                                <Download size={18} />
                              </Button>
                            </a>

                            {isUploader && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 text-error-600 hover:text-error-700"
                                aria-label="Delete"
                                onClick={() => handleDelete(doc._id)}
                              >
                                <Trash2 size={18} />
                              </Button>
                            )}
                          </div>
                        </div>

                        {doc.status !== "signed" && doc.relatedUser?._id === user?.id && (
                          <div className="mt-4 ml-14">
                            <SignaturePad
                              documentId={doc._id}
                              onSigned={loadDocuments}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};