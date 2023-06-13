/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, get } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { useMutateAsGet } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { SidecarArtifact, useGetBuildDetailsForGcr, useGetBuildDetailsForGcrWithYaml } from 'services/cd-ng'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isArtifactInMultiService } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import {
  gcrUrlList,
  getDefaultQueryParam,
  getFinalQueryParamValue,
  getFqnPath,
  getImagePath,
  getYamlData,
  isFieldfromTriggerTabDisabled,
  isNewServiceEnvEntity,
  resetTags,
  shouldFetchTagsSource,
  getValidInitialValuePath,
  DefaultParam
} from '../artifactSourceUtils'
import ArtifactTagRuntimeField from '../ArtifactSourceRuntimeFields/ArtifactTagRuntimeField'
import DigestField from '../ArtifactSourceRuntimeFields/DigestField'
import { useGetDigestDetailsForGcrArtifact } from './useGetDigestDetailsForGcr'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface GCRRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}
const Content = (props: GCRRenderContent): JSX.Element => {
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

  const { CD_NG_DOCKER_ARTIFACT_DIGEST } = useFeatureFlags()
  const { getString } = useStrings()
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const { expressions } = useVariablesExpression()
  const [lastQueryData, setLastQueryData] = useState({ connectorRef: '', imagePath: '', registryHostname: '' })
  const imagePathValue = getImagePath(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.imagePath`, ''), artifact?.spec?.imagePath),
    get(initialValues, `artifacts.${artifactPath}.spec.imagePath`, '')
  )

  const connectorRefValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.connectorRef`, ''), artifact?.spec?.connectorRef),
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )
  const tagValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.tag`, ''), artifact?.spec?.tag),
    get(initialValues?.artifacts, `${artifactPath}.spec.tag`, '')
  )
  const tagRegexValue = getDefaultQueryParam(
    getValidInitialValuePath(get(artifacts, `${artifactPath}.spec.tagRegex`, ''), artifact?.spec?.tagRegex),
    get(initialValues, `artifacts.${artifactPath}.spec.tagRegex`, '')
  )
  const registryHostnameValue = getDefaultQueryParam(
    getValidInitialValuePath(
      get(artifacts, `${artifactPath}.spec.registryHostname`, ''),
      artifact?.spec?.registryHostname
    ),
    get(initialValues, `artifacts.${artifactPath}.spec.registryHostname`, '')
  )

  // v1 tags api is required to fetch tags for artifact source template usage while linking to service
  // Here v2 api cannot be used to get the builds because of unavailability of complete yaml during creation.
  const {
    data: gcrTagsV1Data,
    loading: fetchingV1Tags,
    refetch: refetchV1Tags,
    error: fetchTagsV1Error
  } = useGetBuildDetailsForGcr({
    queryParams: {
      imagePath: defaultTo(getFinalQueryParamValue(imagePathValue), ''),
      connectorRef: defaultTo(getFinalQueryParamValue(connectorRefValue), ''),
      registryHostname: defaultTo(getFinalQueryParamValue(registryHostnameValue), ''),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true
  })

  const serviceId = isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined
  const isMultiService = isArtifactInMultiService(formik?.values?.services, path)

  const {
    fetchDigest,
    fetchingDigest,
    fetchDigestError: digestError,
    gcrDigestData: digestData
  } = useGetDigestDetailsForGcrArtifact({
    connectorRef: getFinalQueryParamValue(connectorRefValue),
    imagePath: getFinalQueryParamValue(imagePathValue),
    registryHostname: getFinalQueryParamValue(registryHostnameValue),
    tag: getFinalQueryParamValue(tagValue),
    accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch,
    useArtifactV1Data,
    formik,
    path,
    initialValues,
    isPropagatedStage,
    serviceId,
    isSidecar,
    artifactPath,
    stageIdentifier,
    pipelineIdentifier,
    stepViewType
  })

  const {
    data: gcrTagsV2Data,
    loading: fetchingV2Tags,
    refetch: refetchV2Tags,
    error: fetchTagsV2Error
  } = useMutateAsGet(useGetBuildDetailsForGcrWithYaml, {
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
      registryHostname: getFinalQueryParamValue(registryHostnameValue),
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

  const { refetchTags, fetchingTags, fetchTagsError, gcrTagsData } = useArtifactV1Data
    ? {
        refetchTags: refetchV1Tags,
        fetchingTags: fetchingV1Tags,
        fetchTagsError: fetchTagsV1Error,
        gcrTagsData: gcrTagsV1Data
      }
    : {
        refetchTags: refetchV2Tags,
        fetchingTags: fetchingV2Tags,
        fetchTagsError: fetchTagsV2Error,
        gcrTagsData: gcrTagsV2Data
      }

  const fetchTags = (): void => {
    if (canFetchTags()) {
      setLastQueryData({
        connectorRef: connectorRefValue,
        imagePath: imagePathValue,
        registryHostname: registryHostnameValue
      })
      refetchTags()
    }
  }

  const canFetchTags = (): boolean => {
    return (
      (!gcrTagsData?.data && !fetchTagsError) ||
      ((lastQueryData.connectorRef != connectorRefValue ||
        lastQueryData.imagePath !== imagePathValue ||
        getMultiTypeFromValue(artifact?.spec?.imagePath) === MultiTypeInputType.EXPRESSION ||
        lastQueryData.registryHostname !== registryHostnameValue) &&
        shouldFetchTagsSource([connectorRefValue, imagePathValue, registryHostnameValue]))
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

  const isRuntime = isPrimaryArtifactsRuntime || isSidecarRuntime
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
              onChange={() => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`)}
              className={css.connectorMargin}
              type={ArtifactToConnectorMap[defaultTo(artifact?.type, '')]}
              gitScope={{
                repo: defaultTo(repoIdentifier, ''),
                branch: defaultTo(branch, ''),
                getDefaultFromOtherRepo: true
              }}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.registryHostname`, template) && (
            <SelectInputSetView
              label={getString('connectors.GCR.registryHostname')}
              name={`${path}.artifacts.${artifactPath}.spec.registryHostname`}
              useValue
              fieldPath={`artifacts.${artifactPath}.spec.registryHostname`}
              template={template}
              selectItems={gcrUrlList}
              multiTypeInputProps={{
                onChange: () => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`),
                expressions,
                allowableTypes,
                selectProps: { allowCreatingNewItems: true, addClearBtn: true, items: gcrUrlList }
              }}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.imagePath`, template) && (
            <TextFieldInputSetView
              label={getString('pipeline.imagePathLabel')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.imagePath`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              name={`${path}.artifacts.${artifactPath}.spec.imagePath`}
              onChange={() => resetTags(formik, `${path}.artifacts.${artifactPath}.spec.tag`)}
              fieldPath={`artifacts.${artifactPath}.spec.imagePath`}
              template={template}
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
              buildDetailsList={gcrTagsData?.data?.buildDetailsList}
              fetchTagsError={fetchTagsError}
              fetchTags={fetchTags}
              expressions={expressions}
              stageIdentifier={stageIdentifier}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.tagRegex`, template) && (
            <TextFieldInputSetView
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.tagRegex`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('tagRegex')}
              name={`${path}.artifacts.${artifactPath}.spec.tagRegex`}
              fieldPath={`artifacts.${artifactPath}.spec.tagRegex`}
              template={template}
            />
          )}
          {!fromTrigger &&
            CD_NG_DOCKER_ARTIFACT_DIGEST &&
            (isFieldRuntime(`artifacts.${artifactPath}.spec.tag`, template) || tagValue !== DefaultParam) &&
            isFieldRuntime(`artifacts.${artifactPath}.spec.digest`, template) && (
              <div className={css.inputFieldLayout}>
                <DigestField
                  {...props}
                  fetchingDigest={fetchingDigest}
                  fetchDigestError={digestError}
                  fetchDigest={fetchDigest}
                  expressions={expressions}
                  stageIdentifier={stageIdentifier}
                  digestData={digestData}
                />
              </div>
            )}
          {!fromTrigger &&
            CD_NG_DOCKER_ARTIFACT_DIGEST &&
            (isFieldRuntime(`artifacts.${artifactPath}.spec.tagRegex`, template) || tagRegexValue !== DefaultParam) &&
            isFieldRuntime(`artifacts.${artifactPath}.spec.digest`, template) && (
              <TextFieldInputSetView
                tooltipProps={{
                  dataTooltipId: 'artifactDigestTooltip'
                }}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.digest`)}
                multiTextInputProps={{
                  expressions,
                  allowableTypes
                }}
                label={getString('pipeline.digest')}
                name={`${path}.artifacts.${artifactPath}.spec.digest`}
                fieldPath={`artifacts.${artifactPath}.spec.digest`}
                template={template}
              />
            )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class GCRArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.Gcr
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
    const isRegistryHostnamePresent = getDefaultQueryParam(
      artifact?.spec?.registryHostname,
      get(initialValues, `artifacts.${artifactPath}.spec.registryHostname`, '')
    )
    return !(isImagePathPresent && isConnectorPresent && isRegistryHostnamePresent)
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
