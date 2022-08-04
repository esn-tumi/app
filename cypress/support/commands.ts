/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

Cypress.Commands.add(
  'loginByAuth0Api',
  (username: string, password: string) => {
    const args = { username, password };
    // cy.session(
    //   args,
    //   () => {
    cy.visit('/');
    cy.get('button').contains('Log in').click();
    cy.origin(
      'https://tumi.eu.auth0.com',
      { args },
      ({ username, password }) => {
        //   cy.visit('/u/login');
        cy.contains('Email').find('input').type(username);
        cy.contains('Continue').click();
        //   cy.contains('Password').find('input').type(password);
        //   cy.get('button').contains('Login').click();
      }
    );
    // cy.url().should('contain', '/home');
    // },
    // {
    // validate() {
    //   cy.request('/api/user').its('status').should('eq', 200);
    // },
    //   }
    // );
  }
);
