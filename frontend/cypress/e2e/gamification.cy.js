// cypress/e2e/gamification.cy.js
describe("Gamification System", () => {
  beforeEach(() => {
    cy.login("test@example.com", "Password123");
  });

  it("should award XP for joining a class", () => {
    // Navigate to discover page
    cy.visit("/discover");

    // Find and click a class
    cy.contains("CS166").click();

    // Click join button
    cy.contains("Join Class").click();

    // Should see XP notification
    cy.contains("+20 XP").should("be.visible");

    // XP bar should update
    cy.get('[data-testid="xp-bar"]').should("contain", "20");
  });

  it("should award XP for logging study session", () => {
    // Navigate to a class
    cy.visit("/classes/some-class-id");

    // Click study feed tab
    cy.contains("Study Feed").click();

    // Click log session button
    cy.contains("Log Study Session").click();

    // Fill out form
    cy.get('input[name="duration"]').type("60");
    cy.get('input[name="topic"]').type("React Hooks");
    cy.get('textarea[name="whatILearned"]').type("useState and useEffect");
    cy.get('select[name="difficulty"]').select("medium");

    // Submit
    cy.contains("Log Session").click();

    // Should see XP notification
    cy.contains("+25 XP", { timeout: 5000 }).should("be.visible");
  });

  it("should show level-up modal when leveling up", () => {
    // Note: This would require setting up test data with user close to level-up

    // Perform action that triggers level-up
    cy.visit("/discover");
    cy.contains("CS166").click();
    cy.contains("Join Class").click();

    // Should see level-up modal
    cy.contains("Level Up!").should("be.visible");
    cy.contains("Level").should("be.visible");

    // Close modal
    cy.contains("Continue").click();

    // Modal should disappear
    cy.contains("Level Up!").should("not.exist");
  });

  it("should display leaderboard correctly", () => {
    cy.visit("/leaderboard");

    // Should show leaderboard title
    cy.contains("Leaderboard").should("be.visible");

    // Should show user's rank
    cy.contains("Your Rank").should("be.visible");

    // Should show at least one user
    cy.get('[data-testid="leaderboard-entry"]').should(
      "have.length.at.least",
      1
    );

    // Top user should have medal icon
    cy.get('[data-testid="leaderboard-entry"]')
      .first()
      .find("svg")
      .should("exist");
  });

  it("should show achievement toast when unlocking achievement", () => {
    // This test assumes user is close to unlocking an achievement
    // Perform actions to unlock achievement

    // Should see achievement toast
    cy.contains("Achievement Unlocked", { timeout: 10000 }).should(
      "be.visible"
    );
    cy.contains("XP").should("be.visible");

    // Toast should auto-dismiss
    cy.wait(5000);
    cy.contains("Achievement Unlocked").should("not.exist");
  });
});
