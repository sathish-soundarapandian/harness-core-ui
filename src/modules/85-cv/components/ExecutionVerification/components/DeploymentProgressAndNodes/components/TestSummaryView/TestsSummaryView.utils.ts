export const canShowRedirectLink = ({
  isBaselineEnabled,
  activityId,
  baselineVerificationJobInstanceId
}: {
  isBaselineEnabled?: boolean
  baselineVerificationJobInstanceId?: string
  activityId?: string
}): boolean => {
  return Boolean(
    isBaselineEnabled && baselineVerificationJobInstanceId && baselineVerificationJobInstanceId !== activityId
  )
}

export const getTagName = (tagName: string): string => (Boolean(tagName) && tagName !== 'null' ? tagName : '-')

export const canShowPinBaselineConfirmationModal = ({
  isPinned,
  activityId,
  currentBaseline
}: {
  currentBaseline?: string
  activityId?: string
  isPinned: boolean
}): boolean => {
  return Boolean(currentBaseline) && currentBaseline !== activityId && !isPinned
}
