/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import cx from 'classnames'
import React from 'react'
import { Icon } from '@harness/icons'
import { Color } from '@harness/design-system'
import { Checkbox, Layout, Text, Container } from '@harness/uicore'
import { ModuleName } from 'framework/types/ModuleName'
import { String } from 'framework/strings'
import useNavModuleInfo, { NavModuleName } from '@common/hooks/useNavModuleInfo'
import css from './NavModule.module.scss'

interface CheckboxProps {
  checked: boolean
  handleChange?: (checked: boolean) => void
}

interface NavModuleProps {
  module: NavModuleName
  active?: boolean
  onClick?: (module: NavModuleName) => void
  checkboxProps?: CheckboxProps
}

const navModuleToClassMap: Record<NavModuleName, string> = {
  [ModuleName.CD]: css.cd,
  [ModuleName.CI]: css.ci,
  [ModuleName.CV]: css.srm,
  [ModuleName.CF]: css.ff,
  [ModuleName.CE]: css.ccm,
  [ModuleName.STO]: css.sto,
  [ModuleName.CHAOS]: css.chaos,
  [ModuleName.SCM]: css.default
}

const NavModule: React.FC<NavModuleProps> = ({ module, active, onClick, checkboxProps }) => {
  const { icon, label } = useNavModuleInfo(module)

  return (
    <Container
      className={cx(css.container, { [css.active]: active }, navModuleToClassMap[module])}
      flex={{ justifyContent: 'space-between' }}
      padding={{ top: 'small', bottom: 'small', left: 'large', right: 'large' }}
      background={Color.PRIMARY_9}
      onClick={() => {
        if (!active) {
          onClick?.(module)
        }
      }}
    >
      <Layout.Horizontal flex={{ alignItems: 'center' }}>
        <Icon name={icon} size={24} margin={{ right: 'xsmall' }} />
        <Text color={Color.WHITE}>
          <String stringID={label} />
        </Text>
      </Layout.Horizontal>

      {checkboxProps && (
        <Checkbox
          onChange={e => checkboxProps.handleChange?.((e.target as any).checked)}
          checked={checkboxProps.checked}
        />
      )}
    </Container>
  )
}

export default NavModule
