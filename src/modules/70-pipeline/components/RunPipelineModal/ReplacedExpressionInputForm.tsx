/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Label, Layout, TextInput } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './RunPipelineForm.module.scss'
interface ReplacedExpressionInputFormProps {
  expressions?: string[]
  updateExpressionValue: React.FormEventHandler<HTMLElement>
}
function ReplacedExpressionInputForm({
  expressions = [],
  updateExpressionValue
}: ReplacedExpressionInputFormProps): React.ReactElement | null {
  const { getString } = useStrings()

  return expressions.length > 0 ? (
    <Layout.Vertical className={css.replaceExpressionForm}>
      <Text
        font={{
          variation: FontVariation.FORM_TITLE
        }}
      >
        {getString('pipeline.replacedExpressions')}
      </Text>

      <div className={css.form}>
        {expressions?.map((exprName: string) => (
          <Layout.Vertical key={exprName}>
            <Label>
              <Text width={300} lineClamp={1}>
                {exprName}
              </Text>
            </Label>
            <TextInput name={exprName} onChange={updateExpressionValue} />
          </Layout.Vertical>
        ))}
      </div>
    </Layout.Vertical>
  ) : null
}
export default ReplacedExpressionInputForm
