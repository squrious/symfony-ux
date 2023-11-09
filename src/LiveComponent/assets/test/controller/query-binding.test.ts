/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import {createTest, initComponent, shutdownTests, setCurrentSearch, expectCurrentSearch} from '../tools';
import { getByText, waitFor } from '@testing-library/dom';

describe('LiveController query string binding', () => {
    afterEach(() => {
        shutdownTests();
        setCurrentSearch('');
    });

    it('doesn\'t initialize URL if keep is not enabled', async () => {
        await createTest({ prop1: '', prop2: 'foo'}, (data: any) => `
            <div ${initComponent(data, { queryMapping: {prop1: {name: 'prop1'}, prop2: {name: 'prop2'}}})}></div>
        `)

        expectCurrentSearch().toEqual('');
    })

    it('updates basic props in the URL', async () => {
        const test = await createTest({ prop1: '', prop2: null}, (data: any) => `
            <div ${initComponent(data, { queryMapping: {prop1: {name: 'prop1'}, prop2: {name: 'prop2'}}})}></div>
        `)

        // String

        // Set value
        test.expectsAjaxCall()
            .expectUpdatedData({prop1: 'foo'});

        await test.component.set('prop1', 'foo', true);

        expectCurrentSearch().toEqual('?prop1=foo');

        // Remove value
        test.expectsAjaxCall()
            .expectUpdatedData({prop1: ''});

        await test.component.set('prop1', '', true);

        expectCurrentSearch().toEqual('');

        // Number

        // Set value
        test.expectsAjaxCall()
            .expectUpdatedData({prop2: 42});

        await test.component.set('prop2', 42, true);

        expectCurrentSearch().toEqual('?prop2=42');

        // Remove value
        test.expectsAjaxCall()
            .expectUpdatedData({prop2: null});

        await test.component.set('prop2', null, true);

        expectCurrentSearch().toEqual('');
    });

    it('updates array props in the URL', async () => {
        const test = await createTest({ prop: []}, (data: any) => `
            <div ${initComponent(data, { queryMapping: {prop: {name: 'prop'}}})}></div>
        `)

        // Set value
        test.expectsAjaxCall()
            .expectUpdatedData({prop: ['foo', 'bar']});

        await test.component.set('prop', ['foo', 'bar'], true);

        expectCurrentSearch().toEqual('?prop[0]=foo&prop[1]=bar');

        // Remove one value
        test.expectsAjaxCall()
            .expectUpdatedData({prop: ['foo']});

        await test.component.set('prop', ['foo'], true);

        expectCurrentSearch().toEqual('?prop[0]=foo');

        // Remove all remaining values
        test.expectsAjaxCall()
            .expectUpdatedData({prop: []});

        await test.component.set('prop', [], true);

        expectCurrentSearch().toEqual('');
    });

    it('updates objects in the URL', async () => {
        const test = await createTest({ prop: { 'foo': null, 'bar': null, 'baz': null}}, (data: any) => `
            <div ${initComponent(data, { queryMapping: {prop: {name: 'prop'}}})}></div>
        `)

        // Set single nested prop
        test.expectsAjaxCall()
            .expectUpdatedData({'prop.foo': 'dummy' });

        await test.component.set('prop.foo', 'dummy', true);

        expectCurrentSearch().toEqual('?prop[foo]=dummy');

        // Set multiple values
        test.expectsAjaxCall()
            .expectUpdatedData({'prop': { 'foo': 'other', 'bar': 42 } });

        await test.component.set('prop', { 'foo': 'other', 'bar': 42 }, true);

        expectCurrentSearch().toEqual('?prop[foo]=other&prop[bar]=42');

        // Remove one value
        test.expectsAjaxCall()
            .expectUpdatedData({'prop': { 'foo': 'other', 'bar': null } });

        await test.component.set('prop', { 'foo': 'other', 'bar': null }, true);

        expectCurrentSearch().toEqual('?prop[foo]=other');

        // Remove all values
        test.expectsAjaxCall()
            .expectUpdatedData({'prop': { 'foo': null, 'bar': null } });

        await test.component.set('prop', { 'foo': null, 'bar': null }, true);

        expectCurrentSearch().toEqual('');
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

        expectCurrentSearch().toEqual('?prop=foo');
    });

    it('uses custom name instead of prop name in the URL', async () => {
        const test = await createTest({ prop1: ''}, (data: any) => `
            <div ${initComponent(data, { queryMapping: {prop1: {name: 'alias1'} }})}></div>
        `)

        // Set value
        test.expectsAjaxCall()
            .expectUpdatedData({prop1: 'foo'});

        await test.component.set('prop1', 'foo', true);

        expectCurrentSearch().toEqual('?alias1=foo');

        // Remove value
        test.expectsAjaxCall()
            .expectUpdatedData({prop1: ''});

        await test.component.set('prop1', '', true);

        expectCurrentSearch().toEqual('');
    });

    it('keep option initializes URL and keep value even if it is empty', async () => {
        const test = await createTest({ prop1: 'foo', prop2: ''}, (data: any) => `
            <div ${initComponent(data, { queryMapping: {prop1: {name: 'prop1', keep: true}, prop2: {name: 'prop2', keep: true} }})}></div>
        `)

        expectCurrentSearch().toEqual('?prop1=foo&prop2=');

        // Remove value
        test.expectsAjaxCall()
            .expectUpdatedData({prop1: ''});

        await test.component.set('prop1', '', true);

        expectCurrentSearch().toEqual('?prop1=&prop2=');
    });

    it('creates a new history entry when history option is enabled', async () => {
        const test = await createTest({ prop1: 'foo', prop2: ''}, (data: any) => `
            <div ${initComponent(data, { queryMapping: {prop1: {name: 'prop1'}, prop2: {name: 'prop2', history: true} }})}></div>
        `)
        setCurrentSearch('?prop1=foo')

        // Changing prop2 should create a new history entry
        test.expectsAjaxCall()
            .expectUpdatedData({prop2: 'bar'});

        await test.component.set('prop2', 'bar', true);

        expectCurrentSearch().toEqual('?prop1=foo&prop2=bar');

        // Changing prop1 should update the URL in-place
        test.expectsAjaxCall()
            .expectUpdatedData({prop1: 'baz'});

        await test.component.set('prop1', 'baz', true);

        expectCurrentSearch().toEqual('?prop1=baz&prop2=bar');

        window.history.back();

        test.expectsAjaxCall()
            .expectUpdatedData({prop1: 'foo'});

        await waitFor(() => expectCurrentSearch().toEqual('?prop1=foo'));

    });
});
