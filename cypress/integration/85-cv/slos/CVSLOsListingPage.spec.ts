import {
  getUserJourneysCall,
  listMonitoredServices,
  listMonitoredServicesCallResponse,
  listSLOsCall,
  listUserJourneysCallResponse,
  updatedListSLOsCallResponse,
  getSLORiskCount,
  getMonitoredService,
  listSLOsCallResponse,
  deleteSLOData,
  listSLOsCallWithUserJourneyNewOne,
  listSLOsCallWithUserJourneySecondJourney,
  listSLOsCallWithCVNGProd,
  listSLOsCallWithCVNGDev,
  listSLOsCallWithCalender,
  listSLOsCallWithRolling,
  listSLOsCallWithAvailability,
  listSLOsCallWithLatency,
  listSLOsCallWithUnhealthy,
  listSLOsCallWithHealthy,
  errorResponse,
  getSLORiskCountResponse,
  getMonitoredServiceResponse,
  errorBudgetResetHistory,
  errorBudgetResetHistoryResponse,
  getChangeEventTimeline,
  changeEventTimelineResponse,
  updatedListSLOsCallResponseCalenderType,
  listMonitoredServicesForSLOs,
  listMonitoredServicesCallResponseForSLOs
} from '../../../support/85-cv/slos/constants'

describe('CVSLOsListingPage', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.login('test', 'test')

    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponseCalenderType)
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', listMonitoredServicesForSLOs, listMonitoredServicesCallResponseForSLOs)
    cy.intercept('GET', getSLORiskCount, getSLORiskCountResponse)
    cy.intercept('GET', getMonitoredService, getMonitoredServiceResponse)
    cy.intercept('GET', getChangeEventTimeline, changeEventTimelineResponse)
    cy.visitChangeIntelligenceForSLOs()
  })

  it('it should ensure SLO card features are working fine', () => {
    cy.intercept('DELETE', deleteSLOData, errorResponse).as('deleteSLOData')
    cy.contains('p', 'SLO-1').should('be.visible')
    cy.contains('p', 'cvng').should('be.visible')
    cy.contains('p', 'prod').should('be.visible')
    cy.contains('p', '100.00%').should('be.visible')
    cy.contains('p', '99%').should('be.visible')
    cy.contains('p', '138.44%').should('be.visible')

    cy.contains('p', 'prod').click({ force: true })

    cy.contains('div', 'Service Health').should('be.visible')
    cy.contains('p', 'SLOs').click()
    cy.contains('p', 'SLO-1').should('be.visible')

    cy.get('[data-icon="main-trash"]').click()
    cy.contains('p', 'Delete SLO-1?').should('be.visible')
    cy.contains('p', 'Are you sure you want to delete SLO: SLO-1?').should('be.visible')

    cy.contains('span', 'Delete').click()

    cy.wait('@deleteSLOData')
    cy.contains('span', 'Oops, something went wrong on our end. Please contact Harness Support.').should('be.visible')
  })

  it('should verify filters', () => {
    cy.intercept('GET', listSLOsCallWithUserJourneySecondJourney, listSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithUserJourneyNewOne, updatedListSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithCVNGDev, listSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithCVNGProd, updatedListSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithCalender, listSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithRolling, updatedListSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithAvailability, listSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithLatency, updatedListSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithUnhealthy, listSLOsCallResponse)
    cy.intercept('GET', listSLOsCallWithHealthy, updatedListSLOsCallResponse)

    cy.contains('p', 'SLOs').click()

    cy.contains('p', 'SLO-1').should('be.visible')

    cy.findByTestId('userJourney-filter').click()
    cy.contains('p', 'Second Journey').click({ force: true })
    cy.contains('h2', 'You don’t have any SLO created yet').should('be.visible')
    cy.findByTestId('userJourney-filter').click()
    cy.contains('p', 'new-one').click({ force: true })
    cy.contains('p', 'SLO-1').should('be.visible')

    cy.findByTestId('userJourney-filter').click()
    cy.contains('p', 'All').click({ force: true })

    cy.findAllByTestId('monitoredServices-filter').click()
    cy.contains('p', 'cvng_dev').click({ force: true })
    cy.contains('h2', 'You don’t have any SLO created yet').should('be.visible')
    cy.findAllByTestId('monitoredServices-filter').click()
    cy.contains('p', 'cvng_prod').click({ force: true })
    cy.contains('p', 'SLO-1').should('be.visible')

    cy.findByTestId('monitoredServices-filter').click()
    cy.contains('p', 'All').click({ force: true })

    cy.findAllByTestId('sloTargetAndBudget-filter').click()
    cy.contains('p', 'Calender').click({ force: true })
    cy.contains('h2', 'You don’t have any SLO created yet').should('be.visible')
    cy.findAllByTestId('sloTargetAndBudget-filter').click()
    cy.contains('p', 'Rolling').click({ force: true })
    cy.contains('p', 'SLO-1').should('be.visible')

    cy.findByTestId('sloTargetAndBudget-filter').click()
    cy.contains('p', 'All').click({ force: true })

    cy.findAllByTestId('sliType-filter').click()
    cy.contains('p', 'Availability').click({ force: true })
    cy.contains('h2', 'You don’t have any SLO created yet').should('be.visible')
    cy.findAllByTestId('sliType-filter').click()
    cy.contains('p', 'Latency').click({ force: true })
    cy.contains('p', 'SLO-1').should('be.visible')

    cy.contains('span', 'Clear Filters').click()
    cy.contains('span', 'Clear Filters').should('not.exist')

    cy.contains('p', 'Unhealthy').click()
    cy.contains('h2', 'No matching data').should('be.visible')
    cy.contains('p', 'Healthy').click()
    cy.contains('p', 'SLO-1').should('be.visible')
  })

  it('should not render Error Budget reset option for SLO Listing page', () => {
    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse)
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', listMonitoredServicesForSLOs, listMonitoredServicesCallResponseForSLOs)
    cy.intercept('GET', getSLORiskCount, getSLORiskCountResponse)
    cy.intercept('GET', errorBudgetResetHistory, errorBudgetResetHistoryResponse)

    cy.contains('p', 'SLOs').click()

    cy.contains('span', 'Reset Error Budget').should('not.exist')
  })
})
