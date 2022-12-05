/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get, isNil } from 'lodash-es'
import cx from 'classnames'
import type { FormikValues } from 'formik'
import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'

import { StringKeys, useStrings } from 'framework/strings'
import { NameValuePair, useListAwsRegions } from 'services/portal'
import { useGetBucketsInManifests } from 'services/cd-ng'
import List from '@common/components/List/List'
import { Scope } from '@common/interfaces/SecretsInterface'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useMutateAsGet } from '@common/hooks'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { ConnectorReferenceDTO } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { ManifestToConnectorMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { shouldAllowOnlyOneFilePath } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/CommonManifestDetails/utils'
import type { ManifestTypes } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import type { ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import {
  getManifestFieldFqnPath,
  isFieldfromTriggerTabDisabled
} from '../../K8sServiceSpec/ManifestSource/ManifestSourceUtils'
import {
  getYamlData,
  isNewServiceEnvEntity,
  shouldFetchTagsSource
} from '../../K8sServiceSpec/ArtifactSource/artifactSourceUtils'
import ExperimentalInput from '../../K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'
import { isFieldRuntime } from '../../K8sServiceSpec/K8sServiceSpecHelper'
import css from '../../K8sServiceSpec/KubernetesManifests/KubernetesManifests.module.scss'

export const resetBuckets = (formik: FormikValues, bucketPath: string): void => {
  const bucketValue = get(formik.values, bucketPath, '')
  if (getMultiTypeFromValue(bucketValue) === MultiTypeInputType.FIXED && bucketValue?.length) {
    formik.setFieldValue(bucketPath, '')
  }
}
export interface S3ManifestStoreRuntimeViewProps extends ManifestSourceRenderProps {
  pathFieldlabel: StringKeys
}

export const S3ManifestStoreRuntimeView = (props: S3ManifestStoreRuntimeViewProps): React.ReactElement => {
  const {
    initialValues,
    template,
    path,
    manifestPath,
    manifest,
    fromTrigger,
    allowableTypes,
    readonly,
    formik,
    accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch,
    stageIdentifier,
    stepViewType,
    pathFieldlabel,
    pipelineIdentifier,
    serviceIdentifier
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const [lastQueryData, setLastQueryData] = React.useState({
    connectorRef: '',
    region: ''
  })

  const fixedConnectorValue = defaultTo(
    get(initialValues, `${manifestPath}.spec.store.spec.connectorRef`),
    manifest?.spec?.store?.spec.connectorRef
  )
  const fixedRegionValue = defaultTo(
    get(initialValues, `${manifestPath}.spec.store.spec.region`),
    manifest?.spec?.store?.spec.region
  )

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions = (regionData?.resource || []).map((region: NameValuePair) => ({
    value: region.value,
    label: region.name
  }))

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const fqnPathManifestPath = defaultTo(
    manifestPath?.split('[')[0].concat(`.${get(initialValues, `${manifestPath}.identifier`)}`),
    ''
  )
  const bucketListAPIQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef: fixedConnectorValue,
    region: fixedRegionValue,
    pipelineIdentifier: defaultTo(pipelineIdentifier, formik?.values?.identifier),
    serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
    fqnPath: getManifestFieldFqnPath(
      path as string,
      !!isPropagatedStage,
      stageIdentifier,
      fqnPathManifestPath,
      'bucketName'
    )
  }

  const {
    data: s3BucketList,
    loading: s3BucketDataLoading,
    refetch: refetchS3Buckets
  } = useMutateAsGet(useGetBucketsInManifests, {
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

  const s3BucketOptions = React.useMemo(() => {
    return Object.keys(s3BucketList?.data || {}).map(item => ({
      label: item,
      value: item
    }))
  }, [s3BucketList?.data])

  const getBuckets = React.useCallback((): { label: string; value: string }[] => {
    if (s3BucketDataLoading) {
      return [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
    }
    return defaultTo(s3BucketOptions, [])
  }, [s3BucketDataLoading, s3BucketOptions])

  const canFetchBuckets = React.useCallback((): boolean => {
    return (
      !!(
        (lastQueryData.connectorRef != fixedConnectorValue || lastQueryData.region !== fixedRegionValue) &&
        shouldFetchTagsSource([fixedConnectorValue, fixedRegionValue])
      ) || isNil(s3BucketList?.data)
    )
  }, [template, lastQueryData, fixedConnectorValue, fixedRegionValue, s3BucketList?.data])

  const fetchBuckets = React.useCallback((): void => {
    if (canFetchBuckets()) {
      setLastQueryData({
        connectorRef: fixedConnectorValue,
        region: fixedRegionValue
      })
      refetchS3Buckets()
    }
  }, [canFetchBuckets, refetchS3Buckets, fixedConnectorValue, fixedRegionValue])

  const isFieldDisabled = (fieldName: string): boolean => {
    // /* instanbul ignore else */
    if (readonly) {
      return true
    }
    return isFieldfromTriggerTabDisabled(
      fieldName,
      formik,
      stageIdentifier,
      manifest?.identifier as string,
      fromTrigger
    )
  }

  const renderBucketNameField = (): React.ReactElement | null => {
    return (
      <div className={css.verticalSpacingInput}>
        <ExperimentalInput
          name={`${path}.${manifestPath}.spec.store.spec.bucketName`}
          disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.bucketName`)}
          formik={formik}
          label={getString('pipeline.manifestType.bucketName')}
          placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
          multiTypeInputProps={{
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              if (
                e?.target?.type !== 'text' ||
                (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
              ) {
                return
              }
              if (!s3BucketDataLoading) {
                fetchBuckets()
              }
            },
            selectProps: {
              usePortal: true,
              addClearBtn: !readonly,
              items: getBuckets(),
              allowCreatingNewItems: true
            },
            expressions,
            allowableTypes
          }}
          useValue
          selectItems={s3BucketOptions}
        />
      </div>
    )
  }

  const connectorRefPath = `${manifestPath}.spec.store.spec.connectorRef`

  return (
    <Layout.Vertical
      data-name="manifest"
      key={manifest?.identifier}
      className={cx(css.inputWidth, css.layoutVerticalSpacing)}
    >
      {isFieldRuntime(connectorRefPath, template) && (
        <div data-name="connectorRefContainer" className={css.verticalSpacingInput}>
          <FormMultiTypeConnectorField
            disabled={isFieldDisabled(connectorRefPath)}
            name={`${path}.${connectorRefPath}`}
            selected={get(initialValues, connectorRefPath, '')}
            label={getString('connector')}
            placeholder={''}
            setRefValue
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
                resetBuckets(formik, `${path}.${manifestPath}.spec.store.spec.bucketName`)
              }
            }}
            width={391}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            type={ManifestToConnectorMap[defaultTo(manifest?.spec?.store?.type, '')]}
            gitScope={{
              repo: defaultTo(repoIdentifier, ''),
              branch: defaultTo(branch, ''),
              getDefaultFromOtherRepo: true
            }}
          />
        </div>
      )}

      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.store.spec.region`, template) && (
          <div className={css.verticalSpacingInput}>
            <ExperimentalInput
              formik={formik}
              name={`${path}.${manifestPath}.spec.store.spec.region`}
              disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.region`)}
              multiTypeInputProps={{
                selectProps: {
                  usePortal: true,
                  addClearBtn: !readonly,
                  items: regions
                },
                onChange: (selected: any) => {
                  if (fixedRegionValue !== selected.value) {
                    resetBuckets(formik, `${path}.${manifestPath}.spec.store.spec.bucketName`)
                  }
                },
                expressions,
                allowableTypes
              }}
              useValue
              selectItems={regions}
              label={getString('regionLabel')}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.store.spec.region`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.store.spec.region`)}
            type="String"
            variableName="region"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.region`, value)
            }}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.store.spec.bucketName`, template) && renderBucketNameField()}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.store.spec.bucketName`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.store.spec.bucketName`)}
            type="String"
            variableName="bucketName"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.bucketName`, value)
            }}
          />
        )}
      </div>
      {isFieldRuntime(`${manifestPath}.spec.store.spec.paths`, template) && (
        <div className={css.verticalSpacingInput}>
          <List
            labelClassName={css.listLabel}
            label={getString(pathFieldlabel)}
            name={`${path}.${manifestPath}.spec.store.spec.paths`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.paths`)}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
            allowOnlyOne={shouldAllowOnlyOneFilePath(manifest?.type as ManifestTypes)}
          />
        </div>
      )}

      {isFieldRuntime(`${manifestPath}.spec.configOverridePath`, template) && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={isFieldDisabled(`${manifestPath}.spec.configOverridePath`)}
            multiTextInputProps={{ expressions, allowableTypes: props.allowableTypes }}
            label={getString('pipeline.manifestType.serverlessConfigFilePath')}
            placeholder={getString('pipeline.manifestType.serverlessConfigFilePathPlaceholder')}
            name={`${path}.${manifestPath}.spec.configOverridePath`}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}
