/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import { Text, Container, ButtonVariation, Card, PageError } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { TokenDTO, useListAggregatedApiKeys } from 'services/cd-ng'
import type { ProjectPathProps, ServiceAccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useApiKeyModal } from '@rbac/modals/ApiKeyModal/useApiKeyModal'
import { useTokenModal } from '@rbac/modals/TokenModal/useTokenModal'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { PageSpinner } from '@common/components'
import ApiKeyCard from '@rbac/components/ApiKeyList/views/ApiKeyCard'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'

import css from './ApiKeyList.module.scss'

interface ApiKeyListProps {
  apiKeyType?: TokenDTO['apiKeyType']
  parentIdentifier?: string
}

const ApiKeyList: React.FC<ApiKeyListProps> = ({ apiKeyType = 'SERVICE_ACCOUNT', parentIdentifier }) => {
  const { accountId, projectIdentifier, orgIdentifier, serviceAccountIdentifier } = useParams<
    ProjectPathProps & ServiceAccountPathProps
  >()
  const { getString } = useStrings()
  const [refetchTokens, setRefetchTokens] = useState<boolean>(false)
  const { data, refetch, error, loading } = useListAggregatedApiKeys({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      apiKeyType,
      parentIdentifier: parentIdentifier || serviceAccountIdentifier
    }
  })

  const { openApiKeyModal } = useApiKeyModal({
    onSuccess: refetch,
    parentIdentifier: parentIdentifier || serviceAccountIdentifier,
    apiKeyType
  })

  const onRefetchComplete = (): void => {
    setRefetchTokens(false)
  }

  const { openTokenModal } = useTokenModal({
    onSuccess: () => {
      refetch()
      setRefetchTokens(true)
    },
    parentIdentifier: parentIdentifier || serviceAccountIdentifier,
    apiKeyType
  })

  const { getRBACErrorMessage } = useRBACError()

  return (
    <Container padding={{ bottom: 'xlarge' }}>
      <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
        {apiKeyType === 'SERVICE_ACCOUNT' ? getString('common.apiKeys') : getString('rbac.myApiKeys')}
      </Text>
      <Container padding={{ top: 'medium', bottom: 'medium' }}>
        {loading && <PageSpinner />}
        {error && <PageError message={getRBACErrorMessage(error)} onClick={() => refetch()} />}
        {isEmpty(data?.data?.content) ? (
          <Card className={css.fullWidth}>
            <Text color={Color.GREY_500} padding={{ top: 'xsmall' }}>
              {getString('common.noAPIKeys')}
            </Text>
          </Card>
        ) : (
          data?.data?.content?.map(apiKey => (
            <ApiKeyCard
              key={apiKey.apiKey.identifier}
              data={apiKey}
              refetchApiKeys={refetch}
              openTokenModal={openTokenModal}
              refetchTokens={refetchTokens}
              onRefetchComplete={onRefetchComplete}
            />
          ))
        )}
      </Container>
      <RbacButton
        text={getString('plusNumber', { number: getString('common.apikey') })}
        variation={ButtonVariation.LINK}
        onClick={() => openApiKeyModal()}
        data-testid="createNewApiKey"
        permission={{
          permission: PermissionIdentifier.MANAGE_SERVICEACCOUNT,
          resource: {
            resourceType: ResourceType.SERVICEACCOUNT,
            resourceIdentifier: serviceAccountIdentifier
          },
          options: {
            skipCondition: () => apiKeyType === 'USER'
          }
        }}
      />
    </Container>
  )
}

export default ApiKeyList
