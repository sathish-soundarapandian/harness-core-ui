/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { get } from 'lodash-es'
import { FormInput, Text, TextInput, HarnessDocTooltip, Button, ButtonVariation } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { Connectors, connectorUrlType } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import {
  ConnectorReferenceField,
  ConnectorReferenceDTO
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { getCompleteConnectorUrl } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { GitSourceProviders, AWS_CODECOMMIT, AZURE_REPO } from '../Triggers/utils'

interface ConnectorSectionInterface {
  formikProps?: any
}

export const ConnectorSection: React.FC<ConnectorSectionInterface> = ({ formikProps }) => {
  const { getString } = useStrings()
  const {
    values: { sourceRepo, repoName, connectorRef },
    values
  } = formikProps
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  // undefined scope means added from + Add
  const [liveRepoName, setLiveRepoName] = React.useState(repoName || '')
  const setSelectedConnector = (value: ConnectorReferenceDTO, scope: Scope = Scope.PROJECT): void => {
    formikProps.setValues({
      ...values,
      connectorRef: {
        label: value.name || '',
        value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
        connector: value,
        live: value?.status?.status === 'SUCCESS'
      },
      repoName: ''
    })
    setLiveRepoName('')
  }

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: (data?: ConnectorConfigDTO) => {
      if (data?.connector) {
        setSelectedConnector(data.connector)
      }
    }
  })

  const getSourceRepo = useCallback((repoProvider: ConnectorConfigDTO['type']): string => {
    switch (repoProvider) {
      case GitSourceProviders.AWS_CODECOMMIT.value:
        return AWS_CODECOMMIT
      case GitSourceProviders.AZURE_REPO.value:
        return AZURE_REPO
      default:
        return repoProvider
    }
  }, [])

  const connectorUrl = connectorRef?.connector?.spec?.url
  const constructRepoUrl = `${connectorUrl}${connectorUrl?.endsWith('/') ? '' : '/'}`
  const updatedSourceRepo = getSourceRepo(sourceRepo)

  const renderRepoUrl = (): JSX.Element | null => {
    const connectorURLType = connectorRef?.connector?.spec?.type
    if (connectorURLType === connectorUrlType.REPO) {
      return (
        <>
          <Text
            font={{ variation: FontVariation.FORM_INPUT_TEXT, weight: 'semi-bold' }}
            color={Color.GREY_600}
            margin={{ bottom: 'xsmall' }}
            data-tooltip-id="repoUrl"
          >
            {getString('repositoryUrlLabel')}
          </Text>
          <HarnessDocTooltip tooltipId="repoUrl" useStandAlone={true} />
          <TextInput
            style={{ marginBottom: 'var(--spacing-xsmall)', borderColor: 'var(--bp3-intent-color, #dddddd)' }}
            value={connectorUrl}
            placeholder={getString('pipeline.repositoryUrlPlaceholder')}
            disabled
          />
        </>
      )
    } else if (
      [connectorUrlType.ACCOUNT, connectorUrlType.REGION, connectorUrlType.PROJECT].includes(connectorURLType)
    ) {
      return (
        <>
          <FormInput.Text
            style={{ marginBottom: 'var(--spacing-xsmall)' }}
            label={getString('common.repositoryName')}
            placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
            name="repoName"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLiveRepoName(e.target.value)}
          />
          <Text data-name="" style={{ marginBottom: 'var(--spacing-medium)' }} color={Color.GREY_400}>
            {getCompleteConnectorUrl({
              partialUrl: constructRepoUrl,
              repoName: liveRepoName,
              connectorType: get(connectorRef, 'connector.type', ''),
              gitAuthProtocol: get(connectorRef, 'connector.spec.authentication.type', '')
            })}
          </Text>
        </>
      )
    }
    return null
  }

  return (
    <section>
      <ConnectorReferenceField
        error={formikProps.errors.connectorRef}
        name="connectorRef"
        style={{ display: 'inline-block' }}
        width={324}
        type={Connectors[updatedSourceRepo?.toUpperCase()]}
        selected={formikProps.values.connectorRef}
        label={getString('connector')}
        placeholder={getString('connectors.selectConnector')}
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onChange={(value, scope) => {
          setSelectedConnector(value, scope)
          formikProps.validateForm()
        }}
        gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
      />
      <Button
        icon="plus"
        text={getString('add')}
        data-name="plusAdd"
        variation={ButtonVariation.LINK}
        iconProps={{ size: 12 }}
        margin={{ left: 'small' }}
        onClick={() => {
          openConnectorModal(false, Connectors[getSourceRepo(sourceRepo)?.toUpperCase()], {
            gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true }
          })
        }}
      />
      {renderRepoUrl()}
    </section>
  )
}

export default ConnectorSection
