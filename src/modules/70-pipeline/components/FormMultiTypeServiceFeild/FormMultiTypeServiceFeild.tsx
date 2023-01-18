/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useState } from 'react'
import { Classes, FormGroup, IFormGroupProps, Intent } from '@blueprintjs/core'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { Color } from '@harness/design-system'
import {
  ButtonVariation,
  Container,
  DataTooltipInterface,
  errorCheck,
  FormError,
  FormikTooltipContext,
  HarnessDocTooltip,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Tag,
  Text
} from '@harness/uicore'
import { defaultTo, get, isArray } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { ResponsePageServiceResponse, ServiceResponseDTO } from 'services/cd-ng'
import RbacButton from '@rbac/components/Button/Button'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import {
  Item,
  MultiTypeReferenceInput,
  MultiTypeReferenceInputProps,
  ReferenceSelectProps
} from '@common/components/ReferenceSelect/ReferenceSelect'
import type { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { useStrings } from 'framework/strings'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { getIdentifierFromScopedRef } from '@common/utils/utils'
import { getReferenceFieldProps } from './Utils'
import css from './FormMultiTypeServiceField.module.scss'

export interface ServiceReferenceFieldProps extends Omit<IFormGroupProps, 'label'> {
  name: string
  label: string | React.ReactElement
  placeholder: string
  tooltipProps?: DataTooltipInterface
  deploymentType?: ServiceDeploymentType
  gitOpsEnabled?: boolean
  style?: React.CSSProperties
  openAddNewModal?: () => void
  disabled?: boolean
  createNewLabel?: string
  isDrawerMode?: boolean
  multitypeInputValue?: MultiTypeInputType
  multiTypeProps?: Omit<MultiTypeReferenceInputProps<ServiceResponseDTO>, 'name' | 'referenceSelectProps'>
  setRefValue?: boolean
  onChange?: (service: any) => void
  selected?: string
  defaultScope?: Scope
  width?: number
  error?: string
  isMultiSelect?: boolean
  onMultiSelectChange?: any
  isNewConnectorLabelVisible?: boolean
  isOnlyFixedType?: boolean
  labelClass?: string
}

export function getSelectedRenderer(selected: any): JSX.Element {
  return (
    <Layout.Horizontal spacing="small" flex={{ distribution: 'space-between' }} className={css.selectWrapper}>
      <Text tooltip={defaultTo(selected?.name, selected)} color={Color.GREY_800} className={css.label}>
        {getIdentifierFromScopedRef(defaultTo(defaultTo(selected?.label, selected), ''))}
      </Text>
      <Tag minimal id={css.tag}>
        {getScopeFromValue(selected?.value || selected)}
      </Tag>
    </Layout.Horizontal>
  )
}

function generateInitialValues(selected: SelectOption[] | string): (string | Item)[] | string {
  if (isArray(selected)) {
    return selected.map((svc: SelectOption) => ({
      label: svc.value as string,
      value: svc.value as string,
      scope: getScopeFromValue(svc.value as string)
    }))
  }
  return selected
}

export function MultiTypeServiceField(props: ServiceReferenceFieldProps): React.ReactElement {
  const {
    name,
    style,
    createNewLabel,
    deploymentType,
    gitOpsEnabled,
    multitypeInputValue,
    multiTypeProps = {},
    setRefValue = false,
    onChange,
    defaultScope,
    isMultiSelect,
    onMultiSelectChange,
    openAddNewModal,
    isNewConnectorLabelVisible,
    isOnlyFixedType = false,
    placeholder,
    disabled,
    labelClass: labelClassFromProps = '',
    width,
    ...restProps
  } = props
  const formik = useFormikContext()
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const [page, setPage] = useState(0)
  const [pagedServiceData, setPagedServiceData] = useState<ResponsePageServiceResponse>({})
  const [hideModal, setHideModal] = useState(false)
  const selected = generateInitialValues(get(formik?.values, name, isMultiSelect ? [] : ''))
  const [selectedValue, setSelectedValue] = React.useState<any>(selected)
  const hasError = errorCheck(name, formik)
  const {
    intent = hasError ? Intent.DANGER : Intent.NONE,
    helperText = hasError ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null,
    label,
    ...rest
  } = restProps
  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    props.tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')
  const getReferenceFieldPropsValues = getReferenceFieldProps({
    defaultScope,
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    name,
    width,
    selected,
    placeholder,
    isMultiSelect,
    deploymentType,
    gitOpsEnabled,
    setPagedServiceData,
    selectedServices: Array.isArray(selected) ? selected : [],
    getString
  })
  const handleMultiSelectChange = (svcs: any): void => {
    const services = svcs.map((svc: any) => ({
      label: svc.identifier,
      value: svc.scope !== Scope.PROJECT ? `${svc.scope}.${svc.identifier}` : svc.identifier
    }))
    formik.setFieldValue(name, services)
    onMultiSelectChange(services)
  }
  return (
    <div style={style} className={cx(css.serviceLabel, labelClassFromProps)}>
      <Container data-testid="serviceTooltip">
        <HarnessDocTooltip tooltipId={dataTooltipId} labelText={label} className={Classes.LABEL} />
      </Container>
      <FormGroup {...rest} labelFor={name} helperText={helperText} intent={intent}>
        <MultiTypeReferenceInput<ServiceResponseDTO>
          name={name}
          disabled={disabled}
          referenceSelectProps={
            {
              ...getReferenceFieldPropsValues,
              isNewConnectorLabelVisible: isNewConnectorLabelVisible,
              placeholderClass: css.placeholderClass,
              createNewLabel: createNewLabel || 'Service',
              disabled: disabled,
              disableCollapse: true,
              isOnlyFixedtype: isOnlyFixedType,
              selectedRenderer: getSelectedRenderer(selected),
              hideModal: hideModal,
              onMultiSelectChange: handleMultiSelectChange,
              isMultiSelect: isMultiSelect,
              pagination: {
                itemCount: pagedServiceData?.data?.totalItems || 0,
                pageSize: pagedServiceData?.data?.pageSize || 10,
                pageCount: pagedServiceData?.data?.totalPages || -1,
                pageIndex: page || 0,
                gotoPage: pageIndex => setPage(pageIndex)
              },
              createNewBtnComponent: isNewConnectorLabelVisible ? (
                <RbacButton
                  variation={ButtonVariation.SECONDARY}
                  onClick={() => {
                    openAddNewModal?.()
                    setHideModal(true)
                  }}
                  text={`+ ${createNewLabel || 'Service'}`}
                  margin={{ right: 'small' }}
                  permission={{
                    permission: PermissionIdentifier.EDIT_SERVICE,
                    resource: {
                      resourceType: ResourceType.SERVICE
                    }
                  }}
                ></RbacButton>
              ) : null
            } as ReferenceSelectProps<ServiceResponseDTO>
          }
          onChange={(val, _valueType, type1) => {
            if (val && type1 === MultiTypeInputType.FIXED) {
              const { record, scope } = val as unknown as { record: ServiceResponseDTO; scope: Scope }
              const value = {
                label: record.name,
                value:
                  scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record.identifier}` : record.identifier,
                scope
              }
              if (setRefValue) {
                formik?.setFieldValue(name, value.value)
                onChange?.(value.value)
              } else {
                formik?.setFieldValue(name, value)
                onChange?.(value)
              }
              setSelectedValue(value)
            } else {
              formik?.setFieldValue(name, defaultTo(val, ''))
              setSelectedValue(defaultTo(val, ''))
              onChange?.(val)
            }
          }}
          value={Array.isArray(selectedValue) ? '' : selectedValue}
          multitypeInputValue={multitypeInputValue}
          {...multiTypeProps}
        />
      </FormGroup>
    </div>
  )
}
