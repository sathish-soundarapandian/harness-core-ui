/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useRef } from 'react'
import cx from 'classnames'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  MultiTypeInputType,
  SelectOption,
  getMultiTypeFromValue,
  FormInput,
  MultiSelectOption,
  FormikForm,
  SelectWithSubmenuOption
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { cloneDeep, defaultTo, isEqual, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import {
  ConnectorConfigDTO,
  JobDetails,
  useGetArtifactPathForJenkins,
  useGetJobDetailsForJenkins,
  useGetBuildsForJenkins,
  BuildDetails
} from 'services/cd-ng'
import { getConnectorIdValue, getArtifactFormData } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ArtifactType,
  JenkinsArtifactProps,
  JenkinsArtifactType
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import css from '../../ArtifactConnector.module.scss'

function FormComponent({
  context,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  isReadonly = false,
  formik,
  isMultiArtifactSource,
  formClassName = ''
}: any): React.ReactElement {
  const { getString } = useStrings()
  const lastOpenedJob = useRef<any>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [jobDetails, setJobDetails] = useState<SelectWithSubmenuOption[]>([])
  const selectedJobName = useRef<string | null>(null)
  const [artifactPath, setFilePath] = useState<SelectOption[]>([])
  const [build, setJenkinsBuilds] = useState<SelectOption[]>([])
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefValue = getGenuineValue(prevStepData?.connectorId?.value || prevStepData?.identifier)
  const jobNameValue = formik.values?.spec?.jobName
  const artifactValue = getGenuineValue(formik.values?.spec?.artifactPath)
  const isTemplateContext = context === ModalViewFor.Template

  const {
    refetch: refetchJobs,
    data: jobsResponse,
    loading: fetchingJobs,
    error: fetchingJobsError
  } = useGetJobDetailsForJenkins({
    lazy: getMultiTypeFromValue(prevStepData?.connectorId) === MultiTypeInputType.RUNTIME,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString()
    }
  })

  const {
    refetch: refetchartifactPaths,
    data: artifactPathsResponse,
    loading: fetchingArtifacts,
    error: errorFetchingPath
  } = useGetArtifactPathForJenkins({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString()
    },
    jobName: encodeURIComponent(encodeURIComponent(jobNameValue?.label || ''))
  })

  const {
    refetch: refetchJenkinsBuild,
    data: jenkinsBuildResponse,
    loading: fetchingBuild,
    error: errorFetchingBuild
  } = useGetBuildsForJenkins({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString(),
      artifactPath: artifactValue || ''
    },
    jobName: encodeURIComponent(encodeURIComponent(jobNameValue?.label || ''))
  })

  useEffect(() => {
    if (artifactPathsResponse?.data) {
      const artifactPathResponseFormatted: MultiSelectOption[] = artifactPathsResponse?.data?.map(
        (artifactPathVal: string) => {
          return {
            label: artifactPathVal,
            value: artifactPathVal
          } as MultiSelectOption
        }
      )
      setFilePath(artifactPathResponseFormatted)
    }
  }, [artifactPathsResponse])

  useEffect(() => {
    if (jenkinsBuildResponse?.data) {
      const jenkinsBuildsResponseFormatted: MultiSelectOption[] = jenkinsBuildResponse?.data?.map(
        (jenkinsBuild: BuildDetails) => {
          return {
            label: jenkinsBuild.uiDisplayName,
            value: jenkinsBuild.number
          } as MultiSelectOption
        }
      )
      setJenkinsBuilds(jenkinsBuildsResponseFormatted)
    }
  }, [jenkinsBuildResponse])

  const getJobItems = (jobs: JobDetails[]): SelectWithSubmenuOption[] => {
    return jobs?.map(job => {
      return {
        label: job.jobName || '',
        value: job.url || '',
        submenuItems: [],
        hasSubmenuItems: job.folder
      }
    })
  }

  useEffect(() => {
    if (typeof formik.values?.spec?.jobName === 'string' && jobDetails?.length) {
      const targetJob = jobsResponse?.data?.jobDetails?.find(job => job.jobName === initialValues?.spec.jobName)
      if (targetJob) {
        const jobObj = {
          label: targetJob?.jobName || '',
          value: targetJob?.url || '',
          submenuItems: [],
          hasSubmenuItems: targetJob?.folder
        }
        formik.setValues({
          ...formik.values,
          spec: {
            ...formik.values.spec,
            jobName: jobObj as any
          }
        })
      } else {
        if (formik.values.spec.jobName?.split('/').length > 1) {
          const parentJobName = formik.values.spec.jobName?.split('/')[0]
          lastOpenedJob.current = parentJobName
          const parentJob = jobDetails?.find(job => job.label === parentJobName)
          if (parentJob?.submenuItems?.length) {
            const targetChildJob = parentJob.submenuItems?.find(job => job.label === formik.values?.spec?.jobName)
            formik.setValues({
              ...formik.values,
              spec: {
                ...formik.values.spec,
                jobName: targetChildJob as any
              }
            })
          } else {
            refetchJobs({
              queryParams: {
                ...commonParams,
                connectorRef: connectorRefValue?.toString(),
                parentJobName
              }
            })
          }
        }
      }
    }
  }, [jobDetails])

  useEffect(() => {
    if (lastOpenedJob.current) {
      setJobDetails((prevState: SelectWithSubmenuOption[]) => {
        const clonedJobDetails = cloneDeep(prevState)
        const parentJob = clonedJobDetails.find(obj => obj.value === lastOpenedJob.current)
        if (parentJob) {
          parentJob.submenuItems = [...getJobItems(jobsResponse?.data?.jobDetails || [])]
        }
        return clonedJobDetails
      })
    } else {
      const jobs = jobsResponse?.data?.jobDetails?.map(job => {
        return {
          label: job.jobName || '',
          value: job.url || '',
          submenuItems: [],
          hasSubmenuItems: job.folder
        }
      })
      if (!isEqual(jobs, jobDetails)) {
        setJobDetails(jobs || [])
      }
    }
  }, [jobsResponse])

  const artifactPathItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingArtifacts} />
  ))

  const buildItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingBuild} />
  ))

  const canFetchBuildsOrArtifacts =
    getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.RUNTIME ||
    getMultiTypeFromValue(jobNameValue) === MultiTypeInputType.RUNTIME ||
    !jobNameValue ||
    !connectorRefValue

  return (
    <FormikForm>
      <div className={cx(css.connectorForm, formClassName)}>
        {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.jenkinsFieldContainer}>
          <FormInput.SelectWithSubmenuTypeInput
            label={'Job Name'}
            name={'spec.jobName'}
            placeholder={
              connectorRefValue && getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED
                ? fetchingJobs
                  ? 'Fetching jobs...'
                  : fetchingJobsError?.message
                  ? fetchingJobsError?.message
                  : getString('select')
                : getString('select')
            }
            selectItems={jobDetails}
            selectWithSubmenuTypeInputProps={{
              expressions,
              width: 500,
              selectWithSubmenuProps: {
                items: jobDetails,
                allowCreatingNewItems: true,
                onChange: primaryValue => {
                  setJenkinsBuilds([])
                  selectedJobName.current =
                    getMultiTypeFromValue(primaryValue) === MultiTypeInputType.RUNTIME
                      ? (primaryValue as unknown as string)
                      : primaryValue.label
                },
                onSubmenuOpen: (item?: SelectWithSubmenuOption) => {
                  lastOpenedJob.current = item?.value
                  const parentJob = jobDetails?.find(job => job.label === item?.label)
                  if (!parentJob?.submenuItems?.length) {
                    return refetchJobs({
                      queryParams: {
                        ...commonParams,
                        connectorRef: connectorRefValue?.toString(),
                        parentJobName: item?.label
                      }
                    })
                  }
                  return Promise.resolve()
                }
              }
            }}
          />
          {getMultiTypeFromValue(formik.values.spec?.jobName) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formik.values?.spec?.jobName as string}
              style={{ marginTop: 22 }}
              type="String"
              variableName="spec.jobName"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.jobName', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTypeInput
            label={getString('pipeline.artifactPathLabel')}
            name="spec.artifactPath"
            useValue
            placeholder={fetchingArtifacts ? getString('loading') : getString('pipeline.selectArtifactPathPlaceholder')}
            multiTypeInputProps={{
              onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.artifactPath', type),
              width: 500,
              expressions,
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                  canFetchBuildsOrArtifacts
                ) {
                  return
                }
                refetchartifactPaths()
              },
              selectProps: {
                allowCreatingNewItems: true,
                addClearBtn: !isReadonly,
                items: defaultTo(artifactPath, []),
                noResults: (
                  <NoTagResults
                    tagError={errorFetchingPath}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={
                      fetchingArtifacts
                        ? getString('loading')
                        : canFetchBuildsOrArtifacts
                        ? `${getString('pipeline.artifactsSelection.validation.jobConnectorRequired')} artifactPath`
                        : getString('common.filters.noResultsFound')
                    }
                  />
                ),
                itemRenderer: artifactPathItemRenderer
              },
              allowableTypes
            }}
            selectItems={artifactPath || []}
          />
          {getMultiTypeFromValue(formik.values?.spec?.artifactPath) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                value={formik.values?.spec?.artifactPath}
                type="String"
                variableName="spec.artifactPath"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue('spec.artifactPath', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
        <div className={css.jenkinsFieldContainer}>
          <FormInput.MultiTypeInput
            label={getString('pipeline.jenkinsBuild')}
            name="spec.build"
            useValue
            placeholder={fetchingBuild ? getString('loading') : getString('pipeline.selectJenkinsBuildsPlaceholder')}
            multiTypeInputProps={{
              onTypeChange: (type: MultiTypeInputType) => formik.setFieldValue('spec.build', type),
              width: 500,
              expressions,
              selectProps: {
                allowCreatingNewItems: true,
                addClearBtn: !isReadonly,
                items: defaultTo(build, []),
                loadingItems: fetchingBuild,
                itemRenderer: buildItemRenderer,
                noResults: (
                  <NoTagResults
                    tagError={errorFetchingBuild}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={
                      fetchingBuild
                        ? getString('loading')
                        : canFetchBuildsOrArtifacts
                        ? `${getString('pipeline.artifactsSelection.validation.jobConnectorRequired')} build`
                        : getString('common.filters.noResultsFound')
                    }
                  />
                )
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                  canFetchBuildsOrArtifacts
                ) {
                  return
                }
                refetchJenkinsBuild()
              },
              allowableTypes
            }}
            selectItems={build || []}
          />
          {getMultiTypeFromValue(formik.values?.spec?.build) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                value={formik.values?.spec?.build}
                type="String"
                variableName="spec.build"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue('spec.build', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      </div>
      {!isTemplateContext && (
        <Layout.Horizontal spacing="medium">
          <Button
            variation={ButtonVariation.SECONDARY}
            text={getString('back')}
            icon="chevron-left"
            onClick={() => previousStep?.(prevStepData)}
          />
          <Button
            variation={ButtonVariation.PRIMARY}
            type="submit"
            text={getString('submit')}
            rightIcon="chevron-right"
          />
        </Layout.Horizontal>
      )}
    </FormikForm>
  )
}

export function JenkinsArtifact(props: StepProps<ConnectorConfigDTO> & JenkinsArtifactProps): React.ReactElement {
  const { getString } = useStrings()
  const { context, handleSubmit, initialValues, prevStepData, selectedArtifact, artifactIdentifiers } = props
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const isTemplateContext = context === ModalViewFor.Template

  const getInitialValues = (): JenkinsArtifactType => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as JenkinsArtifactType
  }

  const submitFormData = (formData: JenkinsArtifactType, connectorId?: string): void => {
    handleSubmit({
      identifier: formData.identifier,
      spec: {
        connectorRef: connectorId,
        artifactPath: formData.spec.artifactPath,
        build: formData.spec.build,
        jobName:
          getMultiTypeFromValue(formData.spec?.jobName) === MultiTypeInputType.FIXED
            ? (formData.spec?.jobName as SelectOption).label
            : formData.spec?.jobName
      }
    })
  }

  const handleValidate = (formData: JenkinsArtifactType) => {
    if (isTemplateContext) {
      submitFormData(
        {
          ...formData
        },
        getConnectorIdValue(prevStepData)
      )
    }
  }

  const schemaObject = {
    spec: Yup.object().shape({
      jobName: Yup.lazy(value =>
        typeof value === 'object'
          ? Yup.object().required(getString('pipeline.jenkinsStep.validations.jobName')) // typeError is necessary here, otherwise we get a bad-looking yup error
          : Yup.string().required(getString('pipeline.jenkinsStep.validations.jobName'))
      ),
      artifactPath: Yup.string(),
      build: Yup.string().required('Build is a required Field')
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const schemaWithIdentifier = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!isTemplateContext && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isIdentifierAllowed ? schemaWithIdentifier : primarySchema}
        validate={handleValidate}
        onSubmit={formData => {
          submitFormData(
            {
              ...formData
            },
            getConnectorIdValue(prevStepData)
          )
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
