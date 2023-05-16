/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ReactElement } from 'react';
import React from 'react'
import SectionToggle from '@cf/components/SectionToggle/SectionToggle'
import { CFEnvironmentSelect } from '@cf/components/CFEnvironmentSelect/CFEnvironmentSelect'

const TargetManagementHeader = ({
  environmentSelect,
  hasEnvironments
}: {
  environmentSelect: ReactElement
  hasEnvironments: boolean
}): ReactElement => {
  return (
    <>
      <SectionToggle />
      {hasEnvironments ? (
        <CFEnvironmentSelect component={environmentSelect} />
      ) : (
        <div data-testid="CFTargetManagementHeaderSpacer" style={{ width: '325px' }} />
      )}
    </>
  )
}

export default TargetManagementHeader
