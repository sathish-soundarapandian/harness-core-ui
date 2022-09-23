/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { SortOption } from '@common/components/SortOption/SortOption'
import { Sort, SortFields } from '@common/utils/listUtils'

export default function ResultsViewHeader(): React.ReactElement {
  const { getString } = useStrings()
  // savedSortOption ||
  const [sort, setSort] = useState<string[]>([SortFields.LastModifiedAt, Sort.DESC])
  return (
    <Layout.Horizontal spacing="large" margin={{ bottom: 'large' }} flex={{ alignItems: 'center' }}>
      <Text color={Color.GREY_800} iconProps={{ size: 14 }}>
        {getString('total')}: {5}
      </Text>
      <SortOption sort={sort} setSort={setSort} />
    </Layout.Horizontal>
  )
}
