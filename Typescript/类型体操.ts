/*
 * @Author: monai
 * @Date: 2022-04-28 16:25:22
 * @LastEditors: monai
 * @LastEditTime: 2023-06-27 11:37:08
 */

// https://juejin.cn/post/6999280101556748295#heading-25


/********* 元组转换为对象 *********/ 
// const 断言: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions
const tuple1 = ['name', 'id'] as const;

type TupleToObject<T extends readonly string[]> = {
  [P in T[number]]:P
};
let result1: TupleToObject<typeof tuple1> = {name: 'name', id: 'id'};

/********* 返回数组第一个元素类型 *********/ 
type FirstArrType<T extends readonly any[]> = T extends readonly [infer FirstType, ...infer Other]? FirstType: unknown;
let tuple2 = [1, '2', false] as const;
let result2: FirstArrType<typeof tuple2>;

/********* 获取元组长度 *********/ 
type GetLength<T extends readonly any[]> = T['length'];
let tuple3 = [1, '2', false] as const;
let result3: GetLength<typeof tuple3> = 3;

/********* 类型中 if else *********/ 
type TypeIf<B extends boolean, T, F> = B extends true? T: F;
let result4: TypeIf<true, 'true', 'false'>;

/********* 类型 concat  *********/ 
const arr1 = [1,2,3] as const;
const arr2 = [4,5,6] as const;
type TypeConcat<T extends readonly any[], U extends readonly any[]> = [...T, ...U];
let result5: TypeConcat<typeof arr1, typeof arr2>;

/********* 类型 includes  *********/ 
type Includes<T extends any[], U> = {
    [K in T[number]]: true
}[U] extends true ? true: false;
let result6: Includes<[1,2,3], 4>;

/********* 实现 omit *********/ 
type Test1 = {
	name: 'myOmit';
	num: number;
	id: 'test1';
};
type MyPick<T, K extends keyof T> = {
	[key in K]: T[key]
};
type MyExclude<T, U>= T extends U? never: T;
// 方法 1
// type MyOmit<T, E extends keyof T> = {
// 	[key in MyExclude<keyof T, E>]: T[key]
// };
// 方法 2
type MyOmit<T, E extends keyof T> = MyPick<T, MyExclude<keyof T, E>>;


/********* 实现一个 MyReadonly2<T, K>，它带有两种类型的参数T和K。 *********/
// K指定应设置为Readonly的T的属性集。如果未提供K，则应使所有属性都变为只读，如果提供了则指定 K 属性为只读。
type MyReadonly2<T, K extends keyof T = keyof T> = {
	readonly [key in keyof T as key extends K? K: never]: T[key]
} & {
	[key in keyof T as key extends K? never: key]: T[key]
};


/********* 深度 Readonly *********/
type IsObject<T> = keyof T extends never? false: true;
type DeepReadonly<T> = {
	readonly [key in keyof T]: IsObject<T[key]> extends true? DeepReadonly<T[key]> : T[key];
}
// type f = DeepReadonly<{a: number; b: { c: number;}}>;
// let ff: f = {
// 	a: 10,
// 	b: {
// 		c: 50
// 	}
// }

/********* 元组转 value 联合类型 *********/
type TupleToUnion<T extends any[]> = T[number];

/********* 期望 result 的类型是： *********/
interface Result {
	foo: number
	name: string
	bar: {
		value: string
	}
};
type Chainable<P = {}> = {
    option<K extends string, T>(
		key: K extends keyof P ? never : K,
		value: T
    ): Chainable<P & {[key in K]: T}>;
    get(): P;
};
// const config: Chainable
// const result = config
// .option('foo', 123)
// .option('name', 'type-challenges')
// .option('bar', { value: 'Hello World' })
// .get();

/********* 获取最后一个类型 *********/
type LastType<T extends any[]> = T extends [...infer O, infer K] ? K: never; 

/********* 获取第一个类型 *********/
type FirstType<T extends any[]> = T extends [infer F, ...infer O] ? O: never; 
// type s = FirstType<[1,2,4,6]>

/********* 剔除左边、右边空格 *********/
type TrimLeft<S extends string> = S extends ` ${infer R}` ? TrimLeft<R> : S;
type TrimRight<S extends string> = S extends `${infer R} ` ? TrimRight<R> : S;

/********* 剔除两边空格 *********/
type Trim<S extends string> = TrimRight<TrimLeft<S>>;
type trimed = Trim<'  Hello World  '>;

/********* 首字母大写 *********/
type MyCapitalize<S extends string> = S extends `${infer F}${infer O}`? Uppercase<F>: never;
// typescript 4+ 内置方法
// type Capitalize<S>

/********* 替换 Replace *********/
type Replace<
	S extends string, 
	F extends string, 
	T extends string
> = S extends ''? '': 
	S extends `${infer SL}${F}${infer SR}`? `${SL}${T}${SR}`: `No Match`;

// type SS = Replace<'aabbcc', 'b', 'B'>;

/********* 全局替换 Replace *********/
type ReplaceAll<
	S extends string, 
	F extends string, 
	T extends string
> = S extends ''? '': 
	S extends `${infer SL}${F}${infer SR}`? ReplaceAll<`${SL}${T}${SR}`, F, T>: S;
// type SS = ReplaceAll<'aabbcc', 'b', 'B'>;


/********* join *********/
type Join<
	A extends (string | number | boolean | bigint)[], 
	S extends string, 
	R extends string = ''
> = A extends [] ? R: Join<
	A extends [infer F, ...infer O]? O: [], 
	S, 
	R extends ''? `${A[0]}`: `${R}${S}${A[0]}`
>;

// type Join<
// 	A extends (string | number | boolean | bigint)[], 
// 	S extends string
// > = A extends [] ? '':
// 	A extends [string | number | boolean | bigint] ? `${A[0]}`: `${A[0]}${S}${Join<A extends [infer F, ...infer O]? O: [], S>}`;
// type s = Join<['First',2,true,4], '-'>;


/********* Split *********/
// type Split<
// 	S extends string, 
// 	F extends string, 
// 	A extends string[] = []
// > = S extends '' ? A:
// 	S extends `${infer First}${F}${infer O}` ? Split<O, F, [...A, First]>: [...A, S]; 

type Split<S extends string, F extends string, > = 
	S extends '' ? []: 
	S extends `${infer First}${F}${infer O}` ? [First, ...Split<O, F>]: [S]; 

// type s = Split<'1,2,', ','>;


/********* String length 计算字符串的长度 *********/
// 利用 split 处理
// type LengthOfString<S extends string> = Split<S, ''>['length'];

type LengthOfString<S extends string, T extends any[] = []> = S extends `${infer F}${infer O}`? LengthOfString<O, [F, ...T]> : T['length'];
// let s: LengthOfString<'123'> = 3


/********* Flatten 数组扁平化 *********/
type Flatten<A extends any[]|unknown> = 
	A extends any[] ? (A extends [infer F, ...infer O] ? [...Flatten<F>, ...Flatten<O>]: A) : [A];
// let s: Flatten<[1,2,[3,4, [5, 6]]]>

/********* Append to object 实现一种向接口添加新字段的类型 *********/
type AppendToObject<
	O extends object, 
	K extends string, 
	V extends unknown
> = O & {
	[key in K]: V
};
// type s = AppendToObject<{id: 10}, 'name', 'ZJ'>;


/********* [1,2] [3,4] => [[1,3], [2,4]] *********/
type Zip<
	A extends readonly unknown[],
	B extends readonly unknown[],
	R extends unknown[] = []
> = A extends [] ? R : Zip<
	A extends readonly [infer F1, ...infer Other1] ? Other1: [],
	B extends readonly [infer F1, ...infer Other1] ? Other1: [],
	[...R, [A[0], B[0]]]
>;

type s = Zip<[1,2], [3,4]>;

// 函数类型
function zip<A extends readonly unknown[], B extends readonly unknown[]>(arrA: A, arrB: B): Zip<A, B>;
// 函数实现（利用函数重载，在函数声明时避免直接使用 zip 类型导致报错）
function zip(arrA: unknown[], arrB: unknown[]){
	if(arrA.length === 0) return [];
	const [oneA, ...otherA] = arrA;
	const [oneB, ...otherB] = arrB;
	return [[oneA, oneB], ...zip(otherA, otherB)];
}

// function zip<A extends readonly unknown[], B extends readonly unknown[]>(arrA: A, arrB: B): Zip<A, B>{
// 	if(arrA.length === 0) return [];
// 	const [oneA, ...otherA] = arrA;
// 	const [oneB, ...otherB] = arrB;
// 	return [[oneA, oneB], ...zip(otherA, otherB)];
// }

// 需要使用 const 断言，将类型 [number, number] => [1,2]
let s = zip(<const>[1, 2], <const>[3, 4]);