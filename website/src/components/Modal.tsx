import { Box, Button, Modal as MuiModal, Typography } from '@mui/material';
import { ReactNode, useId } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  width?: number | string;
};

function Modal({ open, onClose, title, description, children, actions, width = 400 }: ModalProps) {
  const baseId = useId();
  const titleId = title ? `${baseId}-title` : undefined;
  const descriptionId = description ? `${baseId}-description` : undefined;

  const actionContent = actions ?? (
    <Button variant="contained" onClick={onClose} fullWidth>
      閉じる
    </Button>
  );

  return (
    <MuiModal open={open} onClose={onClose} aria-labelledby={titleId} aria-describedby={descriptionId}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        {title && (
          <Typography id={titleId} variant="h6" component="h2" gutterBottom>
            {title}
          </Typography>
        )}
        {description && (
          <Typography id={descriptionId} sx={{ mb: children ? 2 : 0 }}>
            {description}
          </Typography>
        )}
        {children && (
          <Box sx={{ mb: 2 }}>
            {children}
          </Box>
        )}
        {actionContent && (
          <Box>
            {actionContent}
          </Box>
        )}
      </Box>
    </MuiModal>
  );
}

export default Modal;
