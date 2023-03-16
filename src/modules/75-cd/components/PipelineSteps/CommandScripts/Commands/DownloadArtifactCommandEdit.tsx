/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, AllowedTypes, Text, Accordion } from '@harness/uicore'
import { Color } from '@harness/design-system'

import { useStrings } from 'framework/strings'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import OptionalConfiguration from './OptionalConfiguration'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

import css from './CommandEdit.module.scss'

interface DownloadArtifactCommandEditProps {
  allowableTypes: AllowedTypes
  readonly?: boolean
  expressions?: string[]
}

export function DownloadArtifactCommandEdit(props: DownloadArtifactCommandEditProps): React.ReactElement {
  const { readonly, allowableTypes, expressions = [] } = props

  const { getString } = useStrings()

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
            multiTextInputProps: {
              expressions,
              allowableTypes
            },
            disabled: readonly,
            placeholder: getString('cd.steps.commands.destinationPathPlaceholder')
          }}
        />
        <Accordion activeId="step-1" className={stepCss.accordion}>
          <Accordion.Panel
            id="optional-config"
            summary={getString('common.optionalConfig')}
            details={
              <OptionalConfiguration
                expressions={expressions}
                name={'spec.parameters'}
                readonly={false}
                allowableTypes={allowableTypes}
              />
            }
          />
        </Accordion>
      </Container>
    </>
  )
}
