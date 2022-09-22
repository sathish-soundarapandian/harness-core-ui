/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import * as Yup from 'yup'
import {
  Button,
  ButtonSize,
  ButtonVariation,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Text
} from '@wings-software/uicore'
import type { WinRmCredentialsValidationMetadata } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, SecretActions } from '@common/constants/TrackingConstants'
import VerifySecret, { Status } from './VerifySecret'
import css from './StepDetails.module.scss'

interface VerifyConnectionProps {
  identifier: string
  closeModal?: () => void
  showFinishBtn?: boolean
}

const VerifyConnection: React.FC<VerifyConnectionProps> = ({ identifier, closeModal, showFinishBtn = false }) => {
  const [validationMetadata, setValidationMetadata] = useState<WinRmCredentialsValidationMetadata>()
  const [finishStatus, setFinishStatus] = useState<Status | undefined>()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  return (
    <>
      <Container className={css.formData}>
        <Container width={300}>
          <Formik<WinRmCredentialsValidationMetadata>
            onSubmit={formData => {
              setValidationMetadata({
                type: 'WinRmCredentials',
                host: formData.host
              })
            }}
            formName="sshVerifyConnectionForm"
            initialValues={{
              type: 'WinRmCredentials',
              host: ''
            }}
            validationSchema={Yup.object().shape({
              host: Yup.string().trim().required()
            })}
          >
            {() => {
              return (
                <FormikForm>
                  <FormInput.Text
                    name="host"
                    label={getString('secrets.createSSHCredWizard.labelHostname')}
                    disabled={!!validationMetadata}
                  />
                  <Text font={{ size: 'xsmall', weight: 'bold' }}>
                    {getString('secrets.createSSHCredWizard.hostnameInfo')}
                  </Text>
                  {validationMetadata ? null : (
                    <Button
                      type="submit"
                      text={getString('common.smtp.testConnection')}
                      style={{ fontSize: 'smaller' }}
                      margin={{ top: 'medium' }}
                      variation={ButtonVariation.SECONDARY}
                      size={ButtonSize.SMALL}
                    />
                  )}
                </FormikForm>
              )
            }}
          </Formik>
        </Container>
        {validationMetadata ? (
          <Container margin={{ top: 'xxlarge' }}>
            <VerifySecret
              identifier={identifier as string}
              validationMetadata={validationMetadata}
              onFinish={status => {
                setFinishStatus(status)
              }}
            />
            {finishStatus && (
              <>
                <Button
                  text={getString('retry')}
                  variation={ButtonVariation.SECONDARY}
                  size={ButtonSize.SMALL}
                  margin={{ top: 'medium' }}
                  onClick={() => {
                    setValidationMetadata(undefined)
                  }}
                />
              </>
            )}
          </Container>
        ) : null}
      </Container>
      {showFinishBtn ? (
        <Container margin={{ top: 'large' }}>
          <Button
            text={getString('finish')}
            variation={ButtonVariation.SECONDARY}
            size={ButtonSize.SMALL}
            onClick={() => {
              trackEvent(SecretActions.SaveCreateSecret, {
                category: Category.SECRET,
                finishStatus,
                validationMetadata
              })
              /* istanbul ignore next */
              closeModal?.()
            }}
          />
        </Container>
      ) : null}
    </>
  )
}

export default VerifyConnection
