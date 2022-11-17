/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, ReactElement } from 'react'
import { omit } from 'lodash-es'
import { Layout } from '@harness/uicore'
import type { LayoutProps } from '@harness/uicore/dist/layouts/Layout'
import type { SubSectionComponentProps } from './FlagChangesForm'
import css from './SubSection.module.scss'

export interface SubSectionProps {
  removeSubSectionButton?: ReactElement
  subSectionSelector: ReactElement
}

export const disallowedProps: Array<string | keyof SubSectionComponentProps> = [
  'fieldValues',
  'subSectionSelector',
  'removeSubSectionButton',
  'clearField',
  'setField',
  'prefix',
  'targetAttributes',
  'targetGroups',
  'variations',
  'targets'
]

const SubSection: FC<SubSectionProps & LayoutProps> = ({
  removeSubSectionButton,
  subSectionSelector,
  children,
  ...props
}) => {
  return (
    <Layout.Vertical spacing="medium" padding="large" className={css.subSection} {...omit(props, ...disallowedProps)}>
      <Layout.Horizontal className={css.header}>
        {subSectionSelector}
        {removeSubSectionButton}
      </Layout.Horizontal>
      {children}
    </Layout.Vertical>
  )
}

export default SubSection
