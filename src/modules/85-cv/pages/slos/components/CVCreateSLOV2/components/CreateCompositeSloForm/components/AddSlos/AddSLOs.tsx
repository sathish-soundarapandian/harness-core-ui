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
import {
  Button,
  ButtonVariation,
  Color,
  Icon,
  Text,
  TextInput,
  TableV2,
  Intent,
  Page,
  useConfirmationDialog,
  ButtonSize
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SLOV2Form, SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import type { ServiceLevelObjectiveDetailsDTO } from 'services/cv'
import { getDistribution } from './AddSLOs.utils'
import { SLOList } from './components/SLOList'
import { resetSLOWeightage } from './components/SLOList.utils'

export const AddSLOs = (): JSX.Element => {
  const formikProps = useFormikContext<SLOV2Form>()
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showDrawer, hideDrawer } = useDrawer({
    createHeader: () => <Page.Header title={getString('cv.CompositeSLO.AddSLO')} />,
    createDrawerContent: () => {
      return (
        <SLOList
          hideDrawer={() => hideDrawer()}
          onAddSLO={formikProps.setFieldValue}
          filter={formikProps.values.periodType}
          serviceLevelObjectivesDetails={formikProps?.values?.serviceLevelObjectivesDetails || []}
        />
      )
    }
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

  const onWeightChange = (weight: number, index: number): void => {
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

  const RenderDelete: Renderer<CellProps<ServiceLevelObjectiveDetailsDTO>> = ({ row }) => {
    const { serviceLevelObjectiveRef } = row.original
    const { openDialog } = useConfirmationDialog({
      titleText: getString('common.delete', { name: serviceLevelObjectiveRef }),
      contentText: (
        <Text color={Color.GREY_800}>{getString('cv.slos.confirmDeleteSLO', { name: serviceLevelObjectiveRef })}</Text>
      ),
      confirmButtonText: getString('delete'),
      cancelButtonText: getString('cancel'),
      intent: Intent.DANGER,
      buttonIntent: Intent.DANGER,
      onCloseDialog: (isConfirmed: boolean) => {
        if (isConfirmed) {
          const filterServiceLevelObjective = formikProps?.values?.serviceLevelObjectivesDetails?.filter(
            item => item.serviceLevelObjectiveRef !== serviceLevelObjectiveRef
          )
          formikProps.setFieldValue(SLOV2FormFields.SERVICE_LEVEL_OBJECTIVES_DETAILS, filterServiceLevelObjective)
        }
      }
    })

    return (
      <Icon
        style={{ cursor: 'pointer' }}
        padding={'small'}
        name="main-trash"
        onClick={e => {
          e.stopPropagation()
          openDialog()
        }}
      />
    )
  }

  const columns: Column<ServiceLevelObjectiveDetailsDTO>[] = [
    {
      accessor: 'serviceLevelObjectiveRef',
      Header: getString('name'),
      Cell: RenderName
    },
    {
      accessor: 'weightagePercentage',
      Header: (
        <>
          <Text>{getString('cv.CompositeSLO.Weightage')}</Text>
          <Button
            minimal
            size={ButtonSize.SMALL}
            onClick={() => {
              const updatedSLOList = resetSLOWeightage(
                formikProps?.values?.serviceLevelObjectivesDetails as ServiceLevelObjectiveDetailsDTO[],
                accountId,
                orgIdentifier,
                projectIdentifier
              )
              formikProps.setFieldValue(SLOV2FormFields.SERVICE_LEVEL_OBJECTIVES_DETAILS, updatedSLOList)
            }}
          >
            {getString('reset')}
          </Button>
        </>
      ),
      Cell: RenderWeightInput
    },
    {
      id: 'deletSLO',
      Cell: RenderDelete,
      disableSortBy: true
    }
  ]

  const showSLOTableAndMessage = Boolean(serviceLevelObjectivesDetails.length)

  return (
    <>
      {showSLOTableAndMessage && <Text>{getString('cv.CompositeSLO.AddSLOMessage')}</Text>}
      <Button
        data-testid={'addSlosButton'}
        variation={ButtonVariation.SECONDARY}
        text={getString('cv.CompositeSLO.AddSLO')}
        iconProps={{ name: 'plus' }}
        onClick={showDrawer}
        margin={{ bottom: 'large', top: 'large' }}
      />
      {showSLOTableAndMessage && <TableV2 sortable columns={columns} data={serviceLevelObjectivesDetails} minimal />}
    </>
  )
}
