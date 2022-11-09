/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef } from 'react'
import { Formik, AllowedTypes, SelectOption } from '@harness/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { setFormikRef, StepFormikFowardRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useQueryParams } from '@common/hooks'
import RadioGroup from '@iac/components/FormInputs/RadioGroup'
import MultiTextInput from '@iac/components/FormInputs/MultiTextInput'
import RemoteFileRepo from '@iac/components/FormInputs/RemoteFileRepo'
import { NameTimeout } from '@iac/components'
import MultiTypeConnector from '@iac/components/FormInputs/MultiTypeConnector'


interface TerraformPlanProps {
    initialValues: any
    onUpdate?: (data: any) => void
    onChange?: (data: any) => void
    allowableTypes: AllowedTypes
    stepViewType?: StepViewType
    configTypes?: SelectOption[]
    isNewStep?: boolean
    inputSetData?: {
        template?: any
        path?: string
    }
    readonly?: boolean
    path?: string
    stepType?: string
    allValues?: any
    isParam?: boolean
    azureRef?: any
}

const TerraformPlan = (
    { initialValues, onChange, onUpdate, allowableTypes, isNewStep = false, readonly = false }: TerraformPlanProps,
    ref: StepFormikFowardRef
): JSX.Element => {
    const { getString } = useStrings()
    const query = useQueryParams()
    const sectionId = (query as any).sectionId || ''
    const { expressions } = useVariablesExpression()
    const commandTypeOptions = [
        { label: getString('filters.apply'), value: 'Apply' },
        { label: getString('pipelineSteps.destroy'), value: 'Destroy' }
    ]
    return (
        <Formik
            validationSchema={Yup.object().shape({
                name: Yup.string().required('required')
            })}
            enableReinitialize={true}
            initialValues={initialValues}
            formName={`iacm-terraformPlan-${sectionId}`}
            validate={onChange}
            onSubmit={data => onUpdate?.(data)}
        >
            {formik => {
                const { setFieldValue, values } = formik
                setFormikRef(ref, formik)
                return (
                    <>
                        <NameTimeout
                            readonly={readonly}
                            expressions={expressions}
                            allowableTypes={allowableTypes}
                            isNewStep={isNewStep}
                            timeout={values?.timeout}
                        />
                        <RadioGroup
                            readonly={readonly}
                            isNewStep={isNewStep}
                            name={'spec.configuration.command'}
                            label={getString('commandLabel')}
                            items={commandTypeOptions}
                        />
                        <MultiTextInput
                            readonly={readonly}
                            name={'spec.provisionerIdentifier'}
                            expressions={expressions}
                            allowableTypes={allowableTypes}
                            placeholder={'Provisioner Identifier'}
                            label={'Provisioner Identifier'}
                            setFieldValue={setFieldValue}
                        />
                        <MultiTypeConnector
                            name="spec.configuration.secretManagerRef"
                            readonly={readonly}
                            label={getString('connectors.title.secretManager')}
                            category={'SECRET_MANAGER'}
                            expressions={expressions}
                            allowableTypes={allowableTypes}
                        />
                        <RemoteFileRepo
                            initialValues={initialValues?.spec?.configuration?.configFiles?.store}
                            onSubmit={data => setFieldValue('spec.configuration.template.store', data)}
                            stepOneName={'Step One'}
                            stepTwoName={'Step Two'}
                            expressions={expressions}
                            allowableTypes={allowableTypes}
                            readonly={readonly}
                        />
                    </>
                )
            }}
        </Formik>
    )
}

export default forwardRef(TerraformPlan)
