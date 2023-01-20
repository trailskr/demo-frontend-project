import { isNumber } from '@/utils/typecheck'

export class Point2D {
  public readonly x: number
  public readonly y: number

  constructor (x: number, y: number) {
    this.x = x
    this.y = y
  }

  public static distance (p1: Point2D, p2: Point2D): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)
  }

  public get length (): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  public mul (val: number | Point2D) {
    return isNumber(val)
      ? new Point2D(this.x * val, this.y * val)
      : new Point2D(this.x * val.x, this.y * val.y)
  }

  public div (val: number | Point2D) {
    return isNumber(val)
      ? new Point2D(this.x / val, this.y / val)
      : new Point2D(this.x / val.x, this.y / val.y)
  }

  public add (val: number | Point2D) {
    return isNumber(val)
      ? new Point2D(this.x + val, this.y + val)
      : new Point2D(this.x + val.x, this.y + val.y)
  }

  public sub (val: number | Point2D) {
    return isNumber(val)
      ? new Point2D(this.x - val, this.y - val)
      : new Point2D(this.x - val.x, this.y - val.y)
  }

  public map (mapper: (a: number) => number) {
    return new Point2D(mapper(this.x), mapper(this.y))
  }

  public aspect (): number {
    return this.x / this.y
  }

  public distanceTo (point: Point2D) {
    return Point2D.distance(this, point)
  }

  public clone () {
    return new Point2D(this.x, this.y)
  }

  public toString () {
    return `{x: ${Math.round(this.x * 1000) / 1000}, y: ${Math.round(this.y * 1000) / 1000}}`
  }

  public isEqual (p2: Point2D): boolean {
    return this.x === p2.x && this.y === p2.y
  }
}
