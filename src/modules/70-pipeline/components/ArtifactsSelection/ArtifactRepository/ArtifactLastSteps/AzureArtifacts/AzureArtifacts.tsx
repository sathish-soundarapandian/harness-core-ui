/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  MultiTypeInputType,
  SelectOption,
  getMultiTypeFromValue,
  FormInput,
  FormikForm
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { Menu } from '@blueprintjs/core'
import { defaultTo, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import {
  ConnectorConfigDTO,
  BuildDetails,
  useListProjectsForAzureArtifacts,
  useListFeedsForAzureArtifacts,
  useListPackagesForAzureArtifacts,
  AzureDevopsProject,
  AzureArtifactsFeed,
  AzureArtifactsPackage,
  useListVersionsFromPackage
} from 'services/cd-ng'
import {
  getConnectorIdValue,
  getArtifactFormData,
  helperTextData,
  isFieldFixedAndNonEmpty
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ArtifactType,
  AzureArtifactsInitialValues,
  ImagePathProps
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { getHelpeTextForTags, RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { ArtifactIdentifierValidation, ModalViewFor, scopeOptions, tagOptions } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import css from '../../ArtifactConnector.module.scss'

export const packageTypeOptions: SelectOption[] = [
  { label: 'Maven', value: RepositoryFormatTypes.Maven },
  { label: 'NuGet', value: RepositoryFormatTypes.NuGet }
]

function FormComponent({
  context,
  expressions,
  allowableTypes,
  prevStepData,
  selectedArtifact,
  previousStep,
  isReadonly = false,
  formik,
  isMultiArtifactSource
}: any): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefValue = defaultTo(getGenuineValue(prevStepData?.connectorId?.value), '')
  const projectValue = defaultTo(getGenuineValue(formik.values.project), '')
  const feedValue = defaultTo(getGenuineValue(formik.values.feed), '')
  const packageValue = defaultTo(getGenuineValue(formik.values.package), '')
  const packageTypeValue = defaultTo(getGenuineValue(formik.values.packageType), '')
  const getConnectorRefQueryData = (): string => {
    return defaultTo(prevStepData?.connectorId?.value, prevStepData?.identifier)
  }

  const getItems = (isFetching: boolean, label: string, items: SelectOption[]): SelectOption[] => {
    if (isFetching) {
      return [{ label: `Loading ${label}...`, value: `Loading ${label}...` }]
    }
    return defaultTo(items, [])
  }

  const {
    refetch: refetchProjects,
    data: projectsResponse,
    loading: fetchingProjects
  } = useListProjectsForAzureArtifacts({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      org: 'automation-cdc'
    }
  })

  const projectItems: SelectOption[] = useMemo(() => {
    return (
      projectsResponse?.data?.map(
        (project: AzureDevopsProject) =>
          ({
            value: defaultTo(project.name, ''),
            label: defaultTo(project.name, '')
          } as SelectOption)
      ) || []
    )
  }, [projectsResponse?.data])

  const {
    refetch: refetchFeeds,
    data: feedsResponse,
    loading: fetchingFeeds,
    error: fetchingFeedsError
  } = useListFeedsForAzureArtifacts({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      project: '',
      org: ''
    }
  })

  const feedItems: SelectOption[] = useMemo(() => {
    return (
      feedsResponse?.data?.map(
        (feed: AzureArtifactsFeed) =>
          ({
            value: defaultTo(feed.name, ''),
            label: defaultTo(feed.name, '')
          } as SelectOption)
      ) || []
    )
  }, [feedsResponse?.data])

  const {
    refetch: refetchPackages,
    data: packagesResponse,
    loading: fetchingPackages,
    error: fetchingPackageError
  } = useListPackagesForAzureArtifacts({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      org: '',
      packageType: '',
      feed: ''
    }
  })

  const packageItems: SelectOption[] = useMemo(() => {
    return (
      packagesResponse?.data?.map(
        (packageItem: AzureArtifactsPackage) =>
          ({
            value: defaultTo(packageItem.name, ''),
            label: defaultTo(packageItem.name, '')
          } as SelectOption)
      ) || []
    )
  }, [packagesResponse?.data])

  const {
    refetch: refetchVersions,
    data: versionResponse,
    loading: fetchingVersions,
    error: fetchingVersionError
  } = useListVersionsFromPackage({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: connectorRefValue,
      org: '',
      packageType: '',
      feed: '',
      package: ''
    }
  })

  const versionItems: SelectOption[] = useMemo(() => {
    return (
      versionResponse?.data?.map(
        (buildItem: BuildDetails) =>
          ({
            value: defaultTo(buildItem.number, ''),
            label: defaultTo(buildItem.number, '')
          } as SelectOption)
      ) || []
    )
  }, [versionResponse?.data])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingVersions || fetchingFeeds || fetchingPackages || fetchingProjects}
        onClick={handleClick}
      />
    </div>
  ))

  const isFeedDisabled = (): boolean => {
    if (formik.values?.scope === 'org') {
      return false
    }
    return !isFieldFixedAndNonEmpty(formik.values?.project)
  }

  const isVersionFieldDisabled = (): boolean => {
    return !isFieldFixedAndNonEmpty(formik.values?.feed) || !isFieldFixedAndNonEmpty(formik.values?.package)
  }

  return (
    <FormikForm>
      <div className={css.connectorForm}>
        {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.imagePathContainer}>
          <FormInput.Select
            name="scope"
            label={getString('common.scopeLabel')}
            items={scopeOptions}
            onChange={() => {
              formik.setFieldValue('project', undefined)
            }}
          />
        </div>
        {formik.values?.scope === 'project' && (
          <div className={css.imagePathContainer}>
            <FormInput.MultiTypeInput
              selectItems={getItems(fetchingProjects, 'Projects', projectItems)}
              label={getString('projectLabel')}
              placeholder={getString('pipeline.artifactsSelection.projectPlaceholder')}
              name="project"
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  itemRenderer: itemRenderer,
                  items: getItems(fetchingProjects, 'Projects', projectItems),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchProjects({
                    queryParams: {
                      ...commonParams,
                      connectorRef: connectorRefValue?.toString(),
                      org: 'automation-cdc'
                    }
                  })
                }
              }}
            />
            {getMultiTypeFromValue(formik.values.project) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.project, '')}
                type="String"
                variableName="project"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => formik.setFieldValue('project', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        )}
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            selectItems={getItems(fetchingFeeds, 'Feeds', feedItems)}
            disabled={isFeedDisabled()}
            label={getString('pipeline.artifactsSelection.feed')}
            placeholder={getString('pipeline.artifactsSelection.feedPlaceholder')}
            name="feed"
            useValue
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              selectProps: {
                noResults: (
                  <NoTagResults
                    tagError={fetchingFeedsError}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={getString('pipeline.artifactsSelection.validation.noFeeds')}
                  />
                ),
                itemRenderer: itemRenderer,
                items: getItems(fetchingFeeds, 'Feeds', feedItems),
                allowCreatingNewItems: true
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                ) {
                  return
                }
                refetchFeeds({
                  queryParams: {
                    ...commonParams,
                    connectorRef: connectorRefValue?.toString(),
                    org: 'automation-cdc',
                    project: projectValue
                  }
                })
              }
            }}
          />
          {getMultiTypeFromValue(formik.values.feed) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={defaultTo(formik.values.feed, '')}
              type="String"
              variableName="feed"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('feed', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.Select name="packageType" label={getString('pipeline.packageType')} items={packageTypeOptions} />
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            selectItems={getItems(fetchingPackages, 'Packages', packageItems)}
            disabled={!isFieldFixedAndNonEmpty(formik.values?.feed)}
            label={getString('pipeline.artifactsSelection.packageName')}
            placeholder={getString('pipeline.artifactsSelection.packageNamePlaceholder')}
            name="package"
            useValue
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              selectProps: {
                noResults: (
                  <NoTagResults
                    tagError={fetchingPackageError}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={getString('pipeline.artifactsSelection.validation.noPackage')}
                  />
                ),
                itemRenderer: itemRenderer,
                items: getItems(fetchingPackages, 'Packages', packageItems),
                allowCreatingNewItems: true
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                ) {
                  return
                }
                refetchPackages({
                  queryParams: {
                    ...commonParams,
                    connectorRef: connectorRefValue?.toString(),
                    org: 'automation-cdc',
                    project: projectValue,
                    packageType: packageTypeValue || 'maven',
                    feed: feedValue || ''
                  }
                })
              }
            }}
          />
          {getMultiTypeFromValue(formik.values.package) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={defaultTo(formik.values.package, '')}
              type="String"
              variableName="package"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('package', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
        <div className={css.tagGroup}>
          <FormInput.RadioGroup
            label={getString('pipeline.artifactsSelection.versionDetails')}
            name="versionType"
            radioGroup={{ inline: true }}
            items={tagOptions}
            className={css.radioGroup}
          />
        </div>
        {formik.values.versionType === 'value' ? (
          <div className={css.jenkinsFieldContainer}>
            <FormInput.MultiTypeInput
              selectItems={getItems(fetchingVersions, 'Versions', versionItems)}
              disabled={isVersionFieldDisabled()}
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              name="version"
              useValue
              helperText={
                getMultiTypeFromValue(formik.values.version) === MultiTypeInputType.FIXED &&
                getHelpeTextForTags(
                  helperTextData(selectedArtifact as ArtifactType, formik, getConnectorRefQueryData()),
                  getString,
                  false
                )
              }
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  noResults: (
                    <NoTagResults
                      tagError={fetchingVersionError}
                      isServerlessDeploymentTypeSelected={false}
                      defaultErrorText={getString('pipeline.artifactsSelection.validation.noBuild')}
                    />
                  ),
                  itemRenderer: itemRenderer,
                  items: getItems(fetchingVersions, 'Versions', versionItems),
                  allowCreatingNewItems: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                  ) {
                    return
                  }
                  refetchVersions({
                    queryParams: {
                      ...commonParams,
                      connectorRef: connectorRefValue,
                      org: '',
                      packageType: packageTypeValue,
                      feed: feedValue,
                      package: packageValue
                    }
                  })
                }
              }}
            />
            {getMultiTypeFromValue(formik.values.version) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.version, '')}
                type="String"
                variableName="version"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => formik.setFieldValue('version', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        ) : (
          <div className={css.jenkinsFieldContainer}>
            <FormInput.MultiTextInput
              name="versionRegex"
              label={getString('pipeline.artifactsSelection.versionRegex')}
              placeholder={getString('pipeline.artifactsSelection.versionRegexPlaceholder')}
              disabled={isReadonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
            {getMultiTypeFromValue(formik.values.versionRegex) === MultiTypeInputType.RUNTIME && (
              <ConfigureOptions
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.versionRegex, '')}
                type="String"
                variableName="versionRegex"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => formik.setFieldValue('versionRegex', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        )}
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
  )
}

export function AzureArtifacts(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<AzureArtifactsInitialValues>
): React.ReactElement {
  const { getString } = useStrings()
  const { context, handleSubmit, initialValues, prevStepData, selectedArtifact, artifactIdentifiers } = props
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource

  const getInitialValues = (): AzureArtifactsInitialValues => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as AzureArtifactsInitialValues
  }

  const submitFormData = (formData: AzureArtifactsInitialValues, connectorId?: string): void => {
    const projectData: { project?: string } = {}
    if (formData.scope === 'project') {
      projectData.project = formData.project
    }
    const versionOrVersionRegex: { version?: string; versionRegex?: string } = {}
    if (formData.versionType === 'value') {
      versionOrVersionRegex.version = formData.version
    } else {
      versionOrVersionRegex.versionRegex = formData.versionRegex
    }
    handleSubmit({
      identifier: formData.identifier,
      spec: {
        connectorRef: connectorId,
        scope: formData.scope,
        feed: formData.feed,
        packageType: formData.packageType,
        package: formData.package,
        ...projectData,
        ...versionOrVersionRegex
      }
    })
  }

  const schemaObject = {
    scope: Yup.string(),
    project: Yup.string().when('scope', {
      is: val => val === 'project',
      then: Yup.string().trim().required(getString('common.validation.projectIsRequired'))
    }),
    feed: Yup.string().required('pipeline.artifactsSelection.validation.feed'),
    packageType: Yup.string(),
    package: Yup.string().required('pipeline.artifactsSelection.validation.packageName'),
    versionType: Yup.string(),
    versionRegex: Yup.string().when('versionType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.versionRegex'))
    }),
    version: Yup.mixed().when('versionType', {
      is: 'value',
      then: Yup.mixed().required(getString('validation.nexusVersion'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const schemaWithIdentifier = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isIdentifierAllowed ? schemaWithIdentifier : primarySchema}
        onSubmit={formData => {
          submitFormData(
            {
              ...formData
            },
            getConnectorIdValue(prevStepData)
          )
        }}
      >
        {formik => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
