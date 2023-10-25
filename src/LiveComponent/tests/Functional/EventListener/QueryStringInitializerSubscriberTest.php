<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\UX\LiveComponent\Tests\Functional\EventListener;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Zenstruck\Browser\Test\HasBrowser;

class QueryStringInitializerSubscriberTest extends KernelTestCase
{
    use HasBrowser;

    public function testQueryStringPropsInitialization()
    {
        $this->browser()
            ->get('/render-template/render_component_with_url_bound_props?prop1=foo&prop2=42&prop3[]=foo&prop3[]=bar&prop4=unbound')
            ->assertSuccessful()
            ->assertContains('Prop1: foo')
            ->assertContains('Prop2: 42')
            ->assertContains('Prop3: foo,bar')
            ->assertContains('Prop4:')
        ;
    }
}
