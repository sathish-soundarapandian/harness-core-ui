import React from 'react'
import { Formik } from 'formik'
import { noop } from 'lodash-es'
import { Container } from '@harness/uicore'
import CloudWatchContent from './components/CloudWatchContent'
import { cloudWatchInitialValues } from './CloudWatchConstants'
import type { CloudWatchFormType } from './CloudWatch.types'
import css from './CloudWatch.module.scss'

export default function CloudWatch(props): JSX.Element {
  return (
    <Container padding="medium" className={css.cloudWatch}>
      <Formik<CloudWatchFormType> initialValues={cloudWatchInitialValues} onSubmit={noop}>
        {formikProps => {
          return (
            <>
              <CloudWatchContent />

              {/* 🧑🏽‍💻 Debug 👩🏼‍💻 */}
              <pre>{JSON.stringify(formikProps.values, null, 4)}</pre>
            </>
          )
        }}
      </Formik>
    </Container>
  )
}
