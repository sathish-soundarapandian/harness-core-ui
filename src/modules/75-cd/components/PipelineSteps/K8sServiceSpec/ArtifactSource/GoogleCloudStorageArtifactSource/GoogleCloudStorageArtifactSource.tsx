/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { defaultTo, get, isNil } from 'lodash-es'
import type { IItemRendererProps } from '@blueprintjs/select'
import { getMultiTypeFromValue, Layout, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'

import { SidecarArtifact, useGetProjects, useGetGcsBuckets, GetGcsBucketsQueryParams } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useMutateAsGet } from '@common/hooks'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { isValueRuntimeInput } from '@common/utils/utils'
import type { ConnectorReferenceDTO } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { resetFieldValue } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { isFixedNonEmptyValue } from '@pipeline/utils/stageHelpers'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import {
  getFinalQueryParamValue,
  getFqnPath,
  getValidInitialValuePath,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity,
  shouldFetchTagsSource
} from '../artifactSourceUtils'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

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
    serviceIdentifier,
    artifacts
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
  const fixedProjectValue: string | undefined = defaultTo(
    get(initialValues?.artifacts, `${artifactPath}.spec.project`),
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.project`, ''), artifact?.spec?.project)
  )

  const [lastProjectsQueryData, setLastProjectsQueryData] = React.useState({
    connectorRef: ''
  })
  const [lastBucketsQueryData, setLastBucketsQueryData] = React.useState({
    connectorRef: '',
    project: ''
  })

  // Project
  const {
    data: projectsData,
    loading: loadingProjects,
    error: fetchProjectsError,
    refetch: refetchProjects
  } = useMutateAsGet(useGetProjects, {
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      connectorRef: getFinalQueryParamValue(fixedConnectorValue),
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
        'project'
      )
    },
    lazy: true
  })

  const projectOptions: SelectOption[] = React.useMemo(() => {
    if (loadingProjects) {
      return [{ label: getString('loading'), value: getString('loading') }]
    } else if (fetchProjectsError) {
      return []
    }
    return defaultTo(projectsData?.data?.projects, []).map(project => ({
      value: project.id as string,
      label: project.name as string
    }))
  }, [projectsData?.data, loadingProjects, fetchProjectsError])

  const canFetchProjects = React.useCallback((): boolean => {
    if (NG_SVC_ENV_REDESIGN) {
      let shouldFetchProjects = false
      if (isValueRuntimeInput(get(template, `artifacts.${artifactPath}.spec.connectorRef`))) {
        shouldFetchProjects = !!(
          lastProjectsQueryData.connectorRef !== fixedConnectorValue &&
          isFixedNonEmptyValue(defaultTo(fixedConnectorValue, ''))
        )
      }
      return shouldFetchProjects || isNil(projectsData?.data)
    } else {
      return !!(
        lastProjectsQueryData.connectorRef != fixedConnectorValue &&
        isFixedNonEmptyValue(defaultTo(fixedConnectorValue, ''))
      )
    }
  }, [NG_SVC_ENV_REDESIGN, template, lastProjectsQueryData, fixedConnectorValue, projectsData?.data, artifactPath])

  const fetchProjects = React.useCallback((): void => {
    if (canFetchProjects()) {
      setLastProjectsQueryData({
        connectorRef: defaultTo(fixedConnectorValue, '')
      })
      refetchProjects()
    }
  }, [canFetchProjects, refetchProjects, fixedConnectorValue])

  // Bucket related code
  const bucketsAPIQueryParams: GetGcsBucketsQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef: getFinalQueryParamValue(fixedConnectorValue),
    project: getFinalQueryParamValue(fixedProjectValue),
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
      'bucket'
    )
  }

  const {
    data: bucketsData,
    error: fetchBucketsError,
    loading: loadingBuckets,
    refetch: refetchBuckets
  } = useMutateAsGet(useGetGcsBuckets, {
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: bucketsAPIQueryParams,
    lazy: true
  })

  const bucketOptions = useMemo(() => {
    if (loadingBuckets) {
      return [{ value: getString('loading'), label: getString('loading') }]
    }
    if (fetchBucketsError) {
      return []
    }
    return defaultTo(bucketsData?.data?.buckets, []).map(bucket => ({
      label: bucket.id as string,
      value: bucket.name as string
    }))
  }, [bucketsData, fetchBucketsError, loadingBuckets])

  const canFetchBuckets = React.useCallback((): boolean => {
    if (NG_SVC_ENV_REDESIGN) {
      let shouldFetchBuckets = false
      if (
        isValueRuntimeInput(get(template, `artifacts.${artifactPath}.spec.connectorRef`)) ||
        isValueRuntimeInput(get(template, `artifacts.${artifactPath}.spec.project`))
      ) {
        shouldFetchBuckets = !!(
          (lastBucketsQueryData.connectorRef !== fixedConnectorValue &&
            isFixedNonEmptyValue(defaultTo(fixedConnectorValue, ''))) ||
          (lastBucketsQueryData.project !== fixedProjectValue && isFixedNonEmptyValue(defaultTo(fixedProjectValue, '')))
        )
      }
      return shouldFetchBuckets || isNil(bucketsData?.data)
    } else {
      return !!(
        lastBucketsQueryData.connectorRef != fixedConnectorValue && shouldFetchTagsSource([fixedConnectorValue])
      )
    }
  }, [NG_SVC_ENV_REDESIGN, template, lastBucketsQueryData, fixedConnectorValue, bucketsData?.data, artifactPath])

  const fetchBuckets = React.useCallback((): void => {
    if (canFetchBuckets()) {
      setLastBucketsQueryData({
        connectorRef: defaultTo(fixedConnectorValue, ''),
        project: defaultTo(fixedProjectValue, '')
      })
      refetchBuckets()
    }
  }, [canFetchBuckets, refetchBuckets, fixedConnectorValue])

  const isFieldDisabled = (fieldName: string): boolean => {
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

    return false
  }

  const isRuntime = isPrimaryArtifactsRuntime || isSidecarRuntime
  const itemRenderer = useCallback(
    (item: SelectOption, itemProps: IItemRendererProps) => (
      <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={loadingProjects || loadingBuckets} />
    ),
    [loadingProjects, loadingBuckets]
  )

  const getProjectHelperText = React.useCallback(() => {
    if (
      getMultiTypeFromValue(get(formik?.values, `${path}.artifacts.${artifactPath}.spec.project`)) ===
        MultiTypeInputType.FIXED &&
      (getMultiTypeFromValue(fixedConnectorValue) === MultiTypeInputType.RUNTIME || fixedConnectorValue?.length === 0)
    ) {
      return getString('pipeline.projectHelperText')
    }
  }, [fixedConnectorValue, path, artifactPath, formik.values])

  const getBucketHelperText = React.useCallback(() => {
    if (
      getMultiTypeFromValue(get(formik?.values, `${path}.artifacts.${artifactPath}.spec.bucket`)) ===
        MultiTypeInputType.FIXED &&
      (getMultiTypeFromValue(fixedConnectorValue) === MultiTypeInputType.RUNTIME || fixedConnectorValue?.length === 0)
    ) {
      return getString('pipeline.bucketNameHelperText')
    }
  }, [fixedConnectorValue, path, artifactPath, formik.values])

  return (
    <>
      {isRuntime && (
        <Layout.Vertical key={artifactPath} className={css.inputWidth}>
          {isValueRuntimeInput(get(template, `artifacts.${artifactPath}.spec.connectorRef`)) && (
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
              onChange={(selected, _typeValue) => {
                const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                const connectorRefValue =
                  item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                    ? `${item.scope}.${item?.record?.identifier}`
                    : item.record?.identifier

                if (connectorRefValue !== fixedConnectorValue) {
                  resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.project`)
                  resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.bucket`)
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
          {isValueRuntimeInput(get(template, `artifacts.${artifactPath}.spec.project`)) && (
            <SelectInputSetView
              name={`${path}.artifacts.${artifactPath}.spec.project`}
              label={getString('projectLabel')}
              placeholder={getString('common.selectProject')}
              selectItems={projectOptions}
              useValue
              disabled={!fromTrigger && isFieldDisabled(`artifacts.${artifactPath}.spec.project`)}
              helperText={getProjectHelperText()}
              multiTypeInputProps={{
                allowableTypes,
                expressions,
                selectProps: {
                  items: projectOptions,
                  noResults: (
                    <Text lineClamp={1} width={400} height={32} padding={'small'}>
                      {getRBACErrorMessage(fetchProjectsError as RBACError) || getString('noProjects')}
                    </Text>
                  ),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  if (!loadingProjects) {
                    fetchProjects()
                  }
                }
              }}
              fieldPath={`artifacts.${artifactPath}.spec.project`}
              template={template}
            />
          )}

          {isValueRuntimeInput(get(template, `artifacts.${artifactPath}.spec.bucket`)) && (
            <SelectInputSetView
              name={`${path}.artifacts.${artifactPath}.spec.bucket`}
              label={getString('pipelineSteps.bucketLabel')}
              placeholder={getString('common.artifacts.googleCloudStorage.bucketPlaceholder')}
              selectItems={bucketOptions}
              disabled={!fromTrigger && isFieldDisabled(`artifacts.${artifactPath}.spec.bucket`)}
              helperText={getBucketHelperText()}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <Text lineClamp={1} width={400} height={32} padding="small">
                      {getRBACErrorMessage(fetchBucketsError as RBACError) || getString('pipeline.noBucketsFound')}
                    </Text>
                  ),
                  itemRenderer: itemRenderer,
                  items: bucketOptions,
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  if (!loadingBuckets) {
                    fetchBuckets()
                  }
                }
              }}
              fieldPath={`artifacts.${artifactPath}.spec.bucket`}
              template={template}
            />
          )}

          {!fromTrigger && isValueRuntimeInput(get(template, `artifacts.${artifactPath}.spec.artifactPath`)) && (
            <TextFieldInputSetView
              name={`${path}.artifacts.${artifactPath}.spec.artifactPath`}
              fieldPath={`artifacts.${artifactPath}.spec.artifactPath`}
              template={template}
              label={getString('pipeline.artifactPathLabel')}
              placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.artifactPath`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class GoogleCloudStorageArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.GoogleCloudStorage
  protected isSidecar = false

  // NOTE: This is not used anywhere currently, this written because it is abstract method in ArtifactSourceBase class
  // ArtifactSourceBase should extended here, otherwise GoogleCloudStorageArtifactSource class instance can not be registered
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
