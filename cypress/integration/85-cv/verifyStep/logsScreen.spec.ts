import {
  pipelineExecutionAPI,
  pipelineExecutionForNodeAPI,
  pipelineExecutionSummaryAPI,
  pipelineListAPI
} from '../../../support/70-pipeline/constants'

import {
  aggregateProjectsCall,
  deploymentTimeseriesDataAPI,
  deploymentTimeseriesDataWithFilters,
  deploymentTimeseriesDataWithNodeFilterAPI,
  gitSyncCall,
  healthSourceAPI,
  logsListCall,
  logsListCallResponse,
  logsListCLusterFilterCall,
  logsListMinSliderFilterCall,
  logsListNodeFilterCall,
  logsRadarChartDataCall,
  logsRadarChartDataCallResponse,
  logsRadarChartDataCLusterFilterCall,
  logsRadarChartDataNodeFilterCall,
  nodeNamesFilterAPI,
  overviewCall,
  overviewCallResponse,
  pipelinesFetchCall,
  pipelinesSummaryFetchCall,
  pipelinesYamlFetchCall,
  sourceCodeManagerCall,
  transactionsFilterAPI
} from '../../../support/85-cv/verifyStep/constants'

describe('Verify step', () => {
  beforeEach(() => {
    cy.intercept('POST', pipelineListAPI, { fixture: '/pipeline/api/pipelines/getPipelineList' }).as('pipelineList')
    cy.intercept('GET', pipelinesSummaryFetchCall, { fixture: '/pipeline/api/pipelines/pipelineSummary' }).as(
      'pipelineSummary'
    )
    cy.intercept('GET', pipelinesFetchCall, { fixture: '/pipeline/api/pipelines/getPipelineDetails' }).as(
      'pipelineDetails'
    )
    cy.intercept('POST', pipelineExecutionSummaryAPI, {
      fixture: '/pipeline/api/pipelines/getExecutionSummary'
    }).as('pipelineExecutionSumary')
    cy.intercept('GET', pipelineExecutionAPI, { fixture: '/pipeline/api/pipelines/getExecutionDetails' }).as(
      'pipelineExecution'
    )
    cy.intercept('GET', pipelineExecutionForNodeAPI, { fixture: '/pipeline/api/pipelines/getNodeExecutionDetails' }).as(
      'pipelineExecutionForNode'
    )

    cy.intercept('GET', overviewCall, overviewCallResponse).as('overviewCall')

    cy.intercept('GET', deploymentTimeseriesDataAPI, { fixture: '/cv/verifyStep/getDeploymentTimeseriesData' }).as(
      'deploymentTimeseriesData'
    )
    cy.intercept('GET', healthSourceAPI, { fixture: '/cv/verifyStep/getHealthSourceFilters' }).as('healthSource')
    cy.intercept('GET', nodeNamesFilterAPI, { fixture: '/cv/verifyStep/getNodeNameFilters' }).as('nodeNames')
    cy.intercept('GET', transactionsFilterAPI, { fixture: '/cv/verifyStep/getTransactionNameFilters' }).as(
      'transactions'
    )

    cy.intercept('GET', deploymentTimeseriesDataWithNodeFilterAPI, {
      fixture: '/cv/verifyStep/getDeploumentTimeseriesNoData'
    }).as('deploymentTimeseriesDataWithNodeFilter')

    cy.intercept('GET', deploymentTimeseriesDataWithFilters, {
      fixture: '/cv/verifyStep/getDeploumentTimeseriesNoData'
    }).as('deploymentTimeseriesDataWithFilters')

    cy.intercept('GET', gitSyncCall, {}).as('gitSyncCall')
    cy.intercept('GET', pipelinesYamlFetchCall, {}).as('pipelinesYamlFetchCall')
    cy.intercept('GET', sourceCodeManagerCall, {}).as('sourceCodeManagerCall')
    cy.intercept('GET', aggregateProjectsCall, {}).as('aggregateProjectsCall')

    cy.login('test', 'test')
    cy.visitPageAssertion('[class^=SideNav-module_main]')
    cy.contains('p', 'Projects').click()
    cy.contains('p', 'Project 1').click()
    cy.contains('p', 'Delivery').click()
    cy.contains('p', 'Pipelines').click()

    cy.wait('@pipelineList')
    cy.wait('@aggregateProjectsCall')
  })

  it('should verify logs screen', () => {
    cy.intercept('GET', logsListCall, logsListCallResponse).as('logsListCall')
    cy.intercept('GET', logsRadarChartDataCall, logsRadarChartDataCallResponse).as('logsRadarChartDataCall')
    cy.intercept('GET', logsListNodeFilterCall, logsListCallResponse).as('logsListNodeFilterCall')
    cy.intercept('GET', logsRadarChartDataNodeFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataNodeFilterCall'
    )

    cy.intercept('GET', logsListCLusterFilterCall, logsListCallResponse).as('logsListCLusterFilterCall')
    cy.intercept('GET', logsRadarChartDataCLusterFilterCall, logsRadarChartDataCallResponse).as(
      'logsRadarChartDataCLusterFilterCall'
    )
    cy.intercept('GET', logsListMinSliderFilterCall, logsListCallResponse).as('logsListMinSliderFilterCall')

    cy.findByText('NG Docker Image').click()

    cy.wait('@sourceCodeManagerCall')
    cy.wait('@gitSyncCall')
    cy.wait('@pipelinesYamlFetchCall')

    cy.wait('@pipelineSummary')
    cy.wait('@pipelineDetails')

    cy.url().should('include', '/pipelines/NG_Docker_Image/pipeline-studio')

    cy.findByRole('link', { name: /Execution History/i }).click()

    cy.wait('@pipelineExecutionSumary')
    cy.wait('@pipelineSummary')

    cy.findByText(/(Execution Id: 5)/i)
      .scrollIntoView()
      .click()

    cy.wait('@pipelineExecution')
    cy.wait('@pipelineExecutionForNode')

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline')

    cy.findByText(/appd_dev/i).click()

    cy.url().should('include', '/pipelines/NG_Docker_Image/executions/')

    cy.findByTestId(/Logs/i).click()

    cy.wait('@overviewCall')
    cy.wait('@logsListCall')
    cy.wait('@logsRadarChartDataCall')

    cy.url().should(
      'include',
      '/pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline?storeType=INLINE&view=log&type=Logs&filterAnomalous=true'
    )

    cy.findAllByTestId(/logs-data-row/i).should('have.length', 3)

    cy.findAllByTestId(/logs-data-row/i)
      .first()
      .click()

    cy.findByTestId(/LogAnalysis_detailsDrawer/i).should('exist')

    cy.findByTestId(/ActivityHeadingContent_eventType/i).should('have.text', 'Known')
    cy.findByTestId(/ActivityHeadingContent_count/i).should('have.text', '8')

    cy.findAllByTestId(/activityHeadingContent-chart/i).should('have.length', '4')

    cy.findByTestId(/DrawerClose_button/i).click()

    cy.findByTestId(/LogAnalysis_detailsDrawer/i).should('not.exist')

    // By clicking on the node graph, it should apply the same filter in nodes dropdown
    cy.findByTestId(/canaryNode-0/).click()

    cy.wait('@logsListNodeFilterCall')
    cy.wait('@logsRadarChartDataNodeFilterCall')

    cy.findByTestId(/node_name_filter/i).click()
    cy.findByRole('checkbox', { name: 'harness-deployment-canary-7445f86dbf-ml857' }).should('be.checked')
    cy.findByTestId(/canaryNode-0/).click({ force: true })
    cy.findByText(/Nodes: All/i).should('be.visible')
    cy.get('.MultiSelectDropDown--dropdownButton').click({ force: true })

    // should make correct filter call

    cy.findByTestId('Unknown').should('exist')
    cy.findByTestId('Unknown').should('be.checked')
    cy.findByTestId('Unknown').click({ force: true })

    cy.wait('@logsListCLusterFilterCall')
    cy.wait('@logsRadarChartDataCLusterFilterCall')

    cy.get('.highcharts-scatter-series').should('have.length', 24)

    cy.findByTestId('MinMaxSlider_MinInput').invoke('val', 20).trigger('change', { force: true })

    cy.wait('@logsListMinSliderFilterCall').then(interceptor => {
      expect(interceptor.request.url).includes('minAngle=30')
    })
    cy.get('.highcharts-scatter-series').should('have.length', 18)

    // if we come via Console view log, filter call should include KNOWN cluster type
    cy.get('.bp3-switch').click()
    // clicking again to go to verify step page
    cy.get('.bp3-switch').click()

    cy.findByText(/^Logs/i).click({ force: true })

    cy.wait('@nodeNames')

    cy.url().should(
      'include',
      'pipelines/NG_Docker_Image/executions/C9mgNjxSS7-B-qQek27iuA/pipeline?storeType=INLINE&view=log&type=Metrics&filterAnomalous=false'
    )

    cy.findByTestId('Known').should('exist')
    cy.findByTestId('Known').should('be.checked')
  })
})
