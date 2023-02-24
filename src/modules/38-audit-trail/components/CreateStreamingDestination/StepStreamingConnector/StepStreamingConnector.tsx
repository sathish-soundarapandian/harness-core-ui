/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, pick } from 'lodash-es'
import * as Yup from 'yup'

import type { StepProps } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { StreamingDestinationSpecDto } from '@harnessio/react-audit-service-client'
import {
  CardSelect,
  CardBody,
  Text,
  FormInput,
  Formik,
  FormikForm,
  Layout,
  Button,
  ButtonVariation,
  Container
} from '@harness/uicore'
import { createStreamingDestinations, updateStreamingDestination } from '@harnessio/react-audit-service-client'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { ConnectorRefSchema } from '@common/utils/Validation'
import { useToaster } from '@common/exports'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { Connectors } from '@connectors/constants'
import { getConnectorIdentifierWithScope } from '@connectors/utils/utils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import type { IStreamingDestinationForm } from '@audit-trail/interfaces/LogStreamingInterface'
import { StreamingDestinationSpecDTOTypeMap } from '@audit-trail/interfaces/LogStreamingInterface'
import {
  buildCreateStreamingDestinationPayload,
  buildStreamingDestinationSpecByType,
  buildUpdateSDPayload
} from '@audit-trail/utils/RequestUtil'
import { String, useStrings } from 'framework/strings'
import css from '../CreateStreamingDestinationWizard.module.scss'

interface StepStreamingConnectorProps extends StepProps<IStreamingDestinationForm> {
  data: IStreamingDestinationForm
  name: string
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
}

interface CardSelectInterface {
  text: string
  value: StreamingDestinationSpecDto['type']
  icon: string
  disabled?: boolean
}

export const CONNECTOR_TYPE: Record<string, ConnectorInfoDTO['type']> = {
  AWS_S3: Connectors.AWS
}

const CARDS: CardSelectInterface[] = [
  {
    text: 'Amazon S3',
    value: StreamingDestinationSpecDTOTypeMap.AWS_S3,
    icon: 'service-service-s3'
  }
]

const getConnectorIdWithoutScope = (connectorRef: string): string => {
  let connectorId = connectorRef
  const splitted = connectorRef.split('.')
  if (splitted && splitted?.length > 1) {
    connectorId = splitted[1]
  }
  return connectorId
}

export type StepStreamingConnectorForm = Pick<IStreamingDestinationForm, 'connector_ref' | 'type' | 'bucket' | 'status'>

const StepStreamingConnector: React.FC<StepProps<StepStreamingConnectorForm> & StepStreamingConnectorProps> = props => {
  const { prevStepData, nextStep, name, setIsEditMode, isEditMode: isEdit, data } = props
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const { accountId, orgIdentifier } = useParams<OrgPathProps>()
  const [selectedCard, setSelectedCard] = useState(CARDS[0])
  const [connectorDetails, setConnectorDetails] = useState<string>(
    prevStepData?.connector_ref || data?.connector_ref || ''
  )
  const [loading, setLoading] = useState<boolean>(false)
  const streamingDestinationType = selectedCard.value
  const connectorType = CONNECTOR_TYPE[streamingDestinationType]

  const getInitialValues = () => {
    if (isEdit) {
      return {
        ...pick(data, ['connector_ref', 'type', 'bucket', 'status']),
        ...(prevStepData && pick(prevStepData, ['connector_ref', 'type', 'bucket', 'status']))
      }
    } else if (prevStepData) {
      return { ...pick(prevStepData, ['connector_ref', 'type', 'bucket', 'status']), type: streamingDestinationType }
    } else {
      return {
        connector_ref: '',
        type: '',
        bucket: '',
        status: 'INACTIVE'
      }
    }
  }

  const renderAWSS3Fields = (): JSX.Element => {
    return (
      <FormInput.Text
        label={getString('auditTrail.logStreaming.amazonS3Bucket')}
        name="bucket"
        placeholder={getString('common.bucketName')}
      />
    )
  }

  const getAWSS3Validations = () => {
    return { bucket: Yup.string().required(getString('validation.bucketRequired')) }
  }

  const getFieldsAndValidationsByDestinationType = (type: StreamingDestinationSpecDto['type']) => {
    switch (type) {
      case StreamingDestinationSpecDTOTypeMap.AWS_S3: {
        return { fields: renderAWSS3Fields(), validations: getAWSS3Validations() }
      }

      default:
        return { fields: <></>, validations: {} }
    }
  }

  const onStreamingConnectorSubmit = (formData: any) => {
    setLoading(true)
    if (isEdit) {
      const updateSDPayload = buildUpdateSDPayload(
        {
          connector_ref: formData.connector_ref,
          identifier: formData.streamingDestinationIdentifier || prevStepData?.streamingDestinationIdentifier,
          name: formData.name,
          spec: buildStreamingDestinationSpecByType({ ...formData }),
          status: formData.status || 'INACTIVE'
        },
        { ...prevStepData }
      )
      updateStreamingDestination(updateSDPayload)
        .then(response => {
          const { streaming_destination: updatedStreamingDestination } = response
          if (updatedStreamingDestination?.identifier && updatedStreamingDestination?.name) {
            showSuccess(
              getString('auditTrail.logStreaming.streamingDestinationSaved', {
                name: updatedStreamingDestination.name
              })
            )
          }
          nextStep?.({
            ...prevStepData,
            ...formData,
            ...{ identifier: getConnectorIdWithoutScope(formData.connector_ref) }
          })
        })
        .catch((err: any) => {
          showError(defaultTo(err?.data?.message, err?.message))
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      const createSDPayload = buildCreateStreamingDestinationPayload({ ...prevStepData, ...formData })
      createStreamingDestinations({ body: createSDPayload })
        .then(response => {
          if (response?.streaming_destination?.identifier) {
            showSuccess(
              getString('auditTrail.logStreaming.streamingDestinationCreated', {
                name: response?.streaming_destination?.name
              })
            )
            setIsEditMode(true)
            nextStep?.({
              ...prevStepData,
              ...formData,
              ...{ identifier: getConnectorIdWithoutScope(formData.connector_ref) }
            })
          }
        })
        .catch(e => {
          const rbacErrorMessage = getRBACErrorMessage(e)
          showError(rbacErrorMessage)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  const cardSelectProps = {
    data: CARDS,
    className: css.grid,
    renderItem: (item: any, selected: any) => (
      <CardBody.Icon icon={item.icon} iconSize={25}>
        <Text font={{ size: 'small', align: 'center' }} color={selected ? 'var(--grey-900)' : 'var(--grey-350)'}>
          {item.text}
        </Text>
      </CardBody.Icon>
    ),
    cornerSelected: true
  }
  const { fields: fieldsByDestinationType, validations: validationsByDestinationType } =
    getFieldsAndValidationsByDestinationType(selectedCard.value)

  const initialValues = getInitialValues()

  return (
    <Layout.Vertical spacing="xxlarge">
      <Text font={{ variation: FontVariation.H3 }}>{name}</Text>
      <Container>
        <Formik
          formName="streamingConnectorForm"
          onSubmit={onStreamingConnectorSubmit}
          initialValues={initialValues}
          validationSchema={Yup.object().shape({
            connector_ref: ConnectorRefSchema(getString),
            ...validationsByDestinationType
          })}
        >
          {formikProps => {
            return (
              <FormikForm className={css.fullHeightDivsWithFlex}>
                <Container className={css.fieldsContainer}>
                  <Layout.Vertical spacing="huge">
                    <CardSelect
                      {...cardSelectProps}
                      selected={selectedCard}
                      onChange={(value: any) => {
                        setSelectedCard(value)
                        formikProps.setFieldValue('type', value)
                      }}
                    />
                    <Container>
                      {selectedCard && (
                        <ConnectorReferenceField
                          className={css.formElm}
                          name="connector_ref"
                          placeholder={getString('connectors.selectConnector')}
                          selected={connectorDetails}
                          error={
                            formikProps.submitCount > 0 ? (formikProps?.errors?.connector_ref as string) : undefined
                          }
                          onChange={(connector, scope) => {
                            const connectorRefWithScope = getConnectorIdentifierWithScope(scope, connector?.identifier)
                            formikProps.setFieldValue('connector_ref', connectorRefWithScope)
                            setConnectorDetails?.(connectorRefWithScope)
                          }}
                          accountIdentifier={accountId}
                          orgIdentifier={orgIdentifier}
                          label={getString('connectors.selectConnector')}
                          type={connectorType}
                        />
                      )}
                      <Container className={css.formElm}>{fieldsByDestinationType}</Container>
                    </Container>
                  </Layout.Vertical>
                </Container>
                <Layout.Horizontal spacing="medium">
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => {
                      props?.previousStep?.(props?.prevStepData)
                    }}
                    data-name="back"
                    variation={ButtonVariation.SECONDARY}
                  />
                  <Button
                    type="submit"
                    intent="primary"
                    rightIcon="chevron-right"
                    disabled={loading}
                    variation={ButtonVariation.PRIMARY}
                  >
                    <String stringID="saveAndContinue" />
                  </Button>
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

export default StepStreamingConnector
