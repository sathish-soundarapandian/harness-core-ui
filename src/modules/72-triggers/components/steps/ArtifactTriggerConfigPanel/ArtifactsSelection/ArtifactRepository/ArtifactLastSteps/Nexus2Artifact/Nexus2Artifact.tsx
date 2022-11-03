/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { Formik, Layout, Button, StepProps, Text, ButtonVariation, FormInput, FormikForm } from '@wings-software/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import { ConnectorConfigDTO, DockerBuildDetailsDTO } from 'services/cd-ng'
import { nexus2RepositoryFormatTypes, RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import type { Nexus2RegistrySpec } from 'services/pipeline-ng'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'

import type { queryInterface } from '../NexusArtifact/NexusArtifact'
import type { ImagePathProps } from '../../../ArtifactInterface'
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
  isMultiArtifactSource,
  formClassName = ''
}: StepProps<ConnectorConfigDTO> & ImagePathProps<Nexus2RegistrySpec>): React.ReactElement {
  const { getString } = useStrings()

  const schemaObject = {
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
  }

  const primarySchema = Yup.object().shape(schemaObject)

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="imagePath"
        validationSchema={primarySchema}
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: prevStepData?.connectorId?.value
          })
        }}
      >
        {formik => (
          <FormikForm>
            <div className={cx(css.artifactForm, formClassName)}>
              {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
              {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
              <div className={css.imagePathContainer}>
                <FormInput.Select
                  name="repositoryFormat"
                  label={getString('common.repositoryFormat')}
                  items={nexus2RepositoryFormatTypes}
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
              </div>
              {formik.values?.repositoryFormat === RepositoryFormatTypes.Maven ? (
                <>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.groupId')}
                      name="groupId"
                      placeholder={getString('pipeline.artifactsSelection.groupIdPlaceholder')}
                    />
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.artifactId')}
                      name="artifactId"
                      placeholder={getString('pipeline.artifactsSelection.artifactIdPlaceholder')}
                    />
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.extension')}
                      name="extension"
                      placeholder={getString('pipeline.artifactsSelection.extensionPlaceholder')}
                    />
                  </div>
                  <div className={css.imagePathContainer}>
                    <FormInput.MultiTextInput
                      label={getString('pipeline.artifactsSelection.classifier')}
                      name="classifier"
                      placeholder={getString('pipeline.artifactsSelection.classifierPlaceholder')}
                    />
                  </div>
                </>
              ) : (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
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
