/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { get, pick } from 'lodash-es'
import cx from 'classnames'

import { Container } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { DeploymentStageConfig } from 'services/cd-ng'

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isValueRuntimeInput } from '@common/utils/utils'

import { MultiEnvironmentsInputSetForm } from './MultiEnvironmentsInputSetForm'
import { StepWidget } from '../../AbstractSteps/StepWidget'
import factory from '../../PipelineSteps/PipelineStepFactory'
import { StepType } from '../../PipelineSteps/PipelineStepInterface'
import type { StageInputSetFormProps } from '../StageInputSetForm'

import css from '../PipelineInputSetForm.module.scss'

export function EnvironmentGroupInputSetForm({
  // This is the resolved pipeline yaml
  deploymentStage,
  // This is the resolved/updated template yaml
  deploymentStageTemplate,
  path,
  readonly,
  viewType,
  stageIdentifier,
  allowableTypes
}: Omit<StageInputSetFormProps, 'formik' | 'executionIdentifier' | 'stageType'>): React.ReactElement | null {
  const { getString } = useStrings()
  const { NG_SVC_ENV_REDESIGN: isSvcEnvEntityEnabled } = useFeatureFlags()
  const formik = useFormikContext<DeploymentStageConfig>()
  // This is the value of allValues
  const deploymentStageInputSet = get(formik?.values, path, {})

  if (!(isSvcEnvEntityEnabled && deploymentStageTemplate?.environmentGroup && deploymentStage?.environmentGroup)) {
    return null
  }

  /** This shows the env group identifier when env group is fixed in the pipeline studio */
  const environmentGroupLabel = !isValueRuntimeInput(deploymentStageTemplate.environmentGroup.envGroupRef as string)
    ? `: ${deploymentStage.environmentGroup.envGroupRef}`
    : ''

  /** If the template has envGroupRef marked as runtime, then we need to give user the option to select environment group at runtime.
   * The below StepWidget handles fetching the env groups, and then rendering the input field for the same. */
  const showEnvironmentGroupSelectionInputField = isValueRuntimeInput(
    deploymentStageTemplate.environmentGroup.envGroupRef
  )

  /** Show the environments input form if
   * 1. Env group is fixed in the pipeline studio (deploymentStage), or
   * 2. Env group is runtime in pipeline studio and the value is then selected in the input form (deploymentStageInputSet)
   */
  const envGroupRef = isValueRuntimeInput(deploymentStageTemplate.environmentGroup.envGroupRef)
    ? deploymentStageInputSet?.environmentGroup?.envGroupRef
    : deploymentStage?.environmentGroup?.envGroupRef

  return (
    <div id={`Stage.${stageIdentifier}.EnvironmentGroup`} className={cx(css.accordionSummary)}>
      <div className={css.inputheader}>
        {getString('common.environmentGroup.label')}
        {environmentGroupLabel}
      </div>
      <div className={css.nestedAccordions}>
        {showEnvironmentGroupSelectionInputField && (
          <StepWidget
            factory={factory}
            initialValues={pick(deploymentStage, ['environmentGroup'])}
            allowableTypes={allowableTypes}
            template={pick(deploymentStageTemplate, 'environmentGroup')}
            type={StepType.DeployEnvironmentGroup}
            allValues={pick(deploymentStageInputSet, 'environmentGroup')}
            stepViewType={viewType}
            path={path}
            readonly={readonly}
            customStepProps={{
              gitOpsEnabled: deploymentStage.gitOpsEnabled
            }}
          />
        )}
        <Container padding={{ left: 'medium' }}>
          {envGroupRef && (
            <MultiEnvironmentsInputSetForm
              deploymentStage={deploymentStage}
              deploymentStageTemplate={deploymentStageTemplate}
              allowableTypes={allowableTypes}
              path={path}
              viewType={viewType}
              readonly={readonly}
              stageIdentifier={stageIdentifier}
              pathToEnvironments="environmentGroup.environments"
              envGroupRef={envGroupRef}
              entityType="environmentGroup"
            />
          )}
        </Container>
      </div>
    </div>
  )
}
