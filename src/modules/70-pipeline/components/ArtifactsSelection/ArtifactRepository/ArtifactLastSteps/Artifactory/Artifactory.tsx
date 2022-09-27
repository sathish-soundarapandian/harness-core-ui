/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import {
  Formik,
  FormInput,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  SelectOption
} from '@wings-software/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { Menu } from '@blueprintjs/core'
import { Form, FormikValues } from 'formik'
import * as Yup from 'yup'
import { defaultTo, memoize, merge } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import { ConnectorConfigDTO, DockerBuildDetailsDTO, useGetBuildDetailsForArtifactoryArtifact } from 'services/cd-ng'
import {
  checkIfQueryParamsisNotEmpty,
  defaultArtifactInitialValues,
  getArtifactFormData,
  getArtifactPathToFetchTags,
  getConnectorIdValue,
  getFinalArtifactFormObj,
  resetTag,
  shouldFetchTags,
  helperTextData
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import {
  getHelpeTextForTags,
  isAzureWebAppDeploymentType,
  isAzureWebAppOrSshWinrmGenericDeploymentType,
  isCustomDeploymentType,
  isServerlessDeploymentType,
  isSshOrWinrmDeploymentType,
  repositoryFormats,
  RepositoryFormatTypes
} from '@pipeline/utils/stageHelpers'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type {
  ArtifactType,
  ImagePathProps,
  ImagePathTypes
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { ArtifactIdentifierValidation, ModalViewFor, tagOptions } from '../../../ArtifactHelper'
import { NoTagResults, selectItemsMapper } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import ServerlessArtifactoryRepository from './ServerlessArtifactoryRepository'
import css from '../../ArtifactConnector.module.scss'

const getRepositoryValue = (
  formData: ImagePathTypes & { connectorId?: string },
  isGenericArtifactory = false
): string => {
  if (isGenericArtifactory) {
    if ((formData?.repository as SelectOption)?.value) {
      return (formData?.repository as SelectOption)?.value as string
    }
  }
  return formData?.repository as string
}

const getRepositoryFormat = (values: ImagePathTypes & { spec?: any }): string | undefined => {
  return defaultTo(values?.spec?.repositoryFormat, values?.repositoryFormat)
}

function Artifactory({
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
  selectedDeploymentType,
  isMultiArtifactSource
}: StepProps<ConnectorConfigDTO> & ImagePathProps<ImagePathTypes>): React.ReactElement {
  const { getString } = useStrings()
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!isMultiArtifactSource

  const [lastQueryData, setLastQueryData] = useState({ artifactPath: '', repository: '' })
  const [tagList, setTagList] = useState<DockerBuildDetailsDTO[] | undefined>([])
  const isServerlessDeploymentTypeSelected = isServerlessDeploymentType(selectedDeploymentType)
  const isSSHWinRmDeploymentType = isSshOrWinrmDeploymentType(selectedDeploymentType)
  const isAzureWebAppDeploymentTypeSelected = isAzureWebAppDeploymentType(selectedDeploymentType)
  const isCustomDeploymentTypeSelected = isCustomDeploymentType(selectedDeploymentType)
  const [repositoryFormat, setRepositoryFormat] = useState<string | undefined>(
    isServerlessDeploymentTypeSelected ||
      isSSHWinRmDeploymentType ||
      isAzureWebAppDeploymentTypeSelected ||
      isCustomDeploymentTypeSelected
      ? RepositoryFormatTypes.Generic
      : RepositoryFormatTypes.Docker
  )
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const showRepositoryFormatForAllowedTypes =
    isAzureWebAppDeploymentTypeSelected || isSSHWinRmDeploymentType || isCustomDeploymentTypeSelected
  const isAzureWebAppGenericTypeSelected = isAzureWebAppOrSshWinrmGenericDeploymentType(
    selectedDeploymentType,
    getRepositoryFormat(initialValues)
  )
  const [isAzureWebAppGeneric, setIsAzureWebAppGeneric] = useState<boolean>(isAzureWebAppGenericTypeSelected)

  const isGenericArtifactory = React.useMemo(() => {
    return repositoryFormat === RepositoryFormatTypes.Generic
  }, [repositoryFormat])

  useLayoutEffect(() => {
    let repoFormat = RepositoryFormatTypes.Docker
    if (isServerlessDeploymentTypeSelected) repoFormat = RepositoryFormatTypes.Generic
    if (showRepositoryFormatForAllowedTypes) {
      repoFormat = getRepositoryFormat(initialValues)
        ? (getRepositoryFormat(initialValues) as RepositoryFormatTypes)
        : RepositoryFormatTypes.Generic
    }

    setRepositoryFormat(repoFormat)
  }, [])

  const schemaObject = {
    artifactPath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactPath')),
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
    })
  }

  const serverlessArtifactorySchema = {
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    artifactDirectory: Yup.string()
      .trim()
      .required(getString('pipeline.artifactsSelection.validation.artifactDirectory')),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactPathFilter'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.artifactPath'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)

  const serverlessPrimarySchema = Yup.object().shape(serverlessArtifactorySchema)

  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const serverlessSidecarSchema = Yup.object().shape({
    ...serverlessArtifactorySchema,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const getConnectorRefQueryData = (): string => {
    return prevStepData?.connectorId?.value || prevStepData?.connectorId?.connector?.value || prevStepData?.identifier
  }

  const {
    data,
    loading: artifactoryBuildDetailsLoading,
    refetch: refetchArtifactoryTag,
    error: artifactoryTagError
  } = useGetBuildDetailsForArtifactoryArtifact({
    queryParams: {
      artifactPath: lastQueryData.artifactPath,
      repository: lastQueryData.repository,
      repositoryFormat,
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
      refetchArtifactoryTag()
    }
  }, [lastQueryData, refetchArtifactoryTag])
  useEffect(() => {
    if (artifactoryTagError) {
      setTagList([])
    } else if (Array.isArray(data?.data?.buildDetailsList)) {
      setTagList(data?.data?.buildDetailsList)
    }
  }, [data?.data?.buildDetailsList, artifactoryTagError])

  const canFetchTags = useCallback(
    (artifactPath: string, repository: string): boolean => {
      return !!(
        (lastQueryData.artifactPath !== artifactPath || lastQueryData.repository !== repository) &&
        shouldFetchTags(prevStepData, [artifactPath, repository])
      )
    },
    [lastQueryData, prevStepData]
  )
  const fetchTags = useCallback(
    (artifactPath = '', repository = ''): void => {
      if (canFetchTags(artifactPath, repository)) {
        setLastQueryData({ artifactPath, repository })
      }
    },
    [canFetchTags]
  )

  const isTagDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue.artifactPath, formikValue.repository])
  }, [])

  const isArtifactPathDisabled = useCallback((formikValue): boolean => {
    return !checkIfQueryParamsisNotEmpty([formikValue.artifactDirectory, formikValue.repository])
  }, [])

  const getInitialValues = useCallback((): ImagePathTypes => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed,
      isGenericArtifactory
    ) as ImagePathTypes
  }, [initialValues, selectedArtifact, isIdentifierAllowed, isGenericArtifactory])

  const submitFormData = (formData: ImagePathTypes & { connectorId?: string }): void => {
    const artifactObj = getFinalArtifactFormObj(formData, isIdentifierAllowed, isGenericArtifactory)
    merge(artifactObj.spec, {
      repository: getRepositoryValue(formData, isGenericArtifactory),
      repositoryUrl: formData?.repositoryUrl,
      repositoryFormat
    })

    if (isAzureWebAppGeneric) {
      delete artifactObj?.spec?.repositoryUrl
    }

    handleSubmit(artifactObj)
  }

  const getValidationSchema = useCallback(() => {
    if (isGenericArtifactory) {
      if (context === ModalViewFor.SIDECAR) {
        return serverlessSidecarSchema
      }
      return serverlessPrimarySchema
    }
    if (context === ModalViewFor.SIDECAR) {
      return sidecarSchema
    }
    return primarySchema
  }, [context, isGenericArtifactory, primarySchema, serverlessPrimarySchema, sidecarSchema])

  const loadingPlaceholderText = isServerlessDeploymentTypeSelected
    ? getString('pipeline.artifactsSelection.loadingArtifactPaths')
    : getString('pipeline.artifactsSelection.loadingTags')

  const getSelectItems = useCallback(selectItemsMapper.bind(null, tagList, isServerlessDeploymentTypeSelected), [
    tagList,
    isServerlessDeploymentTypeSelected
  ])

  const tags = artifactoryBuildDetailsLoading
    ? [{ label: loadingPlaceholderText, value: loadingPlaceholderText }]
    : getSelectItems()

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={artifactoryBuildDetailsLoading}
        onClick={handleClick}
      />
    </div>
  ))

  const onTagInputFocus = (e: React.FocusEvent<HTMLInputElement>, formik: FormikValues): void => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }
    fetchTags(getArtifactPathToFetchTags(formik, true, isServerlessDeploymentTypeSelected), formik.values?.repository)
  }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="artifactoryArtifact"
        validationSchema={getValidationSchema()}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            tag: defaultTo(formData?.tag?.value, formData?.tag),
            connectorId: getConnectorIdValue(prevStepData)
          })
        }}
      >
        {formik => {
          const onChangeImageArtifactPath = (): void => {
            tagList?.length && setTagList([])
            resetTag(formik)
          }
          return (
            <Form>
              <div className={css.connectorForm}>
                {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
                {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
                {showRepositoryFormatForAllowedTypes && (
                  <div className={css.imagePathContainer}>
                    <FormInput.Select
                      name="repositoryFormat"
                      label={getString('common.repositoryFormat')}
                      items={repositoryFormats}
                      onChange={value => {
                        if (showRepositoryFormatForAllowedTypes) {
                          selectedArtifact && formik.setValues(defaultArtifactInitialValues(selectedArtifact))
                          formik.setFieldValue('repositoryFormat', value?.value)
                          setRepositoryFormat(value?.value as string)
                          setIsAzureWebAppGeneric(
                            showRepositoryFormatForAllowedTypes && value?.value === RepositoryFormatTypes.Generic
                          )
                        }
                      }}
                    />
                  </div>
                )}

                {isGenericArtifactory ? (
                  <ServerlessArtifactoryRepository
                    connectorRef={getConnectorIdValue(prevStepData)}
                    isReadonly={isReadonly}
                    expressions={expressions}
                    allowableTypes={allowableTypes}
                    formik={formik}
                    fieldName={'repository'}
                  />
                ) : (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('repository')}
                      name="repository"
                      placeholder={getString('pipeline.artifactsSelection.repositoryPlaceholder')}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes
                      }}
                      onChange={() => {
                        tagList?.length && setTagList([])
                        resetTag(formik)
                      }}
                    />

                    {getMultiTypeFromValue(formik.values.repository) === MultiTypeInputType.RUNTIME && (
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
                )}

                {isGenericArtifactory && (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.artifactDirectory')}
                      name="artifactDirectory"
                      placeholder={getString('pipeline.artifactsSelection.artifactDirectoryPlaceholder')}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes
                      }}
                      onChange={() => {
                        resetTag(formik)
                      }}
                    />

                    {getMultiTypeFromValue(formik.values.artifactDirectory) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          style={{ alignSelf: 'center' }}
                          value={formik.values?.artifactDirectory as string}
                          type={getString('string')}
                          variableName="artifactDirectory"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('artifactDirectory', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                )}

                {isGenericArtifactory ? null : (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactImagePathLabel')}
                      name="artifactPath"
                      placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                      onChange={onChangeImageArtifactPath}
                    />
                    {getMultiTypeFromValue(formik.values?.artifactPath) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.artifactPath || ''}
                          type="String"
                          variableName="artifactPath"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('artifactPath', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                )}
                {!isGenericArtifactory && (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('repositoryUrlLabel')}
                      name="repositoryUrl"
                      isOptional
                      placeholder={getString('pipeline.repositoryUrlPlaceholder')}
                      multiTextInputProps={{
                        expressions,
                        allowableTypes
                      }}
                    />
                    {getMultiTypeFromValue(formik.values.repositoryUrl) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          style={{ alignSelf: 'center' }}
                          value={formik.values?.repositoryUrl as string}
                          type={getString('string')}
                          variableName="repositoryUrl"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('repositoryUrl', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                )}

                {formik.values?.tagType === 'value' ? (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTypeInput
                      selectItems={tags}
                      disabled={
                        isGenericArtifactory ? isArtifactPathDisabled(formik?.values) : isTagDisabled(formik?.values)
                      }
                      helperText={
                        getMultiTypeFromValue(formik.values?.tag) === MultiTypeInputType.FIXED &&
                        getHelpeTextForTags(
                          helperTextData(selectedArtifact, formik, getConnectorIdValue(prevStepData)),
                          getString,
                          isServerlessDeploymentTypeSelected
                        )
                      }
                      multiTypeInputProps={{
                        expressions,
                        allowableTypes,
                        selectProps: {
                          defaultSelectedItem: formik.values?.tag,
                          noResults: (
                            <NoTagResults
                              tagError={artifactoryTagError}
                              isServerlessDeploymentTypeSelected={isServerlessDeploymentTypeSelected}
                            />
                          ),
                          items: tags,
                          addClearBtn: true,
                          itemRenderer: itemRenderer,
                          allowCreatingNewItems: true,
                          addTooltip: true
                        },
                        onFocus: (e: React.FocusEvent<HTMLInputElement>) => onTagInputFocus(e, formik)
                      }}
                      label={
                        isServerlessDeploymentTypeSelected
                          ? getString('pipeline.artifactPathLabel')
                          : getString('tagLabel')
                      }
                      name="tag"
                      className={css.tagInputButton}
                    />

                    {getMultiTypeFromValue(formik.values?.tag) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.tag}
                          type="String"
                          variableName="tag"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('tag', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                ) : null}

                {formik.values?.tagType === 'regex' ? (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={
                        isServerlessDeploymentTypeSelected
                          ? getString('pipeline.artifactPathFilterLabel')
                          : getString('tagRegex')
                      }
                      name="tagRegex"
                      placeholder={getString('pipeline.artifactsSelection.existingDocker.enterTagRegex')}
                      multiTextInputProps={{ expressions, allowableTypes }}
                    />
                    {getMultiTypeFromValue(formik.values?.tagRegex) === MultiTypeInputType.RUNTIME && (
                      <div className={css.configureOptions}>
                        <ConfigureOptions
                          value={formik.values?.tagRegex}
                          type="String"
                          variableName="tagRegex"
                          showRequiredField={false}
                          showDefaultField={false}
                          showAdvanced={true}
                          onChange={value => {
                            formik.setFieldValue('tagRegex', value)
                          }}
                          isReadonly={isReadonly}
                        />
                      </div>
                    )}
                  </div>
                ) : null}
                <div className={cx(css.tagGroup, css.marginBottom)}>
                  <FormInput.RadioGroup
                    label={
                      isServerlessDeploymentTypeSelected
                        ? getString('pipeline.artifactsSelection.artifactDetails')
                        : undefined
                    }
                    name="tagType"
                    radioGroup={{ inline: true }}
                    items={tagOptions}
                    className={css.radioGroup}
                  />
                </div>
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
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
export default Artifactory
