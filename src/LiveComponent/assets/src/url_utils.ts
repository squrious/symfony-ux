class AdvancedURLSearchParams extends URLSearchParams {
    set(name: string, value: any) {
        if (typeof value !== 'object') {
            super.set(name, value);
        } else {
            this.delete(name);
            if (Array.isArray(value)) {
                value.forEach((v) => {
                    this.append(`${name}[]`, v);
                });
            } else {
                Object.entries(value).forEach(([index, v]) => {
                    this.append(`${name}[${index}]`, v as string);
                });
            }
        }
    }

    delete(name: string) {
        super.delete(name);
        const pattern = new RegExp(`^${name}(\\[.*])?$`);
        for (const key of Array.from(this.keys())) {
            if (key.match(pattern)) {
                super.delete(key);
            }
        }
    }
}

export function setQueryParam(param: string, value: any) {
    const queryParams = new AdvancedURLSearchParams(window.location.search);

    queryParams.set(param, value);

    const url = urlFromQueryParams(queryParams);

    history.replaceState(history.state, '', url);
}

export function removeQueryParam(param: string) {
    const queryParams = new AdvancedURLSearchParams(window.location.search);

    queryParams.delete(param);

    const url = urlFromQueryParams(queryParams);

    history.replaceState(history.state, '', url);
}

function urlFromQueryParams(queryParams: URLSearchParams) {
    let queryString = '';
    if (Array.from(queryParams.entries()).length > 0) {
        queryString += '?' + queryParams.toString();
    }

    return window.location.origin + window.location.pathname + queryString + window.location.hash;
}
