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
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import { Form } from 'formik'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { NexusRegistrySpec } from 'services/pipeline-ng'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ImagePathProps, RepositoryPortOrServer } from '../../../ArtifactInterface'
import { repositoryPortOrServer } from '../../../ArtifactHelper'
import ArtifactImagePath from '../ArtifactImagePath/ArtifactImagePath'
import css from '../../ArtifactConnector.module.scss'

export function NexusArtifact({
  handleSubmit,
  prevStepData,
  initialValues,
  previousStep
}: StepProps<ConnectorConfigDTO> & ImagePathProps<NexusRegistrySpec>): React.ReactElement {
  const { getString } = useStrings()

  const validationSchema = Yup.object().shape({
    imagePath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.artifactPath')),
    repositoryName: Yup.string().trim().required(getString('common.git.validation.repoRequired')),
    repositoryUrl: Yup.string().when('repositoryFormat', {
      is: 'repositoryUrl',
      then: Yup.string().required(getString('pipeline.artifactsSelection.validation.repositoryUrl'))
    }),
    repositoryPort: Yup.string().when('repositoryFormat', {
      is: 'repositoryPort',
      then: Yup.string().required(getString('pipeline.artifactsSelection.validation.repositoryPort'))
    })
  })

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="nexusArtifact"
        validationSchema={validationSchema}
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            ...(formData.repositoryFormat === RepositoryPortOrServer.RepositoryUrl && {
              repositoryUrl: formData.repositoryUrl
            }),
            ...(formData.repositoryFormat === RepositoryPortOrServer.RepositoryPort && {
              repositoryPort: formData.repositoryPort
            }),
            connectorRef: prevStepData?.connectorId?.value
          })
        }}
      >
        {({ values }) => (
          <Form>
            <div className={css.connectorForm}>
              <div className={css.tagGroup}>
                <FormInput.RadioGroup
                  name="repositoryFormat"
                  radioGroup={{ inline: true }}
                  items={repositoryPortOrServer}
                  className={css.radioGroup}
                />
              </div>

              {values.repositoryFormat === RepositoryPortOrServer.RepositoryUrl && (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    label={getString('repositoryUrlLabel')}
                    name="repositoryUrl"
                    placeholder={getString('pipeline.repositoryUrlPlaceholder')}
                    multiTextInputProps={{
                      allowableTypes: [MultiTypeInputType.FIXED]
                    }}
                  />
                </div>
              )}

              {values.repositoryFormat === RepositoryPortOrServer.RepositoryPort && (
                <div className={css.imagePathContainer}>
                  <FormInput.MultiTextInput
                    label={getString('pipeline.artifactsSelection.repositoryPort')}
                    name="repositoryPort"
                    placeholder={getString('pipeline.artifactsSelection.repositoryPortPlaceholder')}
                    multiTextInputProps={{
                      allowableTypes: [MultiTypeInputType.FIXED]
                    }}
                  />
                </div>
              )}

              <div className={css.imagePathContainer}>
                <FormInput.MultiTextInput
                  label={getString('repository')}
                  name="repositoryName"
                  placeholder={getString('pipeline.artifactsSelection.repositoryPlaceholder')}
                  multiTextInputProps={{
                    allowableTypes: [MultiTypeInputType.FIXED]
                  }}
                />
              </div>

              <ArtifactImagePath />
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
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default NexusArtifact
