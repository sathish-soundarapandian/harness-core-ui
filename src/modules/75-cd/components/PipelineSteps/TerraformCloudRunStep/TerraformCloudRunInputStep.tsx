/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormInput, FormikForm, SelectOption, Text } from '@harness/uicore'
import { isEmpty, get, isArray, isEqual, defaultTo } from 'lodash-es'
import cx from 'classnames'
import { FieldArray } from 'formik'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useGetTerraformCloudOrganizations, useGetTerraformCloudWorkspaces } from 'services/cd-ng'
import { useQueryParams } from '@common/hooks'
import List from '@common/components/List/List'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Connectors } from '@connectors/constants'
import { getSelectedConnectorValue, SelectedConnectorType } from '@cd/utils/connectorUtils'
import { isValueRuntimeInput } from '@common/utils/utils'
import { FormMultiTypeCheckboxField } from '@common/components'
import { FormMultiTypeTextArea } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { TerraformCloudRunInputStepProps } from './types'
import { organizationLabel, variableTypes, workspaceLabel } from './helper'

import { getValue } from '../PipelineStepsUtil'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TerraformCloudRunStep.module.scss'

const errorMessage = 'data.message'

export default function TerraformCloudRunInputStep(props: TerraformCloudRunInputStepProps): React.ReactElement {
  const { template, path, readonly, initialValues, allowableTypes, stepViewType, allValues } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const connectorInitialValue = initialValues.spec?.spec?.connectorRef

  const [connector, setConnector] = useState<string | undefined>(
    defaultTo(connectorInitialValue, allValues?.spec?.spec?.connectorRef)
  )
  const [organization, setOrganization] = useState<string | undefined>(
    defaultTo(initialValues.spec?.spec?.organization, allValues?.spec?.spec?.organization)
  )

  const queryParams = {
    connectorRef: connector as string,
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  }

  const {
    data: organizationsData,
    loading: loadingOrganizations,
    refetch: refetchOrganizations,
    error: organizationsError
  } = useGetTerraformCloudOrganizations({
    queryParams,
    lazy: true
  })

  const organizations: SelectOption[] = useMemo(() => {
    return defaultTo(organizationsData?.data?.organizations, [])?.map(org => ({
      value: org?.organizationName,
      label: org?.organizationName
    }))
  }, [organizationsData?.data?.organizations])

  const {
    data: workspacesData,
    refetch: refetchworkSpaces,
    loading: loadingworkSpaces,
    error: spacesError
  } = useGetTerraformCloudWorkspaces({
    queryParams: {
      ...queryParams,
      organization: organization as string
    },
    lazy: true
  })

  const workspaces: SelectOption[] = useMemo(() => {
    return defaultTo(workspacesData?.data?.workspaces, [])?.map(workspace => ({
      value: workspace?.workspaceId,
      label: `${workspace?.workspaceName}: ${workspace?.workspaceId}`
    }))
  }, [workspacesData?.data?.workspaces])

  const inputSet = get(template, 'spec.spec')

  return (
    <FormikForm>
      {isValueRuntimeInput(template?.timeout) && (
        <TimeoutFieldInputSetView
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: readonly
          }}
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={readonly}
          fieldPath={'timeout'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}
      {isValueRuntimeInput(inputSet?.discardPendingRuns) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.spec.discardPendingRuns`}
            label={getString('pipeline.terraformStep.discardPendingRuns')}
            multiTypeTextbox={{ expressions, allowableTypes }}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
          />
        </div>
      )}
      {isValueRuntimeInput(template?.spec?.runMessage) && (
        <FormMultiTypeTextArea
          className={css.deploymentViewMedium}
          label={getString('pipeline.terraformStep.messageLabel')}
          name={`${prefix}spec.runMessage`}
          disabled={readonly}
          multiTypeTextArea={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            expressions,
            allowableTypes
          }}
        />
      )}

      {isValueRuntimeInput(inputSet?.connectorRef) && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={`${path}.spec.spec.connectorRef`}
            tooltipProps={{
              dataTooltipId: 'tfcloudConnector'
            }}
            label={getString('connector')}
            width={388}
            enableConfigureOptions={false}
            placeholder={getString('connectors.selectConnector')}
            disabled={readonly}
            multiTypeProps={{ allowableTypes, expressions }}
            type={Connectors.TERRAFORM_CLOUD}
            setRefValue
            onChange={
              /* istanbul ignore next */ (selected, _typeValue, type) => {
                if (type === MultiTypeInputType.FIXED) {
                  const connectorRef = getSelectedConnectorValue(selected as unknown as SelectedConnectorType)
                  if (!isEqual(connectorRef, connector)) {
                    setConnector(connectorRef)
                  }
                } else if (type === MultiTypeInputType.EXPRESSION) {
                  setConnector(selected?.toString())
                }
              }
            }
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: template?.spec?.spec?.connectorRef
            }}
          />
        </div>
      )}
      {isValueRuntimeInput(inputSet?.organization) && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}
          name={`${path}.spec.spec.organization`}
          tooltipProps={{
            dataTooltipId: 'tfcloudOrganization'
          }}
          disabled={readonly}
          placeholder={
            loadingOrganizations
              ? /* istanbul ignore next */ getString('loading')
              : getString('cd.steps.tasInfra.organizationPlaceholder')
          }
          useValue
          selectItems={organizations}
          label={getString(organizationLabel)}
          multiTypeInputProps={{
            onChange: /* istanbul ignore next */ (value, _typeValue, type) => {
              if (value && type === MultiTypeInputType.FIXED) {
                if (!isEqual(getValue(value), organization)) {
                  setOrganization(getValue(value))
                }
              } else if (type === MultiTypeInputType.EXPRESSION) {
                setOrganization(value?.toString())
              }
            },
            onFocus: () => {
              if (getMultiTypeFromValue(connector) !== MultiTypeInputType.RUNTIME) {
                refetchOrganizations({
                  queryParams
                })
              }
            },
            selectProps: {
              items: organizations,
              allowCreatingNewItems: true,
              addClearBtn: !(loadingOrganizations || readonly),
              noResults: (
                <Text padding={'small'}>
                  {loadingOrganizations
                    ? getString('loading')
                    : defaultTo(
                        get(organizationsError, errorMessage, organizationsError?.message),
                        getString('cd.steps.tasInfra.organizationError')
                      )}
                </Text>
              )
            },
            expressions,
            allowableTypes
          }}
          fieldPath="organization"
          template={template}
        />
      )}
      {isValueRuntimeInput(inputSet?.workspace) && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}
          name={`${path}.spec.spec.workspace`}
          tooltipProps={{
            dataTooltipId: 'tfcloudworkspace'
          }}
          disabled={readonly}
          placeholder={
            loadingworkSpaces
              ? /* istanbul ignore next */ getString('loading')
              : getString('cd.steps.tasInfra.spacePlaceholder')
          }
          useValue
          selectItems={workspaces}
          label={getString(workspaceLabel)}
          multiTypeInputProps={{
            onFocus: () => {
              if (connector && organization) {
                refetchworkSpaces({
                  queryParams: {
                    accountIdentifier: accountId,
                    projectIdentifier,
                    orgIdentifier,
                    connectorRef: connector as string,
                    organization: organization
                  }
                })
              }
            },

            selectProps: {
              items: workspaces,
              allowCreatingNewItems: true,
              addClearBtn: !(loadingworkSpaces || readonly),
              noResults: (
                <Text padding={'small'}>
                  {loadingworkSpaces
                    ? getString('loading')
                    : defaultTo(
                        get(spacesError, errorMessage, spacesError?.message),
                        getString('cd.steps.tasInfra.spacesError')
                      )}
                </Text>
              )
            },
            expressions,
            allowableTypes
          }}
          fieldPath="space"
          template={template}
        />
      )}

      {isValueRuntimeInput(inputSet?.overridePolicies) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.spec.overridePolicies`}
            label={getString('pipeline.terraformStep.overridePoliciesLabel')}
            multiTypeTextbox={{ expressions, allowableTypes }}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
          />
        </div>
      )}
      {isValueRuntimeInput(inputSet?.provisionerIdentifier) && (
        <TextFieldInputSetView
          name={`${prefix}spec.spec.provisionerIdentifier`}
          placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
          label={getString('pipelineSteps.provisionerIdentifier')}
          disabled={readonly}
          fieldPath={'spec.spec.provisionerIdentifier'}
          template={template}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {isArray(inputSet?.variables) && inputSet?.variables ? (
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.spec.variables"
            label={getString('pipeline.scriptInputVariables')}
            defaultValueToReset={[]}
            disableTypeSelection
          >
            <FieldArray
              name="spec.spec.variables"
              render={() => {
                return (
                  <div className={css.panel}>
                    <div className={css.variables}>
                      <span className={css.label}>Name</span>
                      <span className={css.label}>Type</span>
                      <span className={css.label}>Value</span>
                    </div>
                    {inputSet?.variables?.map((type: { value: React.Key | null | undefined }, i: number) => {
                      return (
                        <div className={css.variables} key={type.value}>
                          <FormInput.Text
                            name={`${prefix}spec.spec.variables[${i}].name`}
                            placeholder={getString('name')}
                            disabled={true}
                          />
                          <FormInput.Select
                            items={variableTypes}
                            name={`${prefix}spec.spec.variables[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={true}
                          />
                          <FormInput.MultiTextInput
                            name={`${prefix}spec.spec.variables[${i}].value`}
                            multiTextInputProps={{
                              allowableTypes,
                              expressions,
                              disabled: readonly
                            }}
                            label=""
                            disabled={readonly}
                            placeholder={getString('valueLabel')}
                          />
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}
      {isValueRuntimeInput(inputSet?.targets as string) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <List
            name={`${prefix}spec.spec.targets`}
            label={<Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipeline.targets.title')}</Text>}
            disabled={readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
          />
        </div>
      )}
      {isValueRuntimeInput(inputSet?.exportTerraformPlanJson) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.spec.exportTerraformPlanJson`}
            label={getString('cd.exportTerraformPlanJson')}
            multiTypeTextbox={{ expressions, allowableTypes }}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
          />
        </div>
      )}
    </FormikForm>
  )
}
