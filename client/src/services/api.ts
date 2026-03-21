export interface ImageTag {
  label: string;
  confidence: number;
}

interface AnalyzeResponse {
  tags: ImageTag[];
}

interface ApiErrorResponse {
  message?: string;
}

const API_BASE_URL = 'http://localhost:3000';

export async function analyzeImage(file: File): Promise<ImageTag[]> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let message = 'Unexpected error while analyzing image.';

    try {
      const errorBody = (await response.json()) as ApiErrorResponse;
      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Ignore JSON parse failures and keep fallback message.
    }

    throw new Error(message);
  }

  const data = (await response.json()) as AnalyzeResponse;
  return data.tags;
}
