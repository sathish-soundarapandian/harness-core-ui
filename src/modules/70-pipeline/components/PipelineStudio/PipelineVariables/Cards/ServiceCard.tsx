/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, NestedAccordionPanel, Text } from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { defaultTo, isEmpty, lowerCase } from 'lodash-es'
import type { ServiceConfig, ServiceSpec, StageElementConfig } from 'services/cd-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { useStrings } from 'framework/strings'
import VariableListTagRow from '@pipeline/components/VariablesListTable/VariableListTagRow'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { getSelectedDeploymentType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import VariableAccordionSummary from '../VariableAccordionSummary'
import type { PipelineVariablesData } from '../types'
import { usePipelineContext } from '../../PipelineContext/PipelineContext'
import css from '../PipelineVariables.module.scss'

const StepsMap: Record<string, StepType> = {
  Kubernetes: StepType.K8sServiceSpec,
  ServerlessAwsLambda: StepType.ServerlessAwsLambda,
  AzureWebApp: StepType.AzureWebAppServiceSpec
}

export interface ServiceCardProps {
  serviceConfig: ServiceConfig
  originalServiceConfig: ServiceConfig
  metadataMap: PipelineVariablesData['metadataMap']
  stageIdentifier: string
  onUpdateServiceConfig(data: ServiceSpec): void
  readonly?: boolean
  path?: string
  allowableTypes: AllowedTypes
  stepsFactory: AbstractStepFactory
}

export interface ServiceCardPanelProps extends ServiceCardProps {
  originalStage: StageElementConfig
}

export function ServiceCard(props: ServiceCardProps): React.ReactElement {
  const {
    serviceConfig,
    originalServiceConfig,
    metadataMap,
    stageIdentifier,
    onUpdateServiceConfig,
    readonly,
    allowableTypes,
    stepsFactory
  } = props

  const {
    state: { templateServiceData },
    getStageFromPipeline
  } = usePipelineContext()

  const { getString } = useStrings()
  const stage = getStageFromPipeline(stageIdentifier)
  const selectedDeploymentType = getSelectedDeploymentType(
    stage as StageElementWrapper<DeploymentStageElementConfig> | undefined,
    getStageFromPipeline,
    false,
    templateServiceData
  )
  return (
    <React.Fragment>
      <VariablesListTable
        data={serviceConfig}
        originalData={originalServiceConfig}
        metadataMap={metadataMap}
        className={css.variablePaddingL2}
      />
      {!isEmpty(originalServiceConfig.service?.tags) && (
        <VariableListTagRow
          metadataMap={metadataMap}
          name={lowerCase(getString('tagsLabel'))}
          tags={originalServiceConfig.service?.tags}
          fqn=""
          className={css.variablePaddingTagL3}
        />
      )}
      <StepWidget<ServiceSpec>
        factory={stepsFactory}
        initialValues={defaultTo(
          defaultTo(originalServiceConfig.serviceDefinition?.spec, originalServiceConfig.stageOverrides),
          {}
        )}
        type={StepsMap[selectedDeploymentType] || StepType.K8sServiceSpec}
        stepViewType={StepViewType.InputVariable}
        allowableTypes={allowableTypes}
        onUpdate={onUpdateServiceConfig}
        readonly={readonly}
        customStepProps={{
          stageIdentifier,
          metadataMap,
          variablesData: defaultTo(serviceConfig.serviceDefinition?.spec, serviceConfig.stageOverrides),
          path: props.path
        }}
      />
    </React.Fragment>
  )
}

export function ServiceCardPanel(props: ServiceCardPanelProps): React.ReactElement {
  const { getString } = useStrings()
  const { onUpdateServiceConfig, originalStage, ...rest } = props

  return (
    <NestedAccordionPanel
      noAutoScroll
      isDefaultOpen
      addDomId
      id={`${props.path}.Service`}
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
            {getString('service')}
          </Text>
        </VariableAccordionSummary>
      }
      panelClassName={css.panel}
      summaryClassName={css.accordianSummaryL1}
      details={<ServiceCard {...rest} onUpdateServiceConfig={onUpdateServiceConfig} path={`${props.path}.Service`} />}
      collapseProps={{
        keepChildrenMounted: true
      }}
    />
  )
}
