/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Color } from '@harness/design-system'
import {
  ButtonVariation,
  Container,
  ExpandingSearchInput,
  Icon,
  Layout,
  MultiSelectDropDown,
  MultiSelectOption,
  Page,
  Text
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { ModulePathParams, DiscoveryPathProps } from '@common/interfaces/RouteInterfaces'
import { getLinkForAccountResources } from '@common/utils/BreadcrumbUtils'
import RbacButton from '@rbac/components/Button/Button'
import { useStrings } from 'framework/strings'
import css from './DiscoveryDetails.module.scss'

const DiscoveryDetails: React.FC = () => {
  const items: MultiSelectOption[] = [
    { label: 'default', value: 'default' },
    { label: 'litmus', value: 'litmus' },
    { label: 'kube-dns', value: 'kube-dns' }
  ]
  const { accountId, orgIdentifier, projectIdentifier, discoveryId } = useParams<
    DiscoveryPathProps & ModulePathParams
  >()
  const { getString } = useStrings()
  const [value, setValue] = useState<MultiSelectOption[]>()
  return (
    <>
      <Page.Header
        className={css.header}
        breadcrumbs={
          <NGBreadcrumbs
            links={getLinkForAccountResources({ accountId, orgIdentifier, projectIdentifier, getString })}
          />
        }
        title={
          <Layout.Horizontal>
            <Layout.Vertical>
              <Text color={Color.BLACK} style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
                {discoveryId}
              </Text>
              <Layout.Horizontal flex={{ alignItems: 'center' }}>
                <Text color={'#6B6D85'} font={{ size: 'small' }} margin={{ right: 'small' }}>
                  {getString('discovery.discoveredBy')}
                </Text>
                <Icon name="app-kubernetes" margin={{ right: 'xsmall' }} />
                <Text color={Color.PRIMARY_7} font={{ size: 'small' }}>
                  {getString('discovery.agentName')}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Horizontal></Layout.Horizontal>
            <Layout.Vertical></Layout.Vertical>
          </Layout.Horizontal>
        }
      />
      <Page.SubHeader>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Horizontal>
            <RbacButton
              text="Enable"
              variation={ButtonVariation.PRIMARY}
              rightIcon="chevron-right"
              onClick={() => void 0}
              margin={{ right: 'small' }}
            />
            <Layout.Horizontal flex>
              <MultiSelectDropDown
                items={items}
                value={value}
                onChange={item => {
                  setValue(item)
                }}
              />
            </Layout.Horizontal>
          </Layout.Horizontal>
          <Container data-name="monitoredServiceSeachContainer">
            <ExpandingSearchInput
              width={250}
              alwaysExpanded
              throttle={500}
              key={''}
              defaultValue={''}
              onChange={() => void 0}
              placeholder={getString('discovery.homepage.searchNeworkMap')}
            />
          </Container>
        </Layout.Horizontal>
      </Page.SubHeader>
    </>
  )
}

export default DiscoveryDetails
