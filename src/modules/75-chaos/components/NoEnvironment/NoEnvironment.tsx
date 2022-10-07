/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { String, useStrings } from 'framework/strings'
import EmptyContent from './EmptyContent.svg'
import EnvironmentDialog, { EnvironmentDialogProps } from '../CreateEnvironmentDialog/EnvironmentDialog'
import { NoData } from '../NoData/NoData'

export interface NoEnvironmentProps {
  onCreated: EnvironmentDialogProps['onCreate']
}

export const NoEnvironment: React.FC<NoEnvironmentProps> = ({ onCreated }) => {
  const { getString } = useStrings()

  return (
    <NoData
      imageURL={EmptyContent}
      message={getString('chaos.noEnvironment.title')}
      description={<String useRichText stringID="chaos.noEnvironment.message" />}
    >
      <EnvironmentDialog onCreate={onCreated} />
    </NoData>
  )
}
