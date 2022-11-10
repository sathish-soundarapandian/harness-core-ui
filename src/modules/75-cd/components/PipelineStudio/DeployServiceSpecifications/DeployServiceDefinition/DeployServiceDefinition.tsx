/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Intent, Layout, useConfirmationDialog } from '@harness/uicore'
import { debounce, defaultTo, get, isEqual, set } from 'lodash-es'
import produce from 'immer'
import cx from 'classnames'
import type { ServiceDefinition, StageElementConfig, TemplateLinkConfig } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { useDeepCompareEffect } from '@common/hooks'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { getStageIndexFromPipeline } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { TemplateType, TemplateUsage } from '@templates-library/utils/templatesUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  deleteServiceData,
  doesStageContainOtherData,
  getStepTypeByDeploymentType,
  ServiceDeploymentType
} from '@pipeline/utils/stageHelpers'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { useServiceContext } from '@cd/context/ServiceContext'
import type { ServicePipelineConfig } from '@cd/components/Services/utils/ServiceUtils'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { getTemplateRefVersionLabelObject } from '@pipeline/utils/templateUtils'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { setupMode } from '../PropagateWidget/PropagateWidget'
import SelectDeploymentType from '../SelectDeploymentType'
import css from './DeployServiceDefinition.module.scss'

function DeployServiceDefinition(): React.ReactElement {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    },
    getStageFromPipeline,
    updateStage,
    updatePipeline,
    allowableTypes,
    isReadonly
  } = usePipelineContext()
  const { getTemplate } = useTemplateSelector()
  const {
    isServiceEntityModalView,
    isServiceCreateModalView,
    selectedDeploymentType: defaultDeploymentType,
    gitOpsEnabled: defaultGitOpsValue
  } = useServiceContext()

  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')
  const { getString } = useStrings()
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId || '')

  const getDeploymentType = (): ServiceDeploymentType => {
    if (isServiceCreateModalView) {
      return defaultDeploymentType
    }
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.type')
  }

  const getDeploymentTypeTemplateData = (): TemplateLinkConfig => {
    return get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.customDeploymentRef')
  }

  const getGitOpsCheckValue = (): boolean => {
    if (isServiceCreateModalView) {
      return defaultTo(defaultGitOpsValue, false)
    }
    return defaultTo((pipeline as ServicePipelineConfig).gitOpsEnabled, false)
  }

  const [selectedDeploymentType, setSelectedDeploymentType] = useState<ServiceDeploymentType | undefined>(
    getDeploymentType()
  )
  const [gitOpsEnabled, setGitOpsEnabled] = useState(getGitOpsCheckValue())
  const [currStageData, setCurrStageData] = useState<DeploymentStageElementConfig | undefined>()
  const customDeploymentDataFromYaml = getDeploymentTypeTemplateData()
  const [customDeploymentData, setCustomDeploymentData] = useState<TemplateLinkConfig | undefined>(
    customDeploymentDataFromYaml
  )
  const shouldDeleteServiceData = useRef(false)

  useDeepCompareEffect(() => {
    setCustomDeploymentData(customDeploymentDataFromYaml)
  }, [customDeploymentDataFromYaml])

  const selectedDeploymentTemplateRef = useRef<TemplateSummaryResponse | undefined>()
  const fromTemplateSelectorRef = useRef(false)

  const disabledState = isServiceEntityModalView ? true : isReadonly

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdateStage = useCallback(
    debounce(
      (changedStage?: StageElementConfig) =>
        changedStage ? updateStage(changedStage) : /* istanbul ignore next */ Promise.resolve(),
      300
    ),
    [updateStage]
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceUpdatePipeline = useCallback(
    debounce(
      (changedPipeline: ServicePipelineConfig) =>
        changedPipeline ? updatePipeline(changedPipeline) : /* istanbul ignore next */ Promise.resolve(),
      300
    ),
    [updatePipeline]
  )

  const serviceDataDialogProps = {
    cancelButtonText: getString('cancel'),
    contentText: getString('pipeline.serviceDataDeleteWarningText'),
    titleText: getString('pipeline.serviceDataDeleteWarningTitle'),
    confirmButtonText: getString('confirm'),
    intent: Intent.WARNING
  }

  const updateDeploymentTypeWithGitops = async (deploymentType?: ServiceDeploymentType): Promise<void> => {
    await debounceUpdatePipeline(
      produce({ ...pipeline } as ServicePipelineConfig, draft => {
        set(draft, 'gitOpsEnabled', false)
        set(
          draft,
          'stages[0].stage.spec.serviceConfig.serviceDefinition.type',
          defaultTo(deploymentType, currStageData?.spec?.serviceConfig?.serviceDefinition?.type)
        )
      })
    )
    setGitOpsEnabled(false)
  }
  const { openDialog: openServiceDataDeleteWarningDialog } = useConfirmationDialog({
    ...serviceDataDialogProps,
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        setCustomDeploymentData(undefined)
        deleteServiceData(currStageData)
        if (gitOpsEnabled) {
          updateDeploymentTypeWithGitops()
        } else if (
          currStageData?.spec?.serviceConfig?.serviceDefinition?.type === ServiceDeploymentType.CustomDeployment
        ) {
          shouldDeleteServiceData.current = true
          onCustomDeploymentSelection()
        } else {
          await debounceUpdateStage(currStageData)
        }
        setSelectedDeploymentType(currStageData?.spec?.serviceConfig?.serviceDefinition?.type as ServiceDeploymentType)
      }
    }
  })
  const { openDialog: openManifestDataDeleteWarningDialog } = useConfirmationDialog({
    ...serviceDataDialogProps,
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        deleteServiceData(stage?.stage)
        await debounceUpdateStage(stage?.stage)
        setGitOpsEnabled(!gitOpsEnabled)
        debounceUpdatePipeline({ ...pipeline, gitOpsEnabled: !gitOpsEnabled } as ServicePipelineConfig)
      }
    }
  })

  const handleGitOpsCheckChanged = (ev: React.FormEvent<HTMLInputElement>): void => {
    const checked = ev.currentTarget.checked
    if (doesStageContainOtherData(stage?.stage)) {
      openManifestDataDeleteWarningDialog()
    } else {
      setGitOpsEnabled(checked)
      debounceUpdatePipeline({ ...pipeline, gitOpsEnabled: checked } as ServicePipelineConfig)
    }
  }

  const addOrUpdateTemplate = async (): Promise<void> => {
    const { template } = await getTemplate({
      templateType: TemplateType.CustomDeployment,
      allowedUsages: [TemplateUsage.USE]
    })
    setCustomDeploymentData(getTemplateRefVersionLabelObject(template))
  }

  const onCustomDeploymentSelection = async (): Promise<void> => {
    if (fromTemplateSelectorRef.current && selectedDeploymentTemplateRef.current) {
      return setCustomDeploymentData(getTemplateRefVersionLabelObject(selectedDeploymentTemplateRef.current))
    }

    try {
      const { template } = await getTemplate({
        selectedTemplate: selectedDeploymentTemplateRef.current,
        templateType: TemplateType.CustomDeployment,
        allowedUsages: [TemplateUsage.USE],
        showChangeTemplateDialog: false,
        hideTemplatesView: true,
        disableUseTemplateIfUnchanged: false
      })
      setCustomDeploymentData(getTemplateRefVersionLabelObject(template))
    } catch (_) {
      // don't do anything if user closes the drawer
    }
  }

  useEffect(() => {
    const previousState = [
      get(stage, 'stage.spec.serviceConfig.serviceDefinition.type'),
      get(stage, 'stage.spec.serviceConfig.serviceDefinition.spec.customDeploymentRef')
    ]
    const newState = [ServiceDeploymentType.CustomDeployment, customDeploymentData]

    if (isEqual(previousState, newState)) return

    if (customDeploymentData) {
      const stageData = produce(stage, draft => {
        if (draft) {
          set(draft, 'stage.spec.serviceConfig.serviceDefinition.type', ServiceDeploymentType.CustomDeployment)

          if (shouldDeleteServiceData.current) {
            deleteServiceData(draft.stage)
          }
          set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.customDeploymentRef', customDeploymentData)
        }
      })
      updateStage(stageData?.stage as StageElementConfig)
    }
  }, [customDeploymentData, stage, updateStage])

  const handleDeploymentTypeChange = (deploymentType: ServiceDeploymentType): void => {
    if (deploymentType !== selectedDeploymentType) {
      const stageData = produce(stage, draft => {
        const serviceDefinition = get(draft, 'stage.spec.serviceConfig.serviceDefinition', {})
        serviceDefinition.type = deploymentType
      })
      if (doesStageContainOtherData(stageData?.stage)) {
        setCurrStageData(stageData?.stage)
        openServiceDataDeleteWarningDialog()
      } else {
        setSelectedDeploymentType(deploymentType)
        setCustomDeploymentData(undefined)
        if (gitOpsEnabled) {
          updateDeploymentTypeWithGitops(deploymentType)
        } else {
          updateStage(stageData?.stage as StageElementConfig)
          if (deploymentType === ServiceDeploymentType.CustomDeployment) {
            shouldDeleteServiceData.current = false
            onCustomDeploymentSelection()
          }
        }
      }
    }
  }

  const onDeploymentTemplateSelect = (
    deploymentTemplate: TemplateSummaryResponse,
    fromTemplateSelector: boolean
  ): void => {
    selectedDeploymentTemplateRef.current = deploymentTemplate
    fromTemplateSelectorRef.current = fromTemplateSelector

    if (selectedDeploymentType === ServiceDeploymentType.CustomDeployment) {
      shouldDeleteServiceData.current = false
      onCustomDeploymentSelection()
    } else {
      handleDeploymentTypeChange(ServiceDeploymentType.CustomDeployment)
    }
  }

  return (
    <div className={cx(css.contentSection, isServiceEntityModalView ? css.editServiceModal : css.nonModalView)}>
      <div className={css.tabHeading} id="serviceDefinition">
        {getString('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')}
      </div>
      <SelectDeploymentType
        viewContext="setup"
        selectedDeploymentType={selectedDeploymentType}
        gitOpsEnabled={gitOpsEnabled}
        isReadonly={disabledState}
        handleDeploymentTypeChange={handleDeploymentTypeChange}
        onDeploymentTemplateSelect={onDeploymentTemplateSelect}
        shouldShowGitops={true}
        handleGitOpsCheckChanged={handleGitOpsCheckChanged}
        templateLinkConfig={customDeploymentData}
        addOrUpdateTemplate={isServiceEntityModalView ? undefined : addOrUpdateTemplate}
      />
      <Layout.Horizontal>
        <StepWidget<K8SDirectServiceStep>
          factory={factory}
          readonly={isReadonly}
          initialValues={{
            stageIndex,
            setupModeType: setupMode.DIFFERENT,
            deploymentType: selectedDeploymentType as ServiceDefinition['type']
          }}
          allowableTypes={allowableTypes}
          type={getStepTypeByDeploymentType(defaultTo(selectedDeploymentType, ''))}
          stepViewType={StepViewType.Edit}
        />
      </Layout.Horizontal>
    </div>
  )
}

export default DeployServiceDefinition
