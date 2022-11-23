/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { cloneDeep, defaultTo, get, isEqual } from 'lodash-es'

import {
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiSelectOption,
  MultiTypeInputType,
  SelectOption
} from '@harness/uicore'
import type { SubmenuSelectOption } from '@harness/uicore/dist/components/SelectWithSubmenu/SelectWithSubmenu'
import { PopoverInteractionKind } from '@blueprintjs/core'
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
  useGetBuildsForJenkinsServiceV2
} from 'services/cd-ng'

import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getImagePath,
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
    stepViewType
  } = props

  const { getString } = useStrings()
  const [lastOpenedJob, setLastOpenedJob] = useState<string | undefined>()
  const { expressions } = useVariablesExpression()
  const [jobDetails, setJobDetails] = useState<SubmenuSelectOption[]>([])
  const [artifactPaths, setArtifactPaths] = useState<SelectOption[]>([])
  const [build, setJenkinsBuilds] = useState<SelectOption[]>([])
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const serviceId = isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined

  const refetchingAllowedTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION] as MultiTypeInputType[]

  const [connectorRefValue, setConnectorRefValue] = React.useState(
    getFinalQueryParamValue(
      getDefaultQueryParam(
        artifact?.spec?.connectorRef,
        get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
      )
    )
  )

  const [jobNameValue, setJobNameValue] = React.useState(
    getFinalQueryParamValue(
      getDefaultQueryParam(artifact?.spec?.jobName, get(initialValues?.artifacts, `${artifactPath}.spec.jobName`, ''))
    )
  )

  const [artifactPathValue, setArtifactPathValue] = React.useState(
    getFinalQueryParamValue(
      getDefaultQueryParam(
        artifact?.spec?.artifactPath,
        get(initialValues?.artifacts, `${artifactPath}.spec.artifactPath`, '')
      )
    )
  )

  const getEncodedValue = (value: string): string => {
    return encodeURIComponent(value)
  }

  const {
    refetch: refetchJobs,
    data: jobsResponse,
    loading: fetchingJobs,
    error: fetchingJobsError
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
      parentJobName: lastOpenedJob,
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
        'artifactPath'
      )
    }
  })

  const {
    refetch: refetchJenkinsBuild,
    data: jenkinsBuildResponse,
    loading: fetchingBuild
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
        hasSubItems: job.folder
      }
    })
  }

  useEffect(() => {
    if (lastOpenedJob) {
      refetchJobs()
    }
  }, [lastOpenedJob])

  useEffect(() => {
    if (lastOpenedJob) {
      setJobDetails((prevState: SubmenuSelectOption[]) => {
        const clonedJobDetails = cloneDeep(prevState)
        const parentJob = clonedJobDetails.find(obj => obj.label === lastOpenedJob)
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
          hasSubItems: job.folder
        }
      })
      if (!isEqual(jobs, jobDetails)) {
        setJobDetails(jobs || [])
      }
    }
  }, [jobsResponse])

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
  const getJobDetailsValue = React.useCallback((): SubmenuSelectOption | undefined => {
    if (jobNameValue && getMultiTypeFromValue(jobNameValue) === MultiTypeInputType.FIXED) {
      if (jobNameValue && jobNameValue?.split('/')?.length > 1) {
        const parentJobName = jobNameValue?.split('/')[0]
        const parentJob = jobDetails?.find(job => job.label === parentJobName)
        if (parentJob?.submenuItems?.length) {
          const targetChildJob = parentJob.submenuItems?.find(job => job.label === jobNameValue)
          return targetChildJob as SubmenuSelectOption
        }
      }
      const existingJob = jobDetails.find(
        job => job.label === get(formik, `values.${path}.artifacts.${artifactPath}.spec.jobName`)
      ) as SubmenuSelectOption
      if (existingJob) return existingJob
      return {
        label: jobNameValue,
        value: jobNameValue
      } as SubmenuSelectOption
    }
  }, [jobNameValue])

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
                    setConnectorRefValue(record?.identifier)
                  } else {
                    setConnectorRefValue(value as string)
                  }
                } else {
                  setConnectorRefValue(undefined)
                }
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
            <FormInput.SelectWithSubmenuTypeInput
              label={'Job Name'}
              name={`${path}.artifacts.${artifactPath}.spec.jobName`}
              placeholder={
                connectorRefValue && getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED
                  ? fetchingJobs
                    ? 'Fetching jobs...'
                    : fetchingJobsError?.message
                    ? fetchingJobsError?.message
                    : getString('select')
                  : getString('select')
              }
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.jobName`)}
              value={getJobDetailsValue()}
              selectItems={jobDetails}
              selectWithSubmenuTypeInputProps={{
                allowableTypes,
                expressions,
                width: 400,
                selectWithSubmenuProps: {
                  loading: fetchingJobs,
                  items: jobDetails,
                  interactionKind: PopoverInteractionKind.CLICK,
                  allowCreatingNewItems: true,
                  addClearBtn: !readonly,
                  className: css.runtimeSelectWithSubmenu,
                  onChange: (primaryValue, secondaryValue) => {
                    const primaryJobName = typeof primaryValue === 'string' ? primaryValue : primaryValue?.label

                    const secondaryJobName =
                      (secondaryValue as any) === 'STRING'
                        ? undefined
                        : typeof secondaryValue === 'string'
                        ? secondaryValue
                        : secondaryValue?.label

                    formik.setFieldValue(
                      `${path}.artifacts.${artifactPath}.spec.jobName`,
                      secondaryJobName ? secondaryJobName : primaryJobName
                    )
                    if (secondaryJobName) {
                      setJobNameValue(secondaryJobName as string)
                    } else {
                      setJobNameValue(primaryJobName as string)
                    }

                    setArtifactPaths([])
                    setJenkinsBuilds([])
                  },
                  onOpening: (item: SelectOption) => {
                    setLastOpenedJob(item.label)
                    // TODO: To scroll the jobDetails component to its original height
                    // const indexOfParent = jobDetails.findIndex(obj => obj.value === item.value)
                    // const parentNode = document.getElementsByClassName('Select--menuItem')?.[indexOfParent]
                    // if (parentNode) {
                    //   parentJobY.current = parentNode.getBoundingClientRect()?.y
                    // }
                  }
                }
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.artifactPath`, template) && (
            <FormInput.MultiTypeInput
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
            <FormInput.MultiTypeInput
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
