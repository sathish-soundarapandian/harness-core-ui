import React from 'react'
import { FieldArray } from 'formik'
import { Checkbox } from '@harness/uicore'
import type { IOptionProps } from '@blueprintjs/core'

interface FormikCheckboxGroupProps {
  name: string
  items: IOptionProps[]
  values: Array<string | number>
}

export default function FormikCheckboxGroup({ name, items, values }: FormikCheckboxGroupProps): JSX.Element {
  return (
    <FieldArray
      name={name}
      render={arrayHelpers =>
        items.map(tag => (
          <Checkbox
            name="checkboxGroup"
            value={tag.value}
            label={tag.label}
            key={tag.value}
            checked={values?.includes(tag.value)}
            onChange={e => {
              if (e.currentTarget.checked) {
                arrayHelpers.push(tag.value)
              } else {
                const idx = values?.indexOf(tag.value)
                arrayHelpers.remove(idx)
              }
            }}
          />
        ))
      }
    />
  )
}
