import React from 'react'
import { DelegateCommonProblemTypes } from '@delegates/constants'

import CommonTroubleShootingSteps from './CommonTroubleShootingSteps'

const KubernetesManfiestTroubleShooting = () => {
  return (
    <>
      <CommonTroubleShootingSteps delegateType={DelegateCommonProblemTypes.KUBERNETES_MANIFEST} />
    </>
  )
}
export default KubernetesManfiestTroubleShooting
