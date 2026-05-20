export function tapLight(enabled = true) {
  if (!enabled) return;
  try { navigator.vibrate?.(8); } catch { /* */ }
}
export function tapMedium(enabled = true) {
  if (!enabled) return;
  try { navigator.vibrate?.(14); } catch { /* */ }
}
export function celebrate(enabled = true) {
  if (!enabled) return;
  try { navigator.vibrate?.([10, 40, 18]); } catch { /* */ }
}
