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

import { ajaxFn } from '../mod.js'
// import { ajaxFn } from 'https://raw.githubusercontent.com/kodema5/ajax.js/main/mod.js'

describe('ajaxFn wraps ajax call as a function', () => {

    it('checks for "data" field', async () => {
        let f = ajaxFn({
            url: 'https://httpbin.org/post',
            data: { a:1, b:2 },

            // simulate data
            output: (r) => ({ data: r.json }),
        })
        let a = await f({b:3})
        assertEquals(a, {a:1, b:3})
    })


    it('checks for "errors" field', async () => {
        try {
            let f = ajaxFn({
                url: 'https://httpbin.org/post',
                data: { a:1, b:2 },

                // simulate errors
                output: (r) => ({ error: r.json }),
            })
            await f({b:3})

        } catch(e) {
            assertEquals(e, {a:1, b:3})
        }

    })


})