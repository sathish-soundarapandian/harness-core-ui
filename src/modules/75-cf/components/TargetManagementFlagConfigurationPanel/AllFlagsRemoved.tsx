/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FC } from 'react';
import React from 'react'
import { Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { NoData } from '@cf/components/NoData/NoData'
import imageUrl from '@cf/images/Feature_Flags_Teepee.svg'

const AllFlagsRemoved: FC = () => {
  const { getString } = useStrings()

  return (
    <Container height="100%" flex={{ align: 'center-center' }} data-testid="no-data-all-flags-removed">
      <NoData imageURL={imageUrl} message={getString('cf.targetManagementFlagConfiguration.allFlagsRemoved')} />
    </Container>
  )
}

export default AllFlagsRemoved
