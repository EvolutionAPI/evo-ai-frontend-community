export interface DashboardFilterState {
  pipelineId: string;
  teamId: string;
  inboxId: string;
  userId: string;
  since: string;
  until: string;
}

export interface DashboardOption {
  id: string;
  name: string;
}
