import { Button } from '@/shared/ui/button';

import { useTheme, type Theme } from '../model/theme-provider';

const LABELS: Record<Theme, string> = {
  light: 'Light theme',
  dark: 'Dark theme',
  system: 'System theme',
};

export function ModeToggle() {
  const { theme, cycleTheme } = useTheme();

  return (
    <Button
      variant='outline'
      aria-label='Toggle theme'
      onClick={cycleTheme}
    >
      {LABELS[theme]}
    </Button>
  );
}
