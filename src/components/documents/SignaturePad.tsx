//src/components/documents/SignaturePad.tsx
import React, { useState } from "react";
import toast from "react-hot-toast";
import { PenLine } from "lucide-react";
import { Button } from "../ui/Button";
import { signDocument } from "../../services/documentService";

interface SignaturePadProps {
  documentId: string;
  onSigned: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ documentId, onSigned }) => {
  const [signature, setSignature] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSign = async () => {
    if (!signature) {
      toast.error("Please choose a signature image");
      return;
    }

    const formData = new FormData();
    formData.append("signature", signature);

    try {
      setIsSubmitting(true);
      await signDocument(documentId, formData);
      toast.success("Document signed successfully");
      setSignature(null);
      onSigned();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to sign document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept=".png,.jpg,.jpeg"
        onChange={(e) => setSignature(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
      />

      {signature && (
        <p className="text-xs text-gray-500">
          Selected: {signature.name}
        </p>
      )}

      <Button
        size="sm"
        variant="primary"
        isLoading={isSubmitting}
        leftIcon={<PenLine size={16} />}
        onClick={handleSign}
      >
        Sign Document
      </Button>
    </div>
  );
};