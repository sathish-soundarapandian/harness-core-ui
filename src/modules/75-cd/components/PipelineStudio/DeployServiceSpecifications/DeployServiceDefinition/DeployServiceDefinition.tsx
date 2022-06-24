/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Card, Checkbox, Intent, Layout, useConfirmationDialog } from '@harness/uicore'
import { debounce, defaultTo, get, set } from 'lodash-es'
import produce from 'immer'
import cx from 'classnames'
import type { ServiceDefinition, StageElementConfig } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { getStageIndexFromPipeline } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
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
import { setupMode } from '../PropagateWidget/PropagateWidget'
import SelectDeploymentType from '../SelectDeploymentType'
import css from './DeployServiceDefinition.module.scss'
import stageCss from '../../DeployStageSetupShell/DeployStage.module.scss'

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

  const getGitOpsCheckValue = (): boolean => {
    if (isServiceCreateModalView) {
      return defaultGitOpsValue
    }
    return defaultTo((pipeline as ServicePipelineConfig).gitOpsEnabled, false)
  }

  const [selectedDeploymentType, setSelectedDeploymentType] = useState<ServiceDeploymentType | undefined>(
    getDeploymentType()
  )
  const [gitOpsEnabled, setGitOpsEnabled] = useState(getGitOpsCheckValue())
  const [currStageData, setCurrStageData] = useState<DeploymentStageElementConfig | undefined>()
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

  const { openDialog: openServiceDataDeleteWarningDialog } = useConfirmationDialog({
    ...serviceDataDialogProps,
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        deleteServiceData(currStageData)
        if (gitOpsEnabled) {
          await debounceUpdatePipeline(
            produce({ ...pipeline } as ServicePipelineConfig, draft => {
              set(draft, 'gitOpsEnabled', false)
              set(
                draft,
                'stages[0].stage.spec.serviceConfig.serviceDefinition.type',
                currStageData?.spec?.serviceConfig?.serviceDefinition?.type
              )
            })
          )
          setGitOpsEnabled(false)
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

  const handleDeploymentTypeChange = useCallback(
    (deploymentType: ServiceDeploymentType): void => {
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
          updateStage(stageData?.stage as StageElementConfig)
        }
      }
    },
    [stage, updateStage]
  )
  return (
    <div className={cx(css.contentSection, isServiceEntityModalView ? css.editServiceModal : css.nonModalView)}>
      <div className={css.tabHeading} id="serviceDefinition">
        {getString('pipelineSteps.deploy.serviceSpecifications.serviceDefinition')}
      </div>
      <SelectDeploymentType
        viewContext="setup"
        selectedDeploymentType={selectedDeploymentType}
        isReadonly={disabledState}
        handleDeploymentTypeChange={handleDeploymentTypeChange}
      />
      {selectedDeploymentType === ServiceDeploymentType['Kubernetes'] && (
        <Card className={stageCss.sectionCard}>
          <Checkbox
            label="Gitops"
            name="gitOpsEnabled"
            checked={gitOpsEnabled}
            onChange={handleGitOpsCheckChanged}
            disabled={disabledState}
          />
        </Card>
      )}
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
