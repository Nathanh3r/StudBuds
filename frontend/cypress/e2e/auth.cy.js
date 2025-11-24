// cypress/e2e/auth.cy.js
describe("Authentication Flow", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should register a new user successfully", () => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;

    cy.register("Test User", email, "Password123", "Computer Science");

    // Should redirect to dashboard
    cy.url().should("include", "/dashboard");

    // Should show user name
    cy.contains("Test User").should("be.visible");
  });

  it("should login existing user", () => {
    cy.login("existing@example.com", "Password123");

    cy.url().should("include", "/dashboard");
    cy.contains("Good").should("be.visible"); // Greeting
  });

  it("should show error for wrong password", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type("existing@example.com");
    cy.get('input[name="password"]').type("WrongPassword");
    cy.get('button[type="submit"]').click();

    cy.contains("Invalid credentials").should("be.visible");
  });

  it("should logout successfully", () => {
    cy.login("existing@example.com", "Password123");

    // Click logout button
    cy.get('[data-testid="logout-button"]').click();

    // Should redirect to login
    cy.url().should("include", "/login");
  });
});
