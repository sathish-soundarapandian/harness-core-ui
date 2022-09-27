/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@wings-software/uicore'

import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { CustomVariableInputSetExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { VariableType } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/DeploymentInfraWrapper/DeploymentInfraSpecifications/DeploymentInfraSpecifications'
import { useGetConnectorsListHook } from '@connectors/pages/connectors/hooks/useGetConnectorsListHook/useGetConectorsListHook'
import type { CustomDeploymentInfrastructureSpecEditableProps } from './CustomDeploymentInfrastructureInterface'
import css from './CustomDeploymentInfrastructureSpec.module.scss'

export const CustomDeploymentInfrastructureSpecInputForm: React.FC<
  CustomDeploymentInfrastructureSpecEditableProps & { path: string }
> = ({ template, initialValues, readonly = false, path, onUpdate, allowableTypes, allValues, factory }) => {
  const { getString } = useStrings()
  const { connectorsList } = useGetConnectorsListHook()
  return (
    <Layout.Vertical spacing="small">
      {!!template?.variables?.length && (
        <>
          <div className={css.subheading}>{getString('common.variables')}</div>
          <div className={cx(css.nestedAccordions, css.infraSections)}>
            <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
              factory={factory as unknown as AbstractStepFactory}
              initialValues={{
                variables: (initialValues.variables || []) as AllNGVariables[],
                canAddVariable: true
              }}
              type={StepType.CustomVariable}
              stepViewType={StepViewType.InputSet}
              allowableTypes={allowableTypes}
              onUpdate={({ variables }: CustomVariablesData) => {
                onUpdate?.({
                  variables: variables as any
                })
              }}
              customStepProps={{
                template: { variables: (template?.variables || []) as AllNGVariables[] },
                path,
                allValues: { variables: (allValues?.variables || []) as AllNGVariables[] },
                allowedVarialblesTypes: [
                  VariableType.String,
                  VariableType.Secret,
                  VariableType.Number,
                  VariableType.Connector
                ],
                isDescriptionEnabled: true,
                allowedConnectorTypes: connectorsList
              }}
              readonly={readonly}
            />
          </div>
        </>
      )}
    </Layout.Vertical>
  )
}
