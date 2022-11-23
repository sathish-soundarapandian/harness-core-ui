/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import { Button, ButtonVariation, Container, Layout, SelectOption, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useFormikContext } from 'formik'
import GroupName from '@cv/components/GroupName/GroupName'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/strings'
import type { CustomHealthMetricDefinition } from 'services/cv'
import { CommonHealthSourceFieldNames } from '../../../CommonHealthSource.types'
import type { AddMetricForm } from '../CustomMetricForm.types'

export interface AddMetricProps {
  enableDefaultGroupName: boolean
  currentSelectedMetricDetail: CustomHealthMetricDefinition
  groupNames: SelectOption[]
  setGroupName: Dispatch<SetStateAction<SelectOption[]>>
}

export default function AddMetric(props: AddMetricProps): JSX.Element {
  const { enableDefaultGroupName, currentSelectedMetricDetail, groupNames, setGroupName } = props
  const { handleReset, handleSubmit, values, setFieldValue } = useFormikContext<AddMetricForm>()
  const { getString } = useStrings()
  const handleSubmitData = (): void => handleSubmit()
  return (
    <Container padding="large">
      <Text font={{ weight: 'bold', size: 'large' }} color={Color.BLACK} padding={{ bottom: 'xxlarge' }}>
        {getString('cv.monitoringSources.commonHealthSource.addMetric')}
      </Text>
      <Layout.Vertical spacing="small">
        <NameId
          nameLabel={getString('cv.monitoringSources.commonHealthSource.metricName')}
          identifierProps={{
            inputName: CommonHealthSourceFieldNames.METRIC_NAME,
            idName: CommonHealthSourceFieldNames.METRIC_IDENTIFIER,
            isIdentifierEditable: Boolean(!currentSelectedMetricDetail?.identifier)
          }}
        />
        {!enableDefaultGroupName ? (
          <GroupName
            groupNames={groupNames}
            onChange={setFieldValue}
            item={values?.groupName as SelectOption}
            setGroupNames={setGroupName}
            label={getString('rbac.userDetails.linkToSSOProviderModal.groupNameLabel')}
            title={getString('cv.monitoringSources.commonHealthSource.addGroupName')}
            fieldName={CommonHealthSourceFieldNames.GROUP_NAME}
          />
        ) : null}
        <Container style={{ paddingTop: 'var(--spacing-xlarge)' }}>
          <Layout.Horizontal spacing="small" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('submit')}
              onClick={handleSubmitData}
              intent="primary"
            />
            <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={handleReset} minimal />
          </Layout.Horizontal>
        </Container>
      </Layout.Vertical>
    </Container>
  )
}
