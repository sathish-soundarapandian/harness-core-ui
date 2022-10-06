/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { VisualYamlSelectedView as SelectedView, VisualYamlToggle } from '@harness/uicore'

import { useTabWizardContext } from '../context/TabWizardContext'

import css from './TabWizardHeader.module.scss'

interface TabWizardHeaderProps {
  title: string | JSX.Element
  handleModeSwitch: (mode: SelectedView) => void
}

export default function TabWizardHeader({ title, handleModeSwitch }: TabWizardHeaderProps): JSX.Element {
  const { selectedView } = useTabWizardContext()

  return (
    <section className={css.extendedNav}>
      <div>{title}</div>
      <VisualYamlToggle selectedView={selectedView} onChange={handleModeSwitch} className={css.visualYamlToggle} />
    </section>
  )
}
