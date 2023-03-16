/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
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
import cx from 'classnames'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import type { FormikProps } from 'formik'
import { StringKeys, useStrings } from 'framework/strings'
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
  shouldHideHeaderAndNavBtns,
  hasFixedDefiniteValue
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ArtifactType,
  AzureArtifactsInitialValues,
  ImagePathProps
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { isValueFixed } from '@common/utils/utils'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { ArtifactIdentifierValidation, ModalViewFor, scopeOptions, tagOptions } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import css from '../../ArtifactConnector.module.scss'

export const packageTypeOptions: SelectOption[] = [
  { label: 'Maven', value: RepositoryFormatTypes.Maven },
  { label: 'NuGet', value: RepositoryFormatTypes.NuGet }
]

function FormComponent(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<AzureArtifactsInitialValues> & { formik: FormikProps<any> }
): React.ReactElement {
  const {
    context,
    expressions,
    allowableTypes,
    prevStepData,
    previousStep,
    isReadonly = false,
    formik,
    isMultiArtifactSource,
    formClassName = ''
  } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [feedsData, setFeedsData] = React.useState<SelectOption[]>([])
  const [packageData, setPackageData] = React.useState<SelectOption[]>([])
  const [versionData, setVersionData] = React.useState<SelectOption[]>([])
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const connectorRefValue = getConnectorIdValue(prevStepData)
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)
  const projectValue = defaultTo(getGenuineValue(formik.values.project), '')
  const feedValue = defaultTo(getGenuineValue(formik.values.feed), '')
  const packageValue = defaultTo(getGenuineValue(formik.values.package), '')
  const packageTypeValue = defaultTo(getGenuineValue(formik.values.packageType), '')

  const getItems = (isFetching: boolean, label: StringKeys, items: SelectOption[]): SelectOption[] => {
    if (isFetching) {
      const labelStr = getString('common.loadingFieldOptions', { fieldName: getString(label) })
      return [{ label: labelStr, value: labelStr }]
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
      /* istanbul ignore next */ projectsResponse?.data?.map(
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
      /* istanbul ignore next */ feedsResponse?.data?.map(
        (feed: AzureArtifactsFeed) =>
          ({
            value: defaultTo(feed.name, ''),
            label: defaultTo(feed.name, '')
          } as SelectOption)
      ) || []
    )
  }, [feedsResponse?.data])

  useEffect(() => {
    if (feedItems && feedItems.length) {
      setFeedsData(feedItems)
    }
  }, [feedsResponse?.data, feedItems])

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
      /* istanbul ignore next */ packagesResponse?.data?.map(
        (packageItem: AzureArtifactsPackage) =>
          ({
            value: defaultTo(packageItem.name, ''),
            label: defaultTo(packageItem.name, '')
          } as SelectOption)
      ) || []
    )
  }, [packagesResponse?.data])

  React.useEffect(() => {
    if (packageItems && packagesResponse?.data) {
      setPackageData(packageItems)
    }
  }, [packagesResponse?.data, packageItems])

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
      /* istanbul ignore next */ versionResponse?.data?.map(
        (buildItem: BuildDetails) =>
          ({
            value: defaultTo(buildItem.number, ''),
            label: defaultTo(buildItem.number, '')
          } as SelectOption)
      ) || []
    )
  }, [versionResponse?.data])

  React.useEffect(() => {
    if (versionResponse?.data && versionItems) {
      setVersionData(versionItems)
    }
  }, [versionResponse?.data, versionItems])

  const versionItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingVersions} />
  ))
  const feedItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingFeeds} />
  ))
  const packageItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingPackages} />
  ))
  const projectItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingProjects} />
  ))

  const canFetchProject = hasFixedDefiniteValue(connectorRefValue)
  const isProjectFixed = () => {
    if (formik.values?.scope === 'project') {
      return hasFixedDefiniteValue(connectorRefValue) || hasFixedDefiniteValue(projectValue)
    }
    return false
  }
  const canFetchFeeds = isProjectFixed() || hasFixedDefiniteValue(connectorRefValue)

  const canFetchPackage =
    isProjectFixed() || hasFixedDefiniteValue(connectorRefValue) || hasFixedDefiniteValue(feedValue)

  const canFetchVersion =
    isProjectFixed() ||
    hasFixedDefiniteValue(connectorRefValue) ||
    hasFixedDefiniteValue(feedValue) ||
    hasFixedDefiniteValue(packageValue)

  const resetFormFields = (): void => {
    setFeedsData([])
    setPackageData([])
    setVersionData([])
  }

  return (
    <FormikForm>
      <div className={cx(css.artifactForm, formClassName)}>
        {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.imagePathContainer}>
          <FormInput.Select
            name="scope"
            label={getString('common.scopeLabel')}
            items={scopeOptions}
            onChange={
              /* istanbul ignore next */ () => {
                formik.setFieldValue('project', undefined)
              }
            }
          />
        </div>
        {formik.values?.scope === 'project' && (
          <div className={css.imagePathContainer}>
            <FormInput.MultiTypeInput
              selectItems={getItems(fetchingProjects, 'projectLabel', projectItems)}
              label={getString('projectLabel')}
              placeholder={getString('pipeline.artifactsSelection.projectPlaceholder')}
              name="project"
              useValue
              multiTypeInputProps={{
                expressions,
                allowableTypes,
                selectProps: {
                  itemRenderer: projectItemRenderer,
                  items: getItems(fetchingProjects, 'projectLabel', projectItems),
                  allowCreatingNewItems: true,
                  addClearBtn: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                    canFetchProject
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
                },
                onChange: (value: any) => {
                  const updatedValue = (value?.value ?? value) as string
                  if (formik.values.project !== updatedValue) {
                    formik.setValues({
                      ...formik.values,
                      project: updatedValue,
                      ...(isValueFixed(formik.values?.feed) && { feed: '' }),
                      ...(isValueFixed(formik.values?.package) && { package: '' }),
                      ...(isValueFixed(formik.values?.version) && { version: '' })
                    })
                    resetFormFields()
                  }
                }
              }}
            />
            {getMultiTypeFromValue(formik.values.project) === MultiTypeInputType.RUNTIME && (
              <SelectConfigureOptions
                options={getItems(fetchingProjects, 'projectLabel', projectItems)}
                loading={fetchingProjects}
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.project, '')}
                type="String"
                variableName="project"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => formik.setFieldValue('project', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        )}
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            selectItems={getItems(fetchingFeeds, 'pipeline.artifactsSelection.feed', feedItems)}
            disabled={isReadonly}
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
                itemRenderer: feedItemRenderer,
                items: getItems(fetchingFeeds, 'pipeline.artifactsSelection.feed', feedsData),
                allowCreatingNewItems: true,
                addClearBtn: true
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                  canFetchFeeds
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
              },
              onChange: (value: any) => {
                const updatedValue = (value?.value ?? value) as string
                if (formik.values.feed !== updatedValue) {
                  formik.setValues({
                    ...formik.values,
                    feed: updatedValue,
                    ...(isValueFixed(formik.values?.package) && { package: '' }),
                    ...(isValueFixed(formik.values?.version) && { version: '' })
                  })
                  setPackageData([])
                  setVersionData([])
                }
              }
            }}
          />
          {getMultiTypeFromValue(formik.values.feed) === MultiTypeInputType.RUNTIME && (
            <SelectConfigureOptions
              options={getItems(fetchingFeeds, 'pipeline.artifactsSelection.feed', feedItems)}
              loading={fetchingFeeds}
              style={{ marginTop: 22 }}
              value={defaultTo(formik.values.feed, '')}
              type="String"
              variableName="feed"
              showRequiredField={false}
              showDefaultField={false}
              onChange={value => formik.setFieldValue('feed', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.Select
            name="packageType"
            label={getString('pipeline.packageType')}
            items={packageTypeOptions}
            onChange={e => {
              formik.setFieldValue('packageType', e.value)

              if (getMultiTypeFromValue(formik.values.package) === MultiTypeInputType.FIXED) {
                formik.setFieldValue('package', '')
              }
            }}
          />
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            selectItems={getItems(fetchingPackages, 'pipeline.testsReports.callgraphField.package', packageItems)}
            disabled={isReadonly}
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
                itemRenderer: packageItemRenderer,
                items: getItems(fetchingPackages, 'pipeline.testsReports.callgraphField.package', packageData),
                allowCreatingNewItems: true,
                addClearBtn: true
              },
              onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                if (
                  e?.target?.type !== 'text' ||
                  (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                  canFetchPackage
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
              },
              onChange: (value: any) => {
                const updatedValue = (value?.value ?? value) as string
                if (formik.values.package !== updatedValue) {
                  formik.setValues({
                    ...formik.values,
                    package: updatedValue,
                    ...(isValueFixed(formik.values?.version) && { version: '' })
                  })
                  setVersionData([])
                }
              }
            }}
          />
          {getMultiTypeFromValue(formik.values.package) === MultiTypeInputType.RUNTIME && (
            <SelectConfigureOptions
              options={getItems(fetchingPackages, 'pipeline.testsReports.callgraphField.package', packageItems)}
              loading={fetchingPackages}
              style={{ marginTop: 22 }}
              value={defaultTo(formik.values.package, '')}
              type="String"
              variableName="package"
              showRequiredField={false}
              showDefaultField={false}
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
          <div className={css.imagePathContainer}>
            <FormInput.MultiTypeInput
              selectItems={getItems(fetchingVersions, 'version', versionItems)}
              disabled={isReadonly}
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              name="version"
              useValue
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
                  itemRenderer: versionItemRenderer,
                  items: getItems(fetchingVersions, 'version', versionData),
                  allowCreatingNewItems: true,
                  addClearBtn: true
                },
                onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                  if (
                    e?.target?.type !== 'text' ||
                    (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                    canFetchVersion
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
              <SelectConfigureOptions
                options={getItems(fetchingVersions, 'version', versionItems)}
                loading={fetchingVersions}
                style={{ marginTop: 22 }}
                value={defaultTo(formik.values.version, '')}
                type="String"
                variableName="version"
                showRequiredField={false}
                showDefaultField={false}
                onChange={value => formik.setFieldValue('version', value)}
                isReadonly={isReadonly}
              />
            )}
          </div>
        ) : (
          <div className={css.imagePathContainer}>
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
                onChange={value => formik.setFieldValue('versionRegex', value)}
                isReadonly={isReadonly}
                allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
              />
            )}
          </div>
        )}
      </div>
      {!hideHeaderAndNavBtns && (
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
      )}
    </FormikForm>
  )
}

export function AzureArtifacts(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<AzureArtifactsInitialValues>
): React.ReactElement {
  const { getString } = useStrings()
  const { context, handleSubmit, initialValues, prevStepData, selectedArtifact, artifactIdentifiers } = props
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const hideHeaderAndNavBtns = shouldHideHeaderAndNavBtns(context)

  const getInitialValues = (): AzureArtifactsInitialValues => {
    const vals = getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as AzureArtifactsInitialValues
    return vals
  }

  const handleValidate = (formData: AzureArtifactsInitialValues) => {
    if (hideHeaderAndNavBtns) {
      submitFormData(
        {
          ...formData
        },
        getConnectorIdValue(prevStepData)
      )
    }
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
    scope: Yup.string().required(getString('fieldRequired', { field: getString('common.scopeLabel') })),
    project: Yup.string().when('scope', {
      is: 'project',
      then: Yup.string()
        .trim()
        .required(getString('fieldRequired', { field: getString('projectLabel') }))
    }),
    feed: Yup.string().required(getString('fieldRequired', { field: getString('pipeline.artifactsSelection.feed') })),
    packageType: Yup.string().required(getString('fieldRequired', { field: getString('pipeline.packageType') })),
    package: Yup.string().required(
      getString('fieldRequired', { field: getString('pipeline.artifactsSelection.packageName') })
    ),
    versionType: Yup.string().required(
      getString('fieldRequired', { field: getString('pipeline.artifactsSelection.versionDetails') })
    ),
    versionRegex: Yup.string().when('versionType', {
      is: 'regex',
      then: Yup.string()
        .trim()
        .required(getString('fieldRequired', { field: getString('pipeline.artifactsSelection.versionRegex') }))
    }),
    version: Yup.string().when('versionType', {
      is: 'value',
      then: Yup.string()
        .trim()
        .required(getString('fieldRequired', { field: getString('version') }))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const schemaWithIdentifier = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      getString,
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!hideHeaderAndNavBtns && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isIdentifierAllowed ? schemaWithIdentifier : primarySchema}
        validate={handleValidate}
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
