/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, Button, ButtonProps, MultiTypeInputType } from '@harness/uicore'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useStrings } from 'framework/strings'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'

export default function CVMultiTypeQuery({
  name,
  disableFetchButton,
  expressions,
  fetchRecords,
  allowedTypes,
  onTypeChange,
  fetchButtonProps = {},
  runQueryBtnTooltip,
  hideFetchButton = false
}: {
  name: string
  disableFetchButton?: boolean
  hideFetchButton?: boolean
  expressions: string[]
  allowedTypes?: AllowedTypes
  fetchRecords?: () => void
  onTypeChange?: (type: MultiTypeInputType) => void
  fetchButtonProps?: Partial<ButtonProps>
  runQueryBtnTooltip?: string
}): JSX.Element {
  const { getString } = useStrings()

  return (
    <MultiTypeFieldSelector
      name={name}
      label={getString('cv.query')}
      defaultValueToReset=""
      skipRenderValueInExpressionLabel
      onTypeChange={onTypeChange}
      allowedTypes={
        allowedTypes || [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
      }
      expressionRender={() => {
        return (
          <>
            <ShellScriptMonacoField
              name={name}
              scriptType={'Bash'}
              expressions={expressions}
              editorOptions={{ lineNumbers: 'off' }}
              title={getString('cv.query')}
            />
          </>
        )
      }}
    >
      <ShellScriptMonacoField
        name={name}
        scriptType={'Bash'}
        title={getString('cv.query')}
        editorOptions={{ lineNumbers: 'off' }}
      />
      {!hideFetchButton && (
        <Button
          intent="primary"
          text={getString('cv.monitoringSources.gcoLogs.fetchRecords')}
          onClick={async () => {
            fetchRecords?.()
          }}
          margin={{ top: 'medium' }}
          disabled={disableFetchButton}
          {...fetchButtonProps}
          tooltip={runQueryBtnTooltip}
        />
      )}
    </MultiTypeFieldSelector>
  )
}
