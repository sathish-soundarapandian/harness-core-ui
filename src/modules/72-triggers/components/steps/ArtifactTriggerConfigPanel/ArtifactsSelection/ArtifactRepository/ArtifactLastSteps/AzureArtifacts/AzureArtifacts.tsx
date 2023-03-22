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
  SelectOption,
  FormInput,
  FormikForm,
  MultiTypeInputType
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { IItemRendererProps } from '@blueprintjs/select'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import {
  ConnectorConfigDTO,
  useListProjectsForAzureArtifacts,
  useListFeedsForAzureArtifacts,
  useListPackagesForAzureArtifacts,
  AzureDevopsProject,
  AzureArtifactsFeed,
  AzureArtifactsPackage
} from 'services/cd-ng'
import { getConnectorIdValue, isFieldFixedAndNonEmpty } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import type { AzureArtifactsRegistrySpec } from 'services/pipeline-ng'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'
import { scopeOptions } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

export const packageTypeOptions: SelectOption[] = [
  { label: 'Maven', value: RepositoryFormatTypes.Maven },
  { label: 'NuGet', value: RepositoryFormatTypes.NuGet }
]

function FormComponent(
  props: StepProps<ConnectorConfigDTO> &
    ImagePathProps<AzureArtifactsRegistrySpec> & { formik: FormikProps<AzureArtifactsRegistrySpec> }
): React.ReactElement {
  const { prevStepData, previousStep, formik } = props
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

  const connectorRefValue = getConnectorIdValue(prevStepData)
  const projectValue = defaultTo(formik.values.project, '')
  const feedValue = defaultTo(formik.values.feed, '')
  const packageTypeValue = defaultTo(formik.values.packageType, '')

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
      connectorRef: connectorRefValue?.toString(),
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
      connectorRef: connectorRefValue?.toString(),
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
      connectorRef: connectorRefValue?.toString(),
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

  const feedItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingFeeds} />
  ))
  const packageItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingPackages} />
  ))
  const projectItemRenderer = memoize((item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={fetchingProjects} />
  ))

  const isFeedDisabled = (): boolean => {
    if (formik.values?.scope === 'org') {
      return false
    }
    return !isFieldFixedAndNonEmpty(formik.values?.project || '')
  }

  return (
    <FormikForm>
      <div className={css.connectorForm}>
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
              selectItems={getItems(fetchingProjects, getString('projectsText'), projectItems)}
              label={getString('projectLabel')}
              placeholder={getString('pipeline.artifactsSelection.projectPlaceholder')}
              name="project"
              useValue
              multiTypeInputProps={{
                allowableTypes: [MultiTypeInputType.FIXED],
                selectProps: {
                  itemRenderer: projectItemRenderer,
                  items: getItems(fetchingProjects, getString('projectsText'), projectItems),
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
          </div>
        )}
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            selectItems={getItems(fetchingFeeds, getString('pipeline.feedsText'), feedItems)}
            disabled={isFeedDisabled()}
            label={getString('pipeline.artifactsSelection.feed')}
            placeholder={getString('pipeline.artifactsSelection.feedPlaceholder')}
            name="feed"
            useValue
            multiTypeInputProps={{
              allowableTypes: [MultiTypeInputType.FIXED],
              selectProps: {
                noResults: (
                  <NoTagResults
                    tagError={fetchingFeedsError}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={getString('pipeline.artifactsSelection.validation.noFeeds')}
                  />
                ),
                itemRenderer: feedItemRenderer,
                items: getItems(fetchingFeeds, getString('pipeline.feedsText'), feedItems),
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
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.Select name="packageType" label={getString('pipeline.packageType')} items={packageTypeOptions} />
        </div>
        <div className={css.imagePathContainer}>
          <FormInput.MultiTypeInput
            selectItems={getItems(fetchingPackages, getString('packagesLabel'), packageItems)}
            disabled={!isFieldFixedAndNonEmpty(formik.values?.feed || '')}
            label={getString('pipeline.artifactsSelection.packageName')}
            placeholder={getString('pipeline.artifactsSelection.packageNamePlaceholder')}
            name="package"
            useValue
            multiTypeInputProps={{
              selectProps: {
                noResults: (
                  <NoTagResults
                    tagError={fetchingPackageError}
                    isServerlessDeploymentTypeSelected={false}
                    defaultErrorText={getString('pipeline.artifactsSelection.validation.noPackage')}
                  />
                ),
                itemRenderer: packageItemRenderer,
                items: getItems(fetchingPackages, getString('packagesLabel'), packageItems),
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
    </FormikForm>
  )
}

export function AzureArtifacts(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<AzureArtifactsRegistrySpec>
): React.ReactElement {
  const { getString } = useStrings()
  const { handleSubmit, initialValues, prevStepData } = props

  const submitFormData = (formData: AzureArtifactsRegistrySpec, connectorId?: string): void => {
    const projectData: { project?: string } = {}
    if (formData.scope === 'project') {
      projectData.project = formData.project
    }
    handleSubmit({
      connectorRef: connectorId,
      scope: formData.scope,
      feed: formData.feed,
      packageType: formData.packageType,
      package: formData.package,
      ...projectData
    })
  }

  const primarySchema = Yup.object().shape({
    scope: Yup.string(),
    project: Yup.string().when('scope', {
      is: val => val === 'project',
      then: Yup.string().trim().required(getString('common.validation.projectIsRequired'))
    }),
    feed: Yup.string().required('pipeline.artifactsSelection.validation.feed'),
    packageType: Yup.string(),
    package: Yup.string().required('pipeline.artifactsSelection.validation.packageName')
  })

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="azureArtifact"
        validationSchema={primarySchema}
        onSubmit={(formData: AzureArtifactsRegistrySpec) => {
          submitFormData(
            {
              ...formData
            },
            getConnectorIdValue(prevStepData)
          )
        }}
      >
        {(formik: any) => {
          return <FormComponent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
