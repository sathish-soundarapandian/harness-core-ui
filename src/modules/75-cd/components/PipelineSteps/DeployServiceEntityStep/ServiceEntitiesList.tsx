import React from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get } from 'lodash-es'
import { useFormikContext } from 'formik'
import {
  Button,
  ButtonVariation,
  Icon,
  TableV2,
  useToggleOpen,
  ConfirmationDialog,
  Intent,
  Dialog,
  AllowedTypes,
  Text,
  Color
} from '@harness/uicore'
import type { CellProps, Column, Renderer, Row, UseExpandedRowProps } from 'react-table'
import { IDialogProps, Spinner } from '@blueprintjs/core'

import { useStrings } from 'framework/strings'
import ServiceEntityEditModal from '@cd/components/Services/ServiceEntityEditModal/ServiceEntityEditModal'
import { getStepTypeByDeploymentType, ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { ServiceSpec, ServiceYaml } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { deploymentIconMap } from '@cd/utils/deploymentUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import type { FormState, ServiceData } from './DeployServiceEntityUtils'
import css from './DeployServiceEntityStep.module.scss'
const DIALOG_PROPS: Omit<IDialogProps, 'isOpen'> = {
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  className: css.editServiceDialog,
  lazy: true,
  style: { width: 1114 }
}

export const ToggleAccordionCell: Renderer<{ row: Row<ServiceData> & UseExpandedRowProps<ServiceData> }> = ({
  row
}) => {
  return (
    <Button
      variation={ButtonVariation.ICON}
      icon={row.isExpanded ? 'chevron-down' : 'chevron-right'}
      data-testid={`edit-service-${row.original.service.identifier}`}
      {...row.getToggleRowExpandedProps()}
    />
  )
}

export interface ServiceInputsProps {
  row: Row<ServiceData>
  readonly?: boolean
  deploymentType?: string
  stageIdentifier?: string
  allowableTypes: AllowedTypes
}

export function ServiceInputs(props: ServiceInputsProps): React.ReactElement {
  const { row, readonly, deploymentType, stageIdentifier, allowableTypes } = props
  const formik = useFormikContext<FormState>()
  const serviceIdentifier = row.original.service.identifier
  const template = row.original.serviceInputs?.serviceDefinition?.spec
  const { getString } = useStrings()

  if (!template) {
    return <Text>{getString('pipeline.execution.noInputsText')}</Text>
  }

  return (
    <StepWidget<ServiceSpec>
      factory={factory}
      initialValues={get(formik.values.serviceInputs, [serviceIdentifier, 'serviceDefinition', 'spec']) || {}}
      allowableTypes={allowableTypes}
      template={defaultTo(template, {})}
      type={getStepTypeByDeploymentType(defaultTo(deploymentType, ''))}
      stepViewType={StepViewType.DeploymentForm}
      path={`serviceInputs.${serviceIdentifier}.serviceDefinition.spec`}
      readonly={readonly}
      customStepProps={{
        stageIdentifier,
        serviceIdentifier
        // allValues: deploymentStage?.service?.serviceInputs?.serviceDefinition?.spec
      }}
    />
  )
}

export interface ServiceEntitiesListProps {
  loading: boolean
  servicesData: ServiceData[]
  selectedDeploymentType?: ServiceDeploymentType
  gitOpsEnabled?: boolean
  onRemoveServiceFormList(id: string): void
  readonly?: boolean
  stageIdentifier?: string
  allowableTypes: AllowedTypes
  onServiceEntityUpdate: (val: ServiceYaml) => void
}

export function ServiceEntitiesList(props: ServiceEntitiesListProps): React.ReactElement {
  const {
    loading,
    servicesData,
    gitOpsEnabled,
    onRemoveServiceFormList,
    selectedDeploymentType,
    readonly,
    stageIdentifier,
    onServiceEntityUpdate,
    allowableTypes
  } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()

  const [serviceToEdit, setServiceToEdit] = React.useState<ServiceData | null>(null)
  const [serviceToDelete, setServiceToDelete] = React.useState<ServiceData | null>(null)
  const {
    isOpen: isDeleteConfirmationOpen,
    open: openDeleteConfirmation,
    close: closeDeleteConfirmation
  } = useToggleOpen()
  const { MULTI_SERVICE_INFRA } = useFeatureFlags()

  React.useEffect(() => {
    if (serviceToDelete) {
      openDeleteConfirmation()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceToDelete])

  function handleDeleteConfirmation(confirmed: boolean): void {
    if (serviceToDelete && confirmed) {
      onRemoveServiceFormList(serviceToDelete.service.identifier)
    }
    closeDeleteConfirmation()
    onCloseEditModal()
  }

  function onCloseEditModal(): void {
    setServiceToEdit(null)
  }

  function handleServiceEntityUpdate(val: ServiceYaml): void {
    onCloseEditModal()
    onServiceEntityUpdate(val)
  }

  const columns = React.useMemo(() => {
    const cols: Column<ServiceData>[] = [
      {
        Header: '',
        id: 'expander',
        width: '32px',
        Cell: ToggleAccordionCell
      },
      {
        Header: '',
        id: 'svc',
        width: 'calc(100% - 96px)',
        Cell({ row }: CellProps<ServiceData>) {
          const type = row.original.service.serviceDefinition?.type as ServiceDeploymentType
          return (
            <div className={css.serviceNameIconWrapper}>
              <span className={css.serviceIcon}>{type ? <Icon name={deploymentIconMap[type]} size={24} /> : null}</span>
              <span className={css.serviceNameWrapper}>
                <Text color={Color.PRIMARY_7} font="normal">
                  {row.original.service.name}
                </Text>
                <Text color={Color.GREY_500} font="small">
                  {getString('idLabel', { id: row.original.service.identifier })}
                </Text>
              </span>
            </div>
          )
        }
      },
      {
        Header: '',
        id: 'actions',
        width: '64px',
        Cell({ row }: CellProps<ServiceData>) {
          return (
            <div>
              <Button
                variation={ButtonVariation.ICON}
                icon="edit"
                data-testid={`edit-service-${row.original.service.identifier}`}
                disabled={readonly}
                onClick={() => setServiceToEdit(row.original)}
              />
              <Button
                variation={ButtonVariation.ICON}
                icon="trash"
                data-testid={`delete-service-${row.original.service.identifier}`}
                disabled={readonly}
                onClick={() => setServiceToDelete(row.original)}
              />
            </div>
          )
        }
      }
    ]

    if (!MULTI_SERVICE_INFRA) {
      cols.shift()
    }

    return cols
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MULTI_SERVICE_INFRA, readonly])

  const renderRowSubComponent = React.useCallback(
    ({ row }: { row: Row<ServiceData> }) => {
      return (
        <ServiceInputs
          row={row}
          readonly={readonly}
          deploymentType={selectedDeploymentType}
          stageIdentifier={stageIdentifier}
          allowableTypes={allowableTypes}
        />
      )
    },
    [readonly, selectedDeploymentType, stageIdentifier, allowableTypes]
  )

  if (loading) {
    return <Spinner />
  }

  return (
    <>
      <TableV2
        className={css.table}
        data={servicesData}
        columns={columns}
        renderRowSubComponent={MULTI_SERVICE_INFRA ? renderRowSubComponent : undefined}
      />
      <Dialog isOpen={!!serviceToEdit} onClose={onCloseEditModal} title={getString('editService')} {...DIALOG_PROPS}>
        <ServiceEntityEditModal
          selectedDeploymentType={defaultTo(
            serviceToEdit?.service.serviceDefinition?.type as ServiceDeploymentType,
            selectedDeploymentType
          )}
          serviceResponse={
            serviceToEdit ? { ...serviceToEdit.service, accountId, projectIdentifier, orgIdentifier } : undefined
          }
          onCloseModal={onCloseEditModal}
          onServiceCreate={handleServiceEntityUpdate}
          isServiceCreateModalView={false}
          gitOpsEnabled={gitOpsEnabled}
        />
      </Dialog>
      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        titleText={getString('cd.pipelineSteps.serviceTab.deleteServiceFromListTitleText')}
        contentText={getString('cd.pipelineSteps.serviceTab.deleteServiceFromListText', {
          name: serviceToDelete?.service.name
        })}
        confirmButtonText={getString('applyChanges')}
        cancelButtonText={getString('cancel')}
        onClose={handleDeleteConfirmation}
        intent={Intent.WARNING}
      />
    </>
  )
}
