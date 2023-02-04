/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { debounce } from 'lodash-es'
import { Color } from '@harness/design-system'
import { Checkbox, Container, Layout, Text, TextInput } from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { Setting } from 'services/ticket-service/ticketServiceSchemas'
import { useSettingsGetSetting, useSettingsSaveSetting } from 'services/ticket-service/ticketServiceComponents'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TicketSettings.module.scss'

type Settings = {
  connector?: ConnectorSelectedValue | string
  projectKey?: string
}
const TicketSettings: React.FC<{ debounceDelay?: number }> = ({ debounceDelay = 1000 }) => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier, module } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()

  const { mutate } = useSettingsSaveSetting()

  const delayedMutate = React.useRef(
    debounce((newSettings: Settings) => {
      if (newSettings.connector && newSettings.projectKey) {
        const connectorId =
          typeof newSettings.connector === 'string' ? newSettings.connector : newSettings.connector.value
        mutate(
          {
            queryParams: { accountId, projectId: projectIdentifier, orgId: orgIdentifier },
            body: {
              additional: { projectKey: newSettings.projectKey },
              connectorId,
              module,
              service: 'Jira'
            }
          },
          {}
        )
      }
    }, debounceDelay)
  ).current

  const [ticketSettings, setTicketSettings] = useState<Settings | undefined>(undefined)

  const { data } = useSettingsGetSetting<Setting>({
    queryParams: { accountId, projectId: projectIdentifier, orgId: orgIdentifier, module: module || 'sto' }
  })

  useEffect(() => {
    if (data && !ticketSettings) {
      setTicketSettings({
        connector: data?.connectorId,
        projectKey: data?.additional?.projectKey
      })
    }
  }, [data, ticketSettings, setTicketSettings])

  return (
    <Container margin="xlarge" padding="xlarge" className={css.container}>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }} margin={{ bottom: 'xlarge' }}>
        {getString('common.tickets.tickets')}
      </Text>
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'right' }} margin={{ bottom: 'large' }}>
        <Text className={css.minWidth}>{getString('common.tickets.connector')}</Text>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <ConnectorReferenceField
            name="ticketConnector"
            label={''}
            width={'100%'}
            className={css.connector}
            placeholder={getString('common.tickets.selectConnector')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            type="Jira"
            selected={ticketSettings?.connector}
            onChange={(value, scope) => {
              updateTicketSettings({
                connector: scope !== Scope.PROJECT ? `${scope}.${value.identifier}` : value.identifier
              })
            }}
          />
        </div>
      </Layout.Horizontal>

      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'right' }} margin={{ bottom: 'large' }}>
        <Text className={css.minWidth}>{getString('common.tickets.defaultProjectName')}</Text>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <TextInput
            value={ticketSettings?.projectKey}
            title="defaultProjectName"
            name="defaultProjectName"
            placeholder={getString('common.tickets.selectProjectName')}
            onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
              updateTicketSettings({ projectKey: ev.target.value })
            }}
          />
        </div>
      </Layout.Horizontal>

      <Layout.Horizontal margin={{ bottom: 'large' }}>
        <Checkbox disabled={true} name={'ticketComment'} label={getString('common.tickets.ticketComment')} />
      </Layout.Horizontal>

      <Layout.Horizontal margin={{ bottom: 'large' }}>
        <Checkbox disabled={true} name={'ticketExemption'} label={getString('common.tickets.ticketExemption')} />
      </Layout.Horizontal>
    </Container>
  )

  function updateTicketSettings(settings: Partial<Settings>): void {
    const newSettings = { ...ticketSettings, ...settings }
    setTicketSettings(newSettings)
    delayedMutate(newSettings)
  }
}

export default TicketSettings
