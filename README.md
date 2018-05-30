# simple-scroll
移动端上拉加载更多<br>  
![](https://github.com/luomiaow/simple-scroll/raw/master/img/demo.gif) <br>
1.原生js，支持vue，不依赖第三方库。<br>
2.兼容android、ios<br>
#### 快速开始

1.引用 simpleScroll.css 和 simpleScroll.js(可通过import引入);<br>
2.html布局<br>
```
<div class="simple-scroll" id="scrollWrap">
    <div id="content">
        //内容数据
    </div>
</div>
```
3.创建simpleScroll对象<br>
```
var simpleScrill = new SimpleScroll("scrollWrap", {
        //第一个参数scrollWrap滚动区域ID，如果滚动区为body可以传''或body
        callback: getDataCallback,//上拉回调函数
    });
```
4.回调
```
function getDataCallback() {
			$.ajax({
				url: 'xxxxxx',
				success: function(data) {
					//设置数据
					//setXxxx(data);//自行实现
          //根据请求结果调用simpleScrill.controlState方法控制加载状态可接受参数1.'load'显示加载loading 2.'complete'加载完成 3.'empty'显示结果为空
          simpleScrill.controlState('load')//显示加载loading
				},
				error: function(data) {
					//请求失败自行处理
				}
			});
		}
```
5.new SimpleScroll 可配置参数
```
    callback：上拉回调函数
    auto:是否在初始化完毕之后自动执行一次下拉刷新的回调 callback,默认值true
    offset:滚动条距离底部小于offset触发下拉加载回调默认值100
    htmlLoading:loading的html默认值'<p class="upwarp-progress mescroll-rotate"></p><p class="upwarp-tip">加载中..</p>'
    htmlNodata: 加载到底的布局默认值'<p class="upwarp-nodata">-- END --</p>', 
    htmlEmpty：结果为空布局默认值'<img src="./img/totop.png" alt="">'
    htmlToTop：回到顶部布局默认值'<p class="upwrap-empty"><img class="empty-icon" src="./img/empty.png"/><p class="empty-text">没找到相关数据~</p></p>',
    onScroll：滚动条位置监听type:function,
    bounce:是否禁止ios bounce(默认值true-DIV滚动时可解决iOS的微信,QQ,Safari等浏览器, 列表顶部下拉和底部上拉露出浏览器灰色背景, 卡顿2秒问题)
    topBtn:true,是否增加回到顶部按钮功能
    offset: 1000, //列表滚动多少距离才显示回到顶部按钮,默认1000
```  
    
