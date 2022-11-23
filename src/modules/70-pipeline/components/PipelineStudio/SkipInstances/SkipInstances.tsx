/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Checkbox, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { StageElementConfig } from 'services/pipeline-ng'

interface SkipInstancesConfig extends StageElementConfig {
  skipInstances?: boolean
}

export interface SkipInstancesProps {
  selectedStage?: SkipInstancesConfig
  isReadonly: boolean
  onUpdate(check: boolean): void
  name: string
  value?: string | boolean
}

function SkipInstances(props: SkipInstancesProps): JSX.Element {
  const { getString } = useStrings()
  const { isReadonly, onUpdate, value, name } = props
  return (
    <Layout.Horizontal>
      <Checkbox
        checked={!!value}
        name={name}
        disabled={isReadonly}
        data-testid="skip-instances-check"
        labelElement={<Text>{getString('pipeline.skipInstances.title')}</Text>}
        onChange={input => {
          const { checked } = input.target as HTMLInputElement
          onUpdate(checked)
        }}
      />
    </Layout.Horizontal>
  )
}

export default SkipInstances
