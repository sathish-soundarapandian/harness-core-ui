/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Container,
  Dialog,
  Text,
  Layout,
  Button,
  ButtonVariation,
  Formik,
  FormInput,
  FormikForm,
  getErrorInfoFromErrorObject
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Context } from 'urql'
import * as Yup from 'yup'
import { useModalHook } from '@harness/use-modal'
import { pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import {
  FetchperspectiveGridDocument,
  QlceViewEntityStatsDataPoint,
  useFetchPerspectiveTotalCountQuery
} from 'services/ce/services'
import { useToaster } from '@common/exports'
import { downloadPerspectiveGridAsCsv } from '@ce/utils/downloadPerspectiveGridAsCsv'
import type { Column } from './Columns'

import css from './PerspectiveGrid.module.scss'

const MAX_ROWS_ALLOWED = 10000

interface Props {
  variables: Record<string, any>
  selectedColumnsToDownload: Column[]
  perspectiveName: string
}

export const useDownloadPerspectiveGridAsCsv = (options: Props) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { query } = React.useContext(Context)

  const { variables, selectedColumnsToDownload, perspectiveName } = options

  const [totalCountResult] = useFetchPerspectiveTotalCountQuery({
    variables: pick(variables, ['filters', 'isClusterOnly', 'groupBy']) as any,
    pause: !isModalOpen
  })

  const perspectiveTotalCount = totalCountResult.data?.perspectiveTotalCount || 0

  const [openDownloadCSVModal, closeDownloadCSVModal] = useModalHook(() => {
    const maxNoOfRows = Math.min(perspectiveTotalCount, MAX_ROWS_ALLOWED)

    const onModalClose: () => void = () => {
      setIsModalOpen(false)
      closeDownloadCSVModal()
    }

    const onModalOpen: () => void = () => {
      setIsModalOpen(true)
    }

    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={onModalClose}
        className={css.dialog}
        title={getString('ce.perspectives.exportCSV')}
        onOpening={onModalOpen}
      >
        <Formik
          formName="formikFormBasic"
          enableReinitialize
          initialValues={{
            fileName: perspectiveName,
            exportRowsUpto: String(maxNoOfRows),
            excludeRowsWithCost: ''
          }}
          validationSchema={Yup.object().shape({
            fileName: Yup.string().trim().required(),
            exportRowsUpto: Yup.number()
              .required()
              .min(1, getString('ce.perspectives.noOfRowsGreaterThan'))
              .max(maxNoOfRows, getString('ce.perspectives.noOfRowsLessThan', { number: maxNoOfRows })),
            excludeRowsWithCost: Yup.number()
          })}
          onSubmit={({ excludeRowsWithCost, exportRowsUpto, fileName }) => {
            query(FetchperspectiveGridDocument, {
              ...variables,
              limit: Number(exportRowsUpto) || perspectiveTotalCount,
              offset: 0
            })
              .toPromise()
              .then(result => {
                downloadPerspectiveGridAsCsv({
                  csvFileName: fileName,
                  downloadData: result.data.perspectiveGrid?.data as QlceViewEntityStatsDataPoint[],
                  excludeRowsWithCost,
                  selectedColumnsToDownload
                })
                closeDownloadCSVModal()
              })
              .catch(err => showError(getErrorInfoFromErrorObject(err)))
          }}
        >
          {formikProps => {
            const showLongerDownloadTimeWarning =
              Number(formikProps.values.exportRowsUpto) < maxNoOfRows && Number(formikProps.values.exportRowsUpto) > 500

            return (
              <FormikForm>
                <Layout.Vertical
                  flex={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
                  style={{ minHeight: 280 }}
                >
                  <Container width={'100%'}>
                    <Text font={{ variation: FontVariation.BODY2 }} margin={{ bottom: 'small' }}>
                      {getString('ce.perspectives.filename')}
                    </Text>
                    <FormInput.Text name="fileName" />
                  </Container>
                  <Container>
                    <Text font={{ variation: FontVariation.BODY2 }} margin={{ bottom: 'small' }}>
                      {getString('ce.perspectives.exportRowsUpto')}
                    </Text>
                    <Layout.Horizontal spacing="small">
                      <FormInput.Text name="exportRowsUpto" />
                      <Text font={{ variation: FontVariation.BODY }} padding={{ top: 'small' }}>{`${getString(
                        'of'
                      )} ${maxNoOfRows}`}</Text>
                    </Layout.Horizontal>
                    {showLongerDownloadTimeWarning ? (
                      <Text color={Color.BLUE_700} font={{ variation: FontVariation.SMALL }} icon="info-messaging">
                        {getString('ce.perspectives.largeNoOfRowsWarning')}
                      </Text>
                    ) : null}
                  </Container>
                  <Container width={'100%'}>
                    <Container margin={{ bottom: 'small' }}>
                      <Text inline font={{ variation: FontVariation.BODY2 }}>
                        {getString('ce.perspectives.excludeRowswithCost')}
                      </Text>
                      <Text inline font={{ variation: FontVariation.BODY, italic: true }}>{` ${getString(
                        'common.optionalLabel'
                      )}`}</Text>
                    </Container>
                    <FormInput.Text name="excludeRowsWithCost" placeholder={getString('ce.perspectives.enterAmount')} />
                  </Container>
                </Layout.Vertical>
                <Layout.Horizontal spacing="small" padding={{ top: 'xxlarge' }}>
                  <Button text={getString('common.download')} variation={ButtonVariation.PRIMARY} type="submit" />
                  <Button
                    text={getString('cancel')}
                    variation={ButtonVariation.TERTIARY}
                    onClick={closeDownloadCSVModal}
                  />
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Dialog>
    )
  }, [perspectiveTotalCount, selectedColumnsToDownload])

  return [openDownloadCSVModal, closeDownloadCSVModal]
}
