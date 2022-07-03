const express = require('express');
const proxy = require('http-proxy-middleware').createProxyMiddleware;
const app = express();
var options = {
    target: 'https://api-test-h5.micoworld.net', // 目标服务器 host
    changeOrigin: true,               // 默认false，是否需要改变原始主机头为目标URL
    pathRewrite: {
        '^/PROXY_UPLOAD' : '',     // 重写请求，比如我们源访问的是api/old-path，那么请求会被解析为/api/new-path
    },
    logLevel: 'info'
};
app.all('*', function (req, res, next) {
	//设置允许跨域的域名，*代表允许任意域名跨域
	res.header('Access-Control-Allow-Origin', '*');
	//允许的header类型
	res.header('Access-Control-Allow-Headers', 'content-type,key');
	//跨域允许的请求方式 
	res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS');
	if (req.method == 'OPTIONS')
		res.sendStatus(200); //让options尝试请求快速结束
	else
		next();
});
app.use('/PROXY_UPLOAD', proxy(options));
app.get('/test', (req, res)=>{
    res.send('OK')
});
app.listen(9000, ()=> console.log( '> server listen: 9000' ));






