/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { Layout } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './HeaderContent.module.scss'

const HeaderContent: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()

  return (
    <Layout.Horizontal>
      <NavLink to={routes.toAccountConfiguration({ accountId })} className={css.tags} activeClassName={css.activeTag}>
        {getString('configuration')}
      </NavLink>
      <NavLink to={routes.toAccountActivityLog({ accountId })} className={css.tags} activeClassName={css.activeTag}>
        {getString('activityLog')}
      </NavLink>
    </Layout.Horizontal>
  )
}

export default HeaderContent
