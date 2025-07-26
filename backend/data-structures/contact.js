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
    this.id = id;

    // Convert Firestore Timestamp to JavaScript Date
    if (dateAdded && typeof dateAdded.toDate === "function") {
      this.dateAdded = dateAdded.toDate();
    } else if (dateAdded instanceof Date) {
      this.dateAdded = dateAdded;
    } else if (typeof dateAdded === "string") {
      this.dateAdded = new Date(dateAdded);
    } else {
      this.dateAdded = new Date();
    }

    if (lastActivity && typeof lastActivity.toDate === "function") {
      this.lastActivity = lastActivity.toDate();
    } else if (lastActivity instanceof Date) {
      this.lastActivity = lastActivity;
    } else if (typeof lastActivity === "string") {
      this.lastActivity = new Date(lastActivity);
    } else {
      this.lastActivity = new Date();
    }
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      email: this.email,
      address: this.address,
      addedDate: this.dateAdded ? this.dateAdded.toISOString() : null,
      lastActivity: this.lastActivity ? this.lastActivity.toISOString() : null,
    };
  }
}
