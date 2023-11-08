<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\UX\LiveComponent\Tests\Functional\Util;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\UX\LiveComponent\Metadata\LiveComponentMetadataFactory;
use Symfony\UX\LiveComponent\Tests\Fixtures\Dto\Address;
use Symfony\UX\LiveComponent\Tests\LiveComponentTestHelper;
use Symfony\UX\LiveComponent\Util\QueryStringPropsExtractor;

class QueryStringPropsExtractorTest extends KernelTestCase
{
    use LiveComponentTestHelper;

    /**
     * @dataProvider getQueryStringTests
     */
    public function testExtract(string $queryString, array $expected)
    {
        $extractor = new QueryStringPropsExtractor($this->hydrator());

        $request = Request::create('/'.!empty($queryString) ? '?'.$queryString : '');

        /** @var LiveComponentMetadataFactory $metadataFactory */
        $metadataFactory = self::getContainer()->get('ux.live_component.metadata_factory');

        $metadata = $metadataFactory->getMetadata('component_with_url_bound_props');
        $component = $this->getComponent('component_with_url_bound_props');

        $data = $extractor->extract($request, $metadata, $component);

        $this->assertEquals($expected, $data);
    }

    public function getQueryStringTests(): iterable
    {
        yield from [
            ['', []],
            ['prop1=foo', ['prop1' => 'foo']],
            ['prop2=42', ['prop2' => 42]],
            ['prop3[]=foo&prop3[]=bar', ['prop3' => ['foo', 'bar']]],
            ['prop4=foo', []], // not bound
            ['prop5[address]=foo&prop5[city]=bar', ['prop5' => (function () {
                $address = new Address();
                $address->address = 'foo';
                $address->city = 'bar';

                return $address;
            })(),
            ]],
            ['q=foo', ['prop6' => 'foo']],
        ];
    }
}
