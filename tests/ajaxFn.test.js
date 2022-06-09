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

import { ajax, ajaxFn } from '../mod.js'
ajax.base_href = 'https://httpbin.org'

describe('ajaxFn wraps ajax call as a function', () => {

    it('checks for "data" field', async () => {
        let f = ajaxFn({
            url: '/post',
            data: { a:1, b:2 },
            // for testing with httpbin.org only
            output: (r) => {
                return { data: r.json }
            }
        })
        let a = await f({b:3})
        assertEquals(a, {a:1, b:3})
    })


    it('checks for "errors" field', async () => {
        try {
            let f = ajaxFn({
                url: '/post',
                data: { a:1, b:2 },
                // for testing with httpbin.org only
                output: (r) => {
                    return { error: r.json }
                }
            })
            await f({b:3})

        } catch(e) {
            assertEquals(e, {a:1, b:3})
        }

    })


})