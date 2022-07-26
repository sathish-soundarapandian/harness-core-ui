/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { NestedAccordionPanel, Text } from '@harness/uicore'
import cx from 'classnames'
import { FontVariation, Color } from '@harness/design-system'
import { isEmpty, omit } from 'lodash-es'

import { useStrings } from 'framework/strings'
import type { YamlProperties } from 'services/pipeline-ng'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import VariableAccordionSummary from '@pipeline/components/PipelineStudio/PipelineVariables/VariableAccordionSummary'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type {
  CustomVariablesData,
  CustomVariableEditableExtraProps
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { AzureWebAppServiceSpecVariablesFormProps } from './AzureWebAppServiceSpecInterface.types'

//todo: css
import css from '../K8sServiceSpec/K8sServiceSpec.module.scss'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface VariableRowProps {
  data?: YamlProperties | undefined
  valueType?: string
  value: string
}

export function AzureWebAppServiceSpecVariablesForm(
  props: AzureWebAppServiceSpecVariablesFormProps
): React.ReactElement {
  const { initialValues, stepsFactory, onUpdate, variablesData, metadataMap, readonly, path, allowableTypes } = props
  const { artifacts, variables, startupScript, applicationSettings, connectionStrings } = initialValues
  const { getString } = useStrings()

  const primaryArtifactVariables = variablesData?.artifacts?.primary?.spec
  const startupScriptVariables = variablesData?.startupScript
  const applicationSettingsVariables = variablesData?.applicationSettings
  const connectionStringsVariables = variablesData?.connectionStrings

  return (
    <React.Fragment>
      {artifacts && !isEmpty(omit(variablesData?.artifacts, 'uuid')) ? (
        <NestedAccordionPanel
          isDefaultOpen
          addDomId
          noAutoScroll
          id={`${path}.Artifacts`}
          summary={
            <VariableAccordionSummary>
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
                {getString('artifacts')}
              </Text>
            </VariableAccordionSummary>
          }
          summaryClassName={cx(pipelineVariableCss.accordianSummaryL2)}
          details={
            variablesData?.artifacts && (
              <>
                <NestedAccordionPanel
                  isDefaultOpen
                  noAutoScroll
                  addDomId
                  collapseProps={{ keepChildrenMounted: true }}
                  id={`${path}.Artifacts.Primary`}
                  summary={
                    <VariableAccordionSummary>
                      <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
                        {getString('primaryArtifactText')}
                      </Text>
                    </VariableAccordionSummary>
                  }
                  summaryClassName={cx(pipelineVariableCss.accordianSummaryL2)}
                  details={
                    <VariablesListTable
                      className={pipelineVariableCss.variablePaddingL3}
                      data={primaryArtifactVariables}
                      originalData={initialValues?.artifacts?.primary?.spec}
                      metadataMap={metadataMap}
                    />
                  }
                />
              </>
            )
          }
        />
      ) : null}
      {startupScript && typeof startupScriptVariables !== 'string' && !isEmpty(omit(startupScriptVariables, 'uuid')) ? (
        <NestedAccordionPanel
          isDefaultOpen
          noAutoScroll
          addDomId
          id={`${path}.StartupScript`}
          summary={
            <VariableAccordionSummary>
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
                {getString('pipeline.startupScript.name')}
              </Text>
            </VariableAccordionSummary>
          }
          summaryClassName={cx(pipelineVariableCss.accordianSummaryL2)}
          details={
            !!startupScriptVariables && (
              <>
                <VariablesListTable
                  className={cx(css.manifestVariablesTable, pipelineVariableCss.variablePaddingL3)}
                  data={startupScriptVariables?.spec}
                  originalData={initialValues?.startupScript?.spec}
                  metadataMap={metadataMap}
                />
              </>
            )
          }
        />
      ) : null}
      {applicationSettings &&
      typeof applicationSettingsVariables !== 'string' &&
      !isEmpty(omit(applicationSettingsVariables, 'uuid')) ? (
        <NestedAccordionPanel
          isDefaultOpen
          noAutoScroll
          addDomId
          id={`${path}.ApplicationSettings`}
          summary={
            <VariableAccordionSummary>
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
                {getString('pipeline.appServiceConfig.applicationSettings.name')}
              </Text>
            </VariableAccordionSummary>
          }
          summaryClassName={cx(pipelineVariableCss.accordianSummaryL2)}
          details={
            !!applicationSettingsVariables && (
              <>
                <VariablesListTable
                  className={cx(css.manifestVariablesTable, pipelineVariableCss.variablePaddingL3)}
                  data={applicationSettingsVariables?.spec}
                  originalData={initialValues?.applicationSettings?.spec}
                  metadataMap={metadataMap}
                />
              </>
            )
          }
        />
      ) : null}
      {connectionStrings &&
      typeof connectionStringsVariables !== 'string' &&
      !isEmpty(omit(connectionStringsVariables, 'uuid')) ? (
        <NestedAccordionPanel
          isDefaultOpen
          noAutoScroll
          addDomId
          id={`${path}.ConnectionStrings`}
          summary={
            <VariableAccordionSummary>
              <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
                {getString('pipeline.appServiceConfig.connectionStrings.name')}
              </Text>
            </VariableAccordionSummary>
          }
          summaryClassName={cx(pipelineVariableCss.accordianSummaryL2)}
          details={
            !!connectionStringsVariables && (
              <>
                <VariablesListTable
                  className={cx(css.manifestVariablesTable, pipelineVariableCss.variablePaddingL3)}
                  data={connectionStringsVariables?.spec}
                  originalData={initialValues?.connectionStrings?.spec}
                  metadataMap={metadataMap}
                />
              </>
            )
          }
        />
      ) : null}
      <NestedAccordionPanel
        isDefaultOpen
        noAutoScroll
        addDomId
        id={`${path}.Variables`}
        summary={
          <VariableAccordionSummary>
            <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
              {getString('common.variables')}
            </Text>
          </VariableAccordionSummary>
        }
        summaryClassName={cx(pipelineVariableCss.accordianSummaryL1)}
        details={
          <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
            factory={stepsFactory}
            initialValues={{
              variables: (variables || []) as AllNGVariables[],
              canAddVariable: true
            }}
            type={StepType.CustomVariable}
            stepViewType={StepViewType.InputVariable}
            onUpdate={onUpdate}
            allowableTypes={allowableTypes}
            readonly={readonly}
            customStepProps={{
              formName: 'addEditServiceCustomVariableForm',
              variableNamePrefix: 'serviceConfig.variables.',
              className: cx(css.customVariables, pipelineVariableCss.customVarPadL2, pipelineVariableCss.addVariableL2),
              path: path,
              // heading: <b>{getString('customVariables.title')}</b>,
              yamlProperties: (variablesData?.variables as AllNGVariables[])?.map(
                variable => metadataMap?.[variable.value || '']?.yamlProperties || {}
              )
            }}
          />
        }
      />
    </React.Fragment>
  )
}
