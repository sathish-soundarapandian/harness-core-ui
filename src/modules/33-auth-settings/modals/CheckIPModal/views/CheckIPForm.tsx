/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import * as Yup from 'yup'
import { defaultTo } from 'lodash-es'
import { Intent } from '@blueprintjs/core'
import { Form } from 'formik'
import type { Column, Renderer, CellProps } from 'react-table'

import {
  Layout,
  Formik,
  FormInput,
  Text,
  Button,
  Icon,
  Container,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation,
  TableV2,
  Toggle
} from '@harness/uicore'
import { validateIpAddressAllowlistedOrNot } from '@harnessio/react-ng-manager-client'
import type { IpAllowlistConfigValidateResponse, IpAllowlistConfigResponse } from '@harnessio/react-ng-manager-client'
import { Color, FontVariation } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import { regexIpV4orV6 } from '@common/utils/StringUtils'
import type { StepTestIPForm } from '@auth-settings/components/CreateIPAllowlist/StepTestIP/StepTestIP'
import {
  RenderColumnName,
  RenderColumnIPAddress
} from '@auth-settings/components/IPAllowlistTableColumns/IPAllowlistTableColumns'
import css from '../useCheckIPModal.module.scss'

interface CheckIPModalData {
  onClose: () => void
}

const RenderColumnEnabled: Renderer<CellProps<IpAllowlistConfigResponse>> = ({ value }) => {
  const { getString } = useStrings()
  return (
    <Toggle
      data-testid="toggleEnabled"
      checked={value === true}
      label={!value ? getString('common.disabled') : getString('enabledLabel')}
      disabled={true}
      margin
    />
  )
}

const CheckIPForm: React.FC<CheckIPModalData> = ({ onClose }) => {
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const [validatedResponse, setValidatedResponse] = useState<IpAllowlistConfigValidateResponse>({})

  const handleSubmit = async (formData: StepTestIPForm): Promise<void> => {
    try {
      const response = await validateIpAddressAllowlistedOrNot({
        queryParams: { ip_address: formData.testIP }
      })
      setValidatedResponse(response.content)
    } catch (error) {
      modalErrorHandler?.showDanger(error as string)
    }
  }

  const columns: Column<IpAllowlistConfigResponse>[] = useMemo(
    () => [
      {
        Header: getString('status'),
        id: 'enabled',
        accessor: row => row.ip_allowlist_config.enabled,
        width: '30%',
        Cell: RenderColumnEnabled
      },
      {
        Header: getString('name'),
        id: 'name',
        accessor: row => row.ip_allowlist_config.name,
        width: '30%',
        Cell: RenderColumnName
      },
      {
        Header: getString('authSettings.ipAddress.ipAddressCIDR'),
        id: 'ipAddress',
        accessor: row => row.ip_allowlist_config.ip_address,
        width: '40%',
        Cell: RenderColumnIPAddress
      }
    ],
    []
  )

  const { allowlisted_configs } = validatedResponse
  const showTable = defaultTo(allowlisted_configs?.length, 0) > 0
  const successTestIP = validatedResponse.allowed_for_api || validatedResponse.allowed_for_ui
  const failTestIP = validatedResponse.allowed_for_api === false && validatedResponse.allowed_for_ui === false
  let intent: Intent = Intent.NONE
  let message = ''
  if (successTestIP) {
    intent = Intent.SUCCESS
    message = getString('authSettings.ipAddress.aPartOfAllowlist')
  } else if (failTestIP) {
    intent = Intent.DANGER
    message = getString('authSettings.ipAddress.notAPartOfAllowlist')
  }
  return (
    <Layout.Vertical padding={{ bottom: 'xxxlarge', right: 'xxxlarge', left: 'xxxlarge' }}>
      <Layout.Vertical spacing="large">
        <Text color={Color.GREY_900} font={{ size: 'medium', weight: 'semi-bold' }}>
          {getString('authSettings.ipAddress.checkIPForAllowlist')}
        </Text>
        <Formik<StepTestIPForm>
          initialValues={{
            testIP: ''
          }}
          formName="CheckIPForm"
          validationSchema={Yup.object().shape({
            testIP: Yup.string()
              .required(getString('authSettings.ipAddress.ipRequired'))
              .matches(regexIpV4orV6, getString('authSettings.ipAddress.ipInvalid'))
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
            handleSubmit(values)
          }}
        >
          {formikProps => {
            return (
              <Form>
                <Container className={css.form}>
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <Layout.Vertical margin={{ bottom: 'medium' }}>
                    <FormInput.Text
                      name="testIP"
                      label={getString('authSettings.ipAddress.testIPIfPartOfAllowlist')}
                      intent={intent}
                      onChange={() => {
                        setValidatedResponse({}) // resetting
                      }}
                    />
                    {message && (
                      <Text intent={intent}>
                        <Icon
                          name={failTestIP ? 'solid-error' : 'success-tick'}
                          size={15}
                          margin={{ right: 'small' }}
                        />
                        {message}
                      </Text>
                    )}
                  </Layout.Vertical>
                  {!showTable ? (
                    <Layout.Horizontal spacing="small">
                      <Button type="submit" intent="primary" variation={ButtonVariation.SECONDARY}>
                        {getString('authSettings.ipAddress.check')}
                      </Button>
                    </Layout.Horizontal>
                  ) : (
                    <>
                      <Text
                        color={Color.GREY_800}
                        font={{ variation: FontVariation.BODY1 }}
                        padding={{ top: 'medium', bottom: 'small' }}
                      >
                        {getString('authSettings.ipAddress.allowedAsAPartOf')}
                      </Text>
                      <TableV2
                        className={css.checkIpFormTable}
                        data={defaultTo(allowlisted_configs, [])}
                        columns={columns}
                      />
                      <Layout.Horizontal spacing="small">
                        <Button
                          variation={ButtonVariation.PRIMARY}
                          text={getString('done')}
                          onClick={() => {
                            onClose()
                          }}
                        />
                        <Button
                          text={getString('authSettings.ipAddress.checkAnotherIP')}
                          onClick={() => {
                            formikProps.resetForm()
                            setValidatedResponse({})
                          }}
                          variation={ButtonVariation.TERTIARY}
                        />
                      </Layout.Horizontal>
                    </>
                  )}
                </Container>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default CheckIPForm
