// cypress/support/commands.js
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/login");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("include", "/dashboard");
});

Cypress.Commands.add("register", (name, email, password, major) => {
  cy.visit("/signup");
  cy.get('input[name="name"]').type(name);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('input[name="major"]').type(major);
  cy.get('button[type="submit"]').click();
  cy.url().should("include", "/dashboard");
});
