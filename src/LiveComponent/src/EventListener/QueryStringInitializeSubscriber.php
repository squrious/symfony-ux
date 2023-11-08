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
use Symfony\UX\LiveComponent\Util\LiveControllerAttributesCreator;
use Symfony\UX\LiveComponent\Util\QueryStringPropsExtractor;
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
    public function __construct(
        private readonly RequestStack $requestStack,
        private readonly LiveComponentMetadataFactory $metadataFactory,
        private readonly QueryStringPropsExtractor $queryStringPropsExtractor,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            PreMountEvent::class => 'onPreMount',
        ];
    }

    public function onPreMount(PreMountEvent $event): void
    {
        $metadata = new LiveComponentMetadata(
            $event->getMetadata(),
            $this->metadataFactory->createPropMetadatas(new \ReflectionClass($event->getComponent()::class))
        );

        if (!$metadata->hasQueryStringBindings()) {
            return;
        }

        $component = $event->getComponent();

        $data = $event->getData();

        $request = $this->requestStack->getMainRequest();

        $prefix = $data[LiveControllerAttributesCreator::URL_PREFIX_PROP_NAME]
            ?? $data[LiveControllerAttributesCreator::KEY_PROP_NAME]
            ?? '';

        $queryStringData = $this->queryStringPropsExtractor->extract($request, $metadata, $component, $prefix);

        $event->setData(array_merge($data, $queryStringData));
    }
}
