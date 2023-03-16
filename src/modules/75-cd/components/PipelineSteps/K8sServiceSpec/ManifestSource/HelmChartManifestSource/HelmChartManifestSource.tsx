/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { FormError, FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType, Text } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { defaultTo, get } from 'lodash-es'
import {
  ManifestDataType,
  ManifestStoreMap,
  ManifestToConnectorMap
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ManifestSourceBase, ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeCheckboxField } from '@common/components'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { NameValuePair, useListAwsRegions } from 'services/portal'
import { useGetBucketsInManifests, useGetGCSBucketList, useGetHelmChartVersionDetails } from 'services/cd-ng'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import type { CommandFlags } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useMutateAsGet } from '@common/hooks'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { FileUsage } from '@filestore/interfaces/FileStore'
import {
  getDefaultQueryParam,
  getFinalQueryParamData,
  getFqnPath,
  getFqnPathForChart,
  getManifestFieldFqnPath,
  isFieldfromTriggerTabDisabled
} from '../ManifestSourceUtils'
import { isFieldFixedType, isFieldRuntime } from '../../K8sServiceSpecHelper'
import ExperimentalInput from '../../K8sServiceSpecForms/ExperimentalInput'
import CustomRemoteManifestRuntimeFields from '../ManifestSourceRuntimeFields/CustomRemoteManifestRuntimeFields'
import ManifestCommonRuntimeFields from '../ManifestSourceRuntimeFields/ManifestCommonRuntimeFields'
import {
  getYamlData,
  isExecutionTimeFieldDisabled,
  isNewServiceEnvEntity
} from '../../ArtifactSource/artifactSourceUtils'
import MultiTypeListOrFileSelectList from '../MultiTypeListOrFileSelectList'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const Content = (props: ManifestSourceRenderProps): React.ReactElement => {
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
    serviceIdentifier,
    stepViewType,
    pipelineIdentifier,
    fileUsage = FileUsage.MANIFEST_FILE
  } = props
  const { getString } = useStrings()
  const { NG_CDS_HELM_SUB_CHARTS } = useFeatureFlags()
  const { expressions } = useVariablesExpression()
  const { getRBACErrorMessage } = useRBACError()
  const manifestStoreType = get(template, `${manifestPath}.spec.store.type`, null)

  const connectorRefPath =
    manifest?.spec?.store?.type === 'OciHelmChart'
      ? `${manifestPath}.spec.store.spec.config.spec.connectorRef`
      : `${manifestPath}.spec.store.spec.connectorRef`

  const folderPath =
    manifest?.spec?.store?.type === 'OciHelmChart'
      ? `${manifestPath}.spec.store.spec.basePath`
      : `${manifestPath}.spec.store.spec.folderPath`

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  const {
    data: chartVersionData,
    loading: loadingChartVersions,
    refetch: refetchChartVersions,
    error: chartVersionsError
  } = useGetHelmChartVersionDetails({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      serviceId: serviceIdentifier,
      fqnPath: getFqnPathForChart(stageIdentifier, manifest?.identifier as string),
      connectorRef: get(initialValues, connectorRefPath),
      chartName: get(initialValues, `${manifestPath}.spec.chartName`),
      region: get(initialValues, `${manifestPath}.spec.store.spec.region`),
      bucketName: get(initialValues, `${manifestPath}.spec.store.spec.bucketName`),
      folderPath: get(initialValues, folderPath)
    },
    lazy: true
  })

  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')
  const fqnPathManifestPath = defaultTo(
    manifestPath?.split('[')[0].concat(`.${get(initialValues, `${manifestPath}.identifier`)}`),
    ''
  )
  const bucketListAPIQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef: getFinalQueryParamData(
      getDefaultQueryParam(
        manifest?.spec?.store?.spec.connectorRef,
        get(initialValues, `${manifestPath}.spec.store.spec.connectorRef`, '')
      )
    ),
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
    lazy: true
  })

  const regions = (regionData?.resource || []).map((region: NameValuePair) => ({
    value: region.value,
    label: region.name
  }))

  const chartVersions = (chartVersionData?.data?.helmChartVersions || []).map((chartVersion: string) => ({
    value: chartVersion,
    label: chartVersion
  }))

  const s3BucketOptions = React.useMemo(() => {
    return Object.keys(s3BucketList?.data || {}).map(item => ({
      label: item,
      value: item
    }))
  }, [s3BucketList?.data])

  /*-------------------------Gcs Store related code --------------------------*/
  const commonQueryParam = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    connectorRef: getFinalQueryParamData(
      getDefaultQueryParam(
        manifest?.spec?.store?.spec.connectorRef,
        get(initialValues, `${manifestPath}.spec.store.spec.connectorRef`, '')
      )
    ),
    serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
    fqnPath: isNewServiceEnvEntity(path as string) ? getFqnPath(stageIdentifier, manifestPath as string) : undefined
  }

  const {
    data: gcsBucketData,
    loading: gcsBucketLoading,
    refetch: refetchGcsBucket
  } = useGetGCSBucketList({
    queryParams: commonQueryParam,
    lazy: true
  })

  const bucketOptions = Object.keys(gcsBucketData?.data || {}).map(item => ({
    label: item,
    value: item
  }))
  /*-------------------------Gcs Store related code --------------------------*/

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

  const renderBucketListforS3Gcs = (): React.ReactElement | null => {
    if (manifestStoreType === ManifestStoreMap.S3) {
      return (
        <div className={css.verticalSpacingInput}>
          <ExperimentalInput
            name={`${path}.${manifestPath}.spec.store.spec.bucketName`}
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.bucketName`)}
            formik={formik}
            label={getString('pipeline.manifestType.bucketName')}
            placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
            multiTypeInputProps={{
              onFocus: () => {
                if (
                  !s3BucketList?.data &&
                  getDefaultQueryParam(
                    manifest?.spec?.store.spec.connectorRef,
                    get(initialValues, `${manifestPath}.spec.store.spec.connectorRef`, '')
                  ) &&
                  getDefaultQueryParam(
                    manifest?.spec?.store?.spec.region,
                    get(initialValues, `${manifestPath}.spec.store.spec.region`, '')
                  )
                ) {
                  refetchS3Buckets()
                }
              },
              selectProps: {
                usePortal: true,
                addClearBtn: !readonly,
                items: s3BucketDataLoading
                  ? [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
                  : s3BucketOptions,

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
    } else if (manifestStoreType === ManifestStoreMap.Gcs) {
      return (
        <div className={css.verticalSpacingInput}>
          <ExperimentalInput
            name={`${path}.${manifestPath}.spec.store.spec.bucketName`}
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.bucketName`)}
            formik={formik}
            label={getString('pipeline.manifestType.bucketName')}
            placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
            multiTypeInputProps={{
              onFocus: () => {
                if (
                  !gcsBucketData?.data &&
                  getDefaultQueryParam(
                    manifest?.spec?.store.spec.connectorRef,
                    get(initialValues, `${manifestPath}.spec.store.spec.connectorRef`, '')
                  )
                ) {
                  refetchGcsBucket()
                }
              },
              selectProps: {
                usePortal: true,
                addClearBtn: !readonly,
                items: gcsBucketLoading
                  ? [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }]
                  : bucketOptions,

                allowCreatingNewItems: true
              },
              expressions,
              allowableTypes
            }}
            useValue
            selectItems={bucketOptions}
          />
        </div>
      )
    }
    return null
  }

  const renderCommandFlags = (commandFlagPath: string): React.ReactElement => {
    const commandFlags = get(template, commandFlagPath)

    return commandFlags?.map((helmCommandFlag: CommandFlags, helmFlagIdx: number) => {
      if (isFieldRuntime(`${manifestPath}.spec.commandFlags[${helmFlagIdx}].flag`, template)) {
        return (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${manifestPath}.spec.commandFlags[${helmFlagIdx}].flag`)}
              name={`${path}.${manifestPath}.spec.commandFlags[${helmFlagIdx}].flag`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={`${helmCommandFlag.commandType}: ${getString('flag')}`}
            />
          </div>
        )
      }
    })
  }

  // this OR condition is for OCI helm connector

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
            width={400}
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
        {isFieldRuntime(`${manifestPath}.spec.store.spec.repoName`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.repoName`)}
              name={`${path}.${manifestPath}.spec.store.spec.repoName`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('common.repositoryName')}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.store.spec.repoName`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.store.spec.repoName`)}
            type="String"
            variableName="repoName"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.repoName`, value)
            }}
          />
        )}
      </div>

      {isFieldRuntime(`${manifestPath}.spec.store.spec.branch`, template) && (
        <TextFieldInputSetView
          disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.branch`)}
          name={`${path}.${manifestPath}.spec.store.spec.branch`}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          label={getString('pipelineSteps.deploy.inputSet.branch')}
          fieldPath={`${manifestPath}.spec.store.spec.branch`}
          template={template}
          className={cx(css.fieldAndOptionsWidth, css.verticalSpacingInput)}
        />
      )}

      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.store.spec.commitId`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.commitId`)}
              name={`${path}.${manifestPath}.spec.store.spec.commitId`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('pipelineSteps.commitIdValue')}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.store.spec.commitId`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.store.spec.commitId`)}
            type="String"
            variableName="commitId"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.commitId`, value)
            }}
          />
        )}
      </div>
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
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.region`, value)
            }}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldFixedType(`${manifestPath}.spec.store.spec.connectorRef`, initialValues) &&
        isFieldFixedType(`${manifestPath}.spec.store.spec.region`, initialValues)
          ? renderBucketListforS3Gcs()
          : isFieldRuntime(`${manifestPath}.spec.store.spec.bucketName`, template) && (
              <div className={css.verticalSpacingInput}>
                <FormInput.MultiTextInput
                  disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.bucketName`)}
                  name={`${path}.${manifestPath}.spec.store.spec.bucketName`}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                  label={getString('pipeline.manifestType.bucketName')}
                  placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
                />
              </div>
            )}
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
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.bucketName`, value)
            }}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.store.spec.basePath`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.basePath`)}
              name={`${path}.${manifestPath}.spec.store.spec.basePath`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('pipeline.manifestType.basePath')}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.store.spec.basePath`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.store.spec.basePath`)}
            type="String"
            variableName="basePath"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.basePath`, value)
            }}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.chartName`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${manifestPath}.spec.chartName`)}
              name={`${path}.${manifestPath}.spec.chartName`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('pipeline.manifestType.http.chartName')}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.chartName`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.chartName`)}
            type="String"
            variableName="chartName"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.chartName`, value)
            }}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.store.spec.folderPath`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.folderPath`)}
              name={`${path}.${manifestPath}.spec.store.spec.folderPath`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('chartPath')}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.store.spec.folderPath`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.store.spec.folderPath`)}
            type="String"
            variableName="folderPath"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.folderPath`, value)
            }}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.chartVersion`, template) && (
          <div className={css.verticalSpacingInput}>
            {isNewServiceEnvEntity(path as string) && manifest?.spec?.store?.type !== 'OciHelmChart' ? (
              <>
                <ExperimentalInput
                  formik={formik}
                  name={`${path}.${manifestPath}.spec.chartVersion`}
                  disabled={isFieldDisabled(fromTrigger ? 'chartVersion' : `${manifestPath}.spec.chartVersion`)}
                  placeholder={getString('pipeline.manifestType.http.chartVersionPlaceHolder')}
                  multiTypeInputProps={{
                    onFocus: () => {
                      if (!chartVersions?.length) {
                        refetchChartVersions()
                      }
                    },
                    selectProps: {
                      usePortal: true,
                      addClearBtn: !readonly,
                      allowCreatingNewItems: true,
                      ...(fromTrigger && { value: TriggerDefaultFieldList.chartVersion }),
                      items: chartVersions,
                      noResults: (
                        <Text padding={'small'}>
                          {loadingChartVersions
                            ? getString('pipeline.manifestType.http.loadingChartVersion')
                            : getString('pipeline.manifestType.http.noResultsChartVersion')}
                        </Text>
                      )
                    },
                    expressions,
                    allowableTypes
                  }}
                  useValue
                  selectItems={chartVersions}
                  label={getString('pipeline.manifestType.http.chartVersion')}
                />
                {chartVersionsError &&
                !get(formik?.values, `${path}.${manifestPath}.spec.chartVersion`) &&
                !loadingChartVersions ? (
                  <FormError
                    errorMessage={
                      <Text
                        lineClamp={1}
                        width={380}
                        margin={{ bottom: 'medium' }}
                        intent={Intent.DANGER}
                        tooltipProps={{ isDark: true, popoverClassName: css.tooltip }}
                      >
                        {getRBACErrorMessage(chartVersionsError)}
                      </Text>
                    }
                    name={`${path}.${manifestPath}.spec.chartVersion`}
                  ></FormError>
                ) : null}
              </>
            ) : (
              <FormInput.MultiTextInput
                disabled={isFieldDisabled(fromTrigger ? 'chartVersion' : `${manifestPath}.spec.chartVersion`)}
                name={`${path}.${manifestPath}.spec.chartVersion`}
                multiTextInputProps={{
                  ...(fromTrigger && { value: TriggerDefaultFieldList.chartVersion }),
                  expressions,
                  allowableTypes
                }}
                label={getString('pipeline.manifestType.http.chartVersion')}
                placeholder={getString('pipeline.manifestType.http.chartVersionPlaceHolder')}
              />
            )}
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.chartVersion`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.chartVersion`)}
            type="String"
            variableName="chartVersion"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.chartVersion`, value)
            }}
          />
        )}
      </div>

      {NG_CDS_HELM_SUB_CHARTS && isFieldRuntime(`${manifestPath}.spec.subChartName`, template) && (
        <TextFieldInputSetView
          template={template}
          fieldPath={`${manifestPath}.spec.subChartName`}
          disabled={isFieldDisabled(`${manifestPath}.spec.subChartName`)}
          name={`${path}.${manifestPath}.spec.subChartName`}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          className={css.inputFieldLayout}
          label={getString('pipeline.manifestType.subChart')}
          placeholder={getString('pipeline.manifestType.subChartPlaceholder')}
        />
      )}

      {isFieldRuntime(`${manifestPath}.spec.valuesPaths`, template) && (
        <div className={css.verticalSpacingInput}>
          <MultiTypeListOrFileSelectList
            allowableTypes={allowableTypes}
            disabled={isFieldDisabled(`${manifestPath}.spec.valuesPaths`)}
            name={`${path}.${manifestPath}.spec.valuesPaths`}
            label={getString('pipeline.manifestType.valuesYamlPath')}
            manifestStoreType={manifestStoreType}
            stepViewType={stepViewType}
            formik={formik}
            fileUsage={fileUsage}
            placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
            isNameOfArrayType
          />
        </div>
      )}
      <CustomRemoteManifestRuntimeFields {...props} />
      <ManifestCommonRuntimeFields {...props} fileUsage={fileUsage} />

      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.enableDeclarativeRollback`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormMultiTypeCheckboxField
              disabled={isFieldDisabled(`${manifestPath}.spec.enableDeclarativeRollback`)}
              name={`${path}.${manifestPath}.spec.enableDeclarativeRollback`}
              label={getString('pipeline.manifestType.enableDeclarativeRollback')}
              setToFalseWhenEmpty={true}
              multiTypeTextbox={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.enableDeclarativeRollback`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.enableDeclarativeRollback`)}
            type="String"
            variableName="enableDeclarativeRollback"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.enableDeclarativeRollback`, value)
            }}
          />
        )}
      </div>

      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.skipResourceVersioning`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormMultiTypeCheckboxField
              disabled={isFieldDisabled(`${manifestPath}.spec.skipResourceVersioning`)}
              name={`${path}.${manifestPath}.spec.skipResourceVersioning`}
              label={getString('skipResourceVersion')}
              setToFalseWhenEmpty={true}
              multiTypeTextbox={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.skipResourceVersioning`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.skipResourceVersioning`)}
            type="String"
            variableName="skipResourceVersioning"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.skipResourceVersioning`, value)
            }}
          />
        )}
      </div>

      {renderCommandFlags(`${manifestPath}.spec.commandFlags`)}
    </Layout.Vertical>
  )
}

export class HelmChartManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ManifestDataType.HelmChart

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    if (!props.isManifestsRuntime) {
      return null
    }

    return <Content {...props} />
  }
}
