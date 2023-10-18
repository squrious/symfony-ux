/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import {createTest, initComponent, shutdownTests} from '../tools';
import { getByText, waitFor } from '@testing-library/dom';

describe('LiveController query string binding', () => {
    afterEach(() => {
        shutdownTests();
    });

    it('doesn\'t initialize URL if props are not defined', async () => {
        await createTest({ prop: ''}, (data: any) => `
            <div ${initComponent(data, { queryMapping: {prop: {name: 'prop'}}})}></div>
        `)

        expect(window.location.search).toEqual('');
    })

    it('initializes URL with defined props values', async () => {
        await createTest({ prop: 'foo'}, (data: any) => `
            <div ${initComponent(data, { queryMapping: {prop: {name: 'prop'}}})}></div>
        `)

        expect(window.location.search).toEqual('?prop=foo');
    });

    it('properly handles array props in the URL', async () => {
        await createTest({ prop: ['foo', 'bar']}, (data: any) => `
            <div ${initComponent(data, { queryMapping: {prop: {name: 'prop'}}})}></div>
        `)
        expect(decodeURIComponent(window.location.search)).toEqual('?prop[]=foo&prop[]=bar');
    });

    it('updates the URL when the props changed', async () => {
        const test = await createTest({ prop: ''}, (data: any) => `
            <div ${initComponent(data, { queryMapping: {prop: {name: 'prop'}}})}></div>
        `)

        test.expectsAjaxCall()
            .expectUpdatedData({prop: 'foo'});

        await test.component.set('prop', 'foo', true);

        expect(window.location.search).toEqual('?prop=foo');
    });

    it('updates the URL with props changed by the server', async () => {
        const test = await createTest({ prop: ''}, (data: any) => `
            <div ${initComponent(data, {queryMapping: {prop: {name: 'prop'}}})}>
                Prop: ${data.prop}
                <button data-action="live#action" data-action-name="changeProp">Change prop</button>
            </div>
        `);

        test.expectsAjaxCall()
            .expectActionCalled('changeProp')
            .serverWillChangeProps((data: any) => {
                data.prop = 'foo';
            });

        getByText(test.element, 'Change prop').click();

        await waitFor(() => expect(test.element).toHaveTextContent('Prop: foo'));

        expect(window.location.search).toEqual('?prop=foo');
    });
})