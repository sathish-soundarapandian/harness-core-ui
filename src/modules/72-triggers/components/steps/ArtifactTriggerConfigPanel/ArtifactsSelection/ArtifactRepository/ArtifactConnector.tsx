/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Button,
  ButtonVariation,
  Text,
  Formik,
  FormikForm,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  StepProps,
  ButtonSize
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ArtifactTriggerConfig } from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import { ArtifactConnectorLabelMap, ArtifactToConnectorMap } from '../ArtifactHelper'
import type { ArtifactType, InitialArtifactDataType } from '../ArtifactInterface'
import css from './ArtifactConnector.module.scss'

interface ArtifactConnectorProps {
  handleViewChange: () => void
  stepName: string
  initialValues: InitialArtifactDataType
  selectedArtifact: ArtifactTriggerConfig['type']
}

export function ArtifactConnector(props: StepProps<ConnectorConfigDTO> & ArtifactConnectorProps): React.ReactElement {
  const { nextStep, initialValues, stepName, selectedArtifact, handleViewChange, prevStepData } = props

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const connectorType = ArtifactToConnectorMap[selectedArtifact as ArtifactType]
  const selectedConnectorLabel = ArtifactConnectorLabelMap[selectedArtifact as ArtifactType]
  const selectedConnectorTooltip = ArtifactToConnectorMap[selectedArtifact as ArtifactType]

  const connectorLabel = `${selectedConnectorLabel} ${getString('connector')}`
  const connectorPlaceholder = `${getString('select')} ${selectedConnectorLabel} ${getString('connector')}`
  const newConnectorLabel = `${getString('newLabel')} ${selectedConnectorLabel} ${getString('connector')}`

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.CONNECTOR
    },
    permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
  })

  const primarySchema = Yup.object().shape({
    connectorId: Yup.string()
      .trim()
      .required(`${connectorType} ${getString('pipelineSteps.build.create.connectorRequiredError')}`)
  })

  const submitFirstStep = async (formData: InitialArtifactDataType): Promise<void> => {
    nextStep?.({ ...formData })
  }

  const getInitialValues = (): InitialArtifactDataType => {
    const connectorId = prevStepData?.connectorId?.value ?? initialValues.connectorId
    const submittedArtifact = prevStepData?.submittedArtifact ?? initialValues.submittedArtifact

    return {
      connectorId,
      submittedArtifact
    }
  }

  return (
    <Layout.Vertical spacing="xxlarge" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={primarySchema}
        formName="artifactConnForm"
        onSubmit={formData => {
          submitFirstStep(formData)
        }}
      >
        {formik => (
          <FormikForm>
            <div className={css.connectorForm}>
              <Layout.Horizontal
                spacing={'medium'}
                flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
                className={css.connectorContainer}
              >
                <FormMultiTypeConnectorField
                  name="connectorId"
                  tooltipProps={{ dataTooltipId: `connectorId_${selectedConnectorTooltip}` }}
                  label={connectorLabel}
                  placeholder={connectorPlaceholder}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={400}
                  multiTypeProps={{ allowableTypes: [MultiTypeInputType.FIXED] }}
                  isNewConnectorLabelVisible={
                    !(getMultiTypeFromValue(formik.values.connectorId) === MultiTypeInputType.RUNTIME && !canCreate)
                  }
                  createNewLabel={newConnectorLabel}
                  type={connectorType}
                  enableConfigureOptions={false}
                  selected={formik?.values?.connectorId}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
                <Button
                  variation={ButtonVariation.LINK}
                  size={ButtonSize.SMALL}
                  id="new-artifact-connector"
                  text={newConnectorLabel}
                  icon="plus"
                  iconProps={{ size: 12 }}
                  disabled={!canCreate}
                  onClick={() => {
                    handleViewChange()
                    nextStep?.()
                  }}
                  className={css.addNewArtifact}
                />
              </Layout.Horizontal>
            </div>
            <Layout.Horizontal spacing="medium">
              <Button
                variation={ButtonVariation.PRIMARY}
                type="submit"
                text={getString('continue')}
                rightIcon="chevron-right"
                disabled={!(formik.values.connectorId as ConnectorSelectedValue)?.connector}
              />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
