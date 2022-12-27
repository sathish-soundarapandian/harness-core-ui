/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { FormikValues } from 'formik'
import { defaultTo, get, isEmpty, isNil, memoize } from 'lodash-es'
import { Menu } from '@blueprintjs/core'

import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'
import {
  BucketResponse,
  FilePaths,
  GetFilePathsV2ForS3QueryParams,
  SidecarArtifact,
  useGetFilePathsForS3,
  useGetFilePathsV2ForS3,
  useGetV2BucketListForS3,
  useListBucketsWithServiceV2
} from 'services/cd-ng'
import { useListAwsRegions } from 'services/portal'
import { useStrings } from 'framework/strings'
import { useMutateAsGet } from '@common/hooks'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { ConnectorReferenceDTO } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getFinalQueryParamValue,
  getFqnPath,
  getValidInitialValuePath,
  getYamlData,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity,
  shouldFetchTagsSource
} from '../artifactSourceUtils'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

export const resetFieldValue = (formik: FormikValues, fieldPath: string): void => {
  const fieldValue = get(formik?.values, fieldPath, '')
  if (getMultiTypeFromValue(fieldValue) === MultiTypeInputType.FIXED && fieldValue?.length) {
    formik.setFieldValue(fieldPath, '')
  }
}

const Content = (props: ArtifactSourceRenderProps): JSX.Element => {
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
    allowableTypes,
    fromTrigger,
    artifact,
    isSidecar,
    artifactPath,
    pipelineIdentifier,
    serviceIdentifier,
    stepViewType,
    artifacts,
    useArtifactV1Data = false
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { getRBACErrorMessage } = useRBACError()
  const { NG_SVC_ENV_REDESIGN } = useFeatureFlags()

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const fixedConnectorValue: string | undefined = defaultTo(
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`),
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef)
  )
  const fixedRegionValue: string | undefined = defaultTo(
    get(initialValues?.artifacts, `${artifactPath}.spec.region`),
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.region`, ''), artifact?.spec?.region)
  )
  const fixedBucketValue: string | undefined = defaultTo(
    get(initialValues?.artifacts, `${artifactPath}.spec.bucketName`),
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.bucketName`, ''), artifact?.spec?.bucketName)
  )
  const fixedFilePathRegexValue: string | undefined = defaultTo(
    get(initialValues?.artifacts, `${artifactPath}.spec.filePathRegex`),
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.filePathRegex`, ''), artifact?.spec?.filePathRegex)
  )

  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const [lastQueryData, setLastQueryData] = React.useState<{
    connectorRef?: string
    region?: string
    bucketName?: string
  }>({
    connectorRef: '',
    region: '',
    bucketName: ''
  })

  // Region related code
  const {
    data: regionData,
    loading: loadingRegions,
    error: errorRegions
  } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  React.useEffect(() => {
    const regionValues = (regionData?.resource || []).map(region => ({
      value: region.value,
      label: region.name
    }))

    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])

  // Bucket related code
  const bucketListAPIQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef: fixedConnectorValue,
    region: getFinalQueryParamValue(fixedRegionValue),
    pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
    serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
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
      'bucketName'
    )
  }

  // v1 tags api is required to fetch tags for artifact source template usage while linking to service
  // Here v2 api cannot be used to get the builds because of unavailability of complete yaml during creation.
  const {
    data: bucketV1Data,
    error: bucketV1Error,
    loading: bucketV1Loading,
    refetch: refetchV1Buckets
  } = useGetV2BucketListForS3({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      connectorRef: defaultTo(fixedConnectorValue, ''),
      region: getFinalQueryParamValue(fixedRegionValue)
    },
    lazy: true
  })

  const {
    data: bucketV2Data,
    error: bucketV2Error,
    loading: bucketV2Loading,
    refetch: refetchV2Buckets
  } = useMutateAsGet(useListBucketsWithServiceV2, {
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...bucketListAPIQueryParams
    },
    lazy: true,
    debounce: 300
  })

  const { bucketData, error, loading, refetchBuckets } = useArtifactV1Data
    ? {
        bucketData: bucketV1Data,
        error: bucketV1Error,
        loading: bucketV1Loading,
        refetchBuckets: refetchV1Buckets
      }
    : {
        bucketData: bucketV2Data,
        error: bucketV2Error,
        loading: bucketV2Loading,
        refetchBuckets: refetchV2Buckets
      }

  const selectItems = useMemo(() => {
    return defaultTo(
      bucketData?.data?.map((bucket: BucketResponse) => ({
        value: defaultTo(bucket.bucketName, ''),
        label: defaultTo(bucket.bucketName, '')
      })),
      []
    )
  }, [bucketData?.data])

  const getBuckets = React.useCallback((): { label: string; value: string }[] => {
    if (loading) {
      return [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
    }
    return defaultTo(selectItems, [])
  }, [loading, selectItems])

  const canFetchBuckets = React.useCallback((): boolean => {
    if (NG_SVC_ENV_REDESIGN) {
      let shouldFetchBuckets = false
      if (isFieldRuntime(`artifacts.${artifactPath}.spec.connectorRef`, template)) {
        shouldFetchBuckets = !!(
          lastQueryData.connectorRef !== fixedConnectorValue && shouldFetchTagsSource([fixedConnectorValue])
        )
      }
      if (!shouldFetchBuckets && isFieldRuntime(`artifacts.${artifactPath}.spec.region`, template)) {
        // Checking if fixedRegionValue is empty because region is not required to get buckets
        if (!isEmpty(fixedRegionValue)) {
          shouldFetchBuckets = !!(
            lastQueryData.region !== fixedRegionValue && shouldFetchTagsSource([fixedRegionValue])
          )
        }
      }
      return shouldFetchBuckets || isNil(bucketData?.data)
    } else {
      return !!(
        (lastQueryData.connectorRef != fixedConnectorValue || lastQueryData.region !== fixedRegionValue) &&
        shouldFetchTagsSource([fixedConnectorValue])
      )
    }
  }, [NG_SVC_ENV_REDESIGN, template, lastQueryData, fixedConnectorValue, fixedRegionValue, bucketData?.data])

  const fetchBuckets = React.useCallback((): void => {
    if (canFetchBuckets()) {
      setLastQueryData({
        connectorRef: fixedConnectorValue,
        region: fixedRegionValue,
        bucketName: lastQueryData.bucketName
      })
      refetchBuckets()
    }
  }, [canFetchBuckets, refetchBuckets, fixedConnectorValue, fixedRegionValue, lastQueryData])

  // File Path related code
  const filePathListAPIQueryParams: GetFilePathsV2ForS3QueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef: fixedConnectorValue,
    region: getFinalQueryParamValue(fixedRegionValue),
    bucketName: fixedBucketValue,
    filePathRegex: '*',
    pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
    serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
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
      'filePath'
    )
  }

  // v1 tags api is required to fetch tags for artifact source template usage while linking to service
  // Here v2 api cannot be used to get the builds because of unavailability of complete yaml during creation.
  const {
    data: filePathV1Data,
    error: filePathV1Error,
    loading: fetchingV1FilePaths,
    refetch: refetchV1FilePaths
  } = useGetFilePathsForS3({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      connectorRef: defaultTo(fixedConnectorValue, ''),
      region: getFinalQueryParamValue(fixedRegionValue),
      bucketName: defaultTo(fixedBucketValue, ''),
      filePathRegex: '*'
    },
    lazy: true
  })

  const {
    data: filePathV2Data,
    error: filePathV2Error,
    loading: fetchingV2FilePaths,
    refetch: refetchV2FilePaths
  } = useMutateAsGet(useGetFilePathsV2ForS3, {
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...filePathListAPIQueryParams
    },
    lazy: true,
    debounce: 300
  })

  const { filePathData, filePathError, fetchingFilePaths, refetchFilePaths } = useArtifactV1Data
    ? {
        filePathData: filePathV1Data,
        filePathError: filePathV1Error,
        fetchingFilePaths: fetchingV1FilePaths,
        refetchFilePaths: refetchV1FilePaths
      }
    : {
        filePathData: filePathV2Data,
        filePathError: filePathV2Error,
        fetchingFilePaths: fetchingV2FilePaths,
        refetchFilePaths: refetchV2FilePaths
      }

  const filePathSelectItems = useMemo(() => {
    return defaultTo(
      filePathData?.data?.map((currFilePath: FilePaths) => ({
        value: defaultTo(currFilePath.buildDetails?.number, ''),
        label: defaultTo(currFilePath.buildDetails?.number, '')
      })),
      []
    )
  }, [filePathData?.data])

  const getFilePaths = React.useCallback((): { label: string; value: string }[] => {
    if (fetchingFilePaths) {
      const loadingFilePathOptionsText = getString('common.loadingFieldOptions', {
        fieldName: getString('common.git.filePath')
      })
      return [{ label: loadingFilePathOptionsText, value: loadingFilePathOptionsText }]
    }
    return defaultTo(filePathSelectItems, [])
  }, [fetchingFilePaths, filePathSelectItems])

  const canFetchFilePaths = React.useCallback((): boolean => {
    if (NG_SVC_ENV_REDESIGN) {
      let shouldFetchFilePaths = false
      if (isFieldRuntime(`artifacts.${artifactPath}.spec.connectorRef`, template)) {
        shouldFetchFilePaths = !!(
          lastQueryData.connectorRef !== fixedConnectorValue && shouldFetchTagsSource([fixedConnectorValue])
        )
      }
      if (!shouldFetchFilePaths && isFieldRuntime(`artifacts.${artifactPath}.spec.region`, template)) {
        // Checking if fixedRegionValue is empty because region is not required to get buckets
        if (!isEmpty(fixedRegionValue)) {
          shouldFetchFilePaths = !!(
            lastQueryData.region !== fixedRegionValue && shouldFetchTagsSource([fixedRegionValue])
          )
        }
      }
      if (isFieldRuntime(`artifacts.${artifactPath}.spec.bucketName`, template)) {
        shouldFetchFilePaths = !!(
          lastQueryData.bucketName !== fixedBucketValue && shouldFetchTagsSource([fixedBucketValue])
        )
      }
      return shouldFetchFilePaths || isNil(filePathData?.data)
    } else {
      return !!(
        (lastQueryData.connectorRef != fixedConnectorValue ||
          lastQueryData.region !== fixedRegionValue ||
          lastQueryData.bucketName !== fixedBucketValue) &&
        shouldFetchTagsSource([fixedConnectorValue, fixedBucketValue])
      )
    }
  }, [
    NG_SVC_ENV_REDESIGN,
    template,
    lastQueryData,
    fixedConnectorValue,
    fixedRegionValue,
    fixedBucketValue,
    filePathData?.data
  ])

  const fetchFilePaths = React.useCallback((): void => {
    if (canFetchFilePaths()) {
      setLastQueryData({
        connectorRef: fixedConnectorValue,
        region: fixedRegionValue,
        bucketName: fixedBucketValue
      })
      refetchFilePaths()
    }
  }, [canFetchFilePaths, refetchFilePaths, fixedConnectorValue, fixedRegionValue, fixedBucketValue])

  const isFieldDisabled = (fieldName: string, isBucket = false, isFilePath = false): boolean => {
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

    if (isBucket) {
      return (
        getMultiTypeFromValue(fixedConnectorValue) === MultiTypeInputType.RUNTIME || fixedConnectorValue?.length === 0
      )
    }
    if (isFilePath) {
      return (
        getMultiTypeFromValue(fixedConnectorValue) === MultiTypeInputType.RUNTIME ||
        fixedConnectorValue?.length === 0 ||
        getMultiTypeFromValue(fixedBucketValue) === MultiTypeInputType.RUNTIME ||
        fixedBucketValue?.length === 0
      )
    }

    return false
  }

  const isRuntime = isPrimaryArtifactsRuntime || isSidecarRuntime
  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={loading || fetchingFilePaths}
        onClick={handleClick}
      />
    </div>
  ))

  const getBucketNameHelperText = () => {
    if (
      getMultiTypeFromValue(get(formik?.values, `${path}.artifacts.${artifactPath}.spec.bucketName`)) ===
        MultiTypeInputType.FIXED &&
      (getMultiTypeFromValue(fixedConnectorValue) === MultiTypeInputType.RUNTIME || fixedConnectorValue?.length === 0)
    ) {
      return getString('pipeline.bucketNameHelperText')
    }
  }

  const getFilePathHelperText = () => {
    if (
      (getMultiTypeFromValue(get(formik?.values, `${path}.artifacts.${artifactPath}.spec.filePath`)) ===
        MultiTypeInputType.FIXED &&
        (getMultiTypeFromValue(fixedConnectorValue) === MultiTypeInputType.RUNTIME ||
          fixedConnectorValue?.length === 0)) ||
      getMultiTypeFromValue(fixedBucketValue) === MultiTypeInputType.RUNTIME ||
      fixedBucketValue?.length === 0
    ) {
      return getString('pipeline.filePathHelperText')
    }
  }

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
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
                expressions
              }}
              onChange={(selected, _typeValue) => {
                const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                const connectorRefValue =
                  item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                    ? `${item.scope}.${item?.record?.identifier}`
                    : item.record?.identifier

                if (connectorRefValue !== fixedConnectorValue) {
                  resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.bucketName`)
                  resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.filePath`)
                }
              }}
              className={css.connectorMargin}
              type={ArtifactToConnectorMap[defaultTo(artifact?.type, '')]}
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
              templateProps={{
                isTemplatizedView: true,
                templateValue: get(template, `artifacts.${artifactPath}.spec.connectorRef`)
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.region`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.region`}
              template={template}
              name={`${path}.artifacts.${artifactPath}.spec.region`}
              selectItems={regions}
              useValue
              disabled={!fromTrigger && isFieldDisabled(`artifacts.${artifactPath}.spec.region`)}
              multiTypeInputProps={{
                onChange: selected => {
                  if (fixedRegionValue !== (selected as any).value) {
                    resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.bucketName`)
                    resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.filePath`)
                  }
                },
                selectProps: {
                  items: regions,
                  noResults: (
                    <Text lineClamp={1} width={500} height={100}>
                      {getRBACErrorMessage(errorRegions as RBACError) || getString('pipeline.noRegions')}
                    </Text>
                  )
                }
              }}
              label={getString('optionalField', { name: getString('regionLabel') })}
              placeholder={loadingRegions ? getString('loading') : getString('select')}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.bucketName`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.bucketName`}
              template={template}
              selectItems={getBuckets()}
              label={getString('pipeline.manifestType.bucketName')}
              placeholder={loading ? getString('loading') : getString('pipeline.manifestType.bucketPlaceHolder')}
              name={`${path}.artifacts.${artifactPath}.spec.bucketName`}
              disabled={!fromTrigger && isFieldDisabled(`artifacts.${artifactPath}.spec.bucketName`, true, false)}
              helperText={getBucketNameHelperText()}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                onChange: selected => {
                  if (fixedBucketValue !== (selected as any).value) {
                    resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.filePath`)
                  }
                },
                selectProps: {
                  noResults: (
                    <Text lineClamp={1} width={500} padding="small">
                      {getRBACErrorMessage(error as RBACError) || getString('pipeline.noBucketsFound')}
                    </Text>
                  ),
                  itemRenderer: itemRenderer,
                  items: getBuckets(),
                  allowCreatingNewItems: true,
                  addClearBtn: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  if (!loading) {
                    fetchBuckets()
                  }
                }
              }}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.filePath`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.filePath`}
              template={template}
              selectItems={getFilePaths()}
              label={getString('common.git.filePath')}
              placeholder={loading ? getString('loading') : getString('pipeline.manifestType.pathPlaceholder')}
              name={`${path}.artifacts.${artifactPath}.spec.filePath`}
              disabled={!fromTrigger && isFieldDisabled(`artifacts.${artifactPath}.spec.filePath`, false, true)}
              helperText={getFilePathHelperText()}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <Text lineClamp={1} width={500} padding="small">
                      {getRBACErrorMessage(filePathError as RBACError) || getString('pipeline.noFilePathsFound')}
                    </Text>
                  ),
                  itemRenderer: itemRenderer,
                  items: getFilePaths(),
                  allowCreatingNewItems: true,
                  addClearBtn: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  if (!fetchingFilePaths) {
                    fetchFilePaths()
                  }
                }
              }}
            />
          )}

          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.filePathRegex`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.filePathRegex`}
              template={template}
              label={getString('pipeline.artifactsSelection.filePathRegexLabel')}
              name={`${path}.artifacts.${artifactPath}.spec.filePathRegex`}
              placeholder={getString('pipeline.artifactsSelection.filePathRegexPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.filePathRegex`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          )}

          {!!fromTrigger && !isFieldRuntime(`artifacts.${artifactPath}.spec.filePathRegex`, template) && (
            <FormInput.MultiTextInput
              label={getString('pipeline.artifactsSelection.filePathRegexLabel')}
              multiTextInputProps={{
                expressions,
                value: fixedFilePathRegexValue,
                allowableTypes
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.filePathRegex`}
            />
          )}

          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.filePathRegex`, template) && (
            <FormInput.MultiTextInput
              label={getString('pipeline.artifactsSelection.filePathRegexLabel')}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              name={`${path}.artifacts.${artifactPath}.spec.filePathRegex`}
            />
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class AmazonS3ArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.AmazonS3
  protected isSidecar = false

  // NOTE: This is not used anywhere currently, this written because it is abstract method in ArtifactSourceBase class
  // ArtifactSourceBase should extended here, otherwise AmazonS3ArtifactSource class instance can not be registered
  // in src/modules/75-cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory.tsx file
  isTagsSelectionDisabled(_props: ArtifactSourceRenderProps): boolean {
    return false
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} />
  }
}
