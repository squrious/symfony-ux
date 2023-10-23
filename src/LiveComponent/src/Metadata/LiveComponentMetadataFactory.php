<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\UX\LiveComponent\Metadata;

use Symfony\Component\PropertyInfo\PropertyTypeExtractorInterface;
use Symfony\Component\PropertyInfo\Type;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\TwigComponent\ComponentFactory;

/**
 * @author Ryan Weaver <ryan@symfonycasts.com>
 *
 * @experimental
 *
 * @internal
 */
class LiveComponentMetadataFactory
{
    public function __construct(
        private ComponentFactory $componentFactory,
        private PropertyTypeExtractorInterface $propertyTypeExtractor,
    ) {
    }

    public function getMetadata(string $name): LiveComponentMetadata
    {
        $componentMetadata = $this->componentFactory->metadataFor($name);

        $reflectionClass = new \ReflectionClass($componentMetadata->getClass());
        $livePropsMetadata = $this->createPropMetadatas($reflectionClass);

        return new LiveComponentMetadata($componentMetadata, $livePropsMetadata);
    }

    /**
     * @return LivePropMetadata[]
     *
     * @internal
     */
    public function createPropMetadatas(\ReflectionClass $class): array
    {
        $metadatas = [];

        foreach (self::propertiesFor($class) as $property) {
            if (!$attribute = $property->getAttributes(LiveProp::class)[0] ?? null) {
                continue;
            }

            if (isset($metadatas[$propertyName = $property->getName()])) {
                // property name was already used
                continue;
            }

            $metadatas[$propertyName] = $this->createLivePropMetadata($class->getName(), $propertyName, $property, $attribute->newInstance());
        }

        return array_values($metadatas);
    }

    public function createLivePropMetadata(string $className, string $propertyName, \ReflectionProperty $property, LiveProp $liveProp): LivePropMetadata
    {
        $type = $property->getType();
        if ($type instanceof \ReflectionUnionType || $type instanceof \ReflectionIntersectionType) {
            throw new \LogicException(sprintf('Union or intersection types are not supported for LiveProps. You may want to change the type of property %s in %s.', $property->getName(), $property->getDeclaringClass()->getName()));
        }

        $infoTypes = $this->propertyTypeExtractor->getTypes($className, $propertyName) ?? [];

        $collectionValueType = null;
        foreach ($infoTypes as $infoType) {
            if ($infoType->isCollection()) {
                foreach ($infoType->getCollectionValueTypes() as $valueType) {
                    $collectionValueType = $valueType;
                    break;
                }
            }
        }

        if (null === $type && null === $collectionValueType && isset($infoTypes[0])) {
            $infoType = Type::BUILTIN_TYPE_OBJECT === $infoTypes[0]->getBuiltinType() ? $infoTypes[0]->getClassName() : $infoTypes[0]->getBuiltinType();
            $isTypeBuiltIn = null === $infoTypes[0]->getClassName();
            $isTypeNullable = $infoTypes[0]->isNullable();
        } else {
            $infoType = $type?->getName();
            $isTypeBuiltIn = $type?->isBuiltin() ?? false;
            $isTypeNullable = $type?->allowsNull() ?? true;
        }

        $queryStringBinding = $this->createQueryStringMapping($propertyName, $liveProp, $isTypeBuiltIn, $infoType);

        return new LivePropMetadata(
            $property->getName(),
            $liveProp,
            $infoType,
            $isTypeBuiltIn,
            $isTypeNullable,
            $collectionValueType,
            $queryStringBinding
        );
    }

    /**
     * @return iterable<\ReflectionProperty>
     */
    private static function propertiesFor(\ReflectionClass $class): iterable
    {
        foreach ($class->getProperties() as $property) {
            yield $property;
        }

        if ($parent = $class->getParentClass()) {
            yield from self::propertiesFor($parent);
        }
    }

    private function createQueryStringMapping(string $propertyName, LiveProp $liveProp, bool $isTypeBuiltIn, ?string $infoType): array
    {
        if (false === $liveProp->url()) {
            return [];
        }

        $queryStringMapping = [];
        $parameters = [];

        if (!$isTypeBuiltIn && null !== $infoType) {
            $subProps = $liveProp->writablePaths();

            if (empty($subProps)) {
                // TODO Find a way to get readable paths from DTOs
                return [];
            }

            foreach ($subProps as $subProp) {
                $subPropTypes = $this->propertyTypeExtractor->getTypes($infoType, $subProp) ?? [];
                foreach ($subPropTypes as $subPropType) {
                    if ($subPropType->isCollection()) {
                        // TODO support nested collections in DTOs
                        throw new \LogicException('Cannot use collections in query string mapping for an object.');
                    }
                }
                $subPropType = $subPropTypes[0] ?? null;

                if (Type::BUILTIN_TYPE_OBJECT === $subPropType?->getBuiltinType()) {
                    // TODO support non-scalar nested properties in DTOs
                    throw new \InvalidArgumentException('Only scalar values are supported for nested properties in query string mapping.');
                }

                $parameters[sprintf('%s_%s', $propertyName, $subProp)] = [
                    'property' => sprintf('%s.%s', $propertyName, $subProp),
                    'type' => $subPropType?->getBuiltinType() ?? 'string',
                ];
            }
        } else {
            $parameters[$propertyName] = [
                'property' => $propertyName,
                'type' => $infoType ?? 'string',
            ];
        }

        $queryStringMapping['parameters'] = $parameters;

        return $queryStringMapping;
    }
}
