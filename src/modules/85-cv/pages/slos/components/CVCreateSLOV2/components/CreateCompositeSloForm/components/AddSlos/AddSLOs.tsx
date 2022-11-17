/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import cx from 'classnames'
import type { Column, Renderer, CellProps } from 'react-table'
import {
  Button,
  ButtonVariation,
  Icon,
  Text,
  TextInput,
  TableV2,
  useConfirmationDialog,
  Container,
  Layout
} from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useMutateAsGet } from '@common/hooks'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SLOObjective, SLOV2Form, SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { ServiceLevelObjectiveDetailsDTO, SLOHealthListView, useGetSLOHealthListViewV2 } from 'services/cv'
import { createRequestBodyForSLOHealthListViewV2, onWeightChange, RenderName, resetSLOWeightage } from './AddSLOs.utils'
import { SLOList } from './components/SLOList'
import {
  RenderMonitoredService,
  RenderSLIType,
  RenderTags,
  RenderTarget,
  RenderUserJourney
} from './components/SLOList.utils'
import { SLOWeight } from '../../CreateCompositeSloForm.constant'
import css from './AddSLOs.module.scss'

export const AddSLOs = (): JSX.Element => {
  const formikProps = useFormikContext<SLOV2Form>()
  const { getString } = useStrings()
  const [isListViewDataInitialised, setIsListViewDataInitialised] = useState(false)
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const [initialSLODetails, setInitialSLODetails] = useState<SLOObjective[]>(
    () => formikProps?.values?.serviceLevelObjectivesDetails || []
  )

  const { showDrawer, hideDrawer } = useDrawer({
    createDrawerContent: () => {
      return (
        <SLOList
          hideDrawer={() => hideDrawer()}
          onAddSLO={formikProps.setFieldValue}
          filter={createRequestBodyForSLOHealthListViewV2({ values: formikProps?.values })}
          serviceLevelObjectivesDetails={formikProps?.values?.serviceLevelObjectivesDetails || []}
        />
      )
    }
  })

  const {
    data: dashboardWidgetsResponse,
    loading: dashboardWidgetsLoading,
    refetch: refetchDashboardWidgets,
    error: dashboardWidgetsError
  } = useMutateAsGet(useGetSLOHealthListViewV2, {
    lazy: true,
    queryParams: { accountId, orgIdentifier, projectIdentifier, pageNumber: 0, pageSize: 20 },
    body: { compositeSLOIdentifier: identifier }
  })

  useEffect(() => {
    if (identifier) {
      refetchDashboardWidgets()
    }
  }, [identifier])

  useEffect(() => {
    if (dashboardWidgetsResponse?.data?.content && !isListViewDataInitialised) {
      const updatedSLODetails = formikProps?.values?.serviceLevelObjectivesDetails?.map(sloDetail => {
        return {
          ...sloDetail,
          ...(dashboardWidgetsResponse?.data?.content?.find(
            item => item.sloIdentifier === sloDetail.serviceLevelObjectiveRef
          ) as SLOHealthListView)
        }
      })
      formikProps.setFieldValue(SLOV2FormFields.SERVICE_LEVEL_OBJECTIVES_DETAILS, updatedSLODetails)
      setInitialSLODetails(updatedSLODetails as SLOObjective[])
      setIsListViewDataInitialised(true)
    }
  }, [dashboardWidgetsResponse?.data?.content])

  useEffect(() => {
    if (!initialSLODetails?.length) {
      setInitialSLODetails(formikProps?.values?.serviceLevelObjectivesDetails as SLOObjective[])
    }
  }, [formikProps?.values?.serviceLevelObjectivesDetails])

  const [cursorIndex, setCursorIndex] = useState(0)

  const serviceLevelObjectivesDetails = formikProps?.values?.serviceLevelObjectivesDetails || []
  const setServiceLevelObjectivesDetails = (updatedSLODetails: SLOObjective[]): void =>
    formikProps.setFieldValue(SLOV2FormFields.SERVICE_LEVEL_OBJECTIVES_DETAILS, updatedSLODetails)

  const RenderWeightInput: Renderer<CellProps<ServiceLevelObjectiveDetailsDTO>> = ({ row }) => {
    return (
      <Container className={css.weightageInput}>
        <TextInput
          type="number"
          step={SLOWeight.STEP}
          max={SLOWeight.MAX}
          min={SLOWeight.MIN}
          autoFocus={row.index === cursorIndex}
          intent={row.original.weightagePercentage > 99 ? Intent.DANGER : Intent.PRIMARY}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onWeightChange({
              index: row.index,
              weight: Number(e.currentTarget.value),
              serviceLevelObjectivesDetails,
              setServiceLevelObjectivesDetails,
              setCursorIndex
            })
          }
          name="weightagePercentage"
          value={row.original.weightagePercentage.toString()}
        />
        {serviceLevelObjectivesDetails?.[row.index]?.isManuallyUpdated && (
          <Button
            icon="reset"
            minimal
            withoutCurrentColor
            onClick={() => {
              const currentSLO = initialSLODetails.find(
                item => item.serviceLevelObjectiveRef === row.original.serviceLevelObjectiveRef
              )
              const initWeight = currentSLO?.weightagePercentage
              onWeightChange({
                index: row.index,
                weight: initWeight || 0,
                serviceLevelObjectivesDetails,
                setServiceLevelObjectivesDetails,
                setCursorIndex,
                isReset: true
              })
            }}
          />
        )}
      </Container>
    )
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
        style={{ cursor: 'pointer', float: 'right' }}
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
      width: '20%',
      Cell: RenderName
    },
    {
      Header: getString('cv.slos.monitoredService').toUpperCase(),
      width: '20%',
      Cell: RenderMonitoredService
    },
    {
      Header: getString('cv.slos.userJourney').toUpperCase(),
      width: '20%',
      Cell: RenderUserJourney
    },
    {
      Header: getString('tagsLabel').toUpperCase(),
      width: '10%',
      Cell: RenderTags
    },
    {
      Header: getString('cv.slos.sliType').toUpperCase(),
      width: '10%',
      Cell: RenderSLIType
    },
    {
      Header: getString('cv.slos.target').toUpperCase(),
      width: '10%',
      Cell: RenderTarget
    },
    {
      accessor: 'weightagePercentage',
      Header: (
        <>
          <Text>{getString('cv.CompositeSLO.Weightage')}</Text>
          <Text
            color={Color.PRIMARY_7}
            onClick={e => {
              e.stopPropagation()
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
          </Text>
        </>
      ),
      width: '10%',
      Cell: RenderWeightInput
    },
    {
      id: 'deletSLO',
      Cell: RenderDelete,
      disableSortBy: true
    }
  ]

  const showSLOTableAndMessage = Boolean(serviceLevelObjectivesDetails.length)
  const pageLoading = identifier ? dashboardWidgetsLoading : false
  const pageError = identifier ? Boolean(dashboardWidgetsError) : false
  const totalOfSloWeight = Number(
    serviceLevelObjectivesDetails
      .reduce((total, num) => {
        return num.weightagePercentage + total
      }, 0)
      .toFixed(2)
  )
  const showErrorState = totalOfSloWeight > 100

  return (
    <>
      {showSLOTableAndMessage && <Text>{getString('cv.CompositeSLO.AddSLOMessage')}</Text>}
      <Button
        width={150}
        loading={pageLoading}
        data-testid={'addSlosButton'}
        variation={ButtonVariation.SECONDARY}
        text={getString('cv.CompositeSLO.AddSLO')}
        iconProps={{ name: 'plus' }}
        onClick={showDrawer}
        margin={showSLOTableAndMessage ? { bottom: 'large', top: 'large' } : {}}
      />
      {showSLOTableAndMessage && (
        <>
          {pageLoading ? (
            <Container className={css.sloTableConatiner}>
              <Icon name="spinner" color="primary5" size={30} />
            </Container>
          ) : (
            <>
              <TableV2 sortable columns={columns} data={serviceLevelObjectivesDetails} minimal />
              <Container className={cx(css.totalRow, showErrorState ? css.rowFailure : css.rowSuccess)}>
                {Array(columns.length - 3)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index.toString()}></div>
                  ))}
                <Layout.Horizontal spacing={'medium'}>
                  <Text>{`${getString('total')} ${getString('cv.CompositeSLO.Weightage').toLowerCase()}`}</Text>
                  <Text intent={showErrorState ? Intent.DANGER : Intent.SUCCESS}>{totalOfSloWeight}</Text>
                </Layout.Horizontal>
              </Container>
            </>
          )}
        </>
      )}
      {pageError && <Text>{getErrorMessage(dashboardWidgetsError)}</Text>}
    </>
  )
}
