/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Button, ButtonVariation, Layout, Pagination } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { PaginationProps } from './ServicesList'

import css from './ServicesFooter.module.scss'

export interface ServicesFooterProps {
  loading: boolean
  onClose: () => void
  onSave: () => void
  paginationProps: PaginationProps | false
}

const ServicesFooter: FC<ServicesFooterProps> = ({ loading, onSave, onClose, paginationProps }) => {
  const { getString } = useStrings()

  return (
    <>
      {paginationProps && (
        <Pagination
          className={css.pagination}
          itemCount={paginationProps.itemCount}
          pageSize={paginationProps.pageSize}
          pageCount={paginationProps.pageCount}
          pageIndex={paginationProps.pageIndex}
          gotoPage={paginationProps.gotoPage}
        />
      )}

      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Button
          type="submit"
          text={getString('save')}
          intent="primary"
          variation={ButtonVariation.PRIMARY}
          disabled={loading}
          onClick={onSave}
        />
        <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={onClose} />
      </Layout.Horizontal>
    </>
  )
}

export default ServicesFooter
