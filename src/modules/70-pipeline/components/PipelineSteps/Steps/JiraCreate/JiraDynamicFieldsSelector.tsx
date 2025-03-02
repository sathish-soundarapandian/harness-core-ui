/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { FieldArray, FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { Intent } from '@blueprintjs/core'
import {
  Button,
  Formik,
  FormInput,
  HarnessDocTooltip,
  MultiTypeInputType,
  PageSpinner,
  Radio,
  Select,
  Text,
  TextInput
} from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import { String, useStrings } from 'framework/strings'

import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import {
  JiraFieldNG,
  JiraProjectNG,
  ResponseMessage,
  useGetJiraIssueCreateMetadata,
  useGetJiraIssueUpdateMetadata
} from 'services/cd-ng'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { setIssueTypeOptions } from '../JiraApproval/helper'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import { JiraFieldSelector } from './JiraFieldSelector'
import {
  JiraCreateFieldType,
  JiraCreateFormFieldSelector,
  JiraDynamicFieldsSelectorContentInterface,
  JiraDynamicFieldsSelectorInterface
} from './types'
import css from './JiraDynamicFieldsSelector.module.scss'

function SelectFieldList(props: JiraDynamicFieldsSelectorContentInterface) {
  const { getString } = useStrings()
  const {
    connectorRef,
    refetchProjectMetadata,
    projectMetaResponse,
    fetchingProjectMetadata,
    projectMetadataFetchError,
    issueUpdateMetadataFetchError,
    jiraType,
    refetchIssueMetadata,
    issueMetaResponse,
    fetchingIssueMetadata,
    issueMetadataFetchError,
    refetchIssueUpdateMetadata,
    issueUpdateMetaResponse,
    fetchingIssueUpdateMetadata,
    selectedProjectKey: selectedProjectKeyInit,
    selectedIssueTypeKey: selectedIssueTypeKeyInit,
    issueKey
  } = props

  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }
  const [projectValue, setProjectValue] = useState<JiraProjectSelectOption>({
    key: selectedProjectKeyInit as string,
    value: selectedProjectKeyInit as string,
    label: selectedProjectKeyInit as string
  })

  const [issueTypeValue, setIssueTypeValue] = useState<JiraProjectSelectOption>({
    key: selectedIssueTypeKeyInit as string,
    value: selectedIssueTypeKeyInit as string,
    label: selectedIssueTypeKeyInit as string
  })

  const [issueKeyValue, setIssueKeyValue] = useState(issueKey)

  const [projectMetadata, setProjectMetadata] = useState<JiraProjectNG>()
  const [issueMetadata, setIssueMetadata] = useState<JiraProjectNG>()
  const [fieldList, setFieldList] = useState<JiraFieldNG[]>([])

  const { getRBACErrorMessage } = useRBACError()

  const issueUpdateResponseErrors = (issueUpdateMetadataFetchError?.data as any)?.responseMessages as ResponseMessage[]

  const selectedProjectKey = projectValue?.key?.toString()
  const selectedIssueTypeKey = issueTypeValue?.key?.toString()

  useEffect(() => {
    if (connectorRef && selectedProjectKey) {
      refetchProjectMetadata({
        queryParams: {
          ...commonParams,
          expand: 'projects.issuetypes',
          connectorRef,
          projectKey: selectedProjectKey
        }
      })
    }
  }, [selectedProjectKey])

  useEffect(() => {
    if (connectorRef && selectedProjectKey && selectedIssueTypeKey) {
      refetchIssueMetadata({
        queryParams: {
          ...commonParams,
          expand: 'projects.issuetypes.fields',
          connectorRef,
          projectKey: selectedProjectKey,
          issueType: selectedIssueTypeKey
        }
      })
    }
  }, [selectedIssueTypeKey])

  useEffect(() => {
    if (jiraType === 'updateMode' && issueKeyValue) {
      refetchIssueUpdateMetadata({
        queryParams: {
          ...commonParams,
          connectorRef,
          issueKey: issueKeyValue
        }
      })
    }
  }, [connectorRef, issueKeyValue, jiraType])

  useEffect(() => {
    // If issuetype changes in form, set status and field list
    if (selectedIssueTypeKey && issueMetadata?.issuetypes[selectedIssueTypeKey]?.fields) {
      const issueTypeData = issueMetadata?.issuetypes[selectedIssueTypeKey || '']
      const fieldListToSet: JiraFieldNG[] = []
      const fieldKeys = Object.keys(issueTypeData?.fields || {})
      fieldKeys.sort().forEach(keyy => {
        if (issueTypeData?.fields[keyy]) {
          if (jiraType === 'createMode' && !issueTypeData?.fields[keyy]?.required) {
            fieldListToSet.push(issueTypeData?.fields[keyy])
          }
        }
      })
      setFieldList(fieldListToSet)
    }
  }, [selectedIssueTypeKey, issueMetadata, jiraType])

  useEffect(() => {
    // If issueKey changes in form, set status and field list
    if (issueKeyValue && issueUpdateMetaResponse?.data?.fields) {
      const issueTypeData = issueUpdateMetaResponse?.data
      const fieldListToSet: JiraFieldNG[] = []
      const fieldKeys = Object.keys(issueTypeData?.fields)
      fieldKeys.sort().forEach(keyy => {
        if (issueTypeData?.fields[keyy]) {
          fieldListToSet.push(issueTypeData?.fields[keyy])
        }
      })
      setFieldList(fieldListToSet)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueKeyValue, issueUpdateMetaResponse])

  useEffect(() => {
    if (selectedProjectKey && projectMetaResponse?.data?.projects) {
      const projectMD: JiraProjectNG = projectMetaResponse?.data?.projects[selectedProjectKey]
      setProjectMetadata(projectMD)
    }
  }, [projectMetaResponse?.data, selectedProjectKey])

  useEffect(() => {
    if (selectedProjectKey && issueMetaResponse?.data?.projects) {
      const issueMD: JiraProjectNG = issueMetaResponse?.data?.projects[selectedProjectKey]
      setIssueMetadata(issueMD)
    }
  }, [issueMetaResponse?.data, selectedProjectKey, selectedIssueTypeKey])

  return (
    <div>
      {jiraType === 'createMode' ? (
        <>
          <Text className={css.selectFieldListHelp}>{getString('pipeline.jiraCreateStep.selectFieldListHelp')}</Text>
          <div className={css.select}>
            <Text className={css.selectLabel}>{getString('pipeline.jiraApprovalStep.project')}</Text>
            <Select
              items={props.projectOptions as JiraProjectSelectOption[]}
              defaultSelectedItem={{
                label: selectedProjectKey,
                value: selectedProjectKey
              }}
              onChange={value => {
                setProjectValue(value as JiraProjectSelectOption)
                setIssueTypeValue({ label: '', value: '', key: '' } as JiraProjectSelectOption)
              }}
              inputProps={{
                placeholder: getString('common.selectProject')
              }}
            />
          </div>

          <div className={css.select}>
            <Text className={css.selectLabel}>{getString('common.resourceCenter.ticketmenu.issueType')}</Text>
            <Select
              value={issueTypeValue}
              items={
                fetchingProjectMetadata
                  ? [{ label: 'Fetching Issue Types...', value: '' }]
                  : setIssueTypeOptions(projectMetadata?.issuetypes)
              }
              inputProps={{
                placeholder: fetchingProjectMetadata
                  ? getString('pipeline.jiraApprovalStep.fetchingIssueTypePlaceholder')
                  : getString('pipeline.jiraApprovalStep.issueTypePlaceholder')
              }}
              defaultSelectedItem={{
                label: selectedIssueTypeKey,
                value: selectedIssueTypeKey
              }}
              onChange={value => {
                setIssueTypeValue(value as JiraProjectSelectOption)
              }}
            />
          </div>
        </>
      ) : (
        <>
          <Text className={css.selectLabel}>{getString('pipeline.jiraApprovalStep.issueKey')}</Text>
          <TextInput
            name="issueKey"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setIssueKeyValue(event.target.value)
            }}
            value={issueKeyValue}
          />
        </>
      )}

      {fetchingIssueMetadata || fetchingIssueUpdateMetadata ? (
        <PageSpinner
          message={getString('pipeline.jiraCreateStep.fetchingFields')}
          className={css.fetchingPageSpinner}
        />
      ) : null}

      {(jiraType === 'createMode' && !selectedIssueTypeKey) || (jiraType === 'updateMode' && !issueKeyValue) ? (
        <div className={css.fieldsSelectorPlaceholder}>
          <Text>{getString('pipeline.jiraCreateStep.fieldsSelectorPlaceholder')}</Text>
        </div>
      ) : issueUpdateMetadataFetchError ? (
        issueUpdateResponseErrors ? (
          <ErrorHandler responseMessages={issueUpdateResponseErrors} />
        ) : (
          <Text intent={Intent.DANGER}>{getRBACErrorMessage(issueUpdateMetadataFetchError)}</Text>
        )
      ) : jiraType === 'updateMode' && isEmpty(issueUpdateMetaResponse?.data) && !issueUpdateMetadataFetchError ? (
        <Text intent="warning">{getString('pipeline.jiraUpdateStep.projectIssueKeyDisclaimer')}</Text>
      ) : jiraType === 'createMode' &&
        ((isEmpty(projectMetaResponse?.data) && !projectMetadataFetchError) ||
          (isEmpty(issueMetaResponse?.data) && !issueMetadataFetchError)) ? (
        <Text intent="warning">{getString('pipeline.jiraCreateStep.projectIssueTypeDisclaimer')}</Text>
      ) : (
        <JiraFieldSelector
          fields={fieldList}
          selectedFields={props?.selectedFields || []}
          onCancel={props.onCancel}
          addSelectedFields={fields => props.addSelectedFields(fields, selectedProjectKey, selectedIssueTypeKey)}
        />
      )}
    </div>
  )
}

function ProvideFieldList(props: JiraDynamicFieldsSelectorContentInterface) {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <Formik<JiraCreateFieldType[]>
      onSubmit={values => {
        props.provideFieldList(values)
      }}
      formName="jiraFields"
      initialValues={[]}
    >
      {(formik: FormikProps<{ fieldList: JiraCreateFieldType[] }>) => {
        return (
          <div>
            <FieldArray
              name="fieldList"
              render={({ push, remove }) => {
                return (
                  <div>
                    {formik.values.fieldList?.length ? (
                      <div className={css.headerRow}>
                        <String className={css.label} stringID="keyLabel" />
                        <String className={css.label} stringID="valueLabel" />
                      </div>
                    ) : null}

                    {formik.values.fieldList?.map((_unused: JiraCreateFieldType, i: number) => (
                      <div className={css.headerRow} key={i}>
                        <FormInput.Text
                          name={`fieldList[${i}].name`}
                          placeholder={getString('pipeline.keyPlaceholder')}
                        />
                        <FormInput.MultiTextInput
                          name={`fieldList[${i}].value`}
                          label=""
                          placeholder={getString('common.valuePlaceholder')}
                          multiTextInputProps={{
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                            expressions
                          }}
                        />
                        <Button
                          minimal
                          icon="main-trash"
                          data-testid={`remove-fieldList-${i}`}
                          onClick={() => remove(i)}
                        />
                      </div>
                    ))}
                    <Button
                      icon="plus"
                      minimal
                      intent="primary"
                      data-testid="add-fieldList"
                      onClick={() => push({ name: '', value: '' })}
                      className={css.addFieldsButton}
                    >
                      {getString('pipeline.jiraCreateStep.addFields')}
                    </Button>
                  </div>
                )
              }}
            />
            <div className={css.buttons}>
              <Button intent="primary" type="submit" onClick={() => props.provideFieldList(formik.values.fieldList)}>
                {getString('add')}
              </Button>
              <Button className={css.secondButton} onClick={props.onCancel}>
                {getString('cancel')}
              </Button>
            </div>
          </div>
        )
      }}
    </Formik>
  )
}

function Content(props: JiraDynamicFieldsSelectorContentInterface) {
  const { getString } = useStrings()
  const { connectorRef, jiraType, issueKey } = props
  const isFixedInput = jiraType === 'updateMode' ? issueKey && connectorRef : connectorRef
  const [type, setType] = useState<JiraCreateFormFieldSelector>(
    isFixedInput ? JiraCreateFormFieldSelector.FIXED : JiraCreateFormFieldSelector.EXPRESSION
  )

  return (
    <div className={css.contentWrapper}>
      <div className={css.radioGroup}>
        <Radio
          onClick={() => setType(JiraCreateFormFieldSelector.FIXED)}
          checked={type === JiraCreateFormFieldSelector.FIXED}
          disabled={jiraType === 'updateMode' ? !issueKey || !connectorRef : !connectorRef}
        >
          <span data-tooltip-id="jiraSelectFromFieldList">
            {getString('pipeline.jiraCreateStep.selectFromFieldList')}{' '}
            <HarnessDocTooltip useStandAlone={true} tooltipId="jiraSelectFromFieldList" />
          </span>
        </Radio>
        <Radio
          onClick={() => setType(JiraCreateFormFieldSelector.EXPRESSION)}
          checked={type === JiraCreateFormFieldSelector.EXPRESSION}
        >
          <span data-tooltip-id="jiraProvideFromFieldList">
            {getString('pipeline.jiraCreateStep.provideFieldList')}{' '}
            <HarnessDocTooltip useStandAlone={true} tooltipId="jiraProvideFromFieldList" />
          </span>
        </Radio>
      </div>
      {type === JiraCreateFormFieldSelector.FIXED ? <SelectFieldList {...props} /> : <ProvideFieldList {...props} />}
    </div>
  )
}

export function JiraDynamicFieldsSelector(props: JiraDynamicFieldsSelectorInterface) {
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }
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

  const {
    refetch: refetchIssueUpdateMetadata,
    data: issueUpdateMetaResponse,
    error: issueUpdateMetadataFetchError,
    loading: fetchingIssueUpdateMetadata
  } = useGetJiraIssueUpdateMetadata({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: '',
      issueKey: ''
    },
    debounce: 500
  })

  return (
    <Content
      {...props}
      refetchProjectMetadata={refetchProjectMetadata}
      projectMetaResponse={projectMetaResponse}
      projectMetadataFetchError={projectMetadataFetchError}
      fetchingProjectMetadata={fetchingProjectMetadata}
      fetchingIssueMetadata={fetchingIssueMetadata}
      refetchIssueMetadata={refetchIssueMetadata}
      issueMetaResponse={issueMetaResponse}
      issueMetadataFetchError={issueMetadataFetchError}
      refetchIssueUpdateMetadata={refetchIssueUpdateMetadata}
      issueUpdateMetaResponse={issueUpdateMetaResponse}
      issueUpdateMetadataFetchError={issueUpdateMetadataFetchError}
      fetchingIssueUpdateMetadata={fetchingIssueUpdateMetadata}
    />
  )
}
