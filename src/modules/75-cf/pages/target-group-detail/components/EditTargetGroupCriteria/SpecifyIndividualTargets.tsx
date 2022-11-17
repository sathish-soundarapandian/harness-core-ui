/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Heading } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { Segment } from 'services/cf'
import TargetSelect from './TargetSelect'

import sectionCss from './Section.module.scss'

export interface SpecifyIndividualTargetsProps {
  targetGroup: Segment
}

const SpecifyIndividualTargets: FC<SpecifyIndividualTargetsProps> = ({ targetGroup }) => {
  const { getString } = useStrings()

  return (
    <section className={sectionCss.section}>
      <Heading level={3} font={{ variation: FontVariation.FORM_SUB_SECTION }}>
        {getString('cf.segmentDetail.specifyIndividualTargets')}
      </Heading>

      <TargetSelect
        environmentIdentifier={targetGroup.environment as string}
        fieldName="included"
        label={`${getString('cf.segmentDetail.includeTheFollowing')}:`}
      />

      <TargetSelect
        environmentIdentifier={targetGroup.environment as string}
        fieldName="excluded"
        label={`${getString('cf.segmentDetail.excludeTheFollowing')}:`}
      />
    </section>
  )
}

export default SpecifyIndividualTargets
