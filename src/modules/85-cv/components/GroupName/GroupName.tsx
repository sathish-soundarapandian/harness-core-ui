/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, Formik, FormikForm, Text, Container, Layout, Button } from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { CreateGroupName, DialogProps, GroupNameProps } from './GroupName.types'
import { validate } from './GroupName.utils'

export default function GroupName(props: GroupNameProps): JSX.Element {
  const { fieldName, disabled, groupNames = [], onChange, item, setGroupNames, label, title } = props
  const { getString } = useStrings()
  const addNewOption = { label: getString('cv.addNew'), value: '' }

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog {...DialogProps} onClose={hideModal}>
        <Formik<CreateGroupName>
          initialValues={{ name: '' }}
          validate={values => validate(values, groupNames, getString)}
          formName="groupName"
          onSubmit={values => {
            const createdGroupName = { label: values.name, value: values.name }
            setGroupNames(oldNames => [...oldNames, createdGroupName])
            hideModal()
            onChange(fieldName, createdGroupName)
          }}
        >
          <FormikForm>
            <Container margin="medium">
              <Text font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'large' }}>
                {title ?? getString('cv.monitoringSources.prometheus.newPrometheusGroupName')}
              </Text>
              <FormInput.Text name="name" label={label ?? getString('cv.monitoringSources.prometheus.groupName')} />
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
      label={label ?? getString('cv.monitoringSources.prometheus.groupName')}
      disabled={disabled}
      value={item}
      name={fieldName}
      items={groupNames || []}
      onChange={selectedItem => {
        if (selectedItem?.label === addNewOption.label) {
          openModal()
        }
        onChange(fieldName, selectedItem)
      }}
    />
  )
}
