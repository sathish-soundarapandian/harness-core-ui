/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { Button, ButtonVariation, FormInput, Layout, Text, Container } from '@harness/uicore'
import { FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import TextReference, { ValueType } from '@secrets/components/TextReference/TextReference'
import type { CustomHealthKeyValueMapperProps } from './CustomHealthKeyValueMapper.types'
import css from './CustomHealthKeyValueMapper.module.scss'

export const CustomHealthKeyValueMapper = (props: CustomHealthKeyValueMapperProps): JSX.Element => {
  const { name, formik, addRowButtonLabel, className } = props
  const { getString } = useStrings()

  const entities: Array<{ key: string; value: any }> = get(formik.values, name) || [
    { key: '', value: { fieldType: ValueType.TEXT } }
  ]

  return (
    <Container className={className}>
      <FieldArray
        name={name}
        render={arrayHelpers => {
          return (
            <Container>
              <Layout.Horizontal className={css.keyValHeader} border={{ bottom: true }}>
                <Text className={css.textCss}>{getString('keyLabel')}</Text>
                <Text className={css.textCss}>{getString('valueLabel')}</Text>
                <Button
                  icon="plus"
                  text={addRowButtonLabel}
                  variation={ButtonVariation.LINK}
                  onClick={() => arrayHelpers.insert(0, { key: '', value: { fieldType: ValueType.TEXT } })}
                  className={css.addRowButton}
                />
              </Layout.Horizontal>
              {entities.map((_, index) => (
                <Layout.Horizontal key={index} className={css.keyValueContainer}>
                  <FormInput.Text
                    className={css.textCss}
                    name={`${name}[${index}].key`}
                    placeholder={getString('keyLabel')}
                  />
                  <TextReference
                    name={`${name}[${index}].value.`}
                    className={css.valueTextRef}
                    placeHolder={getString('valueLabel')}
                    type={get(formik.values, `${name}[${index}].value.fieldType`)}
                  />
                  <Button icon="trash" minimal onClick={() => arrayHelpers.remove(index)} className={css.removeRow} />
                </Layout.Horizontal>
              ))}
            </Container>
          )
        }}
      />
    </Container>
  )
}
