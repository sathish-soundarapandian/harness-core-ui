/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Connectors } from '@connectors/constants'
import type { CardSelectOption } from './ChangeSourceDrawer.types'

export enum ChangeSourceTypes {
  HarnessCD = 'HarnessCD',
  HarnessCDNextGen = 'HarnessCDNextGen',
  PagerDuty = 'PagerDuty',
  K8sCluster = 'K8sCluster',
  HarnessFF = 'HarnessFF',
  CustomDeploy = 'CustomDeploy',
  CustomIncident = 'CustomIncident',
  CustomInfrastructure = 'CustomInfrastructure',
  CustomFF = 'CustomFF'
}

export const CustomChangeSourceList = [
  ChangeSourceTypes.CustomFF,
  ChangeSourceTypes.CustomDeploy,
  ChangeSourceTypes.CustomIncident,
  ChangeSourceTypes.CustomInfrastructure
]

export const ChangeSourceCategoryName = {
  DEPLOYMENT: 'Deployment',
  INFRASTRUCTURE: 'Infrastructure',
  ALERT: 'Alert',
  FEATURE_FLAG: 'FeatureFlag',
  INCIDENTS: 'Incidents'
}

export const ChangeSourceCategoryOptions = [
  { label: 'deploymentsText', value: ChangeSourceCategoryName.DEPLOYMENT },
  { label: 'infrastructureText', value: ChangeSourceCategoryName.INFRASTRUCTURE },
  { label: 'cv.changeSource.incident', value: ChangeSourceCategoryName.ALERT },
  { label: 'common.purpose.cf.continuous', value: ChangeSourceCategoryName.FEATURE_FLAG }
]

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
    label: 'common.repo_provider.customLabel',
    value: ChangeSourceTypes.CustomInfrastructure,
    category: ChangeSourceCategoryName.INFRASTRUCTURE
  },
  {
    label: 'common.repo_provider.customLabel',
    value: ChangeSourceTypes.CustomIncident,
    category: ChangeSourceCategoryName.ALERT
  },
  {
    label: 'common.repo_provider.customLabel',
    value: ChangeSourceTypes.CustomFF,
    category: ChangeSourceCategoryName.FEATURE_FLAG
  }

  // TODO: Show HarnessFF ones BE is ready
  // {
  //   label: 'cv.changeSource.FeatureFlag.label',
  //   value: ChangeSourceTypes.HarnessFF,
  //   category: ChangeSourceCategoryName.FEATURE_FLAG
  // }
]

export const ChangeSourceFieldNames = {
  CATEGORY: 'category',
  TYPE: 'type'
}

export const internalChangeSources = [ChangeSourceCategoryName.FEATURE_FLAG]
