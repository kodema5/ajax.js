// deno test --allow-net --watch
//
import {
    assert,
    assertEquals,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
    describe,
    it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";

import { ajax } from '../mod.js'
// import { ajax } from 'https://raw.githubusercontent.com/kodema5/ajax.js/main/mod.js'

ajax.base_href = 'https://httpbin.org'
ajax.headers['Authorization'] = 'hello world'

describe('can call ajax', () => {

    it('calls ajax with base_href and headers', async () => {
        let data = {a:1}
        let a = await ajax({ url: '/post', data })
        assertEquals(data, a.json)
        assertEquals(a.headers.Authorization, 'hello world')
    })

    it('can override headers', async () => {
        let data = {a:1}
        let a = await ajax({ url: '/post', data, headers:{'Authorization': 'abc'} })
        assertEquals(a.headers.Authorization, 'abc')
    })

    it('can throw http error', async () => {
        try {
            let p = await ajax({ url: '/delay2' })
            assert(false)
        } catch(e) {
            assert(e['404'])
        }
    })

    it('can timeout', async () => {
        try {
            await ajax({ url: '/delay/2', timeout:100 })
        } catch(e) {
            assertEquals(e.message, 'aborted')
        }
    })

    it('can abort', async () => {
        try {
            let p = ajax({ url: '/delay/2' })
            setTimeout(() => p.abort())
            await p
        } catch(e) {
            assertEquals(e.message, 'aborted')
        }
    })

    it('throws invalid input', async () => {
        try {
            let data = {a:1}
            let a = await ajax({ url: '/post', data,
                input: (a) => { throw new Error('invalid input') }
            })
        } catch(e) {
            assert(true)
        }
    })

    it('transform output', async () => {
        let data = {a:1}
        let a = await ajax({ url: '/post', data,
            output: (r) => ({ a:123, ...r }),
        })
        assertEquals(a.a, 123)
    })

})