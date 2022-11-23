/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useFormikContext } from 'formik'
import cx from 'classnames'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import type { GetDataError } from 'restful-react'
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
  Layout,
  Page
} from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SLOObjective, SLOV2Form, SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import type { ResponsePageSLOHealthListView, ServiceLevelObjectiveDetailsDTO, SLOHealthListView } from 'services/cv'
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

interface AddSLOsProp {
  data?: ResponsePageSLOHealthListView | null
  loading?: boolean
  refetch?: (props?: any) => Promise<void> | undefined
  error?: GetDataError<unknown> | null
}

export const AddSLOs = (props: AddSLOsProp): JSX.Element => {
  const {
    data: dashboardWidgetsResponse,
    loading: dashboardWidgetsLoading,
    refetch: refetchDashboardWidgets,
    error: dashboardWidgetsError
  } = props
  const formikProps = useFormikContext<SLOV2Form>()
  const { getString } = useStrings()
  const [isListViewDataInitialised, setIsListViewDataInitialised] = useState(false)

  const [initialSLODetails, setInitialSLODetails] = useState<SLOObjective[]>(
    () => formikProps?.values?.serviceLevelObjectivesDetails || []
  )
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

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

  const columns: Column<SLOObjective>[] = [
    {
      accessor: 'serviceLevelObjectiveRef',
      Header: getString('name'),
      width: '20%',
      Cell: RenderName
    },
    {
      accessor: 'serviceName',
      Header: getString('cv.slos.monitoredService').toUpperCase(),
      width: '20%',
      Cell: RenderMonitoredService
    },
    {
      accessor: 'userJourneyName',
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
      accessor: 'sliType',
      Header: getString('cv.slos.sliType').toUpperCase(),
      width: '10%',
      Cell: RenderSLIType
    },
    {
      accessor: 'sloTargetPercentage',
      Header: getString('cv.slos.target').toUpperCase(),
      width: '10%',
      Cell: RenderTarget
    },
    {
      accessor: 'weightagePercentage',
      disableSortBy: true,
      Header: (
        <>
          <Text>{getString('cv.CompositeSLO.Weightage')}</Text>
          <Button
            color={Color.PRIMARY_7}
            withoutBoxShadow
            intent={Intent.PRIMARY}
            minimal
            disabled={
              !formikProps?.values?.serviceLevelObjectivesDetails?.filter(item => item.isManuallyUpdated).length
            }
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
          </Button>
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
  const totalOfSloWeight = Number(
    serviceLevelObjectivesDetails
      .reduce((total, num) => {
        return num.weightagePercentage + total
      }, 0)
      .toFixed(2)
  )
  const showErrorState = totalOfSloWeight > 100

  return (
    <Page.Body
      loading={dashboardWidgetsLoading}
      error={getErrorMessage(dashboardWidgetsError)}
      retryOnError={() => refetchDashboardWidgets?.()}
      className={css.noMinHeight}
    >
      {showSLOTableAndMessage && <Text>{getString('cv.CompositeSLO.AddSLOMessage')}</Text>}
      <Button
        width={150}
        loading={dashboardWidgetsLoading}
        data-testid={'addSlosButton'}
        variation={ButtonVariation.SECONDARY}
        text={getString('cv.CompositeSLO.AddSLO')}
        iconProps={{ name: 'plus' }}
        onClick={showDrawer}
        margin={showSLOTableAndMessage ? { bottom: 'large', top: 'large' } : {}}
      />
      {showSLOTableAndMessage && (
        <>
          <TableV2 sortable columns={columns} data={serviceLevelObjectivesDetails} minimal />
          <HelpPanel referenceId={'compositeSLOWeightage'} type={HelpPanelType.FLOATING_CONTAINER} />
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
    </Page.Body>
  )
}
