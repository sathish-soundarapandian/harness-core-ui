/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import {
  Layout,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  StepProps,
  AllowedTypes
} from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { CommonManifestDataType, ManifestTypes } from '../../ManifestInterface'
import { gitFetchTypeList, GitFetchTypes, GitRepoName, ManifestStoreMap } from '../../Manifesthelper'
import GitRepositoryName from '../GitRepositoryName/GitRepositoryName'
import DragnDropPaths from '../../DragnDropPaths'
import { filePathWidth } from '../ManifestUtils'
import css from './CommonManifestDetails.module.scss'

interface ManifestDetailsCoreSectionProps {
  formik: FormikProps<CommonManifestDataType>
  expressions: string[]
  allowableTypes: AllowedTypes
  selectedManifest: ManifestTypes | null
  isReadonly?: boolean
}

const getAccountUrl = (prevStepData?: ConnectorConfigDTO): string => {
  return prevStepData?.connectorRef ? prevStepData?.connectorRef?.connector?.spec?.url : prevStepData?.url
}

export function ManifestDetailsCoreSection({
  formik,
  expressions,
  allowableTypes,
  prevStepData,
  isReadonly = false
}: StepProps<ConnectorConfigDTO> & ManifestDetailsCoreSectionProps): React.ReactElement {
  const { getString } = useStrings()

  const gitConnectionType: string = prevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    prevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    prevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  const accountUrl = connectionType === GitRepoName.Account ? getAccountUrl(prevStepData) : null

  return (
    <>
      <div className={css.halfWidth}>
        <FormInput.Text
          name="identifier"
          label={getString('pipeline.manifestType.manifestIdentifier')}
          placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
        />
      </div>

      {!!(connectionType === GitRepoName.Account && accountUrl) && (
        <GitRepositoryName
          accountUrl={accountUrl}
          expressions={expressions}
          allowableTypes={allowableTypes}
          fieldValue={formik.values?.repoName}
          changeFieldValue={(value: string) => formik.setFieldValue('repoName', value)}
          isReadonly={isReadonly}
        />
      )}
      <Layout.Horizontal spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
        <div className={css.halfWidth}>
          <FormInput.Select
            name="gitFetchType"
            label={getString('pipeline.manifestType.gitFetchTypeLabel')}
            items={gitFetchTypeList}
          />
        </div>

        {formik.values?.gitFetchType === GitFetchTypes.Branch && (
          <div
            className={cx(css.halfWidth, {
              [css.runtimeInput]: getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME
            })}
          >
            <FormInput.MultiTextInput
              multiTextInputProps={{ expressions, allowableTypes }}
              label={getString('pipelineSteps.deploy.inputSet.branch')}
              placeholder={getString('pipeline.manifestType.branchPlaceholder')}
              name="branch"
            />

            {getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={formik.values?.branch as string}
                type="String"
                variableName="branch"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => formik.setFieldValue('branch', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        )}

        {formik.values?.gitFetchType === GitFetchTypes.Commit && (
          <div
            className={cx(css.halfWidth, {
              [css.runtimeInput]: getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME
            })}
          >
            <FormInput.MultiTextInput
              multiTextInputProps={{ expressions, allowableTypes }}
              label={getString('pipeline.manifestType.commitId')}
              placeholder={getString('pipeline.manifestType.commitPlaceholder')}
              name="commitId"
            />

            {getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                value={formik.values?.commitId as string}
                type="String"
                variableName="commitId"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => formik.setFieldValue('commitId', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        )}
      </Layout.Horizontal>
      <div
        className={cx({
          [css.runtimeInput]: getMultiTypeFromValue(formik.values?.paths) === MultiTypeInputType.RUNTIME
        })}
      >
        <DragnDropPaths
          formik={formik}
          expressions={expressions}
          allowableTypes={allowableTypes}
          fieldPath="paths"
          pathLabel={getString('fileFolderPathText')}
          placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
          defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
          dragDropFieldWidth={filePathWidth}
        />
        {getMultiTypeFromValue(formik.values.paths) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={formik.values.paths}
            type={getString('string')}
            variableName={'paths'}
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={val => formik?.setFieldValue('paths', val)}
            isReadonly={isReadonly}
          />
        )}
      </div>
    </>
  )
}
