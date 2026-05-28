//src/services/documentService.ts
import API from "./api";
import { NexusDocument } from "../types";

export const getMyDocuments = async (): Promise<{
  success: boolean;
  count: number;
  documents: NexusDocument[];
}> => {
  const response = await API.get("/documents");
  return response.data;
};

export const uploadDocument = async (formData: FormData) => {
  const response = await API.post("/documents/upload", formData);
  return response.data;
};

export const signDocument = async (documentId: string, formData: FormData) => {
  const response = await API.post(`/documents/${documentId}/sign`, formData);
  return response.data;
};

export const updateDocumentStatus = async (
  documentId: string,
  status: "pending" | "reviewed" | "signed" | "rejected",
) => {
  const response = await API.patch(`/documents/${documentId}/status`, { status });
  return response.data;
};

export const deleteDocument = async (documentId: string) => {
  const response = await API.delete(`/documents/${documentId}`);
  return response.data;
};