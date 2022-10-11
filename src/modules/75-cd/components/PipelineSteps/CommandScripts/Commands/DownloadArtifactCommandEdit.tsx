/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, Container, AllowedTypes, Text } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import css from './CommandEdit.module.scss'

interface DownloadArtifactCommandEditProps {
  allowableTypes: AllowedTypes
  readonly?: boolean
}

export function DownloadArtifactCommandEdit(props: DownloadArtifactCommandEditProps): React.ReactElement {
  const { readonly, allowableTypes } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      <Container className={css.destinationPath}>
        <MultiTypeTextField
          label={
            <Text
              tooltipProps={{ dataTooltipId: 'destinationPath' }}
              className={css.destinationPathLabel}
              color={Color.GREY_500}
            >
              {getString('cd.steps.commands.destinationPath')}
            </Text>
          }
          name="spec.destinationPath"
          multiTextInputProps={{
            multiTextInputProps: { expressions, allowableTypes },
            disabled: readonly,
            placeholder: getString('cd.steps.commands.destinationPathPlaceholder')
          }}
        />
      </Container>
    </>
  )
}
