import { describe, expect, it } from 'vitest'

import { v, ValidationError } from '@/utils/Validation'
import { Path } from '@/utils/path'
import { isEqual } from '@/utils/utils'
import { min, required, maxLength, object } from '@/utils/validators'

const errorMessage = (rule: string, path: Path = [], message = rule) => ({
  rule,
  path,
  message
})

const hasError = (arr: ValidationError[], err: Pick<ValidationError, 'rule' | 'path' | 'message'>): boolean => {
  return arr.some((e: ValidationError) => {
    return e.rule === err.rule &&
    isEqual(e.path, err.path) &&
    e.message === err.message
  })
}

describe('Validation', () => {
  it('should maintain dirty flag', () => {
    const validation = v()
    expect(validation.isDirty).toBe(false)
    validation.test('some value')
    expect(validation.isDirty).toBe(true)
    validation.reset()
    expect(validation.isDirty).toBe(false)
  })

  it('empty validation should validate anytime', () => {
    const validation = v()
    validation.test('some value')
    expect(validation.isValid).toBe(true)
  })

  it('should validate simple rule', () => {
    const validation = v({ rules: { required: { validator: required, message: 'required' } } })
    validation.test('some value')
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
    validation.test(null)
    expect(validation.isValid).toBe(false)
    expect(hasError(validation.errors, errorMessage('required'))).toBe(true)
  })

  it('should validate rule with params', () => {
    const validation = v({ rules: { min: { validator: min(5), message: 'min' } } })
    validation.test(4)
    expect(validation.isValid).toBe(false)
    expect(hasError(validation.errors, errorMessage('min'))).toBe(true)
    validation.test(5)
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('should use message function', () => {
    const validation = v({ rules: { required: { validator: required, message: (val: any) => `${val}` } } })
    validation.test(null)
    expect(hasError(validation.errors, errorMessage('required', [], 'null'))).toBe(true)
  })

  it('should be invalid if one rule not passed', () => {
    const validation = v({
      rules: {
        required: { validator: required, message: 'min' },
        min: { validator: min(5), message: 'min' }
      }
    })
    validation.test(1)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toHaveLength(1)
    expect(hasError(validation.errors, errorMessage('min'))).toBe(true)
  })

  it('should validate internal object fields', () => {
    const validation = v({
      fields: {
        field1: { rules: { maxLength: { validator: maxLength(10), message: 'maxLength' } } },
        field2: { rules: { maxLength: { validator: maxLength(10), message: 'maxLength' } } }
      }
    })
    validation.test({ field1: '12345', field2: '123456789012345' })
    expect(validation.isValid).toBe(false)
    expect(hasError(validation.errors, errorMessage('maxLength', ['field2']))).toBe(true)
    expect(validation.errors).toHaveLength(1)
    expect(hasError(validation.fields.field2.errors, errorMessage('maxLength'))).toBe(true)
    expect(validation.fields.field2.errors).toHaveLength(1)
  })

  it('should handle shortcut methods', () => {
    const validation = v()
      .required()
      .rule('object', object, 'object')
      .addField('field1', v().rule('maxLength', maxLength(10)))
      .addFields({
        field2: v().maxLength(10).msg('maxLength msg')
      })

    const value = { field1: '12345', field2: '123456789012345' }
    validation.test(value)
    expect(validation.isValid).toBe(false)
    expect(hasError(validation.errors, errorMessage('maxLength', ['field2'], 'maxLength msg'))).toBe(true)
    expect(validation.errors).toHaveLength(1)
    expect(hasError(validation.fields.field2.errors, errorMessage('maxLength', [], 'maxLength msg'))).toBe(true)
    expect(validation.fields.field2.errors).toHaveLength(1)
    expect(validation.get(value, ['field2']).errors).toHaveLength(1)
  })

  it('should validate deep internal fields only if previous level is present', () => {
    const validation = v().addField(
      'attribute',
      v().required().addField('label', v().required())
    )
    validation.test(null)
    expect(validation.errors).toHaveLength(0)
    expect(validation.isValid).toBe(true)

    validation.test({})
    expect(validation.isValid).toBe(false)
    expect(validation.fields.attribute.isValid).toBe(false)
    expect(validation.fields.attribute.fields.label.isValid).toBe(true)

    const value = { attribute: {} }
    validation.test(value)
    expect(validation.isValid).toBe(false)
    expect(!hasError(validation.fields.attribute.errors, errorMessage('required'))).toBe(true)
    expect(hasError(validation.fields.attribute.fields.label.errors, errorMessage('required'))).toBe(true)
    expect(hasError(validation.get(value, ['attribute', 'label']).errors, errorMessage('required'))).toBe(true)
    expect(hasError(validation.errors, errorMessage('required', ['attribute', 'label']))).toBe(true)
  })

  it('should validate complex fields', () => {
    const validation = v()
      .addFields({
        type: v()
          .required()
          .inList(['RESOURCE', 'BASE', 'INDICATOR']),
        label: v()
          .required()
          .pattern(/^[a-z][a-zA-Z0-9]*$/)
      })
      .addField('person', v()
        .addFields({
          firstName: v()
            .required()
            .minLength(2),
          lastName: v()
            .required()
            .minLength(2),
          birthDate: v()
            .dateTime()
        }))

    validation.test({
      type: 'BASE',
      label: 'someVariable',
      person: {
        firstName: 'Johnny',
        lastName: 'Mnemonic',
        birthDate: '1973-01-20'
      }
    })
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('should validate parent validations through child tests', () => {
    const validation = v().addField('type', v().required())
    validation.fields.type.test(null)
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toHaveLength(1)

    validation.fields.type.test('someType')
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('can be split in children', () => {
    const validation = v({
      children: {
        zero: v()
      }
    })
      .addChild('first', v().addField('type', v().required()))
      .addChildren({
        second: v().addField('label', v().required())
      })

    validation.test({
      type: 'BASE',
      label: 'someVariable'
    })
    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
    expect(validation.children.zero.isValid).toBe(true)
    expect(validation.children.first.isValid).toBe(true)
    expect(validation.children.second.isValid).toBe(true)

    validation.test({
      type: 'BASE'
    })
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toHaveLength(1)
    expect(validation.children.first.isValid).toBe(true)
    expect(validation.children.second.isValid).toBe(false)
    expect(hasError(validation.children.second.errors, errorMessage('required', ['label']))).toBe(true)
    expect(hasError(validation.errors, errorMessage('required', ['label']))).toBe(true)
  })

  it('should clear parent child errors, when childs tested', () => {
    const validation = v().addChild('child', v().addField('field1', v().addField('field2', v().required())))

    validation.test({ field1: { field2: null } })
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toHaveLength(1)
    expect(validation.children.child.isValid).toBe(false)
    expect(validation.children.child.errors).toHaveLength(1)
    expect(validation.children.child.fields.field1.isValid).toBe(false)
    expect(validation.children.child.fields.field1.errors).toHaveLength(1)
    expect(validation.children.child.fields.field1.fields.field2.isValid).toBe(false)
    expect(validation.children.child.fields.field1.fields.field2.errors).toHaveLength(1)

    validation.children.child.fields.field1.test({ field2: 'value' })
    expect(validation.children.child.fields.field1.isValid).toBe(true)
    expect(validation.children.child.fields.field1.errors).toHaveLength(0)

    expect(validation.isValid).toBe(true)
    expect(validation.errors).toHaveLength(0)
    expect(validation.children.child.isValid).toBe(true)
    expect(validation.children.child.errors).toHaveLength(0)
    expect(validation.children.child.fields.field1.fields.field2.isValid).toBe(true)
    expect(validation.children.child.fields.field1.fields.field2.errors).toHaveLength(0)
  })

  it('rule enabling', () => {
    const validation = v().addField('field1', v().required().ruleEnabled(false))
    validation.test({})
    expect(validation.isValid).toBe(true)
  })

  it('rule enabling fn', () => {
    const validation = v().addField('field1', v().addField('field2', v().min(10).ruleEnabled((val: any, path) => {
      return !(path[0] === 'field1' && path[1] === 'field2' && val === 5)
    })))
    const data = { field1: { field2: 5, skipValidation: false } }
    validation.test(data)
    expect(validation.isValid).toBe(true)
    validation.fields.field1.test(data.field1)
    expect(validation.fields.field1.isValid).toBe(true)
  })

  it('validator enabling', () => {
    const validation = v().addField('field1', v().required()).enabled(false)
    validation.test({})
    expect(validation.isValid).toBe(true)
  })

  it('validator enabling fn', () => {
    const validation = v().addField('field1', v().addField('field2', v().min(10)).enabled((val: any, path) => {
      return !(path[0] === 'field1' && val.skipValidation === true)
    }))
    const data = { field1: { field2: 5, skipValidation: true } }
    validation.test(data)
    expect(validation.isValid).toBe(true)
    validation.fields.field1.test(data.field1)
    expect(validation.fields.field1.isValid).toBe(true)
  })

  it('should invalidate complex fields', () => {
    const validation = v()
      .addField('type', v()
        .required()
        .inList(['RESOURCE', 'BASE', 'INDICATOR']))
      .addField('label', v()
        .required()
        .pattern(/^[a-z][a-zA-Z0-9]*$/))
      .addField('person', v()
        .addField('firstName', v()
          .required()
          .minLength(2))
        .addField('lastName', v()
          .required()
          .minLength(2))
        .addField('birthDate', v()
          .dateTime()))

    validation.test({
      type: ' BASE',
      label: 'SomeClass',
      person: {
        firstName: 'o',
        lastName: 'a',
        birthDate: '1973-101-2'
      }
    })
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toHaveLength(5)
    expect(hasError(validation.errors, errorMessage('inList', ['type']))).toBe(true)
    expect(hasError(validation.errors, errorMessage('pattern', ['label']))).toBe(true)
    expect(hasError(validation.errors, errorMessage('minLength', ['person', 'firstName']))).toBe(true)
    expect(hasError(validation.errors, errorMessage('minLength', ['person', 'lastName']))).toBe(true)
    expect(hasError(validation.errors, errorMessage('dateTime', ['person', 'birthDate']))).toBe(true)
  })

  it('maxTimesInList', () => {
    const validation = v().maxTimesInList([0, 1, 2], 0)
    expect(validation.test(null)).toBe(true)
    expect(validation.test(2)).toBe(false)
  })

  it('every', () => {
    const validation = v().addEvery(() => v().min(1))
    expect(() => validation.getEvery(10)).not.toThrow()
    validation.test([1, 2, 3])
    expect(validation.isValid).toBe(true)
    expect(() => validation.getEvery(10)).not.toThrow()
    validation.test([1, 2, 0])
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toHaveLength(1)
    expect(hasError(validation.errors, errorMessage('min', [2]))).toBe(true)
    validation.test([])
    expect(validation.isValid).toBe(true)
    validation.test(undefined)
    expect(validation.isValid).toBe(true)
    validation.test({ one: 1, two: 2, three: 3 })
    expect(validation.isValid).toBe(true)
    validation.test({ one: 0, two: -1, three: 3 })
    expect(validation.isValid).toBe(false)
    expect(validation.errors).toHaveLength(2)
    expect(hasError(validation.errors, errorMessage('min', ['one']))).toBe(true)
    expect(hasError(validation.errors, errorMessage('min', ['two']))).toBe(true)

    const validator2 = v().addEvery(() => v().addField('attr', v().required()))
    validator2.test([{ attr: 'asd' }, { attr: 'asd' }])
    expect(validator2.isValid).toBe(true)
    const arr = [{ attr: 'asd' }, { attr: null }]
    validator2.test(arr)
    expect(validator2.isValid).toBe(false)
    expect(validator2.getEvery(0).fields.attr.isValid).toBe(true)
    expect(validator2.getEvery(1).fields.attr.isValid).toBe(false)
    expect(validator2.get(arr, [1, 'attr']).isValid).toBe(false)
  })

  it('every by key', () => {
    const validator1 = v().addEvery(() => v().addField('attr', v().required()), 'id')
    validator1.test([{ id: 11, attr: 'asd' }, { id: 22, attr: 'asd' }])
    expect(validator1.isValid).toBe(true)
    const validator2 = v().addEvery(() => v().addField('attr', v().required()), (item) => item.id)
    const arr = [{ id: 22, attr: 'asd' }, { id: 11, attr: null }]
    validator2.test(arr)
    expect(validator2.isValid).toBe(false)
    expect(validator2.getEvery(22).fields.attr.isValid).toBe(true)
    expect(validator2.getEvery(11).fields.attr.isValid).toBe(false)
    expect(validator2.get(arr, [11, 'attr']).isValid).toBe(false)
  })

  it('every resort items', () => {
    const validator = v().addEvery(() => v().addField('attr', v().required()))
    const arr = [{ attr: null }, { attr: 'asd' }]
    validator.test(arr)
    expect(validator.getEvery(0).fields.attr.isValid).toBe(false)
    arr.splice(0, 1)
    validator.test(arr)
    expect(validator.getEvery(0).fields.attr.isValid).toBe(true)
    expect(validator.isValid).toBe(true)
  })

  it('every resort rules update', () => {
    const validator = v().addEvery(() => v().addField('attr', v().required()).enabled((val: any, path) => {
      return val.skipValidation !== true
    }))
    const arr = [{ attr: 'asd' }, { attr: null, skipValidation: true }]
    validator.test(arr)
    expect(validator.isValid).toBe(true)
    arr.splice(0, 1)
    validator.test(arr)
    expect(validator.getEvery(0).fields.attr.isValid).toBe(true)
    expect(validator.isValid).toBe(true)
  })

  it('maxTimesInList subarrays', () => {
    const data = {
      arr1: [{
        arr2: [{ id: 1 }, { id: 2 }, { id: 4 }]
      }, {
        arr2: [{ id: 5 }, { id: 6 }, { id: 1 }]
      }]
    }

    const getAllValues = () => {
      const values: {id: number}[] = []
      data.arr1.forEach((item) => {
        item.arr2.forEach((element) => {
          values.push(element)
        })
      })
      return values
    }

    const msg = 'element should be globally unique'

    const validation = v()
      .addField('arr1', v().addEvery(() => v()
        .addField('arr2', v().addEvery(() => v().maxTimesInList(getAllValues, 1).msg(msg)))))

    validation.test(data)
    expect(validation.isValid).toBe(false)
    expect(hasError(validation.errors, errorMessage('maxTimesInList', ['arr1', 0, 'arr2', 0], msg))).toBe(true)
    expect(hasError(validation.errors, errorMessage('maxTimesInList', ['arr1', 1, 'arr2', 2], msg))).toBe(true)
    expect(hasError(validation.fields.arr1.getEvery(0).fields.arr2.getEvery(0)!.errors, errorMessage('maxTimesInList', [], msg))).toBe(true)
  })

  it('some', () => {
    const validation = v().addSome(() => v().min(1))
    validation.test([0, 0, -100])
    expect(validation.isValid).toBe(false)
    expect(hasError(validation.errors, errorMessage('min', [0]))).toBe(true)
    expect(hasError(validation.errors, errorMessage('min', [1]))).toBe(true)
    expect(hasError(validation.errors, errorMessage('min', [2]))).toBe(true)
    validation.test([10, 0, -100])
    expect(validation.isValid).toBe(true)
    validation.test([])
    expect(validation.isValid).toBe(false)
    validation.test(null)
    expect(validation.isValid).toBe(true)
    validation.test({ one: 0, two: 0, three: -100 })
    expect(validation.isValid).toBe(false)
    validation.test({ one: 0, two: 10, three: -100 })
    expect(validation.isValid).toBe(true)

    const validator2 = v().addSome(() => v().addField('attr', v().required()))
    validator2.test([{ attr: 'asd' }, {}])
    expect(validator2.isValid).toBe(true)
    validator2.test([{ attr: null }, { attr: null }])
    expect(validator2.isValid).toBe(false)
    expect(hasError(validator2.errors, errorMessage('required', [0, 'attr']))).toBe(true)
    expect(hasError(validator2.errors, errorMessage('required', [1, 'attr']))).toBe(true)
  })
})
