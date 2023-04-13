import React from 'react'
import classnames from 'classnames'
import {
  Button,
  ButtonVariation,
  Card,
  Color,
  Container,
  FontVariation,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Layout,
  Text,
  Accordion
} from '@harness/uicore'
import { noop } from 'lodash-es'
import { useMutateAsGet } from '@common/hooks'
import { useGetPipelineList } from '../../../../services/pipeline-ng'
import { prepareFiltersPayload } from '@pipeline/pages/utils/Filters/filters'
import { getFilterByIdentifier } from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import { useParams } from 'react-router-dom'
import { PipelineListPagePathParams } from '@pipeline/pages/pipeline-list/types'
import { useOpenaiGoldenPipeline } from 'services/pipeline-ng'
import css from '@freeze-windows/components/FreezeWindowStudioConfigSection/FreezeWindowStudioConfigSection.module.scss'

function breakAtColon(str) {
  return str.split(':').map(s => s.trim())
}

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

  const {
    data: data,
    loading,
    refetch
  } = useOpenaiGoldenPipeline({
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

  var data1 = {
    status: 'SUCCESS',
    data: {
      policyRecommendations: [
        {
          response:
            '1. Manager Approval Policy: \nOnly initiate the pipeline execution if the manager approves the request, otherwise, reject the execution',
          regoCode:
            'The rego for the given OPA rule is:\n\n```\ndeny[msg] {\n    input.request == "pipeline_execution"\n    not input.approval\n    msg := "Pipeline execution requires manager approval."\n}\n```'
        },
        {
          response:
            '2. Build Environment Policy:\nEnsure that the operating system and architecture are set as Linux and Amd64 only for security purposes',
          regoCode: 'build = {\n    "os": "linux",\n    "arch": "amd64"\n}'
        },
        {
          response:
            '3. Security Check Policy:\nEnsure that the security scan is performed before the deployment process, and it must scan for all types of vulnerability for the product',
          regoCode:
            'Rule:\n\n```\npackage main\n\ndeploy_allowed {\n    scan_completed := input.scan_completed\n    vulnerabilities_found := input.vulnerabilities_found\n    # Check if scan has completed successfully\n    scan_completed\n    # Check if any vulnerabilities have been found\n    not vulnerabilities_found\n}\n\ndefault deploy_allowed = false\n```\nNote: This rule assumes that the input will have two boolean values: `scan_completed` and `vulnerabilities_found`. You should replace `input.scan_completed` and `input.vulnerabilities_found` with the correct values or variables based on your specific use case.'
        },
        {
          response: '4. Deployment Type Policy:\nEnsure that the deployment is always on Kubernetes only',
          regoCode: 'deployment.type == "kubernetes"'
        },
        {
          response:
            '5. Rollback Strategy Policy:\nEnsure that if something goes wrong during deployment, it is possible to rollback to the previous version using a Canary deployment approach. If the Canary deployment is successful, proceed with Rolling deployment, otherwise rollback to the previous version using a Canary Delete and Rolling Rollback approach.',
          regoCode:
            'rego "deployment_rollback_strategy" {\n    deployment := input.deployment\n    canary_success := input.canary_success\n    previous_version := input.previous_version\n    \n    (canary_success and deployment == "rolling") or (not canary_success and deployment == "rolling_rollback" and previous_version != null)\n}'
        }
      ]
    },
    metaData: null,
    correlationId: '9d3d4388-3c75-4583-9608-e8e514883cc6'
  }

  return (
    <Layout.Vertical flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
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
                <Button
                  disabled={loading}
                  onClick={() => onSubmit(formikProps.values)}
                  variation={ButtonVariation.PRIMARY}
                  text={'Save'}
                />
              </Container>
            </FormikForm>
          )
        }}
      </Formik>

      {data?.data?.policyRecommendations ? (
        <Container padding={{ right: 'xxlarge', bottom: 'xxlarge' }}>
          <Heading
            color={Color.BLACK}
            level={3}
            style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px', marginTop: '24px' }}
          >
            Recommended Policies
          </Heading>
          <Accordion
            activeId={''}
            panelClassName={classnames('bp3-card bp3-elevation-0 Card--card', css.makeCard)}
            allowMultiOpen={true}
          >
            {data.data.policyRecommendations.map(policyReco => {
              const parts = breakAtColon(policyReco.response)
              return (
                <Accordion.Panel
                  details={
                    <article>
                      <div className={css.code1}>{parts[1]}</div>
                      <code className={css.code}>{policyReco.regoCode?.replaceAll('```', '')}</code>
                    </article>
                  }
                  id={parts[0]}
                  summary={parts[0]}
                ></Accordion.Panel>
              )
            })}
          </Accordion>
        </Container>
      ) : null}
    </Layout.Vertical>
  )
}
