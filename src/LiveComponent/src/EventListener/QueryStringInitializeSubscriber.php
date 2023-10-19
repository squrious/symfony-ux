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
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\UX\LiveComponent\Metadata\LiveComponentMetadata;
use Symfony\UX\LiveComponent\Metadata\LiveComponentMetadataFactory;
use Symfony\UX\TwigComponent\Event\PreCreateForRenderEvent;
use Symfony\UX\TwigComponent\Event\PreMountEvent;

class QueryStringInitializeSubscriber implements EventSubscriberInterface
{
    /**
     * @var array<class-string,LiveComponentMetadata>
     */
    private array $registered = [];

    public function __construct(
        private readonly RequestStack $requestStack,
        private readonly LiveComponentMetadataFactory $metadataFactory,
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
        $request = $this->requestStack->getCurrentRequest();
        $query = HeaderUtils::parseQuery($request->getQueryString());

        foreach ($metadata->getAllLivePropsMetadata() as $livePropMetadata) {
            if ([] !== ($queryStringBinding = $livePropMetadata->getQueryStringMapping())) {
                foreach ($queryStringBinding['parameters'] as $parameterName => $binding) {
                    if (isset($query[$parameterName])) {
                        $value = $query[$parameterName];
                        settype($value, $binding['type']);
                        $data[$binding['property']] = $value;
                    }
                }
            }
        }

        $event->setData($data);
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
