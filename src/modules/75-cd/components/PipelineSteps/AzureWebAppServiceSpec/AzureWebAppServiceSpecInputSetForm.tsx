/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { Layout } from '@wings-software/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { CustomVariableInputSetExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import azureWebAppConfigBaseFactory from '@cd/factory/AzureWebAppConfigFactory/AzureWebAppConfigFactory'
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import { KubernetesArtifacts } from '../K8sServiceSpec/KubernetesArtifacts/KubernetesArtifacts'
import { AzureWebAppConfig } from './RuntimeAzureWebAppConfig/RuntimeAzureWebAppConfig'
import { AzureWebAppConfigType, AzureWebAppServiceSpecFormProps } from './AzureWebAppServiceSpecInterface.types'
//todo: css
import css from '../K8sServiceSpec/K8sServiceSpec.module.scss'

const AzureWebAppServiceSpecInputSet = (props: AzureWebAppServiceSpecFormProps): React.ReactElement => {
  const {
    template,
    path,
    factory,
    allValues,
    initialValues,
    onUpdate,
    readonly = false,
    stageIdentifier,
    serviceIdentifier,
    stepViewType,
    formik,
    allowableTypes
  } = props
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium">
      {!!(template?.artifacts?.primary?.type || template?.artifacts?.sidecars?.length) && (
        <KubernetesArtifacts
          type={template?.artifacts?.primary?.type || ''}
          template={template}
          artifacts={allValues?.artifacts}
          artifactSourceBaseFactory={artifactSourceBaseFactory}
          stepViewType={stepViewType}
          stageIdentifier={stageIdentifier}
          serviceIdentifier={serviceIdentifier}
          formik={formik}
          path={path}
          initialValues={initialValues}
          readonly={readonly}
          allowableTypes={allowableTypes}
        />
      )}

      {!!template?.startupCommand && (
        <AzureWebAppConfig
          template={template}
          azureWebAppConfig={allValues?.startupCommand}
          azureWebAppConfigBaseFactory={azureWebAppConfigBaseFactory}
          stepViewType={stepViewType}
          stageIdentifier={stageIdentifier}
          serviceIdentifier={serviceIdentifier}
          formik={formik}
          path={path}
          initialValues={initialValues}
          readonly={readonly}
          allowableTypes={allowableTypes}
          type={AzureWebAppConfigType.startupCommand}
        />
      )}

      {!!template?.applicationSettings && (
        <AzureWebAppConfig
          template={template}
          azureWebAppConfig={allValues?.applicationSettings}
          azureWebAppConfigBaseFactory={azureWebAppConfigBaseFactory}
          stepViewType={stepViewType}
          stageIdentifier={stageIdentifier}
          serviceIdentifier={serviceIdentifier}
          formik={formik}
          path={path}
          initialValues={initialValues}
          readonly={readonly}
          allowableTypes={allowableTypes}
          type={AzureWebAppConfigType.applicationSettings}
        />
      )}

      {!!template?.connectionStrings && (
        <AzureWebAppConfig
          template={template}
          azureWebAppConfig={allValues?.connectionStrings}
          azureWebAppConfigBaseFactory={azureWebAppConfigBaseFactory}
          stepViewType={stepViewType}
          stageIdentifier={stageIdentifier}
          serviceIdentifier={serviceIdentifier}
          formik={formik}
          path={path}
          initialValues={initialValues}
          readonly={readonly}
          allowableTypes={allowableTypes}
          type={AzureWebAppConfigType.connectionStrings}
        />
      )}

      {!!template?.variables?.length && (
        <div id={`Stage.${stageIdentifier}.Service.Variables`} className={cx(css.nopadLeft, css.accordionSummary)}>
          <div className={css.subheading}>{getString('common.variables')}</div>

          <div className={css.nestedAccordions}>
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
                allValues: { variables: (allValues?.variables || []) as AllNGVariables[] }
              }}
              readonly={readonly}
            />
          </div>
        </div>
      )}
    </Layout.Vertical>
  )
}

export const AzureWebAppServiceSpecInputSetForm = connect(AzureWebAppServiceSpecInputSet)
