/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get } from 'lodash-es'
import type { FormikValues } from 'formik'
import type { IItemRendererProps } from '@blueprintjs/select'
import { getMultiTypeFromValue, Layout, MultiTypeInputType, SelectOption, Text } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { NameValuePair, useListAwsRegions } from 'services/portal'
import { useGetV2BucketListForS3 } from 'services/cd-ng'
import List from '@common/components/List/List'

import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'

import { shouldFetchTagsSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ArtifactSource/artifactSourceUtils'

import { isValueRuntimeInput } from '@common/utils/utils'
import { getFieldPathName } from './AmazonS3StoreHelper'
import type { TerraformProps } from '../../Terraform/TerraformInterfaces'

export const resetBuckets = (formik: FormikValues, bucketPath: string): void => {
  const bucketValue = get(formik.values, bucketPath, '')
  if (getMultiTypeFromValue(bucketValue) === MultiTypeInputType.FIXED && bucketValue?.length) {
    formik.setFieldValue(bucketPath, '')
  }
}
export interface AmazonS3RuntimeViewProps extends TerraformProps {
  template: any
  fieldPath?: string
  formik?: any
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  specFieldPath?: string
}
export const AmazonS3RuntimeView = (props: AmazonS3RuntimeViewProps): React.ReactElement => {
  const {
    path,
    isConfig,
    isBackendConfig,
    specFieldPath,
    template,
    allowableTypes,
    readonly,
    formik,
    accountId,
    projectIdentifier,
    orgIdentifier,
    allValues
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { getRBACErrorMessage } = useRBACError()

  const [lastQueryData, setLastQueryData] = React.useState({
    connectorRef: '',
    region: ''
  })

  const specFieldPathName = getFieldPathName(specFieldPath, isConfig, isBackendConfig)

  const fixedConnectorValue = defaultTo(
    get(formik?.values, `${path}.${specFieldPathName}.connectorRef`),
    get(allValues, `${specFieldPathName}.connectorRef`)
  )

  const fixedRegionValue = defaultTo(
    get(formik?.values, `${path}.${specFieldPathName}.region`),
    get(allValues, `${specFieldPathName}.region`)
  )

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions = (regionData?.resource || []).map((region: NameValuePair) => ({
    value: region.value,
    label: region.name as string
  }))

  const {
    data: s3BucketList,
    loading: s3BucketDataLoading,
    refetch: refetchS3Buckets,
    error: fetchBucketsError
  } = useGetV2BucketListForS3({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      connectorRef: fixedConnectorValue,
      region: fixedRegionValue
    },
    lazy: true
  })

  const buckets = React.useMemo((): { label: string; value: string }[] => {
    if (s3BucketDataLoading) {
      return [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
    } else if (fetchBucketsError) {
      return []
    }
    return Object.keys(s3BucketList?.data || {}).map(item => ({
      label: item,
      value: item
    }))
  }, [s3BucketDataLoading, s3BucketList?.data, fetchBucketsError])

  const canFetchBuckets = React.useCallback((): boolean => {
    return !!(
      (lastQueryData.connectorRef != fixedConnectorValue || lastQueryData.region !== fixedRegionValue) &&
      shouldFetchTagsSource([fixedConnectorValue, fixedRegionValue])
    )
  }, [lastQueryData, fixedConnectorValue, fixedRegionValue])

  const fetchBuckets = (): void => {
    if (canFetchBuckets()) {
      setLastQueryData({
        connectorRef: fixedConnectorValue,
        region: fixedRegionValue
      })
      refetchS3Buckets()
    }
  }

  const itemRenderer = React.useCallback(
    (item: SelectOption, itemProps: IItemRendererProps) => (
      <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={s3BucketDataLoading} />
    ),
    [s3BucketDataLoading]
  )

  return (
    <Layout.Vertical data-name="amazonS3Store">
      {isValueRuntimeInput(get(template, `${specFieldPathName}.region`)) && (
        <SelectInputSetView
          fieldPath={`${path}.${specFieldPathName}.region`}
          template={template}
          formik={formik}
          name={`${path}.${specFieldPathName}.region`}
          disabled={readonly}
          multiTypeInputProps={{
            selectProps: {
              usePortal: true,
              addClearBtn: !readonly,
              items: regions
            },
            onChange: (selected: any) => {
              if (fixedRegionValue !== selected.value) {
                resetBuckets(formik, `${specFieldPathName}.bucketName`)
              }
            },
            expressions,
            allowableTypes
          }}
          useValue
          selectItems={regions}
          label={getString('regionLabel')}
        />
      )}

      {isValueRuntimeInput(get(template, `${specFieldPathName}.bucketName`)) && (
        <SelectInputSetView
          fieldPath={`${path}.${specFieldPathName}.bucketName`}
          template={template}
          name={`${path}.${specFieldPathName}.bucketName`}
          formik={formik}
          disabled={readonly}
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
              items: buckets,
              allowCreatingNewItems: true,
              itemRenderer,
              noResults: (
                <Text lineClamp={2} width={400} height={100} padding="small">
                  {getRBACErrorMessage(fetchBucketsError as RBACError) || getString('pipeline.noBuckets')}
                </Text>
              )
            },
            expressions,
            allowableTypes
          }}
          useValue
          selectItems={buckets}
        />
      )}

      {isBackendConfig && isValueRuntimeInput(get(template, `${specFieldPathName}.paths`)) && (
        <List
          label={getString('common.git.filePath')}
          name={`${path}.${specFieldPathName}.paths`}
          placeholder={getString('pipeline.manifestType.pathPlaceholder')}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          expressions={expressions}
          isNameOfArrayType
          allowOnlyOne
        />
      )}
    </Layout.Vertical>
  )
}
