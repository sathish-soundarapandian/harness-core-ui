export const canShowPinBaselineButton = ({
  applicableForBaseline,
  isBaselineEnabled,
  isConsoleView
}: {
  applicableForBaseline?: boolean
  isBaselineEnabled?: boolean
  isConsoleView?: boolean
}): boolean => {
  return Boolean(isBaselineEnabled && applicableForBaseline && isConsoleView)
}
