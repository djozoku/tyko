import { useState } from 'react';

interface UseDialogCommonProps {
  handleClose: () => void;
  isOpen: boolean;
}

interface UseDialogProps extends UseDialogCommonProps {
  open: () => void;
}

export const useDialog = (): UseDialogProps => {
  const [isOpen, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const open = () => {
    setOpen(true);
  };

  return { handleClose, isOpen, open };
};

interface UseIdDialogProps extends UseDialogCommonProps {
  open: (id: string) => void;
  id: string;
}

export const useIdDialog = (): UseIdDialogProps => {
  const [isOpen, setOpen] = useState(false);
  const [id, setId] = useState('');

  const handleClose = () => {
    setOpen(false);
  };

  const open = (id: string) => {
    setId(id);
    setOpen(true);
  };

  return { handleClose, isOpen, open, id };
};
