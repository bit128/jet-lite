/**
* jet-sdk script
* ======
* @author 洪波
* @version 19.01.20
*/
var Jet = function() {
    this.apiHost = 'http://192.168.1.2:8001/';
    this.imgHost = 'http://192.168.1.2:8001/images/';
};
Jet.prototype = {
    constructor: Jet,
    deviceType : function(){
        if (window.webkit) {
            return 2;
        } else if (window.android) {
            return 1;
        }
        return 0;
    },
    uniqid: function(){
        let t = new Date().getTime();
        let r = Math.floor(16 + Math.random() * (255-16));
        return t.toString(16) + r.toString(16);
    },
    /**
     * 调用桥接层功能模块
     * ====== ======
     * @param name      功能名称
     * --- 可用值 ---
     * setContent   设置内容
     * getContent   获取内容
     * selectFile   媒体文件选择器（拍照、相册）
     * updateFile   上传文件
     * httpRequest  发起网络请求
     * ------ ------
     * @param params    桥接参数
     * --- 参考值 ---
     * {
     *  //如果存在，则表示有回调
     *  "trackId": 16
     *  //如果存在trackId，则回调名称为name+Callback
     *  //例如updateFile上传文件的默认回调为：updateFileCallback
     *  //所有回调的作用域为window，例如：window.updateFileCallback(result,trackId)
     * }
     * ------ ------
     * @param backup    备用逻辑（回调）
     * 如果原生层没有找到桥接方法，则执行这里的逻辑
     */
    runBridge: function(name, params, backup){
        if (window.android && window.android[name]) {
            if (params == undefined) {
                window.android[name]();
            } else {
                window.android[name](params);
            }
        } else if (window.webkit && window.webkit.messageHandlers[name]) {
            if (params == undefined) {
                params = "";
            }
            window.webkit.messageHandlers[name].postMessage(params);
        } else if (backup != undefined) {
            backup();
        }
    },
    setContent: function(key, value, trackId) {
        this.runBridge('setContent', JSON.stringify({
            "trackId": trackId,
            "key": key,
            "value": value
        }));
    },
    httpRequest: function(method, url, formData, trackId) {
        this.runBridge('httpRequest', JSON.stringify({
            "trackId": trackId,
            "method": method,
            "url": url,
            "formData": formData
        }));
    }
};