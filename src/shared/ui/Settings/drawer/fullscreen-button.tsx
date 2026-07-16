import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useState, useCallback } from 'react';

import { Iconify } from '../../Iconify';

export function FullScreenButton() {
  const [fullscreen, setFullscreen] = useState(false);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void document.documentElement
        .requestFullscreen()
        .then(() => setFullscreen(true))
        .catch(() => setFullscreen(false));
    } else if (document.exitFullscreen) {
      void document
        .exitFullscreen()
        .then(() => setFullscreen(false))
        .catch(() => setFullscreen(true));
    }
  }, []);

  return (
    <Tooltip title={fullscreen ? 'Exit' : 'Fullscreen'}>
      <IconButton onClick={handleToggleFullscreen} color={fullscreen ? 'primary' : 'default'}>
        <Iconify icon={fullscreen ? 'solar:quit-full-screen-square-outline' : 'solar:full-screen-square-outline'} />
      </IconButton>
    </Tooltip>
  );
}
