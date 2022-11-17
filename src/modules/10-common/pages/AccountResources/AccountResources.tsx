/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import ResourceCardList from '@common/components/ResourceCardList/ResourceCardList'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import css from './AccountResources.module.scss'

const AccountResources: React.FC = () => {
  const { getString } = useStrings()
  return (
    <>
      <Page.Header title={getString('common.accountResources')} breadcrumbs={<NGBreadcrumbs />} />
      <Page.Body>
        <div className={css.main}>
          <Layout.Vertical spacing="large" padding={{ bottom: 'huge' }}>
            <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('common.accountResources')}
            </Text>
            <div>
              <Text>{getString('common.accountResourcesPage.line1')}</Text>
              <Text>{getString('common.accountResourcesPage.line2')}</Text>
            </div>
          </Layout.Vertical>
          <ResourceCardList />
        </div>
      </Page.Body>
    </>
  )
}

export default AccountResources
