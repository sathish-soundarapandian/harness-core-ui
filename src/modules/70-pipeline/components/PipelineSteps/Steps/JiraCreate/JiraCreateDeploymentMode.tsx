/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, isEmpty, pickBy, set } from 'lodash-es'
import { EXECUTION_TIME_INPUT_VALUE, getMultiTypeFromValue, MultiTypeInputType, PageSpinner } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  JiraFieldNG,
  JiraProjectBasicNG,
  JiraProjectNG,
  useGetJiraIssueCreateMetadata,
  useGetJiraProjects
} from 'services/cd-ng'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { getGenuineValue, setIssueTypeOptions } from '../JiraApproval/helper'
import { getInitialValueForSelectedField } from './helper'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import { isApprovalStepFieldDisabled } from '../Common/ApprovalCommons'
import type {
  JiraCreateDeploymentModeProps,
  JiraCreateDeploymentModeFormContentInterface,
  JiraFieldNGWithValue
} from './types'
import { JiraFieldsRenderer } from './JiraFieldsRenderer'
import css from './JiraCreate.module.scss'

function FormContent(formContentProps: JiraCreateDeploymentModeFormContentInterface) {
  const {
    inputSetData,
    allowableTypes,
    initialValues,
    projectMetaResponse,
    projectsResponse,
    refetchProjects,
    refetchProjectMetadata,
    refetchIssueMetadata,
    fetchingProjectMetadata,
    fetchingIssueMetadata,
    fetchingProjects,
    projectMetadataFetchError,
    projectsFetchError,
    stepViewType,
    issueMetaResponse
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
  const [projectOptions, setProjectOptions] = useState<JiraProjectSelectOption[]>([])
  const [projectMetadata, setProjectMetadata] = useState<JiraProjectNG>()

  const [issueMetadata, setIssueMetadata] = useState<JiraProjectNG>()
  const [selectedProjectValue, setSelectedProjectValue] = useState<JiraProjectSelectOption>()
  const [selectedIssueTypeValue, setSelectedIssueTypeValue] = useState<JiraProjectSelectOption>()

  const connectorRefFixedValue =
    template?.spec?.connectorRef === EXECUTION_TIME_INPUT_VALUE
      ? formContentProps?.formik?.values?.spec?.connectorRef
      : getGenuineValue(initialValues.spec?.connectorRef || (inputSetData?.allValues?.spec?.connectorRef as string))
  const projectKeyFixedValue =
    template?.spec?.projectKey === EXECUTION_TIME_INPUT_VALUE
      ? formContentProps?.formik?.values?.spec?.projectKey
      : initialValues.spec?.projectKey || inputSetData?.allValues?.spec?.projectKey

  const issueTypeFixedValue = initialValues.spec?.issueType || inputSetData?.allValues?.spec?.issueType
  const [fields, setFields] = useState<JiraFieldNGWithValue[]>([])
  useEffect(() => {
    // If connector value changes in form, fetch projects
    if (connectorRefFixedValue) {
      refetchProjects({
        queryParams: {
          ...commonParams,
          connectorRef: connectorRefFixedValue.toString()
        }
      })
    }
  }, [connectorRefFixedValue])

  useEffect(() => {
    // If project value changes in form, fetch metadata
    if (connectorRefFixedValue && projectKeyFixedValue) {
      refetchProjectMetadata({
        queryParams: {
          ...commonParams,
          expand: 'projects.issuetypes',
          connectorRef: connectorRefFixedValue.toString(),
          projectKey: projectKeyFixedValue.toString()
        }
      })
    }
  }, [projectKeyFixedValue])

  useEffect(() => {
    if (connectorRefFixedValue && projectKeyFixedValue && issueTypeFixedValue) {
      refetchIssueMetadata({
        queryParams: {
          ...commonParams,
          expand: 'projects.issuetypes.fields',
          connectorRef: connectorRefFixedValue.toString(),
          projectKey: projectKeyFixedValue.toString(),
          issueType: issueTypeFixedValue.toString()
        }
      })
    }
  }, [issueTypeFixedValue])

  useEffect(() => {
    let options: JiraProjectSelectOption[] = []
    const projectResponseList: JiraProjectBasicNG[] = projectsResponse?.data || []
    options =
      projectResponseList.map((project: JiraProjectBasicNG) => ({
        label: defaultTo(project.name, ''),
        value: defaultTo(project.key, ''),
        key: defaultTo(project.key, '')
      })) || []

    setProjectOptions(options)
    const matched = options?.find(opt => opt.key === projectKeyFixedValue)
    if (matched) {
      setSelectedProjectValue(matched)
    }
  }, [projectsResponse?.data])

  useEffect(() => {
    if (projectKeyFixedValue && projectMetaResponse?.data?.projects) {
      const projectMD: JiraProjectNG = projectMetaResponse?.data?.projects[projectKeyFixedValue as string]
      setProjectMetadata(projectMD)

      const issueTypeOptions = setIssueTypeOptions(projectMD?.issuetypes)
      const matched = issueTypeOptions.find(opt => opt.key === initialValues?.spec?.issueType)
      if (matched) {
        setSelectedIssueTypeValue(matched)
      }
    }
  }, [projectMetaResponse?.data])

  useEffect(() => {
    // If issuetype changes in form, set field list
    if (issueTypeFixedValue && issueMetadata?.issuetypes[issueTypeFixedValue as string]?.fields) {
      const issueTypeData = issueMetadata?.issuetypes[issueTypeFixedValue as string]
      const selectedFieldsValue = initialValues.spec?.fields || inputSetData?.allValues?.spec?.fields

      //Mapped fields with BE 'issueTypeData?.fields' data to get details for runtime fields and append it in a single object
      const fetchRuntimeFields: any = selectedFieldsValue.map((fieldValueObj, _index) => {
        const fieldName = fieldValueObj.name
        let matchedField = {} as JiraFieldNG
        pickBy(issueTypeData?.fields, function (value, key) {
          if (key === fieldName) {
            matchedField = value
            const savedValueForThisField = getInitialValueForSelectedField(selectedFieldsValue, matchedField)
            if (matchedField) {
              set(
                formContentProps?.formik?.initialValues,
                `${prefix}spec.fields[${_index}].value`,
                !isEmpty(matchedField.allowedValues) && !savedValueForThisField ? [] : savedValueForThisField
              )
            }
          }
        })
        return matchedField
      })

      setFields(fetchRuntimeFields)
    }
  }, [issueTypeFixedValue, issueMetadata])

  useEffect(() => {
    if (projectKeyFixedValue && issueTypeFixedValue && issueMetaResponse?.data?.projects) {
      const issuesMD: JiraProjectNG = issueMetaResponse?.data?.projects[projectKeyFixedValue as string]
      setIssueMetadata(issuesMD)
    }
  }, [issueMetaResponse?.data, projectKeyFixedValue, issueTypeFixedValue])

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
          placeholder={getString('pipeline.jiraApprovalStep.jiraConnectorPlaceholder')}
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
      {getMultiTypeFromValue(template?.spec?.projectKey) === MultiTypeInputType.RUNTIME ? (
        <SelectInputSetView
          selectItems={projectOptions}
          className={css.deploymentViewMedium}
          label={getString('pipeline.jiraApprovalStep.project')}
          name={`${prefix}spec.projectKey`}
          useValue
          placeholder={
            fetchingProjects
              ? getString('pipeline.jiraApprovalStep.fetchingProjectsPlaceholder')
              : projectsFetchError?.message
              ? projectsFetchError?.message
              : getString('pipeline.jiraCreateStep.selectProject')
          }
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              defaultSelectedItem: selectedProjectValue,
              items: projectOptions
            }
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          disabled={isApprovalStepFieldDisabled(readonly)}
          fieldPath={'spec.projectKey'}
          template={template}
        />
      ) : null}

      {getMultiTypeFromValue(template?.spec?.issueType) === MultiTypeInputType.RUNTIME ? (
        <SelectInputSetView
          selectItems={setIssueTypeOptions(projectMetadata?.issuetypes)}
          className={css.deploymentViewMedium}
          placeholder={
            fetchingProjectMetadata
              ? getString('pipeline.jiraApprovalStep.fetchingIssueTypePlaceholder')
              : projectMetadataFetchError?.message
              ? projectMetadataFetchError?.message
              : getString('pipeline.jiraApprovalStep.issueTypePlaceholder')
          }
          label={getString('pipeline.jiraApprovalStep.issueType')}
          name={`${prefix}spec.issueType`}
          disabled={isApprovalStepFieldDisabled(readonly)}
          useValue
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              defaultSelectedItem: selectedIssueTypeValue,
              items: setIssueTypeOptions(projectMetadata?.issuetypes)
            }
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          fieldPath={'spec.issueType'}
          template={template}
        />
      ) : null}

      {fetchingIssueMetadata ? (
        <PageSpinner message={getString('pipeline.jiraCreateStep.fetchingFields')} className={css.fetching} />
      ) : (
        <JiraFieldsRenderer
          fieldPrefix={prefix}
          deploymentMode
          selectedFields={fields}
          readonly={readonly}
          formik={formContentProps?.formik}
          connectorRef={connectorRefFixedValue?.toString()}
          template={template}
        />
      )}
    </React.Fragment>
  )
}

export default function JiraCreateDeploymentMode(props: JiraCreateDeploymentModeProps): JSX.Element {
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
    refetch: refetchProjects,
    data: projectsResponse,
    error: projectsFetchError,
    loading: fetchingProjects
  } = useGetJiraProjects({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const {
    refetch: refetchProjectMetadata,
    data: projectMetaResponse,
    error: projectMetadataFetchError,
    loading: fetchingProjectMetadata
  } = useGetJiraIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      expand: '',
      connectorRef: '',
      projectKey: ''
    }
  })

  const {
    refetch: refetchIssueMetadata,
    data: issueMetaResponse,
    error: issueMetadataFetchError,
    loading: fetchingIssueMetadata
  } = useGetJiraIssueCreateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      expand: '',
      connectorRef: '',
      projectKey: '',
      issueType: ''
    }
  })

  return (
    <FormContent
      {...props}
      refetchProjects={refetchProjects}
      projectsResponse={projectsResponse}
      projectsFetchError={projectsFetchError}
      fetchingProjects={fetchingProjects}
      refetchProjectMetadata={refetchProjectMetadata}
      projectMetaResponse={projectMetaResponse}
      projectMetadataFetchError={projectMetadataFetchError}
      fetchingProjectMetadata={fetchingProjectMetadata}
      fetchingIssueMetadata={fetchingIssueMetadata}
      refetchIssueMetadata={refetchIssueMetadata}
      issueMetaResponse={issueMetaResponse}
      issueMetadataFetchError={issueMetadataFetchError}
    />
  )
}
