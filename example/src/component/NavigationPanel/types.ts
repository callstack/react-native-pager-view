import type {
  EventLog,
  UseNavigationPanelProps,
} from '../../hook/useNavigationPanel';

export interface NavigationPanelProps
  extends Omit<UseNavigationPanelProps, 'ref' | 'logs' | 'pages'> {
  disablePagesAmountManagement?: boolean;
  logs?: EventLog[];
  pages: readonly unknown[];
}

export type LogsPanelProps = { logs: EventLog[] };
