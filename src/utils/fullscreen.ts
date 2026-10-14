export const requestAppFullscreen = () => {
  try {
    const isAlreadyFull = !!document.fullscreenElement || 
      !!(document as any).webkitFullscreenElement ||
      !!(document as any).mozFullScreenElement ||
      !!(document as any).msFullscreenElement;

    if (!isAlreadyFull) {
      const target = (document.documentElement || document.body) as any;
      const req = target.requestFullscreen ||
                  target.webkitRequestFullscreen ||
                  target.mozRequestFullScreen ||
                  target.msRequestFullscreen;
      if (req) {
        const res = req.call(target);
        if (res && typeof res.catch === 'function') {
          res.catch(() => {});
        }
      }
    }
  } catch {
    // Ignore permissions restrictions if embedded in iframe
  }
};

export const exitAppFullscreen = () => {
  try {
    const isAlreadyFull = !!document.fullscreenElement || 
      !!(document as any).webkitFullscreenElement ||
      !!(document as any).mozFullScreenElement ||
      !!(document as any).msFullscreenElement;

    if (isAlreadyFull) {
      const doc = document as any;
      const exit = doc.exitFullscreen ||
                   doc.webkitExitFullscreen ||
                   doc.mozCancelFullScreen ||
                   doc.msExitFullscreen;
      if (exit) {
        const res = exit.call(doc);
        if (res && typeof res.catch === 'function') {
          res.catch(() => {});
        }
      }
    }
  } catch {
    // Ignore permissions restrictions
  }
};

export const toggleAppFullscreen = () => {
  const isAlreadyFull = !!document.fullscreenElement || 
    !!(document as any).webkitFullscreenElement ||
    !!(document as any).mozFullScreenElement ||
    !!(document as any).msFullscreenElement;

  if (isAlreadyFull) {
    exitAppFullscreen();
  } else {
    requestAppFullscreen();
  }
};
