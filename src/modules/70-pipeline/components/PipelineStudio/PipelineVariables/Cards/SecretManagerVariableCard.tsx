/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { Text, NestedAccordionPanel, AllowedTypes } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import cx from 'classnames'
import type {
  CustomVariablesData,
  CustomVariableEditableExtraProps
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { VariableResponseMapValue } from 'services/template-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { MonitoredServiceConfig } from '@pipeline/components/TemplateVariablesContext/TemplateVariablesContext'
import VariableAccordionSummary from '../VariableAccordionSummary'
import type { PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'

export interface SecretManagerVariableCardProps {
  secretManager: MonitoredServiceConfig
  originalSecretManager: MonitoredServiceConfig
  unresolvedMonitoredService: MonitoredServiceConfig
  metadataMap: PipelineVariablesData['metadataMap']
  readonly?: boolean
  path?: string
  allowableTypes: AllowedTypes
  stepsFactory: AbstractStepFactory
  updateSceretManager: (secretManager: any) => Promise<void>
}

interface MetaDataInterface {
  [key: string]: VariableResponseMapValue
}
const updateLocalNameInMetaData = (metadataMap: MetaDataInterface): MetaDataInterface => {
  const updatedMetadataMap: MetaDataInterface = {}
  Object.keys(metadataMap).forEach(key => {
    const updatedData = {
      ...metadataMap[key],
      yamlProperties: {
        ...metadataMap[key]?.yamlProperties,
        localName: metadataMap[key]?.yamlProperties?.variableName
      }
    }
    updatedMetadataMap[key] = updatedData
  })
  return updatedMetadataMap
}

export default function SecretManagerVariableCard(props: SecretManagerVariableCardProps): React.ReactElement {
  const {
    secretManager,
    originalSecretManager,
    unresolvedMonitoredService,
    metadataMap,
    readonly,
    path,
    allowableTypes,
    updateSceretManager,
    stepsFactory
  } = props
  const { getString } = useStrings()
  const originalSpec = originalSecretManager.spec
  const updatedMetadataMap = updateLocalNameInMetaData(metadataMap)
  const onUpdateVariables = React.useCallback(
    ({ variables }: CustomVariablesData) => {
      updateSceretManager({ ...unresolvedMonitoredService, variables })
    },
    [updateSceretManager, unresolvedMonitoredService]
  )

  const content = (
    <div className={css.variableCard}>
      <VariablesListTable
        data={secretManager}
        className={css.variablePaddingL0}
        originalData={originalSecretManager}
        metadataMap={updatedMetadataMap}
      />
      {originalSpec && (
        <React.Fragment>
          <NestedAccordionPanel
            noAutoScroll
            isDefaultOpen
            key={`${path}.${originalSecretManager.identifier}.variables`}
            id={`${path}.${originalSecretManager.identifier}.variables`}
            addDomId
            summary={
              <VariableAccordionSummary>
                <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
                  {getString('customVariables.title')}
                </Text>
              </VariableAccordionSummary>
            }
            collapseProps={{
              keepChildrenMounted: true
            }}
            details={
              <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
                factory={stepsFactory}
                initialValues={{
                  variables: defaultTo(originalSecretManager.variables, []) as AllNGVariables[],
                  canAddVariable: true
                }}
                allowableTypes={allowableTypes}
                readonly={readonly}
                type={StepType.CustomVariable}
                stepViewType={StepViewType.InputVariable}
                onUpdate={onUpdateVariables}
                customStepProps={{
                  formName: 'addEditStageCustomVariableForm',
                  variableNamePrefix: `${originalSecretManager.identifier}.variables.`,
                  domId: `Script.${originalSecretManager.identifier}.Variables-panel`,
                  className: cx(css.customVariables, css.customVarPadL1, css.addVariableL1),
                  path: `${path}.customVariables`,
                  yamlProperties: (defaultTo(secretManager.variables, []) as AllNGVariables[]).map?.(
                    variable =>
                      metadataMap[variable.value || /* istanbul ignore next */ '']?.yamlProperties ||
                      /* istanbul ignore next */ {}
                  )
                }}
              />
            }
          />
        </React.Fragment>
      )}
    </div>
  )

  return (
    <NestedAccordionPanel
      noAutoScroll
      isDefaultOpen
      collapseProps={{
        keepChildrenMounted: true
      }}
      key={`${path}.${originalSecretManager.identifier}`}
      id={`${path}.${originalSecretManager.identifier}`}
      addDomId
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.H6 }} color={Color.BLACK}>
            {originalSecretManager.name ? `Secret Manager: ${originalSecretManager.name}` : 'Secret Manager'}
          </Text>
        </VariableAccordionSummary>
      }
      summaryClassName={css.stageSummary}
      details={content}
    />
  )
}
