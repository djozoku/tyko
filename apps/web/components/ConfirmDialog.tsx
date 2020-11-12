import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';

interface ConfirmDialogProps {
  isOpen: boolean;
  handleClose: () => void;
  titleId: string;
  title: string;
  action: () => void;
  confirmText: string;
  confirm: string;
}

const ConfirmDialog = (props: ConfirmDialogProps) => {
  const { isOpen, handleClose, titleId, title, confirmText, action, confirm } = props;
  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby={titleId} fullWidth maxWidth="sm">
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{confirmText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Peruuta
        </Button>
        <Button onClick={action} color="secondary">
          {confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
