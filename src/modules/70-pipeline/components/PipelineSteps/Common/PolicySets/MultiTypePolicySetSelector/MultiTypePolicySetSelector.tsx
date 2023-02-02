/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormikContextType, useFormikContext } from 'formik'
import { get } from 'lodash-es'

import { AllowedTypes, Button, MultiTypeInputType } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import type { IFormGroupProps } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'

import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ExpressionsListInput } from '@common/components/ExpressionsListInput/ExpressionsListInput'

import { PolicySetModal } from '../PolicySetModal/PolicySetModal'
import { MiniPolicySetRenderer } from '../PolicySetListRenderer/MiniPolicySetRenderer'

import css from './MultiTypePolicySetSelector.module.scss'

export interface MultiTypePolicySetSelectorProps extends Omit<IFormGroupProps, 'label'> {
  name: string
  label: string
  expressions?: string[]
  allowableTypes?: AllowedTypes
}

interface PolicySetFixedTypeSelectorProps<T> extends IFormGroupProps {
  name: string
  policySetIds: string[]
  formik?: FormikContextType<T>
}

export default function MultiTypePolicySetSelector<T>(props: MultiTypePolicySetSelectorProps): React.ReactElement {
  const {
    name,
    label,
    expressions = [],
    allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION],
    disabled
  } = props
  const formik = useFormikContext<T>()

  const policySetIds = get(formik?.values, name) || []

  const onTypeChange = (): void => {
    formik?.setFieldTouched(name, true)
  }

  return (
    <MultiTypeFieldSelector
      name={name}
      label={label}
      defaultValueToReset={[]}
      allowedTypes={allowableTypes}
      supportListOfExpressions={true}
      disableMultiSelectBtn={disabled}
      expressionRender={() => (
        <ExpressionsListInput name={name} value={policySetIds} readOnly={disabled} expressions={expressions} />
      )}
      onTypeChange={onTypeChange}
    >
      <PolicySetFixedTypeSelector<T> name={name} disabled={disabled} formik={formik} policySetIds={policySetIds} />
    </MultiTypeFieldSelector>
  )
}

function PolicySetFixedTypeSelector<T>({
  formik,
  name,
  policySetIds,
  disabled
}: PolicySetFixedTypeSelectorProps<T>): React.ReactElement {
  const { getString } = useStrings()

  const [showModal, closeModal] = useModalHook(
    () => (
      <PolicySetModal<T>
        name={name}
        formikProps={formik}
        policySetIds={policySetIds}
        closeModal={(action?: string) => {
          /* istanbul ignore else */
          if (action !== getString('common.apply')) {
            /* istanbul ignore next */ formik?.setFieldTouched(name, true)
          }
          closeModal()
        }}
      />
    ),
    [name, formik, policySetIds]
  )

  const deletePolicySet = (policySetId: string): void => {
    const newPolicySetIds = policySetIds.filter(id => id !== policySetId)
    formik?.setFieldTouched(name, true)
    formik?.setFieldValue(name, newPolicySetIds)
  }

  return (
    <>
      {Array.isArray(policySetIds) &&
        policySetIds.map(policySetId => {
          return <MiniPolicySetRenderer policySetId={policySetId} key={policySetId} deletePolicySet={deletePolicySet} />
        })}
      <Button
        minimal
        text={getString('common.policiesSets.addOrModifyPolicySet')}
        className={css.addModifyButton}
        withoutCurrentColor={true}
        iconProps={{ size: 14 }}
        disabled={disabled}
        onClick={showModal}
      />
    </>
  )
}
