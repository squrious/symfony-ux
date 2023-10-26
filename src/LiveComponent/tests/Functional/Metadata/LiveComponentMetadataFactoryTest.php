<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\UX\LiveComponent\Tests\Functional\Metadata;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\UX\LiveComponent\Metadata\LiveComponentMetadataFactory;
use Symfony\UX\LiveComponent\Tests\Fixtures\Component\ComponentWithUrlBoundProps;

class LiveComponentMetadataFactoryTest extends KernelTestCase
{
    public function testQueryStringMapping()
    {
        /** @var LiveComponentMetadataFactory $metadataFactory */
        $metadataFactory = self::getContainer()->get('ux.live_component.metadata_factory');

        $class = new \ReflectionClass(ComponentWithUrlBoundProps::class);
        $propsMetadata = $metadataFactory->createPropMetadatas($class);

        $propsMetadataByName = [];
        foreach ($propsMetadata as $propMetadata) {
            $propsMetadataByName[$propMetadata->getName()] = $propMetadata;
        }

        $this->assertEquals([
            'parameters' => [
                'prop1' => ['property' => 'prop1'],
            ],
        ], $propsMetadataByName['prop1']->getQueryStringMapping());

        $this->assertEquals([
            'parameters' => [
                'prop2' => ['property' => 'prop2'],
            ],
        ], $propsMetadataByName['prop2']->getQueryStringMapping());

        $this->assertEquals([
            'parameters' => [
                'prop3' => ['property' => 'prop3'],
            ],
        ], $propsMetadataByName['prop3']->getQueryStringMapping());

        $this->assertEquals([], $propsMetadataByName['prop4']->getQueryStringMapping());
    }
}
