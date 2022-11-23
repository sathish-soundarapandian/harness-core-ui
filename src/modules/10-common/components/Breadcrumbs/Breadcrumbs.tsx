/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Link } from 'react-router-dom'
import cx from 'classnames'
import { Icon } from '@harness/uicore'
import css from './Breadcrumbs.module.scss'

export interface Breadcrumb {
  url: string
  label: string
}
export interface BreadcrumbsProps {
  links: Breadcrumb[]
  className?: string
}
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ links = [], className = '' }) => {
  return (
    <div className={cx(className, css.breadcrumbs)}>
      {links.map((link: Breadcrumb, index: number) => (
        <div key={index}>
          {index === links.length - 1 ? (
            <span className={css.lastBreadcrumb}>{link.label}</span>
          ) : (
            <Link className={css.breadcrumb} to={link.url}>
              {link.label}
            </Link>
          )}
          {index !== links.length - 1 && <Icon size={11} name="main-chevron-right" className={css.separator} />}
        </div>
      ))}
    </div>
  )
}
