import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import type { UserTour } from '@/types/auth';

class TourService {
  async getTours(): Promise<UserTour[]> {
    const response = await api.get('/user_tours');
    return extractData<UserTour[]>(response);
  }

  async completeTour(tourKey: string, status: 'completed' | 'skipped' = 'completed'): Promise<UserTour> {
    const response = await api.post('/user_tours', {
      tour: { tour_key: tourKey, status },
    });
    return extractData<UserTour>(response);
  }

  async resetTour(tourKey: string): Promise<void> {
    await api.delete(`/user_tours/${tourKey}`);
  }
}

export const tourService = new TourService();
