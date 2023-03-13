/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useRef } from 'react'
import { cloneDeep, defaultTo, get, isEqual, memoize } from 'lodash-es'

import {
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiSelectOption,
  MultiTypeInputType,
  SelectOption
} from '@harness/uicore'
import type { SubmenuSelectOption } from '@harness/uicore/dist/components/SelectWithSubmenu/SelectWithSubmenuV2'
import type { IconName } from '@blueprintjs/core'
import type { SelectWithBiLevelOption } from '@harness/uicore/dist/components/Select/BiLevelSelect'
import type { IItemRendererProps } from '@blueprintjs/select'
import { useMutateAsGet } from '@common/hooks'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  BuildDetails,
  JobDetails,
  SidecarArtifact,
  useGetJobDetailsForJenkinsServiceV2,
  useGetArtifactPathForJenkinsServiceV2,
  useGetBuildsForJenkinsServiceV2,
  useGetJobDetailsForJenkins,
  useGetBuildsForJenkins
} from 'services/cd-ng'

import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { ConnectorRefType, getScopedConnectorValue } from '@pipeline/utils/stepUtils'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getImagePath,
  getValidInitialValuePath,
  getYamlData,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity
} from '../artifactSourceUtils'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface JenkinsRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}
const Content = (props: JenkinsRenderContent): React.ReactElement => {
  const {
    isPrimaryArtifactsRuntime,
    isSidecarRuntime,
    template,
    formik,
    path,
    initialValues,
    accountId,
    projectIdentifier,
    orgIdentifier,
    readonly,
    repoIdentifier,
    branch,
    stageIdentifier,
    isTagsSelectionDisabled,
    allowableTypes,
    fromTrigger,
    artifact,
    isSidecar,
    artifactPath,
    serviceIdentifier,
    stepViewType,
    artifacts,
    pipelineIdentifier,
    useArtifactV1Data = false
  } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [jobDetails, setJobDetails] = useState<SubmenuSelectOption[]>([])
  const [showChildJobField, setShowChildJobField] = useState<boolean>(false)
  const [lastOpenedJob, setLastOpenedJob] = useState<string | undefined>()
  const recentParentJob = useRef<any>(null)
  const [childJob, setChildJob] = useState<SelectWithBiLevelOption>({} as SelectWithBiLevelOption)
  const [artifactPaths, setArtifactPaths] = useState<SelectOption[]>([])
  const [build, setJenkinsBuilds] = useState<SelectOption[]>([])
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch,
    pipelineIdentifier
  }

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const serviceId = isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined

  const refetchingAllowedTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION] as MultiTypeInputType[]

  const [connectorRefValue, setConnectorRefValue] = React.useState(
    getFinalQueryParamValue(
      getDefaultQueryParam(
        getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
        get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
      )
    )
  )

  const [jobNameValue, setJobNameValue] = React.useState(
    getFinalQueryParamValue(
      getDefaultQueryParam(
        getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.jobName`, ''), artifact?.spec?.jobName),
        get(initialValues?.artifacts, `${artifactPath}.spec.jobName`, '')
      )
    )
  )

  const [artifactPathValue, setArtifactPathValue] = React.useState(
    getFinalQueryParamValue(
      getDefaultQueryParam(
        getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.artifactPath`, ''), artifact?.spec?.artifactPath),
        get(initialValues?.artifacts, `${artifactPath}.spec.artifactPath`, '')
      )
    )
  )

  const getEncodedValue = (value: string): string => {
    return encodeURIComponent(value)
  }

  // v1 tags api is required to fetch tags for artifact source template usage while linking to service
  // Here v2 api cannot be used to get the builds because of unavailability of complete yaml during creation.
  const {
    refetch: refetchV1Jobs,
    data: jobsV1Response,
    loading: fetchingV1Jobs,
    error: fetchingV1JobsError
  } = useGetJobDetailsForJenkins({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString()
    }
  })

  const {
    refetch: refetchV2Jobs,
    data: jobsV2Response,
    loading: fetchingV2Jobs,
    error: fetchingV2JobsError
  } = useMutateAsGet(useGetJobDetailsForJenkinsServiceV2, {
    lazy: true,
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString(),
      serviceId,
      parentJobName: recentParentJob?.current,
      fqnPath: getFqnPath(
        path as string,
        !!isPropagatedStage,
        stageIdentifier,
        defaultTo(
          isSidecar
            ? artifactPath?.split('[')[0].concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
            : artifactPath,
          ''
        ),
        'jobName'
      )
    }
  })

  const { refetchJobs, jobsResponse, fetchingJobs, fetchingJobsError } = useArtifactV1Data
    ? {
        refetchJobs: refetchV1Jobs,
        jobsResponse: jobsV1Response,
        fetchingJobs: fetchingV1Jobs,
        fetchingJobsError: fetchingV1JobsError
      }
    : {
        refetchJobs: refetchV2Jobs,
        jobsResponse: jobsV2Response,
        fetchingJobs: fetchingV2Jobs,
        fetchingJobsError: fetchingV2JobsError
      }

  const {
    refetch: refetchArtifactPaths,
    data: artifactPathsResponse,
    loading: fetchingArtifacts
  } = useMutateAsGet(useGetArtifactPathForJenkinsServiceV2, {
    lazy: true,
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString(),
      jobName: jobNameValue,
      serviceId,
      fqnPath: getFqnPath(
        path as string,
        !!isPropagatedStage,
        stageIdentifier,
        defaultTo(
          isSidecar
            ? artifactPath?.split('[')[0].concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
            : artifactPath,
          ''
        ),
        'artifactPath'
      )
    }
  })

  const {
    refetch: refetchJenkinsBuildV1,
    data: jenkinsBuildResponseV1,
    loading: fetchingBuildV1
  } = useGetBuildsForJenkins({
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString(),
      artifactPath: artifactPathValue
    },
    jobName: jobNameValue ? getEncodedValue(jobNameValue) : ''
  })

  const {
    refetch: refetchJenkinsBuildV2,
    data: jenkinsBuildResponseV2,
    loading: fetchingBuildV2
  } = useMutateAsGet(useGetBuildsForJenkinsServiceV2, {
    lazy: true,
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue?.toString(),
      artifactPath: artifactPathValue,
      jobName: jobNameValue ? getEncodedValue(jobNameValue) : undefined,
      serviceId,
      fqnPath: getFqnPath(
        path as string,
        !!isPropagatedStage,
        stageIdentifier,
        defaultTo(
          isSidecar
            ? artifactPath?.split('[')[0].concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
            : artifactPath,
          ''
        ),
        'build'
      )
    }
  })

  const { refetchJenkinsBuild, jenkinsBuildResponse, fetchingBuild } = useArtifactV1Data
    ? {
        refetchJenkinsBuild: refetchJenkinsBuildV1,
        jenkinsBuildResponse: jenkinsBuildResponseV1,
        fetchingBuild: fetchingBuildV1
      }
    : {
        refetchJenkinsBuild: refetchJenkinsBuildV2,
        jenkinsBuildResponse: jenkinsBuildResponseV2,
        fetchingBuild: fetchingBuildV2
      }

  useEffect(() => {
    if (refetchingAllowedTypes?.includes(getMultiTypeFromValue(connectorRefValue))) {
      refetchJobs()
    }
  }, [connectorRefValue])

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
      setArtifactPaths(artifactPathResponseFormatted)
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

  const getJobItems = (jobs: JobDetails[]): SubmenuSelectOption[] => {
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
    if (lastOpenedJob) {
      refetchJobs()
    }
  }, [lastOpenedJob])

  useEffect(() => {
    if (lastOpenedJob || recentParentJob?.current) {
      setJobDetails((prevState: SubmenuSelectOption[]) => {
        const clonedJobDetails = cloneDeep(prevState)
        const probableParentName = jobsResponse?.data?.jobDetails?.[0]?.jobName?.split('/')?.[0]
        const parentJob = clonedJobDetails.find(obj => obj.label === probableParentName)
        if (parentJob) {
          parentJob.submenuItems = [...getJobItems(jobsResponse?.data?.jobDetails || [])]
        }
        setLastOpenedJob(undefined)
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

  useEffect(() => {
    const jobName =
      get(formik, `values.${path}.artifacts.${artifactPath}.spec.jobName.label`) ||
      get(formik, `values.${path}.artifacts.${artifactPath}.spec.jobName`)
    if (jobName?.split('/').length > 1 && jobDetails.length) {
      setShowChildJobField(true)
      const parentJobName = jobName?.split('/')[0]
      recentParentJob.current = parentJobName
      setLastOpenedJob(parentJobName)
      const parentJob = jobDetails?.find(job => job.label === parentJobName)
      if (!parentJob?.submenuItems?.length) {
        refetchJobs()
      } else {
        const targetChildJob = parentJob.submenuItems?.find(job => job.label === jobName)
        setChildJob(targetChildJob as SelectWithBiLevelOption)
      }
    }
  }, [jobDetails])

  const isFieldDisabled = (fieldName: string, isTag = false): boolean => {
    /* instanbul ignore else */
    if (
      readonly ||
      isFieldfromTriggerTabDisabled(
        fieldName,
        formik,
        stageIdentifier,
        fromTrigger,
        isSidecar ? (artifact as SidecarArtifact)?.identifier : undefined
      )
    ) {
      return true
    }
    if (isTag) {
      return isTagsSelectionDisabled(props)
    }
    return false
  }
  const isRuntime = isPrimaryArtifactsRuntime || isSidecarRuntime

  const childJobDetails = () => {
    if (showChildJobField && recentParentJob?.current) {
      const childJobs: SelectWithBiLevelOption[] =
        jobDetails.find(item => item.label === recentParentJob?.current)?.submenuItems || []
      return childJobs
    }
    return []
  }

  const getJobnameValue = () => {
    const jobName = get(formik, `values.${path}.artifacts.${artifactPath}.spec.jobName`)
    if (getMultiTypeFromValue(jobName) !== MultiTypeInputType.FIXED) return jobName
    if (showChildJobField) {
      const parentJob = jobDetails.find(job => job.label === recentParentJob?.current)
      if (parentJob) return parentJob
    }
    const jobDetail = jobDetails.find(job => job.label === jobName)
    if (jobDetail) return jobDetail
    return {
      label: jobName,
      value: jobName,
      submenuItems: [],
      hasSubmenuItems: false
    } as SelectWithBiLevelOption
  }

  const jobNameRenderer = memoize((item: SelectWithBiLevelOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem
      item={item}
      itemProps={itemProps}
      disabled={fetchingJobs}
      icon={item?.hasSubmenuItems ? 'folder-open' : ('file' as IconName)}
    />
  ))

  return (
    <>
      {isRuntime && (
        <Layout.Vertical key={artifactPath} className={css.inputWidth}>
          {isFieldRuntime(`artifacts.${artifactPath}.spec.connectorRef`, template) && (
            <FormMultiTypeConnectorField
              name={`${path}.artifacts.${artifactPath}.spec.connectorRef`}
              label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
              selected={get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')}
              placeholder={''}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              configureOptionsProps={{ className: css.connectorConfigOptions }}
              orgIdentifier={orgIdentifier}
              width={391}
              setRefValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.connectorRef`)}
              multiTypeProps={{
                allowableTypes,
                expressions
              }}
              onChange={value => {
                if (value) {
                  const { record } = value as unknown as { record: ConnectorReferenceDTO }
                  if (record) {
                    const connectorValue = getScopedConnectorValue(value as unknown as ConnectorRefType)
                    setConnectorRefValue(connectorValue)
                  } else {
                    setConnectorRefValue(value as string)
                  }
                } else {
                  setConnectorRefValue(undefined)
                }
                formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.jobName`, '')
                setLastOpenedJob(undefined)
                recentParentJob.current = undefined
                setShowChildJobField(false)
                setChildJob({} as SelectWithBiLevelOption)
                setJobDetails([])
                setArtifactPaths([])
                setJenkinsBuilds([])
              }}
              className={css.connectorMargin}
              type={ArtifactToConnectorMap[defaultTo(artifact?.type, '')]}
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.jobName`, template) && (
            <>
              <FormInput.MultiTypeBiLevelInput
                label={getString('connectors.jenkins.jobNameLabel')}
                name={`${path}.artifacts.${artifactPath}.spec.jobName`}
                value={getJobnameValue()}
                placeholder={
                  connectorRefValue && getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED
                    ? fetchingJobs
                      ? getString('common.loadingFieldOptions', { fieldName: getString('pipeline.jenkinsStep.job') })
                      : fetchingJobsError?.message
                      ? fetchingJobsError?.message
                      : getString('select')
                    : getString('select')
                }
                multiTypeInputProps={{
                  width: 400,
                  onChange: (primaryValue: any) => {
                    if (primaryValue?.hasSubmenuItems) {
                      setShowChildJobField(true)
                      setLastOpenedJob(primaryValue?.label)
                      recentParentJob.current = primaryValue?.label
                      const parentJob = jobDetails?.find(job => job.label === primaryValue?.label)
                      if (!parentJob?.submenuItems?.length) {
                        refetchJobs()
                      }
                    } else {
                      setArtifactPaths([])
                      setJenkinsBuilds([])
                      setShowChildJobField(false)
                    }
                    setJobNameValue(typeof primaryValue === 'string' ? primaryValue : primaryValue?.label)
                    setChildJob({} as SelectWithBiLevelOption)
                    formik.setFieldValue(
                      `${path}.artifacts.${artifactPath}.spec.jobName`,
                      getMultiTypeFromValue(primaryValue) === MultiTypeInputType.FIXED
                        ? primaryValue.label
                        : primaryValue
                    )
                  },

                  onTypeChange: (type: MultiTypeInputType) =>
                    formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.jobName`, type),
                  expressions,
                  selectProps: {
                    allowCreatingNewItems: true,
                    items: jobDetails,
                    addClearBtn: true,
                    itemRenderer: jobNameRenderer
                  },
                  allowableTypes
                }}
                selectItems={jobDetails || []}
              />
              {showChildJobField && (
                <FormInput.MultiTypeBiLevelInput
                  label={`${recentParentJob?.current || getString('connectors.jenkins.child')} ${getString(
                    'connectors.jenkins.jobs'
                  )}`}
                  name={`${path}.artifacts.${artifactPath}.spec.jobName`}
                  value={childJob}
                  placeholder={
                    connectorRefValue && getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED
                      ? fetchingJobs
                        ? getString('common.loadingFieldOptions', { fieldName: getString('pipeline.jenkinsStep.job') })
                        : fetchingJobsError?.message
                        ? fetchingJobsError?.message
                        : getString('select')
                      : getString('select')
                  }
                  multiTypeInputProps={{
                    width: 400,
                    onChange: (primaryValue: any) => {
                      if (primaryValue?.hasSubmenuItems) {
                        setLastOpenedJob(primaryValue?.label)
                        recentParentJob.current = primaryValue?.label
                        const parentJob = jobDetails?.find(job => job.label === primaryValue?.label)
                        if (!parentJob?.submenuItems?.length) {
                          refetchJobs()
                        }
                      } else {
                        setArtifactPaths([])
                        setJenkinsBuilds([])
                      }
                      setChildJob(primaryValue)
                      formik.setFieldValue(
                        `${path}.artifacts.${artifactPath}.spec.jobName`,
                        getMultiTypeFromValue(primaryValue) === MultiTypeInputType.FIXED
                          ? primaryValue.label
                          : primaryValue
                      )
                    },
                    onTypeChange: (type: MultiTypeInputType) =>
                      formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.jobName`, type),
                    expressions,
                    selectProps: {
                      allowCreatingNewItems: false,
                      items: childJobDetails(),
                      addClearBtn: false,
                      itemRenderer: jobNameRenderer
                    },
                    allowableTypes
                  }}
                  selectItems={childJobDetails() || []}
                />
              )}
            </>
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.artifactPath`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.artifactPath`}
              template={template}
              label={getString('pipeline.artifactPathLabel')}
              name={`${path}.artifacts.${artifactPath}.spec.artifactPath`}
              useValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.artifactPath`)}
              placeholder={
                fetchingArtifacts ? getString('loading') : getString('pipeline.selectArtifactPathPlaceholder')
              }
              multiTypeInputProps={{
                onTypeChange: (type: MultiTypeInputType) =>
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.artifactPath`, type),
                width: 400,
                expressions,
                allowableTypes,
                onChange: (newFilePath: any) => {
                  const artifacthPath = typeof newFilePath === 'string' ? newFilePath : newFilePath?.value
                  setArtifactPathValue(artifacthPath)
                  setJenkinsBuilds([])
                },
                onClick: () => {
                  if (
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(jobNameValue, allowableTypes)) &&
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(connectorRefValue, allowableTypes))
                  ) {
                    refetchArtifactPaths()
                  }
                },
                selectProps: {
                  allowCreatingNewItems: true,
                  addClearBtn: !readonly,
                  items: defaultTo(artifactPaths, [])
                }
              }}
              selectItems={artifactPaths || []}
            />
          )}
          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.build`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.build`}
              template={template}
              label={getString('pipeline.jenkinsBuild')}
              name={`${path}.artifacts.${artifactPath}.spec.build`}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.build`)}
              useValue
              placeholder={fetchingBuild ? getString('loading') : getString('pipeline.selectJenkinsBuildsPlaceholder')}
              multiTypeInputProps={{
                onClick: () => {
                  if (
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(connectorRefValue, allowableTypes)) &&
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(jobNameValue, allowableTypes)) &&
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(artifactPathValue, allowableTypes))
                  ) {
                    refetchJenkinsBuild()
                  }
                },
                onTypeChange: (type: MultiTypeInputType) =>
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.build`, type),
                width: 400,
                expressions,
                allowableTypes,
                selectProps: {
                  allowCreatingNewItems: true,
                  addClearBtn: !readonly,
                  items: defaultTo(build, [])
                }
              }}
              selectItems={build || []}
            />
          )}

          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.build`, template) && (
            <FormInput.MultiTextInput
              label={getString('pipeline.jenkinsBuild')}
              multiTextInputProps={{
                expressions,
                value: TriggerDefaultFieldList.build,
                allowableTypes,
                onClick: () => {
                  if (
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(connectorRefValue, allowableTypes)) &&
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(jobNameValue, allowableTypes)) &&
                    refetchingAllowedTypes?.includes(getMultiTypeFromValue(artifactPathValue, allowableTypes))
                  ) {
                    refetchJenkinsBuild()
                  }
                }
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.build`}
            />
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class JenkinsArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.Jenkins
  protected isSidecar = false

  isTagsSelectionDisabled(props: ArtifactSourceRenderProps): boolean {
    const { initialValues, artifactPath, artifact } = props

    const isImagePathPresent = getImagePath(
      artifact?.spec?.imagePath,
      get(initialValues, `artifacts.${artifactPath}.spec.imagePath`, '')
    )
    const isConnectorPresent = getDefaultQueryParam(
      artifact?.spec?.connectorRef,
      get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')
    )

    return !(isImagePathPresent && isConnectorPresent)
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
