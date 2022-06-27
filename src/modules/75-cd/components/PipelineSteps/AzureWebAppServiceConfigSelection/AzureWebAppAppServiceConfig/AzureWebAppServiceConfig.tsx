/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Button, ButtonSize, ButtonVariation } from '@wings-software/uicore'
// import { useStrings } from 'framework/strings'
import css from './AzureWebAppServiceConfig.module.scss'

export interface AzureWebAppListViewProps {
  addNewApplicationSetting: () => void
  addNewConnectionString: () => void
}

function AzureWebAppListView({
  addNewApplicationSetting,
  addNewConnectionString
}: AzureWebAppListViewProps): React.ReactElement {
  // const { getString } = useStrings()

  return (
    <Layout.Vertical style={{ width: '100%' }}>
      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        <Button
          className={css.addNew}
          id="add-applicationSetting"
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          onClick={() => addNewApplicationSetting()}
          text={'+ Add Application Settings'}
        />
        <Button
          className={css.addNew}
          id="add-connectionString"
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          onClick={() => addNewConnectionString()}
          text={'+ Add Connection Strings'}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default AzureWebAppListView
