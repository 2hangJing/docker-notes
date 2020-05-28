<!--
 * @Author: monai
 * @Date: 2020-05-20 17:58:48
 * @LastEditors: monai
 * @LastEditTime: 2020-05-28 17:48:35
--> 
# CSFR 是什么？

CSFR 是跨站请求伪造攻击（Cross-site request forgery）的缩写。CSFR 攻击原理如下：
1. 用户登陆 a.com ，a.com 返回用户的登陆凭证 cookie。
2. 诱导用户进入 b.com ，b.com 直接跨域请求 a.com ，并携带 a.com 的 cookie。
3. a.com 误认为是用户自己操作，用户数据被修改、信息泄露。

因为浏览器发送请求会自动带上 cookie（ajax 需要单独设置） 所以可以通过 img form 标签去跨域请求，如果被攻击的网站没有相关防御那么这条攻击请求就会被认为是用户自己操作的。

## CSRF 类型

根据伪造的请求类型进行分类，可以分为如下几类：
### GET类型
1. 通过 img 标签中的 src 施行 GET 请求。
```html
<img src='http://wwww.a.com/user/score?to=xiaoming&count=10000'>
```
2. 通过 a 标签中 href 施行 GET 请求。
```html
<a href='http://wwww.a.com/user/score?to=xiaoming&count=10000'>免费会员</a>
```
通过 a 标签的攻击需要用户点击所以比较少，没有直接通过 img 标签攻击方便。

### POST
通过内嵌在页面中的 form 表单来实施攻击。
```html
<form method="POST" action="http://wwww.a.com/user/score">
    <input type="hidden" name="count" value="5000"/>
    <input type="hidden" name="to" value="xiaoming"/>
</form>
<script> 
    document.forms[0].submit();
</script>
```

## CSRF 特点
1. 发出攻击的是第三方网站。
2. 利用浏览器发送请求自带目标网站的 cookie 特性，只能伪造用户请求，无法真正获取用户登陆凭证与信息。

## CSFR 预防
CSFR 预防主要有一下几种：
1. 利用 token 模式，登陆凭证从 cookie 切换到 token ，因为 CSRF 是利用浏览器自动携带 cookie 请求的原理，那么换成 token 模式后自然解决了 CSRF 问题，但是此处注意 XSS 攻击。
2. 后台 API 中校验请求头中的 Origin\Referer 字段，但是这两个字段都有一定的漏洞所以不太推荐。
3. 双重 cookie ，登陆凭证依旧使用 cookie ，但是每次请求时带上 cookie 字段。后端则是校验请求头中的 cookie 并且校验携带的参数中的 cookie 字段，原因是利用了 CSRF 无法获取到 cookie 只能利用浏览器自动携带的原理，同 1。


