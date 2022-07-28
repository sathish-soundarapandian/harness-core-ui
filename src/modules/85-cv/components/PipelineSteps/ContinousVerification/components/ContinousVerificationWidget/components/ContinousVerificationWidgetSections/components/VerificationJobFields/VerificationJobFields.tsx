/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { CSSProperties, useMemo } from 'react'
import { AllowedTypes, FormInput, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import type { UseStringsReturn } from 'framework/strings'
import { useStrings } from 'framework/strings'
import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import { getMultiTypeInputProps } from './VerificationJobFields.utils'

interface BaseFieldProps {
  zIndex?: Pick<CSSProperties, 'zIndex'>
  label?: string
  name?: string
  disabled?: boolean
  formik?: FormikProps<ContinousVerificationData>
  expressions?: string[]
  isSimpleDropdown?: boolean
  allowableTypes: AllowedTypes
}

export function getDefaultBaselineOptions(getString: UseStringsReturn['getString']): SelectOption[] {
  return [
    { label: getString('cv.lastSuccessfulRun'), value: 'LAST' }
    // { label: i18n.baselineDefaultLabel.pinBaseline, value: 'PIN' }
  ]
}

export function getVerificationSensitivityOptions(getString: UseStringsReturn['getString']): SelectOption[] {
  return [
    { label: getString('connectors.cdng.verificationSensitivityLabel.high'), value: 'HIGH' },
    { label: getString('connectors.cdng.verificationSensitivityLabel.medium'), value: 'MEDIUM' },
    { label: getString('connectors.cdng.verificationSensitivityLabel.low'), value: 'LOW' }
  ]
}

export function VerificationSensitivity(props: BaseFieldProps): JSX.Element {
  const { zIndex, label, name, expressions, formik, isSimpleDropdown, allowableTypes } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 10 }), [zIndex]) as CSSProperties
  const { getString } = useStrings()
  if (!isSimpleDropdown) {
    return (
      <FormInput.MultiTypeInput
        name={name ? name : 'sensitivity'}
        style={style}
        label={label ? label : getString('sensitivity')}
        selectItems={getVerificationSensitivityOptions(getString)}
        multiTypeInputProps={getMultiTypeInputProps(expressions, allowableTypes)}
      />
    )
  } else {
    return (
      <FormInput.Select
        name={name ? name : 'sensitivity'}
        label={label ? label : getString('sensitivity')}
        style={style}
        items={getVerificationSensitivityOptions(getString)}
        value={(formik?.values as ContinousVerificationData).spec?.spec?.sensitivity as SelectOption}
        disabled={true}
      />
    )
  }
}

export function Duration(props: BaseFieldProps): JSX.Element {
  const selectProps = useMemo(
    () => ({
      items: [
        { label: '5 min', value: '5m' },
        { label: '10 min', value: '10m' },
        { label: '15 min', value: '15m' },
        { label: '30 min', value: '30m' }
      ]
    }),
    []
  )
  const { zIndex, label, name, expressions, formik, isSimpleDropdown, allowableTypes } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 8 }), [zIndex]) as CSSProperties
  const { getString } = useStrings()
  if (!isSimpleDropdown) {
    return (
      <FormInput.MultiTypeInput
        name={name ? name : 'duration'}
        style={style}
        label={label ? label : getString('duration')}
        selectItems={selectProps.items}
        multiTypeInputProps={getMultiTypeInputProps(expressions, allowableTypes)}
      />
    )
  } else {
    return (
      <FormInput.Select
        name={name ? name : 'duration'}
        style={style}
        label={label ? label : getString('duration')}
        items={selectProps.items}
        value={(formik?.values as ContinousVerificationData).spec?.spec?.duration as SelectOption}
        disabled={true}
      />
    )
  }
}

export function TrafficSplit(props: BaseFieldProps): JSX.Element {
  const selectProps = useMemo(
    () => ({
      items: [
        { label: '5%', value: 5 },
        { label: '10%', value: 10 },
        { label: '15%', value: 15 }
      ]
    }),
    []
  )
  const { zIndex, label, name, expressions, formik, isSimpleDropdown } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 6 }), [zIndex]) as CSSProperties
  const { getString } = useStrings()
  if (!isSimpleDropdown) {
    return (
      <FormInput.MultiTypeInput
        name={name ? name : 'trafficSplit'}
        style={style}
        label={label ? label : getString('cv.trafficSplit')}
        selectItems={selectProps.items}
        multiTypeInputProps={
          expressions
            ? { expressions }
            : {
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
              }
        }
      />
    )
  } else {
    return (
      <FormInput.Select
        name={name ? name : 'trafficSplit'}
        label={label ? label : getString('cv.trafficSplit')}
        style={style}
        items={selectProps.items}
        value={(formik?.values as ContinousVerificationData).spec?.spec?.trafficsplit as SelectOption}
        disabled={true}
      />
    )
  }
}

export function Baseline(props: BaseFieldProps): JSX.Element {
  const { getString } = useStrings()
  const selectProps = useMemo(
    () => ({
      items: [
        { label: getString('cv.lastSuccessfulRun'), value: 'LAST' },
        { label: getString('cv.pinABaseline'), value: 'PIN' }
      ]
    }),
    []
  )
  const { zIndex } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 5 }), [zIndex]) as CSSProperties
  return (
    <FormInput.MultiTypeInput
      name="baseline"
      style={style}
      label={getString('connectors.cdng.baseline')}
      selectItems={selectProps.items}
      multiTypeInputProps={{
        allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]
      }}
    />
  )
}

export function BaselineSelect(props: BaseFieldProps): JSX.Element {
  const { getString } = useStrings()

  const { zIndex, label, name, expressions, formik, isSimpleDropdown, allowableTypes } = props
  const style: CSSProperties = useMemo(() => ({ zIndex: zIndex ?? 5 }), [zIndex]) as CSSProperties
  if (!isSimpleDropdown) {
    return (
      <FormInput.MultiTypeInput
        name={name ? name : 'baseline'}
        style={style}
        label={label ? label : getString('connectors.cdng.baseline')}
        selectItems={getDefaultBaselineOptions(getString)}
        multiTypeInputProps={getMultiTypeInputProps(expressions, allowableTypes)}
      />
    )
  } else {
    return (
      <FormInput.Select
        name={name ? name : 'baseline'}
        style={style}
        label={label ? label : getString('connectors.cdng.baseline')}
        items={getDefaultBaselineOptions(getString)}
        value={(formik?.values as ContinousVerificationData).spec?.spec?.baseline as SelectOption}
        disabled={true}
      />
    )
  }
}
