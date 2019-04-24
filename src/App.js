import React from 'react';
import logo from './logo.svg';
import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import ActionCable from 'actioncable';
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink';
import gql from "graphql-tag";
import './App.css';

const cable = ActionCable.createConsumer('http://localhost:3000/subscriptions')


const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql'
});

const hasSubscriptionOperation = ({ query: { definitions } }) => {
  return definitions.some(
    ({ kind, operation }) => kind === 'OperationDefinition' && operation === 'subscription'
  )
}

const link = ApolloLink.split(
  hasSubscriptionOperation,
  new ActionCableLink({cable}),
  httpLink
);

const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache()
});

let o = client
  .subscribe({
    query: gql`
      subscription {
        deliveryCreated {
          id
        }
      }
    `
  });

o.subscribe({
  next(data) {
    console.log('data! --- ', data)
  },
  error(value) {
    console.log('erro! --- ', value)
  }
});


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
