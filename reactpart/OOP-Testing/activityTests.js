// activityTests.js
// OOP Testing Module for Travel Manager App

// Base Activity class
class Activity {
    constructor(title, date, time, location) {
      this.title = title;
      this.date = date;
      this.time = time;
      this.location = location;
    }
  
    isValid() {
      return this.title && this.date && this.time && this.location;
    }
  
    getSummary() {
      return `${this.title} at ${this.location} on ${this.date}`;
    }
  }
  
  // TransportActivity class
  class TransportActivity extends Activity {
    constructor(title, date, time, from, to) {
      super(title, date, time, `${from} to ${to}`);
      this.from = from;
      this.to = to;
    }
  
    getRoute() {
      return `${this.from} → ${this.to}`;
    }
  }
  
  // ExpenseActivity class
  class ExpenseActivity extends Activity {
    constructor(title, date, time, location, price, category) {
      super(title, date, time, location);
      this.price = price;
      this.category = category;
    }
  
    getExpenseInfo() {
      return `${this.price} EUR spent on ${this.category}`;
    }
  }
  
  // Validator class
  class ActivityValidator {
    static isActivityWellFormed(activity) {
      return activity instanceof Activity && activity.isValid();
    }
  
    static hasValidPrice(expense) {
      return expense.price !== null && !isNaN(expense.price);
    }
  }
  
  // Test Suite
  class ActivityTestSuite {
    static run() {
      console.log("\n✅ Running OOP Activity Tests...\n");
  
      const basic = new Activity("Louvre Visit", "2024-05-03", "14:00", "Paris");
      console.assert(basic.isValid(), "❌ Basic activity should be valid");
      console.log("🧪 Basic Activity Summary:", basic.getSummary());
  
      const transport = new TransportActivity("Train to Berlin", "2024-06-10", "09:00", "Munich", "Berlin");
      console.assert(transport.isValid(), "❌ Transport activity should be valid");
      console.log("🧪 Transport Route:", transport.getRoute());
  
      const expense = new ExpenseActivity("Dinner", "2024-05-05", "19:00", "Rome", 25.50, "Food");
      console.assert(expense.isValid(), "❌ Expense activity should be valid");
      console.assert(ActivityValidator.hasValidPrice(expense), "❌ Expense should have valid price");
      console.log("🧪 Expense Info:", expense.getExpenseInfo());
  
      const broken = new ExpenseActivity("", "", "", "", null, "");
      console.assert(!broken.isValid(), "✅ Broken activity correctly flagged as invalid");
  
      console.log("\n✅ All tests executed. Check assertions above.\n");
    }
  }
  
  // Run the tests
  ActivityTestSuite.run();
  