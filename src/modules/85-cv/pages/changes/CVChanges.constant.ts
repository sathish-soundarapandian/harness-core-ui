/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Connectors } from '@connectors/constants'
import {
  ChangeSourceCategoryName,
  ChangeSourceTypes
} from '../ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { CardSelectOption } from '../ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.types'

export const ChangeSourceConnectorOptions: CardSelectOption[] = [
  {
    label: 'cv.onboarding.changeSourceTypes.HarnessCDNextGen.name',
    value: ChangeSourceTypes.HarnessCDNextGen,
    category: ChangeSourceCategoryName.DEPLOYMENT
  },
  {
    label: 'cv.onboarding.changeSourceTypes.HarnessCDCurrentGen.name',
    value: ChangeSourceTypes.HarnessCD,
    category: ChangeSourceCategoryName.DEPLOYMENT
  },
  { label: 'kubernetesText', value: Connectors.KUBERNETES_CLUSTER, category: ChangeSourceCategoryName.INFRASTRUCTURE },
  { label: 'common.pagerDuty', value: Connectors.PAGER_DUTY, category: ChangeSourceCategoryName.ALERT },
  {
    label: 'common.repo_provider.customLabel',
    value: ChangeSourceTypes.CustomDeploy,
    category: ChangeSourceCategoryName.DEPLOYMENT
  },
  {
    label: 'cv.changeSource.FeatureFlag.label',
    value: ChangeSourceTypes.HarnessFF,
    category: ChangeSourceCategoryName.FEATURE_FLAG
  }
]
