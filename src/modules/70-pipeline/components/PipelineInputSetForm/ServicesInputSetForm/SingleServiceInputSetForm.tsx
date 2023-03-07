/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { defaultTo, get, isEmpty, isNil, pick, set } from 'lodash-es'

import { Container, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import type { DeploymentStageConfig, ServiceSpec } from 'services/cd-ng'

import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { isValueRuntimeInput } from '@common/utils/utils'

import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getStepTypeByDeploymentType, StageType } from '@pipeline/utils/stageHelpers'
import {
  getFlattenedStages,
  getStageIndexFromPipeline
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

// eslint-disable-next-line no-restricted-imports
import PropagateFromServiceV2 from '@cd/components/PipelineStudio/DeployServiceSpecifications/PropagateWidget/PropagateFromServiceV2'
// eslint-disable-next-line no-restricted-imports
import { setupMode } from '@cd/components/PipelineSteps/PipelineStepsUtil'

import type { StageInputSetFormProps } from '../StageInputSetForm'
import type { DeployServiceEntityData } from './ServicesInputSetForm'

import css from '../PipelineInputSetForm.module.scss'

export default function SingleServiceInputSetForm({
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
  const {
    state: { pipeline, templateTypes },
    isReadonly
  } = usePipelineContext()

  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, stageIdentifier)

  const { getString } = useStrings()
  const formik = useFormikContext<DeploymentStageConfig>()

  const isPropagateFromStageEnabled = useFeatureFlag(FeatureFlag.CDS_PROPAGATE_STAGE_TEMPLATE)

  // This is the value of AllValues
  const deploymentStageInputSet = get(formik?.values, path, {})

  const serviceIdentifier = defaultTo(
    deploymentStageInputSet?.service?.serviceRef,
    deploymentStage?.service?.serviceRef
  )

  const useFromStageInputSetValue = get(deploymentStageInputSet, 'service.useFromStage.stage')

  const [setupModeType, setSetupMode] = useState(
    // Do not add isEmpty check here. This will move to DIFFERENT when propagate is selected and focus moved away
    isNil(useFromStageInputSetValue) ? setupMode.DIFFERENT : setupMode.PROPAGATE
  )

  const getStagesAllowedforPropogate = useCallback(
    (stageItem): boolean => {
      if (stageItem.stage.template) {
        const stageType = get(templateTypes, stageItem.stage.template.templateRef)
        return !isEmpty(stageItem.stage.template.templateRef) && stageType === StageType.DEPLOY
      } else {
        const isSingleSvcEmpty = isEmpty((stageItem.stage as DeploymentStageElementConfig)?.spec?.service?.serviceRef)
        return !isSingleSvcEmpty && stageItem?.stage?.type === StageType.DEPLOY
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const previousStageList = useMemo(() => {
    const { stages } = getFlattenedStages(pipeline)
    if (stages.length && stageIndex > 0) {
      // all stages are allowed
      const stageswithServiceV2 = stages.slice(0, stageIndex).filter(getStagesAllowedforPropogate)

      return stageswithServiceV2.map(stageItem => {
        if (stageItem.stage?.template) {
          return {
            label: `Stage [${stageItem.stage?.name}] - [Template]`,
            value: defaultTo(stageItem.stage?.identifier, '')
          }
        } else if (
          !get(stageItem.stage, `spec.service.useFromStage`) &&
          !get(stageItem.stage, `template.templateInputs.spec.service.useFromStage`)
        ) {
          const singleServiceRef = (stageItem.stage as DeploymentStageElementConfig)?.spec?.service?.serviceRef
          const serviceLabelVal = isEmpty(singleServiceRef) ? getString('services') : `Service [${singleServiceRef}]`
          return {
            label: `Stage [${stageItem.stage?.name}] - ${serviceLabelVal}`,
            value: stageItem.stage?.identifier
          }
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex])

  // This is for prefilling the selected value in the field
  const [selectedPropagatedState, setSelectedPropagatedState] = useState<SelectOption | string>(
    previousStageList?.find(v => v?.value === useFromStageInputSetValue) as SelectOption
  )

  const onPropogatedStageSelect = (value: SelectOption): void => {
    setSelectedPropagatedState(value)
    formik.setFieldValue(`${path}.service`, { useFromStage: { stage: value.value } })
  }

  const onStageServiceChange = (mode: string): void => {
    if (!isReadonly) {
      setSetupMode(mode)
      setSelectedPropagatedState('')

      if (mode === setupMode.DIFFERENT) {
        formik.setFieldValue(`${path}.service`, { serviceRef: '' })
      } else {
        formik.setFieldValue(`${path}.service`, {
          useFromStage: {
            stage: ''
          }
        })
      }
    }
  }

  const shouldShowPropagateFromStage =
    !isPropagateFromStageEnabled &&
    previousStageList?.length &&
    // using deploymentStage as deploymentStageTemplate is not reliable in case of optional fields
    (isValueRuntimeInput(deploymentStage?.service?.serviceRef) ||
      isValueRuntimeInput(deploymentStage?.service?.useFromStage as unknown as string))

  return (
    <div id={`Stage.${path}.${stageIdentifier}.Service`} className={cx(css.accordionSummary)}>
      <div className={css.inputheader}>{getString('service')}</div>
      {shouldShowPropagateFromStage && (
        <Container margin={{ left: 'xxlarge', bottom: 'large' }}>
          {/* The above container margin is required to push the propagate buttons. Propagate needs some refactor to fix the css issues */}
          <PropagateFromServiceV2
            setupModeType={setupModeType}
            selectedPropagatedState={selectedPropagatedState}
            previousStageList={previousStageList as SelectOption[]}
            isReadonly={!!readonly}
            onStageServiceChange={onStageServiceChange}
            onPropogatedStageSelect={onPropogatedStageSelect}
          />
        </Container>
      )}

      {deploymentStageTemplate.service && setupModeType === setupMode.DIFFERENT && (
        <div className={css.nestedAccordions}>
          {deploymentStageTemplate.service?.serviceRef && (
            <StepWidget<DeployServiceEntityData>
              factory={factory}
              initialValues={pick(deploymentStageInputSet, ['service'])}
              template={pick(deploymentStageTemplate, ['service'])}
              type={StepType.DeployServiceEntity}
              stepViewType={viewType}
              path={`${path}.service`}
              allowableTypes={allowableTypes}
              readonly={readonly}
              customStepProps={{
                stageIdentifier,
                deploymentType: deploymentStage?.deploymentType,
                gitOpsEnabled: deploymentStage?.gitOpsEnabled,
                allValues: pick(deploymentStage, ['service']),
                customDeploymentData: deploymentStage?.customDeploymentRef
              }}
              onUpdate={data => formik?.setFieldValue(`${path}.service`, get(data, 'service'))}
            />
          )}

          {!isNil(deploymentStage?.deploymentType) && serviceIdentifier && !isValueRuntimeInput(serviceIdentifier) && (
            <StepWidget<ServiceSpec>
              factory={factory}
              initialValues={deploymentStageInputSet?.service?.serviceInputs?.serviceDefinition?.spec || {}}
              allowableTypes={allowableTypes}
              template={deploymentStageTemplate?.service?.serviceInputs?.serviceDefinition?.spec || {}}
              type={getStepTypeByDeploymentType(defaultTo(deploymentStage?.deploymentType, ''))}
              stepViewType={viewType}
              path={`${path}.service.serviceInputs.serviceDefinition.spec`}
              readonly={readonly}
              customStepProps={{
                stageIdentifier,
                serviceIdentifier,
                allValues: deploymentStage?.service?.serviceInputs?.serviceDefinition?.spec
              }}
              onUpdate={(data: any) => {
                /* istanbul ignore next */
                if (deploymentStageInputSet?.service?.serviceInputs?.serviceDefinition?.spec) {
                  deploymentStageInputSet.service.serviceInputs.serviceDefinition.spec = data
                  formik?.setValues(set(formik?.values, path, deploymentStageInputSet))
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
