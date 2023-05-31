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
import flagsImageUrl from '@cf/images/Feature_Flags_Teepee.svg'
import type { NoDataProps } from './NoData';
import { NoData } from './NoData'

export interface NoSearchResultsProps {
  imageURL?: NoDataProps['imageURL']
}

const NoSearchResults: FC<NoSearchResultsProps> = ({ imageURL = flagsImageUrl }) => {
  const { getString } = useStrings()

  return (
    <Container height="100%" flex={{ align: 'center-center' }} data-testid="no-data-no-search-results">
      <NoData imageURL={imageURL} message={getString('cf.noResultMatch')} />
    </Container>
  )
}

export default NoSearchResults
