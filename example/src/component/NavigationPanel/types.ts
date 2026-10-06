import type { UseNavigationPanelProps } from '../../hook/useNavigationPanel';

export interface NavigationPanelProps
  extends Omit<UseNavigationPanelProps, 'ref'> {
  disablePagesAmountManagement?: boolean;
}

export type LogsPanelProps = Pick<NavigationPanelProps, 'logs'>;
