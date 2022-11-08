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
  FormikForm
} from '@wings-software/uicore'
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
  useListProjectsForAzureArtifacts,
  useListFeedsForAzureArtifacts,
  useListPackagesForAzureArtifacts,
  AzureDevopsProject,
  AzureArtifactsFeed,
  AzureArtifactsPackage
} from 'services/cd-ng'
import { getConnectorIdValue, isFieldFixedAndNonEmpty } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import type { AzureArtifactsRegistrySpec } from 'services/pipeline-ng'
import { ModalViewFor, scopeOptions } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
import type { ImagePathProps } from '../../../ArtifactInterface'
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
  previousStep,
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
  const packageTypeValue = defaultTo(getGenuineValue(formik.values.packageType), '')

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

  const schemaObject = {
    scope: Yup.string(),
    project: Yup.string().when('scope', {
      is: val => val === 'project',
      then: Yup.string().trim().required(getString('common.validation.projectIsRequired'))
    }),
    feed: Yup.string().required('pipeline.artifactsSelection.validation.feed'),
    packageType: Yup.string(),
    package: Yup.string().required('pipeline.artifactsSelection.validation.packageName')
  }

  const primarySchema = Yup.object().shape(schemaObject)

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="azureArtifact"
        validationSchema={primarySchema}
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
