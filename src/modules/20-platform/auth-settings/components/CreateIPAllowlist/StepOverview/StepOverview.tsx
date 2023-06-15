/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import { pick, defaultTo } from 'lodash-es'

import type { StepProps } from '@harness/uicore'
import {
  Layout,
  Container,
  Formik,
  Text,
  FormikForm,
  Button,
  ButtonVariation,
  ModalErrorHandlerBinding,
  ModalErrorHandler
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { validateUniqueIpAllowlistConfigIdentifier } from '@harnessio/react-ng-manager-client'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import type { IIPAllowlistForm } from '@auth-settings/interfaces/IPAllowlistInterface'
import { String, useStrings } from 'framework/strings'

import css from '../CreateIPAllowlistWizard.module.scss'

interface StepOverviewProps extends StepProps<IIPAllowlistForm> {
  data: IIPAllowlistForm
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  name: string
}

export type OverviewForm = Pick<IIPAllowlistForm, 'name' | 'identifier' | 'description' | 'tags'>

const StepOverview: React.FC<StepProps<OverviewForm> & StepOverviewProps> = props => {
  const { data, name, isEditMode: isEdit, prevStepData, nextStep } = props
  const { getString } = useStrings()
  const [loading, setLoading] = useState<boolean>(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const handleSubmit = async (formData: OverviewForm): Promise<void> => {
    if (isEdit) {
      nextStep?.({ ...prevStepData, ...formData })
      return
    }
    setLoading(true)
    try {
      const response = await validateUniqueIpAllowlistConfigIdentifier({
        'ip-config-identifier': formData.identifier
      })
      if (!response.content) {
        modalErrorHandler?.showDanger(
          getString('authSettings.ipAddress.duplicateIdError', {
            name: formData.name,
            identifier: formData.identifier
          })
        )
        return
      } else {
        nextStep?.({ ...prevStepData, ...formData })
      }
    } catch (err: any) {
      modalErrorHandler?.showDanger(
        defaultTo(err.message, getString('authSettings.ipAddress.validateUniqueIdentifierError'))
      )
    } finally {
      setLoading(false)
    }
  }

  const getInitialValues = () => {
    if (isEdit) {
      return {
        ...pick(data, ['name', 'identifier', 'description', 'tags']),
        ...(prevStepData && pick(prevStepData, ['name', 'identifier', 'description', 'tags']))
      }
    } else if (prevStepData) {
      return { ...pick(prevStepData, ['name', 'identifier', 'description', 'tags']) }
    } else {
      return {
        name: '',
        description: '',
        identifier: '',
        tags: {}
      }
    }
  }

  return (
    <Layout.Vertical spacing="xxlarge" className={css.firstStep}>
      <Text font={{ variation: FontVariation.H3 }}>{name}</Text>
      <ModalErrorHandler bind={setModalErrorHandler} style={{ maxWidth: '740px' }} />
      <Container>
        <Formik<OverviewForm>
          initialValues={getInitialValues()}
          formName={name}
          enableReinitialize={false}
          onSubmit={values => {
            handleSubmit(values)
          }}
          validationSchema={Yup.object().shape({
            name: NameSchema(getString),
            identifier: IdentifierSchema(getString)
          })}
        >
          {formikProps => {
            return (
              <FormikForm>
                <Container className={css.fieldsContainer}>
                  <NameIdDescriptionTags
                    className={css.formElm}
                    formikProps={formikProps}
                    identifierProps={{
                      inputName: 'name',
                      idName: 'identifier',
                      isIdentifierEditable: !isEdit,
                      maxInput: 128
                    }}
                  />
                </Container>
                <Layout.Horizontal>
                  <Button
                    type="submit"
                    intent="primary"
                    rightIcon="chevron-right"
                    variation={ButtonVariation.PRIMARY}
                    disabled={loading}
                  >
                    <String stringID="continue" />
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

export default StepOverview
