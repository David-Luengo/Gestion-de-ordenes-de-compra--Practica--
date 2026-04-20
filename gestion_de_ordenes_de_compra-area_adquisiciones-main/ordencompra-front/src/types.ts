import { FC, LazyExoticComponent, MouseEvent, ReactNode } from 'react';
// #region routes
export type RouteConfig = {
  /**
   * Route path string
   */
  path: string;
  /**
   * Component caller
   */
  useComponent?: () => JSX.Element | CustomLazyComponent<IsolatedComponent> | ReactNode,
  /**
   * Determines the preferred visibility behavior
   */
  public: boolean;
  /**
   * Determines if the visualization should be forced
   */
  strict?: boolean;
  /**
   * List of route aliases
   */
  symlinks?: string[];
  /**
   * Child routes configuration
   */
  childRoutes?: ChildRouteConfig[];
  /**
   * Optional route meta data
   */
  data?: any;
}

export type ChildRouteConfig = RouteConfig;

export type RoutesMap = RouteConfig[];
// #endregion

// #region providers
export type APIResponse<Payload = unknown> = {
  error?: {
    value: boolean;
    message: string;
    timestamp?: number;
  },
  value?: Payload
}
// #endregion

// #region react modifiers
export type IsolatedComponent = FC<Record<string, never>>;

export type LazyComponent = LazyExoticComponent<IsolatedComponent>;

export type CustomLazyComponent<InnerComponent extends IsolatedComponent> = LazyExoticComponent<InnerComponent>;
// #endregion

// #region Props
// #endregion

// #region State
// #endregion

export type Notification = {
  _id?: string;
  id: string;
  title?: string;
  userAsigned: string;
  description: string;
  timestamp: number;
  read: boolean;
} & (
  {
    isLocal?: boolean;
    storageAccessKey?: string;
  } | {
    isLocal?: never;
    storageAccessKey?: never;
  }
)


export type NotificationsProps = {
  showPanel: boolean;
  notifications?: Notification[];
  onClose: () => void;
  onNotificationsDismiss: (list: Notification[] | MouseEvent) => void;
  onNotificationDismiss: (id: string) => void;
}

export type NotificationsWrapperProps = {
  onNotificationsLoad: (list: Notification[]) => void;
  onPanelClose?: (closed: boolean) => void;
  showPanel?: boolean;
}

export type SignInForm = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

export type FormState = {
  isSubmitting?: boolean;
};

export type SignInFormState = FormState & Partial<SignInForm>;

export type SubmitButtonState = {
  awaitingResponse: boolean;
};

export type SubmitButtonProps = {
  submitting: boolean;
  defaultContent: string | JSX.Element;
  loadingContent?: string | JSX.Element;
};

export type PasswordFieldProps = {
  hideToggler?: boolean;
  compareWith?: string;
};

export type CheckListItemType = 'TruckDocument'
  | 'DriverDocument'
  | 'InspectionMeter'
  | 'ImplementsStatusTruck'
  | 'DocumentFilledJournal'
  | 'EPPDriver';

export type CheckListItem = {
  name: string;
  checked: boolean;
  documentType: CheckListItemType;
};

export type InspeccionesJson = {
  id?: number;
  date?: string;
  vehicle: string;
  inspector: string;
  checklist: CheckListItem[];
};

export type EventsItem = {
  id: number,
  name?: string;
  status: boolean;
  date: string;
  type: string;
  desc: string;
};

export type MantenimientosJson = {
  _id: string;
  patent: string;
  vehicleBrand: string;
  year: number;
  vehicleModel: string;
  mileage: number;
  mechanic: string;
  ote: string;
}

export type ChecklistJson = {
  id: number;
  date: string;
  user: string;
  img: string;
}
