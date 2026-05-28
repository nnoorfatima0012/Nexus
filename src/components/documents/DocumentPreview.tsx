//src/components/documents/DocumentPreview.tsx
import React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "../ui/Button";
import { NexusDocument } from "../../types";

interface DocumentPreviewProps {
  document: NexusDocument | null;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
}) => {
  if (!document) {
    return (
      <div className="text-sm text-gray-500">
        Select a document to preview it here.
      </div>
    );
  }

  const isPdf = document.fileType === "application/pdf";
  const isImage = document.fileType.startsWith("image/");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          {document.title}
        </h3>
        <p className="text-xs text-gray-500">{document.fileName}</p>
      </div>

      {isPdf && (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(document.fileUrl)}&embedded=true`}
          title={document.title}
          className="w-full h-96 border rounded-md"
        />
      )}

      {isImage && (
        <img
          src={document.fileUrl}
          alt={document.title}
          className="w-full max-h-96 object-contain border rounded-md"
        />
      )}

      {!isPdf && !isImage && (
        <p className="text-sm text-gray-500">
          Preview is available for PDF and image files. Open this file in a new
          tab.
        </p>
      )}

      {document.signatureUrl && (
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Signature</p>
          <img
            src={document.signatureUrl}
            alt="Document signature"
            className="max-h-24 border rounded-md bg-white p-2"
          />
        </div>
      )}

      <a href={document.fileUrl} target="_blank" rel="noreferrer">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ExternalLink size={16} />}
        >
          Open File
        </Button>
      </a>
    </div>
  );
};
