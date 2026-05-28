//src/components/documents/DocumentUpload.tsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { User } from "../../types";
import { getEntrepreneurs, getInvestors } from "../../services/userService";
import { uploadDocument } from "../../services/documentService";
import { useAuth } from "../../context/AuthContext";

interface DocumentUploadProps {
  onUploaded: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploaded }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [relatedUser, setRelatedUser] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data =
          user?.role === "entrepreneur"
            ? await getInvestors()
            : await getEntrepreneurs();

        setUsers(data.users || []);
      } catch {
        toast.error("Failed to load users");
      }
    };

    loadUsers();
  }, [user?.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !file) {
      toast.error("Title and document file are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("document", file);

    if (relatedUser) {
      formData.append("relatedUser", relatedUser);
    }

    try {
      setIsSubmitting(true);
      await uploadDocument(formData);
      toast.success("Document uploaded successfully");

      setTitle("");
      setRelatedUser("");
      setFile(null);

      onUploaded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Document Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Pitch Deck"
        fullWidth
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Related User
        </label>
        <select
          value={relatedUser}
          onChange={(e) => setRelatedUser(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="">No related user</option>
          {users.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} — {item.role}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Document File
        </label>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
        />
        {file && (
          <p className="text-xs text-gray-500 mt-1">
            Selected: {file.name}
          </p>
        )}
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={isSubmitting}
        leftIcon={<Upload size={18} />}
      >
        Upload Document
      </Button>
    </form>
  );
};