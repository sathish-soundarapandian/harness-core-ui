/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import cx from 'classnames'
import { AllowedTypes, Container, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import produce from 'immer'
import { debounce, defaultTo, get, isEmpty, isEqual, isNil, pick, set, unset } from 'lodash-es'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StageElementConfig } from 'services/cd-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import {
  getFlattenedStages,
  getStageIndexFromPipeline
} from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import DeployServiceErrors from '@cd/components/PipelineStudio/DeployServiceSpecifications/DeployServiceErrors'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useValidationErrors } from '@pipeline/components/PipelineStudio/PiplineHooks/useValidationErrors'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { Scope } from '@common/interfaces/SecretsInterface'
import { setupMode } from '@cd/components/PipelineSteps/PipelineStepsUtil'
import type {
  DeployServiceEntityCustomProps,
  DeployServiceEntityData
} from '@cd/components/PipelineSteps/DeployServiceEntityStep/DeployServiceEntityUtils'
import PropagateFromServiceV2 from './PropagateWidget/PropagateFromServiceV2'
import stageCss from '../DeployStageSetupShell/DeployStage.module.scss'

export interface DeployServiceEntitySpecificationsProps {
  children: React.ReactNode
}

export default function DeployServiceEntitySpecifications({
  children
}: DeployServiceEntitySpecificationsProps): JSX.Element {
  const {
    state: {
      pipeline,
      templateTypes,
      templateServiceData,
      selectionState: { selectedStageId }
    },
    allowableTypes,
    isReadonly,
    scope,
    getStageFromPipeline,
    updateStage
  } = usePipelineContext()
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdateStage = useCallback(
    debounce(
      (changedStage?: StageElementConfig) =>
        changedStage ? updateStage(changedStage) : /* istanbul ignore next */ Promise.resolve(),
      300
    ),
    [updateStage]
  )
  const { stages } = getFlattenedStages(pipeline)
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')
  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')
  const { submitFormsForTab } = useContext(StageErrorContext)
  const { errorMap } = useValidationErrors()

  const [setupModeType, setSetupMode] = useState(
    isEmpty(stage?.stage?.spec?.service?.useFromStage) ? setupMode.DIFFERENT : setupMode.PROPAGATE
  )

  const getStagesAllowedforPropogate = useCallback(
    (stageItem): boolean => {
      const currentStageType = stage?.stage?.type
      const currentStageDeploymentType = stage?.stage?.spec?.deploymentType
      if (stageItem.stage.template) {
        const stageType = get(templateTypes, stageItem.stage.template.templateRef)
        const deploymentType = get(templateServiceData, stageItem.stage.template.templateRef)
        return (
          !isEmpty(stageItem.stage.template.templateRef) &&
          currentStageType === stageType &&
          deploymentType === currentStageDeploymentType
        )
      } else {
        const isSingleSvcEmpty = isEmpty((stageItem.stage as DeploymentStageElementConfig)?.spec?.service?.serviceRef)
        const isMultiSvcEmpty = isEmpty((stageItem.stage as DeploymentStageElementConfig)?.spec?.services?.values)

        const prevStageItemDeploymentType = (stageItem.stage as DeploymentStageElementConfig)?.spec?.deploymentType
        const prevStageItemCustomDeploymentConfig = (stageItem.stage as DeploymentStageElementConfig)?.spec
          ?.customDeploymentRef
        const currentStageCustomDeploymentConfig = stage?.stage?.spec?.customDeploymentRef

        const areDeploymentDetailsSame =
          currentStageDeploymentType === ServiceDeploymentType.CustomDeployment
            ? prevStageItemDeploymentType === currentStageDeploymentType &&
              isEqual(prevStageItemCustomDeploymentConfig, currentStageCustomDeploymentConfig)
            : prevStageItemDeploymentType === currentStageDeploymentType

        return (
          (!isSingleSvcEmpty || !isMultiSvcEmpty) &&
          currentStageType === stageItem?.stage?.type &&
          areDeploymentDetailsSame
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const previousStageList = useMemo(() => {
    if (stages.length && stageIndex > 0) {
      //stage allowed for use from stage should have service V2 services and the deployment type, stage type should be same as current stage
      const stagewithServiceV2 = stages.slice(0, stageIndex).filter(getStagesAllowedforPropogate)
      return stagewithServiceV2.map(stageItem => {
        if (stageItem.stage?.template) {
          return {
            label: `Stage [${stageItem.stage?.name}] - [Template]`,
            value: stageItem.stage?.identifier || ''
          }
        } else if (!get(stageItem.stage, `spec.serviceConfig.useFromStage`)) {
          const defaultService = (stageItem.stage as DeploymentStageElementConfig)?.spec?.service?.serviceRef
          return {
            label: `Stage [${stageItem.stage?.name}] - Service [${defaultService}]`,
            value: stageItem.stage?.identifier
          }
        }
      })
    }
  }, [getStagesAllowedforPropogate, stageIndex, stages])

  const [selectedPropagatedState, setSelectedPropagatedState] = useState<SelectOption | string>(
    previousStageList?.find(v => v?.value === stage?.stage?.spec?.service?.useFromStage?.stage) as SelectOption
  )

  useEffect(() => {
    if (typeof stage !== 'undefined' && scope !== Scope.PROJECT) {
      const stageData = produce(stage, draft => {
        set(draft, 'stage.spec.service.serviceRef', RUNTIME_INPUT_VALUE)
        set(draft, 'stage.spec.service.serviceInputs', RUNTIME_INPUT_VALUE)
      })
      if (stageData.stage) {
        updateStage(stageData.stage)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (errorMap.size > 0) {
      submitFormsForTab(DeployTabs.SERVICE)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMap])

  const updateService = useCallback(
    async (value: DeployServiceEntityData) => {
      const isPropogatedFromStage = !isEmpty(get(stage, 'stage.spec.service.useFromStage'))
      const stageData = produce(stage, draft => {
        if (draft) {
          if (isPropogatedFromStage) {
            unset(draft, 'stage.spec.service.useFromStage')
          }
          if (!isNil(value.service)) {
            set(draft, 'stage.spec.service', value.service)
            unset(draft, 'stage.spec.services')
          } else if (!isNil(value.services)) {
            set(draft, 'stage.spec.services', value.services)
            unset(draft, 'stage.spec.service')
          }
        }
      })
      await debounceUpdateStage(stageData?.stage)
    },
    [debounceUpdateStage, stage]
  )

  const getDeployServiceWidgetInitValues = useCallback((): DeployServiceEntityData => {
    return {
      ...pick(stage?.stage?.spec, ['service', 'services']),
      ...(scope !== Scope.PROJECT && {
        service: { serviceRef: RUNTIME_INPUT_VALUE }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPropogatedStageSelect = useCallback(
    (value: SelectOption): void => {
      const stageData = produce(stage, draft => {
        if (draft) {
          set(draft, 'stage.spec.service', { useFromStage: { stage: value.value } })
        }
      })
      debounceUpdateStage(stageData?.stage)
      setSelectedPropagatedState(value)
    },
    [debounceUpdateStage, stage]
  )
  const onStageServiceChange = useCallback(
    (mode: string): void => {
      if (!isReadonly) {
        setSetupMode(mode)
        setSelectedPropagatedState('')
      }
    },
    [isReadonly]
  )

  return (
    <div className={stageCss.deployStage} ref={scrollRef}>
      <DeployServiceErrors domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
      <div className={cx(stageCss.contentSection, stageCss.paddedSection)}>
        {!!previousStageList?.length && (
          <Container margin={{ bottom: 'xlarge', left: 'xlarge' }}>
            <PropagateFromServiceV2
              setupModeType={setupModeType}
              selectedPropagatedState={selectedPropagatedState}
              previousStageList={previousStageList as SelectOption[]}
              isReadonly={isReadonly}
              onStageServiceChange={onStageServiceChange}
              onPropogatedStageSelect={onPropogatedStageSelect}
            />
          </Container>
        )}
        {setupModeType === setupMode.DIFFERENT && (
          <StepWidget<DeployServiceEntityData, DeployServiceEntityCustomProps>
            type={StepType.DeployServiceEntity}
            readonly={isReadonly}
            initialValues={getDeployServiceWidgetInitValues()}
            allowableTypes={
              scope === Scope.PROJECT
                ? allowableTypes
                : ((allowableTypes as MultiTypeInputType[]).filter(
                    item => item !== MultiTypeInputType.FIXED
                  ) as AllowedTypes)
            }
            onUpdate={updateService}
            factory={factory}
            stepViewType={StepViewType.Edit}
            customStepProps={{
              stageIdentifier: defaultTo(stage?.stage?.identifier, ''),
              deploymentType: stage?.stage?.spec?.deploymentType,
              gitOpsEnabled: defaultTo(stage?.stage?.spec?.gitOpsEnabled, false)
            }}
          />
        )}
        <Container margin={{ top: 'xxlarge' }}>{children}</Container>
      </div>
    </div>
  )
}
