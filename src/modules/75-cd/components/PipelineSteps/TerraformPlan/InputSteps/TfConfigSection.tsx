/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import cx from 'classnames'

import { useParams } from 'react-router-dom'
import { get, map } from 'lodash-es'
import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormInput,
  Label,
  SelectOption,
  useToaster
} from '@wings-software/uicore'
import { connect } from 'formik'
import { Color } from '@harness/design-system'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useGetRepositoriesDetailsForArtifactory } from 'services/cd-ng'
import type { TerraformPlanProps } from '../../Common/Terraform/TerraformInterfaces'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function ConfigSectionRef(props: TerraformPlanProps & { formik?: any }): React.ReactElement {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { inputSetData, readonly, initialValues, path, allowableTypes, formik } = props

  const config = inputSetData?.template?.spec?.configuration
  const store = config?.configFiles?.store
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()
  const [connectorRepos, setConnectorRepos] = useState<SelectOption[]>()
  let connectorVal = get(formik.values, `${path}.spec.configuration.configFiles.store.spec.connectorRef`)
  if (!connectorVal) {
    connectorVal = props?.allValues?.spec?.configuration?.configFiles?.store?.spec?.connectorRef
  }
  let repoName = get(formik.values, `${path}.spec.configuration.configFiles.store.spec.repositoryName`)
  if (!repoName) {
    repoName = get(props?.allValues, `spec.configuration.configFiles.store.spec.repositoryName`)
  }
  let storeType = get(formik?.values, `${path}.spec.configuration.configFiles.store.type`)
  if (!storeType) {
    storeType = get(props?.allValues, `spec.configuration.configFiles.store.type`)
  }
  const reposRequired =
    getMultiTypeFromValue(config?.configFiles?.store?.spec?.repositoryName) === MultiTypeInputType.RUNTIME
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

  return (
    <>
      {(config?.configFiles?.store?.spec?.connectorRef ||
        config?.workspace ||
        config?.configFiles?.store?.spec?.branch ||
        config?.configFiles?.store?.spec?.commitId ||
        config?.configFiles?.store?.spec?.folderPath) && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {getString('cd.configurationFile')}
        </Label>
      )}
      {getMultiTypeFromValue(config?.workspace) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${path}.spec.configuration.workspace`}
            placeholder={getString('pipeline.terraformStep.workspace')}
            label={getString('pipelineSteps.workspace')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      {getMultiTypeFromValue(config?.configFiles?.store?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeConnectorField
            accountIdentifier={accountId}
            selected={get(initialValues, 'spec.configuration.configFiles.store.spec.connectorRef', '')}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            multiTypeProps={{ allowableTypes, expressions }}
            width={400}
            type={
              store?.type === Connectors.ARTIFACTORY
                ? [Connectors.ARTIFACTORY]
                : [Connectors.GIT, Connectors.GITHUB, Connectors.GITLAB, Connectors.BITBUCKET]
            }
            name={`${path}.spec.configuration.configFiles.store.spec.connectorRef`}
            label={getString('connector')}
            placeholder={getString('select')}
            disabled={readonly}
            setRefValue
            gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          />
        </div>
      )}

      {getMultiTypeFromValue(config?.configFiles?.store?.spec?.branch) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipelineSteps.deploy.inputSet.branch')}
            name={`${path}.spec.configuration.configFiles.store.spec.branch`}
            placeholder={getString('pipeline.manifestType.branchPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(config?.configFiles?.store?.spec?.commitId) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('pipeline.manifestType.commitId')}
            name={`${path}.spec.configuration.configFiles.store.spec.commitId`}
            placeholder={getString('pipeline.manifestType.commitPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}

      {getMultiTypeFromValue(config?.configFiles?.store?.spec?.folderPath) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            label={getString('common.git.folderPath')}
            name={`${path}.spec.configuration.configFiles.store.spec.folderPath`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}

      {reposRequired && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTypeInput
            label={getString('pipelineSteps.repoName')}
            name={`${path}.spec.configuration.configFiles.store.spec.repositoryName`}
            placeholder={getString(ArtifactRepoLoading ? 'common.loading' : 'cd.selectRepository')}
            disabled={readonly}
            selectItems={connectorRepos ? connectorRepos : []}
            useValue
            multiTypeInputProps={{
              selectProps: {
                allowCreatingNewItems: true,
                items: connectorRepos ? connectorRepos : []
              },
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}

      {store?.type === Connectors.ARTIFACTORY &&
        getMultiTypeFromValue(config?.configFiles?.store?.spec?.artifactPaths) === MultiTypeInputType.RUNTIME && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.MultiTextInput
              label={getString('pipeline.artifactPathLabel')}
              name={`${path}.spec.configuration.configFiles.store.spec.artifactPaths`}
              placeholder={getString('pipeline.manifestType.pathPlaceholder')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              onChange={value =>
                formik?.setFieldValue(`${path}.spec.configuration.configFiles.store.spec.artifactPaths`, [value])
              }
            />
          </div>
        )}
    </>
  )
}

const ConfigSection = connect(ConfigSectionRef)
export default ConfigSection
