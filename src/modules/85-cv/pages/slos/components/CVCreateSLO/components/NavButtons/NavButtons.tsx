/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Layout } from '@harness/uicore'
import React from 'react'
import { CreateSLOEnum, TabsOrder } from '../CreateSLOForm/CreateSLO.constants'
import type { NavButtonsProps } from './NavButtons.types'
import { isFormDataValid } from '../CreateSLOForm/CreateSLO.utils'
import css from '../CreateSLOForm/CreateSLO.module.scss'

export const NavButtons = ({
  selectedTabId,
  setSelectedTabId,
  getString,
  formikProps
}: NavButtonsProps): JSX.Element => {
  return (
    <Layout.Horizontal className={css.navigationBtns}>
      <Button
        text={getString('back')}
        variation={ButtonVariation.SECONDARY}
        icon="chevron-left"
        onClick={() => setSelectedTabId(TabsOrder[Math.max(0, TabsOrder.indexOf(selectedTabId) - 1)])}
      />
      <Button
        text={selectedTabId === CreateSLOEnum.SLO_TARGET_BUDGET_POLICY ? getString('save') : getString('continue')}
        variation={ButtonVariation.PRIMARY}
        rightIcon="chevron-right"
        onClick={() => {
          if (selectedTabId === CreateSLOEnum.SLO_TARGET_BUDGET_POLICY) {
            formikProps.submitForm()
          } else if (isFormDataValid(formikProps, selectedTabId)) {
            setSelectedTabId(TabsOrder[Math.min(TabsOrder.length, TabsOrder.indexOf(selectedTabId) + 1)])
          }
        }}
      />
    </Layout.Horizontal>
  )
}
