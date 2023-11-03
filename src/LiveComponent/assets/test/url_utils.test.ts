/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import { HistoryStrategy, UrlUtils } from '../src/url_utils';

describe('url_utils', () => {
    describe('UrlUtils', () => {
        describe('set', () => {
            const urlUtils: UrlUtils = new UrlUtils(window.location.href);

            beforeEach(() => {
                // Reset search before each test
               urlUtils.search = '';
            });

            it('set the param if it does not exist', () => {
                urlUtils.set('param', 'foo');

                expect(urlUtils.search).toEqual('?param=foo');
            });

            it('override the param if it exists', () => {
                urlUtils.search = '?param=foo';

                urlUtils.set('param', 'bar');

                expect(urlUtils.search).toEqual('?param=bar');
            });

            it('expand arrays in the URL', () => {
                urlUtils.set('param', ['foo', 'bar']);

                expect(urlUtils.search).toEqual('?param[0]=foo&param[1]=bar');
            });

            it('expand objects in the URL', () => {
                urlUtils.set('param', {
                    foo: 1,
                    bar: 'baz',
                });

                expect(urlUtils.search).toEqual('?param[foo]=1&param[bar]=baz');
            });
        });

        describe('remove', () => {
            const urlUtils: UrlUtils = new UrlUtils(window.location.href);

            beforeEach(() => {
                // Reset search before each test
                urlUtils.search = '';
            });
            it('remove the param if it exists', () => {
                urlUtils.search = '?param=foo';

                urlUtils.remove('param');

                expect(urlUtils.search).toEqual('');
            });

            it('keep other params unchanged', () => {
                urlUtils.search ='?param=foo&otherParam=bar';

                urlUtils.remove('param');

                expect(urlUtils.search).toEqual('?otherParam=bar');
            });

            it('remove all occurrences of an array param', () => {
                urlUtils.search = '?param[0]=foo&param[1]=bar';

                urlUtils.remove('param');

                expect(urlUtils.search).toEqual('');
            });

            it ('remove all occurrences of an object param', () => {
                urlUtils.search ='?param[foo]=1&param[bar]=baz';

                urlUtils.remove('param');

                expect(urlUtils.search).toEqual('');
            });
        });
    });

    describe('HistoryStrategy', () => {
        let initialUrl: URL;
        beforeAll(() => {
            initialUrl = new URL(window.location.href);
        });
        afterEach(()=> {
            history.replaceState(history.state, '', initialUrl);
        });
        it('replace URL', () => {
           const newUrl = new URL(window.location.href + '/foo/bar');
           HistoryStrategy.replace(newUrl);
           expect(window.location.href).toEqual(newUrl.toString());
        });
    })
});
