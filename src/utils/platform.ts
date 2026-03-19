/**
 * Detecta o sistema operacional do usuário
 */
export function isMacOS(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
         /Mac/.test(navigator.userAgent);
}

/**
 * Retorna o modificador de tecla correto para o SO
 */
export function getModifierKey(): 'Cmd' | 'Ctrl' {
  return isMacOS() ? 'Cmd' : 'Ctrl';
}

/**
 * Retorna o símbolo do modificador de tecla correto para o SO
 */
export function getModifierSymbol(): string {
  return isMacOS() ? '⌘' : 'Ctrl';
}
