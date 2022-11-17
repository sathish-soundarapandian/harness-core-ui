/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import {
  Button,
  ButtonVariation,
  Text,
  Container,
  Formik,
  IconName,
  Layout,
  StepProps,
  ThumbnailSelect
} from '@harness/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'

import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ArtifactIconByType, ArtifactTitleIdByType } from '../ArtifactHelper'
import type { ArtifactType, InitialArtifactDataType } from '../ArtifactInterface'
import css from './ArtifactConnector.module.scss'

interface ArtifactPropType {
  changeArtifactType: (selected: ArtifactType) => void
  artifactTypes: Array<ArtifactType>
  selectedArtifact: ArtifactType | null
  artifactInitialValue: InitialArtifactDataType
  stepName: string
}

export function ArtifactoryRepoType({
  selectedArtifact,
  artifactTypes,
  changeArtifactType,
  stepName,
  artifactInitialValue,
  nextStep
}: StepProps<ConnectorConfigDTO> & ArtifactPropType): React.ReactElement {
  const [selectedArtifactType, setSelectedArtifactType] = React.useState(selectedArtifact)

  const handleOptionSelection = (selected: ArtifactType): void => {
    setSelectedArtifactType(selected)
    changeArtifactType(selected)
  }

  const gotoNextStep = (): void => {
    changeArtifactType(selectedArtifactType as ArtifactType)
    if (selectedArtifactType !== artifactInitialValue.submittedArtifact) {
      nextStep?.({ connectorId: '' })
    } else {
      nextStep?.()
    }
  }

  const { getString } = useStrings()

  const supportedArtifactTypes = useMemo(
    () =>
      artifactTypes.map(artifact => ({
        label: getString(ArtifactTitleIdByType[artifact]),
        icon: ArtifactIconByType[artifact] as IconName,
        value: artifact
      })),
    [artifactTypes]
  )
  return (
    <Container className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={{ artifactType: selectedArtifactType }}
        formName="artifactType"
        validationSchema={Yup.object().shape({
          artifactType: Yup.string().required(getString('pipeline.artifactsSelection.artifactTyperequired'))
        })}
        onSubmit={gotoNextStep}
        enableReinitialize={true}
      >
        {() => (
          <Form>
            <div className={css.headerContainer}>
              <Layout.Horizontal spacing="large">
                <ThumbnailSelect
                  className={css.thumbnailSelect}
                  name={'artifactType'}
                  items={supportedArtifactTypes}
                  onChange={handleOptionSelection}
                  layoutProps={{ className: css.wrapping }}
                />
              </Layout.Horizontal>
            </div>
            <Layout.Horizontal>
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                disabled={selectedArtifact === null}
                text={getString('continue')}
                rightIcon="chevron-right"
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Container>
  )
}
