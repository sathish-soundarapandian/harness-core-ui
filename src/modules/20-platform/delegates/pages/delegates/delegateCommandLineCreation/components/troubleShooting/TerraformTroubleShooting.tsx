import { Text, Container } from '@harness/uicore'

import { FontVariation } from '@harness/design-system'
import React from 'react'
import CommandBlock from '@common/CommandBlock/CommandBlock'
import { DelegateActions, Category } from '@common/constants/TrackingConstants'
import { DelegateCommonProblemTypes } from '@delegates/constants'
import { useStrings } from 'framework/strings'

import CommonTroubleShootingSteps from './CommonTroubleShootingSteps'

const hashiCorpURL =
  'https://developer.hashicorp.com/terraform/tutorials/configuration-language/troubleshooting-workflow'
const TerraformTroubleShooting = () => {
  const { getString } = useStrings()
  return (
    <>
      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.terraformTroubleShooting1')}
      </Text>
      <Container margin={{ bottom: 'xxlarge' }}>
        <CommandBlock
          telemetryProps={{
            copyTelemetryProps: {
              eventName: DelegateActions.DelegateCommandLineTroubleShootTerraformCopyCommonCommand1,
              properties: { category: Category.DELEGATE }
            }
          }}
          commandSnippet={getString('delegates.commandLineCreation.terraformTroubleShooting2')}
          allowCopy={true}
        />
      </Container>
      <Text font={{ variation: FontVariation.BODY }} margin={{ bottom: 'medium' }}>
        {getString('delegates.commandLineCreation.terraformTroubleShooting3')}{' '}
        <a target="_blank" rel="noreferrer" href={hashiCorpURL}>
          {getString('delegates.commandLineCreation.terraformTroubleShooting4')}
        </a>
      </Text>
      <CommonTroubleShootingSteps delegateType={DelegateCommonProblemTypes.TERRAFORM} />
    </>
  )
}
export default TerraformTroubleShooting
