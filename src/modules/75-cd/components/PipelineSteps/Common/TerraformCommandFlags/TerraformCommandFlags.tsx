/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Button, FormInput, ButtonVariation, AllowedTypes, MultiTypeInputType } from '@harness/uicore'
import cx from 'classnames'

import { FieldArray, FormikValues } from 'formik'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TerraformCliOptionFlag, useTerraformCmdFlags } from 'services/cd-ng'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import css from './TerraformCommandFlags.module.scss'

interface TerraformCommandFlagsProps {
  formik: FormikValues
  allowableTypes?: AllowedTypes
  stepType: string
  configType: string
  path: string
}

function TerraformCommandFlags({
  formik,
  allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
  stepType,
  configType,
  path
}: TerraformCommandFlagsProps): React.ReactElement {
  const { getString } = useStrings()
  const { data, loading } = useTerraformCmdFlags({
    queryParams: {
      stepType: stepType,
      configType: configType
    }
  })

  const commandFlagOptions = React.useMemo(() => {
    return get(data, 'data', []).map((flag: string) => ({
      label: flag,
      value: flag
    }))
  }, [data])
  const { expressions } = useVariablesExpression()

  return (
    <div>
      {loading ? <ContainerSpinner /> : null}
      {commandFlagOptions.length > 0 && (
        <FieldArray
          name={path}
          render={({ push, remove }) => (
            <Layout.Vertical>
              {get(formik?.values, `${path}`)?.map((commandFlag: TerraformCliOptionFlag, index: number) => (
                <Layout.Horizontal key={commandFlag.commandType}>
                  <div
                    className={cx(css.commandType, {
                      [css.commandFlagType]: index !== 0
                    })}
                  >
                    <FormInput.Select
                      name={`${path}[${index}].commandType`}
                      label={index === 0 ? getString('pipeline.fieldLabels.commandType') : ''}
                      items={commandFlagOptions}
                      placeholder={getString('pipeline.fieldPlaceholders.commandType')}
                      className={css.commandTypeSelect}
                    />
                  </div>
                  <div>
                    <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
                      <MultiTypeFieldSelector
                        name={`${path}[${index}].flag`}
                        label={index === 0 ? getString('flag') : ''}
                        allowedTypes={allowableTypes}
                        style={{ width: 270 }}
                        skipRenderValueInExpressionLabel
                        expressionRender={() => (
                          <MonacoTextField
                            name={`${path}[${index}].flag`}
                            expressions={expressions}
                            height={80}
                            fullScreenAllowed
                            fullScreenTitle={getString('flag')}
                          />
                        )}
                      >
                        <MonacoTextField
                          name={`${path}[${index}].flag`}
                          expressions={expressions}
                          height={80}
                          fullScreenAllowed
                          fullScreenTitle={getString('flag')}
                        />
                      </MultiTypeFieldSelector>

                      <Button
                        minimal
                        icon="main-trash"
                        data-testId="deleteCommandFlag"
                        className={cx({
                          [css.delBtn]: index === 0
                        })}
                        onClick={() => remove(index)}
                      />
                    </Layout.Horizontal>
                  </div>
                </Layout.Horizontal>
              ))}
              {!!(get(formik?.values, `${path}`, []).length < commandFlagOptions.length) && (
                <span>
                  <Button
                    minimal
                    text={getString('add')}
                    variation={ButtonVariation.PRIMARY}
                    onClick={() =>
                      push({
                        commandType: '',
                        flag: ''
                      })
                    }
                  />
                </span>
              )}
            </Layout.Vertical>
          )}
        />
      )}
    </div>
  )
}

export default TerraformCommandFlags
