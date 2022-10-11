/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { PageSpinner } from '@harness/uicore'
import React from 'react'
import AddDrawer, { AddDrawerMapInterface, DrawerContext, ItemInterface } from '@common/components/AddDrawer/AddDrawer'
import { useGetConnectorsListHook } from '@connectors/pages/connectors/hooks/useGetConnectorsListHook/useGetConectorsListHook'

export interface AddConnectorsDrawerProps {
  onSelect: (item: ItemInterface) => void
  onClose: () => void
}

const AddConnectorsDrawer = ({ onSelect, onClose }: AddConnectorsDrawerProps): JSX.Element => {
  const { loading, categoriesMap } = useGetConnectorsListHook()

  if (loading) return <PageSpinner />
  return (
    <AddDrawer
      addDrawerMap={categoriesMap as AddDrawerMapInterface}
      onSelect={onSelect}
      onClose={onClose}
      drawerContext={DrawerContext.PAGE}
      showRecentlyUsed={false}
    />
  )
}

export default AddConnectorsDrawer
