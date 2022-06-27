import React from 'react'
import AzureWebAppListView from './AzureWebAppAppServiceConfig/AzureWebAppServiceConfig'

export default function AzureWebAppConfigSelection() {
  // here we can define the onclick behaviours and other things
  return <AzureWebAppListView addNewApplicationSetting={'' as any} addNewConnectionString={'' as any} />
}
