/*
 * @Author: monai
 * @Date: 2022-04-28 16:25:22
 * @LastEditors: monai
 * @LastEditTime: 2022-04-29 18:20:31
 */
// 元组转换为对象
// const 断言: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
const tuple1 = ['tesla', 'model 3', 'model X', 'model Y'] as const;

type TupleToObject<T extends readonly string[]> = {
  [P in T[number]]:P
};
let result1: TupleToObject<typeof tuple1>;

// 返回数组第一个元素类型
type FirstArrType<T extends readonly any[]> = T extends readonly [infer FirstType, ...infer Other]? FirstType: unknown;
let tuple2 = [1, '2', false] as const;
let result2: FirstArrType<typeof tuple2>;

// 获取元组长度
type GetLength<T extends readonly any[]> = T['length'];
let tuple3 = [1, '2', false] as const;
let result3: GetLength<typeof tuple3> = 3;

// 类型中 if else
type TypeIf<B extends boolean, T, F> = B extends true? T: F;
let result4: TypeIf<true, 'true', 'false'>;

// 类型 concat 
type TypeConcat<T extends any[], U extends any[]> = [...T, ...U];
let result5: TypeConcat<[1,2,3], [4,5,6]>;

// 类型 includes 
type Includes<T extends any[], U> = {
    [K in T[number]]: true
}[U] extends true ? true: false;
let result6: Includes<[1,2,3], 4>;


type Chainable<P = {}> = {
    option<K extends string, T>
    (
        key: K extends keyof P ? never : K,
        value: T
    ): Chainable<P & {[key in K]: T}>;
    get(): P;
};

declare const config: Chainable

const result = config
  .option('foo', 123)
  .option('name', 'type-challenges')
  .option('bar', { value: 'Hello World' })
  .get()

// 期望 result 的类型是：
interface Result {
  foo: number
  name: string
  bar: {
    value: string
  }
}