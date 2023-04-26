/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties, FC, ReactNode, useMemo, useRef, useState } from 'react'
import {
  Button,
  ExpressionAndRuntimeTypeProps,
  ExpressionAndRuntimeType,
  MultiTypeInputValue,
  Layout,
  Text,
  FixedTypeComponentProps,
  MultiTypeInputType,
  ButtonVariation,
  Container,
  Icon
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'

import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import type { Scope } from '@common/interfaces/SecretsInterface'
import { useStrings } from 'framework/strings'
import {
  EntityReferenceProps,
  EntityReference,
  getScopeFromValue,
  getIdentifierFromValue,
  ScopedObjectDTO
} from '../EntityReference/EntityReference'
import type { ScopeAndIdentifier } from '../MultiSelectEntityReference/MultiSelectEntityReference'
import css from './ReferenceSelect.module.scss'

export interface MinimalObject extends ScopedObjectDTO {
  identifier?: string
  name?: string
}
export interface Item {
  label: string
  value: string
  scope: Scope
}

export interface ReferenceSelectDialogTitleProps {
  componentName?: string
  createNewLabel?: string
  createNewHandler?: () => void
  createNewBtnComponent?: JSX.Element
  isNewConnectorLabelVisible?: boolean
  title?: string
}
export interface ReferenceSelectProps<T extends MinimalObject>
  extends Omit<EntityReferenceProps<T>, 'onSelect' | 'onMultiSelect' | 'selectedRecords'>,
    ReferenceSelectDialogTitleProps {
  name: string
  placeholder: string
  selectAnReferenceLabel: string
  placeholderClass?: string
  selected?: string | Item
  createNewLabel?: string
  createNewBtnComponent?: JSX.Element
  createNewHandler?: () => void
  hideModal?: boolean
  selectedRenderer?: JSX.Element
  editRenderer?: JSX.Element
  width?: CSSProperties['width']
  isNewConnectorLabelVisible?: boolean
  onChange: (record: T, scope: Scope) => void
  disabled?: boolean
  componentName?: string
  isMultiSelect?: boolean
  isOnlyFixedtype?: boolean
  selectedReferences?: string[] | Item[]
  onMultiSelectChange?: (records: ScopeAndIdentifier[]) => void
  isRecordDisabled?: (item: any) => boolean
  renderRecordDisabledWarning?: JSX.Element
}

export const ReferenceSelectDialogTitle = (props: ReferenceSelectDialogTitleProps): JSX.Element => {
  const { getString } = useStrings()
  const { componentName, createNewHandler, createNewLabel, createNewBtnComponent, isNewConnectorLabelVisible } = props
  return (
    <Layout.Horizontal flex={{ distribution: 'space-between' }}>
      <Layout.Vertical spacing="xsmall">
        <Text font={{ variation: FontVariation.H4 }}>
          {props.title ||
            getString('common.entityReferenceTitle', {
              compName: componentName
            })}
        </Text>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500}>
          {getString('common.sortedByCreatedTime')}
        </Text>
      </Layout.Vertical>

      {createNewBtnComponent
        ? createNewBtnComponent
        : createNewLabel &&
          createNewHandler &&
          (isNewConnectorLabelVisible === undefined ? true : isNewConnectorLabelVisible) && (
            <>
              <Layout.Horizontal className={Classes.POPOVER_DISMISS}>
                <Button
                  variation={ButtonVariation.SECONDARY}
                  onClick={() => {
                    props.createNewHandler?.()
                  }}
                  text={`+ ${createNewLabel}`}
                  margin={{ right: 'small' }}
                ></Button>
              </Layout.Horizontal>
            </>
          )}
    </Layout.Horizontal>
  )
}

export function ReferenceSelect<T extends MinimalObject>(props: ReferenceSelectProps<T>): JSX.Element {
  const {
    name,
    placeholder,
    selected,
    onChange,
    width = 300,
    createNewLabel,
    createNewHandler,
    isNewConnectorLabelVisible = true,
    editRenderer,
    hideModal = false,
    selectedRenderer,
    componentName = '',
    disabled,
    createNewBtnComponent,
    isMultiSelect,
    selectedReferences,
    onMultiSelectChange,
    placeholderClass,
    isRecordDisabled,
    renderRecordDisabledWarning,
    ...referenceProps
  } = props
  const [isOpen, setOpen] = useState(false)
  React.useEffect(() => {
    isOpen && setOpen(!hideModal) //this will hide modal if hideModal changes to true in open state
  }, [hideModal])

  const showEditRenderer = editRenderer && selected && typeof selected === 'object' && selected.value

  // selectedRecords is used by <EntityReference /> when isMultiSelect is true
  const selectedRecords = useMemo(() => {
    if (!selectedReferences) return []
    return (selectedReferences as (string | Item)[])
      .filter(el => !!el)
      .map(el => {
        if (typeof el === 'string') return { scope: getScopeFromValue(el), identifier: getIdentifierFromValue(el) }
        return { scope: el.scope, identifier: getIdentifierFromValue(el.value) }
      })
  }, [selectedReferences])
  const selectedRecord = useMemo(() => {
    if (!selected) return undefined
    if (typeof selected === 'string')
      return { scope: getScopeFromValue(selected), identifier: getIdentifierFromValue(selected) }
    return { scope: selected.scope, identifier: getIdentifierFromValue(selected.value) }
  }, [selected])
  const defaultScopeRef = useRef(referenceProps.defaultScope)

  const getPlaceholderElement = (): ReactNode => {
    if (isMultiSelect) {
      return (
        <MultiReferenceSelectPlaceholder
          placeholder={placeholder}
          disabled={!!disabled}
          onClear={() => onMultiSelectChange?.([])}
          onClick={scope => {
            defaultScopeRef.current = scope
            setOpen(true)
          }}
          selected={selectedRecords}
          placeholderClass={placeholderClass}
        />
      )
    }

    let singleSelectPlaceholder: ReactNode = <span className={css.placeholder}>{placeholder}</span>
    if (selected) {
      if (selectedRenderer) {
        singleSelectPlaceholder = selectedRenderer
      } else if (typeof selected === 'object') {
        singleSelectPlaceholder = selected.label
      }
    }

    return (
      <Button
        minimal
        data-testid={`cr-field-${name}`}
        className={css.container}
        style={{ width }}
        withoutCurrentColor={true}
        rightIcon="chevron-down"
        iconProps={{ size: 14 }}
        disabled={disabled}
        onClick={e => {
          if (disabled) {
            e.preventDefault()
          } else {
            setOpen(true)
          }
        }}
      >
        {singleSelectPlaceholder}
      </Button>
    )
  }

  return (
    <>
      {getPlaceholderElement()}
      <Dialog
        isOpen={isOpen}
        enforceFocus={false}
        canEscapeKeyClose
        canOutsideClickClose
        onClose={() => setOpen(false)}
        className={cx(css.referenceSelect, css.dialog)}
        title={ReferenceSelectDialogTitle({
          componentName,
          createNewLabel,
          createNewHandler,
          createNewBtnComponent,
          isNewConnectorLabelVisible
        })}
      >
        <div className={cx(css.contentContainer)}>
          {showEditRenderer && <Layout.Horizontal>{editRenderer}</Layout.Horizontal>}
          <EntityReference<T>
            {...referenceProps}
            onSelect={(record, scope) => {
              setOpen(false)
              onChange(record, scope)
            }}
            onMultiSelect={records => {
              setOpen(false)
              onMultiSelectChange?.(records)
            }}
            onCancel={() => {
              setOpen(false)
            }}
            renderTabSubHeading
            defaultScope={defaultScopeRef.current}
            isMultiSelect={isMultiSelect}
            selectedRecords={selectedRecords}
            selectedRecord={selectedRecord}
            isRecordDisabled={isRecordDisabled}
            renderRecordDisabledWarning={renderRecordDisabledWarning}
          />
        </div>
      </Dialog>
    </>
  )
}

export interface MultiTypeReferenceInputProps<T extends MinimalObject>
  extends Omit<ExpressionAndRuntimeTypeProps, 'fixedTypeComponent' | 'fixedTypeComponentProps'> {
  referenceSelectProps: Omit<ReferenceSelectProps<T>, 'onChange'>
}
function MultiTypeReferenceInputFixedTypeComponent<T extends MinimalObject>(
  props: FixedTypeComponentProps & MultiTypeReferenceInputProps<T>['referenceSelectProps']
): React.ReactElement {
  const { onChange, selected, width = 300, ...restProps } = props
  return (
    <ReferenceSelect
      {...restProps}
      selected={selected}
      width={width}
      onChange={(record, scope) => {
        onChange?.({ record, scope } as any, MultiTypeInputValue.SELECT_OPTION, MultiTypeInputType.FIXED)
      }}
    />
  )
}
export function MultiTypeReferenceInput<T extends MinimalObject>(props: MultiTypeReferenceInputProps<T>): JSX.Element {
  const { referenceSelectProps, ...rest } = props
  if (referenceSelectProps.isOnlyFixedtype) {
    const { selected, width = 300, ...restProps } = referenceSelectProps
    return (
      <ReferenceSelect
        {...restProps}
        selected={selected}
        width={width}
        onChange={(record, scope) => {
          rest.onChange?.({ record, scope } as any, MultiTypeInputValue.SELECT_OPTION, MultiTypeInputType.FIXED)
        }}
      />
    )
  }
  return (
    <ExpressionAndRuntimeType<MultiTypeReferenceInputProps<T>['referenceSelectProps']>
      width={referenceSelectProps.width}
      {...rest}
      fixedTypeComponentProps={referenceSelectProps}
      fixedTypeComponent={MultiTypeReferenceInputFixedTypeComponent}
    />
  )
}

export interface MultiReferenceSelectPlaceholderProps {
  disabled: boolean
  placeholder: string
  selected: ScopeAndIdentifier[]
  onClear: () => void
  onClick: (arg?: Scope) => void
  placeholderClass?: string
}

export const MultiReferenceSelectPlaceholder: FC<MultiReferenceSelectPlaceholderProps> = ({
  disabled,
  placeholder,
  selected,
  onClear,
  onClick,
  placeholderClass
}) => {
  const groupedReferences = useMemo(() => {
    return Object.values(
      selected.reduce((acc, el) => {
        acc[el.scope] ??= { scope: el.scope, count: 0 }
        acc[el.scope].count++
        return acc
      }, {} as Record<Scope, { scope: Scope; count: number }>)
    )
  }, [selected])

  return (
    <Container
      border
      padding="xsmall"
      className={cx('bp3-input', disabled ? 'bp3-disabled' : '', css.placeholderContainer, placeholderClass)}
    >
      {groupedReferences?.length ? (
        <Layout.Horizontal
          spacing="xsmall"
          flex={{ alignItems: 'center', justifyContent: 'space-between' }}
          className={cx(css.layoutHeight, !disabled && css.pointer)}
        >
          <Layout.Horizontal
            className={css.groupedReferences}
            spacing="xsmall"
            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            onClick={() => {
              if (disabled) {
                return
              }
              onClick()
            }}
          >
            {groupedReferences
              .filter(el => el.count)
              .map(({ scope, count }) => {
                return (
                  <Container
                    padding={{ top: 'xsmall', right: 'small', bottom: 'xsmall', left: 'small' }}
                    background={Color.PRIMARY_2}
                    key={scope}
                    onClick={event => {
                      event.stopPropagation()
                      if (disabled) return

                      onClick(scope)
                    }}
                    border={{ radius: 100 }}
                  >
                    <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text lineClamp={1} font={{ size: 'small' }} color={Color.BLACK}>
                        {scope.toUpperCase()}
                      </Text>
                      <Text
                        font={{ size: 'small' }}
                        padding={{ left: 'xsmall', right: 'xsmall' }}
                        flex={{ align: 'center-center' }}
                        background={Color.PRIMARY_7}
                        color={Color.WHITE}
                        border={{ radius: 100 }}
                      >
                        {count}
                      </Text>
                    </Layout.Horizontal>
                  </Container>
                )
              })}
          </Layout.Horizontal>
          <Icon
            margin={{ left: 'medium' }}
            name="cross"
            color={Color.GREY_500}
            size={14}
            onClick={() => !disabled && onClear()}
          />
        </Layout.Horizontal>
      ) : (
        <Container
          className={cx(!disabled && css.pointer)}
          onClick={() => {
            if (disabled) {
              return
            }
            onClick()
          }}
        >
          <Text
            color={!disabled ? Color.PRIMARY_7 : undefined}
            className={cx(!disabled && css.selectBtn)}
            flex={{ alignItems: 'center', justifyContent: 'flex-start', inline: false }}
            padding="xsmall"
          >
            {placeholder}
          </Text>
        </Container>
      )}
    </Container>
  )
}
