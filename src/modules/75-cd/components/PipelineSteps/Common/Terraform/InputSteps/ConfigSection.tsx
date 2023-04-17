/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'

import { useParams } from 'react-router-dom'
import { get, map } from 'lodash-es'

import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormInput,
  Label,
  useToaster,
  SelectOption,
  Layout
} from '@harness/uicore'
import { connect, FormikContextType } from 'formik'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { isValueRuntimeInput } from '@common/utils/utils'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useGetRepositoriesDetailsForArtifactory } from 'services/cd-ng'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import FileStoreList from '@filestore/components/FileStoreList/FileStoreList'
import { fileTypes } from '@pipeline/components/StartupScriptSelection/StartupScriptInterface.types'
import type { TerraformData, TerraformProps } from '../TerraformInterfaces'
import { ConnectorMap, getPath } from '../../ConfigFileStore/ConfigFileStoreHelper'

import { AmazonS3RuntimeView } from '../../ConfigFileStore/AmazonS3Store/AmazonS3StoreRuntimeView'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function ConfigSectionRef<T extends TerraformData = TerraformData>(
  props: TerraformProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { expressions } = useVariablesExpression()
  const {
    inputSetData,
    readonly,
    initialValues,
    path,
    allowableTypes,
    formik,
    stepViewType,
    isBackendConfig,
    isConfig,
    allValues
  } = props

  const fieldPath = inputSetData?.template?.spec?.configuration ? 'configuration' : 'cloudCliConfiguration'

  const configPath = getPath(false, false, isBackendConfig, fieldPath)

  const configSpec = get(inputSetData?.template, configPath)
  const store = configSpec?.store

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const [connectorRepos, setConnectorRepos] = useState<SelectOption[]>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  let connectorVal = get(formik?.values, `${path}.${configPath}.store.spec.connectorRef`)
  if (!connectorVal) {
    connectorVal = get(props?.allValues, `${configPath}.store.spec.connectorRef`)
  }

  let repoName = get(formik?.values, `${path}.${configPath}.store.spec.repositoryName`)
  if (!repoName) {
    repoName = get(props?.allValues, `${configPath}.store.spec.repositoryName`)
  }
  let storeType = get(formik?.values, `${path}.${configPath}.store.type`)
  if (!storeType) {
    storeType = get(props?.allValues, `${configPath}.store.type`)
  }
  const reposRequired = getMultiTypeFromValue(configSpec?.store?.spec?.repositoryName) === MultiTypeInputType.RUNTIME
  const {
    data: ArtifactRepoData,
    loading: ArtifactRepoLoading,
    refetch: getArtifactRepos,
    error: ArtifactRepoError
  } = useGetRepositoriesDetailsForArtifactory({
    queryParams: {
      connectorRef: connectorVal,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (ArtifactRepoError) {
      showError(getRBACErrorMessage(ArtifactRepoError))
    }
  }, [ArtifactRepoError])

  useEffect(() => {
    if (
      reposRequired &&
      storeType === Connectors.ARTIFACTORY &&
      connectorVal &&
      getMultiTypeFromValue(connectorVal) === MultiTypeInputType.FIXED &&
      !ArtifactRepoData
    ) {
      getArtifactRepos()
    }

    if (ArtifactRepoData) {
      setConnectorRepos(map(ArtifactRepoData.data?.repositories, repo => ({ label: repo, value: repo })))
    }
  }, [ArtifactRepoData, connectorVal, storeType])

  const isRepoRuntime = isValueRuntimeInput(store?.spec?.repoName) && storeType !== Connectors.ARTIFACTORY

  return (
    <div>
      {configSpec?.store?.spec && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {isBackendConfig ? getString('pipelineSteps.backendConfig') : getString('cd.configurationFile')}
        </Label>
      )}

      {getMultiTypeFromValue(configSpec?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          accountIdentifier={accountId}
          selected={get(initialValues, `${configPath}.store.spec.connectorRef`, '')}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          multiTypeProps={{ allowableTypes, expressions }}
          type={ConnectorMap[store?.type]}
          name={`${path}.${configPath}.store.spec.connectorRef`}
          label={getString('connector')}
          placeholder={getString('select')}
          disabled={readonly}
          setRefValue
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
        />
      )}
      {isRepoRuntime && (
        <TextFieldInputSetView
          label={getString('pipelineSteps.repoName')}
          name={`${path}.${configPath}.store.spec.repoName`}
          placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={inputSetData?.template}
          fieldPath={`${configPath}.store.spec.repoName`}
        />
      )}

      {getMultiTypeFromValue(configSpec?.store?.spec?.branch) === MultiTypeInputType.RUNTIME && (
        <FormInput.MultiTextInput
          label={getString('pipelineSteps.deploy.inputSet.branch')}
          name={`${path}.${configPath}.store.spec.branch`}
          placeholder={getString('pipeline.manifestType.branchPlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
        />
      )}

      {getMultiTypeFromValue(configSpec?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME && (
        <FormInput.MultiTextInput
          label={getString('pipeline.manifestType.commitId')}
          name={`${path}.${configPath}.store.spec.commitId`}
          placeholder={getString('pipeline.manifestType.commitPlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
        />
      )}

      {store?.type === 'S3' && (
        <AmazonS3RuntimeView
          formik={formik}
          path={path}
          isConfig={isConfig}
          fieldPath={fieldPath}
          isBackendConfig={isBackendConfig}
          specFieldPath={`spec.${fieldPath}.spec`}
          template={inputSetData?.template}
          readonly={readonly}
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          allValues={allValues}
        />
      )}

      {getMultiTypeFromValue(configSpec?.store?.spec?.folderPath) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          label={getString('common.git.folderPath')}
          name={`${path}.${configPath}.store.spec.folderPath`}
          placeholder={getString('pipeline.manifestType.folderPathPlaceholder')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          fieldPath={`${configPath}.store.spec.folderPath`}
          template={inputSetData?.template}
        />
      )}

      {reposRequired && (
        <FormInput.MultiTypeInput
          label={getString('pipelineSteps.repoName')}
          name={`${path}.${configPath}.store.spec.repositoryName`}
          placeholder={getString(ArtifactRepoLoading ? 'common.loading' : 'cd.selectRepository')}
          disabled={readonly}
          useValue
          multiTypeInputProps={{
            selectProps: {
              allowCreatingNewItems: true,
              items: connectorRepos ? connectorRepos : []
            },
            expressions,
            allowableTypes
          }}
          selectItems={connectorRepos ? connectorRepos : []}
        />
      )}

      {store?.type === Connectors.ARTIFACTORY &&
        getMultiTypeFromValue(configSpec?.store?.spec?.artifactPaths) === MultiTypeInputType.RUNTIME && (
          <FormInput.MultiTextInput
            label={getString('pipeline.artifactPathLabel')}
            name={`${path}.${configPath}.store.spec.artifactPaths`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
            onChange={value => {
              formik?.setFieldValue(`${path}.${configPath}.store.spec.artifactPaths`, [value])
            }}
          />
        )}

      {store?.type === 'Harness' &&
        getMultiTypeFromValue(configSpec?.store?.spec?.files) === MultiTypeInputType.RUNTIME && (
          <Layout.Vertical className={stepCss.layoutVerticalSpacing}>
            <FileStoreList
              name={`${path}.${configPath}.store.spec.files`}
              type={fileTypes.FILE_STORE}
              allowOnlyOne={true}
              formik={formik}
            />
          </Layout.Vertical>
        )}

      {store?.type === 'Harness' &&
        getMultiTypeFromValue(configSpec?.store?.spec?.secretFiles) === MultiTypeInputType.RUNTIME && (
          <Layout.Vertical className={stepCss.layoutVerticalSpacing}>
            <FileStoreList
              name={`${path}.${configPath}.store.spec.secretFiles`}
              type={fileTypes.ENCRYPTED}
              allowOnlyOne={true}
              formik={formik}
            />
          </Layout.Vertical>
        )}
    </div>
  )
}

const ConfigSection = connect(ConfigSectionRef)
export default ConfigSection
