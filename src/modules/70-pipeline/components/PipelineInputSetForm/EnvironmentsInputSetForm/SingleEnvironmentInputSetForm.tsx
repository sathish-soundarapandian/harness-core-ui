/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { get, set, unset } from 'lodash-es'
import cx from 'classnames'

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { DeploymentStageConfig, Infrastructure } from 'services/cd-ng'

import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import type { DeployStageConfig } from '@pipeline/utils/DeployStageInterface'
import { getCustomStepProps, infraDefinitionTypeMapping } from '@pipeline/utils/stageHelpers'

import { StepWidget } from '../../AbstractSteps/StepWidget'
import factory from '../../PipelineSteps/PipelineStepFactory'
import { StepType } from '../../PipelineSteps/PipelineStepInterface'
import type { StageInputSetFormProps } from '../StageInputSetForm'

import css from '../PipelineInputSetForm.module.scss'

export default function SingleEnvironmentInputSetForm({
  // This is the resolved pipeline yaml
  deploymentStage,
  // This is the resolved/updated template yaml
  deploymentStageTemplate,
  path,
  readonly,
  viewType,
  stageIdentifier,
  allowableTypes
}: Omit<StageInputSetFormProps, 'formik' | 'executionIdentifier'>): React.ReactElement {
  const { getString } = useStrings()
  const formik = useFormikContext<DeploymentStageConfig>()
  const { NG_SVC_ENV_REDESIGN: isSvcEnvEntityEnabled } = useFeatureFlags()
  // This is the value of allValues
  const deploymentStageInputSet = get(formik?.values, path, {})

  return (
    <>
      {isSvcEnvEntityEnabled && deploymentStageTemplate?.environment && deploymentStage?.environment && (
        <div id={`Stage.${stageIdentifier}.Environment`} className={cx(css.accordionSummary)}>
          <StepWidget
            factory={factory}
            initialValues={deploymentStageInputSet}
            allowableTypes={allowableTypes}
            allValues={deploymentStage}
            template={deploymentStageTemplate}
            type={StepType.DeployInfrastructure}
            stepViewType={viewType}
            path={`${path}.environment`}
            readonly={readonly}
            customStepProps={{
              getString,
              // Show clusters instead of infra on env selection
              gitOpsEnabled: deploymentStage.gitOpsEnabled,
              // load service overrides for environment
              serviceRef: deploymentStage.service?.serviceRef,
              // load infrastructures/clusters in environment
              environmentRef: deploymentStage.environment?.environmentRef,
              // load infrastructure runtime inputs
              infrastructureRef: deploymentStage.environment?.infrastructureDefinitions?.[0].identifier,
              // load cluster runtime inputs
              clusterRef: deploymentStage.environment?.gitOpsClusters?.[0].identifier,
              // required for artifact manifest inputs
              stageIdentifier,
              // required for filtering infrastructures
              deploymentType: deploymentStage?.deploymentType,
              customDeploymentData: deploymentStage?.customDeploymentRef
            }}
            onUpdate={values => {
              if (deploymentStageInputSet?.environment) {
                formik?.setValues(set(formik?.values, `${path}.environment`, values.environment))
              }
            }}
          />
          {(deploymentStageTemplate as DeployStageConfig).environment?.infrastructureDefinitions &&
            ((deploymentStageTemplate as DeployStageConfig).environment
              ?.infrastructureDefinitions as unknown as string) !== RUNTIME_INPUT_VALUE && (
              <>
                {deploymentStage.environment?.environmentRef &&
                  ((deploymentStage as DeployStageConfig)?.environment
                    ?.infrastructureDefinitions as unknown as string) !== RUNTIME_INPUT_VALUE && (
                    <div className={css.inputheader}>{getString('infrastructureText')}</div>
                  )}
                {deploymentStageTemplate.environment?.infrastructureDefinitions
                  ?.map((infrastructureDefinition, index) => {
                    return (
                      <>
                        <StepWidget<Infrastructure>
                          key={infrastructureDefinition.identifier}
                          factory={factory}
                          template={infrastructureDefinition.inputs?.spec}
                          initialValues={{
                            ...deploymentStageInputSet?.environment?.infrastructureDefinitions?.[index]?.inputs?.spec,
                            environmentRef: deploymentStage?.environment?.environmentRef,
                            infrastructureRef: infrastructureDefinition.identifier,
                            deploymentType: deploymentStage?.deploymentType
                          }}
                          allowableTypes={allowableTypes}
                          allValues={{
                            ...deploymentStage?.environment?.infrastructureDefinitions?.[index]?.inputs?.spec,
                            environmentRef: deploymentStage?.environment?.environmentRef,
                            infrastructureRef: infrastructureDefinition.identifier
                          }}
                          type={
                            (infraDefinitionTypeMapping[infrastructureDefinition?.inputs?.type as StepType] ||
                              infrastructureDefinition?.inputs?.type) as StepType
                          }
                          path={`${path}.environment.infrastructureDefinitions.${index}.inputs.spec`}
                          readonly={readonly}
                          stepViewType={viewType}
                          customStepProps={{
                            ...getCustomStepProps((deploymentStage?.deploymentType as StepType) || '', getString),
                            serviceRef: deploymentStage?.service?.serviceRef,
                            environmentRef: deploymentStage?.environment?.environmentRef,
                            infrastructureRef: deploymentStage?.environment?.infrastructureDefinitions?.[0].identifier
                          }}
                          onUpdate={data => {
                            /* istanbul ignore next */
                            if (
                              deploymentStageInputSet?.environment?.infrastructureDefinitions?.[index]?.inputs?.spec
                            ) {
                              unset(data, 'environmentRef')
                              unset(data, 'infrastructureRef')
                              deploymentStageInputSet.environment.infrastructureDefinitions[index].inputs.spec = data
                              formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                            }
                          }}
                        />
                      </>
                    )
                  })
                  .filter(data => data)}
              </>
            )}
        </div>
      )}
    </>
  )
}
