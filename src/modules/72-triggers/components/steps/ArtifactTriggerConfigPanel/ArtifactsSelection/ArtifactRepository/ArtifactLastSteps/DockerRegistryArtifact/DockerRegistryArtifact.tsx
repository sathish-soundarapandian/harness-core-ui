/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, Layout, Button, StepProps, Text, ButtonVariation } from '@wings-software/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { DockerRegistrySpec } from 'services/pipeline-ng'
import type { ImagePathProps } from '../../../ArtifactInterface'
import ArtifactImagePath from '../ArtifactImagePath/ArtifactImagePath'
import css from '../../ArtifactConnector.module.scss'

export function DockerRegistryArtifact({
  handleSubmit,
  prevStepData,
  initialValues,
  previousStep
}: StepProps<ConnectorConfigDTO> & ImagePathProps<DockerRegistrySpec>): React.ReactElement {
  const { getString } = useStrings()
  const validationSchema = Yup.object().shape({
    imagePath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.imagePath'))
  })

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={initialValues}
        formName="imagePath"
        validationSchema={validationSchema}
        onSubmit={formData => {
          handleSubmit({
            ...formData,
            connectorRef: prevStepData?.connectorId?.value
          })
        }}
      >
        <Form>
          <div className={css.connectorForm}>
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
      </Formik>
    </Layout.Vertical>
  )
}
