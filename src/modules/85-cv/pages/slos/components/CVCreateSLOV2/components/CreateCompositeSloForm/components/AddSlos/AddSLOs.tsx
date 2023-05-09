/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo, FormEvent } from 'react'
import { useFormikContext } from 'formik'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
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
  Page,
  FormInput
} from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import dataCollectionFailure from '@cv/assets/dataCollectionFailure.svg'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  SLOFormulaType,
  SLOObjective,
  SLOV2Form,
  SLOV2FormFields
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import DataCollectionFailureTooltip from '@cv/pages/slos/common/DataCollectionFailureTooltip/DataCollectionFailureTooltip'
import {
  getSLORefIdWithOrgAndProject,
  getSLOIdentifierWithOrgAndProject
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.utils'
import { SLOErrorType } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.constants'
import type { ResponsePageSLOHealthListView, ServiceLevelObjectiveDetailsDTO, SLOHealthListView } from 'services/cv'
import {
  createRequestBodyForSLOHealthListViewV2,
  getIsLastRow,
  getSLOFormulaSelectOptions,
  onImpactPercentageChange,
  onWeightChange,
  RenderName,
  resetOnDelete,
  resetSLOWeightage
} from './AddSLOs.utils'
import { SLOList } from './components/SLOList'
import { RenderMonitoredService, RenderTags, RenderUserJourney } from './components/SLOList.utils'
import { ImpactPercentage, SLOWeight } from '../../CreateCompositeSloForm.constant'
import { getColumsForProjectAndAccountLevel, getProjectAndOrgColumn } from '../../CreateCompositeSloForm.utils'
import radiocss from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.module.scss'
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
  const isFormulaWeightedAverage = formikProps?.values?.sloFormulaType === SLOFormulaType.WEIGHTED_AVERAGE
  const { getString } = useStrings()
  const [isListViewDataInitialised, setIsListViewDataInitialised] = useState(false)

  const [initialSLODetails, setInitialSLODetails] = useState<SLOObjective[]>(
    () => formikProps?.values?.serviceLevelObjectivesDetails || []
  )
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId
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
    },
    drawerOptions: { size: '60%', canOutsideClickClose: false }
  })

  useEffect(() => {
    if (dashboardWidgetsResponse?.data?.content && !isListViewDataInitialised) {
      const updatedSLODetails = formikProps?.values?.serviceLevelObjectivesDetails?.map(sloDetail => {
        return {
          ...sloDetail,
          ...(isAccountLevel
            ? (dashboardWidgetsResponse?.data?.content?.find(
                item => getSLOIdentifierWithOrgAndProject(item) === getSLORefIdWithOrgAndProject(sloDetail)
              ) as SLOHealthListView)
            : dashboardWidgetsResponse?.data?.content?.find(
                item => item.sloIdentifier === sloDetail.serviceLevelObjectiveRef
              ))
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

  const RenderWeightInput: Renderer<CellProps<SLOObjective>> = ({ row }) => {
    const { sloError } = row.original
    const weightOrPercentage = isFormulaWeightedAverage ? SLOWeight : ImpactPercentage
    const isLastRow = getIsLastRow(row, serviceLevelObjectivesDetails)
    if (isLastRow && isFormulaWeightedAverage) {
      return <Text intent={showErrorState ? Intent.DANGER : Intent.SUCCESS}>{totalOfSloWeight}</Text>
    }
    return (
      <Container className={css.weightageInput}>
        <TextInput
          type="number"
          step={weightOrPercentage.STEP}
          max={weightOrPercentage.MAX}
          min={weightOrPercentage.MIN}
          autoFocus={row.index === cursorIndex}
          intent={
            row.original.weightagePercentage > weightOrPercentage.MAX ||
            row.original.weightagePercentage < weightOrPercentage.MIN
              ? Intent.DANGER
              : Intent.PRIMARY
          }
          disabled={sloError?.sloErrorType === SLOErrorType.SimpleSLODeletion}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const params = {
              index: row.index,
              weight: Number(e.currentTarget.value),
              serviceLevelObjectivesDetails,
              setServiceLevelObjectivesDetails,
              setCursorIndex
            }
            return isFormulaWeightedAverage ? onWeightChange({ ...params }) : onImpactPercentageChange({ ...params })
          }}
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

  const RenderDelete: Renderer<CellProps<SLOObjective>> = ({ row }) => {
    const { serviceLevelObjectiveRef, sloError } = row.original
    const isLastRow = getIsLastRow(row, serviceLevelObjectivesDetails)
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
          const updatedSLODetailsList = resetOnDelete({
            accountId,
            projectIdentifier,
            orgIdentifier,
            serviceLevelObjectiveRef: isAccountLevel
              ? getSLORefIdWithOrgAndProject(row.original)
              : serviceLevelObjectiveRef,
            serviceLevelObjectivesDetails,
            isAccountLevel
          })
          formikProps.setFieldValue(SLOV2FormFields.SERVICE_LEVEL_OBJECTIVES_DETAILS, updatedSLODetailsList)
        }
      }
    })

    if (isLastRow && isFormulaWeightedAverage) {
      return <></>
    }
    return (
      <Layout.Horizontal spacing={'large'} flex={{ justifyContent: 'flex-end', alignItems: 'center' }}>
        {sloError?.failedState && (
          <Text
            flex
            tooltip={<DataCollectionFailureTooltip sloError={sloError} />}
            tooltipProps={{
              isDark: true,
              interactionKind: PopoverInteractionKind.HOVER,
              position: Position.LEFT,
              usePortal: false
            }}
          >
            <img src={dataCollectionFailure} />
          </Text>
        )}
        <Icon
          style={{ cursor: 'pointer', float: 'right' }}
          padding={'small'}
          name="main-trash"
          onClick={e => {
            e.stopPropagation()
            openDialog()
          }}
        />
      </Layout.Horizontal>
    )
  }

  const columns: Column<SLOObjective>[] = [
    {
      accessor: 'serviceLevelObjectiveRef',
      Header: getString('name'),
      width: isAccountLevel ? '15%' : '20%',
      Cell: RenderName
    },
    ...(getProjectAndOrgColumn({ getString, isAccountLevel }) as Column<SLOObjective>[]),
    {
      accessor: 'serviceName',
      Header: getString('cv.slos.monitoredService').toUpperCase(),
      width: isAccountLevel ? '15%' : '20%',
      Cell: RenderMonitoredService
    },
    {
      accessor: 'userJourneyName',
      Header: getString('cv.slos.userJourney').toUpperCase(),
      width: isAccountLevel ? '15%' : '20%',
      Cell: RenderUserJourney
    },
    {
      Header: getString('tagsLabel').toUpperCase(),
      Cell: RenderTags
    },
    {
      accessor: 'sloTargetPercentage',
      Header: getString('cv.slos.target').toUpperCase(),
      Cell: ({ row }) => {
        const slo = row.original
        const isLastRow = getIsLastRow(row, serviceLevelObjectivesDetails)
        if (isLastRow && isFormulaWeightedAverage) {
          return (
            <Text className={css.weightageText}>{`${getString('total')} ${getString(
              'cv.CompositeSLO.Weightage'
            ).toLowerCase()}`}</Text>
          )
        }
        return (
          <Text
            lineClamp={1}
            title={` ${Number((Number(slo?.sloTargetPercentage) || 0).toFixed(2))}%`}
            font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}
          >
            {` ${Number((Number(slo?.sloTargetPercentage) || 0).toFixed(2))}%`}
          </Text>
        )
      }
    },
    {
      accessor: 'weightagePercentage',
      disableSortBy: true,
      Header: (
        <>
          <Text>
            {isFormulaWeightedAverage
              ? getString('cv.CompositeSLO.Weightage')
              : getString('cv.CompositeSLO.impactPercentage')}
          </Text>
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
                projectIdentifier,
                isAccountLevel
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

  const filteredColumns = getColumsForProjectAndAccountLevel({ isAccountLevel, allColumns: columns, getString })

  const showSLOTableAndMessage = Boolean(serviceLevelObjectivesDetails.length)
  const totalOfSloWeight = Number(
    serviceLevelObjectivesDetails
      .reduce((total, num) => {
        return num.weightagePercentage + total
      }, 0)
      .toFixed(2)
  )
  const showErrorState = totalOfSloWeight > 100 || totalOfSloWeight < 100
  const tabelClassNames = isFormulaWeightedAverage
    ? {
        [css.rowFailure]: showErrorState,
        [css.rowSuccess]: !showErrorState
      }
    : {}

  const SLOFormulaSelectOptions = useMemo(() => getSLOFormulaSelectOptions(), [])

  return (
    <Page.Body
      loading={dashboardWidgetsLoading}
      error={getErrorMessage(dashboardWidgetsError)}
      retryOnError={() => refetchDashboardWidgets?.()}
      className={css.addSloContainer}
    >
      <Layout.Vertical spacing={'large'} margin={showSLOTableAndMessage ? { bottom: 'large', top: 'large' } : {}}>
        <Button
          width={150}
          loading={dashboardWidgetsLoading}
          data-testid={'addSlosButton'}
          variation={ButtonVariation.SECONDARY}
          text={getString('cv.CompositeSLO.AddSLO')}
          iconProps={{ name: 'plus' }}
          onClick={showDrawer}
        />
        <FormInput.RadioGroup
          label={getString('cv.CompositeSLO.ChooseSLOFormula')}
          name={SLOV2FormFields.FORMULA_TYPE}
          className={radiocss.radioGroup}
          items={SLOFormulaSelectOptions}
          onChange={(e: FormEvent<HTMLInputElement>) => {
            formikProps.setFieldValue(SLOV2FormFields.FORMULA_TYPE, e.currentTarget.value)
          }}
        />
      </Layout.Vertical>

      {showSLOTableAndMessage && (
        <>
          <TableV2
            className={cx(css.addSlo, {
              ...tabelClassNames
            })}
            sortable
            columns={filteredColumns}
            data={isFormulaWeightedAverage ? [...serviceLevelObjectivesDetails, {}] : serviceLevelObjectivesDetails}
            minimal
          />
          <HelpPanel referenceId={'compositeSLOWeightage'} type={HelpPanelType.FLOATING_CONTAINER} />
        </>
      )}
    </Page.Body>
  )
}
