/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Button, FormInput, ButtonVariation, AllowedTypes, MultiTypeInputType } from '@harness/uicore'
import cx from 'classnames'

import { v4 as nameSpace, v5 as uuid } from 'uuid'
import { FieldArray, FormikValues } from 'formik'
import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import type { CommandFlags } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { useK8sCmdFlags } from 'services/cd-ng'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import css from './CommandFlagsPanel.module.scss'

interface CommandFlagsPanelProps {
  formik: FormikValues
  step: StepOrStepGroupOrTemplateStepData
  deploymentType?: string
  allowableTypes?: AllowedTypes
}

function CommandFlagsPanel({
  formik,
  deploymentType = 'Kubernetes',
  allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
}: CommandFlagsPanelProps): React.ReactElement {
  const { getString } = useStrings()
  const { data, loading } = useK8sCmdFlags({
    queryParams: {
      serviceSpecType: deploymentType
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
        <div className={css.commandFlags}>
          <FieldArray
            name="commandFlags"
            render={({ push, remove }) => (
              <Layout.Vertical>
                {formik.values?.commandFlags?.map((commandFlag: CommandFlags, index: number) => (
                  <Layout.Horizontal key={commandFlag.id}>
                    <div
                      className={cx(css.commandType, {
                        [css.commandFlagType]: index !== 0
                      })}
                    >
                      <FormInput.Select
                        name={`commandFlags[${index}].commandType`}
                        label={index === 0 ? getString('pipeline.fieldLabels.commandType') : ''}
                        items={commandFlagOptions}
                        placeholder={getString('pipeline.fieldPlaceholders.commandType')}
                        className={css.commandTypeSelect}
                      />
                    </div>
                    <div
                      className={cx({
                        [css.commandFlags]: index !== 0
                      })}
                    >
                      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
                        <MultiTypeFieldSelector
                          name={`commandFlags[${index}].flag`}
                          label={index === 0 ? getString('flag') : ''}
                          allowedTypes={allowableTypes}
                          style={{ width: 270 }}
                          skipRenderValueInExpressionLabel
                          expressionRender={() => (
                            <MonacoTextField
                              name={`commandFlags[${index}].flag`}
                              expressions={expressions}
                              height={80}
                              fullScreenAllowed
                              fullScreenTitle={getString('flag')}
                            />
                          )}
                        >
                          <MonacoTextField
                            name={`commandFlags[${index}].flag`}
                            expressions={expressions}
                            height={80}
                            fullScreenAllowed
                            fullScreenTitle={getString('flag')}
                          />
                        </MultiTypeFieldSelector>

                        {
                          <Button
                            minimal
                            icon="main-trash"
                            data-testId="deleteCommandFlag"
                            className={cx({
                              [css.delBtn]: index === 0
                            })}
                            onClick={() => remove(index)}
                          />
                        }
                      </Layout.Horizontal>
                    </div>
                  </Layout.Horizontal>
                ))}
                {!!(get(formik, 'values.commandFlags', []).length < commandFlagOptions.length) && (
                  <span>
                    <Button
                      minimal
                      text={getString('add')}
                      variation={ButtonVariation.PRIMARY}
                      onClick={() =>
                        push({
                          commandType: '',
                          flag: '',
                          id: uuid('', nameSpace())
                        })
                      }
                    />
                  </span>
                )}
              </Layout.Vertical>
            )}
          />
        </div>
      )}
    </div>
  )
}

export default CommandFlagsPanel
