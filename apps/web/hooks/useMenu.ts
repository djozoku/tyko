import { useState } from 'react';

export const useMenu = () => {
  const [element, setElement] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setElement(event.currentTarget);
  };

  const handleClose = () => {
    setElement(null);
  };

  return {
    el: element,
    open: handleClick,
    close: handleClose,
  };
};
