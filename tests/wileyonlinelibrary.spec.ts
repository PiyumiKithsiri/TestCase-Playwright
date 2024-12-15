import { test, expect } from "@playwright/test";

// Setup before each test
test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
  });
  // Navigate to the page with increased timeout
  await page.goto("https://onlinelibrary.wiley.com/", {
    waitUntil: "networkidle",
    timeout: 120000,
  });
});

// Test subject section accordion functionalities
test("Test subject section accordion expand and content visibility", async ({
  page,
}) => {
  // Wait for the button and click
  await page.waitForSelector('text=Agriculture, Aquaculture &');
  await page
    .getByRole("button", { name: "Agriculture, Aquaculture &" })
    .click();

  // Assert visibility
  await expect(page.getByLabel("Agriculture, Aquaculture &")).toBeVisible();
});

// Search functionality test
test("Search functionality on Wiley Online Library", async ({ page }) => {
    // Step 1: Perform a search
    const searchTerm = "Artificial Intelligence";
    await page.waitForSelector('input[type="search"]'); // Wait for the search input field
    await page.fill('input[type="search"]', searchTerm); // Fill the search input field
    await page.press('input[type="search"]', 'Enter'); // Press 'Enter' to initiate search
  
    // Step 2: Wait for search results container to be visible
    await page.waitForSelector("//div[@class='search__result search__result--space']", {
      timeout: 60000, // Increased timeout
    });
  
    // Step 3: Verify that search results contain the search term
    const firstResult = await page.locator("//div[@class='search__result search__result--space']").first();
    const resultText = await firstResult.textContent();
    expect(resultText).toContain(searchTerm);
  
    // Step 4: Click the first search result
    await firstResult.click();
  
    // Step 5: Verify that the article or page loaded correctly
    const articleTitle = page.locator("h1.wiley-content-title"); // Locator for article titles
    await expect(articleTitle).toBeVisible({ timeout: 60000 });
  
    console.log("Search functionality test completed successfully!");
  });

// Tests for Login Modal open/close
test.describe("Test Login Modal open/close", () => {
  test("Test login modal open", async ({ page }) => {
    // Wait for the login button and click
    await page.waitForSelector('text=Log in or Register');
    await page.getByLabel("Log in or Register").click();

    // Assert login modal content
    await page.waitForSelector("#loginPopupHead");
    await expect(page.locator("#loginPopupHead")).toContainText(
      "Log in to Wiley Online Library"
    );
    await expect(
      page.getByLabel("Log in to Wiley Online Library").locator("form")
    ).toContainText("Email or Customer ID");

    // Assert visibility of form fields
    await expect(page.getByText("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Email or Customer ID")).toBeVisible();
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible();

    // Assert login button is disabled
    const loginButton = page.getByRole("button", { name: "Log In" });
    await expect(loginButton).toBeDisabled();
  });

  test("Test login modal close", async ({ page }) => {
    // Open login modal
    await page.waitForSelector('text=Log in or Register');
    await page.getByLabel("Log in or Register").click();

    // Ensure login modal is visible
    await page.waitForSelector("#loginPopupHead");
    await expect(page.locator("#loginPopupHead")).toBeVisible();

    // Click 'Cancel Login' button
    await page.waitForSelector('text=Cancel Login');
    await page.getByLabel("Cancel Login").click();

    // Ensure login modal is hidden
    await expect(page.locator("#loginPopupHead")).toBeHidden();
  });
});

// Tests for Login functionality
test.describe("Test Login functionality", () => {
  test("Login with valid credentials", async ({ page }) => {
    // Open login modal
    await page.waitForSelector('text=Log in or Register');
    await page.getByLabel("Log in or Register").click();

    // Enter valid email
    await page.waitForSelector('text=Email or Customer ID');
    await page.getByLabel("Email or Customer ID").fill("nimnadinw@gmail.com");

    // Enter valid password
    await page.getByPlaceholder("Enter your password").fill("12345Wiley@");

    // Submit login
    await page.getByRole("button", { name: "Log In" }).click();
    await page.waitForLoadState("networkidle");

    // Assert successful login
    await expect(page.getByText("nimasha")).toBeVisible();
  });

  test("Login with invalid password", async ({ page }) => {
    // Open login modal
    await page.waitForSelector('text=Log in or Register');
    await page.getByLabel("Log in or Register").click();

    // Enter valid email
    await page.waitForSelector('text=Email or Customer ID');
    await page.getByLabel("Email or Customer ID").fill("nimnadinw@gmail.com");

    // Enter invalid password
    await page.getByPlaceholder("Enter your password").fill("InvalidPassword");

    // Submit login
    await page.getByRole("button", { name: "Log In" }).click();
    await page.waitForLoadState("networkidle");

    // Assert error message
    await expect(
      page.getByText("Your email or password is incorrect. Please try again.")
    ).toBeVisible();
  });
});
