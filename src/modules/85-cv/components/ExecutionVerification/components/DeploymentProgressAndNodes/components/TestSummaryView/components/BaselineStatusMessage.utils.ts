import moment from 'moment'
import { VerificationStatus } from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeEventCard/ChangeEventCard.constant'
import type { VerificationOverview } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'
import { defaultDateFormat } from '../../../DeploymentProgressAndNodes.constants'

export const getStatusMessage = (
  data: VerificationOverview | null,
  getString: UseStringsReturn['getString']
): string | null => {
  if (!data) {
    return null
  }

  const { verificationStatus, baselineOverview } = data

  if (verificationStatus === VerificationStatus.VERIFICATION_FAILED) {
    return getString('pipeline.verification.baselineMessages.failed')
  } else if (baselineOverview?.baselineExpired) {
    return getString('pipeline.verification.baselineMessages.expired', {
      date: moment(baselineOverview.baselineExpiryTimestamp).format(defaultDateFormat)
    })
  } else if (
    verificationStatus === VerificationStatus.VERIFICATION_PASSED &&
    !baselineOverview?.baselineVerificationJobInstanceId
  ) {
    return getString('pipeline.verification.baselineMessages.passedWithNoBaseline')
  } else if (
    verificationStatus === VerificationStatus.VERIFICATION_PASSED &&
    baselineOverview?.baselineVerificationJobInstanceId
  ) {
    return getString('pipeline.verification.baselineMessages.passed')
  }

  return null
}
