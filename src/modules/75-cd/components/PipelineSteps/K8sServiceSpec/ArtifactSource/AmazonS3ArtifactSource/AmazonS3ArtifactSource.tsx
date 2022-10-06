/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { FormikValues } from 'formik'
import { defaultTo, get, memoize } from 'lodash-es'
import { Menu } from '@blueprintjs/core'

import {
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@wings-software/uicore'
import { BucketResponse, SidecarArtifact, useGetV2BucketListForS3 } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import {
  ConnectorReferenceDTO,
  FormMultiTypeConnectorField
} from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { useListAwsRegions } from 'services/portal'
import { Scope } from '@common/interfaces/SecretsInterface'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { getDefaultQueryParam, getFinalQueryParamValue, isFieldfromTriggerTabDisabled } from '../artifactSourceUtils'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

export const resetBuckets = (formik: FormikValues, bucketPath: string): void => {
  const bucketValue = get(formik.values, bucketPath, '')
  if (getMultiTypeFromValue(bucketValue) === MultiTypeInputType.FIXED && bucketValue?.length) {
    formik.setFieldValue(bucketPath, '')
  }
}

export interface AmazonS3ContentProps extends ArtifactSourceRenderProps {
  isBucketSelectionDisabled: (props: ArtifactSourceRenderProps) => boolean
}

const Content = (props: AmazonS3ContentProps): JSX.Element => {
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
    isBucketSelectionDisabled
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { getRBACErrorMessage } = useRBACError()

  const fixedConnectorValue = getDefaultQueryParam(
    artifact?.spec?.connectorRef,
    get(initialValues?.artifacts, `${artifactPath}.spec.connectorRef`, '')
  )

  const fixedFilePathRegexValue = getDefaultQueryParam(
    artifact?.spec?.filePathRegex,
    get(initialValues?.artifacts, `${artifactPath}.spec.filePathRegex`, '')
  )

  const fixedRegionValue = getDefaultQueryParam(
    artifact?.spec?.region,
    get(initialValues?.artifacts, `${artifactPath}.spec.region`, '')
  )

  const [connectorRef, setConnectorRef] = React.useState<string>()
  const [regions, setRegions] = React.useState<SelectOption[]>([])

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

  const {
    data: bucketData,
    error,
    loading,
    refetch: refetchBuckets
  } = useGetV2BucketListForS3({
    lazy: true
  })

  const fetchBuckets = (): void => {
    refetchBuckets({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        connectorRef: fixedConnectorValue,
        region: getFinalQueryParamValue(fixedRegionValue)
      }
    })
  }

  const selectItems = useMemo(() => {
    return bucketData?.data?.map((bucket: BucketResponse) => ({
      value: defaultTo(bucket.bucketName, ''),
      label: defaultTo(bucket.bucketName, '')
    }))
  }, [bucketData?.data])

  const getBuckets = (): { label: string; value: string }[] => {
    if (loading) {
      return [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
    }
    return defaultTo(selectItems, [])
  }

  const isFieldDisabled = (fieldName: string, isBucket = false): boolean => {
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
      return isBucketSelectionDisabled(props)
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
        disabled={loading}
        onClick={handleClick}
      />
    </div>
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
              orgIdentifier={orgIdentifier}
              width={391}
              setRefValue
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.connectorRef`)}
              multiTypeProps={{
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
                expressions
              }}
              onChange={(selected, _typeValue, type) => {
                const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
                if (type === MultiTypeInputType.FIXED) {
                  const connectorRefValue =
                    item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                      ? `${item.scope}.${item?.record?.identifier}`
                      : item.record?.identifier
                  refetchBuckets({
                    queryParams: {
                      accountIdentifier: accountId,
                      orgIdentifier,
                      projectIdentifier,
                      connectorRef: defaultTo(connectorRefValue, fixedConnectorValue),
                      ...(getFinalQueryParamValue(fixedRegionValue) && {
                        region: getFinalQueryParamValue(fixedRegionValue)
                      })
                    }
                  })
                  setConnectorRef(connectorRefValue)
                }
                resetBuckets(formik, `${path}.artifacts.${artifactPath}.spec.bucketName`)
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
            <FormInput.MultiTypeInput
              name={`${path}.artifacts.${artifactPath}.spec.region`}
              selectItems={regions}
              useValue
              disabled={(!fromTrigger && isFieldDisabled(`artifacts.${artifactPath}.spec.region`)) || loading}
              multiTypeInputProps={{
                onChange: selected => {
                  if (
                    getMultiTypeFromValue(defaultTo(connectorRef, fixedConnectorValue)) === MultiTypeInputType.FIXED
                  ) {
                    refetchBuckets({
                      queryParams: {
                        accountIdentifier: accountId,
                        orgIdentifier,
                        projectIdentifier,
                        connectorRef: defaultTo(connectorRef, fixedConnectorValue),
                        region: defaultTo((selected as any).value, fixedRegionValue)
                      }
                    })
                  }
                  resetBuckets(formik, `${path}.artifacts.${artifactPath}.spec.bucketName`)
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
            <FormInput.MultiTypeInput
              selectItems={getBuckets()}
              label={getString('pipeline.manifestType.bucketName')}
              placeholder={loading ? getString('loading') : getString('pipeline.manifestType.bucketPlaceHolder')}
              name={`${path}.artifacts.${artifactPath}.spec.bucketName`}
              disabled={(!fromTrigger && isFieldDisabled(`artifacts.${artifactPath}.spec.bucketName`, true)) || loading}
              helperText={
                !get(formik, `values.${path}.artifacts.${artifactPath}.spec.connectorRef`)?.length &&
                getMultiTypeFromValue(artifact?.spec?.connectorRef) === MultiTypeInputType.RUNTIME &&
                getString('pipeline.dependencyRequired')
              }
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <Text lineClamp={1} width={500} height={100}>
                      {getRBACErrorMessage(error as RBACError) || getString('pipeline.noBuckets')}
                    </Text>
                  ),
                  itemRenderer: itemRenderer,
                  items: getBuckets(),
                  allowCreatingNewItems: true
                },
                onFocus: () => {
                  if (!bucketData?.data && fixedConnectorValue?.length) {
                    fetchBuckets()
                  }
                }
              }}
            />
          )}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.filePath`, template) && (
            <FormInput.MultiTextInput
              label={getString('common.git.filePath')}
              name={`${path}.artifacts.${artifactPath}.spec.filePath`}
              placeholder={getString('pipeline.manifestType.pathPlaceholder')}
              disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.filePath`)}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          )}

          {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.filePathRegex`, template) && (
            <FormInput.MultiTextInput
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

export class AmazonS3ArtifactSource extends ArtifactSourceBase<AmazonS3ContentProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.AmazonS3
  protected isSidecar = false

  // NOTE: This is not used anywhere currently, this written because it is abstract method in ArtifactSourceBase class
  // ArtifactSourceBase should extended here, otherwise AmazonS3ArtifactSource class instancecan not be registered
  // in src/modules/75-cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory.tsx file
  isTagsSelectionDisabled(_props: ArtifactSourceRenderProps): boolean {
    return false
  }

  isBucketSelectionDisabled(props: ArtifactSourceRenderProps): boolean {
    const { initialValues, artifactPath, artifact } = props

    const isConnectorPresent = getDefaultQueryParam(
      artifact?.spec?.connectorRef,
      get(initialValues, `artifacts.${artifactPath}.spec.connectorRef`, '')
    )
    return !isConnectorPresent
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isBucketSelectionDisabled={this.isBucketSelectionDisabled.bind(this)} />
  }
}
