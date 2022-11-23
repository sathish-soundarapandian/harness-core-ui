/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Button, Formik, FormikForm as Form, Layout, FormInput, SelectOption } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { Dialog, Classes } from '@blueprintjs/core'
import * as Yup from 'yup'
import cx from 'classnames'
import { NameSchema, EmailSchema } from '@common/utils/Validation'
import { useStrings } from 'framework/strings'
import css from './useContactSalesModal.module.scss'

interface UseContactSalesModalProps {
  onSubmit: (values: ContactSalesFormProps) => void
  onCloseModal?: () => void
}

export interface ContactSalesFormProps {
  fullName: string
  email: string
  countryName: string
  phone: {
    countryCode: string
    number: string
  }
  role: string
  orgName: string
  companySize: string
}

interface UseContactSalesModalReturn {
  openContactSalesModal: () => void
  closeContactSalesModal: () => void
}

//TO-DO: call backend api to get country codes and names
const countryCodeItems: SelectOption[] = []
const countryNameItems: SelectOption[] = []

const ContactSalesForm = ({ onSubmit }: { onSubmit: (values: ContactSalesFormProps) => void }): React.ReactElement => {
  const { getString } = useStrings()
  const roleItems: SelectOption[] = [
    {
      label: getString('common.banners.trial.contactSalesForm.roleItems.it'),
      value: 'IT'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.roleItems.devOps'),
      value: 'DevOps'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.roleItems.devSecOps'),
      value: 'DevSecOps'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.roleItems.softwareDeveloper'),
      value: 'Software Developer'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.roleItems.softwareArchitect'),
      value: 'Software Architect'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.roleItems.engineeringManager'),
      value: 'Engineering Manager'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.roleItems.engineeringDirector'),
      value: 'Engineering Director'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.roleItems.vp'),
      value: 'VP / Executive'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.roleItems.others'),
      value: 'Others'
    }
  ]

  const companySizeItems: SelectOption[] = [
    {
      label: getString('common.banners.trial.contactSalesForm.companySizeItems.below100'),
      value: '1-100 employees'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.companySizeItems.below500'),
      value: '101-500 employees'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.companySizeItems.below2000'),
      value: '501-2,000 employees'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.companySizeItems.below5000'),
      value: '2,001-5,000 employees'
    },
    {
      label: getString('common.banners.trial.contactSalesForm.companySizeItems.above5000'),
      value: '> 5,000 employees'
    }
  ]
  const validationSchema = Yup.object().shape({
    fullName: NameSchema(),
    email: EmailSchema(),
    countryName: Yup.string().trim().required(getString('common.banners.trial.contactSalesForm.countryValidation')),
    countryCode: Yup.string()
      .trim()
      .required(getString('common.banners.trial.contactSalesForm.phoneValidation.required')),
    number: Yup.number()
      .required(getString('common.banners.trial.contactSalesForm.phoneValidation.required'))
      .typeError(getString('common.banners.trial.contactSalesForm.phoneValidation.number')),
    role: Yup.string().trim().required(getString('common.banners.trial.contactSalesForm.roleValidation')),
    orgName: Yup.string().trim().required(getString('common.banners.trial.contactSalesForm.orgNameValidation')),
    companySize: Yup.string().trim().required(getString('common.banners.trial.contactSalesForm.companySizeValidation'))
  })

  return (
    <Formik
      formName="contactSalesModalForm"
      initialValues={{
        fullName: '',
        email: '',
        countryName: '',
        phone: {
          countryCode: '',
          number: ''
        },
        role: '',
        orgName: '',
        companySize: ''
      }}
      validationSchema={validationSchema}
      enableReinitialize={true}
      onSubmit={onSubmit}
    >
      <Form>
        <Layout.Vertical padding={{ bottom: 'xxlarge' }} spacing="small">
          <Text font={{ size: 'large', weight: 'bold' }} color={Color.BLACK}>
            {getString('common.banners.trial.contactSales')}
          </Text>
          <Text>{getString('common.banners.trial.contactSalesForm.description')}</Text>
        </Layout.Vertical>
        <FormInput.Text name={'fullName'} label={getString('common.banners.trial.contactSalesForm.fullName')} />
        <FormInput.Text name={'email'} label={getString('common.banners.trial.contactSalesForm.email')} />
        <FormInput.Select
          label={getString('common.banners.trial.contactSalesForm.country')}
          name={'countryName'}
          items={countryNameItems}
        />
        <Layout.Vertical spacing="xsmall" padding={{ bottom: 'xsmall' }}>
          <Text> {getString('common.banners.trial.contactSalesForm.phone')}</Text>
          <Layout.Horizontal padding={{ top: 'xsmall' }}>
            <FormInput.Select
              className={css.phone}
              style={{ paddingBottom: 'xsmall' }}
              name={'countryCode'}
              items={countryCodeItems}
            />
            <FormInput.Text
              className={css.contactNumber}
              name={'number'}
              placeholder={getString('common.banners.trial.contactSalesForm.phonePlaceHolder')}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
        <FormInput.Select
          label={getString('common.banners.trial.contactSalesForm.role')}
          name={'role'}
          items={roleItems}
        />
        <FormInput.Text name={'orgName'} label={getString('common.banners.trial.contactSalesForm.orgName')} />
        <FormInput.Select
          label={getString('common.banners.trial.contactSalesForm.companySize')}
          name={'companySize'}
          items={companySizeItems}
        />
        <Button margin={{ top: 'xlarge' }} intent="primary" text={getString('submit')} type="submit" />
      </Form>
    </Formik>
  )
}

export const useContactSalesModal = ({
  onCloseModal,
  onSubmit
}: UseContactSalesModalProps): UseContactSalesModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal(), onCloseModal?.()
        }}
        className={cx(css.dialog, Classes.DIALOG, css.contactSales)}
      >
        <ContactSalesForm onSubmit={onSubmit} />
        <Button
          aria-label="close modal"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal(), onCloseModal?.()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    []
  )

  return {
    openContactSalesModal: showModal,
    closeContactSalesModal: hideModal
  }
}
