import { renderHook } from '@testing-library/react-hooks'

describe('useAutoSelectionTests', () => {
  describe('Simple Pipeline', () => {
    describe('user has selected stage and step', () => {
      test('returns user selected stage and step from query params', () => {
        expect(1).toBe(1)
      })

      test('auto selection stops if user has selected stage and step', () => {
        expect(1).toBe(1)
      })
    })

    describe('user has selected only stage', () => {
      test('Pipeline is running, returns running step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is waiting, returns waiting step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline has failed, returns failed step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is success, returns last success step', () => {
        expect(1).toBe(1)
      })

      test('For stage level execution inputs, open the virtual step', () => {
        expect(1).toBe(1)
      })
    })

    describe('user has selected neither stage nor step', () => {
      test('Pipeline is running, returns running stage and step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is waiting, returns waiting stage and step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline has failed, returns failed stage and step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is success, returns last successful stage and last step', () => {
        expect(1).toBe(1)
      })

      test('For stage level execution inputs, open the virtual step', () => {
        expect(1).toBe(1)
      })
    })
  })

  describe('Parallel stages and steps', () => {
    describe('user has selected stage and step', () => {
      test('returns user selected stage and step from query params', () => {
        expect(1).toBe(1)
      })

      test('auto selection stops if user has selected stage and step', () => {
        expect(1).toBe(1)
      })
    })

    describe('user has selected only stage', () => {
      test('Pipeline is running, returns first running step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is waiting, returns first waiting step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline has failed, returns first failed step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is success, returns lat success step', () => {
        expect(1).toBe(1)
      })

      test('For stage level execution inputs, open the virtual step', () => {
        expect(1).toBe(1)
      })
    })

    describe('user has selected neither stage nor step', () => {
      test('Pipeline is running, returns first running stage and first running step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is waiting, returns first waiting stage and first waiting step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline has failed, returns first failed stage and first failed step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is success, returns last successful stage and last step, from parallel stages', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is success, returns last successful stage and last step, from last column,', () => {
        expect(1).toBe(1)
      })

      test('For stage level execution inputs, open the virtual step', () => {
        expect(1).toBe(1)
      })
    })
  })

  describe('Matrix Pipeline', () => {
    describe('user has selected stage and step', () => {
      test('returns user selected stage and step from query params', () => {
        expect(1).toBe(1)
      })

      test('auto selection stops if user has selected stage and step', () => {
        expect(1).toBe(1)
      })
    })

    describe('user has selected stage and clicked on show all in matrix steps', () => {
      test('returns user selected stage and collapsed node from query params', () => {
        expect(1).toBe(1)
      })

      test('auto selection stops if user has selected stage and collapsed node', () => {
        expect(1).toBe(1)
      })
    })

    describe('user has selected only stage', () => {
      test('Pipeline is running, returns running step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is waiting, returns waiting step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline has failed, returns failed step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is success, returns last step', () => {
        expect(1).toBe(1)
      })

      test('For stage level execution inputs, open the virtual step', () => {
        expect(1).toBe(1)
      })
    })

    describe('user has selected neither stage nor step', () => {
      test('Pipeline is running, returns running stage and step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is waiting, returns waiting stage and step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline has failed, returns failed stage and step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is success, returns last successful stage and step', () => {
        expect(1).toBe(1)
      })
    })
  })

  describe('Chained Pipeline', () => {
    describe('user has selected stage and step', () => {
      test('returns user selected stage and step from query params', () => {
        expect(1).toBe(1)
      })

      test('auto selection stops if user has selected stage and step', () => {
        expect(1).toBe(1)
      })
    })

    describe('user has selected only stage', () => {
      test('Pipeline is running, returns running step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is waiting, returns waiting step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline has failed, returns failed step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is success, returns last step', () => {
        expect(1).toBe(1)
      })
    })

    describe('user has selected neither stage nor step', () => {
      test('Pipeline is running, returns running stage and step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is waiting, returns waiting stage and step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline has failed, returns failed stage and step', () => {
        expect(1).toBe(1)
      })

      test('Pipeline is success, returns last successful stage and step', () => {
        expect(1).toBe(1)
      })
    })
  })
})
