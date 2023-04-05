/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { Checkbox, Container, DropDown, Layout, SelectOption, Text } from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import type {
  MetadataListProjectsResponseBody,
  SaveSettingRequestBody,
  Setting
} from 'services/ticket-service/ticketServiceSchemas'
import {
  useMetadataListProjects,
  useSettingsGetSetting,
  useSettingsSaveSetting
} from 'services/ticket-service/ticketServiceComponents'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import IssueTypesDropDown from '@sto/components/ExternalTickets/Settings/IssueTypesDropDown'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ExternalTicketSettings.module.scss'

type Settings = {
  connector?: ConnectorSelectedValue | string
  projectKey?: string
  issueType?: string
}
const ExternalTicketSettings: React.FC = () => {
  const { getString } = useStrings()
  const {
    accountId,
    projectIdentifier: projectId,
    orgIdentifier: orgId,
    module
  } = useParams<ProjectPathProps & Optional<ModulePathParams>>()

  const { mutate } = useSettingsSaveSetting()

  const [ticketSettings, setTicketSettings] = useState<Settings | undefined>(undefined)

  const { data: settingsData, isLoading: isLoadingSettings } = useSettingsGetSetting<Setting>(
    {
      queryParams: { accountId, orgId, projectId, module }
    },
    { retry: false }
  )

  useEffect(() => {
    if (settingsData && !ticketSettings) {
      setTicketSettings({
        connector: settingsData.connectorId,
        projectKey: settingsData?.additional?.projectKey,
        issueType: settingsData?.additional?.issueType
      })
    }
  }, [settingsData, ticketSettings, setTicketSettings])

  // Refetching still has a race condition. Retrying once is a temporary workaround.
  const {
    data: projectData,
    isLoading: isLoadingProjects,
    refetch: refetchProjects
  } = useMetadataListProjects<MetadataListProjectsResponseBody>(
    {
      queryParams: { accountId, orgId, projectId, module: module || 'sto' }
    },
    { retry: false }
  )

  const projectItems: SelectOption[] | undefined = projectData?.projects.map(proj => ({
    label: `${proj.name} (${proj.key})`,
    value: proj.key
  }))

  return (
    <Container margin="xlarge" padding="xlarge" className={css.container}>
      <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }} margin={{ bottom: 'xlarge' }}>
        {getString('common.tickets.externalTickets')}
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
            orgIdentifier={orgId}
            projectIdentifier={projectId}
            type="Jira"
            selected={ticketSettings?.connector}
            disabled={isLoadingSettings}
            onChange={(value, scope) => {
              updateTicketSettings({
                connector: scope !== Scope.PROJECT ? `${scope}.${value.identifier}` : value.identifier,
                projectKey: undefined,
                issueType: undefined
              })
            }}
          />
        </div>
      </Layout.Horizontal>

      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'right' }} margin={{ bottom: 'large' }}>
        <Text className={css.minWidth}>{getString('common.tickets.defaultProjectName')}</Text>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <DropDown
            items={projectItems}
            value={ticketSettings?.projectKey}
            disabled={isLoadingSettings || isLoadingProjects}
            onChange={item => {
              updateTicketSettings({ projectKey: String(item.value) })
            }}
          />
        </div>
      </Layout.Horizontal>

      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'right' }} margin={{ bottom: 'large' }}>
        <Text className={css.minWidth}>{getString('common.tickets.defaultIssueType')}</Text>
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          {ticketSettings?.projectKey ? (
            <IssueTypesDropDown
              jiraProjectId={ticketSettings?.projectKey}
              value={ticketSettings?.issueType}
              disabled={isLoadingSettings || isLoadingProjects}
              onChange={item => {
                updateTicketSettings({ issueType: String(item.value) })
              }}
            />
          ) : (
            <DropDown items={[]} disabled onChange={() => undefined} />
          )}
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

  function updateTicketSettings(settings: Partial<Settings>) {
    const newSettings = { ...ticketSettings, ...settings }
    setTicketSettings(newSettings)

    const additional: SaveSettingRequestBody['additional'] = {
      ...(newSettings.projectKey ? { projectKey: newSettings.projectKey } : {}),
      ...(newSettings.issueType ? { issueType: newSettings.issueType } : {})
    }

    if (newSettings.connector) {
      const connectorId =
        typeof newSettings.connector === 'string' ? newSettings.connector : newSettings.connector.value

      mutate(
        {
          queryParams: { accountId, projectId, orgId, module },
          // Remove "module" and "as SaveSettingRequestBody" when API stabilizes:
          body: { additional, connectorId, module, service: 'Jira' } as SaveSettingRequestBody
        },
        {
          onSuccess: async () => await refetchProjects()
        }
      )
    }
  }
}

export default ExternalTicketSettings
