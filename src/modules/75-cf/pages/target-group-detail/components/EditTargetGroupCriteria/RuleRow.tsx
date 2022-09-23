/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Button, ButtonVariation, FormInput, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useOperatorsFromYaml } from '@cf/constants'

import css from './RuleRow.module.scss'

export interface RuleRowProps {
  namePrefix: string
  targetAttributeItems: SelectOption[]
  onDelete: () => void
  selectedOp: string
  setFieldValue: (name: string, value: [string]) => void
}

const RuleRow: FC<RuleRowProps> = ({ namePrefix, targetAttributeItems, onDelete, selectedOp, setFieldValue }) => {
  const { getString } = useStrings()
  const [operators] = useOperatorsFromYaml()

  return (
    <>
      <div className={css.fields} data-testid="ruleRowFields">
        <FormInput.Select
          name={`${namePrefix}.attribute`}
          items={targetAttributeItems}
          selectProps={{ inputProps: { 'aria-label': getString('cf.segmentDetail.attribute') }, usePortal: false }}
        />
        <FormInput.Select
          name={`${namePrefix}.op`}
          items={operators}
          selectProps={{ inputProps: { 'aria-label': getString('cf.segmentDetail.operator') } }}
        />
        {selectedOp === 'in' ? (
          <FormInput.TagInput
            name={`${namePrefix}.values`}
            itemFromNewTag={tag => tag}
            items={[]}
            tagInputProps={{
              showClearAllButton: true,
              allowNewTag: true,
              showAddTagButton: false,
              inputProps: { 'aria-label': getString('cf.segmentDetail.values'), 'data-testid': 'valuesTagInput' }
            }}
            labelFor={tag => tag as string}
          />
        ) : (
          <div data-testid="valuesTextInput">
            <FormInput.Text
              name={`${namePrefix}.values`}
              onChange={e => setFieldValue(`${namePrefix}.values`, [(e?.target as HTMLInputElement)?.value])}
            />
          </div>
        )}
      </div>
      <Button
        onClick={e => {
          e.preventDefault()
          onDelete()
        }}
        icon="trash"
        variation={ButtonVariation.ICON}
        aria-label={getString('cf.segmentDetail.removeRule')}
      />
    </>
  )
}

export default RuleRow
