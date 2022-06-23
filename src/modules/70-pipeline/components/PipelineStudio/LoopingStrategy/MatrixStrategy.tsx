import { Button, ButtonVariation, FormInput } from '@harness/uicore'
import { Formik, FieldArray } from 'formik'
import React from 'react'

export interface MatrixStrategyProps {}

export function MatrixStrategy(props: MatrixStrategyProps): React.ReactElement {
  return (
    <Formik initialValues={{ axes: [], exclude: [] }}>
      {formik => {
        return (
          <div>
            <FieldArray
              name="axes"
              render={arrayHelpers => {
                return (
                  <div>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      icon="plus"
                      text="Add Axes"
                      onClick={() => arrayHelpers.push({ key: '', values: [] })}
                    />
                    <div>
                      <div
                        style={{ width: '600px', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '1rem' }}
                      >
                        <div>Axes</div>
                        <div>Values</div>
                      </div>
                      {formik.values.axes.map((row, i) => (
                        <div
                          key={i}
                          style={{ width: '600px', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '1rem' }}
                        >
                          <FormInput.Text name={`axes[${i}].key`} />
                          <FormInput.MultiSelect items={[]} name={`axes[${i}].values`} />
                        </div>
                      ))}
                    </div>
                    <FormInput.CheckBox label="exclude" />
                  </div>
                )
              }}
            />
            <FieldArray
              name="exclude"
              render={arrayHelpers => {
                const axes = formik.values.axes.map(r => r.key)

                return (
                  <div>
                    <Button
                      variation={ButtonVariation.PRIMARY}
                      icon="plus"
                      text="Add Exclusion"
                      onClick={() => arrayHelpers.push(axes.reduce((p, c) => ({ ...p, [c]: '' }), {}))}
                    />
                    <div
                      style={{
                        width: '600px',
                        display: 'grid',
                        gridTemplateColumns: `repeat(${axes.length}, 1fr)`,
                        columnGap: '1rem'
                      }}
                    >
                      {axes.map((a, j) => (
                        <div key={`${j}`}>{a}</div>
                      ))}
                    </div>
                    {formik.values.exclude.map((row, i) => {
                      return (
                        <div
                          key={i}
                          style={{
                            width: '600px',
                            display: 'grid',
                            gridTemplateColumns: `repeat(${axes.length}, 1fr)`,
                            columnGap: '1rem'
                          }}
                        >
                          {axes.map((a, j) => (
                            <FormInput.Select
                              key={`${i}-${j}`}
                              items={formik.values.axes?.[j]?.values || []}
                              name={`exclude[${i}].${a}`}
                            />
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )
              }}
            />
          </div>
        )
      }}
    </Formik>
  )
}
