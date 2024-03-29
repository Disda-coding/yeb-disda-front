import axios from "axios";
//饿了么UI中用于通知用户
import {Message} from "element-ui";
//获取路由，可以实现跳转功能
import router from "@/router";


// 请求拦截器
axios.interceptors.request.use(config => {
    // 如果存在 token，请求携带这个 token( 登录的时候 把 token 存入了 sessionStorage ）
    if (window.sessionStorage.getItem("tokenStr")) {
        // token 的key : Authorization ; value: tokenStr
        config.headers['Authorization'] = window.sessionStorage.getItem('tokenStr')
    }
    return config;
}, error => {
    console.log(error)
})

// 响应拦截器 - 统一处理消息提示
axios.interceptors.response.use(success => {
    // 业务逻辑错误
    if (success.status && success.status === 200) { // 调到接口
        // 续签，可以续签，怎么实现无感
        if (success.data.code == 666) {
            // todo 测试

            const tokenStr = success.data.data.tokenHead +" "+ success.data.data.token

            window.sessionStorage.setItem("tokenStr", tokenStr)
            console.log("刷新token" + window.sessionStorage.getItem('tokenStr'))
            // websocket长连接因此没办法刷新
            // store.dispatch('connect')
            //重发请求
            return new axios(success.config)

        }
        // 后端：500 业务逻辑错误，401 未登录，403 无权访问；
        if (success.data.code != 200 && success.data.message != null) {
            // if (success.data.code === 500 || success.data.code === 401 || success.data.code === 403) {

            Message.error({message: success.data.message})
            // 优化了此处代码 使得错误也返回了后端信息，更加灵活了
            if (success.data.code === 20005) {
                router.replace('/')
            } // 路由替换
            return success.data
        }
        if (success.data.message) { // 输出后端 添加成功 之类的信息
            Message.success({message: success.data.message})
        }
    }
    return success.data
}, error => { // 没访问到后端接口 非http请求200的情况
    if (error.response.code === 504 || error.response.code === 404) {
        Message.error({message: '服务器被吃掉了'})
    } else if (error.response.code === 403) {
        Message.error({message: '权限不足，请联系管理员！'})
    } else if (error.response.code === 401) {
        Message.error({message: '您还未登录，请登录！'})
        router.replace('/') // 路由替换
    } else {
        if (error.response.data.message) {
            Message.error({message: error.response.data.message})
        } else {
            Message.error({message: '网络错误'})
        }
    }
    return
})

// 预备前置路径
let base = '';

// 传送 json 格式的 post 请求
export const postRequest = (url, params) => {
    return axios({
        method: 'post',
        url: `${base}${url}`,
        data: params
    })
}


// 传送 json 格式的 get 请求
export const getRequest = (url, params) => {
    return axios({
        method: 'get',
        url: `${base}${url}`,
        data: params
    })
}

// 传送 json 格式的 put 请求
export const putRequest = (url, params) => {
    return axios({
        method: 'put',
        url: `${base}${url}`,
        data: params
    })
}

// 传送 json 格式的 delete 请求
export const deleteRequest = (url, params) => {
    return axios({
        method: 'delete',
        url: `${base}${url}`,
        data: params
    })
}
