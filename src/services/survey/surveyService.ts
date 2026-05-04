import authApi from '@/services/core/apiAuth';
import type { OnboardingFormData } from '@/pages/Setup/OnboardingPage';

function toSnakeCase(data: OnboardingFormData) {
  return {
    team_size:          data.teamSize,
    daily_volume:       data.dailyVolume,
    main_channel:       data.mainChannel,
    main_channel_other: data.mainChannelOther,
    uses_ai:            data.usesAI,
    biggest_pain:       data.biggestPain,
    crm_experience:     data.crmExperience,
    main_goal:          data.mainGoal,
  };
}

export const surveyService = {
  async saveSurvey(data: OnboardingFormData): Promise<void> {
    await authApi.post('/setup_survey', toSnakeCase(data));
  },

  async getStatus(): Promise<{ completed: boolean }> {
    const { data } = await authApi.get<{ data: { completed: boolean } }>('/setup_survey');
    return data.data;
  },
};
