<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\UX\LiveComponent\Tests\Unit\Util;

use PHPUnit\Framework\TestCase;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\Metadata\LiveComponentMetadata;
use Symfony\UX\LiveComponent\Metadata\LivePropMetadata;
use Symfony\UX\LiveComponent\Util\QueryStringPropsExtractor;
use Symfony\UX\TwigComponent\ComponentMetadata;

class QueryStringPropsExtractorTest extends TestCase
{
    /**
     * @dataProvider getQueryStringTests
     */
    public function testExtract(string $queryString, array|string $expected)
    {
        $metadata = new LiveComponentMetadata(new ComponentMetadata([]), [
            new LivePropMetadata('string_prop', new LiveProp(), null, true, true, null,
                queryStringMapping: ['parameters' => [
                    'string_prop' => [
                        'property' => 'string_prop',
                        'type' => 'string',
                    ],
                ]],
            ),
            new LivePropMetadata('int_prop', new LiveProp(), null, true, true, null,
                queryStringMapping: ['parameters' => [
                    'int_prop' => [
                        'property' => 'int_prop',
                        'type' => 'int',
                    ],
                ]],
            ),
            new LivePropMetadata('array_prop', new LiveProp(), null, true, true, null,
                queryStringMapping: ['parameters' => [
                    'array_prop' => [
                        'property' => 'array_prop',
                        'type' => 'array',
                    ],
                ]],
            ),
            new LivePropMetadata('object_prop', new LiveProp(), null, false, true, null,
                queryStringMapping: ['parameters' => [
                    'object_prop_foo' => [
                        'property' => 'object_prop.foo',
                        'type' => 'string',
                    ],
                    'object_prop_bar' => [
                        'property' => 'object_prop.bar',
                        'type' => 'int',
                    ],
                ]],
            ),
            new LivePropMetadata('invalid_prop', new LiveProp(), null, false, true, null,
                queryStringMapping: ['parameters' => [
                    'invalid_prop' => [
                        'property' => 'invalid_prop',
                        'type' => 'object', // Object type is invalid
                    ],
                ]],
            ),
        ]);

        $extractor = new QueryStringPropsExtractor();

        if (\is_string($expected)) {
            $this->expectException($expected);
        }

        $data = $extractor->extract($queryString, $metadata);

        $this->assertEquals($expected, $data);
    }

    public function getQueryStringTests(): iterable
    {
        yield from [
            ['', []],
            ['string_prop=foo', ['string_prop' => 'foo']],
            ['int_prop=42', ['int_prop' => 42]],
            ['array_prop[]=foo&array_prop[]=bar', ['array_prop' => ['foo', 'bar']]],
            ['object_prop_foo=bar&object_prop_bar=42', ['object_prop.foo' => 'bar', 'object_prop.bar' => 42]],
            ['invalid_prop={"foo": "bar}', \LogicException::class],
        ];
    }
}
