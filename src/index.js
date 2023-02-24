
let processBody = (data, type) => {
    switch(type) {
        case "any": return data
        case "text": return data ? data.toString() : data
        case "json": return JSON.stringify(data)
    }

    throw new Error('unknown request data type')
}

let processResponse = (res, type) => {
    switch(type) {
        case 'arrayBuffer': return res.arrayBuffer()
        case 'blob': return res.blob()
        case 'formData': return res.formData()
        case 'json': return res.json()
        case 'text': return res.text()
    }

    throw new Error('unknown response type')
}

export let ajaxDefaults = {
    baseHref:'',
    timeout: 0,

    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },

    requestType: 'json', // json, text, any
    responseType: 'json', // arrayBuffer, blob, formData, json, text,
}


export function ajax ({
    url,
    data,
    body, // for FormData, URLSearchParams, string, etc

    // transformer/validator
    input = (a) => a,
    output = (a) => a,

    baseHref = ajaxDefaults.baseHref,
    method = ajaxDefaults.method,
    headers = ajaxDefaults.headers,
    timeout = ajaxDefaults.timeout,
    requestType = ajaxDefaults.requestType,
    responseType = ajaxDefaults.responseType,
} = {}) {

    if (!url) throw new Error('url required')

    url = url.indexOf('http') < 0 && baseHref
        ? baseHref + url
        : url

    data = input(data)

    let opt = {
        method,
        headers: {
            ...(headers)
        }
    }

    let hasBody = !(method==='GET' || method==='HEAD')
    if (hasBody) {
        opt.body = body || processBody(data, requestType)
    }

    let Abort = new AbortController()
    opt.signal = Abort.signal

    let p = new Promise(async (ok, err) => {
        let tId
        if (timeout) {
            tId = setTimeout(() => {
                Abort.abort()
            }, timeout)
        }

        opt.signal.onabort = () => {
            err(new Error('aborted'))
        }

        try {
            let res = await fetch(url, opt)

            if (tId) clearTimeout(tId)

            if (!res.ok) {
                await res.body.cancel()
                throw {
                    [res.status]: res.statusText
                }
            }

            let body = await processResponse(res, responseType)

            ok(await output(body))
        }
        catch(e) {
            err(e)
        }
    })

    p.abort = () => Abort.abort()

    return p
}

// wraps ajax-call as a function
//
const isObject = (a) => (a !== null && a instanceof Object && a.constructor === Object)

export const ajaxFn = (cfg) => async (data) => {
    let a = await ajax({
        ...(cfg),
        data: {
            ...(cfg.data || {}),
            ...(data)
        }
    })

    // process data/errors,
    // borrowed from graphQL
    //
    if (isObject(a)) {
        let { data:d, errors } = a
        if (Boolean(d) ^ Boolean(errors)) {
            if (errors) throw errors
            return d
        }
    }

    return a
}
