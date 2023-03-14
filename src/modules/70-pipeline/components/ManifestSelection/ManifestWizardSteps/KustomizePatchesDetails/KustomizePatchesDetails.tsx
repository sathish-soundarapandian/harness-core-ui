/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Text,
  Layout,
  Button,
  FormInput,
  StepProps,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Formik,
  ButtonVariation,
  AllowedTypes,
  FormikForm
} from '@harness/uicore'
import * as Yup from 'yup'
import { get, isEmpty, set, defaultTo } from 'lodash-es'
import { FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'

import type {
  KustomizePatchDataType,
  KustomizePatchManifestLastStepPrevStepData,
  ManifestTypes
} from '../../ManifestInterface'

import {
  gitFetchTypeList,
  GitFetchTypes,
  GitRepoName,
  ManifestDataType,
  ManifestIdentifierValidation,
  ManifestStoreMap
} from '../../Manifesthelper'
import GitRepositoryName from '../GitRepositoryName/GitRepositoryName'
import { getRepositoryName, removeEmptyFieldsFromStringArray } from '../ManifestUtils'
import DragnDropPaths from '../../DragnDropPaths'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface KustomizePathPropTypes {
  key?: string
  name?: string
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  selectedManifest: ManifestTypes | null
  isReadonly?: boolean
  editManifestModePrevStepData?: KustomizePatchManifestLastStepPrevStepData
}

const submitKustomizePatchData = (
  formData: KustomizePatchDataType & { store?: string; connectorRef?: string },
  connectionType: string
) => {
  const manifestObj: ManifestConfigWrapper = {
    manifest: {
      identifier: formData.identifier,
      type: ManifestDataType.KustomizePatches,
      spec: {
        store: {
          type: formData?.store,
          spec: {
            connectorRef: formData?.connectorRef,
            gitFetchType: formData?.gitFetchType,
            paths:
              typeof formData?.paths === 'string' ? formData?.paths : formData?.paths?.map((path: any) => path.path)
          }
        }
      }
    }
  }

  if (connectionType === GitRepoName.Account) {
    set(manifestObj, 'manifest.spec.store.spec.repoName', formData?.repoName)
  }

  if (manifestObj?.manifest?.spec?.store) {
    if (formData?.gitFetchType === 'Branch') {
      set(manifestObj, 'manifest.spec.store.spec.branch', formData?.branch)
    } else if (formData?.gitFetchType === 'Commit') {
      set(manifestObj, 'manifest.spec.store.spec.commitId', formData?.commitId)
    }
  }
  return manifestObj
}

const renderBranch = (
  formik: any,
  isReadonly: boolean,
  label: string,
  placeholder: string,
  expressions?: any,
  allowableTypes?: AllowedTypes
): React.ReactElement => {
  return (
    <div
      className={cx(helmcss.halfWidth, {
        [helmcss.runtimeInput]: getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME
      })}
    >
      <FormInput.MultiTextInput
        label={label}
        placeholder={placeholder}
        multiTextInputProps={{ expressions, allowableTypes }}
        name="branch"
      />
      {getMultiTypeFromValue(formik.values?.branch) === MultiTypeInputType.RUNTIME && (
        <ConfigureOptions
          style={{ alignSelf: 'center' }}
          value={formik.values?.branch as string}
          type="String"
          variableName="branch"
          showRequiredField={false}
          showDefaultField={false}
          onChange={value => formik.setFieldValue('branch', value)}
          isReadonly={isReadonly}
        />
      )}
    </div>
  )
}

const renderCommitId = (
  formik: any,
  isReadonly: boolean,
  label: string,
  placeholder: string,
  expressions?: any,
  allowableTypes?: AllowedTypes
): React.ReactElement => {
  return (
    <div
      className={cx(helmcss.halfWidth, {
        [helmcss.runtimeInput]: getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME
      })}
    >
      <FormInput.MultiTextInput
        label={label}
        placeholder={placeholder}
        multiTextInputProps={{ expressions, allowableTypes }}
        name="commitId"
      />
      {getMultiTypeFromValue(formik.values?.commitId) === MultiTypeInputType.RUNTIME && (
        <ConfigureOptions
          style={{ alignSelf: 'center' }}
          value={formik.values?.commitId as string}
          type="String"
          variableName="commitId"
          showRequiredField={false}
          showDefaultField={false}
          onChange={value => formik.setFieldValue('commitId', value)}
          isReadonly={isReadonly}
        />
      )}
    </div>
  )
}

function KustomizePatchDetails({
  stepName,
  expressions,
  allowableTypes,
  initialValues,
  selectedManifest,
  prevStepData,
  previousStep,
  isReadonly = false,
  handleSubmit,
  manifestIdsList,
  editManifestModePrevStepData
}: StepProps<ConnectorConfigDTO> & KustomizePathPropTypes): React.ReactElement {
  const { getString } = useStrings()

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)

  const gitConnectionType: string = modifiedPrevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    modifiedPrevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    modifiedPrevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  const accountUrl =
    connectionType === GitRepoName.Account
      ? modifiedPrevStepData?.connectorRef
        ? modifiedPrevStepData?.connectorRef?.connector?.spec?.url
        : modifiedPrevStepData?.url
      : null

  const submitFormData = (formData: KustomizePatchDataType & { store?: string; connectorRef?: string }): void => {
    const manifestObj = submitKustomizePatchData(formData, connectionType)
    handleSubmit(manifestObj)
  }

  const getInitialValues = (): KustomizePatchDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        repoName: getRepositoryName(modifiedPrevStepData, initialValues),
        paths:
          typeof specValues.paths === 'string'
            ? specValues.paths
            : removeEmptyFieldsFromStringArray(specValues.paths)?.map((path: string) => ({
                id: uuid('', nameSpace()),
                path: path
              }))
      }
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      repoName: getRepositoryName(modifiedPrevStepData, initialValues),
      gitFetchType: 'Branch',
      paths: [{ path: '', id: uuid('', nameSpace()) }]
    }
  }

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStore}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="kustomizePath"
        validationSchema={Yup.object().shape({
          ...ManifestIdentifierValidation(
            getString,
            manifestIdsList,
            initialValues?.identifier,
            getString('pipeline.uniqueName')
          ),
          branch: Yup.string().when('gitFetchType', {
            is: 'Branch',
            then: Yup.string().trim().required(getString('validation.branchName'))
          }),
          commitId: Yup.string().when('gitFetchType', {
            is: 'Commit',
            then: Yup.string().trim().required(getString('validation.commitId'))
          }),
          paths: Yup.lazy((value): Yup.Schema<unknown> => {
            if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
              return Yup.array().of(
                Yup.object().shape({
                  path: Yup.string().min(1).required(getString('pipeline.manifestType.pathRequired'))
                })
              )
            }
            return Yup.string().required(getString('pipeline.manifestType.pathRequired'))
          }),
          repoName: Yup.string().test('repoName', getString('common.validation.repositoryName'), value => {
            if (
              connectionType === GitRepoName.Repo ||
              getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
            ) {
              return true
            }
            return !isEmpty(value) && value?.length > 0
          })
        })}
        onSubmit={formData => {
          submitFormData({
            ...modifiedPrevStepData,
            ...formData,
            connectorRef: modifiedPrevStepData?.connectorRef
              ? getMultiTypeFromValue(modifiedPrevStepData?.connectorRef) !== MultiTypeInputType.FIXED
                ? modifiedPrevStepData?.connectorRef
                : modifiedPrevStepData?.connectorRef?.value
              : modifiedPrevStepData?.identifier
              ? modifiedPrevStepData?.identifier
              : ''
          })
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: KustomizePatchDataType }) => (
          <FormikForm>
            <div className={helmcss.helmGitForm}>
              <Layout.Horizontal flex spacing="huge">
                <div className={helmcss.halfWidth}>
                  <FormInput.Text
                    name="identifier"
                    label={getString('pipeline.manifestType.manifestIdentifier')}
                    placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                  />
                </div>
              </Layout.Horizontal>
              {!!(connectionType === GitRepoName.Account || accountUrl) && (
                <GitRepositoryName
                  accountUrl={accountUrl}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  fieldValue={formik.values?.repoName}
                  changeFieldValue={(value: string) => formik.setFieldValue('repoName', value)}
                  isReadonly={isReadonly}
                />
              )}
              <Layout.Horizontal flex spacing="huge" margin={{ top: 'small', bottom: 'small' }}>
                <div className={helmcss.halfWidth}>
                  <FormInput.Select
                    name="gitFetchType"
                    label={getString('pipeline.manifestType.gitFetchTypeLabel')}
                    items={gitFetchTypeList}
                  />
                </div>
                {formik.values?.gitFetchType === GitFetchTypes.Branch &&
                  renderBranch(
                    formik,
                    isReadonly,
                    getString('pipelineSteps.deploy.inputSet.branch'),
                    getString('pipeline.manifestType.branchPlaceholder'),
                    expressions,
                    allowableTypes
                  )}

                {formik.values?.gitFetchType === GitFetchTypes.Commit &&
                  renderCommitId(
                    formik,
                    isReadonly,
                    getString('pipeline.manifestType.commitId'),
                    getString('pipeline.manifestType.commitPlaceholder'),
                    expressions,
                    allowableTypes
                  )}
              </Layout.Horizontal>
              <div
                className={cx({
                  [helmcss.runtimeInput]: getMultiTypeFromValue(formik.values?.paths) === MultiTypeInputType.RUNTIME
                })}
              >
                <DragnDropPaths
                  formik={formik}
                  expressions={expressions}
                  allowableTypes={allowableTypes}
                  fieldPath="paths"
                  pathLabel={
                    selectedManifest === ManifestDataType.KustomizePatches
                      ? getString('fileFolderPathText')
                      : getString('common.git.filePath')
                  }
                  placeholder={
                    selectedManifest === ManifestDataType.KustomizePatches
                      ? getString('pipeline.manifestType.manifestPathPlaceholder')
                      : getString('pipeline.manifestType.pathPlaceholder')
                  }
                  defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                />
                {getMultiTypeFromValue(formik.values.paths) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.paths}
                    type={getString('string')}
                    variableName={'paths'}
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={val => formik?.setFieldValue('paths', val)}
                    isReadonly={isReadonly}
                  />
                )}
              </div>
            </div>
            <Layout.Horizontal spacing="medium">
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('back')}
                icon="chevron-left"
                onClick={() => previousStep?.(modifiedPrevStepData)}
              />
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('submit')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default KustomizePatchDetails
