/*!
 * SimpleScroll -- 简单的上拉加载插件
 * version 1.0.0
 * 2018-05-10
 */
(function (name,definition) {
    //检测上下文是否为AMD或CMD环境
   var hasDefine=typeof define==='function',
       //检测上下文是否为node环境
   hasExports=typeof module!=='undefined'&&module.exports;
   if(hasDefine){
       //AMD或CMD环境
       define(definition)
   }else if(hasExports){
       //普通node环境
       module.exports=definition()
   }else{
       //将执行结果挂载到window上
       this[name]=definition()
   }
})('SimpleScroll',function () {
    var SimpleScroll=function (scrollId,options) {
        var me=this;
        me.vision='1.0.0';
        me.options = options || {}; //配置
        me.isScrollBody=(!scrollId||scrollId=='body');//滚动区是否为body
        me.scrollDom=me.isScrollBody?document.body:me.getDomById(scrollId);//获取滚动dom
        me.hasNext=true;//上拉是否还有下一页
        if(!me.scrollDom) return
        var u=navigator.userAgent;//获取当期系统
        me.isIos=!!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //是否为ios设备
        me.isUpScrolling=false;//是否在执行上拉加载更多的回调


        //初始化上拉加载更多
        me.initUpScroll()
        //自动触发上拉加载,利用定时器原理等主线程走完在执行确保拿到所有数据
        setTimeout(function () {
            if(me.options.auto){
                me.controlState('load');
                me.options.callback()
            }
        },30)
    };
    SimpleScroll.prototype.initUpScroll=function(){
        var me=this;
        //初始化参数
        me.extendUpScroll(me.options)
        //在页面中加入上拉布局-放置加载中，加载内容为空，加载到底等内容
        me.upwarp = document.createElement("div");
        me.upwarp.className = 'mescroll-upwarp';
       if(me.options.auto) me.upwarp.innerHTML=me.options.htmlLoading;
        var upparent= me.scrollDom;
        upparent.appendChild(me.upwarp);
        //添加到顶部按钮
        if(me.options.topBtn){
            me.showTopBtn()
        }
        //滚动监听
        me.preScrollY = 0;
        this.scrollEvent=function () {
            var scrollTop=me.getScrollTop();
            //向上还是向下滚动
            var isUp=scrollTop-me.preScrollY>0;
            me.preScrollY =scrollTop
            if(!me.isUpScrolling&&isUp){
                if(me.hasNext){
                    var toBottom=me.getScrollHeight()-me.getClientHeight()-scrollTop;
                    if(toBottom<me.options.offset){
                        if(me.upwarp.innerHTML!=me.options.htmlLoading) me.controlState('load');//初始化完成后没有自动触发一次下拉加载
                        me.isUpScrolling=true;
                        me.options.callback&&me.options.callback();
                    }
                }
            }

            //显隐回顶部按钮
            if(me.options.topBtn){
                if(scrollTop>me.options.offset){
                    me.toTopDom.classList.remove('hideClass');
                    me.toTopDom.classList.add('showClass');
                }else{
                    me.toTopDom.classList.add('hideClass');
                    me.toTopDom.classList.remove('showClass');
                }
            }

            //滑动监听
            me.options.onScroll && me.options.onScroll(me, scrollTop);
        }
        if(this.isScrollBody){
            window.addEventListener('scroll',this.scrollEvent)
        }else{
            this.scrollDom.addEventListener('scroll',this.scrollEvent)
            //ios 解决div滚动到底卡死
            if(this.isIos&&this.options.bounce){

                this.touchstartEvent=function (e) {
                    //记录开始触摸位置
                    me.startPoint = me.getPoint(e);
                }

                this.touchmoveEvent=function (e) {
                    var scrollTop = me.getScrollTop(); //当前滚动条的距离
                    var curPoint = me.getPoint(e); //当前点
                    var moveY = curPoint.y - me.startPoint.y; //和起点比,移动的距离,大于0向下拉,小于0向上拉
                    if(moveY > 0) {
                        if(scrollTop <= 0&&e.cancelable && !e.defaultPrevented) e.preventDefault()
                    }else if(moveY < 0){
                        var scrollHeight = me.getScrollHeight(); //滚动内容的高度
                        var clientHeight = me.getClientHeight(); //滚动容器的高度
                        var toBottom = scrollHeight - clientHeight - scrollTop; //滚动条距离底部的距离
                        //如果在底部,则阻止浏览器默认事件
                        if(e.cancelable && !e.defaultPrevented && toBottom <= 0) {
                            e.preventDefault();
                        }
                    }
                }
                this.setBounce(false)
                this.scrollDom.addEventListener("touchstart", this.touchstartEvent);
                this.scrollDom.addEventListener("touchmove", this.touchmoveEvent);
            }
        }
    };
    //配置下拉加载参数
    SimpleScroll.prototype.extendUpScroll=function(optUp){
        this.extend(optUp,{
            auto: true,//初始化完成后是否自动触发一次下拉加载
            callback:null,//下拉加载更多回调函数
            noMoreSize:5,//数据总条数少于此条数时不显示加载到底提示
            offset:100,//滚动条距离底部小于offset触发下拉加载回调
            htmlLoading: '<p class="upwarp-progress mescroll-rotate"></p><p class="upwarp-tip">加载中..</p>', //上拉加载中的布局
            htmlNodata: '<p class="upwarp-nodata">-- END --</p>', //加载到底的布局
            htmlEmpty:'<p class="upwrap-empty"><img class="empty-icon" src="./img/empty.png"/><p class="empty-text">没找到相关数据~</p></p>',
            htmlToTop:'<img src="./img/totop.png" alt="">',//回到顶部
            onScroll: null,//滚动条位置监听
            bounce:true,//是否禁止ios bounce
            topBtn:true,//是否增加回到顶部按钮功能
            offset: 1000, //列表滚动多少距离才显示回到顶部按钮,默认1000

        })
    }
    //控制加载状态框状态,1.加载状态,2.下拉到底,3.显示结果为空,4.什么都不显示
    SimpleScroll.prototype.controlState=function(state){
        var me=this;
        me.isUpScrolling=false;
        if(state=='load'){
            me.upwarp.innerHTML=me.options.htmlLoading;//如果使用display控制则可能出现渲染不及时
            me.hasNext=true
        }else if(state=='complete'){
            me.upwarp.innerHTML=me.options.htmlNodata;
            me.hasNext=false
        }else if(state=='empty'){
            me.upwarp.innerHTML=me.options.htmlEmpty;
            me.hasNext=false
        }else{
            me.upwarp.innerHTML=''
        }
    }
    //显示回到顶部按钮
    SimpleScroll.prototype.showTopBtn=function(){
        var me=this;
        me.toTopDom=document.createElement('div')
        me.toTopDom.className='to-top-wrap'
        me.toTopDom.innerHTML=me.options.htmlToTop
        me.scrollDom.appendChild(me.toTopDom);
        me.toTopDom.onclick = function() {
            me.scrollTo(0); //置顶
        }
    }
    //滚动到指定位置
    SimpleScroll.prototype.scrollTo=function(y,t){
        var me=this;
        t= t || 300 //默认值300ms
        //计算y(滚动位置)取值的最大值和最小值
        var start=this.getScrollTop(),end;
        if(y>0){
            var maxY=this.getScrollHeight()-this.getClientHeight();
            end=y>maxY?maxY:y;
        }else{
            end=0
        }
        me.isScrollTo = true; //标记在滑动中,阻止列表的触摸事件
        me.getStep(start, end, function(step) {
            me.setScrollTop(step);
            if(step == end) me.isScrollTo = false;
        }, t)
    }
    SimpleScroll.prototype.getStep = function(star, end, callback, t, rate) {
        var diff = end - star; //差值
        if(t == 0 || diff == 0) {
            callback && callback(end);
            return;
        }
        t = t || 300; //时长 300ms
        rate = rate || 30; //周期 30ms
        var count = t / rate; //次数
        var step = diff / count; //步长
        var i = 0; //计数
        var timer = window.setInterval(function() {
            if(i < count - 1) {
                star += step;
                callback && callback(star, timer);
                i++;
            } else {
                callback && callback(end, timer); //最后一次直接设置end,避免计算误差
                window.clearInterval(timer);
            }
        }, rate);
    }
    //获取滚动内容的高度
    SimpleScroll.prototype.getScrollHeight=function(){
        return this.scrollDom.scrollHeight
    }
    //获取滚动容器高度
    SimpleScroll.prototype.getClientHeight=function(){
        if(this.isScrollBody&&document.compatMode=='CSS1Compat'){
            return document.documentElement.clientHeight
        }else{
            return this.scrollDom.clientHeight
        }
    }
    //获取滚动条卷曲高度
    SimpleScroll.prototype.getScrollTop=function(){
        if(this.isScrollBody){
            return document.documentElement.scrollTop||document.body.scrollTop
        }else{
            return this.scrollDom.scrollTop
        }
    }
    /*设置滚动条的位置*/
    SimpleScroll.prototype.setScrollTop = function(y) {
        if(this.isScrollBody) {
            document.documentElement.scrollTop = y;
            document.body.scrollTop = y;
        } else {
            this.scrollDom.scrollTop = y;
        }
    }
    //配置参数
    SimpleScroll.prototype.extend=function(userOptions,defaultOptions){
        if(!userOptions){
            return defaultOptions
        }
        for(var key in defaultOptions){
            if(userOptions[key]==null){
                userOptions[key]=defaultOptions[key]
            }else if(typeof userOptions[key] =='object'){
                this.extend(userOptions[key],defaultOptions[key])
            }
        }
        return userOptions
    }
    //禁止ios的Bounce
    SimpleScroll.prototype.setBounce=function(isBounce){
        if(isBounce == false) {
            window.addEventListener('touchmove', this.bounceTouchmove);
        } else {
            window.removeEventListener('touchmove', this.bounceTouchmove);
        }
    }
    SimpleScroll.prototype.bounceTouchmove=function(e){
        var el=e.target;
        //当前touch的元素及父元素是否要拦截touchmove事件
        var isPrevent = true;
        while(el !== document.body && el !== document) {
            var cls = el.classList;
            if(cls) {
                if(cls.contains("simple-scroll")){
                    isPrevent = false; //如果是指定条件的元素,则无需拦截touchmove事件
                    break;
                }
            }
            el = el.parentNode; //继续检查其父元素
        }
        //拦截touchmove事件:是否可以被禁用&&是否已经被禁用
        if(isPrevent && e.cancelable && !e.defaultPrevented) {
            e.preventDefault();
        }
    }

    //获取坐标
    SimpleScroll.prototype.getPoint=function(e){
        return {
            x: e.touches ? e.touches[0].pageX : e.clientX,
            y: e.touches ? e.touches[0].pageY : e.clientY
        }
    },
    //通过Id获取DOM
    SimpleScroll.prototype.getDomById=function (id) {
        if(!id){
            return
        }
        return document.getElementById(id)
    }
    //销毁SimpleScroll
    SimpleScroll.prototype.destroy=function () {
        this.setBounce(true)
        //解除滚动监听
        if(this.isScrollBody){
            window.removeEventListener('scroll',this.scrollEvent)
        }else{
            this.scrollDom.removeEventListener('scroll',this.scrollEvent)
            if(this.isIos&&this.options.bounce){
                this.scrollDom.removeEventListener("touchstart", this.touchstartEvent);
                this.scrollDom.removeEventListener("touchmove", this.touchmoveEvent);
            }
        }

    }
    return SimpleScroll;
});