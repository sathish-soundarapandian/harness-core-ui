/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Layout,
  Button,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  StepProps,
  ButtonVariation,
  AllowedTypes,
  FormikForm
} from '@harness/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import * as Yup from 'yup'

import { get, set, isEmpty, defaultTo } from 'lodash-es'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper, ServiceDefinition } from 'services/cd-ng'
import type { ModalViewFor } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { shouldHideHeaderAndNavBtns } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type { CommonManifestDataType, CommonManifestLastStepPrevStepData, ManifestTypes } from '../../ManifestInterface'
import {
  getSkipResourceVersioningBasedOnDeclarativeRollback,
  GitRepoName,
  ManifestDataType,
  ManifestIdentifierValidation,
  ManifestStoreMap
} from '../../Manifesthelper'
import DragnDropPaths from '../../DragnDropPaths'
import { filePathWidth, getRepositoryName, removeEmptyFieldsFromStringArray } from '../ManifestUtils'
import { ManifestDetailsCoreSection } from '../CommonManifestDetails/ManifestDetailsCoreSection'
import { ManifestDetailsAdvancedSection } from '../CommonManifestDetails/ManifestDetailsAdvancedSection'
import css from '../CommonManifestDetails/CommonManifestDetails.module.scss'

interface K8sValuesManifestPropType {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
  selectedDeploymentType?: ServiceDefinition['type']
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
  context?: ModalViewFor
  editManifestModePrevStepData?: CommonManifestLastStepPrevStepData
}

const showAdvancedSection = (selectedManifest: ManifestTypes | null): boolean => {
  return selectedManifest === ManifestDataType.K8sManifest
}

function K8sValuesManifest({
  stepName,
  selectedManifest,
  selectedDeploymentType,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  context,
  isReadonly = false,
  editManifestModePrevStepData
}: StepProps<ConnectorConfigDTO> & K8sValuesManifestPropType): React.ReactElement {
  const { getString } = useStrings()
  const hideHeaderAndNavBtns = context ? shouldHideHeaderAndNavBtns(context) : false

  const modifiedPrevStepData = defaultTo(prevStepData, editManifestModePrevStepData)

  const gitConnectionType: string = modifiedPrevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    modifiedPrevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    modifiedPrevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  const getInitialValues = (): CommonManifestDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        skipResourceVersioning: initialValues?.spec?.skipResourceVersioning,
        enableDeclarativeRollback: initialValues?.spec?.enableDeclarativeRollback,
        repoName: getRepositoryName(modifiedPrevStepData, initialValues),
        paths:
          typeof specValues.paths === 'string'
            ? specValues.paths
            : removeEmptyFieldsFromStringArray(specValues.paths)?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              })),
        valuesPaths:
          typeof initialValues?.spec?.valuesPaths === 'string'
            ? initialValues?.spec?.valuesPaths
            : removeEmptyFieldsFromStringArray(initialValues?.spec?.valuesPaths)?.map((path: string) => ({
                path,
                uuid: uuid(path, nameSpace())
              }))
      }
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      paths: [{ path: '', uuid: uuid('', nameSpace()) }],
      skipResourceVersioning: false,
      enableDeclarativeRollback: false,
      repoName: getRepositoryName(modifiedPrevStepData, initialValues)
    }
  }

  const submitFormData = (formData: CommonManifestDataType & { store?: string; connectorRef?: string }): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        type: selectedManifest as ManifestTypes,
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              gitFetchType: formData?.gitFetchType,
              paths:
                typeof formData?.paths === 'string'
                  ? formData?.paths
                  : formData?.paths?.map((path: { path: string }) => path.path)
            }
          },
          valuesPaths:
            typeof formData?.valuesPaths === 'string'
              ? formData?.valuesPaths
              : removeEmptyFieldsFromStringArray(formData?.valuesPaths?.map((path: { path: string }) => path.path))
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

    if (selectedManifest === ManifestDataType.K8sManifest) {
      set(
        manifestObj,
        'manifest.spec.skipResourceVersioning',
        getSkipResourceVersioningBasedOnDeclarativeRollback(
          formData?.skipResourceVersioning,
          formData?.enableDeclarativeRollback
        )
      )
      set(manifestObj, 'manifest.spec.enableDeclarativeRollback', formData?.enableDeclarativeRollback)
    }
    handleSubmit(manifestObj)
  }

  const handleValidate = (formData: CommonManifestDataType): void => {
    if (hideHeaderAndNavBtns) {
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
    }
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {stepName}
        </Text>
      )}

      <Formik
        initialValues={getInitialValues()}
        formName="manifestDetails"
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
        validate={handleValidate}
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
        {(formik: FormikProps<CommonManifestDataType>) => {
          return (
            <FormikForm>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.manifestForm}
              >
                <div className={css.manifestStepWidth}>
                  <ManifestDetailsCoreSection
                    formik={formik}
                    selectedManifest={selectedManifest}
                    selectedDeploymentType={selectedDeploymentType}
                    expressions={expressions}
                    allowableTypes={allowableTypes}
                    prevStepData={modifiedPrevStepData}
                    isReadonly={isReadonly}
                  />

                  {selectedManifest === ManifestDataType.K8sManifest && (
                    <div
                      className={cx({
                        [css.runtimeInput]:
                          getMultiTypeFromValue(formik.values?.valuesPaths) === MultiTypeInputType.RUNTIME
                      })}
                    >
                      <DragnDropPaths
                        formik={formik}
                        expressions={expressions}
                        allowableTypes={allowableTypes}
                        fieldPath="valuesPaths"
                        pathLabel={getString('pipeline.manifestType.valuesYamlPath')}
                        placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                        defaultValue={{ path: '', uuid: uuid('', nameSpace()) }}
                        dragDropFieldWidth={filePathWidth}
                        allowSinglePathDeletion
                      />
                      {getMultiTypeFromValue(formik.values.valuesPaths) === MultiTypeInputType.RUNTIME && (
                        <ConfigureOptions
                          value={formik.values.valuesPaths}
                          type={getString('string')}
                          variableName={'valuesPaths'}
                          showRequiredField={false}
                          showDefaultField={false}
                          onChange={val => formik?.setFieldValue('valuesPaths', val)}
                          isReadonly={isReadonly}
                        />
                      )}
                    </div>
                  )}

                  {showAdvancedSection(selectedManifest) && (
                    <ManifestDetailsAdvancedSection
                      formik={formik}
                      expressions={expressions}
                      allowableTypes={allowableTypes}
                      initialValues={initialValues}
                      isReadonly={isReadonly}
                      selectedManifest={selectedManifest}
                    />
                  )}
                </div>
                {!hideHeaderAndNavBtns && (
                  <Layout.Horizontal spacing="medium" className={css.saveBtn}>
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
                )}
              </Layout.Vertical>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default K8sValuesManifest
