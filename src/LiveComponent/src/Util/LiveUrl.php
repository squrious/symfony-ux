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

final class LiveUrl
{
    public function __construct(
        private readonly string|array|null $alias = null,
        private readonly array|null $mapping = null,
        private readonly bool $keep = false,
        private readonly bool $history = false,
    ) {
    }


    public function getAlias(): string|array|null
    {
        return $this->alias;
    }

    public function keep(): bool
    {
        return $this->keep;
    }

    public function history(): bool
    {
        return $this->history;
    }

    public function getMapping(): ?array
    {
        return $this->mapping;
    }
}
