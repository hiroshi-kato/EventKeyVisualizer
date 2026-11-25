export type Platform = 'mac' | 'windows' | 'linux' | 'unknown';

export function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform?.toLowerCase() || '';

  // macOS detection
  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac';
  }

  // Windows detection
  if (platform.includes('win') || userAgent.includes('windows')) {
    return 'windows';
  }

  // Linux detection
  if (platform.includes('linux') || userAgent.includes('linux')) {
    return 'linux';
  }

  return 'unknown';
}

export function getPlatformName(platform: Platform): string {
  switch (platform) {
    case 'mac':
      return 'macOS';
    case 'windows':
      return 'Windows';
    case 'linux':
      return 'Linux';
    default:
      return 'Unknown';
  }
}

export function getModKeyName(platform: Platform): string {
  switch (platform) {
    case 'mac':
      return 'Cmd';
    case 'windows':
    case 'linux':
      return 'Ctrl';
    default:
      return 'Ctrl';
  }
}

export function getMetaKeyLabel(platform: Platform): string {
  switch (platform) {
    case 'mac':
      return '⌘';
    case 'windows':
    case 'linux':
    default:
      return 'Win';
  }
}

export function isModKeyPressed(
  event: { metaKey: boolean; ctrlKey: boolean },
  platform: Platform
): boolean {
  switch (platform) {
    case 'mac':
      return event.metaKey;
    case 'windows':
    case 'linux':
    default:
      return event.ctrlKey;
  }
}

export function getModKeyCode(platform: Platform): string {
  switch (platform) {
    case 'mac':
      return 'Meta';
    case 'windows':
    case 'linux':
    default:
      return 'Control';
  }
}
