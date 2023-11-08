<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\UX\LiveComponent\Util;

use Symfony\Component\HttpFoundation\Request;
use Symfony\UX\LiveComponent\LiveComponentHydrator;
use Symfony\UX\LiveComponent\Metadata\LiveComponentMetadata;

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @experimental
 *
 * @internal
 */
final class QueryStringPropsExtractor
{
    public function __construct(private readonly LiveComponentHydrator $hydrator)
    {
    }

    public function extract(Request $request, LiveComponentMetadata $metadata, object $component): array
    {
        $query = $request->query->all();

        if (empty($query)) {
            return [];
        }
        $data = [];

        foreach ($metadata->getAllLivePropsMetadata() as $livePropMetadata) {
            if ($queryStringMapping = $livePropMetadata->getQueryStringMapping()) {
                if (null !== ($value = $query[$queryStringMapping['name']] ?? null)) {
                    if (\is_array($value) && $this->isNumericIndexedArray($value)) {
                        ksort($value);
                    }
                    $data[$livePropMetadata->getName()] = $this->hydrator->hydrateValue($value, $livePropMetadata, $component);
                }
            }
        }

        return $data;
    }

    private function isNumericIndexedArray(array $array): bool
    {
        return 0 === \count(array_filter(array_keys($array), 'is_string'));
    }
}
