import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark' | 'auto';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  timestamp: number;
}

interface ModalState {
  name: string | null;
  props?: Record<string, any>;
}

interface UISliceState {
  theme: Theme;
  sidebarOpen: boolean;
  activeModal: ModalState;
  notifications: Notification[];
  isLoading: boolean;
  loadingMessage: string | null;
}

const initialState: UISliceState = {
  theme: 'light',
  sidebarOpen: false,
  activeModal: {
    name: null,
    props: undefined,
  },
  notifications: [],
  isLoading: false,
  loadingMessage: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openSidebar: (state) => {
      state.sidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.sidebarOpen = false;
    },

    openModal: (
      state,
      action: PayloadAction<{ name: string; props?: Record<string, any> }>
    ) => {
      state.activeModal = {
        name: action.payload.name,
        props: action.payload.props,
      };
    },
    closeModal: (state) => {
      state.activeModal = {
        name: null,
        props: undefined,
      };
    },
    updateModalProps: (state, action: PayloadAction<Record<string, any>>) => {
      if (state.activeModal.name) {
        state.activeModal.props = {
          ...state.activeModal.props,
          ...action.payload,
        };
      }
    },

    addNotification: (
      state,
      action: PayloadAction<{
        type: NotificationType;
        message: string;
        title?: string;
        duration?: number;
      }>
    ) => {
      const notification: Notification = {
        id: `notification_${Date.now()}_${Math.random()}`,
        type: action.payload.type,
        message: action.payload.message,
        title: action.payload.title,
        duration: action.payload.duration ?? 5000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    setLoading: (
      state,
      action: PayloadAction<{ isLoading: boolean; message?: string }>
    ) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message ?? null;
    },

    showSuccess: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: `notification_${Date.now()}_${Math.random()}`,
        type: 'success',
        message: action.payload,
        duration: 3000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },

    showError: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: `notification_${Date.now()}_${Math.random()}`,
        type: 'error',
        message: action.payload,
        duration: 5000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },

    showWarning: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: `notification_${Date.now()}_${Math.random()}`,
        type: 'warning',
        message: action.payload,
        duration: 4000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },

    showInfo: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: `notification_${Date.now()}_${Math.random()}`,
        type: 'info',
        message: action.payload,
        duration: 3000,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  toggleSidebar,
  openSidebar,
  closeSidebar,
  openModal,
  closeModal,
  updateModalProps,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  showSuccess,
  showError,
  showWarning,
  showInfo,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectTheme = (state: { ui: UISliceState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UISliceState }) =>
  state.ui.sidebarOpen;
export const selectActiveModal = (state: { ui: UISliceState }) =>
  state.ui.activeModal;
export const selectNotifications = (state: { ui: UISliceState }) =>
  state.ui.notifications;
export const selectIsLoading = (state: { ui: UISliceState }) =>
  state.ui.isLoading;
