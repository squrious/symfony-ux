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
            'name' => 'prop1',
            'keep' => false,
            'history' => false,
        ], $propsMetadataByName['prop1']->getQueryStringMapping());

        $this->assertEquals([
            'name' => 'prop2',
            'keep' => false,
            'history' => false,
        ], $propsMetadataByName['prop2']->getQueryStringMapping());

        $this->assertEquals([
            'name' => 'prop3',
            'keep' => false,
            'history' => false,
        ], $propsMetadataByName['prop3']->getQueryStringMapping());

        $this->assertEquals([], $propsMetadataByName['prop4']->getQueryStringMapping());

        $this->assertEquals([
            'name' => 'prop5',
            'keep' => false,
            'history' => false,
        ], $propsMetadataByName['prop5']->getQueryStringMapping());

        $this->assertEquals([
            'name' => 'q',
            'keep' => false,
            'history' => false,
        ], $propsMetadataByName['prop6']->getQueryStringMapping());

        $this->assertEquals([
            'name' => 'prop7',
            'keep' => true,
            'history' => false,
        ], $propsMetadataByName['prop7']->getQueryStringMapping());

        $this->assertEquals([
            'name' => 'prop8',
            'keep' => false,
            'history' => true,
        ], $propsMetadataByName['prop8']->getQueryStringMapping());
    }
}
