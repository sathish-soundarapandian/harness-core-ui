/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.module.scss'

const SLOTargetContextualHelpText = (): JSX.Element => {
  const { getString } = useStrings()
  return (
    <>
      <Text className={css.title}>{getString('cv.slos.contextualHelp.target.compliance')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.target.complianceDefinition')}</Text>
      <Text margin={{ bottom: 'xsmall' }}>{getString('cv.slos.contextualHelp.target.complianceDefinition2')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.target.complianceDefinition3')}</Text>
      <Text className={css.title}>{getString('cv.slos.contextualHelp.target.rollingWindowBased')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.target.rollingWindowDefinition')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.target.rollingWindowDefinition2')}</Text>
      <Text className={css.title}>{getString('cv.slos.contextualHelp.target.calendarBased')}</Text>
      <Text margin={{ bottom: 'large' }}>{getString('cv.slos.contextualHelp.target.calendarBasedDefinition')}</Text>
      <Text>{getString('cv.slos.contextualHelp.target.calendarBasedDefinition2')}</Text>
    </>
  )
}

export default SLOTargetContextualHelpText
