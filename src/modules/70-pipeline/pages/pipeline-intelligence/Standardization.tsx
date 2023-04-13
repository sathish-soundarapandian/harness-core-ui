import React from 'react'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  FontVariation,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  Text
} from '@harness/uicore'
import { noop } from 'lodash-es'
import { useMutateAsGet } from '@common/hooks'
import { useGetPipelineList } from '../../../../services/pipeline-ng'
import { prepareFiltersPayload } from '@pipeline/pages/utils/Filters/filters'
import { getFilterByIdentifier } from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import { useParams } from 'react-router-dom'
import { PipelineListPagePathParams } from '@pipeline/pages/pipeline-list/types'
import { useOpenaiGoldenPipeline } from 'services/pipeline-ng'

export default function Standardization(props) {
  const requestBody = {
    filterType: 'PipelineSetup'
  }

  const pathParams = useParams<PipelineListPagePathParams>()
  const { projectIdentifier, orgIdentifier, accountId, module } = pathParams

  const pipelinesQuery = useMutateAsGet(useGetPipelineList, {
    body: requestBody,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      searchTerm: '',
      page: 0,
      sort: `lastUpdatedAt DESC`,
      size: 100
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const { data, loading, refetch } = useOpenaiGoldenPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      goldenPipelineId: ''
    },
    lazy: true
  })

  const onSubmit = values => {
    const goldenPipeline = values.goldenPipeline
    // Make API call to
    refetch({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier: orgIdentifier,
        projectIdentifier: projectIdentifier,
        goldenPipelineId: goldenPipeline
      }
    })
  }

  return (
    <Layout.Vertical flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <Layout.Horizontal>
        <Formik enableReinitialize onSubmit={noop} formName={'Standardization'} initialValues={{}}>
          {formikProps => {
            return (
              <FormikForm>
                <FormInput.Select
                  name={'goldenPipeline'}
                  items={
                    pipelinesQuery.loading
                      ? []
                      : pipelinesQuery.data?.data?.content?.map(a => ({ label: a.name, value: a.identifier })) || []
                  }
                  placeholder={'Select your Golder Pipeline'}
                  label={'Select your Golder Pipeline'}
                  style={{ width: '400px' }}
                />
                <Container margin={{ top: 'xxlarge' }}>
                  <Button onClick={onSubmit} variation={ButtonVariation.PRIMARY} text={'Save'} />
                </Container>
              </FormikForm>
            )
          }}
        </Formik>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
