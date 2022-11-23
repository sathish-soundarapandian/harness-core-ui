/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FormInput, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { UnallocatedCost } from 'services/ce'
import css from './ManageUnallocatedCost.module.scss'

interface ManageUnallocatedCostProps {
  data: UnallocatedCost
}

const ManageUnallocatedCost: (props: ManageUnallocatedCostProps) => React.ReactElement = ({ data }) => {
  const strategy = data.strategy

  const { getString } = useStrings()
  return (
    <Container>
      <FormInput.RadioGroup
        className={css.radioContainer}
        name="unallocatedCost.strategy"
        items={[
          {
            label: (
              <Layout.Horizontal className={css.hContainer} spacing="small">
                <Text font={{ variation: FontVariation.FORM_LABEL }}>
                  {getString('ce.businessMapping.manageUnallocatedCost.defaultUnallocatedCostLabel')}
                </Text>
                <FormInput.Text
                  name="unallocatedCost.label"
                  placeholder={getString('ce.businessMapping.manageUnallocatedCost.otherPlaceholder')}
                  className={css.defaultValInputBox}
                  disabled={strategy !== 'DISPLAY_NAME'}
                />
              </Layout.Horizontal>
            ),
            value: 'DISPLAY_NAME'
          },
          {
            label: (
              <Text font={{ variation: FontVariation.FORM_LABEL }}>
                {getString('ce.businessMapping.manageUnallocatedCost.ignoreCostLabel')}
              </Text>
            ),
            value: 'HIDE'
          },
          { label: getString('ce.businessMapping.manageUnallocatedCost.shareCosts'), value: 'SHARE', disabled: true }
        ]}
      />
    </Container>
  )
}

export default ManageUnallocatedCost
