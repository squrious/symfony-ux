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

use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\PropertyInfo\Type;
use Symfony\UX\LiveComponent\Metadata\LiveComponentMetadata;

class QueryStringPropsExtractor
{
    public function extract(string $queryString, LiveComponentMetadata $metadata): array
    {
        if (empty($queryString)) {
            return [];
        }

        $query = HeaderUtils::parseQuery($queryString);

        $data = [];

        foreach ($metadata->getAllLivePropsMetadata() as $livePropMetadata) {
            $queryStringBinding = $livePropMetadata->getQueryStringMapping();
            foreach ($queryStringBinding['parameters'] ?? [] as $parameterName => $paramConfig) {
                if (isset($query[$parameterName])) {
                    $data[$paramConfig['property']] = $this->normalizeValue($query[$parameterName], $paramConfig);
                }
            }
        }

        return $data;
    }

    private function normalizeValue(mixed $value, array $config): mixed
    {
        if (\in_array($config['type'], [Type::BUILTIN_TYPE_BOOL, Type::BUILTIN_TYPE_FLOAT, Type::BUILTIN_TYPE_INT, Type::BUILTIN_TYPE_STRING, Type::BUILTIN_TYPE_ARRAY])) {
            settype($value, $config['type']);

            return $value;
        }

        throw new \LogicException(sprintf('Prop of type "%s" cannot be extracted from query string.', $config['type']));
    }
}
