/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash-es'
import { useFormikContext } from 'formik'
import type { Column, Renderer, CellProps } from 'react-table'
import { Button, ButtonVariation, Text, TextInput, TableV2, Intent } from '@harness/uicore'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import type { SLOV2Form } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import type { ServiceLevelObjectiveDetailsDTO } from 'services/cv'
import { getDistribution } from './AddSLOs.utils'

export const AddSLOs = (): JSX.Element => {
  const formikProps = useFormikContext<SLOV2Form>()
  const { showDrawer, hideDrawer } = useDrawer({
    createHeader: _props => <></>,
    createDrawerContent: _props => (
      <>
        <Button
          onClick={() => {
            formikProps.setFieldValue('serviceLevelObjectivesDetails', [
              {
                serviceLevelObjectiveRef: 'hHJYxnUFTCypZdmYr0Q0tQ',
                weightagePercentage: 50.0
              },
              {
                serviceLevelObjectiveRef: '7b-_GIZxRu6VjFqAqqdVDQ',
                weightagePercentage: 50.0
              }
            ])
            hideDrawer()
          }}
          text={'Add SLOs'}
          iconProps={{ name: 'plus' }}
          variation={ButtonVariation.PRIMARY}
        />
      </>
    )
  })

  const [serviceLevelObjectivesDetails, setServiceLevelObjectivesDetails] = useState(
    () => formikProps?.values?.serviceLevelObjectivesDetails || []
  )

  const [cursorIndex, setCursorIndex] = useState(0)

  useEffect(() => {
    if (
      formikProps?.values?.serviceLevelObjectivesDetails &&
      !isEqual(serviceLevelObjectivesDetails, formikProps?.values?.serviceLevelObjectivesDetails)
    ) {
      setServiceLevelObjectivesDetails(formikProps?.values?.serviceLevelObjectivesDetails || [])
    }
  }, [formikProps?.values?.serviceLevelObjectivesDetails])

  const onWeightChange = (weight: number, index: number) => {
    if (weight < 100) {
      const neweDist = getDistribution(weight, index, serviceLevelObjectivesDetails)
      setServiceLevelObjectivesDetails(neweDist)
    } else {
      const cloneList = [...serviceLevelObjectivesDetails]
      cloneList[index].weightagePercentage = weight
      setServiceLevelObjectivesDetails(cloneList)
    }
    setCursorIndex(index)
  }

  const RenderWeightInput: Renderer<CellProps<ServiceLevelObjectiveDetailsDTO>> = ({ row }) => {
    return (
      <TextInput
        max={99}
        min={1}
        autoFocus={row.index === cursorIndex}
        intent={row.original.weightagePercentage > 99 ? Intent.DANGER : Intent.PRIMARY}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onWeightChange(Number(e.currentTarget.value), row.index)}
        name="weightagePercentage"
        value={row.original.weightagePercentage.toString()}
      />
    )
  }

  const RenderName: Renderer<CellProps<ServiceLevelObjectiveDetailsDTO>> = ({ row }) => {
    return <Text>{row.original.serviceLevelObjectiveRef}</Text>
  }

  const columns: Column<ServiceLevelObjectiveDetailsDTO>[] = [
    {
      accessor: 'serviceLevelObjectiveRef',
      Header: 'Name',
      Cell: RenderName,
      disableSortBy: true
    },
    {
      accessor: 'weightagePercentage',
      Header: 'Weightage',
      Cell: RenderWeightInput,
      disableSortBy: true
    }
  ]

  return (
    <>
      <Button
        variation={ButtonVariation.SECONDARY}
        text={'Add SLOs'}
        iconProps={{ name: 'plus' }}
        onClick={showDrawer}
      />
      <TableV2 columns={columns} data={serviceLevelObjectivesDetails} />
    </>
  )
}
