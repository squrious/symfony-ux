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

/**
 * @author Nicolas Rigaud <squrious@protonmail.com>
 *
 * @experimental
 *
 * @internal
 */
class QueryStringPropsExtractor
{
    public function extract(?string $queryString, LiveComponentMetadata $metadata): array
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
        $allowedTypes = [Type::BUILTIN_TYPE_BOOL, Type::BUILTIN_TYPE_FLOAT, Type::BUILTIN_TYPE_INT, Type::BUILTIN_TYPE_STRING, Type::BUILTIN_TYPE_ARRAY];
        if (!\in_array($config['type'], $allowedTypes)) {
            throw new \LogicException(sprintf('Invalid type "%s" for property "%s". Valid types are: %s.', $config['type'], $config['property'], implode(', ', $allowedTypes)));
        }

        if (Type::BUILTIN_TYPE_ARRAY === $config['type'] && isset($config['collectionType'])) {
            foreach ($value as &$v) {
                settype($v, $config['collectionType']);
            }
        } else {
            settype($value, $config['type']);
        }

        return $value;
    }
}
