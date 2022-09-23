/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import { DropDown, Layout, SelectOption, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { Sort, SortFields } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import { useStrings } from 'framework/strings'
import type { PageTemplateSummaryResponse } from 'services/template-ng'

export interface ResultsViewHeaderProps {
  templateData: PageTemplateSummaryResponse
  setSort: Dispatch<SetStateAction<string[]>>
  setPage: Dispatch<SetStateAction<number>>
}

export default function ResultsViewHeader(props: ResultsViewHeaderProps): React.ReactElement {
  const { templateData, setSort, setPage } = props
  const { getString } = useStrings()
  const sortOptions = React.useMemo(() => {
    return [
      {
        label: getString('lastUpdatedSort'),
        value: SortFields.LastUpdatedAt
      },
      {
        label: getString('AZ09'),
        value: SortFields.AZ09
      },

      {
        label: getString('ZA90'),
        value: SortFields.ZA90
      }
    ]
  }, [])
  const [selectedSort, setSelectedSort] = React.useState<SelectOption>(sortOptions[0])

  const onDropDownChange = React.useCallback(
    item => {
      if (item.value === SortFields.AZ09) {
        setSort([SortFields.Name, Sort.ASC])
      } else if (item.value === SortFields.ZA90) {
        setSort([SortFields.Name, Sort.DESC])
      } else {
        setSort([SortFields.LastUpdatedAt, Sort.DESC])
      }
      setPage(0)
      setSelectedSort(item)
    },
    [setSort, setPage]
  )

  return (
    <Layout.Horizontal spacing="large" margin={{ bottom: 'large' }} flex={{ alignItems: 'center' }}>
      <Text color={Color.GREY_800} iconProps={{ size: 14 }}>
        {getString('total')}: {templateData.totalElements}
      </Text>
      <DropDown
        items={sortOptions}
        value={selectedSort.value.toString()}
        filterable={false}
        width={180}
        icon={'main-sort'}
        iconProps={{ size: 16, color: Color.GREY_400 }}
        onChange={onDropDownChange}
      />
    </Layout.Horizontal>
  )
}
