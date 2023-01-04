### 参考
<https://ts.yayujs.com/handbook/TemplateLiteralTypes.html#%E6%A8%A1%E6%9D%BF%E5%AD%97%E9%9D%A2%E9%87%8F%E7%B1%BB%E5%9E%8B-template-literal-types>
**重要：https://github.com/microsoft/TypeScript/pull/40336**


```typescript

type f = Uppercase<'Hello World'>;


// type PropEventSource<Type> = {
//     on<Key extends string & keyof Type>(eventName: `${Key}Changed`, callback: (newValue: Type[Key]) => void ): void;
// };
// declare function makeWatchedObject<Type extends object>(obj: Type): Type & PropEventSource<Type>;

// const person = makeWatchedObject({
//   firstName: "Saoirse",
//   lastName: "Ronan",
//   age: 26
// });

type MakeWatchedObject<T extends object> = (obj: T)=> T & {
	on<K extends Extract<keyof T, string>>(eventName: `${K}Changed`, callBack: (newValue: T[K])=> void): void;
};
let obj = {
	firstName: "Saoirse",
	lastName: "Ronan",
	age: 26
};
let makeWatchedObject: MakeWatchedObject<typeof obj> = arg =>{
	let o = {
		on: a =>{

		}
	}
	return Object.assign(o, arg);
}

makeWatchedObject(obj).on('ageChanged', (newValue: number)=>{
	
})

```