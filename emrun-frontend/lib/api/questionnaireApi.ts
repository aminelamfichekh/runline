import { apiClient } from './client';

export interface QuestionnaireSessionResponse {
  session_uuid: string;
  session_id: number;
}

export interface QuestionnaireUpdateResponse {
  session_uuid: string;
  completed: boolean;
}

export interface QuestionnaireAttachResponse {
  profile: any;
  questionnaire_completed: boolean;
}

export const questionnaireApi = {
  async createSession(payload?: any): Promise<QuestionnaireSessionResponse> {
    const data = await apiClient.post<QuestionnaireSessionResponse>(
      '/questionnaire/sessions',
      payload ? { payload } : {}
    );
    return data;
  },

  async updateSession(
    sessionUuid: string,
    payload: any,
    completed?: boolean
  ): Promise<QuestionnaireUpdateResponse> {
    const data = await apiClient.put<QuestionnaireUpdateResponse>(
      `/questionnaire/sessions/${sessionUuid}`,
      {
        payload,
        ...(completed !== undefined ? { completed } : {}),
      }
    );
    return data;
  },

  async attachSession(sessionUuid: string): Promise<QuestionnaireAttachResponse> {
    const data = await apiClient.post<QuestionnaireAttachResponse>(
      `/questionnaire/sessions/${sessionUuid}/attach`,
      {}
    );
    return data;
  },
};




