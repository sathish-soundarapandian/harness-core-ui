/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Formik,
  Page,
  useToaster,
  Container,
  Layout,
  Button,
  Heading,
  Dialog,
  Text,
  HarnessDocTooltip
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  ServiceLevelObjectiveV2DTO,
  useGetServiceLevelObjectiveV2,
  useSaveSLOV2Data,
  useUpdateSLOV2Data
} from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import sloReviewChange from '@cv/assets/sloReviewChange.svg'
import {
  createSLOV2RequestPayload,
  getIsUserUpdatedSLOData,
  getSLOV2FormValidationSchema,
  getSLOV2InitialFormData
} from './CVCreateSLOV2.utils'
import { CreateCompositeSloForm } from './components/CreateCompositeSloForm/CreateCompositeSloForm'
import type { SLOV2Form } from './CVCreateSLOV2.types'
import { SLOType } from './CVCreateSLOV2.constants'
import css from './components/CreateCompositeSloForm/CreateCompositeSloForm.module.scss'

const CVCreateSLOV2 = ({ isComposite }: { isComposite?: boolean }): JSX.Element => {
  const history = useHistory()
  const { getString } = useStrings()

  useDocumentTitle([getString('cv.srmTitle'), getString('cv.slos.title')])

  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const projectIdentifierRef = useRef<string>()
  const sloPayloadRef = useRef<ServiceLevelObjectiveV2DTO | null>(null)

  useEffect(() => {
    if (projectIdentifierRef.current && projectIdentifierRef.current !== projectIdentifier) {
      history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
      return
    }

    projectIdentifierRef.current = projectIdentifier
  }, [projectIdentifier, accountId, orgIdentifier, history])

  const { mutate: createSLO, loading: createSLOLoading } = useSaveSLOV2Data({ queryParams: { accountId } })

  const { mutate: updateSLO, loading: updateSLOLoading } = useUpdateSLOV2Data({
    identifier,
    queryParams: { accountId, orgIdentifier, projectIdentifier }
  })

  const {
    data: SLODataResponse,
    error: SLODataError,
    refetch: refetchSLOData,
    loading: SLODataLoading
  } = useGetServiceLevelObjectiveV2({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (identifier) {
      refetchSLOData()
    }
  }, [identifier, refetchSLOData])

  const [openModal, closeModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        usePortal={true}
        autoFocus={true}
        canEscapeKeyClose={true}
        canOutsideClickClose={true}
        enforceFocus={false}
        className={css.warningModal}
        onClose={closeModal}
      >
        <Layout.Vertical>
          <Layout.Horizontal>
            <Container width="70%" padding={{ right: 'large' }}>
              <Heading level={2} font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxlarge' }}>
                {getString('cv.slos.reviewChanges')}
              </Heading>
              <Text color={Color.GREY_600} font={{ weight: 'light' }} style={{ lineHeight: 'var(--spacing-xlarge)' }}>
                {getString('cv.slos.sloEditWarningMessage')}
              </Text>
            </Container>
            <Container margin={{ top: 'small' }}>
              <img width="170" src={sloReviewChange} />
            </Container>
          </Layout.Horizontal>

          <Layout.Horizontal spacing="medium" margin={{ top: 'large', bottom: 'xlarge' }}>
            <Button
              text={getString('common.ok')}
              onClick={async () => {
                await updateSLO(sloPayloadRef.current as ServiceLevelObjectiveV2DTO)
                sloPayloadRef.current = null
                showSuccess(getString('cv.slos.sloUpdated'))
                history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
              }}
              intent="primary"
            />
            <Button
              text={getString('cancel')}
              onClick={() => {
                sloPayloadRef.current = null
                closeModal()
              }}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    ),
    [projectIdentifier, orgIdentifier, accountId]
  )

  const handleRedirect = (): void => {
    history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
  }

  const handleSLOV2Submit = async (values: SLOV2Form): Promise<void> => {
    const sloCreateRequestPayload = createSLOV2RequestPayload(values, orgIdentifier, projectIdentifier)

    try {
      if (identifier) {
        if (
          !getIsUserUpdatedSLOData(
            SLODataResponse?.resource?.serviceLevelObjectiveV2 as ServiceLevelObjectiveV2DTO,
            sloCreateRequestPayload
          )
        ) {
          sloPayloadRef.current = sloCreateRequestPayload
          openModal()
        } else {
          await updateSLO(sloCreateRequestPayload)
          showSuccess(getString('cv.slos.sloUpdated'))
          handleRedirect()
        }
      } else {
        await createSLO(sloCreateRequestPayload)
        showSuccess(getString('cv.slos.sloCreated'))
        handleRedirect()
      }
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const links = [
    {
      url: routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }),
      label: getString('cv.slos.title')
    }
  ]
  // TODO: Update with swagger
  const sloType = isComposite ? SLOType.COMPOSITE : SLOType.SIMPLE
  return (
    <Container margin={{ bottom: 'large' }}>
      {!identifier && (
        <Page.Header
          breadcrumbs={<NGBreadcrumbs links={links} />}
          title={
            <Layout.Vertical flex={{ justifyContent: 'space-evenly', alignItems: 'flex-start' }} height={45}>
              <Heading level={3} font={{ variation: FontVariation.H4 }}>
                {isComposite ? getString('cv.CompositeSLO.CreateTitle') : getString('cv.slos.createSLO')}
                <HarnessDocTooltip tooltipId={'createCompositeSLO'} useStandAlone />
              </Heading>
              {isComposite && (
                <Text color={Color.GREY_600} font={{ variation: FontVariation.BODY2, weight: 'light' }}>
                  {getString('cv.CompositeSLO.CreateMessage')}
                </Text>
              )}
            </Layout.Vertical>
          }
        />
      )}
      <Formik<SLOV2Form>
        initialValues={getSLOV2InitialFormData(sloType, SLODataResponse?.resource?.serviceLevelObjectiveV2)}
        formName="SLO_form"
        onSubmit={values => {
          handleSLOV2Submit(values)
        }}
        validationSchema={getSLOV2FormValidationSchema(getString)}
        enableReinitialize
      >
        {() =>
          isComposite ? (
            <CreateCompositeSloForm
              loading={SLODataLoading}
              error={getErrorMessage(SLODataError)}
              retryOnError={refetchSLOData}
              handleRedirect={handleRedirect}
              runValidationOnMount={Boolean(identifier)}
              loadingSaveButton={createSLOLoading || updateSLOLoading}
            />
          ) : (
            // TODO: Add simple slo here
            <></>
          )
        }
      </Formik>
    </Container>
  )
}

export default CVCreateSLOV2
