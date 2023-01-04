/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  FormInput,
  FormikForm,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo, memoize } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'

import { ConnectorConfigDTO, useGetRepositories } from 'services/cd-ng'
import { nexus2RepositoryFormatTypes, RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import type { Nexus2RegistrySpec } from 'services/pipeline-ng'

import { useMutateAsGet, useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

export function Nexus2Artifact({
  handleSubmit,
  prevStepData,
  initialValues,
  previousStep
}: StepProps<ConnectorConfigDTO> & ImagePathProps<Nexus2RegistrySpec>): React.ReactElement {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const getConnectorRefQueryData = (): string => {
    return defaultTo(prevStepData?.connectorId?.value, prevStepData?.identifier)
  }

  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }

  const {
    data: repositoryDetails,
    refetch: refetchRepositoryDetails,
    loading: fetchingRepository,
    error: errorFetchingRepository
  } = useMutateAsGet(useGetRepositories, {
    lazy: true,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      ...commonParams,
      connectorRef: getConnectorRefQueryData(),
      repositoryFormat: ''
    }
  })

  const selectRepositoryItems = useMemo(() => {
    return repositoryDetails?.data?.map(repository => ({
      value: defaultTo(repository.repositoryId, ''),
      label: defaultTo(repository.repositoryId, '')
    }))
  }, [repositoryDetails?.data])

  const getRepository = (): { label: string; value: string }[] => {
    if (fetchingRepository) {
      return [
        {
          label: getString('pipeline.artifactsSelection.loadingRepository'),
          value: getString('pipeline.artifactsSelection.loadingRepository')
        }
      ]
    }
    return defaultTo(selectRepositoryItems, [])
  }

  const primarySchema = Yup.object().shape({
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    repositoryFormat: Yup.string()
      .trim()
      .required(getString('pipeline.artifactsSelection.validation.repositoryFormat')),
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

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingRepository}
        onClick={handleClick}
      />
    </div>
  ))

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="nexus2Trigger"
        validationSchema={primarySchema}
        onSubmit={(formData: Nexus2RegistrySpec) => {
          handleSubmit({
            ...formData,
            connectorRef: prevStepData?.connectorId?.value
          })
        }}
      >
        {formik => (
          <FormikForm>
            <div className={cx(css.artifactForm)}>
              <div className={css.imagePathContainer}>
                <FormInput.Select
                  name="repositoryFormat"
                  label={getString('common.repositoryFormat')}
                  items={nexus2RepositoryFormatTypes}
                />
              </div>
              <div className={css.imagePathContainer}>
                <FormInput.MultiTypeInput
                  selectItems={getRepository()}
                  label={getString('repository')}
                  name="repository"
                  placeholder={getString('pipeline.artifactsSelection.repositoryPlaceholder')}
                  useValue
                  multiTypeInputProps={{
                    allowableTypes: [MultiTypeInputType.FIXED],
                    selectProps: {
                      noResults: (
                        <NoTagResults
                          tagError={errorFetchingRepository}
                          isServerlessDeploymentTypeSelected={false}
                          defaultErrorText={getString('pipeline.artifactsSelection.errors.noRepositories')}
                        />
                      ),
                      itemRenderer: itemRenderer,
                      items: getRepository(),
                      allowCreatingNewItems: true
                    },
                    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                      if (
                        e?.target?.type !== 'text' ||
                        (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING) ||
                        getMultiTypeFromValue(formik.values?.repositoryFormat) === MultiTypeInputType.RUNTIME
                      ) {
                        return
                      }
                      refetchRepositoryDetails({
                        queryParams: {
                          ...commonParams,
                          connectorRef: getConnectorRefQueryData(),
                          repositoryFormat: formik.values?.repositoryFormat
                        }
                      })
                    }
                  }}
                />
              </div>
              {formik.values?.repositoryFormat === RepositoryFormatTypes.Maven ? (
                <>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED]
                      }}
                      label={getString('pipeline.artifactsSelection.groupId')}
                      name="groupId"
                      placeholder={getString('pipeline.artifactsSelection.groupIdPlaceholder')}
                    />
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED]
                      }}
                      label={getString('pipeline.artifactsSelection.artifactId')}
                      name="artifactId"
                      placeholder={getString('pipeline.artifactsSelection.artifactIdPlaceholder')}
                    />
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED]
                      }}
                      label={getString('pipeline.artifactsSelection.extension')}
                      name="extension"
                      placeholder={getString('pipeline.artifactsSelection.extensionPlaceholder')}
                    />
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      multiTextInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED]
                      }}
                      label={getString('pipeline.artifactsSelection.classifier')}
                      name="classifier"
                      placeholder={getString('pipeline.artifactsSelection.classifierPlaceholder')}
                    />
                  </div>
                </>
              ) : (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    multiTextInputProps={{
                      allowableTypes: [MultiTypeInputType.FIXED]
                    }}
                    label={getString('pipeline.artifactsSelection.packageName')}
                    name="packageName"
                    placeholder={getString('pipeline.manifestType.packagePlaceholder')}
                  />
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
        )}
      </Formik>
    </Layout.Vertical>
  )
}
