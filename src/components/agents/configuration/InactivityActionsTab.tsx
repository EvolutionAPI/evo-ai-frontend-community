import InactivityActions, { InactivityAction } from '@/pages/Customer/Agents/Agent/sections/InactivityActions';

interface InactivityActionsTabProps {
  actions: InactivityAction[];
  onChange: (actions: InactivityAction[]) => void;
}

export const InactivityActionsTab = ({ actions, onChange }: InactivityActionsTabProps) => {
  return <InactivityActions actions={actions} onChange={onChange} />;
};
