import { enqueueSnackbar } from 'notistack';

export const showSuccess = (message: string) => {
  enqueueSnackbar(message, {
    variant: 'success',
    autoHideDuration: 4000,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center',
    },
  });
};

export const showError = (message: string) => {
  enqueueSnackbar(message, {
    variant: 'error',
    autoHideDuration: 6000,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center',
    },
  });
};

export const showInfo = (message: string) => {
  enqueueSnackbar(message, {
    variant: 'info',
    autoHideDuration: 4000,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center',
    },
  });
};

export const showWarning = (message: string) => {
  enqueueSnackbar(message, {
    variant: 'warning',
    autoHideDuration: 5000,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'center',
    },
  });
};