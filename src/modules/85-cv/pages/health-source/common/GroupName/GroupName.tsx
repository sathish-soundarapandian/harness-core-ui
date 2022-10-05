/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, Formik, FormikForm, Text, Container, Layout, Button, SelectOption } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { GroupNameProps, CreateGroupName } from './GroupName.types'
import { validate } from './GroupName.utils'
import { defaultGroupName, DialogProps } from './GroupName.constants'

export function GroupName(props: GroupNameProps): JSX.Element {
  const { groupNames = [], onChange, item, setGroupNames, fieldName, allowAddGroup } = props
  const { getString } = useStrings()
  const addNewOption = { label: getString('cv.addNew'), value: '' }

  const dropdownOptions: SelectOption[] = groupNames

  // Adding "+ Add New" option based on  "allowAddGroup" prop
  if (allowAddGroup) {
    const isAddNewOptionPresent = groupNames.find(groupName => groupName.label === addNewOption.label)
    if (!isAddNewOptionPresent) {
      dropdownOptions.unshift(addNewOption)
    }
  }

  const dropdownFieldName = fieldName ?? defaultGroupName

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog {...DialogProps} onClose={hideModal}>
        <Formik<CreateGroupName>
          initialValues={{ name: '' }}
          validate={values => validate(values, groupNames, getString)}
          formName="healthSourceGroupName"
          onSubmit={values => {
            const createdGroupName = { label: values.name, value: values.name }
            setGroupNames?.(oldNames => [...oldNames, createdGroupName])
            hideModal()
            onChange(dropdownFieldName, createdGroupName)
          }}
        >
          <FormikForm>
            <Container margin="medium">
              <Text font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'large' }}>
                {getString('cv.monitoringSources.appD.newGroupName')}
              </Text>
              <FormInput.Text name="name" label={getString('cv.monitoringSources.prometheus.groupName')} />
              <Layout.Horizontal spacing="medium" margin={{ top: 'large', bottom: 'large' }}>
                <Button text={getString('submit')} type="submit" intent="primary" />
                <Button text={getString('cancel')} onClick={hideModal} />
              </Layout.Horizontal>
            </Container>
          </FormikForm>
        </Formik>
      </Dialog>
    ),
    [groupNames]
  )

  return (
    <FormInput.Select
      value={item || { value: '', label: '' }}
      name={dropdownFieldName}
      label={getString('cv.monitoringSources.prometheus.groupName')}
      items={dropdownOptions || []}
      onChange={selectedItem => {
        if (selectedItem?.label === addNewOption.label) {
          openModal()
        } else {
          onChange(dropdownFieldName, selectedItem)
        }
      }}
    />
  )
}
