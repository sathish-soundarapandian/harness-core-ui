/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, SelectOption, Text } from '@harness/uicore'
import { isEmpty, get, isEqual, defaultTo } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import {
  OrganizationDTO,
  useGetTerraformCloudOrganizations,
  useGetTerraformCloudWorkspaces,
  WorkspaceDTO
} from 'services/cd-ng'
import { useQueryParams } from '@common/hooks'
import List from '@common/components/List/List'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Connectors } from '@connectors/constants'
import { getSelectedConnectorValue, SelectedConnectorType } from '@cd/utils/connectorUtils'
import { isValueRuntimeInput } from '@common/utils/utils'
import { FormMultiTypeCheckboxField } from '@common/components'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { TerraformCloudRunInputStepProps } from './types'
import { organizationLabel, workspaceLabel } from './helper'

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
  const connectorInitialValue = get(initialValues, 'spec.spec.connectorRef')
  const organizationInitialValue = get(initialValues, 'spec.spec.organization')

  const [connector, setConnector] = useState<string | undefined>(
    defaultTo(connectorInitialValue, allValues?.spec?.spec?.connectorRef)
  )
  const [organizationData, setOrganizationData] = useState<string | undefined>(
    defaultTo(organizationInitialValue, allValues?.spec?.spec?.organization)
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
    return (get(organizationsData, 'data.organizations', []) as OrganizationDTO[]).map(org => ({
      value: org?.organizationName,
      label: org?.organizationName
    }))
  }, [organizationsData])

  const {
    data: workspacesData,
    refetch: refetchworkSpaces,
    loading: loadingworkSpaces,
    error: spacesError
  } = useGetTerraformCloudWorkspaces({
    queryParams: {
      ...queryParams,
      organization: organizationData as string
    },
    lazy: true
  })

  const workspaces: SelectOption[] = useMemo(() => {
    return (get(workspacesData, 'data.workspaces', []) as WorkspaceDTO[]).map(workspace => ({
      value: workspace?.workspaceId,
      label: `${workspace?.workspaceName}: ${workspace?.workspaceId}`
    }))
  }, [workspacesData])

  const inputSet = template?.spec?.spec
  const {
    discardPendingRuns,
    connectorRef,
    workspace,
    overridePolicies,
    exportTerraformPlanJson,
    organization,
    provisionerIdentifier,
    targets
  } = defaultTo(inputSet, {})

  return (
    <FormikForm>
      {isValueRuntimeInput(get(template, 'timeout')) && (
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
      {isValueRuntimeInput(discardPendingRuns) && (
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
      {isValueRuntimeInput(get(template, 'spec.runMessage')) && (
        <FormMultiTypeTextAreaField
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

      {isValueRuntimeInput(connectorRef) && (
        <div className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            name={`${prefix}spec.spec.connectorRef`}
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
                  const connectorRefValue = getSelectedConnectorValue(selected as unknown as SelectedConnectorType)
                  if (!isEqual(connectorRefValue, connector)) {
                    setConnector(connectorRefValue)
                  }
                } else if (type === MultiTypeInputType.EXPRESSION) {
                  setConnector(selected?.toString())
                }
              }
            }
            gitScope={{ repo: defaultTo(repoIdentifier, ''), branch, getDefaultFromOtherRepo: true }}
            templateProps={{
              isTemplatizedView: true,
              templateValue: get(template, 'spec.spec.connectorRef')
            }}
          />
        </div>
      )}
      {isValueRuntimeInput(organization) && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}
          name={`${prefix}spec.spec.organization`}
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
                  setOrganizationData(getValue(value))
                }
              } else if (type === MultiTypeInputType.EXPRESSION) {
                setOrganizationData(value?.toString())
              }
            },
            onFocus: () => {
              /* istanbul ignore next */
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
                    ? /* istanbul ignore next */ getString('loading')
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
      {isValueRuntimeInput(workspace) && (
        <SelectInputSetView
          className={cx(stepCss.formGroup, stepCss.md, css.inputWrapper)}
          name={`${prefix}spec.spec.workspace`}
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
            onFocus: /* istanbul ignore next */ () => {
              if (connector && organizationData) {
                refetchworkSpaces({
                  queryParams: {
                    accountIdentifier: accountId,
                    projectIdentifier,
                    orgIdentifier,
                    connectorRef: connector as string,
                    organization: organizationData
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
                    ? /* istanbul ignore next */ getString('loading')
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
          fieldPath="workspace"
          template={template}
        />
      )}

      {isValueRuntimeInput(overridePolicies) && (
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
      {isValueRuntimeInput(provisionerIdentifier) && (
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

      {isValueRuntimeInput(targets as string) && (
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
      {isValueRuntimeInput(exportTerraformPlanJson) && (
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
