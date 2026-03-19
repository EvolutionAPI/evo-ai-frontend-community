import apiPublic from '@/services/core/apiPublic';
import type { SurveyDetails } from '@/types/core/survey';

interface SurveyUpdatePayload {
  message: {
    submitted_values: {
      csat_survey_response: {
        rating: number;
        feedback_message?: string;
      };
    };
  };
}

/**
 * Service para API pública de CSAT Survey
 * Endpoint: /public/api/v1/csat_survey/:uuid
 * Não requer autenticação
 */
class SurveyService {
  private baseURL = '/csat_survey';

  /**
   * Buscar detalhes da pesquisa CSAT
   * @param uuid - UUID da pesquisa
   */
  async getSurveyDetails(uuid: string): Promise<SurveyDetails> {
    const { data } = await apiPublic.get<SurveyDetails>(`${this.baseURL}/${uuid}`);
    return data;
  }

  /**
   * Atualizar resposta da pesquisa CSAT
   * @param uuid - UUID da pesquisa
   * @param rating - Avaliação (1-5)
   * @param feedbackMessage - Mensagem de feedback opcional
   */
  async updateSurvey(uuid: string, rating: number, feedbackMessage?: string): Promise<void> {
    const payload: SurveyUpdatePayload = {
      message: {
        submitted_values: {
          csat_survey_response: {
            rating,
            feedback_message: feedbackMessage || '',
          },
        },
      },
    };

    await apiPublic.put(`${this.baseURL}/${uuid}`, payload);
  }
}

export const surveyService = new SurveyService();
export default surveyService;
