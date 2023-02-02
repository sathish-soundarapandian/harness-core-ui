/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text, ThumbnailSelect } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useFormikContext } from 'formik'
import { NameIdDescriptionTags } from '@common/components'
import { useStrings } from 'framework/strings'
import { DowntimeForm, DowntimeFormFields } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.types'
import { getDowntimeCategoryOptions } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.utils'

const DowntimeName = ({ identifier }: { identifier?: string }): JSX.Element => {
  const { getString } = useStrings()

  const formikProps = useFormikContext<DowntimeForm>()

  return (
    <Layout.Vertical spacing={'huge'}>
      <Container width={350}>
        <NameIdDescriptionTags
          formikProps={formikProps}
          identifierProps={{
            inputLabel: getString('cv.sloDowntime.downtimeName'),
            inputName: DowntimeFormFields.NAME,
            isIdentifierEditable: !identifier
          }}
        />
      </Container>
      <Layout.Vertical spacing={'small'}>
        <Text font={{ variation: FontVariation.CARD_TITLE }}>{getString('cv.sloDowntime.selectCategory')}</Text>
        <ThumbnailSelect
          size="large"
          isReadonly={false}
          name={DowntimeFormFields.CATEGORY}
          items={getDowntimeCategoryOptions(getString)}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default DowntimeName
