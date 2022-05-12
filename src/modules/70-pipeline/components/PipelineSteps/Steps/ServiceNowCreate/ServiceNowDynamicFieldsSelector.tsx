/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { FieldArray, FormikProps } from 'formik'
import {
  Button,
  Formik,
  FormInput,
  HarnessDocTooltip,
  MultiTypeInputType,
  Radio,
  Select,
  Text
} from '@wings-software/uicore'
import { String, useStrings } from 'framework/strings'
import type { ServiceNowFieldNG } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { removeServiceNowMandatoryFields } from '@pipeline/components/PipelineSteps/Steps/ServiceNowCreate/helper'
import { ServiceNowFieldSelector } from './ServiceNowFieldSelector'
import {
  ServiceNowCreateFieldType,
  ServiceNowCreateFormFieldSelector,
  ServiceNowDynamicFieldsSelectorInterface
} from './types'

import css from './ServiceNowDynamicFieldsSelector.module.scss'
function SelectFieldList(props: ServiceNowDynamicFieldsSelectorInterface) {
  const { getString } = useStrings()
  const { selectedTicketTypeKey, ticketTypeBasedFieldList } = props

  const [fieldList, setFieldList] = useState<ServiceNowFieldNG[]>([])

  useEffect(() => {
    if (selectedTicketTypeKey) {
      const fieldListToSet: ServiceNowFieldNG[] = []
      setFieldList(fieldListToSet)
    }
  }, [selectedTicketTypeKey])

  useEffect(() => {
    if (selectedTicketTypeKey && ticketTypeBasedFieldList) {
      let ticketFieldList: ServiceNowFieldNG[] = []
      const sortedFields = ticketTypeBasedFieldList.sort(function (field1, field2) {
        const name1 = field1.name.toUpperCase()
        const name2 = field2.name.toUpperCase()
        if (name1 < name2) {
          return -1
        }
        if (name1 > name2) {
          return 1
        }
        return 0
      })
      ticketFieldList = removeServiceNowMandatoryFields(sortedFields)
      setFieldList(ticketFieldList)
    }
  }, [ticketTypeBasedFieldList, selectedTicketTypeKey])

  return (
    <div>
      <Text className={css.selectFieldListHelp}>{getString('pipeline.serviceNowCreateStep.selectFieldListHelp')}</Text>

      <div className={css.select}>
        <Text className={css.selectLabel}>{getString('pipeline.serviceNowApprovalStep.ticketType')}</Text>
        <Select
          items={[]}
          inputProps={{
            placeholder: getString('pipeline.serviceNowApprovalStep.issueTypePlaceholder')
          }}
          defaultSelectedItem={{
            label: selectedTicketTypeKey.toString(),
            value: selectedTicketTypeKey.toString()
          }}
          disabled={true}
        />
      </div>

      {!selectedTicketTypeKey ? (
        <div className={css.fieldsSelectorPlaceholder}>
          <Text>{getString('pipeline.jiraCreateStep.fieldsSelectorPlaceholder')}</Text>
        </div>
      ) : (
        <div>
          <ServiceNowFieldSelector
            fields={fieldList || []}
            selectedFields={props?.selectedFields || []}
            onCancel={props.onCancel}
            addSelectedFields={fields => props.addSelectedFields(fields, selectedTicketTypeKey.toString())}
          />
        </div>
      )}
    </div>
  )
}

function ProvideFieldList(props: ServiceNowDynamicFieldsSelectorInterface) {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <Formik<ServiceNowCreateFieldType[]>
      onSubmit={values => {
        props.provideFieldList(values)
      }}
      formName="ServiceNowFields"
      initialValues={[]}
    >
      {(formik: FormikProps<{ fieldList: ServiceNowCreateFieldType[] }>) => {
        return (
          <div>
            <FieldArray
              name="fieldList"
              render={({ push, remove }) => {
                return (
                  <div>
                    {formik.values.fieldList?.length ? (
                      <div className={css.headerRow}>
                        <String className={css.label} stringID="keyLabel" />
                        <String className={css.label} stringID="valueLabel" />
                      </div>
                    ) : null}

                    {formik.values.fieldList?.map((_unused: ServiceNowCreateFieldType, i: number) => (
                      <div className={css.headerRow} key={i}>
                        <FormInput.Text
                          name={`fieldList[${i}].name`}
                          placeholder={getString('pipeline.keyPlaceholder')}
                        />
                        <FormInput.MultiTextInput
                          name={`fieldList[${i}].value`}
                          label=""
                          placeholder={getString('common.valuePlaceholder')}
                          multiTextInputProps={{
                            allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                            expressions
                          }}
                        />
                        <Button
                          minimal
                          icon="main-trash"
                          data-testid={`remove-fieldList-${i}`}
                          onClick={() => remove(i)}
                        />
                      </div>
                    ))}
                    <Button
                      icon="plus"
                      minimal
                      intent="primary"
                      data-testid="add-fieldList"
                      onClick={() => push({ name: '', value: '' })}
                      className={css.addFieldsButton}
                    >
                      {getString('pipeline.serviceNowCreateStep.addFields')}
                    </Button>
                  </div>
                )
              }}
            />
            <div className={css.buttons}>
              <Button intent="primary" type="submit" onClick={() => props.provideFieldList(formik.values.fieldList)}>
                {getString('add')}
              </Button>
              <Button className={css.secondButton} onClick={props.onCancel}>
                {getString('cancel')}
              </Button>
            </div>
          </div>
        )
      }}
    </Formik>
  )
}

function Content(props: ServiceNowDynamicFieldsSelectorInterface) {
  const { getString } = useStrings()
  const { connectorRef } = props
  const [type, setType] = useState<ServiceNowCreateFormFieldSelector>(
    connectorRef ? ServiceNowCreateFormFieldSelector.FIXED : ServiceNowCreateFormFieldSelector.EXPRESSION
  )
  return (
    <div className={css.contentWrapper}>
      <div className={css.radioGroup}>
        <Radio
          onClick={() => setType(ServiceNowCreateFormFieldSelector.FIXED)}
          checked={type === ServiceNowCreateFormFieldSelector.FIXED}
          disabled={!connectorRef}
        >
          <span data-tooltip-id="ServiceNowSelectFromFieldList">
            {getString('pipeline.jiraCreateStep.selectFromFieldList')}{' '}
            <HarnessDocTooltip useStandAlone={true} tooltipId="ServiceNowSelectFromFieldList" />
          </span>
        </Radio>
        <Radio
          onClick={() => setType(ServiceNowCreateFormFieldSelector.EXPRESSION)}
          checked={type === ServiceNowCreateFormFieldSelector.EXPRESSION}
        >
          <span data-tooltip-id="ServiceNowProvideFromFieldList">
            {getString('pipeline.jiraCreateStep.provideFieldList')}{' '}
            <HarnessDocTooltip useStandAlone={true} tooltipId="ServiceNowProvideFromFieldList" />
          </span>
        </Radio>
      </div>
      {type === ServiceNowCreateFormFieldSelector.FIXED ? (
        <SelectFieldList {...props} />
      ) : (
        <ProvideFieldList {...props} />
      )}
    </div>
  )
}

export function ServiceNowDynamicFieldsSelector(props: ServiceNowDynamicFieldsSelectorInterface) {
  return <Content {...props} />
}
