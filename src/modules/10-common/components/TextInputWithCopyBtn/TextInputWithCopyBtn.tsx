/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IFormGroupProps, IInputGroupProps, HTMLInputProps, Popover, Menu } from '@blueprintjs/core'
import { FormInput, Button, Icon, Utils, TextInput } from '@wings-software/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import { toVariableStr } from '@common/utils/StringUtils'

import css from './TextInputWithCopyBtn.module.scss'

export interface ItemNameProps {
  mainText?: string
  secondaryText?: string
}

export function ItemName(props: ItemNameProps): React.ReactElement {
  return (
    <div className={css.nameItem}>
      <div className={css.mainText}>{props.mainText}</div>
      <div className={css.secondaryText}>{props.secondaryText}</div>
    </div>
  )
}

export interface TextInputWithCopyBtnProps extends Omit<IFormGroupProps, 'labelFor'> {
  name: string
  inputGroup?: Omit<IInputGroupProps & HTMLInputProps, 'name' | 'value' | 'onChange' | 'placeholder'>
  placeholder?: string
  onChange?: IInputGroupProps['onChange']
  localName?: string
  fullName?: string
  outerClassName?: string
  textInputClassName?: string
  popoverWrapperClassName?: string
  staticDisplayValue?: string
}

export function TextInputWithCopyBtn(props: TextInputWithCopyBtnProps): React.ReactElement {
  const { localName, fullName, disabled, ...rest } = props
  const { getString } = useStrings()

  return (
    <div className={cx(css.textInputWithCopyBtn, props.outerClassName, { [css.disabled]: disabled })}>
      {props.staticDisplayValue ? (
        // Render a non formik text component if the display value is static
        <TextInput
          {...rest}
          value={props.staticDisplayValue}
          disabled={true}
          className={cx(css.input, props.textInputClassName, rest.className)}
        />
      ) : (
        <FormInput.Text
          {...rest}
          inputGroup={{ disabled }}
          disabled={disabled}
          className={cx(css.input, props.textInputClassName, rest.className)}
        />
      )}
      <Popover
        interactionKind="click"
        minimal
        position="bottom-right"
        wrapperTagName="div"
        targetTagName="div"
        className={cx(props.popoverWrapperClassName, css.popoverWrapper)}
        popoverClassName={css.popover}
      >
        <Button icon="copy-alt" className={css.btn} iconProps={{ size: 12 }} disabled={!localName && !fullName} />
        <Menu className={css.menu}>
          {localName ? (
            <Menu.Item
              className={css.menuItem}
              labelClassName={css.menuItemLabel}
              labelElement={<Icon name="copy-alt" />}
              text={<ItemName mainText={localName} secondaryText={getString('common.copyVariableName')} />}
              onClick={() => Utils.copy(toVariableStr(localName))}
            />
          ) : null}
          {fullName ? (
            <Menu.Item
              className={css.menuItem}
              labelClassName={css.menuItemLabel}
              labelElement={<Icon name="copy-alt" />}
              text={<ItemName mainText={fullName} secondaryText={getString('common.copyFqn')} />}
              onClick={() => Utils.copy(toVariableStr(fullName))}
            />
          ) : null}
        </Menu>
      </Popover>
    </div>
  )
}
