<?php

namespace Symfony\UX\LiveComponent\Tests\Fixtures\Component;

use Symfony\UX\LiveComponent\Attribute\AsLiveComponent;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\DefaultActionTrait;
use Symfony\UX\LiveComponent\Tests\Fixtures\Dto\Address;

#[AsLiveComponent('component_with_url_bound_props')]
class ComponentWithUrlBoundProps
{
    #[LiveProp(writable: true, url: true)]
    public ?string $prop1 = null;

    #[LiveProp(writable: true, url: true)]
    public ?int $prop2 = null;

    #[LiveProp(writable: true, url: true)]
    public array $prop3 = [];

    #[LiveProp(writable: true)]
    public ?string $prop4 = null;

    #[LiveProp(writable: ['address', 'city'], url: true)]
    public ?Address $prop5 = null;

    #[LiveProp(writable: true, url: true, urlAlias: 'q')]
    public ?string $prop6 = null;

    use DefaultActionTrait;
}
