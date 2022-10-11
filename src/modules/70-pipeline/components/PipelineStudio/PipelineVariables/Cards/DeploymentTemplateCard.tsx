/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty, set } from 'lodash-es'
import { Text, NestedAccordionPanel, AllowedTypes } from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import cx from 'classnames'
import produce from 'immer'
import type {
  CustomVariablesData,
  CustomVariableEditableExtraProps
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { AllNGVariables } from '@pipeline/utils/types'

import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { VariableType } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableUtils'
import { useStrings } from 'framework/strings'
import type { StoreConfigWrapper } from 'services/cd-ng'
import VariableAccordionSummary from '../VariableAccordionSummary'
import type { DeploymentInfra, DeploymentTemplateConfig, PipelineVariablesData } from '../types'
import css from '../PipelineVariables.module.scss'
import moduleCss from './DeploymentTemplateCard.module.scss'

export interface DeploymentTemplateCardProps {
  deploymentTemplate: DeploymentTemplateConfig
  originalDeploymentTemplate: DeploymentTemplateConfig
  unresolvedDeploymentTemplate: DeploymentTemplateConfig
  metadataMap: PipelineVariablesData['metadataMap']
  readonly?: boolean
  path?: string
  allowableTypes: AllowedTypes
  stepsFactory: AbstractStepFactory
  updateDeploymentTemplate: (deploymentTemplate: DeploymentTemplateConfig) => Promise<void>
}

export default function DeploymentTemplateCard(props: DeploymentTemplateCardProps): React.ReactElement {
  const {
    deploymentTemplate,
    originalDeploymentTemplate,
    unresolvedDeploymentTemplate,
    metadataMap,
    readonly,
    path,
    allowableTypes,
    updateDeploymentTemplate,
    stepsFactory
  } = props

  const { getString } = useStrings()

  const infrastructureSpec = deploymentTemplate?.infrastructure as DeploymentInfra

  const headerComponent: JSX.Element = (
    <div className={moduleCss.infraVarHeader}>
      <div>{getString('name')}</div>
      <div>{getString('description')}</div>
      <div>{getString('valueLabel')}</div>
    </div>
  )
  const onUpdateInfrastructureVariables = React.useCallback(
    ({ variables }: CustomVariablesData) => {
      /* istanbul ignore next */
      updateDeploymentTemplate(
        produce(unresolvedDeploymentTemplate, (draft: DeploymentTemplateConfig) => {
          set(draft, 'infrastructure.variables', variables)
        })
      )
    },
    [updateDeploymentTemplate, unresolvedDeploymentTemplate]
  )

  const content = (
    <div className={css.variableCard}>
      <VariablesListTable
        data={deploymentTemplate?.infrastructure}
        className={cx(css.variablePaddingL0, moduleCss.variablesWithDescription)}
        originalData={originalDeploymentTemplate?.infrastructure}
        metadataMap={metadataMap}
      />
      <VariablesListTable
        data={(deploymentTemplate?.infrastructure?.fetchInstancesScript?.store as StoreConfigWrapper)?.spec}
        className={cx(css.variablePaddingL0, moduleCss.variablesWithDescription)}
        originalData={
          (originalDeploymentTemplate?.infrastructure?.fetchInstancesScript?.store as StoreConfigWrapper)?.spec
        }
        metadataMap={metadataMap}
      />
      {!isEmpty(infrastructureSpec) && (
        <React.Fragment>
          <NestedAccordionPanel
            noAutoScroll
            isDefaultOpen
            key={`${path}.${originalDeploymentTemplate.identifier}.infrastructure.variables`}
            id={`${path}.${originalDeploymentTemplate.identifier}.infrastructure.variables`}
            addDomId
            summary={
              <VariableAccordionSummary>
                <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.BLACK}>
                  {'Infrastructure Variables'}
                </Text>
              </VariableAccordionSummary>
            }
            collapseProps={{
              keepChildrenMounted: true
            }}
            details={
              <>
                {originalDeploymentTemplate?.infrastructure && deploymentTemplate?.infrastructure ? (
                  <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
                    factory={stepsFactory}
                    initialValues={{
                      variables: defaultTo(
                        originalDeploymentTemplate?.infrastructure?.variables,
                        []
                      ) as AllNGVariables[],
                      canAddVariable: true
                    }}
                    allowableTypes={allowableTypes}
                    readonly={readonly}
                    type={StepType.CustomVariable}
                    stepViewType={StepViewType.InputVariable}
                    onUpdate={onUpdateInfrastructureVariables}
                    customStepProps={{
                      formName: 'addEditInfrastructureVariablesForm',
                      className: cx(
                        css.customVariables,
                        css.customVarPadL1,
                        css.addVariableL1,
                        moduleCss.variablesWithDescription
                      ),
                      path: `${path}.customVariables`,
                      yamlProperties: (
                        defaultTo(deploymentTemplate?.infrastructure?.variables, []) as AllNGVariables[]
                      ).map?.(
                        variable =>
                          metadataMap[variable.value || /* istanbul ignore next */ '']?.yamlProperties ||
                          /* istanbul ignore next */ {}
                      ),
                      allowedVarialblesTypes: [
                        VariableType.String,
                        VariableType.Secret,
                        VariableType.Number,
                        VariableType.Connector
                      ],
                      isDescriptionEnabled: true,
                      headerComponent: headerComponent,
                      addVariableLabel: 'variables.newVariable',
                      isDrawerMode: true
                    }}
                  />
                ) : /* istanbul ignore next */ null}
              </>
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
      key={`${path}.${originalDeploymentTemplate?.identifier}`}
      id={`${path}.${originalDeploymentTemplate?.identifier}`}
      addDomId
      summary={
        <VariableAccordionSummary>
          <Text font={{ variation: FontVariation.H6 }} color={Color.BLACK}>
            {originalDeploymentTemplate?.name
              ? `Deployment Template: ${originalDeploymentTemplate?.name}`
              : 'Deployment Template'}
          </Text>
        </VariableAccordionSummary>
      }
      summaryClassName={css.stageSummary}
      details={content}
    />
  )
}
