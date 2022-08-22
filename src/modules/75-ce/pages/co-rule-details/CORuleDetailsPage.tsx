/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty } from 'lodash-es'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  FontVariation,
  Icon,
  IconName,
  Layout,
  PageHeader,
  PageSpinner,
  Tag,
  Text,
  useToaster
} from '@harness/uicore'
import type { StringsMap } from 'stringTypes'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { Service, useRouteDetails } from 'services/lw'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { useGetAggregatedUsers, useGetConnector, UserAggregate } from 'services/cd-ng'
import { allProviders, ceConnectorTypes } from '@ce/constants'
import { getRelativeTime, getRuleType } from '@ce/components/COGatewayList/Utils'
import {
  CE_DATE_FORMAT_INTERNAL,
  CE_DATE_FORMAT_INTERNAL_MOMENT,
  FORMAT_12_HOUR,
  getStaticSchedulePeriodTime,
  getTimePeriodString
} from '@ce/utils/momentUtils'
import RuleStatusToggleSwitch from '@ce/components/RuleDetails/RuleStatusToggleSwitch'
import RulesDetailsBody from '@ce/components/RuleDetails/RuleDetailsBody'
import useDeleteServiceHook from '@ce/common/useDeleteService'
import css from './CORuleDetailsPage.module.scss'

const CORuleDetailsPage: React.FC = () => {
  const { accountId, ruleId } = useParams<AccountPathProps & { ruleId: string }>()
  const { getString } = useStrings()
  const history = useHistory()
  const { showSuccess, showError } = useToaster()

  const [user, setUser] = useState<UserAggregate>()

  const { data, loading } = useRouteDetails({ account_id: accountId, rule_id: Number(ruleId) })

  const [service, setService] = useState<Service>()

  const { data: connectorData, refetch: refetchConnector } = useGetConnector({
    identifier: service?.cloud_account_id as string,
    queryParams: { accountIdentifier: accountId },
    lazy: true
  })

  const { mutate: fetchAllUsers } = useGetAggregatedUsers({
    queryParams: {
      pageIndex: 0,
      accountIdentifier: accountId
    }
  })

  const { triggerDelete } = useDeleteServiceHook({
    serviceData: defaultTo(service, {}) as Service,
    accountId,
    onSuccess: /* istanbul ignore next */ (_data: Service) => {
      showSuccess(getString('ce.co.deleteRuleSuccessMessage', { name: defaultTo(service?.name, '') }))
      history.push(routes.toCECORules({ accountId, params: '' }))
    },
    onFailure: /* istanbul ignore next */ err => {
      showError(defaultTo(err?.errors?.join(', '), ''))
    }
  })

  useDocumentTitle(defaultTo(service?.name, 'Rule details'), true)

  useEffect(() => {
    const serviceResponse = get(data, 'response.service', {})
    /* istanbul ignore else */
    if (!isEmpty(serviceResponse)) {
      setService(serviceResponse)
    }
  }, [data?.response?.service])

  useEffect(() => {
    if (!isEmpty(service)) {
      refetchConnector()
      getUserInfo()
    }
  }, [service])

  const getUserInfo = async () => {
    const response = await fetchAllUsers({})
    const content = defaultTo(get(response, 'data.content', []), []).find(
      (item: UserAggregate) => item.user.uuid === service?.created_by
    )
    if (content) {
      setUser(content)
    }
  }

  const breadcrumbs = useMemo(
    () => [
      {
        url: routes.toCECORules({ accountId, params: '' }),
        label: getString('ce.co.breadCrumb.rules')
      }
    ],
    [accountId]
  )

  const isK8sRule = service?.kind === 'k8s'
  const connectorType = get(connectorData, 'data.connector.type', '')
  const cloudProviderType = connectorType && ceConnectorTypes[connectorType]
  const provider = useMemo(() => allProviders.find(item => item.value === cloudProviderType), [cloudProviderType])
  const iconName = isK8sRule ? 'app-kubernetes' : defaultTo(provider?.icon, 'spinner')
  const ruleTypeStringKey = service ? (getRuleType(service, provider) as keyof StringsMap) : null
  const lastUpdatedAtEpoch = service?.updated_at && getStaticSchedulePeriodTime(service?.updated_at)

  if (loading) {
    return <PageSpinner />
  }

  return (
    <Container className={service?.disabled ? css.disabledRuleHeader : ''}>
      <PageHeader
        size={service?.disabled ? 'xxlarge' : 'xlarge'}
        breadcrumbs={<NGBreadcrumbs links={breadcrumbs} />}
        title={
          <Layout.Vertical spacing={'large'}>
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
              <Icon name={iconName as IconName} size={30} />
              <Container>
                <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                  <Text font={{ variation: FontVariation.H4 }}>{defaultTo(service?.name, '')}</Text>
                  {service && (
                    <Container>
                      <RuleStatusToggleSwitch serviceData={service} onSuccess={setService} />
                    </Container>
                  )}
                </Layout.Horizontal>
                <Layout.Horizontal spacing={'small'} margin={{ top: 'small' }}>
                  <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY, size: 'small' }}>
                    {ruleTypeStringKey ? getString(ruleTypeStringKey) : ''}
                  </Text>
                  {user && (
                    <>
                      <Text>{' | '}</Text>
                      <Text font={{ variation: FontVariation.BODY, size: 'small' }}>{getString('createdBy')}</Text>
                      <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY, size: 'small' }}>
                        {user.user.name}
                      </Text>
                    </>
                  )}
                  {service?.created_at && (
                    <>
                      <Text>{' | '}</Text>
                      <Text color={Color.GREY_500} font={{ variation: FontVariation.BODY, size: 'small' }}>
                        {getRelativeTime(service.created_at, CE_DATE_FORMAT_INTERNAL_MOMENT)}
                      </Text>
                    </>
                  )}
                </Layout.Horizontal>
              </Container>
            </Layout.Horizontal>
            {service?.disabled && (
              <Container>
                <Layout.Horizontal spacing={'medium'}>
                  <Tag>
                    <Text font={{ variation: FontVariation.UPPERCASED }}>{getString('ce.common.disabled')}</Text>
                  </Tag>
                  {lastUpdatedAtEpoch && (
                    <Text inline font={{ variation: FontVariation.BODY2 }}>{`${getString(
                      'ce.co.ruleDetails.lastActiveMessage',
                      {
                        last_date: getTimePeriodString(lastUpdatedAtEpoch, CE_DATE_FORMAT_INTERNAL),
                        last_time: getTimePeriodString(lastUpdatedAtEpoch, FORMAT_12_HOUR)
                      }
                    )}. ${getString('ce.co.ruleDetails.enableRuleMessage')}`}</Text>
                  )}
                </Layout.Horizontal>
              </Container>
            )}
          </Layout.Vertical>
        }
        toolbar={
          <Layout.Horizontal spacing={'medium'}>
            <Button
              variation={ButtonVariation.PRIMARY}
              icon="Edit"
              onClick={() => {
                history.push(
                  routes.toCECOEditGateway({
                    accountId: service?.account_identifier as string,
                    gatewayIdentifier: service?.id?.toString() as string
                  })
                )
              }}
            >
              {getString('edit')}
            </Button>
            <Button variation={ButtonVariation.SECONDARY} icon="main-trash" onClick={triggerDelete}>
              {getString('delete')}
            </Button>
          </Layout.Horizontal>
        }
      />
      {service ? (
        <RulesDetailsBody
          service={service}
          connectorData={get(connectorData, 'data.connector')}
          dependencies={get(data, 'response.deps')}
          setService={setService}
        />
      ) : (
        <PageSpinner />
      )}
    </Container>
  )
}

export default CORuleDetailsPage
