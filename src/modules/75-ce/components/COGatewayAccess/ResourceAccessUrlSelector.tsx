/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty as _isEmpty, debounce as _debounce, defaultTo as _defaultTo } from 'lodash-es'
import { Container, FormInput, Layout, SelectOption, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Radio } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { Utils } from '@ce/common/Utils'
import { useAllHostedZones } from 'services/lw'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { DNSLinkSetupFormVal } from '@ce/types'
import { useGatewayContext } from '@ce/context/GatewayContext'
import type { GatewayDetails } from '../COCreateGateway/models'
import CustomDomainMapping from './CustomDomainMapping'
import css from './COGatewayAccess.module.scss'

interface ResourceAccessUrlSelectorProps {
  formikProps: FormikProps<DNSLinkSetupFormVal>
  gatewayDetails: GatewayDetails
  setGatewayDetails: (details: GatewayDetails) => void
  setHelpTextSections: (s: string[]) => void
  serverNames: string[]
  domainsToOverlap: string[]
  setDomainsToOverlap: (domains: string[]) => void
  overrideRoute53: boolean
  setOverrideRoute53: (flag: boolean) => void
  allCustomDomains?: string[]
}

const ResourceAccessUrlSelector: React.FC<ResourceAccessUrlSelectorProps> = ({
  gatewayDetails,
  setGatewayDetails,
  formikProps,
  setHelpTextSections,
  serverNames,
  domainsToOverlap,
  overrideRoute53,
  setDomainsToOverlap,
  setOverrideRoute53,
  allCustomDomains
}) => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { isEditFlow } = useGatewayContext()
  const isAwsProvider = Utils.isProviderAws(gatewayDetails.provider)

  const [useCustomDomain, setUseCustomDomain] = useState(!_isEmpty(allCustomDomains))
  const [hostedZonesList, setHostedZonesList] = useState<SelectOption[]>([])
  const [dnsProvider, setDNSProvider] = useState<string>(
    Utils.getConditionalResult(
      !_isEmpty(gatewayDetails.routing.custom_domain_providers?.route53?.hosted_zone_id),
      'route53',
      'others'
    )
  )
  const forceSelectCustomDomain = useRef<boolean>(false)

  const {
    data: hostedZones,
    loading: hostedZonesLoading,
    refetch: loadHostedZones
  } = useAllHostedZones({
    account_id: accountId, // eslint-disable-line
    queryParams: {
      cloud_account_id: gatewayDetails.cloudAccount.id, // eslint-disable-line
      region: 'us-east-1',
      domain: _defaultTo(gatewayDetails.customDomains?.[0], ''),
      accountIdentifier: accountId
    },
    lazy: !isEditFlow
  })

  useEffect(() => {
    if (hostedZonesLoading) {
      return
    }
    const loadedhostedZones: SelectOption[] =
      hostedZones?.response?.map(r => {
        return {
          label: r.name as string,
          value: r.id as string
        }
      }) || []
    setHostedZonesList(loadedhostedZones)
  }, [hostedZones, hostedZonesLoading])

  useEffect(() => {
    if (dnsProvider === 'route53') {
      loadHostedZones()
    }
  }, [dnsProvider])

  useEffect(() => {
    if (!_isEmpty(serverNames)) {
      loadHostedZones({
        queryParams: {
          cloud_account_id: gatewayDetails.cloudAccount.id, // eslint-disable-line
          region: 'us-east-1',
          domain: _defaultTo(serverNames?.[0], ''),
          accountIdentifier: accountId
        }
      })
    }
  }, [serverNames])

  useEffect(() => {
    if (!_isEmpty(allCustomDomains) && !useCustomDomain) {
      setUseCustomDomain(true)
    } else if (_isEmpty(allCustomDomains) && useCustomDomain && !forceSelectCustomDomain.current) {
      onAutoGeneratedUrlSelect('no')
    }
  }, [allCustomDomains])

  const debouncedCustomDomainTextChange = React.useCallback(
    _debounce((value: string, shouldLoadHostedZones: boolean) => {
      const updatedGatewayDetails = { ...gatewayDetails }
      updatedGatewayDetails.routing = {
        ...gatewayDetails.routing,
        ...(!updatedGatewayDetails.routing.custom_domain_providers && { custom_domain_providers: { others: {} } }),
        ...(gatewayDetails.routing.override_dns_record && { override_dns_record: false })
      }
      updatedGatewayDetails.customDomains = value ? value.split(',') : []
      if (gatewayDetails.routing.override_dns_record) {
        setOverrideRoute53(false)
      }
      setGatewayDetails(updatedGatewayDetails)
      setHelpTextSections(['usingCustomDomain'])
      shouldLoadHostedZones &&
        loadHostedZones({
          queryParams: {
            cloud_account_id: gatewayDetails.cloudAccount.id,
            region: 'us-east-1',
            domain: updatedGatewayDetails.customDomains[0],
            accountIdentifier: accountId
          }
        })
    }, 500),
    [gatewayDetails]
  )

  const onAutoGeneratedUrlSelect = (val: string) => {
    // formikProps.setFieldValue('usingCustomDomain', e.currentTarget.value)
    forceSelectCustomDomain.current = false
    setUseCustomDomain(false)
    if (val === 'no') {
      setHelpTextSections([])
    }
    formikProps.setFieldValue('customURL', '')
    setGatewayDetails({ ...gatewayDetails, customDomains: [] })
  }

  return (
    <>
      <Container className={css.dnsLinkContainer}>
        <Layout.Horizontal spacing="small" style={{ marginBottom: 'var(--spacing-xlarge)' }}>
          <Text font={{ variation: FontVariation.H6, weight: 'light' }}>
            {getString('ce.co.autoStoppingRule.setupAccess.customDomain.helpText')}
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal>
          <Radio
            value="no"
            disabled={!_isEmpty(serverNames)}
            onChange={e => onAutoGeneratedUrlSelect(e.currentTarget.value)}
            checked={!useCustomDomain}
            data-testid="noCustomDomain"
          />
          <Layout.Vertical spacing="xsmall">
            <Text
              color={Color.GREY_500}
              style={{
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '18px',
                paddingBottom: 'var(--spacing-small)'
              }}
            >
              {getString('ce.co.autoStoppingRule.setupAccess.autogeneratedHelpText')}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Horizontal style={{ width: '100%' }}>
          <Radio
            value="yes"
            onChange={() => {
              // formikProps.setFieldValue('usingCustomDomain', e.currentTarget.value)
              forceSelectCustomDomain.current = true
              setUseCustomDomain(true)
              debouncedCustomDomainTextChange('', false)
            }}
            checked={useCustomDomain}
            className={css.centerAlignedRadio}
            name={'usingCustomDomain'}
          />
          <FormInput.Text
            name="customURL"
            placeholder={getString('ce.co.dnsSetup.customURL')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              formikProps.setFieldValue('customURL', e.target.value)
              debouncedCustomDomainTextChange(e.target.value, true)
            }}
            style={{ width: '100%' }}
            disabled={!useCustomDomain}
          />
        </Layout.Horizontal>
      </Container>
      {!_isEmpty(formikProps.values.customURL) && isAwsProvider && (
        <CustomDomainMapping
          formikProps={formikProps}
          gatewayDetails={gatewayDetails}
          setGatewayDetails={setGatewayDetails}
          hostedZonesList={hostedZonesList}
          setDNSProvider={setDNSProvider}
          setHelpTextSections={setHelpTextSections}
          overrideRoute53={overrideRoute53}
          setOverrideRoute53={setOverrideRoute53}
          domainsToOverlap={domainsToOverlap}
          setDomainsToOverlap={setDomainsToOverlap}
        />
      )}
    </>
  )
}

export default ResourceAccessUrlSelector
