import { describe, expect, it } from 'vitest'

import { inList, notInList, integer, max, min, number, pattern, required, string, length, dateTime, minLength, maxLength, notEquals, equals, maxDateTime, minDateTime, object, objectLike, array, maxTimesInList } from '@/utils/validators'

describe('validation', () => {
  it('required', () => {
    expect(required('')).toBe(false)
    expect(required(' ')).toBe(false)
    expect(required(null)).toBe(false)
    expect(required(undefined)).toBe(false)
    expect(required(0)).toBe(true)
    expect(required(false)).toBe(true)
    expect(required({})).toBe(true)
    expect(required([])).toBe(true)
  })

  it('number', () => {
    expect(number('0')).toBe(false)
    expect(number('1')).toBe(false)
    expect(number(null)).toBe(true)
    expect(number(undefined)).toBe(true)
    expect(number(1.123)).toBe(true)
    expect(number(0)).toBe(true)
    expect(number({})).toBe(false)
    expect(number([])).toBe(false)
  })

  it('string', () => {
    expect(string(0)).toBe(false)
    expect(string('')).toBe(true)
    expect(string(null)).toBe(true)
    expect(string(undefined)).toBe(true)
    expect(string(new Date())).toBe(false)
    expect(string('string one')).toBe(true)
    expect(string({})).toBe(false)
    expect(string([])).toBe(false)
  })

  it('integer', () => {
    expect(integer('0')).toBe(false)
    expect(integer('1')).toBe(false)
    expect(integer(null)).toBe(true)
    expect(integer(undefined)).toBe(true)
    expect(integer(1.123)).toBe(false)
    expect(integer(NaN)).toBe(false)
    expect(integer(1233521436435764)).toBe(false)
    expect(integer(1)).toBe(true)
    expect(integer(0)).toBe(true)
  })

  it('objectLike', () => {
    expect(objectLike('1')).toBe(false)
    expect(objectLike(null)).toBe(true)
    expect(objectLike(undefined)).toBe(true)
    expect(objectLike(1.123)).toBe(false)
    expect(objectLike(NaN)).toBe(false)
    expect(objectLike({})).toBe(true)
    expect(objectLike([])).toBe(true)
    expect(objectLike(new Date())).toBe(true)
  })

  it('object', () => {
    expect(object('1')).toBe(false)
    expect(object(null)).toBe(true)
    expect(object(undefined)).toBe(true)
    expect(object(1.123)).toBe(false)
    expect(object(NaN)).toBe(false)
    expect(object({})).toBe(true)
    expect(object([])).toBe(false)
  })

  it('array', () => {
    expect(array('1')).toBe(false)
    expect(array(null)).toBe(true)
    expect(array(undefined)).toBe(true)
    expect(array(1.123)).toBe(false)
    expect(array(NaN)).toBe(false)
    expect(array({})).toBe(false)
    expect(array([])).toBe(true)
  })

  it('dateTime', () => {
    expect(dateTime((new Date()).toString())).toBe(true)
    expect(dateTime('1987-07-19T12:30:50')).toBe(true)
    expect(dateTime('1987-07-19T12:30:50Z')).toBe(true)
    expect(dateTime('1987-07-19T12:30:50+10:00')).toBe(true)
    expect(dateTime('1987-14-19T12:30Z')).toBe(false)
    expect(dateTime('1987-07-19T12:30:12.124Z')).toBe(true)
    expect(dateTime('1987-07-19T12:30:12.124+10:00')).toBe(true)
  })

  it('length', () => {
    expect(length(5)('')).toBe(true)
    expect(length(5)('1')).toBe(false)
    expect(length(5)('12345')).toBe(true)
    expect(length(5)('123456')).toBe(false)
    expect(length(0)([])).toBe(true)
    expect(length(5)([1, 2, 3, 4])).toBe(false)
    expect(length(5)([1, 2, 3, 4, 5])).toBe(true)
  })

  it('minLength', () => {
    expect(minLength(5)('')).toBe(true)
    expect(minLength(5)('1')).toBe(false)
    expect(minLength(5)('12345')).toBe(true)
    expect(minLength(5)('1234567890')).toBe(true)
    expect(minLength(0)([])).toBe(true)
    expect(minLength(5)([])).toBe(false)
    expect(minLength(5)([1, 2, 3, 4])).toBe(false)
    expect(minLength(5)([1, 2, 3, 4, 5])).toBe(true)
  })

  it('maxLength', () => {
    expect(maxLength(5)('')).toBe(true)
    expect(maxLength(5)('1')).toBe(true)
    expect(maxLength(5)('12345')).toBe(true)
    expect(maxLength(5)('123456')).toBe(false)
    expect(maxLength(0)([])).toBe(true)
    expect(maxLength(5)([])).toBe(true)
    expect(maxLength(5)([1, 2, 3, 4, 5])).toBe(true)
    expect(maxLength(5)([1, 2, 3, 4, 5, 6])).toBe(false)
  })

  it('equals', () => {
    expect(equals(5)(null)).toBe(true)
    expect(equals(5)(1)).toBe(false)
    expect(equals(5)(5)).toBe(true)
    expect(equals('5')('asd')).toBe(false)
    expect(equals('asd')('asd')).toBe(true)
    expect(equals(null)(null)).toBe(true)
    expect(equals(undefined)(undefined)).toBe(true)
    expect(equals(undefined)(false)).toBe(false)
    expect(equals(undefined)(null)).toBe(false)
    expect(equals(null)(undefined)).toBe(false)
    expect(equals({ a: 'b' })({ a: 'b' })).toBe(true)
    expect(equals({ a: 'b' })({ a: 'c' })).toBe(false)
  })

  it('notEquals', () => {
    expect(notEquals(5)(null)).toBe(true)
    expect(notEquals(5)(1)).toBe(true)
    expect(notEquals(5)(5)).toBe(false)
    expect(notEquals('5')('asd')).toBe(true)
    expect(notEquals('asd')('asd')).toBe(false)
    expect(notEquals(null)(null)).toBe(false)
    expect(notEquals(undefined)(undefined)).toBe(false)
    expect(notEquals(undefined)(false)).toBe(true)
    expect(notEquals(undefined)(null)).toBe(true)
    expect(notEquals(null)(undefined)).toBe(true)
    expect(notEquals({ a: 'b' })({ a: 'b' })).toBe(false)
    expect(notEquals({ a: 'b' })({ a: 'c' })).toBe(true)
  })

  it('min', () => {
    expect(min(5)(null)).toBe(true)
    expect(min(1)(5)).toBe(true)
    expect(min(5)(5)).toBe(true)
    expect(min(6)(5)).toBe(false)
  })

  it('max', () => {
    expect(max(5)(null)).toBe(true)
    expect(max(5)(4)).toBe(true)
    expect(max(5)(5)).toBe(true)
    expect(max(5)(6)).toBe(false)
  })

  it('maxDateTime', () => {
    expect(maxDateTime('2018-02-15')(null)).toBe(true)
    expect(maxDateTime('2018-01-15')('2018-02-15')).toBe(false)
    expect(maxDateTime('2018-11-15')('2018-02-15')).toBe(true)
  })

  it('minDateTime', () => {
    expect(minDateTime('2018-02-15')(null)).toBe(true)
    expect(minDateTime('2018-02-15')('2018-01-15')).toBe(false)
    expect(minDateTime('2018-01-15')('2018-02-15')).toBe(true)
  })

  it('pattern', () => {
    expect(pattern(/a\d+/)(' a12309')).toBe(true)
    expect(pattern('a\\d+')(' a12309')).toBe(true)
    expect(pattern('^a\\d+')(' a12309')).toBe(false)
  })

  it('inList', () => {
    expect(inList([1, 2, 3])('asd')).toBe(false)
    expect(inList([1, 2, 3])('')).toBe(true)
    expect(inList([1, 2, 3])(3)).toBe(true)
    expect(inList(['111', 'asd', '113'])('asd')).toBe(true)
  })

  it('notInList', () => {
    expect(notInList([1, 2, 3])('asd')).toBe(true)
    expect(notInList([1, 2, 3])('')).toBe(true)
    expect(notInList([1, 2, 3])(3)).toBe(false)
    expect(notInList(['111', 'asd', '113'])('asd')).toBe(false)
  })

  it('maxTimesInList', () => {
    expect(maxTimesInList([1, 2, 3], 1)(null)).toBe(true)
    expect(maxTimesInList([1, 2, 3], 1)(4)).toBe(true)
    expect(maxTimesInList([1, 2, 3], 1)(2)).toBe(true)
    expect(maxTimesInList([1, 2, 3], 0)(2)).toBe(false)
    expect(maxTimesInList(['111', 'asd', '113'], 1)('113')).toBe(true)
    expect(maxTimesInList(['113', 'asd', '113'], 1)('113')).toBe(false)
    expect(maxTimesInList([{ id: 1 }, { id: 2 }, { id: 3 }], 1)({ id: 1 })).toBe(true)
    expect(maxTimesInList([{ id: 1 }, { id: 2 }, { id: 3 }], 1)({ id: 4 })).toBe(true)
    expect(maxTimesInList([{ id: 1 }, { id: 1 }, { id: 1 }], 3)({ id: 1 })).toBe(true)
    expect(maxTimesInList([{ id: 1 }, { id: 1 }, { id: 1 }], 2)({ id: 1 })).toBe(false)
  })
})
