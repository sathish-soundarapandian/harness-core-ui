/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Text,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Icon,
  AllowedTypes
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { debounce, noop, defaultTo } from 'lodash-es'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ServerlessInfraTypes } from '@pipeline/utils/stageHelpers'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { getValidationSchema, getValidationSchemaWithRegion } from '../PipelineStepsUtil'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ServerlessInfraSpec.module.scss'

export interface ServerlessSpecEditableProps {
  initialValues: ServerlessInfraTypes
  onUpdate?: (data: any) => void
  stepViewType?: StepViewType
  readonly?: boolean
  template?: ServerlessInfraTypes
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ServerlessInfraTypes
  allowableTypes: AllowedTypes
  hasRegion?: boolean
  formInfo: {
    formName: string
    type: ConnectorInfoDTO['type']
    header: string
    tooltipIds: {
      connector: string
      region?: string
      stage: string
    }
  }
}

export const ServerlessSpecEditable: React.FC<ServerlessSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes,
  hasRegion,
  formInfo
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.INFRASTRUCTURE, form: formikRef })
  }, [subscribeForm, unSubscribeForm])

  return (
    <Layout.Vertical spacing="medium">
      <Formik<ServerlessInfraTypes>
        formName={formInfo.formName}
        initialValues={initialValues}
        validate={value => {
          const data: Partial<ServerlessInfraTypes> = {
            connectorRef: undefined,
            stage: value.stage === '' ? undefined : value.stage,
            allowSimultaneousDeployments: value.allowSimultaneousDeployments
          }
          if (hasRegion) {
            data.region = value.region === '' ? undefined : value.region
          }
          if (value.connectorRef) {
            data.connectorRef = (value.connectorRef as any)?.value || value.connectorRef
          }

          delayedOnUpdate(data)
        }}
        validationSchema={hasRegion ? getValidationSchemaWithRegion(getString) : getValidationSchema(getString)}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik as FormikProps<unknown> | null
          return (
            <FormikForm>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={getString('connector')}
                  placeholder={getString('connectors.selectConnector')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  tooltipProps={{
                    dataTooltipId: formInfo.tooltipIds.connector
                  }}
                  multiTypeProps={{ expressions, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  connectorLabelClass={css.connectorRef}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-large)' }}
                  type={formInfo.type}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType(formInfo.type)}></Icon>
                        <Text>{formInfo.header}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('connectorRef', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>
              {hasRegion && (
                <Layout.Horizontal className={css.formRow} spacing="medium">
                  <FormInput.MultiTextInput
                    name="region"
                    tooltipProps={{
                      dataTooltipId: formInfo.tooltipIds.region || ''
                    }}
                    className={css.inputWidth}
                    disabled={readonly}
                    placeholder={getString('cd.steps.serverless.regionPlaceholder')}
                    multiTextInputProps={{
                      expressions,
                      disabled: readonly,
                      allowableTypes
                    }}
                    label={getString('regionLabel')}
                  />
                  {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && !readonly && (
                    <ConfigureOptions
                      value={formik.values.region}
                      type="String"
                      variableName="region"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('region', value)
                      }}
                      isReadonly={readonly}
                      className={css.marginTop}
                    />
                  )}
                </Layout.Horizontal>
              )}
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormInput.MultiTextInput
                  name="stage"
                  tooltipProps={{
                    dataTooltipId: formInfo.tooltipIds.stage
                  }}
                  className={css.inputWidth}
                  label={getString('common.stage')}
                  placeholder={getString('cd.steps.serverless.stagePlaceholder')}
                  multiTextInputProps={{ expressions, textProps: { disabled: readonly }, allowableTypes }}
                  disabled={readonly}
                />
                {getMultiTypeFromValue(formik.values.stage) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.stage as string}
                    type="String"
                    variableName="stage"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('stage', value)
                    }}
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal
                spacing="medium"
                style={{ alignItems: 'center' }}
                margin={{ top: 'medium' }}
                className={css.lastRow}
              >
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  name={'allowSimultaneousDeployments'}
                  label={getString('cd.allowSimultaneousDeployments')}
                  tooltipProps={{
                    dataTooltipId: 'k8InfraAllowSimultaneousDeployments'
                  }}
                  disabled={readonly}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export const ServerlessInputForm: React.FC<ServerlessSpecEditableProps & { path: string }> = ({
  template,
  readonly = false,
  path,
  allowableTypes,
  hasRegion,
  formInfo
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="small">
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            tooltipProps={{
              dataTooltipId: 'awsInfraConnector'
            }}
            name={`${path}.connectorRef`}
            label={getString('connector')}
            enableConfigureOptions={false}
            placeholder={getString('connectors.selectConnector')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={formInfo.type}
            setRefValue
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.region) === MultiTypeInputType.RUNTIME && hasRegion && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.regionInputWrapper)}>
          <FormInput.MultiTextInput
            name={`${path}.region`}
            disabled={readonly}
            placeholder={getString('cd.steps.serverless.regionPlaceholder')}
            label={getString('regionLabel')}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.stage) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.stage`}
            label={getString('common.stage')}
            disabled={readonly}
            multiTextInputProps={{
              allowableTypes,
              expressions
            }}
            placeholder={getString('cd.steps.serverless.stagePlaceholder')}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export const ServerlessVariablesForm: React.FC<ServerlessSpecEditableProps> = ({
  metadataMap,
  initialValues,
  variablesData
}) => {
  const infraVariables = variablesData?.infrastructureDefinition?.spec
  return infraVariables ? (
    /* istanbul ignore next */ <VariablesListTable
      data={infraVariables}
      originalData={initialValues.infrastructureDefinition?.spec || initialValues}
      metadataMap={metadataMap}
    />
  ) : null
}
