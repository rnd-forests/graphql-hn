import { Operation } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { ClientStateConfig } from 'apollo-link-state';
import { ErrorLink } from 'apollo-link-error';
import { CacheResolverMap } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-client';
import { DefaultOptions } from 'apollo-client/ApolloClient';
export interface ClientConfig {
    request?: (operation: Operation) => Promise<void>;
    uri?: string;
    fetchOptions?: HttpLink.Options;
    clientState?: ClientStateConfig;
    onError?: ErrorLink.ErrorHandler;
    cacheRedirects?: CacheResolverMap;
    defaultOptions?: DefaultOptions;
    devTools?: boolean;
}
export default class Client<TCache> extends ApolloClient<TCache> {
    constructor(config: ClientConfig);
}
