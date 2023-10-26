<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\UX\LiveComponent\EventListener;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\UX\LiveComponent\Metadata\LiveComponentMetadata;
use Symfony\UX\LiveComponent\Metadata\LiveComponentMetadataFactory;
use Symfony\UX\LiveComponent\Util\QueryStringPropsExtractor;
use Symfony\UX\TwigComponent\Event\PreCreateForRenderEvent;
use Symfony\UX\TwigComponent\Event\PreMountEvent;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @experimental
 *
 * @internal
 */
class QueryStringInitializeSubscriber implements EventSubscriberInterface
{
    /**
     * @var array<class-string,LiveComponentMetadata>
     */
    private array $registered = [];

    public function __construct(
        private readonly RequestStack $requestStack,
        private readonly LiveComponentMetadataFactory $metadataFactory,
        private readonly QueryStringPropsExtractor $queryStringPropsExtractor,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            PreCreateForRenderEvent::class => 'onPreCreateForRenderEvent',
            PreMountEvent::class => 'onPreMount',
        ];
    }

    public function onPreMount(PreMountEvent $event): void
    {
        $component = $event->getComponent();
        if (!($metadata = $this->registered[$component::class] ?? null)) {
            return;
        }

        $data = $event->getData();

        $request = $this->requestStack->getMainRequest();

        $queryStringData = $this->queryStringPropsExtractor->extract($request, $metadata, $component);

        $event->setData(array_merge($data, $queryStringData));
    }

    public function onPreCreateForRenderEvent(PreCreateForRenderEvent $event): void
    {
        $componentName = $event->getName();
        $metadata = $this->metadataFactory->getMetadata($componentName);
        if ($metadata->hasQueryStringBindings()) {
            $this->registered[$metadata->getComponentMetadata()->getClass()] = $metadata;
        }
    }
}
