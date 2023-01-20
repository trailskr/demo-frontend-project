import { describe, expect, it } from 'vitest'

import { deepMerge } from '@/utils/utils'

describe('utils.js', () => {
  describe('deepMerge', () => {
    class Class {
      [key: string]: unknown

      constructor (data: Record<string, unknown>) {
        for (const key in data) {
          this[key] = data[key]
        }
      }
    }

    it('should properly merge objects', () => {
      const dst = { item1: { field1: { data1: 'data1' } } }
      const src = { item2: { field2: { data2: 'data2' } } }
      const result = { item1: { field1: { data1: 'data1' } }, item2: { field2: { data2: 'data2' } } }
      expect(deepMerge(dst, src)).to.eql(result)
    })

    it('should preserve already available properties', () => {
      const dst = { item: { field: { data1: 'data1' } } }
      const src = { item: { field: { data2: 'data2' } } }
      const result = { item: { field: { data1: 'data1', data2: 'data2' } } }
      expect(deepMerge(dst, src)).to.eql(result)
    })

    it('should add undefined fields too if it not exists', () => {
      const dst = { item: { field: { data1: 'data1' } } }
      const src = { item: { field: { data2: undefined } } }
      const result = { item: { field: { data1: 'data1', data2: undefined } } }
      expect(deepMerge(dst, src)).to.eql(result)
    })

    it('should not overwrite fields if in source it value is undefined', () => {
      const dst = { item: { field: { data: 'data1' } } }
      const src = { item: { field: { data: undefined } } }
      const result = { item: { field: { data: 'data1' } } }
      expect(deepMerge(dst, src)).to.eql(result)
    })

    it('should not overwrite object fields if prototype not matched', () => {
      const dst = { item: new Class({ field: { data1: 'data1' } }) }
      const src = { item: { field: { data2: 'data2' } } }
      expect((deepMerge(dst, src) as any).item instanceof Class).toBe(true)
    })

    it('should replace values with same indices if both arrays', () => {
      const dst = [3, 4, 0]
      const src = [1, 2]
      const result = [1, 2, 0]
      expect(deepMerge(dst, src)).to.be.eql(result)
    })

    it('should replace values with same indices', () => {
      const dst = { item: [1, 2] }
      const src = { item: [undefined, undefined, 3, 4] }
      const result = { item: [1, 2, 3, 4] }
      expect(deepMerge(dst, src)).to.be.eql(result)
    })

    it('should combine source and target into one arrays if they arrays too if concatArrays', () => {
      const dst = [3, 4]
      const src = [1, 2]
      const result = [1, 2, 3, 4]
      expect(deepMerge(dst, src, { concatArrays: true })).to.be.eql(result)
    })

    it('should combine arrays of source and target into one if concatArrays', () => {
      const dst = { item: [3, 4] }
      const src = { item: [1, 2] }
      const result = { item: [1, 2, 3, 4] }
      expect(deepMerge(dst, src, { concatArrays: true })).to.be.eql(result)
    })
  })

  describe('isEqual', () => {
    class Class {
      [key: string]: unknown

      constructor (data: Record<string, unknown>) {
        for (const key in data) {
          this[key] = data[key]
        }
      }
    }

    it('should properly merge objects', () => {
      const dst = { item1: { field1: { data1: 'data1' } } }
      const src = { item2: { field2: { data2: 'data2' } } }
      const result = { item1: { field1: { data1: 'data1' } }, item2: { field2: { data2: 'data2' } } }
      expect(deepMerge(dst, src)).to.eql(result)
    })

    it('should preserve already available properties', () => {
      const dst = { item: { field: { data1: 'data1' } } }
      const src = { item: { field: { data2: 'data2' } } }
      const result = { item: { field: { data1: 'data1', data2: 'data2' } } }
      expect(deepMerge(dst, src)).to.eql(result)
    })

    it('should add undefined fields too if it not exists', () => {
      const dst = { item: { field: { data1: 'data1' } } }
      const src = { item: { field: { data2: undefined } } }
      const result = { item: { field: { data1: 'data1', data2: undefined } } }
      expect(deepMerge(dst, src)).to.eql(result)
    })

    it('should not overwrite fields if in source it value is undefined', () => {
      const dst = { item: { field: { data: 'data1' } } }
      const src = { item: { field: { data: undefined } } }
      const result = { item: { field: { data: 'data1' } } }
      expect(deepMerge(dst, src)).to.eql(result)
    })

    it('should not overwrite object fields if prototype not matched', () => {
      const dst = { item: new Class({ field: { data1: 'data1' } }) }
      const src = { item: { field: { data2: 'data2' } } }
      expect((deepMerge(dst, src) as any).item instanceof Class).toBe(true)
    })

    it('should replace values with same indices if both arrays', () => {
      const dst = [3, 4, 0]
      const src = [1, 2]
      const result = [1, 2, 0]
      expect(deepMerge(dst, src)).to.be.eql(result)
    })

    it('should replace values with same indices', () => {
      const dst = { item: [1, 2] }
      const src = { item: [undefined, undefined, 3, 4] }
      const result = { item: [1, 2, 3, 4] }
      expect(deepMerge(dst, src)).to.be.eql(result)
    })

    it('should combine source and target into one arrays if they arrays too if concatArrays', () => {
      const dst = [3, 4]
      const src = [1, 2]
      const result = [1, 2, 3, 4]
      expect(deepMerge(dst, src, { concatArrays: true })).to.be.eql(result)
    })

    it('should combine arrays of source and target into one if concatArrays', () => {
      const dst = { item: [3, 4] }
      const src = { item: [1, 2] }
      const result = { item: [1, 2, 3, 4] }
      expect(deepMerge(dst, src, { concatArrays: true })).to.be.eql(result)
    })
  })
})
