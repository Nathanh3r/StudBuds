// cypress/e2e/userJourney.cy.js
describe("Complete User Journey", () => {
  it("should complete full user flow from signup to earning XP", () => {
    const timestamp = Date.now();
    const email = `journey${timestamp}@example.com`;

    // 1. Register
    cy.register("Journey User", email, "Password123", "Computer Science");
    cy.url().should("include", "/dashboard");

    // 2. View XP bar (should be level 1, 0 XP)
    cy.get('[data-testid="xp-bar"]').should("contain", "Level 1");

    // 3. Discover and join a class
    cy.visit("/discover");
    cy.get('[data-testid="class-card"]').first().click();
    cy.contains("Join Class").click();
    cy.contains("+20 XP").should("be.visible");

    // 4. Navigate to class and log study session
    cy.contains("Study Feed").click();
    cy.contains("Log Study Session").click();
    cy.get('input[name="duration"]').type("45");
    cy.get('input[name="topic"]').type("Introduction");
    cy.get('textarea[name="whatILearned"]').type("Basic concepts");
    cy.contains("button", "Log Session").click();
    cy.contains("+25 XP").should("be.visible");

    // 5. Upload a note
    cy.contains("Notes").click();
    cy.contains("Upload Note").click();
    cy.get('input[name="title"]').type("My First Note");
    cy.get('textarea[name="description"]').type("Test description");
    cy.get('input[type="file"]').selectFile("cypress/fixtures/test-note.pdf");
    cy.contains("button", "Upload").click();
    cy.contains("+15 XP").should("be.visible");

    // 6. Check leaderboard
    cy.visit("/leaderboard");
    cy.contains("Journey User").should("be.visible");

    // 7. Verify total XP (20 + 25 + 15 = 60)
    cy.get('[data-testid="xp-bar"]').should("contain", "60");
  });
});
