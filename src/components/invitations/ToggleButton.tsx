import { useState, useEffect } from 'react';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import { Tooltip, Box } from '@mui/material';
// utils
import { bgBlur } from 'src/utils/cssStyles';
//
import { IconButtonAnimate } from 'src/components/animate';
import SvgColor from 'src/components/svg-color';
//
import BadgeDot from '../settings/drawer/BadgeDot';
// Locales
import { useLocales } from 'src/locales';
// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  notDefault: boolean;
  onToggle: VoidFunction;
};

export default function ToggleButton({ notDefault, open, onToggle }: Props) {
  const theme = useTheme();
  const { translate } = useLocales();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 0.5,
        right: 24,
        bottom: 24,
        zIndex: 999,
        position: 'fixed',
        borderRadius: '50%',
        boxShadow: `-12px 12px 32px -4px ${alpha(
          theme.palette.mode === 'light' ? theme.palette.grey[600] : theme.palette.common.black,
          0.36
        )}`,
        ...bgBlur({ color: theme.palette.background.default }),
      }}
    >
      {notDefault && !open && (
        <BadgeDot
          sx={{
            top: 8,
            right: 10,
          }}
        />
      )}

      <Tooltip title={`${translate('invitations.invitations')}`}>
        <IconButtonAnimate color="primary" onClick={onToggle} sx={{ p: 1.25 }}>
          <SvgColor src="/assets/icons/navbar/ic_mail.svg" />
        </IconButtonAnimate>
      </Tooltip>
    </Box>
  );
}
