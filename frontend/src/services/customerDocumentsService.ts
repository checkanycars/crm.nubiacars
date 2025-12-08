import axios from '../lib/axios';

export interface CustomerDocument {
  id: number;
  customer_id: number;
  filename: string;
  stored_name: string;
  path: string;
  size: number;
  formatted_size: string;
  mime_type: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface UploadDocumentsResponse {
  message: string;
  data: CustomerDocument[];
}

export const customerDocumentsService = {
  /**
   * Get all documents for a customer
   */
  async getDocuments(customerId: number): Promise<CustomerDocument[]> {
    const response = await axios.get<{ data: CustomerDocument[] }>(
      `/api/customers/${customerId}/documents`
    );
    return response.data.data;
  },

  /**
   * Upload documents for a customer
   */
  async uploadDocuments(
    customerId: number,
    files: File[]
  ): Promise<UploadDocumentsResponse> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('documents[]', file);
    });

    const response = await axios.post<UploadDocumentsResponse>(
      `/api/customers/${customerId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  },

  /**
   * Get a single document
   */
  async getDocument(
    customerId: number,
    documentId: number
  ): Promise<CustomerDocument> {
    const response = await axios.get<{ data: CustomerDocument }>(
      `/api/customers/${customerId}/documents/${documentId}`
    );
    return response.data.data;
  },

  /**
   * View a document in a new tab
   */
  async viewDocument(
    customerId: number,
    documentId: number
  ): Promise<void> {
    const response = await axios.get(
      `/api/customers/${customerId}/documents/${documentId}/download`,
      {
        responseType: 'blob',
      }
    );

    // Create a blob URL and open in new tab
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Clean up after a delay to ensure the new tab has loaded
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  },

  /**
   * Download a document
   */
  async downloadDocument(
    customerId: number,
    documentId: number,
    filename: string
  ): Promise<void> {
    const response = await axios.get(
      `/api/customers/${customerId}/documents/${documentId}/download`,
      {
        responseType: 'blob',
      }
    );

    // Create a blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Delete a document
   */
  async deleteDocument(
    customerId: number,
    documentId: number
  ): Promise<void> {
    await axios.delete(
      `/api/customers/${customerId}/documents/${documentId}`
    );
  },
};