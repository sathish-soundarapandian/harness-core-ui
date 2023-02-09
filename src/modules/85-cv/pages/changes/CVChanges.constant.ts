/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Connectors } from '@connectors/constants'
import type { UseStringsReturn } from 'framework/strings'
import { ChangeSourceTypes } from '../ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'

export const ChangeSourceConnectorOptions = (getString: UseStringsReturn['getString']) => {
  return [
    {
      label: getString('cv.onboarding.changeSourceTypes.HarnessCDNextGen.name'),
      value: ChangeSourceTypes.HarnessCDNextGen
    },
    {
      label: getString('cv.onboarding.changeSourceTypes.HarnessCDCurrentGen.name'),
      value: ChangeSourceTypes.HarnessCD
    },
    {
      label: getString('kubernetesText'),
      value: Connectors.KUBERNETES_CLUSTER
    },
    { label: getString('common.pagerDuty'), value: Connectors.PAGER_DUTY },
    {
      label: getString('cv.changeSource.FeatureFlag.label'),
      value: ChangeSourceTypes.HarnessFF
    },
    {
      label: `${getString('common.repo_provider.customLabel')} - ${getString('deploymentsText')}`,
      value: ChangeSourceTypes.CustomDeploy
    },
    {
      label: `${getString('common.repo_provider.customLabel')} - ${getString('infrastructureText')}`,
      value: ChangeSourceTypes.CustomInfrastructure
    },
    {
      label: `${getString('common.repo_provider.customLabel')} - ${getString('cv.changeSource.incident')}`,
      value: ChangeSourceTypes.CustomIncident
    },
    {
      label: `${getString('common.repo_provider.customLabel')} - ${getString('common.purpose.cf.continuous')}`,
      value: ChangeSourceTypes.CustomFF
    }
  ]
}
