function isObject(subject: any) {
    return typeof subject === 'object' && subject !== null;
}

/**
 * Converts JavaScript data to bracketed query string notation.
 *
 * Input: `{ items: [['foo']] }`
 *
 * Output: `"items[0][0]=foo"`
 */
function toQueryString(data: any) {
    const buildQueryStringEntries = (data: { [p: string]: any }, entries: any = {}, baseKey = '') => {
        Object.entries(data).forEach(([iKey, iValue]) => {
            const key = baseKey === '' ? iKey : `${baseKey}[${iKey}]`;

            if (!isObject(iValue)) {
                if (null !== iValue) {
                    entries[key] = encodeURIComponent(iValue)
                        .replace(/%20/g, '+') // Conform to RFC1738
                        .replace(/%2C/g, ',');
                } else if ('' === baseKey) {
                    // Keep empty values for top level data
                    entries[key] = '';
                }
            } else {
                entries = { ...entries, ...buildQueryStringEntries(iValue, entries, key) };
            }
        });

        return entries;
    };

    const entries = buildQueryStringEntries(data);

    return Object.entries(entries)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');
}

/**
 * Converts bracketed query string notation to JavaScript data.
 *
 * Input: `"items[0][0]=foo"`
 *
 * Output: `{ items: [['foo']] }`
 */
function fromQueryString(search: string) {
    search = search.replace('?', '');

    if (search === '') return {};

    const insertDotNotatedValueIntoData = (key: string, value: any, data: any) => {
        const [first, second, ...rest] = key.split('.');

        // We're at a leaf node, let's make the assigment...
        if (!second) return data[key] = value;

        // This is where we fill in empty arrays/objects along the way to the assigment...
        if (data[first] === undefined) {
            data[first] = Number.isNaN(Number.parseInt(second)) ? {} : [];
        }

        // Keep deferring assignment until the full key is built up...
        insertDotNotatedValueIntoData([second, ...rest].join('.'), value, data[first]);
    };

    const entries = search.split('&').map((i) => i.split('='));

    const data: any = {};

    entries.forEach(([key, value]) => {
        value = decodeURIComponent(value.replace(/\+/g, '%20'));

        if (!key.includes('[')) {
            data[key] = value;
        } else {
            // Skip empty nested data
            if ('' === value) return;

            // Convert to dot notation because it's easier...
            const dotNotatedKey = key.replace(/\[/g, '.').replace(/]/g, '');

            insertDotNotatedValueIntoData(dotNotatedKey, value, data);
        }
    });

    return data;
}

/**
 * Wraps a URL to manage search parameters with common map functions.
 */
export class UrlUtils extends URL {
    has(key: string) {
        const data = this.getData();

        return Object.keys(data).includes(key);
    }

    set(key: string, value: any) {
        const data = this.getData();

        data[key] = value;

        this.setData(data);
    }

    get(key: string): any | undefined {
        return this.getData()[key];
    }

    remove(key: string) {
        const data = this.getData();

        delete data[key];

        this.setData(data);
    }

    private getData() {
        if (!this.search) {
            return {};
        }

        return fromQueryString(this.search);
    }

    private setData(data: any) {
        this.search = toQueryString(data);
    }
}

export class HistoryStrategy {
    static replace(url: URL) {
        history.replaceState(history.state, '', url);
    }

    static push(url: URL) {
        history.pushState(history.state, '', url);
    }
}
