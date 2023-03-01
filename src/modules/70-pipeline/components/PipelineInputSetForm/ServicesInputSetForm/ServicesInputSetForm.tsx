/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'

import type { DeploymentStageConfig } from 'services/cd-ng'

import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'

import type { StageInputSetFormProps } from '../StageInputSetForm'

import SingleServiceInputSetForm from './SingleServiceInputSetForm'
import MultiServiceInputSetForm from './MultiServiceInputSetForm'

export type DeployServiceEntityData = Pick<DeploymentStageConfig, 'service' | 'services'>

export default function ServicesInputSetForm(
  props: Omit<StageInputSetFormProps, 'formik' | 'executionIdentifier' | 'stageType'>
): React.ReactElement | null {
  const isServiceV2 = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)

  if (!isServiceV2) return null

  const isMultiService = !isEmpty(props.deploymentStageTemplate.services)

  return isMultiService ? <MultiServiceInputSetForm {...props} /> : <SingleServiceInputSetForm {...props} />
}
