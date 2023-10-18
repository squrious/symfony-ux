/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import {setQueryParam, removeQueryParam} from '../src/url_utils';

const setCurrentSearch = (search: string): void =>
{
    history.replaceState(history.state, '', window.location.origin + window.location.pathname + search);
}

const expectCurrentSearch = () => {
    return expect(decodeURIComponent(window.location.search));
}

describe('setQueryParam', () => {
    it('set the param if it does not exist', () => {
        setCurrentSearch('');

        setQueryParam('param', 'foo');

        expectCurrentSearch().toEqual('?param=foo');
    });

    it('override the param if it exists', () => {
        setCurrentSearch('?param=foo');

        setQueryParam('param', 'bar');

        expectCurrentSearch().toEqual('?param=bar');
    });

    it('expand arrays in the URL', () => {
        setCurrentSearch('');

        setQueryParam('param', ['foo', 'bar']);

        expectCurrentSearch().toEqual('?param[]=foo&param[]=bar');
    });

    it('expand objects in the URL', () => {
        setCurrentSearch('');

        setQueryParam('param', {
            foo: 1,
            bar: 'baz',
        });

        expectCurrentSearch().toEqual('?param[foo]=1&param[bar]=baz');
    })
})

describe('removeQueryParam', () => {
    it('remove the param if it exists', () => {
        setCurrentSearch('?param=foo');

        removeQueryParam('param');

        expectCurrentSearch().toEqual('');
    });

    it('keep other params unchanged', () => {
        setCurrentSearch('?param=foo&otherParam=bar');

        removeQueryParam('param');

        expectCurrentSearch().toEqual('?otherParam=bar');
    });

    it('remove all occurrences of an array param', () => {
        setCurrentSearch('?param[]=foo&param[]=bar');

        removeQueryParam('param');

        expectCurrentSearch().toEqual('');
    });

    it ('remove all occurrences of an object param', () => {
        setCurrentSearch('?param[foo]=1&param[bar]=baz');

        removeQueryParam('param');

        expectCurrentSearch().toEqual('');
    });
})