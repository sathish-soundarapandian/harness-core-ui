/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState, useEffect } from 'react'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { merge, defaultTo } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import { ConnectorConfigDTO, DockerBuildDetailsDTO, useGetBuildDetailsForNexusArtifact } from 'services/cd-ng'
import {
  checkIfQueryParamsisNotEmpty,
  getConnectorIdValue,
  getArtifactFormData,
  shouldFetchTags
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ArtifactType,
  ImagePathProps,
  Nexus2InitialValuesType
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { nexus2RepositoryFormatTypes, RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'

import ArtifactImagePathTagView from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import type { queryInterface } from '../NexusArtifact/NexusArtifact'
import css from '../../ArtifactConnector.module.scss'

export function Nexus2Artifact({
  context,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact,
  isMultiArtifactSource
}: StepProps<ConnectorConfigDTO> & ImagePathProps<Nexus2InitialValuesType>): React.ReactElement {
  const { getString } = useStrings()
  const [lastQueryData, setLastQueryData] = useState<queryInterface>({ repositoryFormat: '', repository: '' })
  const [tagList, setTagList] = useState<DockerBuildDetailsDTO[] | undefined>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const schemaObject = {
    tagRegex: Yup.string().when('spec.tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('spec.tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
    }),
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    repositoryFormat: Yup.string()
      .trim()
      .required(getString('pipeline.artifactsSelection.validation.repositoryFormat')),
    spec: Yup.object().shape({
      artifactId: Yup.string().when('repositoryFormat', {
        is: RepositoryFormatTypes.Maven,
        then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactId'))
      }),
      groupId: Yup.string().when('repositoryFormat', {
        is: RepositoryFormatTypes.Maven,
        then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.groupId'))
      }),
      packageName: Yup.string().when('repositoryFormat', {
        is: RepositoryFormatTypes.NPM || RepositoryFormatTypes.NuGet,
        then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.packageName'))
      })
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const getConnectorRefQueryData = (): string => {
    return defaultTo(prevStepData?.connectorId?.value, prevStepData?.identifier)
  }

  const {
    data,
    loading: nexusBuildDetailsLoading,
    refetch: refetchNexusTag,
    error: nexusTagError
  } = useGetBuildDetailsForNexusArtifact({
    queryParams: {
      // artifactPath: lastQueryData.artifactPath,
      ...lastQueryData,
      repository: lastQueryData.repository,
      connectorRef: getConnectorRefQueryData(),
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    lazy: true,
    debounce: 300
  })

  useEffect(() => {
    if (checkIfQueryParamsisNotEmpty(Object.values(lastQueryData))) {
      refetchNexusTag()
    }
  }, [lastQueryData, refetchNexusTag])

  useEffect(() => {
    if (nexusTagError) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList)) {
      setTagList(data?.data?.buildDetailsList)
    }
  }, [data?.data?.buildDetailsList, nexusTagError])

  const canFetchTags = useCallback(
    (formikValues: Nexus2InitialValuesType): boolean => {
      return !!(formikValues.repositoryFormat === RepositoryFormatTypes.Maven
        ? lastQueryData.repositoryFormat !== formikValues.repositoryFormat ||
          lastQueryData.repository !== formikValues.repository ||
          lastQueryData.artifactId !== formikValues.spec.artifactId ||
          lastQueryData.groupId !== formikValues.spec.groupId ||
          lastQueryData.extension !== formikValues.spec.extension ||
          lastQueryData.classifier !== formikValues.spec.classifier ||
          shouldFetchTags(prevStepData, [
            formikValues.repositoryFormat,
            formikValues.repository,
            formikValues.spec.artifactId || '',
            formikValues.spec.groupId || '',
            formikValues.spec.extension || '',
            formikValues.spec.classifier || ''
          ])
        : lastQueryData.repositoryFormat !== formikValues.repositoryFormat ||
          lastQueryData.repository !== formikValues.repository ||
          lastQueryData.packageName !== formikValues.spec.packageName ||
          shouldFetchTags(prevStepData, [
            formikValues.repositoryFormat,
            formikValues.repository,
            formikValues.spec.packageName || ''
          ]))
    },
    [lastQueryData, prevStepData]
  )
  const fetchTags = useCallback(
    (formikValues: Nexus2InitialValuesType): void => {
      if (canFetchTags(formikValues)) {
        let repositoryDependentFields: any = {}
        if (formikValues.repositoryFormat === RepositoryFormatTypes.Maven) {
          const optionalFields: any = {}
          if (formikValues.spec.extension) optionalFields.extension = formikValues.spec.extension

          if (formikValues.spec.classifier) optionalFields.classifier = formikValues.spec.classifier

          repositoryDependentFields = {
            artifactId: formikValues.spec.artifactId,
            groupId: formikValues.spec.groupId,
            ...optionalFields
          }
        } else {
          repositoryDependentFields = {
            packageName: formikValues.spec.packageName
          }
        }
        setLastQueryData({
          repository: formikValues.repository,
          repositoryFormat: formikValues.repositoryFormat,
          ...repositoryDependentFields
        })
      }
    },
    [canFetchTags]
  )
  const isTagDisabled = useCallback((formikValue: Nexus2InitialValuesType): boolean => {
    return formikValue.repositoryFormat === RepositoryFormatTypes.Maven
      ? !checkIfQueryParamsisNotEmpty([
          formikValue.repositoryFormat,
          formikValue.repository,
          formikValue.spec.artifactId,
          formikValue.spec.groupId
        ])
      : !checkIfQueryParamsisNotEmpty([
          formikValue.repositoryFormat,
          formikValue.repository,
          formikValue.spec.packageName
        ])
  }, [])

  const getInitialValues = (): Nexus2InitialValuesType => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      context === ModalViewFor.SIDECAR
    ) as Nexus2InitialValuesType
  }
  const submitFormData = (formData: Nexus2InitialValuesType & { connectorId?: string }): void => {
    // const artifactObj = getFinalArtifactObj(formData, context === ModalViewFor.SIDECAR)
    const specData =
      formData.repositoryFormat === RepositoryFormatTypes.Maven
        ? {
            artifactId: formData.spec.artifactId,
            groupId: formData.spec.groupId,
            extension: formData.spec.extension,
            classifier: formData.spec.classifier
          }
        : {
            packageName: formData.spec.packageName
          }
    const tagData =
      formData.tagType === 'value'
        ? {
            tag: defaultTo(formData.tag?.value, formData.tag)
          }
        : {
            tagRegex: formData.tagRegex
          }
    const formatedFormData = {
      spec: {
        connectorRef: formData.connectorId,
        repository: formData?.repository,
        repositoryFormat: formData?.repositoryFormat,
        ...tagData,
        spec: {
          ...specData
        }
      }
    }
    if (context === ModalViewFor.SIDECAR) {
      merge(formatedFormData, { identifier: formData?.identifier })
    }
    handleSubmit(formatedFormData)
  }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isMultiArtifactSource ? sidecarSchema : primarySchema}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorId: getConnectorIdValue(prevStepData)
          })
        }}
      >
        {formik => (
          <FormikForm>
            <div className={css.artifactForm}>
              {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
              {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
              <div className={css.imagePathContainer}>
                <FormInput.Select
                  name="repositoryFormat"
                  label={getString('common.repositoryFormat')}
                  items={nexus2RepositoryFormatTypes}
                  onChange={value => {
                    if (value.value === RepositoryFormatTypes.Maven) {
                      const optionalValues: { extension?: string; classifier?: string } = {}
                      if (formik.values?.spec?.classifier) {
                        optionalValues.classifier = formik.values?.spec?.classifier
                      }
                      if (formik.values?.spec?.extension) {
                        optionalValues.extension = formik.values?.spec?.extension
                      }
                      setLastQueryData({
                        repository: '',
                        repositoryFormat: RepositoryFormatTypes.Maven,
                        artifactId: '',
                        groupId: '',
                        ...optionalValues
                      })
                    } else {
                      setLastQueryData({
                        repository: '',
                        repositoryFormat: value.value as string,
                        packageName: ''
                      })
                    }
                  }}
                />
              </div>
              <div className={css.imagePathContainer}>
                <FormInput.MultiTextInput
                  label={getString('repository')}
                  name="repository"
                  placeholder={getString('pipeline.artifactsSelection.repositoryPlaceholder')}
                  multiTextInputProps={{
                    expressions,
                    allowableTypes
                  }}
                />

                {getMultiTypeFromValue(formik.values?.repository) === MultiTypeInputType.RUNTIME && (
                  <div className={css.configureOptions}>
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.repository as string}
                      type={getString('string')}
                      variableName="repository"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('repository', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  </div>
                )}
              </div>
              {formik.values?.repositoryFormat === RepositoryFormatTypes.Maven ? (
                <>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.groupId')}
                      name="spec.groupId"
                      placeholder={getString('pipeline.artifactsSelection.groupIdPlaceholder')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.spec?.groupId) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.spec?.groupId || ''}
                          type="String"
                          variableName="spec.groupId"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('spec.groupId', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.artifactId')}
                      name="spec.artifactId"
                      placeholder={getString('pipeline.artifactsSelection.artifactIdPlaceholder')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.spec?.artifactId) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.spec?.artifactId || ''}
                          type="String"
                          variableName="spec.artifactId"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('spec.artifactId', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.extension')}
                      name="spec.extension"
                      placeholder={getString('pipeline.artifactsSelection.extensionPlaceholder')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.spec?.extension) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.spec?.extension || ''}
                          type="String"
                          variableName="spec.extension"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('spec.extension', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.classifier')}
                      name="spec.classifier"
                      placeholder={getString('pipeline.artifactsSelection.classifierPlaceholder')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.spec?.classifier) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.spec?.classifier || ''}
                          type="String"
                          variableName="spec.classifier"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('spec.classifier', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    label={getString('pipeline.artifactsSelection.packageName')}
                    name="spec.packageName"
                    placeholder={getString('pipeline.manifestType.packagePlaceholder')}
                    multiTextInputProps={{ expressions, allowableTypes }}
                  />
                  {getMultiTypeFromValue(formik.values?.spec?.packageName) === MultiTypeInputType.RUNTIME && (
                    <div className={css.configureOptions}>
                      <ConfigureOptions
                        value={formik.values?.spec?.packageName || ''}
                        type="String"
                        variableName="spec.packageName"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => {
                          formik.setFieldValue('spec.packageName', value)
                        }}
                        isReadonly={isReadonly}
                      />
                    </div>
                  )}
                </div>
              )}
              <ArtifactImagePathTagView
                selectedArtifact={selectedArtifact as ArtifactType}
                formik={formik}
                expressions={expressions}
                allowableTypes={allowableTypes}
                isReadonly={isReadonly}
                connectorIdValue={getConnectorIdValue(prevStepData)}
                fetchTags={() => fetchTags(formik.values)}
                buildDetailsLoading={nexusBuildDetailsLoading}
                tagError={nexusTagError}
                tagList={tagList}
                setTagList={setTagList}
                tagDisabled={isTagDisabled(formik?.values)}
                isArtifactPath={false}
                isImagePath={false}
              />
            </div>
            <Layout.Horizontal spacing="medium">
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
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
