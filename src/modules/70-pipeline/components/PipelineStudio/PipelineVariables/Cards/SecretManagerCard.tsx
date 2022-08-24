/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, pick } from 'lodash-es'
import { Text, NestedAccordionPanel, AllowedTypes } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import type { InputSetSchema } from '@secrets/components/ScriptVariableRuntimeInput/ScriptVariablesRuntimeInput'
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
import VariableAccordionSummary from '../VariableAccordionSummary'
import type { PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'

export interface SecretManagerVariableCardProps {
  secretManager: any
  originalSecretManager: any
  unresolvedSecretManager: any
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

export default function SecretManagerCard(props: SecretManagerVariableCardProps): React.ReactElement {
  const {
    secretManager,
    originalSecretManager,
    unresolvedSecretManager,
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
    /* istanbul ignore next */ ({ variables }: CustomVariablesData) => {
      updateSceretManager({ ...unresolvedSecretManager, variables })
    },
    [updateSceretManager, unresolvedSecretManager]
  )
  const data: Record<string, string> = pick(secretManager, ['shell', 'onDelegate'])

  // istanbul ignore else
  if (secretManager?.executionTarget?.connectorRef) {
    data['executionTarget.connectorRef'] = secretManager.executionTarget.connectorRef
  }
  // istanbul ignore else
  if (secretManager?.executionTarget?.host) {
    data['executionTarget.host'] = secretManager.executionTarget.host
  }
  // istanbul ignore else
  if (secretManager?.executionTarget?.workingDirectory) {
    data['executionTarget.workingDirectory'] = secretManager.executionTarget.workingDirectory
  }

  // istanbul ignore else
  if (secretManager?.source?.spec?.script) {
    data['source.spec.script'] = secretManager.source.spec.script
  }

  // istanbul ignore else
  if (Array.isArray(secretManager?.environmentVariables)) {
    secretManager.environmentVariables.forEach((row: InputSetSchema, i: number) => {
      data[`environmentVariables[${i}].value`] = row.value as string
    })
  }
  // istanbul ignore else
  if (Array.isArray(secretManager?.outputVariables)) {
    secretManager.outputVariables.forEach((row: InputSetSchema, i: number) => {
      data[`outputVariables[${i}].value`] = row.value as string
    })
  }
  const content = (
    <div className={css.variableCard}>
      <VariablesListTable
        data={data}
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
