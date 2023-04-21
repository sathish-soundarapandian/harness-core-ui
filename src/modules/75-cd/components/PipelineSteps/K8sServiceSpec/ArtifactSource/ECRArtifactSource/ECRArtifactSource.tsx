/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { defaultTo, get, isNil, memoize } from 'lodash-es'
import type { IItemRendererProps } from '@blueprintjs/select'
import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'

import {
  GetImagesListForEcrQueryParams,
  SidecarArtifact,
  useGetBuildDetailsForEcr,
  useGetBuildDetailsForEcrWithYaml,
  useGetImagesListForEcr
} from 'services/cd-ng'
import { NameValuePair, useListAwsRegions } from 'services/portal'
import { useMutateAsGet } from '@common/hooks'
import { useStrings } from 'framework/strings'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { Scope } from '@common/interfaces/SecretsInterface'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { ConnectorReferenceDTO } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  checkIfQueryParamsisNotEmpty,
  isArtifactInMultiService,
  resetFieldValue
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getImagePath,
  getYamlData,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity,
  isExecutionTimeFieldDisabled,
  getValidInitialValuePath
} from '../artifactSourceUtils'
import ArtifactTagRuntimeField from '../ArtifactSourceRuntimeFields/ArtifactTagRuntimeField'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface ECRRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}

const Content = (props: ECRRenderContent): JSX.Element => {
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
    pipelineIdentifier,
    branch,
    stageIdentifier,
    serviceIdentifier,
    isTagsSelectionDisabled,
    allowableTypes,
    fromTrigger,
    artifact,
    isSidecar,
    artifactPath,
    stepViewType,
    artifacts,
    useArtifactV1Data = false
  } = props

  const [lastQueryData, setLastQueryData] = React.useState({ connectorRef: '', imagePath: '', region: '' })
  const [imagesListLastQueryData, setImagesListLastQueryData] = React.useState({
    connectorRef: '',
    region: ''
  })

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { getRBACErrorMessage } = useRBACError()
  const { NG_SVC_ENV_REDESIGN } = useFeatureFlags()

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const imagePathValue = getImagePath(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.imagePath`, ''), artifact?.spec?.imagePath),
    get(initialValues, `artifacts.${artifactPath}.spec.imagePath`, '')
  )
  const connectorRefValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )
  const regionValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.region`, ''), artifact?.spec?.region),
    get(initialValues?.artifacts, `${artifactPath}.spec.region`, '')
  )

  const isMultiService = isArtifactInMultiService(formik?.values?.services, path)

  // Image Path
  const imagesListAPIQueryParams: GetImagesListForEcrQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef: getFinalQueryParamValue(connectorRefValue),
    region: getFinalQueryParamValue(regionValue),
    repoIdentifier,
    branch,
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
      'imagePath',
      serviceIdentifier as string,
      isMultiService
    )
  }

  const {
    data: imagesListData,
    loading: imagesListLoading,
    refetch: refetchImagesList,
    error: imagesListError
  } = useMutateAsGet(useGetImagesListForEcr, {
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: imagesListAPIQueryParams,
    lazy: true,
    debounce: 300
  })

  const allImageOptions = useMemo(() => {
    if (imagesListLoading) {
      return [{ label: getString('loading'), value: getString('loading') }]
    }
    return defaultTo(
      imagesListData?.data?.images?.map((image: string) => ({
        label: defaultTo(image, ''),
        value: defaultTo(image, '')
      })),
      []
    )
  }, [imagesListLoading, imagesListError, imagesListData])

  const canFetchImagesList = useCallback((): boolean => {
    if (NG_SVC_ENV_REDESIGN) {
      let shouldFetchImages = false
      if (isFieldRuntime(`artifacts.${artifactPath}.spec.connectorRef`, template)) {
        shouldFetchImages = !!(
          imagesListLastQueryData.connectorRef !== connectorRefValue &&
          checkIfQueryParamsisNotEmpty([connectorRefValue])
        )
      }
      if (!shouldFetchImages && isFieldRuntime(`artifacts.${artifactPath}.spec.region`, template)) {
        shouldFetchImages = !!(
          imagesListLastQueryData.region !== regionValue && checkIfQueryParamsisNotEmpty([regionValue])
        )
      }
      return shouldFetchImages || isNil(imagesListData?.data)
    } else {
      return !!(
        (imagesListLastQueryData.connectorRef != connectorRefValue || imagesListLastQueryData.region !== regionValue) &&
        checkIfQueryParamsisNotEmpty([connectorRefValue, regionValue])
      )
    }
  }, [NG_SVC_ENV_REDESIGN, template, imagesListLastQueryData, connectorRefValue, regionValue, imagesListData?.data])

  const fetchImagesList = useCallback((): void => {
    if (canFetchImagesList()) {
      setImagesListLastQueryData({
        connectorRef: connectorRefValue,
        region: regionValue
      })
      refetchImagesList()
    }
  }, [canFetchImagesList, refetchImagesList])

  // v1 tags api is required to fetch tags for artifact source template usage while linking to service
  // Here v2 api cannot be used to get the builds because of unavailability of complete yaml during creation.
  const {
    data: ecrTagsV1Data,
    loading: fetchingV1Tags,
    refetch: refetchV1Tags,
    error: fetchTagsV1Error
  } = useGetBuildDetailsForEcr({
    queryParams: {
      imagePath: defaultTo(getFinalQueryParamValue(imagePathValue), ''),
      connectorRef: defaultTo(getFinalQueryParamValue(connectorRefValue), ''),
      region: defaultTo(getFinalQueryParamValue(regionValue), ''),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true
  })

  const {
    data: ecrTagsV2Data,
    loading: fetchingV2Tags,
    refetch: refetchV2Tags,
    error: fetchTagsV2Error
  } = useMutateAsGet(useGetBuildDetailsForEcrWithYaml, {
    body: getYamlData(formik?.values, stepViewType as StepViewType, path as string),
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      repoIdentifier,
      branch,
      imagePath: getFinalQueryParamValue(imagePathValue),
      connectorRef: getFinalQueryParamValue(connectorRefValue),
      region: getFinalQueryParamValue(regionValue),
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
        'tag',
        serviceIdentifier as string,
        isMultiService
      )
    },
    lazy: true
  })

  const { refetchTags, fetchingTags, fetchTagsError, ecrTagsData } = useArtifactV1Data
    ? {
        refetchTags: refetchV1Tags,
        fetchingTags: fetchingV1Tags,
        fetchTagsError: fetchTagsV1Error,
        ecrTagsData: ecrTagsV1Data
      }
    : {
        refetchTags: refetchV2Tags,
        fetchingTags: fetchingV2Tags,
        fetchTagsError: fetchTagsV2Error,
        ecrTagsData: ecrTagsV2Data
      }

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const regions = defaultTo(regionData?.resource, []).map((region: NameValuePair) => ({
    value: region.value,
    label: defaultTo(region.name, '')
  }))

  const fetchTags = (): void => {
    if (canFetchTags()) {
      setLastQueryData({ connectorRef: connectorRefValue, imagePath: imagePathValue, region: regionValue })
      refetchTags()
    }
  }

  const canFetchTags = (): boolean => {
    return (
      (!ecrTagsData?.data && !fetchTagsError) ||
      ((lastQueryData.connectorRef != connectorRefValue ||
        lastQueryData.imagePath !== imagePathValue ||
        getMultiTypeFromValue(artifact?.spec?.imagePath) === MultiTypeInputType.EXPRESSION ||
        lastQueryData.region !== regionValue) &&
        checkIfQueryParamsisNotEmpty([connectorRefValue, imagePathValue, regionValue]))
    )
  }

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

  const getImagePathHelperText = () => {
    if (
      (getMultiTypeFromValue(get(formik?.values, `${path}.artifacts.${artifactPath}.spec.imagePath`)) ===
        MultiTypeInputType.FIXED &&
        (getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.RUNTIME || connectorRefValue?.length === 0)) ||
      getMultiTypeFromValue(regionValue) === MultiTypeInputType.RUNTIME ||
      regionValue?.length === 0
    ) {
      return getString('pipeline.imagePathHelperText')
    }
  }

  const isRuntime = isPrimaryArtifactsRuntime || isSidecarRuntime

  const itemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem
      item={item}
      itemProps={itemProps}
      disabled={imagesListLoading || !!imagesListError}
      style={imagesListError ? { lineClamp: 1, width: 400, padding: 'small' } : {}}
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
              setRefValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.connectorRef`)}
              multiTypeProps={{
                allowableTypes,
                expressions
              }}
              onChange={(selected, _typeValue) => {
                const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                const newConnectorRefValue =
                  item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                    ? `${item.scope}.${item?.record?.identifier}`
                    : item.record?.identifier

                if (newConnectorRefValue !== connectorRefValue) {
                  resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.imagePath`)
                  resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.tag`)
                }
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

          {isFieldRuntime(`artifacts.${artifactPath}.spec.region`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.region`}
              template={template}
              formik={formik}
              multiTypeInputProps={{
                onChange: () => {
                  resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.imagePath`)
                  resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.tag`)
                },
                selectProps: {
                  usePortal: true,
                  items: regions
                },
                expressions,
                allowableTypes
              }}
              useValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.region`)}
              selectItems={regions}
              label={getString('regionLabel')}
              name={`${path}.artifacts.${artifactPath}.spec.region`}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType as StepViewType)
              }}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.imagePath`, template) && (
            <SelectInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.imagePath`}
              template={template}
              selectItems={allImageOptions}
              label={getString('pipeline.imagePathLabel')}
              placeholder={getString('pipeline.artifactsSelection.existingDocker.imageNamePlaceholder')}
              name={`${path}.artifacts.${artifactPath}.spec.imagePath`}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.imagePath`)}
              helperText={getImagePathHelperText()}
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                onChange: selected => {
                  if (imagePathValue !== (selected as any)?.value) {
                    resetFieldValue(formik, `${path}.artifacts.${artifactPath}.spec.tag`)
                  }
                },
                selectProps: {
                  noResults: (
                    <Text lineClamp={1} width={400} padding="small">
                      {getRBACErrorMessage(imagesListError as RBACError) || getString('pipeline.noImagesFound')}
                    </Text>
                  ),
                  itemRenderer: itemRenderer,
                  items: allImageOptions,
                  allowCreatingNewItems: true,
                  usePortal: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  if (!imagesListLoading) {
                    fetchImagesList()
                  }
                }
              }}
            />
          )}

          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <FormInput.MultiTextInput
              label={getString('tagLabel')}
              multiTextInputProps={{
                expressions,
                value: TriggerDefaultFieldList.build,
                allowableTypes
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.tag`}
            />
          )}

          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) && (
            <ArtifactTagRuntimeField
              {...props}
              isFieldDisabled={() => isFieldDisabled(`artifacts.${artifactPath}.spec.tag`, true)}
              fetchingTags={fetchingTags}
              buildDetailsList={ecrTagsData?.data?.buildDetailsList}
              fetchTagsError={fetchTagsError}
              fetchTags={fetchTags}
              expressions={expressions}
              stageIdentifier={stageIdentifier}
              template={template}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.tagRegex`, template) && (
            <TextFieldInputSetView
              fieldPath={`artifacts.${artifactPath}.spec.tagRegex`}
              template={template}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.tagRegex`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('tagRegex')}
              name={`${path}.artifacts.${artifactPath}.spec.tagRegex`}
              configureOptionsProps={{
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType as StepViewType)
              }}
            />
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class ECRArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.Ecr
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
    const isRegionPresent = getDefaultQueryParam(
      artifact?.spec?.region,
      get(initialValues, `artifacts.${artifactPath}.spec.region`, '')
    )
    return !(isImagePathPresent && isConnectorPresent && isRegionPresent)
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
