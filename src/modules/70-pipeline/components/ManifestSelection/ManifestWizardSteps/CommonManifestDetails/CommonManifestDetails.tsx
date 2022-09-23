/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, set, isEmpty } from 'lodash-es'
import { Form, FormikProps } from 'formik'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import * as Yup from 'yup'
import {
  Layout,
  Button,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  StepProps,
  ButtonVariation,
  AllowedTypes
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper } from 'services/cd-ng'
import type { CommonManifestDataType, ManifestTypes } from '../../ManifestInterface'
import { GitRepoName, ManifestDataType, ManifestIdentifierValidation, ManifestStoreMap } from '../../Manifesthelper'
import { getRepositoryName } from '../ManifestUtils'
import { ManifestDetailsCoreSection } from './ManifestDetailsCoreSection'
import { ManifestDetailsAdvancedSection } from './ManifestDetailsAdvancedSection'
import css from './CommonManifestDetails.module.scss'

interface CommonManifestDetailsProps {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  initialValues: ManifestConfig
  selectedManifest: ManifestTypes | null
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
}

const showAdvancedSection = (selectedManifest: ManifestTypes | null): boolean => {
  return !!(selectedManifest && [ManifestDataType.K8sManifest].includes(selectedManifest))
}

const getConnectorRef = (prevStepData: ConnectorConfigDTO): string => {
  return getMultiTypeFromValue(prevStepData.connectorRef) !== MultiTypeInputType.FIXED
    ? prevStepData.connectorRef
    : prevStepData.connectorRef?.value
}

const getConnectorId = (prevStepData?: ConnectorConfigDTO): string => {
  return prevStepData?.identifier ? prevStepData?.identifier : ''
}

const getConnectorRefOrConnectorId = (prevStepData?: ConnectorConfigDTO): string => {
  return prevStepData?.connectorRef ? getConnectorRef(prevStepData) : getConnectorId(prevStepData)
}

export function CommonManifestDetails({
  stepName,
  selectedManifest,
  expressions,
  allowableTypes,
  initialValues,
  handleSubmit,
  prevStepData,
  previousStep,
  manifestIdsList,
  isReadonly = false
}: StepProps<ConnectorConfigDTO> & CommonManifestDetailsProps): React.ReactElement {
  const { getString } = useStrings()

  const gitConnectionType: string = prevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    prevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    prevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  const getInitialValues = (): CommonManifestDataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      return {
        ...specValues,
        identifier: initialValues.identifier,
        skipResourceVersioning: initialValues?.spec?.skipResourceVersioning,
        repoName: getRepositoryName(prevStepData, initialValues),
        paths:
          typeof specValues.paths === 'string'
            ? specValues.paths
            : specValues.paths?.map((path: string) => ({ path, uuid: uuid(path, nameSpace()) }))
      }
    }
    return {
      identifier: '',
      branch: undefined,
      commitId: undefined,
      gitFetchType: 'Branch',
      paths: [{ path: '', uuid: uuid('', nameSpace()) }],
      skipResourceVersioning: false,
      repoName: getRepositoryName(prevStepData, initialValues)
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

    if (showAdvancedSection(selectedManifest) && formData?.skipResourceVersioning) {
      set(manifestObj, 'manifest.spec.skipResourceVersioning', formData?.skipResourceVersioning)
    }

    handleSubmit(manifestObj)
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="manifestDetails"
        validationSchema={Yup.object().shape({
          ...ManifestIdentifierValidation(manifestIdsList, initialValues?.identifier, getString('pipeline.uniqueName')),
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
              getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED
            ) {
              return true
            }
            return !isEmpty(value) && value?.length > 0
          })
        })}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorRef: getConnectorRefOrConnectorId(prevStepData)
          })
        }}
      >
        {(formik: FormikProps<CommonManifestDataType>) => {
          return (
            <Form>
              <Layout.Vertical
                flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                className={css.manifestForm}
              >
                <div className={css.manifestStepWidth}>
                  <ManifestDetailsCoreSection
                    formik={formik}
                    selectedManifest={selectedManifest}
                    expressions={expressions}
                    allowableTypes={allowableTypes}
                    prevStepData={prevStepData}
                    isReadonly={isReadonly}
                  />

                  {showAdvancedSection(selectedManifest) && (
                    <ManifestDetailsAdvancedSection
                      formik={formik}
                      expressions={expressions}
                      allowableTypes={allowableTypes}
                      initialValues={initialValues}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>

                <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                  <Button
                    variation={ButtonVariation.SECONDARY}
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => previousStep?.(prevStepData)}
                  />
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    type="submit"
                    text={getString('submit')}
                    rightIcon="chevron-right"
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
