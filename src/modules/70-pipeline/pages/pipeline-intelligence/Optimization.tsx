import React from 'react'
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
  Text
} from '@harness/uicore'
import { noop } from 'lodash-es'
import { useMutateAsGet } from '@common/hooks'
import { useGetPipelineList } from '../../../../services/pipeline-ng'
import { prepareFiltersPayload } from '@pipeline/pages/utils/Filters/filters'
import { getFilterByIdentifier } from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import { useParams } from 'react-router-dom'
import { PipelineListPagePathParams } from '@pipeline/pages/pipeline-list/types'
import { useStructureSimilarity, useGetTemplates } from 'services/pipeline-ng'
import css from '@freeze-windows/components/FreezeWindowStudioConfigSection/FreezeWindowStudioConfigSection.module.scss'

function PrettyText({ text }) {
  return (
    <div
      style={{ marginBottom: '20px' }}
      dangerouslySetInnerHTML={{
        __html: text
      }}
    />
  )
}

export default function Optimization(props) {
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
    data: similarityData,
    refetch: similarityRefetch,
    loading: similarityLoading
  } = useStructureSimilarity({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      identifier1: '',
      identifier2: ''
    },
    lazy: true
  })

  const {
    data: templatesData,
    refetch: templatesRefetch,
    loading: templatesLoading
  } = useGetTemplates({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      identifier1: '',
      identifier2: ''
    },
    lazy: true
  })

  // const templatesData = {
  //   status: 'SUCCESS',
  //   data: {
  //     templates: [
  //       "Sure, here's a template for the ShellScript step:\n\n```\n- step:\n    type: ShellScript\n    name: ShellScript_1\n    identifier: ShellScript_1\n    spec:\n      shell: Bash\n      onDelegate: true\n      source:\n        type: Inline\n        spec:\n          script: <insert script here>\n      environmentVariables: []\n      outputVariables: []\n    timeout: 10m\n``` \n\nYou can replace `<insert script here>` with the actual script you want to run."
  //     ],
  //     pipelineYaml1:
  //       "ChatMessage(role=assistant, content=I'm sorry, as an AI language model, I don't have access to any previous conversation or context. Can you please provide more information or context about the YAML file you are referring to?)",
  //     pipelineYaml2:
  //       'ChatMessage(role=assistant, content=Here is an example of a YAML file with templates linked:\n\n```yaml\nversion: \'3.7\'\n\nservices:\n  web:\n    image: nginx:latest\n    ports:\n      - "80:80"\n    volumes:\n      - ./templates:/etc/nginx/templates\n    environment:\n      - NGINX_TEMPLATE=example.conf.template\n```\n\nIn this example, we have a service called "web" that uses the latest version of the nginx image. We map port 80 on the host to port 80 in the container. We also mount a volume that contains our nginx template files at `/etc/nginx/templates` in the container. Finally, we set an environment variable called `NGINX_TEMPLATE` to the name of the template file we want to use (`example.conf.template`). This allows us to use the template in our nginx configuration file.)'
  //   },
  //   metaData: null,
  //   correlationId: '7a70d162-edba-4a66-a467-89883df14bbb'
  // }
  const fetchTemplates = () => {}

  const onSubmit = values => {
    const firstPipeline = values.firstPipeline
    const secondPipeline = values.secondPipeline

    similarityRefetch({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier: orgIdentifier,
        projectIdentifier: projectIdentifier,
        identifier1: firstPipeline,
        identifier2: secondPipeline
      }
    })
    templatesRefetch({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier: orgIdentifier,
        projectIdentifier: projectIdentifier,
        identifier1: firstPipeline,
        identifier2: secondPipeline
      }
    })
    // Make API call to compare both
  }

  return (
    <Layout.Vertical flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}>
      <Formik enableReinitialize onSubmit={noop} formName={'Standardization'} initialValues={{}}>
        {formikProps => {
          return (
            <FormikForm>
              <FormInput.Select
                name={'firstPipeline'}
                items={
                  pipelinesQuery.loading
                    ? []
                    : pipelinesQuery.data?.data?.content?.map(a => ({ label: a.name, value: a.identifier })) || []
                }
                placeholder={'Select First Pipeline'}
                label={'Select First Pipeline'}
                style={{ width: '400px' }}
              />
              <FormInput.Select
                name={'secondPipeline'}
                items={
                  pipelinesQuery.loading
                    ? []
                    : pipelinesQuery.data?.data?.content?.map(a => ({ label: a.name, value: a.identifier })) || []
                }
                placeholder={'Select Second Pipeline'}
                label={'Select Second Pipeline'}
                style={{ width: '400px' }}
              />
              <Container margin={{ top: 'xxlarge' }}>
                <Button onClick={onSubmit} variation={ButtonVariation.PRIMARY} text={'Click and see the magic'} />
              </Container>
            </FormikForm>
          )
        }}
      </Formik>

      {similarityData?.data?.response ? (
        <Layout.Vertical>
          <Container padding={{ top: 'xxlarge', right: 'xxlarge', bottom: 'xxlarge' }}>
            <Card className={css.sectionCard1}>
              <Heading
                color={Color.GREY_700}
                level={4}
                style={{ fontWeight: 600, fontSize: '14px', lineHeight: '24px' }}
              >
                Similarity
              </Heading>
              <Text>{similarityData.data.response[0]}</Text>
            </Card>
          </Container>
        </Layout.Vertical>
      ) : null}

      {templatesData?.data?.pipelineYaml1 ? (
        <Layout.Vertical style={{ whiteSpace: 'pre-line' }}>
          <Container padding={{ top: 'xxlarge', right: 'xxlarge', bottom: 'xxlarge' }}>
            <Card className={css.sectionCard2}>
              <Heading
                color={Color.GREY_700}
                level={4}
                style={{ fontWeight: 600, fontSize: '14px', lineHeight: '24px' }}
              >
                Recommended Templates
              </Heading>
              {templatesData?.data?.templates?.map(template => (
                <PrettyText text={template} />
              ))}
            </Card>
            <Card className={css.sectionCard2}>
              <Heading
                color={Color.GREY_700}
                level={4}
                style={{ fontWeight: 600, fontSize: '14px', lineHeight: '24px' }}
              >
                Recommended Pipelines
              </Heading>
              <b>Pipeline YAML 1</b>
              <PrettyText text={templatesData?.data?.pipelineYaml1} />
              <b>Pipeline YAML 2</b>
              <PrettyText text={templatesData?.data?.pipelineYaml2} />
            </Card>
          </Container>
        </Layout.Vertical>
      ) : null}
    </Layout.Vertical>
  )
}
