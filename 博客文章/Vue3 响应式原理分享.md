<!--
 * @Author: monai
 * @Date: 2021-08-03 13:48:38
 * @LastEditors: monai
 * @LastEditTime: 2021-08-04 14:43:43
-->
# Vue3 响应式原理解析【第一期】

## 一、简介

Vue 的核心原理之一便是“响应式”，那么所谓的“响应式”到底是什么？由代码引出问题：
``` javascript
//  添加 响应式副作用
const reactUserInfo = reactive({ name: 'zhang3' }); 
// 立即输出 'zhang 3'
watchEffect(()=> console.log( reactUserInfo.name )) 
//  watchEffect 再次执行，输出： li 4
reactUserInfo.name = 'li 4'; 
```
看似“理所应当”的代码其实是 Vue “响应式” 提供了基础。 但是细想一下 `watchEffect` 这样一个函数是如何做到根据 `reactUserInfo.name` 变化而‘响应’的呢？

## 二、原理
### 1. Proxy 与 Object.defineProperty()
> `Proxy` 用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程”（meta programming），即对编程语言进行编程。  
> -- by【ECMAScript 6 入门】阮一峰

`Proxy` 与 `Object.defineProperty()` 优劣如下表格：

|     | 支持操作的种类（MDN 为准） | 是否支持捕获嵌套属性 | 劫持层面 | 是否支持捕获内置对象的操作方法（eg: push\unshift...） | 
|  ----  | ----  | ----  | ----  | ----  |
| Proxy  | 13种，getter\setter\delete\in\new ... | 不支持 | 整个对象 | 支持 |
| defineProperty  | 2种，getter\setter | 不支持 | 单一属性 | 不支持 |

### 2. 响应式基础
“响应式”的基础是由: `reactive、track、trigger、effect` 组成，由此扩展而来的API有：`watch、watchEffect、computed` 等等。

#### Ⅰ、reactive


