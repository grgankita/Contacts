export default class Contact {
  constructor(
    name,
    phone,
    email,
    address,
    id = null,
    dateAdded = new Date(),
    lastActivity = new Date()
  ) {
    this.name = name;
    this.phone = phone;
    this.email = email;
    this.address = address;
    this.id = id; // Firestore ID
    this.dateAdded = dateAdded;
    this.lastActivity = lastActivity;
  }

  // ... other methods like toObject() ...
  toObject() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      email: this.email,
      address: this.address,
      dateAdded: this.dateAdded ? this.dateAdded.toISOString() : null, // Convert to string for JSON
      lastActivity: this.lastActivity ? this.lastActivity.toISOString() : null,
    };
  }
}
