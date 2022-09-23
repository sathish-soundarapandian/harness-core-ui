/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { noop } from 'lodash-es'
import { SimpleTagInput, Icon } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useGetDelegateSelectorsUpTheHierarchyV2 } from 'services/portal'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { DelegateSelectorsV2 } from './DelegateSelectorsV2'
import css from './DelegateSelectors.module.scss'

export interface DelegateSelectorsV2ContainerProps
  extends Partial<React.ComponentProps<typeof SimpleTagInput>>,
    Partial<ProjectPathProps> {
  placeholder?: string
  pollingInterval?: number
  wrapperClassName?: string
  onTagInputChange?: (tags: string[]) => void
}

export const DelegateSelectorsV2Container = (props: DelegateSelectorsV2ContainerProps): React.ReactElement | null => {
  const { accountId } = useParams<AccountPathProps>()
  const {
    orgIdentifier,
    projectIdentifier,
    pollingInterval = null,
    onTagInputChange = noop,
    wrapperClassName,
    placeholder,
    selectedItems
  } = props

  const { getString } = useStrings()

  const queryParams = { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  const {
    data: apiData,
    loading,
    refetch
  } = useGetDelegateSelectorsUpTheHierarchyV2({
    queryParams
  })

  const [data, setData] = useState(apiData)

  useEffect(() => {
    if (apiData) {
      setData(apiData)
    }
  }, [loading])

  // polling logic
  useEffect(() => {
    if (pollingInterval === null) {
      return
    }
    let id: number | null
    if (!loading) {
      id = window.setTimeout(() => refetch(), pollingInterval)
    }
    return () => {
      if (id) {
        window.clearTimeout(id)
      }
    }
  }, [data, loading, refetch, pollingInterval])

  return (
    <div className={cx(css.wrapper, wrapperClassName)} data-name="DelegateSelectors">
      {loading && !data ? (
        <div className={css.loader}>
          <Icon margin="medium" name="spinner" size={15} color={Color.PRIMARY_8} />
          <span>{getString('loading')}</span>
        </div>
      ) : (
        <DelegateSelectorsV2
          data={data?.resource || []}
          placeholder={placeholder}
          onTagInputChange={onTagInputChange}
          selectedItems={selectedItems}
        />
      )}
    </div>
  )
}

export default DelegateSelectorsV2Container
