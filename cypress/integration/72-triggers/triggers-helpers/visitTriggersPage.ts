import {
  inputSetsTemplateCall,
  pipelineDetails,
  pipelineDetailsWithRoutingIdCall,
  pipelineInputSetTemplate,
  TriggersRoute,
  pipelineSummaryCallAPI,
  featureFlagsCall
} from '../../../support/70-pipeline/constants'
import { getTriggerListAPI } from '../constansts'

export const visitTriggersPage = (
  getTriggerListAPIFixture = 'pipeline/api/triggers/Cypress_Test_Trigger_Get_Empty_Trigger_List.json'
): void => {
  beforeEach(() => {
    cy.fixture('api/users/feature-flags/accountId').then(featureFlagsData => {
      cy.intercept('GET', featureFlagsCall, {
        ...featureFlagsData,
        resource: [
          ...featureFlagsData.resource,
          { uuid: null, name: 'NG_SVC_ENV_REDESIGN', enabled: true, lastUpdatedAt: 0 },
          { uuid: null, name: 'CD_TRIGGER_V2', enabled: true, lastUpdatedAt: 0 },
          { uuid: null, name: 'BAMBOO_ARTIFACT_NG', enabled: true, lastUpdatedAt: 0 }
        ]
      })

      cy.intercept('GET', pipelineDetails, { fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline.json' })

      cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline.json'
      })

      cy.intercept('POST', pipelineSummaryCallAPI, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline_Summary.json'
      })

      cy.intercept('POST', inputSetsTemplateCall, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Pipeline_Input_Sets_Template.json'
      })

      cy.intercept('GET', pipelineInputSetTemplate, {
        fixture: 'pipeline/api/triggers/Cypress_Test_Trigger_Templates_Apply_Templates.json'
      })

      cy.fixture(getTriggerListAPIFixture).then(getTriggerListAPIData => {
        cy.intercept('GET', getTriggerListAPI, {
          fixture: getTriggerListAPIFixture
        })

        cy.initializeRoute()
        cy.visit(TriggersRoute, {
          timeout: 30000
        })

        if (getTriggerListAPIData.data.totalPages) {
          cy.visitPageAssertion('.TableV2--table')
        } else {
          cy.visitPageAssertion('.NoDataCard--buttonContainer')
        }
      })
    })
  })
}
