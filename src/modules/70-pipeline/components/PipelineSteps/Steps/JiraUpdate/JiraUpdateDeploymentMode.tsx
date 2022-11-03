/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { JiraStatusNG, useGetJiraStatuses } from 'services/cd-ng'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import { getGenuineValue } from '../JiraApproval/helper'
import type { JiraUpdateDeploymentModeFormContentInterface, JiraUpdateDeploymentModeProps } from './types'
import css from '../JiraCreate/JiraCreate.module.scss'

function FormContent(formContentProps: JiraUpdateDeploymentModeFormContentInterface): React.ReactElement {
  const {
    inputSetData,
    initialValues,
    statusResponse,
    fetchingStatuses,
    refetchStatuses,
    statusFetchError,
    allowableTypes,
    stepViewType
  } = formContentProps
  const template = inputSetData?.template
  const path = inputSetData?.path
  const prefix = isEmpty(path) ? '' : `${path}.`
  const readonly = inputSetData?.readonly
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()

  const { expressions } = useVariablesExpression()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const [statusOptions, setStatusOptions] = useState<SelectOption[]>([])
  const connectorRefFixedValue = getGenuineValue(
    initialValues.spec?.connectorRef || (inputSetData?.allValues?.spec?.connectorRef as string)
  )

  const [statusValue, setStatusValue] = useState<SelectOption>()

  useEffect(() => {
    // If connector value changes in form, fetch projects
    if (connectorRefFixedValue) {
      refetchStatuses({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorRefFixedValue])

  useEffect(() => {
    // get status by connector ref response
    let options: SelectOption[] = []
    const statusResponseList: JiraStatusNG[] = statusResponse?.data || []
    options =
      statusResponseList.map((status: JiraStatusNG) => ({
        label: status.name || '',
        value: status.name || ''
      })) || []

    setStatusOptions(options)
    const matched = options?.find(opt => opt.value === initialValues.spec?.transitionTo?.status)
    if (matched) {
      setStatusValue(matched)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusResponse?.data])

  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <TimeoutFieldInputSetView
          name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          className={css.deploymentViewMedium}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: isApprovalStepFieldDisabled(readonly)
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          fieldPath="timeout"
          template={template}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME ? (
        <FormMultiTypeConnectorField
          name={`${prefix}spec.connectorRef`}
          label={getString('pipeline.jiraApprovalStep.connectorRef')}
          selected={(initialValues?.spec?.connectorRef as string) || ''}
          placeholder={getString('connectors.selectConnector')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={385}
          setRefValue
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTypeProps={{
            allowableTypes,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          type={'Jira'}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.issueKey) === MultiTypeInputType.RUNTIME ? (
        <TextFieldInputSetView
          label={getString('pipeline.jiraApprovalStep.issueKey')}
          className={css.deploymentViewMedium}
          name={`${prefix}spec.issueKey`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          placeholder={getString('pipeline.jiraApprovalStep.issueKeyPlaceholder')}
          multiTextInputProps={{ expressions, allowableTypes }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath="spec.issueKey"
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.transitionTo?.status) === MultiTypeInputType.RUNTIME ? (
        <SelectInputSetView
          selectItems={statusOptions}
          className={css.deploymentViewMedium}
          label={getString('status')}
          name={`${prefix}spec.transitionTo.status`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          useValue
          template={template}
          fieldPath="spec.transitionTo.status"
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              defaultSelectedItem: statusValue,
              items: statusOptions,
              inputProps: {
                placeholder: fetchingStatuses
                  ? getString('pipeline.jiraUpdateStep.fetchingStatus')
                  : statusFetchError?.message
                  ? statusFetchError.message
                  : getString('pipeline.jiraUpdateStep.selectStatus')
              }
            }
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.transitionTo?.transitionName) === MultiTypeInputType.RUNTIME ? (
        <TextFieldInputSetView
          placeholder={getString('pipeline.jiraUpdateStep.transitionPlaceholder')}
          label={getString('pipeline.jiraUpdateStep.transitionLabel')}
          className={css.deploymentViewMedium}
          name={`${prefix}spec.transitionTo.transitionName`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          multiTextInputProps={{ expressions, allowableTypes }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={template}
          fieldPath="spec.transitionTo.transitionName"
        />
      ) : null}
    </React.Fragment>
  )
}

export default function JiraUpdateDeploymentMode(props: JiraUpdateDeploymentModeProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps & GitQueryParams>>()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const {
    refetch: refetchStatuses,
    data: statusResponse,
    error: statusFetchError,
    loading: fetchingStatuses
  } = useGetJiraStatuses({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  return (
    <FormContent
      {...props}
      refetchStatuses={refetchStatuses}
      statusResponse={statusResponse}
      statusFetchError={statusFetchError}
      fetchingStatuses={fetchingStatuses}
    />
  )
}
