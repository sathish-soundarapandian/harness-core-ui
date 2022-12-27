/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { connect, FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, isNil } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes, FormInput, Layout } from '@harness/uicore'

import { ConnectorInfoDTO, useGetBucketListForS3 } from 'services/cd-ng'
import { NameValuePair, useListAwsRegions } from 'services/portal'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import List from '@common/components/List/List'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { ConnectorReferenceDTO } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ManifestToConnectorMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { shouldDisplayRepositoryName } from '../K8sServiceSpec/ManifestSource/ManifestSourceUtils'
import ExperimentalInput from '../K8sServiceSpec/K8sServiceSpecForms/ExperimentalInput'
import { shouldFetchTagsSource } from '../K8sServiceSpec/ArtifactSource/artifactSourceUtils'
import type { ECSRunTaskStepInitialValues } from './ECSRunTaskStep'
import css from './ECSRunTaskStepInputSet.module.scss'

export const resetBuckets = (formik: FormikProps<ECSRunTaskStepInitialValues>, bucketPath: string): void => {
  const bucketValue = get(formik.values, bucketPath, '')
  if (getMultiTypeFromValue(bucketValue) === MultiTypeInputType.FIXED && bucketValue?.length) {
    formik.setFieldValue(bucketPath, '')
  }
}
export interface ECSRunTaskStepInputSetProps {
  initialValues: ECSRunTaskStepInitialValues
  allowableTypes: AllowedTypes
  inputSetData: {
    allValues?: ECSRunTaskStepInitialValues
    template?: ECSRunTaskStepInitialValues
    path?: string
    readonly?: boolean
  }
  formik?: FormikProps<ECSRunTaskStepInitialValues>
}

interface TaskDefinitionFieldsProps extends ECSRunTaskStepInputSetProps {
  prefixPath: string
  templatePath: string
  connectorType: ConnectorInfoDTO['type']
}
const TaskDefinitionFields = (props: TaskDefinitionFieldsProps) => {
  const { initialValues, formik, inputSetData, allowableTypes, prefixPath, templatePath, connectorType } = props
  const { template, readonly, allValues } = inputSetData

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [showRepoName, setShowRepoName] = useState(true)
  const [lastQueryData, setLastQueryData] = React.useState({
    connectorRef: '',
    region: ''
  })

  const fixedConnectorValue = defaultTo(
    get(initialValues, `${templatePath}.connectorRef`),
    get(allValues, `${templatePath}.connectorRef`)
  )
  const fixedRegionValue = defaultTo(
    get(initialValues, `${templatePath}.region`),
    get(allValues, `${templatePath}.region`)
  )

  const path = `${prefixPath}${templatePath}`

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions = (regionData?.resource || []).map((region: NameValuePair) => ({
    value: region.value,
    label: region.name
  }))

  const commonQueryParam = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef: fixedConnectorValue,
    region: fixedRegionValue
  }
  const {
    data: s3BucketList,
    loading: s3BucketDataLoading,
    refetch: refetchS3Buckets
  } = useGetBucketListForS3({
    queryParams: commonQueryParam,
    lazy: true
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

  const renderBucketNameField = (): React.ReactElement | null => {
    return (
      <div className={css.verticalSpacingInput}>
        <ExperimentalInput
          name={`${path}.bucketName`}
          disabled={readonly}
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

  return (
    <>
      {getMultiTypeFromValue(get(template, `${templatePath}.connectorRef`)) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <FormMultiTypeConnectorField
            disabled={readonly}
            name={`${path}.connectorRef`}
            selected={get(initialValues, `${templatePath}.connectorRef`, '')}
            label={getString('connector')}
            placeholder={''}
            setRefValue
            multiTypeProps={{
              allowableTypes,
              expressions
            }}
            width={391}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            type={connectorType}
            onChange={(selected, _itemType, multiType) => {
              const item = selected as unknown as { record?: ConnectorReferenceDTO; scope: Scope }
              const connectorRefValue =
                item.scope === Scope.ORG || item.scope === Scope.ACCOUNT
                  ? `${item.scope}.${item?.record?.identifier}`
                  : item.record?.identifier

              if (connectorRefValue !== get(formik?.values, `${path}.connectorRef`)) {
                if (formik) {
                  resetBuckets(formik, `${path}.bucketName`)
                }
              }
              // This is done because repo does not come in picture in case of Aws connector
              if (connectorType === 'Aws') {
                return
              }
              if (multiType === MultiTypeInputType.FIXED) {
                if (shouldDisplayRepositoryName(item)) {
                  setShowRepoName(false)
                } else {
                  setShowRepoName(true)
                }
              }
            }}
            gitScope={{
              repo: defaultTo(repoIdentifier, ''),
              branch: defaultTo(branch, ''),
              getDefaultFromOtherRepo: true
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(get(template, `${templatePath}.repoName`)) === MultiTypeInputType.RUNTIME && showRepoName && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={readonly}
            name={`${path}.repoName`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('common.repositoryName')}
          />
        </div>
      )}

      {getMultiTypeFromValue(get(template, `${templatePath}.branch`)) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <TextFieldInputSetView
            disabled={readonly}
            name={`${path}.branch`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('pipelineSteps.deploy.inputSet.branch')}
            fieldPath={`spec.taskDefinition.spec.branch`}
            template={template}
          />
        </div>
      )}

      {getMultiTypeFromValue(get(template, `${templatePath}.commitId`)) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={readonly}
            name={`${path}.commitId`}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            label={getString('pipelineSteps.commitIdValue')}
          />
        </div>
      )}

      {/** Start of ECS Run Task Request Definition specific fields */}

      {getMultiTypeFromValue(get(template, `${templatePath}.region`)) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <ExperimentalInput
            formik={formik}
            name={`${path}.region`}
            disabled={readonly}
            multiTypeInputProps={{
              selectProps: {
                usePortal: true,
                addClearBtn: !readonly,
                items: regions
              },
              expressions,
              allowableTypes,
              onChange: (selected: any) => {
                if (selected.value !== fixedRegionValue) {
                  if (formik) {
                    resetBuckets(formik, `${path}.bucketName`)
                  }
                }
              }
            }}
            useValue
            selectItems={regions}
            label={getString('regionLabel')}
          />
        </div>
      )}

      {getMultiTypeFromValue(get(template, `${templatePath}.bucketName`)) === MultiTypeInputType.RUNTIME &&
        renderBucketNameField()}

      {/** End of ECS Run Task Request Definition specific fields */}

      {getMultiTypeFromValue(get(template, `${templatePath}.paths`)) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <List
            formik={formik}
            labelClassName={css.listLabel}
            label={getString('fileFolderPathText')}
            name={`${path}.paths`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
            allowOnlyOne
          />
        </div>
      )}
    </>
  )
}

const ECSRunTaskStepInputSetModeFormikForm = (props: ECSRunTaskStepInputSetProps): React.ReactElement => {
  const { inputSetData, allowableTypes } = props
  const { template, path, readonly } = inputSetData

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <Layout.Vertical className={cx(css.inputWidth, css.layoutVerticalSpacing)}>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <FormMultiTypeDurationField
            name={`${prefix}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            disabled={readonly}
          />
        </div>
      )}

      {getMultiTypeFromValue(template?.spec?.taskDefinitionArn) === MultiTypeInputType.RUNTIME && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            name={`${prefix}spec.taskDefinitionArn`}
            label={getString('cd.steps.ecsRunTaskStep.ecsRunTaskDefinitionArn')}
            placeholder={getString('cd.steps.ecsRunTaskStep.ecsRunTaskDefinitionArnPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}

      <TaskDefinitionFields
        {...props}
        prefixPath={prefix}
        templatePath={'spec.taskDefinition.spec'}
        connectorType={ManifestToConnectorMap[defaultTo(template?.spec?.taskDefinition?.type, '')]}
      />

      <TaskDefinitionFields
        {...props}
        prefixPath={prefix}
        templatePath={'spec.runTaskRequestDefinition.spec'}
        connectorType={ManifestToConnectorMap[defaultTo(template?.spec?.runTaskRequestDefinition?.type, '')]}
      />
    </Layout.Vertical>
  )
}

export const ECSRunTaskStepInputSetMode = connect(ECSRunTaskStepInputSetModeFormikForm)
