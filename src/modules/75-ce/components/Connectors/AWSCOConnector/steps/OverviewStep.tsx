/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import {
  Layout,
  Button,
  StepProps,
  Heading,
  Formik,
  FormikForm,
  Container,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import type { ConnectorInfoDTO, ConnectorConfigDTO } from 'services/cd-ng'
import { validateTheIdentifierIsUniquePromise, Failure } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { StringUtils } from '@common/exports'
import {
  AddDescriptionAndKVTagsWithIdentifier,
  FormikForAddDescriptionandKVTags
} from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'
import type { permission as PermissionType } from '../constants'
import { CO_PERMISSION, CE_PERMISSION, COCE_PERMISSION } from '../constants'
import css from './Steps.module.scss'

interface OverviewDetails {
  name: string
  identifier: string
  description: string
  tags: Record<string, any>
  billingPermission?: boolean
  eventsPermission?: boolean
  optimizationPermission?: boolean
}

export type OverviewForm = Pick<
  OverviewDetails,
  'name' | 'identifier' | 'description' | 'tags' | 'billingPermission' | 'eventsPermission' | 'optimizationPermission'
>

interface OverviewStepProps extends StepProps<ConnectorInfoDTO> {
  type: ConnectorInfoDTO['type']
  name: string
  permission: PermissionType
}

const OverviewStep: React.FC<StepProps<ConnectorConfigDTO> & OverviewStepProps> = props => {
  const { nextStep, permission } = props
  const { getString } = useStrings()
  const cePermission = permission === CE_PERMISSION || permission === COCE_PERMISSION
  const coPermission = permission === CO_PERMISSION || permission === COCE_PERMISSION
  // const [billing, setBilling] = useState(cePermission)
  // const [events, setEvents] = useState(cePermission)
  // const toggleBilling = (): void => setBilling(!billing)
  // const toggleEvents = (): void => setEvents(!events)
  const [loading, setLoading] = useState(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    accountId: string
    projectIdentifier: string
    orgIdentifier: string
  }>()
  const randomString = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
  const handleSubmit = async (values: OverviewDetails): Promise<void> => {
    setLoading(true)
    try {
      modalErrorHandler?.hide()
      const response = await validateTheIdentifierIsUniquePromise({
        queryParams: {
          identifier: values.identifier,
          accountIdentifier: accountId,
          orgIdentifier: orgIdentifier,
          projectIdentifier: projectIdentifier
        }
      })
      setLoading(false)

      if ('SUCCESS' === response.status) {
        if (response.data) {
          const spec: ConnectorConfigDTO = {
            billingPermission: values.billingPermission,
            eventsPermission: values.eventsPermission,
            optimizationPermission: values.optimizationPermission,
            roleARN: '',
            externalID: randomString()
          }
          const connectorDetails: ConnectorInfoDTO = {
            name: values.name,
            identifier: values.identifier,
            description: values.description,
            tags: values.tags,
            type: 'CEAws',
            spec: spec
          }
          nextStep?.(connectorDetails)
        } else {
          modalErrorHandler?.showDanger('ID uniqueness check failed')
        }
      } else {
        throw response as Failure
      }
    } catch (error) {
      setLoading(false)
      modalErrorHandler?.showDanger(error.data?.message || error.message)
    }
  }
  return (
    <Layout.Vertical data-id={'todo'} spacing="xlarge" className={css.containerLayout}>
      <Heading level={2} font={{ weight: 'bold' }}>
        {getString('ce.connector.AWS.overview.title')}
      </Heading>
      <Formik<OverviewForm>
        initialValues={{
          name: '',
          description: '',
          identifier: '',
          tags: {},
          billingPermission: cePermission,
          eventsPermission: cePermission,
          optimizationPermission: coPermission
        }}
        formName="connectorOverview"
        onSubmit={values => {
          handleSubmit(values)
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString('ce.connector.AWS.overview.validation.name')),
          identifier: Yup.string().when('name', {
            is: val => val?.length,
            then: Yup.string()
              .trim()
              .required(getString('ce.connector.AWS.overview.validation.identifier.required'))
              .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('ce.connector.AWS.overview.validation.identifier.format'))
              .notOneOf(StringUtils.illegalIdentifiers)
          })
        })}
      >
        {formikProps => {
          return (
            <FormikForm className={css.fullHeight}>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <Container padding={{ top: 'large', bottom: 'large' }} className={css.fullHeight}>
                <AddDescriptionAndKVTagsWithIdentifier
                  formikProps={formikProps as FormikProps<FormikForAddDescriptionandKVTags>}
                  identifierProps={{ inputName: 'name', inputLabel: getString('ce.connector.AWS.overview.label') }}
                />
              </Container>
              <Button
                intent="primary"
                type="submit"
                text={getString('ce.connector.AWS.overview.submitText')}
                rightIcon="chevron-right"
                loading={loading}
                disabled={loading}
                className={css.nextButton}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default OverviewStep
