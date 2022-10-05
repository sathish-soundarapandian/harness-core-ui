/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'
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
import List from '@common/components/List/List'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { NameValuePair, useListAwsRegions } from 'services/portal'
import { GitConfigDTO, useGetBucketListForS3, useGetGCSBucketList } from 'services/cd-ng'
import { TriggerDefaultFieldList } from '@triggers/pages/triggers/utils/TriggersWizardPageUtils'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { CommandFlags } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { FileSelectList } from '@filestore/components/FileStoreList/FileStoreList'
import { SELECT_FILES_TYPE } from '@filestore/utils/constants'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  getDefaultQueryParam,
  getFinalQueryParamData,
  getFqnPath,
  isFieldfromTriggerTabDisabled,
  isNewServiceEntity,
  shouldDisplayRepositoryName
} from '../ManifestSourceUtils'
import { isFieldFixedType, isFieldRuntime } from '../../K8sServiceSpecHelper'
import ExperimentalInput from '../../K8sServiceSpecForms/ExperimentalInput'
import CustomRemoteManifestRuntimeFields from '../ManifestSourceRuntimeFields/CustomRemoteManifestRuntimeFields'
import ManifestCommonRuntimeFields from '../ManifestSourceRuntimeFields/ManifestCommonRuntimeFields'
import { isExecutionTimeFieldDisabled } from '../../ArtifactSource/artifactSourceUtils'
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
    stepViewType
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [showRepoName, setShowRepoName] = useState(true)
  const manifestStoreType = get(template, `${manifestPath}.spec.store.type`, null)

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

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
    serviceId: isNewServiceEntity(path as string) ? serviceIdentifier : undefined,
    fqnPath: isNewServiceEntity(path as string) ? getFqnPath(stageIdentifier, manifestPath as string) : undefined
  }

  const {
    data: s3BucketList,
    loading: s3bucketdataLoading,
    refetch: refetchS3Buckets
  } = useGetBucketListForS3({
    queryParams: {
      ...commonQueryParam,
      region: getFinalQueryParamData(
        getDefaultQueryParam(
          manifest?.spec?.store?.spec.region,
          get(initialValues, `${manifestPath}.spec.store.spec.region`, '')
        )
      )
    },
    lazy: true
  })

  const regions = (regionData?.resource || []).map((region: NameValuePair) => ({
    value: region.value,
    label: region.name
  }))

  const s3BucketOptions = Object.keys(s3BucketList || {}).map(item => ({
    label: item,
    value: item
  }))

  /*-------------------------Gcs Store related code --------------------------*/
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
                    manifest?.spec?.spec.connectorRef,
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
                items: s3bucketdataLoading
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
  const connectorRefPath =
    manifest?.spec?.store?.type === 'OciHelmChart'
      ? `${manifestPath}.spec.store.spec.config.spec.connectorRef`
      : `${manifestPath}.spec.store.spec.connectorRef`

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
            width={391}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            type={ManifestToConnectorMap[defaultTo(manifest?.spec?.store?.type, '')]}
            onChange={(selected, _itemType, multiType) => {
              const item = selected as unknown as { record?: GitConfigDTO; scope: Scope }
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
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.store.spec.repoName`, template) && showRepoName && (
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
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.repoName`, value)
            }}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.store.spec.branch`, template) && (
          <div className={css.verticalSpacingInput}>
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
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.store.spec.branch`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.store.spec.branch`)}
            type="String"
            variableName="branch"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.branch`, value)
            }}
          />
        )}
      </div>
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
            showAdvanced={true}
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
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.region`, value)
            }}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldFixedType(`${manifestPath}.spec.store.spec.connectorRef`, initialValues) &&
        isFieldFixedType(`${manifestPath}.spec.store.spec.region`, initialValues) ? (
          renderBucketListforS3Gcs()
        ) : (
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
            showAdvanced={true}
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
            showAdvanced={true}
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
            showAdvanced={true}
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
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.folderPath`, value)
            }}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.chartVersion`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(fromTrigger ? 'chartVersion' : `${manifestPath}.spec.chartVersion`)}
              name={`${path}.${manifestPath}.spec.chartVersion`}
              multiTextInputProps={{
                ...(fromTrigger && { value: TriggerDefaultFieldList.chartVersion }),
                expressions,
                allowableTypes
              }}
              label={getString('pipeline.manifestType.http.chartVersion')}
            />
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
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.chartVersion`, value)
            }}
          />
        )}
      </div>
      {isFieldRuntime(`${manifestPath}.spec.valuesPaths`, template) && (
        <div className={css.verticalSpacingInput}>
          {manifestStoreType === ManifestStoreMap.Harness ? (
            <FileSelectList
              labelClassName={css.listLabel}
              label={getString('pipeline.manifestType.valuesYamlPath')}
              name={`${path}.${manifestPath}.spec.valuesPaths`}
              placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
              disabled={isFieldDisabled(`${manifestPath}.spec.valuesPaths`)}
              style={{ marginBottom: 'var(--spacing-small)' }}
              expressions={expressions}
              isNameOfArrayType
              type={SELECT_FILES_TYPE.FILE_STORE}
              formik={formik}
            />
          ) : (
            <List
              labelClassName={css.listLabel}
              label={getString('pipeline.manifestType.valuesYamlPath')}
              name={`${path}.${manifestPath}.spec.valuesPaths`}
              placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
              disabled={isFieldDisabled(`${manifestPath}.spec.valuesPaths`)}
              style={{ marginBottom: 'var(--spacing-small)' }}
              expressions={expressions}
              isNameOfArrayType
            />
          )}
        </div>
      )}
      <CustomRemoteManifestRuntimeFields {...props} />
      <ManifestCommonRuntimeFields {...props} />
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
            showAdvanced={true}
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
