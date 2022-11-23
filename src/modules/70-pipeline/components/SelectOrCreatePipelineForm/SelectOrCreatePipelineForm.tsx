/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { Text, Layout, Formik, FormikForm as Form, Button, FormInput } from '@harness/uicore'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import PipelineSelect from '@pipeline/components/PipelineSelect/PipelineSelect'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, PipelineActions } from '@common/constants/TrackingConstants'
import css from './SelectOrCreatePipelineForm.module.scss'

interface SelectOrCreatePipelineFormProps {
  handleSubmit: (value: string) => void
  closeModal?: () => void
  openCreatPipeLineModal: () => void
}

export function SelectOrCreatePipelineForm(props: SelectOrCreatePipelineFormProps): React.ReactElement {
  const { getString } = useStrings()
  const [select, setSelect] = useState('')
  const { openCreatPipeLineModal, handleSubmit, closeModal } = props
  const { trackEvent } = useTelemetry()

  useEffect(() => {
    trackEvent(PipelineActions.LoadSelectOrCreatePipeline, {
      category: Category.PIPELINE
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Formik
      initialValues={{
        selectedPipeline: select,
        pipelineRequired: select
      }}
      validationSchema={Yup.object().shape({
        pipelineRequired: Yup.string()
          .trim()
          .required(getString('pipeline.selectOrCreatePipeline.pipelineNameRequired'))
      })}
      enableReinitialize={true}
      onSubmit={() => {
        handleSubmit(select)
        trackEvent(PipelineActions.SelectAPipeline, {
          category: Category.PIPELINE
        })
        closeModal?.()
      }}
      formName="selectCreatePipeline"
    >
      <Form>
        <Text color={Color.BLACK} padding={{ bottom: 8 }} font={{ weight: 'bold', size: 'large' }}>
          {getString('pipeline.selectOrCreatePipeline.setupHeader')}
        </Text>
        <Text font={{ size: 'normal' }} color={Color.BLACK} padding={{ bottom: 40 }}>
          {getString('common.letsGetYouStarted')}
        </Text>
        <Layout.Vertical padding={{ top: 'large', bottom: 'small' }} spacing="small">
          <Text font={{ size: 'normal' }} color={Color.BLACK}>
            {getString('pipeline.selectOrCreatePipeline.selectAPipeline')}
          </Text>
          <PipelineSelect
            onPipelineSelect={value => setSelect(value)}
            selectedPipeline={select}
            defaultSelect={' '}
            className={css.select}
          />
          {/* this FormInput is for Continue button validation use only */}
          <FormInput.Text name="pipelineRequired" className={css.pipelineRequired} />
        </Layout.Vertical>
        <Layout.Horizontal padding={{ top: 'large' }} spacing="medium">
          <Button intent="primary" text={getString('continue')} type="submit" />
          <Button
            text={getString('pipeline.createANewPipeline')}
            alignText={'center'}
            padding={'small'}
            width={200}
            height={33}
            inline
            border={{ width: 1 }}
            onClick={() => {
              openCreatPipeLineModal()
              trackEvent(PipelineActions.CreateAPipeline, {
                category: Category.PIPELINE
              })
            }}
          />
        </Layout.Horizontal>
      </Form>
    </Formik>
  )
}
