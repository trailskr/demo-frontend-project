import { describe, expect, it } from 'vitest'

import { compilePath, get, set } from '@/utils/path'

describe('utils.js', () => {
  describe('compilePath', () => {
    it('should properly compile dot-path', () => {
      expect(compilePath('item.field.data')).eql(['item', 'field', 'data'])
    })

    it('should properly compile square bracket string path', () => {
      expect(compilePath('item["field"].data')).eql(['item', 'field', 'data'])
      expect(compilePath('item[\'field\'].data')).eql(['item', 'field', 'data'])
      expect(compilePath('item[\'field\'][\'data\']')).eql(['item', 'field', 'data'])
    })

    it('should properly compile square bracket index path', () => {
      expect(compilePath('item[0].data')).eql(['item', 0, 'data'])
      expect(compilePath('item[1]')).eql(['item', 1])
      expect(compilePath('item.field[\'0\']')).eql(['item', 'field', '0'])
    })
  })

  describe('get', () => {
    it('should properly get value by keys path', () => {
      expect(get({ item: { field: { data: 'data' } } }, ['item', 'field', 'data'])).eql('data')
    })

    it('should properly get value by index path', () => {
      expect(get({ item: [{ field: { data: 'data' } }] }, ['item', 0, 'field', 'data'])).eql('data')
    })

    it('should return undefined if path is not exist', () => {
      expect(get({}, ['item', 'field', 'data'])).toBe(undefined)
    })

    it('should return undefined if index path is not exist', () => {
      expect(get({}, ['item', 0, 'data'])).toBe(undefined)
    })
  })

  describe('set', () => {
    it('should properly set value by keys path', () => {
      const obj = { item: { field: { data: 'data' } } }
      set(obj, ['item', 'field', 'data'], 'val')
      expect(obj.item.field.data).to.equal('val')
    })

    it('should properly set value by index path', () => {
      const obj = { item: [{}, { data: 'data' }] }
      set(obj, ['item', 1, 'data'], 'val')
      expect(obj.item[1].data).to.equal('val')
    })

    it('should restore path if it is not exist', () => {
      const obj: any = { item: {} }
      set(obj, ['item', 'field', 'data'], 'val')
      expect(obj.item.field.data).to.equal('val')
    })

    it('should restore array in index paths if it is not exist', () => {
      const arr: any[] = []
      set(arr, [0, 1, 2], 3)
      expect(arr[0][1][2]).to.equal(3)
      expect(Array.isArray(arr[0][1])).toBe(true)
    })

    it('should preserve old keys when restoring path', () => {
      const obj = { item: { old: 1 } }
      set(obj, ['item', 'field', 'data'], 'val')
      expect(obj.item.old).to.equal(1)
    })

    it('should preserve references when restoring path', () => {
      const obj = { item: { old: 1 } }
      const item = obj.item
      set(obj, ['item', 'field', 'data'], 'val')
      expect(obj.item).to.equal(item)
    })
  })
})
