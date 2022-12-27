/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Formik,
  FormInput,
  Layout,
  MultiTypeInputType,
  Button,
  StepProps,
  Text,
  ButtonVariation
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { repositoryFormats, RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import type { ArtifactoryRegistrySpec } from 'services/pipeline-ng'
import ServerlessArtifactoryRepository from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/Artifactory/ServerlessArtifactoryRepository'
import { getConnectorIdValue, getConnectorRefQueryData } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import ArtifactoryArtifactPath from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/Artifactory/ArtifactoryArtifactPath'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { ImagePathProps } from '../../../ArtifactInterface'
import css from '../../ArtifactConnector.module.scss'

function Artifactory({
  handleSubmit,
  prevStepData,
  initialValues,
  previousStep
}: StepProps<ConnectorConfigDTO> & ImagePathProps<ArtifactoryRegistrySpec>): React.ReactElement {
  const { getString } = useStrings()
  const CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY = useFeatureFlag(FeatureFlag.CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY)
  const validationSchema = Yup.object().shape({
    repositoryFormat: Yup.string().required(getString('triggers.validation.repositoryFormat')),
    repository: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    artifactDirectory: Yup.string().when('repositoryFormat', {
      is: `${RepositoryFormatTypes.Generic}`,
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactDirectory'))
    }),
    artifactPath: Yup.string().when('repositoryFormat', {
      is: `${RepositoryFormatTypes.Docker}`,
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactPath'))
    }),
    ...(CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY && {
      repositoryUrl: Yup.string().when('repositoryFormat', {
        is: `${RepositoryFormatTypes.Docker}`,
        then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.repositoryUrl'))
      })
    })
  })

  const defaultTag = '<+trigger.artifact.build>'

  const getInitialValues = (repositoryFormat = ''): any => {
    const {
      artifactDirectory = '',
      repositoryUrl = '',
      artifactPath = '',
      repository = '',
      eventConditions = '',
      tag = defaultTag
    } = initialValues
    const artifactCommonValue = { repository, repositoryFormat, eventConditions }

    if (repositoryFormat === RepositoryFormatTypes.Docker) {
      return {
        artifactPath: initialValues.repositoryFormat === RepositoryFormatTypes.Generic ? '' : artifactPath,
        tag,
        repositoryUrl,
        ...artifactCommonValue
      }
    }

    return {
      artifactPath: defaultTag,
      artifactDirectory,
      ...artifactCommonValue
    }
  }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues(initialValues.repositoryFormat)}
        formName="artifactoryArtifact"
        validationSchema={validationSchema}
        onSubmit={formData => {
          const { repositoryFormat, artifactPath, repository, eventConditions } = formData
          handleSubmit({
            repositoryFormat,
            repository,
            ...(repositoryFormat === RepositoryFormatTypes.Generic && {
              artifactPath: defaultTag,
              artifactDirectory: formData.artifactDirectory
            }),
            ...(repositoryFormat === RepositoryFormatTypes.Docker && {
              artifactPath,
              repositoryUrl: formData.repositoryUrl,
              tag: defaultTag
            }),
            connectorRef: prevStepData?.connectorId?.value,
            eventConditions
          })
        }}
      >
        {formik => {
          const { values, setValues, setFieldValue } = formik
          const isGenericRepositoryFormat = values.repositoryFormat === RepositoryFormatTypes.Generic
          const isDockerRepositoryFormat = values.repositoryFormat === RepositoryFormatTypes.Docker
          return (
            <Form>
              <div className={css.connectorForm}>
                <div className={css.imagePathContainer}>
                  <FormInput.Select
                    name="repositoryFormat"
                    label={getString('common.repositoryFormat')}
                    items={repositoryFormats}
                    onChange={value => {
                      setValues(getInitialValues(value?.value as string))
                      setFieldValue('repositoryFormat', value?.value)
                    }}
                  />
                </div>
                <div className={css.imagePathContainer}>
                  <ServerlessArtifactoryRepository
                    connectorRef={getConnectorIdValue(prevStepData)}
                    expressions={[]}
                    allowableTypes={[MultiTypeInputType.FIXED]}
                    formik={formik}
                    repoFormat={formik.values.repositoryFormat}
                    fieldName={'repository'}
                  />
                </div>
                {isGenericRepositoryFormat && (
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.artifactDirectory')}
                      name="artifactDirectory"
                      placeholder={getString('pipeline.artifactsSelection.artifactDirectoryPlaceholder')}
                      multiTextInputProps={{
                        allowableTypes: [MultiTypeInputType.FIXED]
                      }}
                    />
                  </div>
                )}
                {isDockerRepositoryFormat && (
                  <>
                    <div className={css.imagePathContainer}>
                      <ArtifactoryArtifactPath
                        expressions={[]}
                        isReadonly={false}
                        allowableTypes={[MultiTypeInputType.FIXED]}
                        formik={formik}
                        connectorRef={getConnectorRefQueryData(prevStepData)}
                        repository={formik.values.repository}
                        fieldName={'artifactPath'}
                      />
                    </div>
                    <div className={css.imagePathContainer}>
                      <FormInput.MultiTextInput
                        label={getString('repositoryUrlLabel')}
                        name="repositoryUrl"
                        placeholder={getString('pipeline.repositoryUrlPlaceholder')}
                        multiTextInputProps={{
                          allowableTypes: [MultiTypeInputType.FIXED]
                        }}
                        isOptional={!CDS_ARTIFACTORY_REPOSITORY_URL_MANDATORY}
                      />
                    </div>
                  </>
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
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
export default Artifactory
