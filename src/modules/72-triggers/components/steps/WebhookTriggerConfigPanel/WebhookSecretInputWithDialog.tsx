/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { get } from 'lodash-es'
import { Button, Dialog, Layout, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { getSecretV2Promise, ResponseSecretResponseWrapper } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { getScopeBasedProjectPathParams, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import css from './WebhookTriggerConfigPanel.module.scss'

interface SecretInputWithDialogProps {
  formikProps: FormikProps<any>
}

const yamlWebhookSecretIdentifierName = 'encryptedWebhookSecretIdentifier'

const WebhookSecretInputWithDialog: React.FC<SecretInputWithDialogProps> = ({ formikProps }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loadingSecret, setLoadingSecret] = useState(false)
  const { showError } = useToaster()
  const secretValue = get(formikProps.values, yamlWebhookSecretIdentifierName)
  const isGithubWebhookAuthenticationEnabled = get(formikProps.values, 'isGithubWebhookAuthenticationEnabled')

  useEffect(() => {
    if (secretValue && typeof secretValue === 'string') {
      const scopeBasedProjectPathParams = getScopeBasedProjectPathParams(
        { accountId, orgIdentifier, projectIdentifier },
        getScopeFromValue(secretValue)
      )
      const identifier = secretValue.includes('.') ? secretValue.split('.')[1] : secretValue
      const controller = new AbortController()
      const updateFormikSecretValue = (response?: ResponseSecretResponseWrapper) => {
        formikProps.setFieldValue(yamlWebhookSecretIdentifierName, {
          identifier,
          name: get(response, 'data.secret.name', identifier),
          referenceString: secretValue,
          ...scopeBasedProjectPathParams
        })
      }
      const getSecretInfo = async (): Promise<void> => {
        setLoadingSecret(true)
        try {
          const response = await getSecretV2Promise(
            {
              identifier,
              queryParams: scopeBasedProjectPathParams
            },
            controller.signal
          )

          updateFormikSecretValue(response)
        } catch (e) {
          // Do not show the error if it is due to AbortController.
          if (!controller.signal.aborted) {
            showError(e.message)
            updateFormikSecretValue()
          }
        } finally {
          setLoadingSecret(false)
        }
      }

      getSecretInfo()

      return () => {
        controller.abort()
      }
    }
  }, [accountId, orgIdentifier, projectIdentifier, secretValue])

  const dialogFooter = (
    <Layout.Horizontal>
      <Button intent="primary" onClick={() => setIsDialogOpen(false)} text={getString('common.ok')} />
    </Layout.Horizontal>
  )
  const dialogName = (
    <Text
      font={{ variation: FontVariation.FORM_TITLE }}
      icon="execution-warning"
      iconProps={{ size: 32, margin: { right: 'small' }, color: Color.YELLOW_900 }}
    >
      {getString('triggers.triggerConfigurationPanel.copySecretDialogTitle')}
    </Text>
  )

  const secretInputLabel = `${getString('secrets.secret.configureSecret')} ${
    isGithubWebhookAuthenticationEnabled ? `` : `(${getString('projectsOrgs.optional')})`
  }`

  return (
    <div className={cx(css.nameIdDescriptionTags, css.secret)}>
      {loadingSecret ? (
        <Button loading={loadingSecret} style={{ width: '100%' }} />
      ) : (
        <SecretInput
          name={yamlWebhookSecretIdentifierName}
          label={secretInputLabel}
          onSuccess={() => {
            setIsDialogOpen(true)
          }}
          tooltipProps={{ dataTooltipId: 'encryptedWebhookSecretIdentifier' }}
        />
      )}
      <Dialog
        isOpen={isDialogOpen}
        title={dialogName}
        footer={dialogFooter}
        enforceFocus={false}
        onClose={() => setIsDialogOpen(false)}
        style={{ height: 280 }}
      >
        <Text>{getString('triggers.triggerConfigurationPanel.copySecretDialogContent')}</Text>
      </Dialog>
    </div>
  )
}

export default WebhookSecretInputWithDialog
