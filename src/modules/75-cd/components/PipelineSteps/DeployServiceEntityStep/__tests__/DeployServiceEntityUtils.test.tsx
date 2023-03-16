import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { getAllFixedServices } from '../DeployServiceEntityUtils'

describe('service entity utils test - getAllFixedServices', () => {
  test('service(s) object is empty', () => {
    expect(getAllFixedServices({})).toEqual([])
  })

  test('service is fixed', () => {
    expect(getAllFixedServices({ service: { serviceRef: 'svc1' } })).toEqual(['svc1'])
  })

  test('service is runtime', () => {
    expect(getAllFixedServices({ service: { serviceRef: RUNTIME_INPUT_VALUE } })).toEqual([])
  })

  test('service is used from previous stage', () => {
    expect(
      getAllFixedServices({
        service: {
          useFromStage: {
            stage: 'stage1'
          }
        }
      })
    ).toEqual([])
  })

  test('services are not an empty array', () => {
    expect(
      getAllFixedServices({
        services: {
          values: [
            {
              serviceRef: 'svc1'
            },
            {
              serviceRef: 'svc2'
            },
            {
              serviceRef: 'svc3'
            },
            {
              serviceRef: 'svc4'
            }
          ]
        }
      })
    ).toEqual(['svc1', 'svc2', 'svc3', 'svc4'])
  })

  test('services are an empty array', () => {
    expect(getAllFixedServices({ services: { values: [] } })).toEqual([])
  })

  test('services are runtime', () => {
    expect(getAllFixedServices({ services: { values: RUNTIME_INPUT_VALUE } })).toEqual([])
  })
})
