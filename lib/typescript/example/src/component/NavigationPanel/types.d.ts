import type { UseNavigationPanelProps } from 'example/src/hook/useNavigationPanel';
export interface NavigationPanelProps extends Omit<UseNavigationPanelProps, 'ref'> {
    disablePagesAmountManagement?: boolean;
}
export declare type LogsPanelProps = Pick<NavigationPanelProps, 'logs'>;
